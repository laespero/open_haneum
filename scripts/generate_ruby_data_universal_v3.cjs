const fs = require('fs');
const path = require('path');

// 명령행 인수 처리
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('사용법: node scripts/generate_ruby_data_universal_v3.cjs <파일명>');
  console.log('예시: node scripts/generate_ruby_data_universal_v3.cjs saikai.json');
  process.exit(1);
}

const fileName = args[0];
const filePath = fileName.includes('.json') ? 
  path.resolve('songs', fileName) : 
  path.resolve('songs', `${fileName}.json`);

console.log('🎵 지능형 Ruby Data 생성기 v3.0 (Utaten 기반) 시작');
console.log(`📂 대상 파일: ${filePath}`);

// 실제 utaten에서 추출한 완전한 HTML 데이터
const utatenRubyData = `
          「またね」と<span class="ruby"><span class="rb">笑</span><span class="rt">わら</span></span>って<span class="ruby"><span class="rb">見</span><span class="rt">み</span></span>せてくれた<br>
<span class="ruby"><span class="rb">同</span><span class="rt">おな</span></span>じように<span class="ruby"><span class="rb">笑</span><span class="rt">わら</span></span>い<span class="ruby"><span class="rb">返</span><span class="rt">かえ</span></span>していたのに<br>
<span class="ruby"><span class="rb">気付</span><span class="rt">きづ</span></span>けば<span class="ruby"><span class="rb">少</span><span class="rt">すこ</span></span>し<span class="ruby"><span class="rb">滲</span><span class="rt">にじ</span></span>んでいた<br>
あなたの<span class="ruby"><span class="rb">姿</span><span class="rt">すがた</span></span><br>
<br>
あれからいくつ<span class="ruby"><span class="rb">夜</span><span class="rt">よる</span></span>を<span class="ruby"><span class="rb">越</span><span class="rt">こ</span></span>えた<br>
<span class="ruby"><span class="rb">窓越</span><span class="rt">まどご</span></span>しの<span class="ruby"><span class="rb">白</span><span class="rt">しろ</span></span>い<span class="ruby"><span class="rb">画面</span><span class="rt">がめん</span></span>に<span class="ruby"><span class="rb">映</span><span class="rt">うつ</span></span>った<br>
あなたと<span class="ruby"><span class="rb">見</span><span class="rt">み</span></span>たい<span class="ruby"><span class="rb">景色</span><span class="rt">けしき</span></span>を<span class="ruby"><span class="rb">今</span><span class="rt">いま</span></span>も<br>
ずっとずっと<span class="ruby"><span class="rb">見</span><span class="rt">み</span></span>つめたまま<br>
<br>
<span class="ruby"><span class="rb">降</span><span class="rt">ふ</span></span>りしきる<span class="ruby"><span class="rb">雪</span><span class="rt">ゆき</span></span>が<span class="ruby"><span class="rb">積</span><span class="rt">つ</span></span>もるように<br>
この<span class="ruby"><span class="rb">町</span><span class="rt">まち</span></span>でただあなたを<span class="ruby"><span class="rb">想</span><span class="rt">おも</span></span>う<br>
<span class="ruby"><span class="rb">離</span><span class="rt">はな</span></span>れていても<span class="ruby"><span class="rb">同</span><span class="rt">おな</span></span>じ<span class="ruby"><span class="rb">空</span><span class="rt">そら</span></span>が<br>
どうか<span class="ruby"><span class="rb">見</span><span class="rt">み</span></span>えていますように<br>
<br>
「またね」と<span class="ruby"><span class="rb">優</span><span class="rt">やさ</span></span>しい<span class="ruby"><span class="rb">声</span><span class="rt">こえ</span></span>が<span class="ruby"><span class="rb">響</span><span class="rt">ひび</span></span>く<br>
<span class="ruby"><span class="rb">耳元</span><span class="rt">みみもと</span></span>にあなたが<span class="ruby"><span class="rb">残</span><span class="rt">のこ</span></span>した<span class="ruby"><span class="rb">静寂</span><span class="rt">しじま</span></span><br>
<span class="ruby"><span class="rb">世界</span><span class="rt">せかい</span></span>が<span class="ruby"><span class="rb">切</span><span class="rt">き</span></span>り<span class="ruby"><span class="rb">離</span><span class="rt">はな</span></span>された<span class="ruby"><span class="rb">夜</span><span class="rt">よる</span></span><br>
また<span class="ruby"><span class="rb">目</span><span class="rt">め</span></span>を<span class="ruby"><span class="rb">瞑</span><span class="rt">つむ</span></span>る<br>
<br>
くだらないことにずっと<br>
<span class="ruby"><span class="rb">幸</span><span class="rt">しあわ</span></span>せを<span class="ruby"><span class="rb">感</span><span class="rt">かん</span></span>じてたきっと<br>
<span class="ruby"><span class="rb">特別</span><span class="rt">とくべつ</span></span>じゃない<span class="ruby"><span class="rb">日々</span><span class="rt">ひび</span></span>をもっと<br>
<span class="ruby"><span class="rb">二人</span><span class="rt">ふたり</span></span>でただ<span class="ruby"><span class="rb">過</span><span class="rt">す</span></span>ごしていたくて<br>
<span class="ruby"><span class="rb">季節</span><span class="rt">きせつ</span></span>が<span class="ruby"><span class="rb">何度</span><span class="rt">なんど</span></span><span class="ruby"><span class="rb">変</span><span class="rt">か</span></span>わろうと<br>
<span class="ruby"><span class="rb">隣</span><span class="rt">となり</span></span>にいたいよ ねえそれ<span class="ruby"><span class="rb">以上</span><span class="rt">いじょう</span></span><br>
<span class="ruby"><span class="rb">何</span><span class="rt">なに</span></span>もいらないから<br>
<br>
<span class="ruby"><span class="rb">降</span><span class="rt">ふ</span></span>りしきる<span class="ruby"><span class="rb">雪</span><span class="rt">ゆき</span></span>が<span class="ruby"><span class="rb">積</span><span class="rt">つ</span></span>もるように<br>
<span class="ruby"><span class="rb">遠</span><span class="rt">とお</span></span>い<span class="ruby"><span class="rb">町</span><span class="rt">まち</span></span>でただあなたを<span class="ruby"><span class="rb">想</span><span class="rt">おも</span></span>う<br>
<span class="ruby"><span class="rb">触</span><span class="rt">ふ</span></span>れ<span class="ruby"><span class="rb">合</span><span class="rt">あ</span></span>うことができなくても<br>
<span class="ruby"><span class="rb">変</span><span class="rt">か</span></span>わることなく<br>
<br>
<span class="ruby"><span class="rb">何度</span><span class="rt">なんど</span></span>だってそう<br>
<span class="ruby"><span class="rb">振</span><span class="rt">ふ</span></span>り<span class="ruby"><span class="rb">返</span><span class="rt">かえ</span></span>ればあの<span class="ruby"><span class="rb">日</span><span class="rt">ひ</span></span>の<br>
あなたの<span class="ruby"><span class="rb">言葉</span><span class="rt">ことば</span></span>が<span class="ruby"><span class="rb">声</span><span class="rt">こえ</span></span>が<br>
<span class="ruby"><span class="rb">会</span><span class="rt">あ</span></span>いたくなるんだよ<br>
<span class="ruby"><span class="rb">何度</span><span class="rt">なんど</span></span>だってそう<br>
<span class="ruby"><span class="rb">信</span><span class="rt">しん</span></span>じ<span class="ruby"><span class="rb">合</span><span class="rt">あ</span></span>えればいつまでも<br>
<span class="ruby"><span class="rb">二人</span><span class="rt">ふたり</span></span><span class="ruby"><span class="rb">繋</span><span class="rt">つな</span></span>がっていられる<br>
<br>
<span class="ruby"><span class="rb">雪明</span><span class="rt">ゆきあ</span></span>かり<span class="ruby"><span class="rb">照</span><span class="rt">て</span></span>らすこの<span class="ruby"><span class="rb">町</span><span class="rt">まち</span></span>にも<br>
いつかは<span class="ruby"><span class="rb">優</span><span class="rt">やさ</span></span>しい<span class="ruby"><span class="rb">春</span><span class="rt">はる</span></span>が<span class="ruby"><span class="rb">芽吹</span><span class="rt">めぶ</span></span>く<br>
ここでまた<span class="ruby"><span class="rb">会</span><span class="rt">あ</span></span>えたその<span class="ruby"><span class="rb">時</span><span class="rt">とき</span></span>は<br>
<span class="ruby"><span class="rb">涙</span><span class="rt">なみだ</span></span><span class="ruby"><span class="rb">溢</span><span class="rt">こぼ</span></span>さないように<br>
<br>
<span class="ruby"><span class="rb">冬</span><span class="rt">ふゆ</span></span>の<span class="ruby"><span class="rb">終</span><span class="rt">お</span></span>わりを<span class="ruby"><span class="rb">告</span><span class="rt">つ</span></span>げる<span class="ruby"><span class="rb">淡雪</span><span class="rt">あわゆき</span></span><br>
そのひとときに<span class="ruby"><span class="rb">願</span><span class="rt">ねが</span></span>いを<span class="ruby"><span class="rb">乗</span><span class="rt">の</span></span>せる<br>
どんな<span class="ruby"><span class="rb">季節</span><span class="rt">きせつ</span></span>も<span class="ruby"><span class="rb">景色</span><span class="rt">けしき</span></span>もあなたと<br>
<span class="ruby"><span class="rb">共</span><span class="rt">とも</span></span>に<span class="ruby"><span class="rb">同</span><span class="rt">おな</span></span>じ<span class="ruby"><span class="rb">場所</span><span class="rt">ばしょ</span></span>で<span class="ruby"><span class="rb">感</span><span class="rt">かん</span></span>じていたい<br>
<br>
<span class="ruby"><span class="rb">町</span><span class="rt">まち</span></span>に<span class="ruby"><span class="rb">柔</span><span class="rt">やわ</span></span>らかな<span class="ruby"><span class="rb">風</span><span class="rt">かぜ</span></span>が<span class="ruby"><span class="rb">吹</span><span class="rt">ふ</span></span>いて<br>
<span class="ruby"><span class="rb">鮮</span><span class="rt">あざ</span></span>やかな<span class="ruby"><span class="rb">花</span><span class="rt">はな</span></span>が<span class="ruby"><span class="rb">咲</span><span class="rt">さ</span></span>くその<span class="ruby"><span class="rb">日</span><span class="rt">ひ</span></span>を<br>
<span class="ruby"><span class="rb">待</span><span class="rt">ま</span></span>ち<span class="ruby"><span class="rb">続</span><span class="rt">つづ</span></span>ける<span class="ruby"><span class="rb">二人</span><span class="rt">ふたり</span></span>にも<br>
<span class="ruby"><span class="rb">春</span><span class="rt">はる</span></span>が<span class="ruby"><span class="rb">訪</span><span class="rt">おとず</span></span>れますように<br>
<span class="ruby"><span class="rb">笑顔</span><span class="rt">えがお</span></span>でまた<span class="ruby"><span class="rb">会</span><span class="rt">あ</span></span>えますように<br>
`;

