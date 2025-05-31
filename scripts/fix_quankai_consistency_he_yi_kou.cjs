const fs = require('fs');
const path = require('path');

const targetFile = 'deep2_super_idol.json';
const filePath = path.join(__dirname, '..', 'songs', targetFile);

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;
  let r0Updated = false;
  let r2Updated = false;
  let xrUpdated = false;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.T0 === "喝一口又活力全开") {
        // 1. Update R0
        if (line.R0 === "허 이 커우 요우 후어리 취엔 카이") {
          line.R0 = "허 이 커우 요우 후어리 취엔카이";
          changesMade++;
          r0Updated = true;
          console.log(`Updated R0 for T0="${line.T0}" to "${line.R0}"`);
        } else if (line.R0 === "허 이 커우 요우 후어리 취엔카이") {
          console.log(`R0 for T0="${line.T0}" is already "허 이 커우 요우 후어리 취엔카이". No change needed.`);
        } else {
          console.log(`R0 for T0="${line.T0}" is "${line.R0}". Expected "허 이 커우 요우 후어리 취엔 카이" or "허 이 커우 요우 후어리 취엔카이". No change made for R0.`);
        }

        // 2. Update R2 and XR for T1="全开"
        if (line.LI && Array.isArray(line.LI)) {
          line.LI.forEach(item => {
            if (item.T1 === "全开") {
              // Update R2
              if (item.R2 === "취앤 카이") {
                item.R2 = "취엔카이";
                changesMade++;
                r2Updated = true;
                console.log(`Updated R2 for T1="${item.T1}" in T0="${line.T0}" to "${item.R2}"`);
              } else if (item.R2 === "취엔카이") {
                console.log(`R2 for T1="${item.T1}" in T0="${line.T0}" is already "취엔카이". No change needed.`);
              } else {
                console.log(`R2 for T1="${item.T1}" in T0="${line.T0}" is "${item.R2}". Expected "취앤 카이" or "취엔카이". No change made for R2.`);
              }

              // Update XR for XE="花儿全开了。"
              if (item.XE === "花儿全开了。" && item.XR === "화 얼 취앤 카이 러") {
                item.XR = "화 얼 취엔카이 러";
                changesMade++;
                xrUpdated = true;
                console.log(`Updated XR for XE="${item.XE}" in T0="${line.T0}" to "${item.XR}"`);
              } else if (item.XE === "花儿全开了。" && item.XR === "화 얼 취엔카이 러") {
                console.log(`XR for XE="${item.XE}" in T0="${line.T0}" is already "화 얼 취엔카이 러". No change needed.`);
              } else {
                console.log(`XR for XE="${item.XE}" is "${item.XR}". Expected "화 얼 취앤 카이 러" or "화 얼 취엔카이 러". No change made for XR.`);
              }
            }
          });
        }
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${targetFile} with ${changesMade} changes.`);
      if (r0Updated) console.log("- R0 was updated.");
      if (r2Updated) console.log("- R2 for T1='全开' was updated.");
      if (xrUpdated) console.log("- XR for XE='花儿全开了。' was updated.");
    } else {
      console.log(`\nNo changes needed or target values not found in ${targetFile}.`);
    }

  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 