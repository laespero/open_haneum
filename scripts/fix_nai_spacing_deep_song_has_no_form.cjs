const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_song_has_no_form.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  const fixNaiSpacing = (text, fieldName, t0, t1) => {
    if (typeof text !== 'string') {
      return text;
    }

    // "나이"로 끝나고, "나이" 바로 앞이 "테"가 아니고, "나이" 바로 앞이 공백이 아니고, 전체가 "나이"가 아닌 경우
    if (text.endsWith('나이') && !text.endsWith('테나이') && !text.endsWith(' 나이') && text !== '나이') {
      const newText = text.slice(0, -2) + ' 나이';
      if (text !== newText) {
        let logMessage = `- Updating ${fieldName}`;
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
        line.R0 = fixNaiSpacing(line.R0, 'R0', line.T0);
      }

      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.R1) {
            item.R1 = fixNaiSpacing(item.R1, 'R1', line.T0, item.T1);
          }
          if (item.R2) {
            item.R2 = fixNaiSpacing(item.R2, 'R2', line.T0, item.T1);
          }
          if (item.XR) {
            item.XR = fixNaiSpacing(item.XR, 'XR', line.T0, item.T1);
          }
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} changes.`);
    } else {
      console.log(`\nNo changes needed for ${filePath}.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 