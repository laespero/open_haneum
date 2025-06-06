const fs = require('fs');
const filePath = './songs/deep_androp_koi.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let found = false;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.T0 && line.T0.includes("いつも隣にいるのは")) { // .includes()로 조건 완화
        console.log(`Found T0 line: "${line.T0}"`);
        if (line.LI && Array.isArray(line.LI)) {
          line.LI.forEach(item => {
            if (item.T1 === "の") {
              found = true;
              console.log(`  Found T1:"の" with`);
              console.log(`    XE: "${item.XE}"`);
              console.log(`    XK: "${item.XK}"`);
            }
          });
        }
      }
    });
    if (!found) {
        console.log("T0 containing 'いつも隣にいるのは' with T1:'の' not found.");
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 