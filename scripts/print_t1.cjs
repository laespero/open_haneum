const fs = require('fs');
const path = require('path');

// JSON 파일 읽기
const jsonPath = path.join(__dirname, '../songs/Haiirotoao.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// contextText 배열에서 모든 T0 값 추출
const t0Values = jsonData.contextText.map(item => item.T0);

// 결과 출력
console.log('=== T0 값 목록 ===');
t0Values.forEach((t0, index) => {
  console.log(`${index + 1}. ${t0}`);
});
console.log(`\n총 ${t0Values.length}개의 T0 값이 있습니다.`); 