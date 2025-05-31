const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep2_like_addicted_poison.json');

try {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);
  let count = 0;

  if (data && Array.isArray(data.translatedLines)) {
    console.log("--- 모든 예문(XE)과 발음(XR) 쌍 ---");
    data.translatedLines.forEach((line, lineIndex) => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach((item, itemIndex) => {
          if (item.XE && item.XR) {
            count++;
            console.log(`Line ${lineIndex + 1}, Item ${itemIndex + 1} (T0: ${line.T0} / T1: ${item.T1 || (item.T2 || '')})`);
            console.log(`  XE: ${item.XE}`);
            console.log(`  XR: ${item.XR}`);
            console.log(`  XI: ${item.XI || 'N/A'}`); // 병음(XI)도 함께 표시
            console.log("------------------------------------");
          }
        });
      }
    });
    if (count === 0) {
      console.log("표시할 예문과 발음 쌍이 파일에 없습니다.");
    } else {
      console.log(`\n총 ${count}개의 예문/발음 쌍을 출력했습니다.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 