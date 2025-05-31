const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep2_like_addicted_poison.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.XR && typeof item.XR === 'string') {
            const originalXR = item.XR;
            // "르헌"을 "르 헌"으로 수정
            item.XR = originalXR.replace(/르헌/g, "르 헌");

            if (originalXR !== item.XR) {
              changesMade++;
              console.log(`Corrected XR spacing in T0: "${line.T0}", T1: "${item.T1 || (item.T2 || '')}" from "${originalXR}" to "${item.XR}"`);
            }
          }
        });
      }
    });
  }

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Successfully updated ${filePath} with ${changesMade} pronunciation spacing corrections (르헌 -> 르 헌).`);
  } else {
    console.log(`No "르헌" pronunciations found or corrected for spacing in XR fields in ${filePath}.`);
  }

} catch (error) {
  console.error('Error processing the file:', error);
} 