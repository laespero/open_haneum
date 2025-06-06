const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'v7_27do.json');

try {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach((line, index) => {
      console.log(`--- Lyric Pair ${index + 1} ---`);
      console.log(`T0 (Original): ${line.T0}`);
      console.log(`K0 (Korean):  ${line.K0}`);
      console.log('\n'); // Add a newline for better readability
    });
    console.log(`Successfully printed all ${data.translatedLines.length} lyric pairs.`);
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 