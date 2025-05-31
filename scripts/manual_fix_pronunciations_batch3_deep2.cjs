const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep2_super_idol.json');

// 수정할 T0과 새로운 R0 값의 매핑 (Batch 3)
const corrections = {
  "热爱105℃的你": "르어아이 이 바이 링 우 두 더 니",
  "再次回到最佳状态": "짜이츠 후이다오 쭈이지아 주앙타이",
  "八月正午的阳光": "바 웨 정 우 더 양 광",
  "都没你耀眼": "더우 메이 니 야오 옌",
  "不怕失败来一场": "부 파 스바이 라이 이 창"
};

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;
  let logOutput = [];

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (corrections.hasOwnProperty(line.T0)) {
        if (line.R0 !== corrections[line.T0]) {
          logOutput.push(`Updating R0 for T0: "${line.T0}" (I0: "${line.I0}")`);
          logOutput.push(`  Old R0: "${line.R0}"`);
          line.R0 = corrections[line.T0];
          logOutput.push(`  New R0: "${line.R0}"`);
          changesMade++;
        } else {
          logOutput.push(`No change needed for T0: "${line.T0}". R0 is already "${line.R0}".`);
        }
      }
    });
  }

  console.log("--- Manual Correction Log (Batch 3) ---");
  logOutput.forEach(log => console.log(log));

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\nSuccessfully updated ${filePath} with ${changesMade} change(s).`);
  } else {
    console.log('\nNo changes made in this batch. R0 values might already be correct or target T0s not found.');
  }

} catch (error) {
  console.error('Error processing the file:', error);
} 