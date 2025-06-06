const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_damashiai.json');
const targetT1 = "迷い込み";

try {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);
  let foundItems = [];

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.T1 === targetT1) {
            foundItems.push({
              T0: line.T0, // 컨텍스트를 위한 T0 값
              ...item
            });
          }
        });
      }
    });
  }

  if (foundItems.length > 0) {
    console.log(`Found ${foundItems.length} item(s) with T1: "${targetT1}"\n`);
    foundItems.forEach(item => {
      console.log(`Associated T0: "${item.T0}"`);
      console.log(`T1: ${item.T1}`);
      console.log(`K1: ${item.K1}`);
      console.log(`I1: ${item.I1}`);
      console.log(`R1: ${item.R1}`);
      console.log(`E1: ${item.E1}`);
      console.log(`T2: ${item.T2}`);
      console.log(`K2: ${item.K2}`);
      console.log(`I2: ${item.I2}`);
      console.log(`R2: ${item.R2}`);
      console.log(`XE: ${item.XE}`);
      console.log(`XK: ${item.XK}`);
      console.log(`XI: ${item.XI}`);
      console.log(`XR: ${item.XR}`);
      console.log('--------------------');
    });
  } else {
    console.log(`No items found with T1: "${targetT1}"`);
  }

} catch (error) {
  console.error('Error processing the file:', error);
} 