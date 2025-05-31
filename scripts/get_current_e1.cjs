const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_damashiai.json');
const targetT0 = "もう見失わないから";
const targetT1 = "見失わ";

try {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);
  let foundE1 = null;

  if (data && Array.isArray(data.translatedLines)) {
    for (const line of data.translatedLines) {
      if (line.T0 === targetT0 && line.LI && Array.isArray(line.LI)) {
        for (const item of line.LI) {
          if (item.T1 === targetT1) {
            foundE1 = item.E1;
            break;
          }
        }
      }
      if (foundE1) break;
    }
  }

  if (foundE1) {
    console.log('Current E1 value:');
    console.log(foundE1);
  } else {
    console.log(`E1 not found for T0: "${targetT0}", T1: "${targetT1}"`);
  }

} catch (error) {
  console.error('Error reading E1:', error);
} 