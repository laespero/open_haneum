const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_damashiai.json');

// 수정할 E1 정보
const targetT0 = "もう見失わないから";
const targetT1 = "見失わ";
const oldE1 = "'見失う(잃어버리다, 놓치다)'의 미연형으로, '잃어버리지 않다', '놓치지 않다'라는 의미를 나타냅니다.";
const newE1 = "'見失う'의 미연형으로, '잃어버리지 않다', '놓치지 않다'라는 의미를 나타냅니다.";

let foundAndModified = false;

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.T0 === targetT0 && line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.T1 === targetT1 && item.E1 === oldE1) {
            item.E1 = newE1;
            foundAndModified = true;
            console.log(`- Updating E1 for T0: "${targetT0}", T1: "${targetT1}"`);
            console.log(`  Old E1: "${oldE1}"`);
            console.log(`  New E1: "${newE1}"\n`);
          } else if (item.T1 === targetT1 && item.E1 === newE1) {
            console.log(`- E1 for T0: "${targetT0}", T1: "${targetT1}" is already "${newE1}". No change made.\n`);
            foundAndModified = true; // 이미 변경된 것으로 간주
          }
        });
      }
    });

    if (foundAndModified && data.translatedLines.some(line => line.T0 === targetT0 && line.LI && line.LI.some(item => item.T1 === targetT1 && item.E1 === newE1))) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Successfully updated E1 in ${filePath}.`);
    } else if (foundAndModified) {
       console.log('E1 was targeted but not updated to newE1, or already newE1. File not saved.');
    }else {
      console.log('Target T0, T1, or oldE1 not found. No changes made.');
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 