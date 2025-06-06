const fs = require('fs');
const filePath = './songs/deep_player_one.json';

try {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  console.log('\n--- deep_player_one.json 예문 (XE, XK) 검토 시작 ---\n');

  data.translatedLines.forEach((line, lineIndex) => {
    if (line.LI && line.LI.length > 0) {
      console.log(`\n--- 가사 T0 (${lineIndex + 1}): ${line.T0} ---`);
      line.LI.forEach((item, itemIndex) => {
        console.log(`  LI[${itemIndex + 1}] T1: ${item.T1}`);
        console.log(`    XE: ${item.XE}`);
        console.log(`    XK: ${item.XK}`);
      });
    }
  });

  console.log('\n--- 예문 검토 종료 ---\n');

} catch (error) {
  console.error('[예문 출력 스크립트] 오류:', error);
} 