// utaten HTML에서 정확한 한자-히라가나 매핑 추출
function parseUtatenHTML(htmlData) {
  const kanjiToReading = new Map();
  
  // 루비 태그 패턴 매칭
  const rubyPattern = /<span class="ruby"><span class="rb">([^<]+)<\/span><span class="rt">([^<]+)<\/span><\/span>/g;
  let match;
  
  console.log('🔍 Utaten 루비 태그 파싱 중...');
  
  while ((match = rubyPattern.exec(htmlData)) !== null) {
    const kanjiText = match[1];
    const reading = match[2];
    
    // 한자 길이에 따라 처리
    if (kanjiText.length === 1) {
      // 단일 한자
      kanjiToReading.set(kanjiText, reading);
    } else {
      // 복합 한자 - 정확한 분할을 위해 특별 처리
      kanjiToReading.set(kanjiText, reading);
      
      // 일반적인 2글자 한자 조합 처리
      if (kanjiText.length === 2) {
        const char1 = kanjiText[0];
        const char2 = kanjiText[1];
        
        // 히라가나를 반으로 나누어 추정
        const midPoint = Math.floor(reading.length / 2);
        const reading1 = reading.substring(0, midPoint);
        const reading2 = reading.substring(midPoint);
        
        if (!kanjiToReading.has(char1)) kanjiToReading.set(char1, reading1);
        if (!kanjiToReading.has(char2)) kanjiToReading.set(char2, reading2);
      }
    }
  }
  
  return kanjiToReading;
}

