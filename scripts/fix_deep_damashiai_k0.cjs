const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_damashiai.json');

// 수정할 번역 목록
const corrections = [
  {
    targetT0: "もう見失わないから",
    oldK0: "이제 더 이상 잃어버리지 않을 거야.",
    newK0: "이제 다시는 놓치지 않을 테니까"
  },
  {
    targetT0: "夢だけ見ていたね",
    oldK0: "꿈만 꾸고 있었네.",
    newK0: "꿈만 보고 있었네."
  },
  {
    targetT0: "藻掻くほど迷い込み",
    oldK0: "발버둥 칠수록 깊이 빠져드네",
    newK0: "발버둥 칠수록 깊이 빠져드네"
  },
  {
    targetT0: "信じられる物を透かす",
    oldK0: "믿을 수 있는 것을 비추다",
    newK0: "믿을 수 있는 것을 비추어"
  }
];

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      for (const correction of corrections) {
        if (line.T0 === correction.targetT0) {
          if (line.K0 === correction.oldK0) {
            line.K0 = correction.newK0;
            console.log(`- Updating K0 for T0: "${line.T0}"`);
            console.log(`  Old K0: "${correction.oldK0}"`);
            console.log(`  New K0: "${correction.newK0}"\n`);
            changesMade++;
            break; 
          } else if (line.K0 === correction.newK0) {
            console.log(`- K0 for T0: "${line.T0}" is already "${correction.newK0}". No change made.\n`);
            break;
          } else {
            // T0는 일치하지만 oldK0가 다른 경우, 또는 oldK0와 newK0 모두 현재 K0와 다른 경우
            // 이 경우는 사용자가 직접 확인하거나, 스크립트의 oldK0 값을 현재 K0 값으로 수정해야 할 수 있습니다.
            console.warn(`- WARNING: K0 for T0: "${line.T0}" is "${line.K0}".`);
            console.warn(`  Expected oldK0: "${correction.oldK0}" or current K0 is different from newK0: "${correction.newK0}".`);
            console.warn(`  No change made for this specific correction rule. Please verify.\n`);
            break;
          }
        }
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Successfully updated ${filePath} with ${changesMade} K0 change(s).`);
    } else {
      console.log(`No K0 changes were made to ${filePath} based on the provided corrections.`);
      console.log('This might be because the target T0 was not found, the oldK0 did not match the current K0, or it was already the newK0.');
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 