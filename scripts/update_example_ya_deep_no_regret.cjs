const fs = require('fs');
const path = require('path');

// 대상 파일 위치: open-haneum/songs/deep_no_regret.json
const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');
const targetT0_for_LI = "だからもう会えないや"; // LI 항목을 찾기 위한 T0 컨텍스트
const targetT1_in_LI = "や"; // 수정할 LI 항목의 T1 값

const newExample = {
  XE: "何もできないや。",
  XK: "아무것도 할 수가 없네.",
  XI: "nanimo dekinai ya",
  XR: "나니모 데키나이 야"
};

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.T0 === targetT0_for_LI) {
        if (line.LI && Array.isArray(line.LI)) {
          line.LI.forEach(item => {
            if (item.T1 === targetT1_in_LI) {
              console.log(`- Updating example for T0: "${targetT0_for_LI}", T1: "${targetT1_in_LI}"`);
              console.log(`  Old XE: "${item.XE}", XK: "${item.XK}", XI: "${item.XI}", XR: "${item.XR}"`);
              item.XE = newExample.XE;
              item.XK = newExample.XK;
              item.XI = newExample.XI;
              item.XR = newExample.XR;
              console.log(`  New XE: "${item.XE}", XK: "${item.XK}", XI: "${item.XI}", XR: "${item.XR}"`);
              changesMade++;
            }
          });
        }
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Successfully updated example for ${changesMade} item(s) in ${filePath}.`);
    } else {
      console.log(`No example changes were made to ${filePath} for T0: "${targetT0_for_LI}", T1: "${targetT1_in_LI}".`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 