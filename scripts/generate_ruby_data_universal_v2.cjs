const fs = require('fs');
const path = require('path');

// 명령행 인수 처리
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('사용법: node scripts/generate_ruby_data_universal_v2.cjs <파일명>');
  console.log('예시: node scripts/generate_ruby_data_universal_v2.cjs Haiirotoao.json');
  process.exit(1);
}

const fileName = args[0];
const filePath = fileName.includes('.json') ? 
  path.resolve('songs', fileName) : 
  path.resolve('songs', `${fileName}.json`);

console.log('🎵 고급 Ruby Data 생성기 v2.0 시작');
console.log(`📂 대상 파일: ${filePath}`);

// 1. 기본 한자 독음 매핑 (우선순위: 낮음)
const basicKanjiReadingMap = {
  // 일반적인 한자 독음들
  '明日': 'あした', // 기본값
  '面影': 'おもかげ',
  '袖丈': 'そでたけ',
  '目覚': 'めざ',
  '静寂': 'しじま',
  '砂場': 'すなば',
  '薔薇': 'ばら',
  '憂鬱': 'ゆううつ',
  '煌': 'きら',
  '瞬': 'まばた',
  '刹那': 'せつな',
  '永遠': 'えいえん',
  '記憶': 'きおく',
  '想': 'おも',
  '恋': 'こい',
  '愛': 'あい',
  '心': 'こころ',
  '夢': 'ゆめ',
  '希望': 'きぼう',
  '絶望': 'ぜつぼう',
  '運命': 'うんめい',
  '宿命': 'しゅくめい',
  '約束': 'やくそく',
  '誓': 'ちか',
  '涙': 'なみだ',
  '微笑': 'ほほえ',
  '笑顔': 'えがお',
  '悲': 'かな',
  '哀': 'かな',
  '喜': 'よろこ',
  '怒': 'いか',
  '優': 'やさ',
  '美': 'うつく',
  '綺麗': 'きれい',
  '清': 'きよ',
  '純': 'じゅん',
  
  // Even_If_That_Is_Your_Happiness에 필요한 복합어 우선 매핑
  '消費期限': 'しょうひきげん',
  '数日後': 'すうじつご',
  '少年少女': 'しょうねんしょうじょ',
  '造り上げた': 'つくりあげた',
  '決意': 'けつい',
  '我儘': 'わがまま',
  '魔法': 'まほう',
  '感情': 'かんじょう',
  '言葉': 'ことば',
  '地点': 'ちてん',
  '今日': 'きょう',
  '文字': 'もじ',
  '場所': 'ばしょ',
  '未来': 'みらい',
  '期待': 'きたい',
  '議論': 'ぎろん',
  '素足': 'すあし',
  '少年': 'しょうねん',
  '少女': 'しょうじょ',
  '旅立': 'たびだ',
  '駆け出': 'かけだ',
  '目指': 'めざ',
  '抱える': 'かかえる',
  '締め付ける': 'しめつける',
  '優しさ': 'やさしさ',
  '幸せ': 'しあわせ',
  
  // 단일 한자 (복합어 매칭 실패 시만)
  '辛': 'つら',
  '肩': 'かた',
  '線': 'せん',
  '胸': 'むね',
  '時': 'とき',
  '先': 'さき',
  '水': 'みず',
  '静': 'しず',
  '眠': 'ねむ',
  '暗': 'くら',
  '影': 'かげ',
  '光': 'ひかり',
  '大': 'おお',
  '行': 'い',
  '止': 'と',
  '許': 'ゆる',
  '事': 'こと',
  '緩': 'ゆる',
  '落': 'お',
  '誰': 'だれ',
  '解': 'と',
  '或': 'あ',
  '笑': 'わら',
  '日': 'ひ',
  '僕': 'ぼく',
  '救': 'すく',
  '乗': 'の',
  '感': 'かん'
};

