const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'yama_nova.json');

try {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.T1 && item.E1) {
            console.log(`T0: "${line.T0}"`);
            console.log(`  T1: "${item.T1}"`);
            console.log(`  E1: "${item.E1}"`);
            console.log('---');
          }
        });
      }
    });
    console.log('T1 and E1 extraction complete.');
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 