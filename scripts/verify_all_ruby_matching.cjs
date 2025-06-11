const fs = require('fs');
const path = require('path');

// JSON 파일 읽기
const jsonPath = path.join(__dirname, '../songs/Haiirotoao.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// 가사 라인별 ruby 데이터
const rubyDataMap = {
  // 1절
  "袖丈が覚束無い夏の終わり": {
    ruby: {
      "袖丈": "そでたけ",
      "覚束無い": "おぼつかない",
      "夏": "なつ",
      "終": "お"
    }
  },
  "知らず知らずの内に走り出していた": {
    ruby: {
      "知": "し",
      "走": "はし"
    }
  },
  "一歩踏み出したら": {
    ruby: {
      "一歩": "いっぽ",
      "踏": "ふ"
    }
  },
  "戻れないと知って": {
    ruby: {
      "戻": "もど",
      "知": "し"
    }
  },
  "それでも足を止められない": {
    ruby: {
      "足": "あし",
      "止": "と"
    }
  },
  "このまま行けば": {
    ruby: {
      "行": "い"
    }
  },
  "どんな未来が待っているのだろう": {
    ruby: {
      "未来": "みらい",
      "待": "ま"
    }
  },
  "不安と期待が入り混じって": {
    ruby: {
      "不安": "ふあん",
      "期待": "きたい",
      "入": "はい",
      "混": "ま"
    }
  },
  "胸が痛い": {
    ruby: {
      "胸": "むね",
      "痛": "いた"
    }
  },
  "でも止められない": {
    ruby: {
      "止": "と"
    }
  },
  "このまま行けば": {
    ruby: {
      "行": "い"
    }
  },
  "どんな未来が待っているのだろう": {
    ruby: {
      "未来": "みらい",
      "待": "ま"
    }
  },
  "不安と期待が入り混じって": {
    ruby: {
      "不安": "ふあん",
      "期待": "きたい",
      "入": "はい",
      "混": "ま"
    }
  },
  "胸が痛い": {
    ruby: {
      "胸": "むね",
      "痛": "いた"
    }
  },
  "でも止められない": {
    ruby: {
      "止": "と"
    }
  },
  // 2절
  "気付けばいつの間にか": {
    ruby: {
      "気付": "きづ",
      "間": "ま"
    }
  },
  "遠くまで来てしまっていた": {
    ruby: {
      "遠": "とお",
      "来": "き"
    }
  },
  "振り返れば": {
    ruby: {
      "振": "ふり",
      "返": "かえ"
    }
  },
  "もう戻れない": {
    ruby: {
      "戻": "もど"
    }
  },
  "それでも足を止められない": {
    ruby: {
      "足": "あし",
      "止": "と"
    }
  },
  "このまま行けば": {
    ruby: {
      "行": "い"
    }
  },
  "どんな未来が待っているのだろう": {
    ruby: {
      "未来": "みらい",
      "待": "ま"
    }
  },
  "不安と期待が入り混じって": {
    ruby: {
      "不安": "ふあん",
      "期待": "きたい",
      "入": "はい",
      "混": "ま"
    }
  },
  "胸が痛い": {
    ruby: {
      "胸": "むね",
      "痛": "いた"
    }
  },
  "でも止められない": {
    ruby: {
      "止": "と"
    }
  },
  "このまま行けば": {
    ruby: {
      "行": "い"
    }
  },
  "どんな未来が待っているのだろう": {
    ruby: {
      "未来": "みらい",
      "待": "ま"
    }
  },
  "不安と期待が入り混じって": {
    ruby: {
      "不安": "ふあん",
      "期待": "きたい",
      "入": "はい",
      "混": "ま"
    }
  },
  "胸が痛い": {
    ruby: {
      "胸": "むね",
      "痛": "いた"
    }
  },
  "でも止められない": {
    ruby: {
      "止": "と"
    }
  }
};

// ruby 태그 생성 함수
function createRubyTag(text, ruby) {
  return `<span class="ruby"><span class="rb">${text}</span><span class="rt">${ruby}</span></span>`;
}

// 가사 라인을 ruby 태그로 변환
function convertLineToRuby(line, rubyMap) {
  let result = line;
  let offset = 0;
  
  // ruby 데이터를 길이 순으로 정렬 (긴 것부터 처리)
  const sortedRuby = Object.entries(rubyMap).sort((a, b) => b[0].length - a[0].length);
  
  for (const [text, ruby] of sortedRuby) {
    const index = result.indexOf(text);
    if (index !== -1) {
      const rubyTag = createRubyTag(text, ruby);
      result = result.slice(0, index) + rubyTag + result.slice(index + text.length);
    }
  }
  
  return result;
}

// plainText 추출 함수
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

// rubyData 라인별로 분리
const rubyLines = jsonData.rubyData.split('<br>');

// 각 라인별로 매칭 검증
console.log('=== 매칭 검증 시작 ===');
let allMatched = true;

for (let i = 0; i < rubyLines.length; i++) {
  const rubyLine = rubyLines[i];
  const plainText = extractPlainTextFromRubyHtml(rubyLine);
  const expectedLine = Object.keys(rubyDataMap)[i];
  
  const isMatched = plainText === expectedLine;
  if (!isMatched) {
    allMatched = false;
    console.log(`\n[라인 ${i + 1}] 매칭 실패`);
    console.log('기대값:', expectedLine);
    console.log('실제값:', plainText);
  }
}

if (allMatched) {
  console.log('\n모든 라인이 성공적으로 매칭되었습니다!');
} else {
  console.log('\n일부 라인에서 매칭 실패가 발생했습니다.');
} 