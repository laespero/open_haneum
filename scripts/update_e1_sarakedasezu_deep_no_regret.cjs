const fs = require('fs');
const path = require('path');

// 대상 파일 위치: open-haneum/songs/deep_no_regret.json
const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');
const targetT0 = "ずっとさらけ出せず";
const targetT1 = "さらけ出せず";
const newE1 = "'さらけ出す(드러내다)'의 가능동사인 'さらけ出せる(드러낼 수 있다)'의 미연형 'さらけ出せ'에 부정의 조동사 'ず'가 붙은 형태로, '드러낼 수 없고' 또는 '드러내지 못하고'라는 의미입니다.";

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.T0 === targetT0) {
        if (line.LI && Array.isArray(line.LI)) {
          line.LI.forEach(item => {
            if (item.T1 === targetT1) {
              if (item.E1 !== newE1) {
                console.log(`- Updating E1 for T0: "${targetT0}", T1: "${targetT1}"`);
                console.log(`  Old E1: "${item.E1}"`);
                item.E1 = newE1;
                console.log(`  New E1: "${item.E1}"`);
                changesMade++;
              } else {
                console.log(`- E1 for T0: "${targetT0}", T1: "${targetT1}" is already correct. No change needed.`);
              }
            }
          });
        }
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Successfully updated E1 for ${changesMade} item(s) in ${filePath}.`);
    } else {
      console.log(`No E1 changes were made to ${filePath} for T0: "${targetT0}", T1: "${targetT1}".`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 