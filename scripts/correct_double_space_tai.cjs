const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_song_has_no_form.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  const correctDoubleSpaceTai = (text, fieldName, t0, t1) => {
    if (typeof text !== 'string') {
      return text;
    }

    if (text.includes('  타이')) { // 공백 두 개 + 타이
      const newText = text.replace(/  타이/g, ' 타이'); // 모든 "  타이"를 " 타이"로 변경
      if (text !== newText) {
        let logMessage = `- Correcting double space in ${fieldName}`;
        if (t0) logMessage += ` for T0: "${t0}"`;
        if (t1) logMessage += `, T1: "${t1}"`;
        console.log(`${logMessage}. Old: "${text}", New: "${newText}"`);
        changesMade++;
        return newText;
      }
    }
    return text;
  };

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.R0) {
        line.R0 = correctDoubleSpaceTai(line.R0, 'R0', line.T0);
      }

      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.R1) {
            item.R1 = correctDoubleSpaceTai(item.R1, 'R1', line.T0, item.T1);
          }
          if (item.R2) {
            item.R2 = correctDoubleSpaceTai(item.R2, 'R2', line.T0, item.T1);
          }
          if (item.XR) {
            item.XR = correctDoubleSpaceTai(item.XR, 'XR', line.T0, item.T1);
          }
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully corrected double spaces in ${filePath} for ${changesMade} fields.`);
    } else {
      console.log(`\nNo double spaces found needing correction in ${filePath}.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 