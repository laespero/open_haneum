const fs = require('fs');
const path = require('path');

// JSON 파일 읽기
const jsonPath = path.join(__dirname, '../songs/Haiirotoao.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// 테스트할 문장
const testSentence = "袖丈が覚束無い夏の終わり";

// rubyData에서 첫 줄 추출
const rubyData = jsonData.rubyData.split('<br>')[0];

// <span class="rb">...</span>의 내용과 ruby 태그 외 일반 텍스트만 plainText로 추출
function extractPlainTextFromRubyHtml(htmlStr) {
  let plainText = "";
  let i = 0;
  while (i < htmlStr.length) {
    // <span class="rb"> ... </span>
    if (htmlStr.startsWith('<span class="rb">', i)) {
      i += '<span class="rb">'.length;
      let end = htmlStr.indexOf('</span>', i);
      if (end !== -1) {
        plainText += htmlStr.slice(i, end);
        i = end + '</span>'.length;
        continue;
      }
    }
    // <span class="rt"> ... </span> (훈음)은 plainText에 포함하지 않음
    if (htmlStr.startsWith('<span class="rt">', i)) {
      i = htmlStr.indexOf('</span>', i);
      if (i !== -1) i += '</span>'.length;
      else break;
      continue;
    }
    // <span class="ruby"> ... </span> 태그 자체는 무시
    if (htmlStr.startsWith('<span class="ruby">', i)) {
      i += '<span class="ruby">'.length;
      continue;
    }
    if (htmlStr.startsWith('</span>', i)) {
      i += '</span>'.length;
      continue;
    }
    // 일반 텍스트(태그 밖)
    plainText += htmlStr[i];
    i++;
  }
  return plainText;
}

const plainText = extractPlainTextFromRubyHtml(rubyData);

console.log('plainText:', JSON.stringify(plainText));
console.log('T1:', JSON.stringify(testSentence));

// 유니코드 코드포인트 비교
function printUnicodeDiff(a, b) {
  const maxLen = Math.max(a.length, b.length);
  for (let i = 0; i < maxLen; i++) {
    const ca = a[i] || '';
    const cb = b[i] || '';
    const ua = ca ? ca.codePointAt(0).toString(16) : '';
    const ub = cb ? cb.codePointAt(0).toString(16) : '';
    const mark = ca === cb ? ' ' : '≠';
    console.log(`${i}: '${ca}'(${ua}) vs '${cb}'(${ub}) ${mark}`);
  }
}

printUnicodeDiff(plainText, testSentence); 