// 2. 곡별 특화 매핑 (우선순위: 중간)
function getSongSpecificMappings(songName) {
  const mappings = {
    'Haiirotoao': {
      '面影': 'おもかげ',
      '袖丈': 'そでたけ',
      '目覚': 'めざ',
      '静寂': 'しじま',
      '砂場': 'すなば',
      '薔薇': 'ばら',
      '憂鬱': 'ゆううつ',
      '煌': 'きら',
      '瞬': 'まばた',
      '刹那': 'せつな',
      '永遠': 'えいえん'
    }
  };
  
  return mappings[songName] || {};
}

// 3. 문맥 기반 매핑 (우선순위: 최고) - utaten 기반
function getContextBasedMappings(songName, contextTexts) {
  const contextMappings = {};
  
  if (songName === 'Even_If_That_Is_Your_Happiness') {
    // utaten에서 확인한 실제 독음 적용
    contextTexts.forEach((context, index) => {
      const text = context.T0;
      if (text.includes('明日')) {
        // 첫 번째 "明日" (라인 10): "あなたが抱えてる明日は 辛くはないか"
        if (text.includes('抱えてる明日は') || text.includes('あなたが抱えてる明日')) {
          contextMappings[`明日_${index}`] = 'あした';
        }
        // 두 번째 "明日" (라인 29): "あなたの明日は 辛くはないか"  
        else if (text.includes('あなたの明日は')) {
          contextMappings[`明日_${index}`] = 'あす';
        }
      }
    });
  }
  
  return contextMappings;
}

// 4. 한자 독음 결정 함수 (우선순위 적용)
function getKanjiReading(kanji, context, lineIndex, songName, contextMappings) {
  // 최고 우선순위: 문맥 기반 매핑
  const contextKey = `${kanji}_${lineIndex}`;
  if (contextMappings[contextKey]) {
    return contextMappings[contextKey];
  }
  
  // 중간 우선순위: 곡별 특화 매핑
  const songMappings = getSongSpecificMappings(songName);
  if (songMappings[kanji]) {
    return songMappings[kanji];
  }
  
  // 최저 우선순위: 기본 매핑
  if (basicKanjiReadingMap[kanji]) {
    return basicKanjiReadingMap[kanji];
  }
  
  return null;
}

// 5. 스마트 루비 데이터 생성
function generateSmartRubyData(translatedLines, songName) {
  console.log('🧠 스마트 루비 데이터 생성 중...');
  
  // 문맥 정보 추출
  const contextTexts = translatedLines.map(line => ({ T0: line.T0 }));
  const contextMappings = getContextBasedMappings(songName, contextTexts);
  
  console.log(`📊 문맥 기반 매핑 ${Object.keys(contextMappings).length}개 적용됨`);
  
  const rubyHtml = [];
  
  translatedLines.forEach((line, lineIndex) => {
    if (line.LI && line.LI.length > 0) {
      const lineText = line.T0;
      const lineRubyHtml = generateRubyForLine(lineText, lineIndex, songName, contextMappings);
      if (lineRubyHtml) {
        rubyHtml.push(lineRubyHtml);
      }
    }
  });
  
  return rubyHtml.join('<br>');
}

