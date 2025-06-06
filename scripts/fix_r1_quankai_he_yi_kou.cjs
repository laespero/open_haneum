const fs = require('fs');
const path = require('path');

const targetFile = 'deep2_super_idol.json';
const filePath = path.join(__dirname, '..', 'songs', targetFile);

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;
  let r1Updated = false;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.T0 === "喝一口又活力全开") {
        if (line.LI && Array.isArray(line.LI)) {
          line.LI.forEach(item => {
            if (item.T1 === "全开") {
              if (item.R1 === "취앤카이") {
                item.R1 = "취엔카이";
                changesMade++;
                r1Updated = true;
                console.log(`Updated R1 for T1="${item.T1}" in T0="${line.T0}" from "취앤카이" to "취엔카이"`);
              } else if (item.R1 === "취엔카이") {
                console.log(`R1 for T1="${item.T1}" in T0="${line.T0}" is already "취엔카이". No change needed.`);
              } else {
                console.log(`R1 for T1="${item.T1}" in T0="${line.T0}" is "${item.R1}". Expected "취앤카이" or "취엔카이". No change made.`);
              }
            }
          });
        }
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${targetFile} with ${changesMade} changes.`);
      if (r1Updated) {
        console.log("- R1 for T1='全开' was updated.");
      }
    } else {
      console.log(`\nNo changes needed or target value not found in ${targetFile}.`);
    }

  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 