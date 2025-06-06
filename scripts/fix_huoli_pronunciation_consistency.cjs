const fs = require('fs');
const path = require('path');

const targetFile = 'deep2_super_idol.json';
const filePath = path.join(__dirname, '..', 'songs', targetFile);

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;
  let r2Updated = false;
  let xrUpdated = false;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.T0 === "喝一口又活力全开") {
        if (line.LI && Array.isArray(line.LI)) {
          line.LI.forEach(item => {
            if (item.T1 === "活力") {
              // 1. Update R2
              if (item.R2 === "훠리") {
                item.R2 = "후어리";
                changesMade++;
                r2Updated = true;
                console.log(`Updated R2 for T1="${item.T1}" in T0="${line.T0}" from "훠리" to "후어리"`);
              } else if (item.R2 === "후어리") {
                console.log(`R2 for T1="${item.T1}" in T0="${line.T0}" is already "후어리". No change needed.`);
              } else {
                console.log(`R2 for T1="${item.T1}" in T0="${line.T0}" is "${item.R2}". Expected "훠리" or "후어리". No change made for R2.`);
              }

              // 2. Update XR for XE="这个城市充满了活力。"
              if (item.XE === "这个城市充满了活力。" && item.XR === "저거 청스 충만 러 훠리") {
                item.XR = "저거 청스 충만 러 후어리";
                changesMade++;
                xrUpdated = true;
                console.log(`Updated XR for XE="${item.XE}" in T0="${line.T0}" from "저거 청스 충만 러 훠리" to "저거 청스 충만 러 후어리"`);
              } else if (item.XE === "这个城市充满了活力。" && item.XR === "저거 청스 충만 러 후어리") {
                console.log(`XR for XE="${item.XE}" in T0="${line.T0}" is already "저거 청스 충만 러 후어리". No change needed.`);
              } else {
                console.log(`For T1="${item.T1}", XE="${item.XE}", current XR is "${item.XR}". Expected XR to be "저거 청스 충만 러 훠리" or "저거 청스 충만 러 후어리". No change made for XR.`);
              }
            }
          });
        }
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${targetFile} with ${changesMade} changes.`);
      if (r2Updated) console.log("- R2 for T1='活力' was updated.");
      if (xrUpdated) console.log("- XR for XE='这个城市充满了活力。' was updated.");
    } else {
      console.log(`\nNo changes needed or target values not found in ${targetFile}.`);
    }

  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 