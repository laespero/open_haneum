const fs = require('fs');
const path = require('path');

// JSON 파일 읽기
const jsonPath = path.join(__dirname, '../songs/Haiirotoao.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// 비교할 T1(또는 T0) 값
const target = '袖丈が覚束無い夏の終わり';

// rubyData에서 첫 줄 추출
const rubyData = jsonData.rubyData.split('<br>')[0];

// ruby HTML에서 한자(원문)만 추출하는 함수
function extractKanjiFromRuby(html) {
  let result = '';
  let lastIndex = 0;
  // rb-rt 쌍을 먼저 추출
  const pairRegex = /<span class=\"rb\">(.*?)<\/span><span class=\"rt\">(.*?)<\/span>/g;
  let match;
  while ((match = pairRegex.exec(html)) !== null) {
    // 쌍 앞의 평문
    if (match.index > lastIndex) {
      result += html.slice(lastIndex, match.index).replace(/<[^>]+>/g, '');
    }
    // rb만 추출
    result += match[1];
    lastIndex = pairRegex.lastIndex;
  }
  // 마지막 쌍 뒤의 평문
  if (lastIndex < html.length) {
    result += html.slice(lastIndex).replace(/<[^>]+>/g, '');
  }
  return result;
}

// 실제 비교
const extracted = extractKanjiFromRuby(rubyData);
console.log('T1(원문):', target);
console.log('rubyData에서 추출:', extracted);
console.log('일치 여부:', extracted === target ? '완벽 일치' : '불일치'); 