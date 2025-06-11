const fs = require('fs');
const path = require('path');

// Haiirotoao.json 파일 읽기
const filePath = path.join(__dirname, '..', 'songs', 'Haiirotoao.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// songView.ejs의 매칭 알고리즘 복사
function findSentenceInHtmlWithFuriganaEnhancedV5(htmlStr, sentence) {
  if (!htmlStr || !sentence) {
    return null;
  }

  // --- 1단계: plainText 및 mappings 생성 (V4와 동일) ---
  let plainText = "";
  const mappings = []; // { plainIndex, htmlStart, htmlEnd, ... }
  let currentPlainIndex = 0;
  let i = 0;
  let tagBuffer = "";
  let isInsideTag = false;
  let rubyInfo = null;

  // (V4의 파싱 로직 전체를 여기에 복사 붙여넣기)
  // ... (파싱 로직 시작) ...
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
            if (rubyInfo.baseText !== null && rubyInfo.baseText !== undefined) { // baseText가 null/undefined가 아닌지 확인
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
                        isWhitespace: /\s/.test(baseChar) // 루비 베이스 텍스트 내 공백 여부
                    });
                    currentPlainIndex++;
                }
                rubyInfo = null;
            } else {
                 rubyInfo = null;
            }
        }
        else if (tagHtml.toLowerCase().startsWith('<br')) {
            const isWhitespaceChar = true; // <br>은 공백으로 취급
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
  // ... (파싱 로직 끝) ...

  // --- 2단계: 정규화 및 검색 ---
  const normalizeText = (text) => text.replace(/\s+/g, ''); // 모든 공백 제거 함수

  const normalizedPlainText = normalizeText(plainText);
  const normalizedSentence = normalizeText(sentence);

  const normalizedStartIndex = normalizedPlainText.indexOf(normalizedSentence);

  if (normalizedStartIndex === -1) {
    return null;
  }
  const normalizedEndIndex = normalizedStartIndex + normalizedSentence.length; // Exclusive end index

  // --- 3단계: 정규화된 인덱스를 원본 plainText 인덱스로 역매핑 ---
  let originalPlainStartIndex = -1;
  let originalPlainEndIndexInclusive = -1; // 마지막 문자를 포함하는 인덱스
  let nonWhitespaceCount = 0;
  let foundStart = false;

  for(let k = 0; k < mappings.length; k++) {
      // 매핑 정보의 isWhitespace 속성을 사용하여 공백 여부 판단
      if (!mappings[k].isWhitespace) {
          if (nonWhitespaceCount === normalizedStartIndex && !foundStart) {
              originalPlainStartIndex = mappings[k].plainIndex; // k 와 같음
              foundStart = true;
          }
          if (foundStart && nonWhitespaceCount === normalizedEndIndex - 1) {
              originalPlainEndIndexInclusive = mappings[k].plainIndex; // k 와 같음
              break; // 끝 인덱스 찾았으므로 종료
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

function findRuby(htmlStr, sentence){
    const found = findSentenceInHtmlWithFuriganaEnhancedV5(htmlStr, sentence);
    if (found) {
        return htmlStr.substring(found.start, found.end);
    } else {
        return "";
    }
}

// rubyData를 HTML로 변환하는 함수
function generateHtmlFromRubyData(rubyArray) {
  if (!rubyArray || !Array.isArray(rubyArray)) {
    return '';
  }
  
  let html = '';
  for (const rubyItem of rubyArray) {
    if (rubyItem.ruby && rubyItem.ruby.trim() !== '') {
      // 한자에 후리가나가 있는 경우
      html += `<span class="ruby"><span class="rb">${rubyItem.text}</span><span class="rt">${rubyItem.ruby}</span></span>`;
    } else {
      // 후리가나가 없는 경우 그냥 텍스트
      html += rubyItem.text;
    }
  }
  return html;
}

// contextText에서 LI 배열이 있는 항목들 찾기 및 T1 추출
const itemsWithT1 = [];

data.translatedLines.forEach((item, translatedIndex) => {
  if (item.LI && Array.isArray(item.LI)) {
    item.LI.forEach(liItem => {
      if (liItem.T1) {
        itemsWithT1.push({
          t0: item.T0,
          t1: liItem.T1,
          translatedIndex: translatedIndex,
          fullItem: item
        });
      }
    });
  }
});

console.log(`총 ${itemsWithT1.length}개의 T1 데이터를 찾았습니다.\n`);

let successCount = 0;
let failureCount = 0;
const failures = [];

// 각 T1에 대해 매칭 테스트 (전체 데이터)
const testItems = itemsWithT1; // 전체 데이터 테스트

testItems.forEach((item, index) => {
  const t0 = item.t0;
  const t1 = item.t1;
  
  // T0를 기준으로 contextText에서 해당하는 인덱스 찾기
  const contextIndex = data.contextText.findIndex(ctx => ctx.T0 === t0);
  
  if (contextIndex === -1 || !data.rubyData || !data.rubyData[contextIndex]) {
    // console.log(`⚠️  ${index + 1}. T0 "${t0}"에 대응하는 rubyData를 찾을 수 없습니다. (contextIndex: ${contextIndex})`);
    failureCount++;
    failures.push({ index: index + 1, t0, t1, reason: 'rubyData 없음' });
    return;
  }
  
  // rubyData를 HTML로 변환
  const htmlStr = generateHtmlFromRubyData(data.rubyData[contextIndex]);
  
  // T1 문장을 HTML에서 찾기 시도
  const foundRuby = findRuby(htmlStr, t1);
  
  if (foundRuby) {
    // console.log(`✅ ${index + 1}. "${t1}" → 매칭 성공`);
    successCount++;
  } else {
    console.log(`❌ ${index + 1}. "${t1}" → 매칭 실패`);
    console.log(`   T0: ${t0}`);
    console.log(`   전체 HTML: ${htmlStr}\n`);
    failureCount++;
    failures.push({ index: index + 1, t0, t1, html: htmlStr, reason: '매칭 실패' });
  }
});

// 결과 요약
console.log('='.repeat(80));
console.log(`매칭 테스트 결과 (전체 ${itemsWithT1.length}개 테스트):`);
console.log(`성공: ${successCount}개`);
console.log(`실패: ${failureCount}개`);
console.log(`성공률: ${((successCount / (successCount + failureCount)) * 100).toFixed(1)}%`);

if (failures.length > 0) {
  console.log('\n실패한 케이스들:');
  failures.forEach(failure => {
    console.log(`  ${failure.index}. "${failure.t1}" (${failure.reason})`);
  });
} 