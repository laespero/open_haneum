const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep2_super_idol.json');
const targetXE = "你多大了？";
const correctXR = "니 뚜오 따 러"; // 또는 "니 두오 따 러"

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.XE === targetXE && item.XR !== correctXR) {
            console.log(`Updating XR for XE: "${item.XE}"`);
            console.log(`  Old XR: "${item.XR}"`);
            item.XR = correctXR;
            console.log(`  New XR: "${item.XR}"`);
            changesMade++;
          }
        });
      }
    });
  }

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Successfully updated ${filePath} with ${changesMade} change(s).`);
  } else {
    console.log(`No changes needed for XR in XE: "${targetXE}". It might already be correct or the example was not found.`);
  }

} catch (error) {
  console.error('Error processing the file:', error);
} 