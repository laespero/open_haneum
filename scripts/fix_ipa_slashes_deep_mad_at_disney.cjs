const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_mad_at_disney.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  const stripSlashes = (ipaString) => {
    if (typeof ipaString === 'string' && ipaString.startsWith('/') && ipaString.endsWith('/')) {
      return ipaString.substring(1, ipaString.length - 1);
    }
    return ipaString;
  };

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.I0 && line.I0 !== stripSlashes(line.I0)) {
        line.I0 = stripSlashes(line.I0);
        changesMade++;
        console.log(`Modified I0 for T0: "${line.T0}" to "${line.I0}"`);
      }

      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          let itemModified = false;
          if (item.I1 && item.I1 !== stripSlashes(item.I1)) {
            item.I1 = stripSlashes(item.I1);
            itemModified = true;
          }
          if (item.I2 && item.I2 !== stripSlashes(item.I2)) {
            item.I2 = stripSlashes(item.I2);
            itemModified = true;
          }
          if (item.XI && item.XI !== stripSlashes(item.XI)) {
            item.XI = stripSlashes(item.XI);
            itemModified = true;
          }
          if (itemModified) {
            changesMade++;
            console.log(`Modified IPA fields for T1: "${item.T1}" in T0: "${line.T0}"`);
          }
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} IPA slash stripping changes.`);
    } else {
      console.log(`\nNo IPA slash stripping changes needed for ${filePath}.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 