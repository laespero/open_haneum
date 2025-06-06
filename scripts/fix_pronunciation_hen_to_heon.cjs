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
            // "헨"을 "헌"으로 수정합니다. "르헨"의 경우 "르헌"으로 바르게 수정되도록 합니다.
            let newXR = originalXR;
            if (newXR.includes("르헨")) {
                newXR = newXR.replace(/르헨/g, "르헌");
            }
            if (newXR.includes("헨")) {
                newXR = newXR.replace(/헨/g, "헌");
            }

            if (originalXR !== newXR) {
              item.XR = newXR;
              changesMade++;
              console.log(`Corrected XR in T0: "${line.T0}", T1: "${item.T1 || (item.T2 || '')}" from "${originalXR}" to "${item.XR}"`);
            }
          }
        });
      }
    });
  }

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Successfully updated ${filePath} with ${changesMade} pronunciation corrections (헨 -> 헌).`);
  } else {
    console.log(`No "헨" pronunciations found or corrected in XR fields in ${filePath}.`);
  }

} catch (error) {
  console.error('Error processing the file:', error);
} 