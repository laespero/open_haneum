const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');

const targetT0 = "怒鳴りあいはおろか";
const targetT1 = "怒鳴りあい";
const oldK1 = "싸움";
const newK1 = "언쟁";

const targetT2 = "怒鳴り合う";
const oldK2 = "싸우다";
const newK2 = "언쟁하다";

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.T0 === targetT0 && line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.T1 === targetT1 && item.K1 === oldK1) {
            console.log(`- Updating K1 for T0: "${line.T0}", T1: "${item.T1}"`);
            console.log(`  Old K1: "${item.K1}"`);
            item.K1 = newK1;
            console.log(`  New K1: "${item.K1}"`);
            changesMade++;
          }
          if (item.T2 === targetT2 && item.K2 === oldK2) {
            console.log(`- Updating K2 for T0: "${line.T0}", T2: "${item.T2}"`);
            console.log(`  Old K2: "${item.K2}"`);
            item.K2 = newK2;
            console.log(`  New K2: "${item.K2}"`);
            changesMade++;
          }
        });
      }
    });

    if (changesMade > 0) {
      // Ensure both changes are counted if they happen in the same item
      // The current logic counts them separately, which is fine.
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} change(s).`);
    } else {
      console.log(`No changes needed for ${filePath}. Check if T0, T1/T2, and old K1/K2 values are correct or if they are already updated.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 