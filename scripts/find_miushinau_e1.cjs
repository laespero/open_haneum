const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_damashiai.json');
const searchKeywords = ['見失う', '見失わない', '잃어버리다', '놓치다']; // E1에서 찾을 키워드

try {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);
  let foundItems = 0;

  if (data && Array.isArray(data.translatedLines)) {
    console.log(`Searching for E1 descriptions related to [${searchKeywords.join(', ')}] in ${path.basename(filePath)}:\n`);
    data.translatedLines.forEach((line, lineIndex) => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach((item, itemIndex) => {
          if (item.E1 && typeof item.E1 === 'string') {
            const e1Lower = item.E1.toLowerCase(); // 대소문자 구분 없이 검색
            if (searchKeywords.some(keyword => e1Lower.includes(keyword.toLowerCase()))) {
              if (foundItems === 0) {
                console.log("Found potentially relevant E1 descriptions:\n");
              }
              foundItems++;
              console.log(`--- Item #${foundItems} (Line approx ${lineIndex + 1}, LI index ${itemIndex}) ---`);
              console.log(`  T0: ${line.T0}`);
              console.log(`  T1: ${item.T1}`);
              console.log(`  E1: ${item.E1}\n`);
            }
          }
        });
      }
    });

    if (foundItems === 0) {
      console.log('No E1 descriptions found matching the keywords.');
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error(`Error processing the file ${filePath}:`, error);
} 