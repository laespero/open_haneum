const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');

// 현재 XR 값 (이전 스크립트에서 변경된 값)
const currentXR = "코도모 다케도, 이켄 와 이치 닌 마에 다.";
// 최종적으로 변경될 XR 값
const finalXR = "코도모 다케도, 이켄 와 이치닌 마에 다.";

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          // 우리가 수정한 예문의 XE 값과 현재 XR 값으로 특정 아이템을 찾습니다.
          if (item.XE === "子供だけど、意見は一人前だ。" && item.XR === currentXR) {
            console.log(`Found target XR in item with XE: "${item.XE}"`);
            console.log(`  Original XR: "${item.XR}"`);
            item.XR = finalXR;
            console.log(`  New XR: "${item.XR}"`);
            changesMade++;
          }
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} changes for XR field.`);
    } else {
      console.log(`\nNo changes needed in ${filePath} for XR field changing from "${currentXR}" to "${finalXR}".`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 