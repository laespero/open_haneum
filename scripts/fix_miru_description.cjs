const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  const targetPhrase = "'보다'라는 뜻의 동사 '見る(miru)'의 연용형(て형)입니다.";
  const replacementPhrase = "'보다'라는 뜻의 동사 '見る'의 연용형(て형)입니다.";

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.E1 && typeof item.E1 === 'string' && item.E1 === targetPhrase) {
            const originalValue = item.E1;
            item.E1 = replacementPhrase;
            if (originalValue !== item.E1) {
              console.log(`  - E1: "${originalValue}" -> "${item.E1}" (T1: "${item.T1}", T0: "${line.T0}")`);
              changesMade++;
            }
          }
          // E2도 확인 필요한 경우 추가 (현재 요청은 E1만 대상으로 함)
          /*
          if (item.E2 && typeof item.E2 === 'string' && item.E2 === targetPhrase) {
            const originalValue = item.E2;
            item.E2 = replacementPhrase;
            if (originalValue !== item.E2) {
              console.log(`  - E2: "${originalValue}" -> "${item.E2}" (T2: "${item.T2}", T1: "${item.T1}", T0: "${line.T0}")`);
              changesMade++;
            }
          }
          */
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} changes related to the description of '見る'.`);
    } else {
      console.log(`\nNo changes needed for ${filePath} regarding the description of '見る'.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 