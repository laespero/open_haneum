const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_mad_at_disney.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  const targetT0 = "But now I'm twenty-something";
  const targetT1 = "twenty-something";
  const targetXE = "She's in her twenty-something.";
  const newXK = "그녀는 20대야.";

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.T0 === targetT0 && line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.T1 === targetT1 && item.XE === targetXE) {
            if (item.XK !== newXK) {
              console.log(`Updating XK for T1: "${item.T1}", XE: "${item.XE}" in T0: "${line.T0}".`);
              console.log(`  Old XK: "${item.XK}" -> New XK: "${newXK}"`);
              item.XK = newXK;
              changesMade++;
            }
          }
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} changes for 'twenty-something' example translation.`);
    } else {
      console.log(`\nNo changes needed for 'twenty-something' example translation in T0: "${targetT0}". Item not found or already correct.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 