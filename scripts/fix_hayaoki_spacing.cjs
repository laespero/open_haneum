const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');

const targetXR = "와타시 와 하야오키 타이푸 다.";
const replacementXR = "와타시 와 하야 오키 타이푸 다.";

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      // R0, R1, R2, XR 필드를 모두 확인합니다.
      const fieldsToUpdate = ['R0', 'R1', 'R2', 'XR'];
      fieldsToUpdate.forEach(field => {
        if (line[field] && typeof line[field] === 'string' && line[field] === targetXR) {
          console.log(`Found target XR in Line's ${field}: "${line.T0}"`);
          console.log(`  Original ${field}: "${line[field]}"`);
          line[field] = replacementXR;
          console.log(`  New ${field}: "${line[field]}"`);
          changesMade++;
        }
      });

      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          fieldsToUpdate.forEach(field => {
            if (item[field] && typeof item[field] === 'string' && item[field] === targetXR) {
              console.log(`Found target XR in LI's ${field} (T0: "${line.T0}", T1: "${item.T1}")`);
              console.log(`  Original ${field}: "${item[field]}"`);
              item[field] = replacementXR;
              console.log(`  New ${field}: "${item[field]}"`);
              changesMade++;
            }
          });
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} changes for XR field.`);
    } else {
      console.log(`\nNo changes needed in ${filePath} for XR field "${targetXR}".`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 