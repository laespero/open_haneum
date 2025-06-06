const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep2_like_addicted_poison.json');

try {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);
  let count = 0;

  if (data && Array.isArray(data.translatedLines)) {
    console.log("--- 모든 가사 라인(T0)의 발음(R0) 및 병음(I0) ---");
    data.translatedLines.forEach((line, lineIndex) => {
      if (line.T0 && (line.R0 || line.I0)) { // R0 또는 I0 중 하나라도 있어야 출력
        count++;
        console.log(`Line ${lineIndex + 1}:`);
        console.log(`  T0 (원문): ${line.T0}`);
        console.log(`  R0 (한글 발음): ${line.R0 || 'N/A'}`);
        console.log(`  I0 (병음): ${line.I0 || 'N/A'}`);
        console.log("------------------------------------");
      }
    });
    if (count === 0) {
      console.log("표시할 가사 라인 발음 정보가 파일에 없습니다.");
    } else {
      console.log(`\n총 ${count}개의 가사 라인 발음 정보를 출력했습니다.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 