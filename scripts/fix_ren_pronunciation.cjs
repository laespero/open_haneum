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
          // XE가 "这里人很多。" 이고 XR이 "저 리 르 헌 두어"인 경우 "저 리 런 헌 두어"로 수정
          if (item.XE === "这里人很多。" && item.XR === "저 리 르 헌 두어") {
            const originalXR = item.XR;
            item.XR = "저 리 런 헌 두어";
            changesMade++;
            console.log(`Corrected XR for XE: "${item.XE}" from "${originalXR}" to "${item.XR}"`);
          }
        });
      }
    });
  }

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Successfully updated ${filePath} with ${changesMade} corrections for 'rén' pronunciation.`);
  } else {
    console.log(`No 'rén' pronunciation corrections needed or XR fields did not match in ${filePath}.`);
  }

} catch (error) {
  console.error('Error processing the file:', error);
} 