const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 명령행 인수 처리
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('사용법: node scripts/auto_ruby_generator.cjs <utaten_url> <json_파일명>');
  console.log('예시: node scripts/auto_ruby_generator.cjs https://utaten.com/lyric/mi19090903/ saikai.json');
  process.exit(1);
}

const utatenUrl = args[0];
const fileName = args[1];

// URL 유효성 검사
if (!utatenUrl.includes('utaten.com')) {
  console.log('❌ 올바른 utaten.com URL을 입력해주세요.');
  process.exit(1);
}

// 파일 경로 설정
const filePath = fileName.includes('.json') ? 
  path.resolve('songs', fileName) : 
  path.resolve('songs', `${fileName}.json`);

console.log('🎵 자동 Ruby Data 생성기 시작');
console.log(`🔗 Utaten URL: ${utatenUrl}`);
console.log(`📂 대상 파일: ${filePath}`);

// 1. Utaten에서 HTML 데이터 추출
async function extractUtatenData(url) {
    console.log('\n🔍 1단계: Utaten에서 HTML 데이터 추출 중...');
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    try {
        console.log(`   📡 URL 접속 중: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2' });
        
        // 여러 가능한 셀렉터 시도
        const selectors = [
            '.hiragana',
            '.kashi .hiragana',
            '.kashi-area .hiragana',
            '.lyric .hiragana',
            '.lyric-area .hiragana',
            '[class*="hiragana"]'
        ];
        
        let htmlContent = null;
        let usedSelector = null;
        
        for (const selector of selectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    htmlContent = await page.evaluate((sel) => {
                        const elem = document.querySelector(sel);
                        return elem ? elem.innerHTML : null;
                    }, selector);
                    
                    if (htmlContent && htmlContent.trim().length > 0) {
                        usedSelector = selector;
                        break;
                    }
                }
            } catch (error) {
                console.log(`   ⚠️  셀렉터 ${selector} 실패:`, error.message);
            }
        }
        
        if (!htmlContent) {
            // 페이지 전체에서 ruby 태그 찾기
            const rubyTags = await page.evaluate(() => {
                const rubyElements = document.querySelectorAll('.ruby, ruby');
                return rubyElements.length;
            });
            
            if (rubyTags > 0) {
                htmlContent = await page.evaluate(() => {
                    const container = document.querySelector('.kashi, .lyric, .lyric-area, .kashi-area') || document.body;
                    return container.innerHTML;
                });
                usedSelector = 'fallback: full container';
            }
        }
        
        if (htmlContent) {
            const rubyCount = (htmlContent.match(/<span class="ruby">/g) || []).length;
            console.log(`   ✅ 데이터 추출 성공!`);
            console.log(`   🎯 사용된 셀렉터: ${usedSelector}`);
            console.log(`   📊 루비 태그 개수: ${rubyCount}개`);
            
            return htmlContent;
        } else {
            throw new Error('페이지에서 히라가나 가사를 찾을 수 없습니다.');
        }
        
    } catch (error) {
        throw new Error(`데이터 추출 실패: ${error.message}`);
    } finally {
        await browser.close();
    }
}

// 2. utaten HTML에서 정확한 한자-히라가나 매핑 추출
function parseUtatenHTML(htmlData) {
  console.log('\n🧠 2단계: HTML 데이터 파싱 중...');
  
  const kanjiToReading = new Map();
  
  // 루비 태그 패턴 매칭
  const rubyPattern = /<span class="ruby"><span class="rb">([^<]+)<\/span><span class="rt">([^<]+)<\/span><\/span>/g;
  let match;
  
  while ((match = rubyPattern.exec(htmlData)) !== null) {
    const kanjiText = match[1];
    const reading = match[2];
    
    // 한자 길이에 따라 처리
    if (kanjiText.length === 1) {
      // 단일 한자
      kanjiToReading.set(kanjiText, reading);
    } else {
      // 복합 한자 - 전체 매핑만 저장 (잘못된 개별 분할 방지)
      kanjiToReading.set(kanjiText, reading);
    }
  }
  
  console.log(`   📊 ${kanjiToReading.size}개 한자 매핑 발견`);
  
  // 매핑 샘플 출력
  const samples = Array.from(kanjiToReading.entries()).slice(0, 15);
  console.log('   🔍 매핑 샘플:');
  samples.forEach(([kanji, reading]) => {
    console.log(`      ${kanji} → ${reading}`);
  });
  
  return kanjiToReading;
}

// 반복 기호가 포함된 한자를 확장하는 함수
function expandRepeatedKanji(text) {
  return text.replace(/([一-龯])々/g, '$1$1');
}

// 3. 지능형 루비 생성 함수 (컨텍스트 기반 + 반복 기호 개선)
function generateIntelligentRuby(text, kanjiToReading) {
  let result = '';
  let i = 0;
  
  while (i < text.length) {
    let matched = false;
    
    // 가장 긴 한자 시퀀스부터 검사 (최대 8글자)
    for (let len = Math.min(8, text.length - i); len >= 1; len--) {
      const substring = text.substring(i, i + len);
      
      // 한자 시퀀스인지 확인 (반복 기호 포함)
      if (!/^[一-龯々]+$/.test(substring)) continue;
      
      // 반복 기호가 포함된 경우 처리
      let processedSubstring = substring;
      let expandedSubstring = substring;
      if (substring.includes('々')) {
        expandedSubstring = expandRepeatedKanji(substring);
        // 확장된 버전으로 매핑 확인
        if (kanjiToReading.has(expandedSubstring)) {
          const reading = kanjiToReading.get(expandedSubstring);
          result += `<span class="ruby"><span class="rb">${substring}</span><span class="rt">${reading}</span></span>`;
          i += len;
          matched = true;
          break;
        }
      }
      
      // 컨텍스트 기반 우선순위 매핑 확인
      const contextualReading = getContextualReading(text, i, processedSubstring, kanjiToReading);
      if (contextualReading) {
        result += `<span class="ruby"><span class="rb">${substring}</span><span class="rt">${contextualReading}</span></span>`;
        i += len;
        matched = true;
        break;
      }
      
      // 정확한 매핑이 있는지 확인
      if (kanjiToReading.has(processedSubstring)) {
        const reading = kanjiToReading.get(processedSubstring);
        result += `<span class="ruby"><span class="rb">${substring}</span><span class="rt">${reading}</span></span>`;
        i += len;
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      result += text[i];
      i++;
    }
  }
  
  return result;
}

// 컨텍스트 기반 읽기 결정 함수
function getContextualReading(text, pos, kanji, kanjiToReading) {
  // 특별한 컨텍스트 기반 규칙들
  
  // 冷 한자의 경우
  if (kanji === '冷') {
    // 다음 글자를 확인
    const nextChar = text[pos + 1];
    if (nextChar === 'め') {
      // 冷めた, 冷める 등의 경우
      return 'さ';
    } else if (nextChar === 'た') {
      // 冷たい의 경우
      return 'つめ';
    }
  }
  
  // 方 한자의 경우
  if (kanji === '方') {
    // 앞 글자를 확인 (의 + 方 = 의 방향, 쪽)
    const prevChar = text[pos - 1];
    const prevTwoChars = text.substring(pos - 2, pos);
    
    if (prevChar === 'の' || prevTwoChars === 'この' || prevTwoChars === 'その' || prevTwoChars === 'あの') {
      // 君の方, この方, その方, あの方 등의 경우
      if (prevTwoChars === 'あの') {
        // あの方 -> あのかた (그분)
        return 'かた';
      } else {
        // 君の方, この方, その方 -> ほう (쪽, 방향)
        return 'ほう';
      }
    }
    
    // 다음 글자를 확인
    const nextChar = text[pos + 1];
    if (nextChar === '法' || nextChar === '向' || nextChar === '面') {
      // 方法, 方向, 方面 등의 경우
      return 'ほう';
    }
  }
  
  // 다른 컨텍스트 규칙들을 여기에 추가 가능
  
  return null; // 특별한 컨텍스트 규칙이 없는 경우
}

// 4. 매칭 알고리즘 (songView.ejs와 동일)
function findSentenceInHtmlWithFuriganaEnhancedV5(htmlStr, sentence) {
  if (!htmlStr || !sentence) {
    return null;
  }

  // --- 1단계: plainText 및 mappings 생성 ---
  let plainText = "";
  const mappings = [];
  let currentPlainIndex = 0;
  let i = 0;
  let tagBuffer = "";
  let isInsideTag = false;
  let rubyInfo = null;

  while (i < htmlStr.length) {
    const char = htmlStr[i];

    if (char === '<') {
      isInsideTag = true;
      tagBuffer = "<";
      i++;
      continue;
    }

    if (isInsideTag) {
      tagBuffer += char;
      if (char === '>') {
        isInsideTag = false;
        const tagHtml = tagBuffer;
        const tagStartIndex = i - tagHtml.length + 1;

        if (tagHtml.toLowerCase().startsWith('<span class="ruby"')) {
           rubyInfo = { startIndex: tagStartIndex, baseText: "", baseTextMappings: [] };
        }
        else if (rubyInfo && tagHtml.toLowerCase().startsWith('<span class="rb">')) {
          let rbEndIndex = htmlStr.indexOf('</span>', i + 1);
          if (rbEndIndex !== -1) {
              rubyInfo.baseText = htmlStr.substring(i + 1, rbEndIndex);
              i = rbEndIndex + '</span>'.length -1;
              tagBuffer = htmlStr.substring(tagStartIndex, i + 1);
          } else {
              rubyInfo = null;
          }
        }
        else if (rubyInfo && tagHtml.toLowerCase().startsWith('<span class="rt">')) {
             let rtEndIndex = htmlStr.indexOf('</span>', i + 1);
             if (rtEndIndex !== -1) {
                 i = rtEndIndex + '</span>'.length - 1;
                 tagBuffer = htmlStr.substring(tagStartIndex, i + 1);
             } else {
                  rubyInfo = null;
             }
        }
        else if (rubyInfo && tagHtml.toLowerCase() === '</span>') {
            if (rubyInfo.baseText !== null && rubyInfo.baseText !== undefined) {
                const rubyEndIndex = i + 1;
                const rubyHtmlLength = rubyEndIndex - rubyInfo.startIndex;
                for (let k = 0; k < rubyInfo.baseText.length; k++) {
                    const baseChar = rubyInfo.baseText[k];
                    plainText += baseChar;
                    mappings.push({
                        plainIndex: currentPlainIndex,
                        htmlStart: rubyInfo.startIndex,
                        htmlEnd: rubyEndIndex,
                        sourceHtmlLength: rubyHtmlLength,
                        type: 'ruby',
                        debugChar: baseChar,
                        isWhitespace: /\s/.test(baseChar)
                    });
                    currentPlainIndex++;
                }
                rubyInfo = null;
            } else {
                 rubyInfo = null;
            }
        }
        else if (tagHtml.toLowerCase().startsWith('<br')) {
            const isWhitespaceChar = true;
            plainText += ' ';
            mappings.push({
                plainIndex: currentPlainIndex,
                htmlStart: tagStartIndex,
                htmlEnd: i + 1,
                sourceHtmlLength: tagHtml.length,
                type: 'whitespace',
                debugChar: ' ',
                isWhitespace: isWhitespaceChar
            });
            currentPlainIndex++;
        }

        tagBuffer = "";
        i++;
        continue;
      }
      i++;
      continue;
    }

    if (!isInsideTag && !rubyInfo) {
        const textChar = char;
        const textStartIndex = i;
        const textEndIndex = i + 1;
        const isWhitespaceChar = /\s/.test(textChar);

        plainText += textChar;
        mappings.push({
            plainIndex: currentPlainIndex,
            htmlStart: textStartIndex,
            htmlEnd: textEndIndex,
            sourceHtmlLength: 1,
            type: isWhitespaceChar ? 'whitespace' : 'text',
            debugChar: textChar,
            isWhitespace: isWhitespaceChar
        });
        currentPlainIndex++;
        i++;
    } else {
        i++;
    }
  }

  // --- 2단계: 정규화 및 검색 ---
  const normalizeText = (text) => text.replace(/\s+/g, '');

  const normalizedPlainText = normalizeText(plainText);
  const normalizedSentence = normalizeText(sentence);

  const normalizedStartIndex = normalizedPlainText.indexOf(normalizedSentence);

  if (normalizedStartIndex === -1) {
    return null;
  }
  const normalizedEndIndex = normalizedStartIndex + normalizedSentence.length;

  // --- 3단계: 정규화된 인덱스를 원본 plainText 인덱스로 역매핑 ---
  let originalPlainStartIndex = -1;
  let originalPlainEndIndexInclusive = -1;
  let nonWhitespaceCount = 0;
  let foundStart = false;

  for(let k = 0; k < mappings.length; k++) {
      if (!mappings[k].isWhitespace) {
          if (nonWhitespaceCount === normalizedStartIndex && !foundStart) {
              originalPlainStartIndex = mappings[k].plainIndex;
              foundStart = true;
          }
          if (foundStart && nonWhitespaceCount === normalizedEndIndex - 1) {
              originalPlainEndIndexInclusive = mappings[k].plainIndex;
              break;
          }
          nonWhitespaceCount++;
      }
  }

  if (originalPlainStartIndex === -1 || originalPlainEndIndexInclusive === -1) {
      return null;
  }

  // --- 4단계: 원본 plainText 인덱스를 HTML 인덱스로 변환 ---
   const startMapping = mappings[originalPlainStartIndex];
   const endMapping = mappings[originalPlainEndIndexInclusive];

   if (!startMapping || !endMapping) {
       return null;
   }

   const finalStartIndex = startMapping.htmlStart;
   const finalEndIndex = endMapping.htmlEnd;

   if (finalStartIndex === undefined || finalEndIndex === undefined || finalStartIndex >= finalEndIndex) {
        return null;
   }

  return { start: finalStartIndex, end: finalEndIndex };
}

// 메인 처리 함수
async function main() {
  try {
    // 1. Utaten에서 HTML 데이터 추출
    const utatenHtmlData = await extractUtatenData(utatenUrl);
    
    // 2. HTML 데이터 파싱하여 한자-히라가나 매핑 생성
    const kanjiToReading = parseUtatenHTML(utatenHtmlData);
    
    // 3. JSON 파일 읽기
    console.log('\n📖 3단계: JSON 파일 읽기 중...');
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`파일을 찾을 수 없습니다: ${filePath}`);
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`   ✅ ${data.translatedLines.length}개 라인 로드됨`);
    console.log(`   🎵 곡명: ${data.name}`);
    
    // 4. 지능형 루비 데이터 생성
    console.log('\n🎯 4단계: 지능형 루비 데이터 생성 중...');
    const rubyHtml = [];
    
    data.translatedLines.forEach((line, lineIndex) => {
      if (line.LI && line.LI.length > 0) {
        const lineText = line.T0;
        console.log(`   처리 중 (${lineIndex + 1}/${data.translatedLines.length}): "${lineText}"`);
        
        let lineRubyHtml = generateIntelligentRuby(lineText, kanjiToReading);
        rubyHtml.push(lineRubyHtml);
      }
    });
    
    const rubyData = rubyHtml.join('<br>');
    
    // 5. JSON 파일 업데이트
    console.log('\n💾 5단계: JSON 파일 업데이트 중...');
    data.rubyData = rubyData;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`   ✅ 파일 저장 완료: ${filePath}`);
    
    // 6. 매칭 알고리즘 검증
    console.log('\n🔍 6단계: 매칭 알고리즘 검증 중...');
    console.log('   📝 T0 (전체 문장) 매칭 검증...');
    
    const rubyLines = rubyData.split('<br>');
    let t0SuccessCount = 0;
    let t0FailCount = 0;
    
    data.translatedLines.forEach((line, index) => {
      if (line.T0 && index < rubyLines.length) {
        const htmlRuby = rubyLines[index];
        const matchResult = findSentenceInHtmlWithFuriganaEnhancedV5(htmlRuby, line.T0);
        
        if (matchResult && matchResult.start !== undefined && matchResult.end !== undefined) {
          t0SuccessCount++;
        } else {
          t0FailCount++;
          console.log(`   ❌ T0 매칭 실패: "${line.T0}"`);
        }
      }
    });

    console.log('   🔤 T1 (개별 단어) 매칭 검증...');
    
    let t1SuccessCount = 0;
    let t1FailCount = 0;
    
    data.translatedLines.forEach((line, lineIndex) => {
      if (line.LI && line.LI.length > 0 && lineIndex < rubyLines.length) {
        const htmlRuby = rubyLines[lineIndex];
        
        line.LI.forEach(li => {
          if (li.T1) {
            const matchResult = findSentenceInHtmlWithFuriganaEnhancedV5(htmlRuby, li.T1);
            if (matchResult && matchResult.start !== undefined && matchResult.end !== undefined) {
              t1SuccessCount++;
            } else {
              t1FailCount++;
            }
          }
        });
      }
    });

    // 7. 한자 커버리지 분석 (올바른 로직)
    console.log('\n📊 7단계: 한자 커버리지 분석...');
    const processedKanji = new Set();
    const unprocessedKanji = new Set();
    
    // 전체 원본 텍스트에서 모든 한자 추출
    const fullText = data.translatedLines.map(line => line.T0).join('');
    const allKanjiInText = new Set();
    for (const char of fullText) {
      if (/[一-龯]/.test(char)) {
        allKanjiInText.add(char);
      }
    }
    
    // rubyData에서 오직 루비 태그 안에 있는 한자만 "처리됨"으로 간주
    const processedMatches = rubyData.match(/<span class="ruby"><span class="rb">([^<]+)<\/span>/g);
    if (processedMatches) {
      processedMatches.forEach(match => {
        const kanjiText = match.match(/<span class="rb">([^<]+)<\/span>/)[1];
        for (const char of kanjiText) {
          if (/[一-龯]/.test(char)) {
            processedKanji.add(char);
          }
        }
      });
    }
    
    // 미처리 한자는 전체 텍스트에는 있지만 루비 태그에는 없는 한자들
    for (const char of allKanjiInText) {
      if (!processedKanji.has(char)) {
        unprocessedKanji.add(char);
      }
    }
    
    console.log(`   ✅ 처리된 한자: ${Array.from(processedKanji).join('')} (${processedKanji.size}개)`);
    console.log(`   ❌ 미처리 한자: ${Array.from(unprocessedKanji).join('')} (${unprocessedKanji.size}개)`);
    
    const totalKanji = processedKanji.size + unprocessedKanji.size;
    const coverageRate = totalKanji > 0 ? ((processedKanji.size / totalKanji) * 100).toFixed(1) : '100.0';
    console.log(`   📈 한자 커버리지: ${coverageRate}%`);

    // 8. 결과 리포팅
    console.log('\n🎯 8단계: 결과 리포팅');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 T0 (전체 문장) 매칭 결과:');
    console.log(`   ✅ 성공: ${t0SuccessCount}개`);
    console.log(`   ❌ 실패: ${t0FailCount}개`);
    console.log(`   📈 성공률: ${((t0SuccessCount / (t0SuccessCount + t0FailCount)) * 100).toFixed(1)}%`);
    
    console.log('\n📊 T1 (개별 단어) 매칭 결과:');
    console.log(`   ✅ 성공: ${t1SuccessCount}개`);
    console.log(`   ❌ 실패: ${t1FailCount}개`);
    console.log(`   📈 성공률: ${((t1SuccessCount / (t1SuccessCount + t1FailCount)) * 100).toFixed(1)}%`);
    
    const totalSuccess = t0SuccessCount + t1SuccessCount;
    const totalFail = t0FailCount + t1FailCount;
    const totalSuccessRate = ((totalSuccess / (totalSuccess + totalFail)) * 100).toFixed(1);
    
    console.log('\n🏆 종합 결과:');
    console.log(`   ✅ 전체 성공: ${totalSuccess}개`);
    console.log(`   ❌ 전체 실패: ${totalFail}개`);
    console.log(`   🎯 종합 성공률: ${totalSuccessRate}%`);
    console.log(`   📊 한자 커버리지: ${coverageRate}%`);
    
    if (totalSuccessRate === '100.0' && coverageRate === '100.0') {
      console.log('\n🎉 완벽한 성공! 모든 매칭과 한자 처리가 성공했습니다!');
    } else if (totalSuccessRate === '100.0') {
      console.log('\n🎉 완벽한 매칭 성공! 모든 문장 매칭이 성공했습니다!');
      if (unprocessedKanji.size > 0) {
        console.log(`   📝 참고: ${unprocessedKanji.size}개 한자가 미처리되었습니다.`);
      }
    } else {
      console.log(`\n📈 우수한 성능으로 Ruby Data가 생성되었습니다!`);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎵 자동 Ruby Data 생성 완료!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

// 실행
main(); 