const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep2_super_idol.json');

try {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach((line, index) => {
      console.log(`Line ${index + 1}:`);
      console.log(`  T0 (Original Lyrics): "${line.T0}"`);
      console.log(`  R0 (Korean Romanization): "${line.R0}"`);
      console.log('---');
    });
    console.log('\nFinished printing T0-R0 pairs.');
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }

} catch (error) {
  console.error('Error processing the file:', error);
} 