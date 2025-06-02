const fs = require('fs');
const path = require('path');

// 대상 파일 위치: open-haneum/songs/deep_no_regret.json
const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');
const targetT0 = "ずっとさらけ出せず";
const newK0 = "있는 그대로를 보여주지 못하고";

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.T0 === targetT0) {
        if (line.K0 !== newK0) {
          console.log(`- Updating K0 for T0: "${targetT0}"`);
          console.log(`  Old K0: "${line.K0}"`);
          line.K0 = newK0;
          console.log(`  New K0: "${line.K0}"`);
          changesMade++;
        } else {
          console.log(`- K0 for T0: "${targetT0}" is already "${newK0}". No change needed.`);
        }
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Successfully updated ${changesMade} line(s) in ${filePath}.`);
    } else {
      console.log(`No K0 changes were made to ${filePath} for T0: "${targetT0}".`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 