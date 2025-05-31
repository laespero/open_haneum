const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_song_has_no_form.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  const targetPhrase = '노리오쿠레테';
  const replacementPhrase = '노리 오쿠레테';

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.R0) {
        const originalR0 = line.R0;
        if (line.R0.includes(targetPhrase)) {
          line.R0 = line.R0.replace(new RegExp(targetPhrase, 'g'), replacementPhrase);
          if (originalR0 !== line.R0) {
            console.log(`- R0: "${originalR0}" -> "${line.R0}" (T0: "${line.T0}")`);
            changesMade++;
          }
        }
      }

      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.R1) {
            const originalR1 = item.R1;
            if (item.R1.includes(targetPhrase)) {
              item.R1 = item.R1.replace(new RegExp(targetPhrase, 'g'), replacementPhrase);
              if (originalR1 !== item.R1) {
                console.log(`  - R1: "${originalR1}" -> "${item.R1}" (T1: "${item.T1}", T0: "${line.T0}")`);
                changesMade++;
              }
            }
          }
          if (item.R2) {
            const originalR2 = item.R2;
            if (item.R2.includes(targetPhrase)) {
              item.R2 = item.R2.replace(new RegExp(targetPhrase, 'g'), replacementPhrase);
              if (originalR2 !== item.R2) {
                console.log(`    - R2: "${originalR2}" -> "${item.R2}" (T2: "${item.T2}", T1: "${item.T1}", T0: "${line.T0}")`);
                changesMade++;
              }
            }
          }
          if (item.XR) {
            const originalXR = item.XR;
            if (item.XR.includes(targetPhrase)) {
              item.XR = item.XR.replace(new RegExp(targetPhrase, 'g'), replacementPhrase);
              if (originalXR !== item.XR) {
                console.log(`    - XR: "${originalXR}" -> "${item.XR}" (XE: "${item.XE}", T1: "${item.T1}", T0: "${line.T0}")`);
                changesMade++;
              }
            }
          }
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} changes related to '${targetPhrase}'.`);
    } else {
      console.log(`\nNo changes needed for ${filePath} regarding '${targetPhrase}'.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 