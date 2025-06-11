const fs = require('fs');
const path = require('path');

// Haiirotoao.json 파일 읽기
const filePath = path.join(__dirname, '..', 'songs', 'Haiirotoao.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// 한자와 독음 매칭 정보 (Utaten 기반)
const rubyMappings = {
  // 기본 단어들
  '袖丈': 'そでたけ',
  '覚束': 'おぼつか',
  '夏': 'なつ',
  '終': 'お',
  '明': 'あ',
  '方': 'がた',
  '電車': 'でんしゃ',
  '揺': 'ゆ',
  '思': 'おも',
  '出': 'だ',
  '懐': 'なつ',
  '風景': 'ふうけい',
  '沢山': 'たくさん',
  '遠回': 'とおまわ',
  '繰': 'く',
  '返': 'かえ',
  '同': 'おな',
  '様': 'よう',
  '町並': 'まちな',
  '通': 'とお',
  '過': 'す',
  '窓': 'まど',
  '僕': 'ぼく',
  '映': 'うつ',
  '君': 'きみ',
  '今': 'いま',
  '頃': 'ころ',
  '曲': 'ま',
  '自転車': 'じてんしゃ',
  '走': 'はし',
  '回': 'まわ',
  '馬鹿': 'ばか',
  '綱渡': 'つなわた',
  '膝': 'ひざ',
  '滲': 'にじ',
  '血': 'ち',
  '虚': 'むな',
  '背丈': 'せたけ',
  '変': 'か',
  '何': 'なに',
  '面影': 'おもかげ',
  '励': 'はげ',
  '歌': 'うた',
  '忙': 'せわ',
  '街': 'まち',
  '背負': 'せお',
  '外': 'そと',
  '眺': 'なが',
  '心': 'こころ',
  '震': 'ふる',
  '瞬間': 'しゅんかん',
  '一度出会': 'いちどであ',
  '強': 'つよ',
  '忘': 'わす',
  '靴': 'くつ',
  '片方茂': 'かたほうしげ',
  '落': 'お',
  '探': 'さが',
  '上手': 'うま',
  '無邪気': 'むじゃき',
  '笑': 'わら',
  '日々': 'ひび',
  '憶': 'おぼ',
  '無様': 'ぶざま',
  '傷': 'きず',
  '終': 'お',
  '毎日': 'まいにち',
  '花束': 'はなたば',
  '追': 'お',
  '朝日': 'あさひ',
  '昇': 'のぼ',
  '前': 'まえ',
  '欠': 'か',
  '月': 'つき',
  '見': 'み',
  '何故': 'なぜ',
  '訳': 'わけ',
  '胸': 'むね',
  '痛': 'いた',
  '顔': 'かお',
  '霞': 'かす',
  '色': 'いろ',
  '今更悲': 'いまさらかな',
  '叫': 'さけ',
  '全': 'すべ',
  '遅': 'おそ',
  '一度初': 'いちどはじ',
  '歩': 'ある',
  '違': 'ちが',
  '会': 'あ',
  '始': 'はじ',
  '青': 'あお'
};

// contextText 배열을 순회하면서 rubyData 생성
const rubyData = [];

data.contextText.forEach((item, index) => {
  const t0 = item.T0;
  const rubyArray = [];
  
  // T0 텍스트를 문자별로 분석하여 ruby 데이터 생성
  let i = 0;
  while (i < t0.length) {
    let matched = false;
    
    // 가장 긴 매칭부터 시도 (탐욕적 매칭)
    for (let len = Math.min(6, t0.length - i); len >= 1; len--) {
      const substr = t0.substring(i, i + len);
      
      if (rubyMappings[substr]) {
        rubyArray.push({
          text: substr,
          ruby: rubyMappings[substr]
        });
        i += len;
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      // 매칭되지 않은 문자는 그대로 추가
      rubyArray.push({
        text: t0[i],
        ruby: ''
      });
      i++;
    }
  }
  
  rubyData.push(rubyArray);
});

// data에 rubyData 추가
data.rubyData = rubyData;

// 파일에 저장
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

console.log(`rubyData가 성공적으로 추가되었습니다. 총 ${rubyData.length}개의 라인에 ruby 정보가 생성되었습니다.`);

// 몇 개의 예시 출력
console.log('\n=== Ruby Data 예시 ===');
rubyData.slice(0, 5).forEach((ruby, index) => {
  console.log(`라인 ${index + 1}:`, ruby.map(r => r.text + (r.ruby ? `(${r.ruby})` : '')).join(''));
}); 