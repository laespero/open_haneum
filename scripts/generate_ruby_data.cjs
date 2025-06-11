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

// 전체 rubyData 생성
let rubyData = '';
for (const [line, data] of Object.entries(rubyDataMap)) {
  const rubyLine = convertLineToRuby(line, data.ruby);
  rubyData += rubyLine + '<br>';
}

// 마지막 <br> 제거
rubyData = rubyData.slice(0, -4);

// JSON 업데이트
jsonData.rubyData = rubyData;
fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');

console.log('새로운 rubyData가 생성되었습니다.'); 