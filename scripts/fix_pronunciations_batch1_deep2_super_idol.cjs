const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep2_super_idol.json');

// 수정할 T0과 새로운 R0 값의 매핑
const corrections = {
  "痛快的热爱": "퉁콰이 더 르어아이",
  "在这独一无二": "짜이 쪄 뚜이우얼",
  "属于我的时代": "슈위 워 더 슬따이",
  "热爱105℃的你": "르어아이 이빠이 링 우 두 더 니",
  "你不知道你有多可爱": "니 부 즬다오 니 여우 뚜오 커아이"
};

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (corrections[line.T0] && line.R0 !== corrections[line.T0]) {
        console.log(`Updating R0 for T0: "${line.T0}"`);
        console.log(`  Old R0: "${line.R0}"`);
        line.R0 = corrections[line.T0];
        console.log(`  New R0: "${line.R0}"`);
        changesMade++;
      }
    });
  }

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\nSuccessfully updated ${filePath} with ${changesMade} change(s).`);
  } else {
    console.log('\nNo changes needed based on the provided corrections. All matching R0 values might already be correct or T0 not found.');
  }

} catch (error) {
  console.error('Error processing the file:', error);
} 