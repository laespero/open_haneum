const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_damashiai.json');
const outputDir = path.join(__dirname, '..', 'reports');
const outputFile = path.join(outputDir, 'damashiai_word_example_pairs.txt');

try {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);
  let pairCount = 0;
  let outputString = '--- T1 (Original Word) - K1 (Korean Word) --- XE (Original Example) - XK (Korean Example) --- Pairs from deep_damashiai.json ---\n\n';

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.T1 && item.XE) { // K1, XK는 없을 수도 있으므로 T1, XE만 체크
            outputString += `T0: ${line.T0}\n`;
            outputString += `  T1: ${item.T1} / K1: ${item.K1 || 'N/A'}\n`;
            outputString += `  XE: ${item.XE}\n`;
            outputString += `  XK: ${item.XK || 'N/A'}\n`;
            outputString += '---\n';
            pairCount++;
          }
        });
      }
    });
    outputString += `\nFound ${pairCount} T1/XE pairs with their K1/XK translations.\n`;
    fs.writeFileSync(outputFile, outputString, 'utf-8');
    console.log(`Successfully wrote ${pairCount} pairs to ${outputFile}`);

  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
    outputString += 'Error: Could not find translatedLines array or data structure is not as expected.\n';
    fs.writeFileSync(outputFile, outputString, 'utf-8');
  }

} catch (error) {
  console.error('Error processing the file:', error);
  let errorString = 'Error processing the file:\n' + error.stack;
  fs.writeFileSync(outputFile, errorString, 'utf-8');
} 