const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep2_super_idol.json');

// 수정할 T0과 새로운 R0 값의 매핑 (Batch 2)
const corrections = {
  "放着让我来": "팡 저 랑 워 라이",
  "不怕有我在": "부 파 요우 워 짜이",
  "都没你的甜": "더우 메이 니 더 톈",
  "那坚定的模样": "나 지엔딩 더 무양",
  "莫忘了初心常在": "모 왕 러 추신 창 짜이"
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

  console.log("--- Manual Correction Log (Batch 2) ---");
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