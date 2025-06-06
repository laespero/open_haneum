const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_damashiai.json');

const targetT0 = "分け合えるような貴方と出会うために";
const oldR0 = "와케 아에루 요우 나 아나타 토 데아우 타메 니";
const newR0 = "와케 아에루 요오 나 아나타 토 데아우 타메 니";

let foundAndModified = false;

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.T0 === targetT0) {
        if (line.R0 === oldR0) {
          line.R0 = newR0;
          foundAndModified = true;
          console.log(`- Updating R0 for T0: "${targetT0}"`);
          console.log(`  Old R0: "${oldR0}"`);
          console.log(`  New R0: "${newR0}"\n`);
        } else if (line.R0 === newR0) {
          console.log(`- R0 for T0: "${targetT0}" is already "${newR0}". No change made.\n`);
          foundAndModified = true; // 이미 변경된 것으로 간주
        } else {
          console.warn(`- WARNING: R0 for T0: "${targetT0}" is "${line.R0}", but expected "${oldR0}". No change made.`);
        }
      }
    });

    if (foundAndModified && data.translatedLines.some(line => line.T0 === targetT0 && line.R0 === newR0)) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Successfully updated R0 in ${filePath}.`);
    } else if (foundAndModified) {
      console.log('R0 was targeted but not updated to newR0, or already newR0. File not saved.');
    } else {
      console.log('Target T0 or oldR0 not found. No changes made.');
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 