function generateRubyForLine(text, lineIndex, songName, contextMappings) {
  let result = '';
  let i = 0;
  
  while (i < text.length) {
    let matched = false;
    
    // 가장 긴 매칭을 찾기 위해 역순으로 검색
    for (let len = Math.min(10, text.length - i); len >= 1; len--) {
      const substring = text.substring(i, i + len);
      
      const reading = getKanjiReading(substring, text, lineIndex, songName, contextMappings);
      if (reading) {
        // HTML ruby 태그로 생성
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

// songView.ejs의 매칭 함수 정확 복사 (검증용)
function findSentenceInHtmlWithFuriganaEnhancedV5(htmlStr, sentence) {
  if (!htmlStr || !sentence) {
    return null;
  }

  // --- 1단계: plainText 및 mappings 생성 ---
  let plainText = "";
  const mappings = []; // { plainIndex, htmlStart, htmlEnd, ... }
  let currentPlainIndex = 0;
  let i = 0;
  let tagBuffer = "";
  let isInsideTag = false;
  let rubyInfo = null;

  // 파싱 로직 시작
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

// 메인 실행 함수
async function main() {
  try {
    // 1. 파일 읽기
    console.log('\n📖 1단계: 파일 읽기 중...');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`   ✅ ${data.translatedLines.length}개 라인 로드됨`);
    
    // 곡명 추출 (파일명에서)
    const songName = path.basename(fileName, '.json');
    console.log(`   🎵 곡명: ${songName}`);
    
    // 2. 스마트 루비 데이터 생성
    console.log('\n🧠 2단계: 스마트 루비 데이터 생성 중...');
    const rubyData = generateSmartRubyData(data.translatedLines, songName);
    console.log(`   ✅ 루비 데이터 생성 완료`);
    
    // 3. JSON 파일 저장
    console.log('\n💾 3단계: JSON 파일 저장 중...');
    data.rubyData = rubyData;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`   ✅ 파일 저장 완료: ${filePath}`);
    
    // 4. 매칭 알고리즘 검증
    console.log('\n🔍 4단계: 매칭 알고리즘 검증 중...');
    
    // T0 검증
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
          console.log(`   ❌ T0 매칭 실패 [${index}]: "${line.T0}"`);
        }
      }
    });
    
    // T1 검증
    console.log('   🔤 T1 (개별 단어) 매칭 검증...');
    let t1SuccessCount = 0;
    let t1FailCount = 0;
    
    data.translatedLines.forEach((line, lineIndex) => {
      if (line.LI && lineIndex < rubyLines.length) {
        const htmlRuby = rubyLines[lineIndex];
        
        line.LI.forEach((item, itemIndex) => {
          if (item.T1) {
            const matchResult = findSentenceInHtmlWithFuriganaEnhancedV5(htmlRuby, item.T1);
            
            if (matchResult && matchResult.start !== undefined && matchResult.end !== undefined) {
              t1SuccessCount++;
            } else {
              t1FailCount++;
              console.log(`   ❌ T1 매칭 실패 [${lineIndex}:${itemIndex}]: "${item.T1}"`);
            }
          }
        });
      }
    });
    
    // 5. 결과 리포팅
    console.log('\n🎯 5단계: 결과 리포팅');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 T0 (전체 문장) 매칭 결과:`);
    console.log(`   ✅ 성공: ${t0SuccessCount}개`);
    console.log(`   ❌ 실패: ${t0FailCount}개`);
    console.log(`   📈 성공률: ${((t0SuccessCount / (t0SuccessCount + t0FailCount)) * 100).toFixed(1)}%`);
    
    console.log(`\n📊 T1 (개별 단어) 매칭 결과:`);
    console.log(`   ✅ 성공: ${t1SuccessCount}개`);
    console.log(`   ❌ 실패: ${t1FailCount}개`);
    console.log(`   📈 성공률: ${((t1SuccessCount / (t1SuccessCount + t1FailCount)) * 100).toFixed(1)}%`);
    
    const totalSuccess = t0SuccessCount + t1SuccessCount;
    const totalFail = t0FailCount + t1FailCount;
    const totalRate = ((totalSuccess / (totalSuccess + totalFail)) * 100).toFixed(1);
    
    console.log(`\n🏆 종합 결과:`);
    console.log(`   ✅ 전체 성공: ${totalSuccess}개`);
    console.log(`   ❌ 전체 실패: ${totalFail}개`);
    console.log(`   🎯 종합 성공률: ${totalRate}%`);
    
    if (totalRate === '100.0') {
      console.log('\n🎉 완벽한 성공률 달성! 모든 매칭이 성공했습니다!');
    } else {
      console.log('\n⚠️  일부 매칭 실패가 있습니다. 위의 실패 로그를 확인해주세요.');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎵 Ruby Data 생성 및 검증 완료!');
    
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
    process.exit(1);
  }
}

// 실행
main(); 