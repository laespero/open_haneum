const fs = require('fs');
const path = require('path');

// 파일 경로를 직접 지정합니다.
const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');

try {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  if (data && Array.isArray(data.translatedLines)) {
    console.log(`T1 - E1 pairs from ${path.basename(filePath)}:\n`);
    data.translatedLines.forEach((line, lineIndex) => {
      if (line.LI && Array.isArray(line.LI)) {
        console.log(`--- Line ${lineIndex + 1} (T0: ${line.T0}) ---`);
        line.LI.forEach((item, itemIndex) => {
          console.log(`  ${itemIndex + 1}. T1: ${item.T1}`);
          console.log(`     E1: ${item.E1}\n`);
        });
      }
    });
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error(`Error processing the file ${filePath}:`, error);
} 