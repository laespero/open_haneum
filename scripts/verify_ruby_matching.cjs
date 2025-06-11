const fs = require('fs');
const path = require('path');

// JSON 파일 읽기
const jsonPath = path.join(__dirname, '../songs/Haiirotoao.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// songView.ejs의 findSentenceInHtmlWithFuriganaEnhancedV5 함수 구현
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
            i = rbEndIndex + '</span>'.length - 1;
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

// 테스트할 문장
const testSentence = "袖丈が覚束無い夏の終わり";

// rubyData에서 첫 줄 추출
const rubyData = jsonData.rubyData.split('<br>')[0];

// 매칭 검증
const result = findSentenceInHtmlWithFuriganaEnhancedV5(rubyData, testSentence);

console.log('테스트 문장:', testSentence);
console.log('rubyData 첫 줄:', rubyData);
console.log('매칭 결과:', result ? '성공' : '실패');
if (result) {
  console.log('매칭된 HTML:', rubyData.substring(result.start, result.end));
} 