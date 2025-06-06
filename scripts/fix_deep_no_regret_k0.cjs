const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');
const targetT0 = "一生懸命お洒落して";
const newK0 = "열심히 잘 꾸미고";

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.T0 === targetT0 && line.K0 !== newK0) {
        console.log(`- Updating K0 for T0: "${line.T0}". Old: "${line.K0}", New: "${newK0}"`);
        line.K0 = newK0;
        changesMade++;
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Successfully updated ${filePath} with ${changesMade} change(s).`);
    } else {
      console.log(`No changes needed for ${filePath}. Target T0: "${targetT0}", Current K0 might already be "${newK0}" or T0 not found.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 