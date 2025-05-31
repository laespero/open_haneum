const fs = require('fs');
const path = require('path');

const targetFile = 'deep2_super_idol.json';
const filePath = path.join(__dirname, '..', 'songs', targetFile);

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;
  let r1Updated = false;
  let xrUpdated = false;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.T0 === "都没你的甜") {
        if (line.LI && Array.isArray(line.LI)) {
          line.LI.forEach(item => {
            if (item.T1 === "甜") {
              // Update R1
              if (item.R1 === "티엔") {
                item.R1 = "톈";
                changesMade++;
                r1Updated = true;
                console.log(`Updated R1 for T1="甜" in T0="${line.T0}" from "티엔" to "톈"`);
              } else if (item.R1 === "톈") {
                console.log(`R1 for T1="甜" in T0="${line.T0}" is already "톈". No change needed.`);
              } else {
                console.log(`Unexpected R1 value "${item.R1}" for T1="甜" in T0="${line.T0}". Expected "티엔" or "톈".`);
              }

              // Update XR
              if (item.XE === "这个苹果很甜。" && item.XR === "저거 핑궈 헌 티앤") {
                item.XR = "저거 핑궈 헌 톈";
                changesMade++;
                xrUpdated = true;
                console.log(`Updated XR for T1="甜" in T0="${line.T0}" from "저거 핑궈 헌 티앤" to "저거 핑궈 헌 톈"`);
              } else if (item.XE === "这个苹果很甜。" && item.XR === "저거 핑궈 헌 톈") {
                console.log(`XR for T1="甜" in T0="${line.T0}" is already "저거 핑궈 헌 톈". No change needed.`);
              } else {
                console.log(`Unexpected XR value "${item.XR}" or XE value "${item.XE}" for T1="甜" in T0="${line.T0}".`);
              }
            }
          });
        }
      }
    });
  }

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\nSuccessfully updated ${filePath} with ${changesMade} change(s).`);
  } else {
    console.log(`\nNo changes made to the file. R1 was ${r1Updated ? 'not "티엔"' : 'already "톈" or not found'}. XR was ${xrUpdated ? 'not "저거 핑궈 헌 티앤"' : 'already "저거 핑궈 헌 톈" or not found'}.`);
  }

} catch (error) {
  console.error(`Error processing file ${targetFile}:`, error);
} 