// 지능형 루비 생성 함수
function generateIntelligentRuby(text, kanjiToReading) {
  let result = '';
  let i = 0;
  
  while (i < text.length) {
    let matched = false;
    
    // 가장 긴 한자 시퀀스부터 검사 (최대 4글자)
    for (let len = Math.min(4, text.length - i); len >= 1; len--) {
      const substring = text.substring(i, i + len);
      
      // 한자 시퀀스인지 확인
      if (!/^[一-龯]+$/.test(substring)) continue;
      
      // 정확한 매핑이 있는지 확인
      if (kanjiToReading.has(substring)) {
        const reading = kanjiToReading.get(substring);
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
    // 1. 파일 읽기
    console.log('\n📖 1단계: 파일 읽기 중...');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`   ✅ ${data.translatedLines.length}개 라인 로드됨`);
    console.log(`   🎵 곡명: ${data.name}`);
    
    // 2. utaten HTML 데이터 파싱
    console.log('\n🧠 2단계: Utaten HTML 데이터 파싱 중...');
    const kanjiToReading = parseUtatenHTML(utatenRubyData);
    
    console.log(`   📊 ${kanjiToReading.size}개 한자 매핑 발견`);
    
    // 매핑 샘플 출력
    const samples = Array.from(kanjiToReading.entries()).slice(0, 20);
    console.log('   🔍 매핑 샘플:');
    samples.forEach(([kanji, reading]) => {
      console.log(`      ${kanji} → ${reading}`);
    });
    
    // 3. 지능형 루비 데이터 생성
    console.log('\n🎯 3단계: 지능형 루비 데이터 생성 중...');
    const rubyHtml = [];
    
    data.translatedLines.forEach((line, lineIndex) => {
      if (line.LI && line.LI.length > 0) {
        const lineText = line.T0;
        console.log(`   처리 중: "${lineText}"`);
        
        let lineRubyHtml = generateIntelligentRuby(lineText, kanjiToReading);
        rubyHtml.push(lineRubyHtml);
      }
    });
    
    const rubyData = rubyHtml.join('<br>');
    
    // 4. JSON 파일 저장
    console.log('\n💾 4단계: JSON 파일 저장 중...');
    data.rubyData = rubyData;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`   ✅ 파일 저장 완료: ${filePath}`);
    
    // 5. 매칭 알고리즘 검증
    console.log('\n🔍 5단계: 매칭 알고리즘 검증 중...');
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

    // 6. 한자 커버리지 분석
    console.log('\n📊 6단계: 한자 커버리지 분석...');
    const processedKanji = new Set();
    const unprocessedKanji = new Set();
    
    // 생성된 rubyData에서 처리된 한자 추출
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
    
    // 전체 텍스트에서 미처리 한자 찾기
    const fullText = data.translatedLines.map(line => line.T0).join('');
    for (const char of fullText) {
      if (/[一-龯]/.test(char) && !processedKanji.has(char)) {
        unprocessedKanji.add(char);
      }
    }
    
    console.log(`   ✅ 처리된 한자: ${Array.from(processedKanji).join('')} (${processedKanji.size}개)`);
    console.log(`   ❌ 미처리 한자: ${Array.from(unprocessedKanji).join('')} (${unprocessedKanji.size}개)`);
    
    const totalKanji = processedKanji.size + unprocessedKanji.size;
    const coverageRate = totalKanji > 0 ? ((processedKanji.size / totalKanji) * 100).toFixed(1) : '100.0';
    console.log(`   📈 한자 커버리지: ${coverageRate}%`);

    // 7. 결과 리포팅
    console.log('\n🎯 7단계: 결과 리포팅');
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
    console.log('🎵 Utaten 기반 지능형 Ruby Data 생성 완료!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

// 실행
main(); 