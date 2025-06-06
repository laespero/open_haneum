const fs = require('fs');
const path = require('path');

// 파일 경로를 직접 지정합니다.
const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');

try {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  if (data && Array.isArray(data.translatedLines)) {
    console.log(`T0 - K0 pairs from ${path.basename(filePath)}:\n`);
    data.translatedLines.forEach((line, index) => {
      console.log(`${index + 1}. T0: ${line.T0}`);
      console.log(`   K0: ${line.K0}\n`);
    });
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error(`Error processing the file ${filePath}:`, error);
} 