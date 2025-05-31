const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep2_super_idol.json');
const targetXE = "你多大了？";

try {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);
  let found = false;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.XE === targetXE) {
            console.log(`Found in T0: "${line.T0}"`);
            console.log(`  T1: "${item.T1}"`);
            console.log(`  XE: "${item.XE}"`);
            console.log(`  XK: "${item.XK}"`);
            console.log(`  XI: "${item.XI}"`);
            console.log(`  XR: "${item.XR}"`);
            found = true;
          }
        });
      }
    });
  }

  if (!found) {
    console.log(`Example sentence "${targetXE}" not found.`);
  }

} catch (error) {
  console.error('Error processing the file:', error);
} 