const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'v7_27do.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.T0 === '看着无脑动画面对面味道弥漫') {
        if (line.K0 !== '별 생각 없이 애니메이션을 보며 마주 앉으니, 향기가 퍼져.') {
          line.K0 = '별 생각 없이 애니메이션을 보며 마주 앉으니, 향기가 퍼져.';
          changesMade++;
          console.log('Updated K0 for T0: "看着无脑动画面对面味道弥漫"');
          console.log('  Old K0: "무뇌 애니메이션을 보며 마주 앉아 향기가 퍼져."');
          console.log('  New K0: "별 생각 없이 애니메이션을 보며 마주 앉으니, 향기가 퍼져."');
        }
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} change(s).`);
    } else {
      console.log('No changes needed or target T0 not found.');
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 