const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  const targetPhrase = '코코로가케요오';
  const replacementPhrase = '코코로 가케요오';

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      const fieldsToUpdate = ['R0', 'R1', 'R2', 'XR'];
      fieldsToUpdate.forEach(field => {
        if (line[field] && typeof line[field] === 'string' && line[field].includes(targetPhrase)) {
          const originalValue = line[field];
          line[field] = originalValue.replace(new RegExp(targetPhrase, 'g'), replacementPhrase);
          if (originalValue !== line[field]) {
            console.log(`- ${field}: "${originalValue}" -> "${line[field]}" (T0: "${line.T0}")`);
            changesMade++;
          }
        }
      });

      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          fieldsToUpdate.forEach(field => {
            if (item[field] && typeof item[field] === 'string' && item[field].includes(targetPhrase)) {
              const originalValue = item[field];
              item[field] = originalValue.replace(new RegExp(targetPhrase, 'g'), replacementPhrase);
              if (originalValue !== item[field]) {
                let context = `(T1: "${item.T1}", T0: "${line.T0}")`;
                if (field === 'R2') context = `(T2: "${item.T2}", ${context})`;
                if (field === 'XR') context = `(XE: "${item.XE}", ${context})`;
                console.log(`  - ${field}: "${originalValue}" -> "${item[field]}" ${context}`);
                changesMade++;
              }
            }
          });
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