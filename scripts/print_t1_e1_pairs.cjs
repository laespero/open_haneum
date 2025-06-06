const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_mad_at_disney.json');

try {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  if (data && Array.isArray(data.translatedLines)) {
    console.log('\n--- All T1 (Morpheme) - E1 (Explanation) Pairs ---');
    data.translatedLines.forEach((line, lineIndex) => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach((item, itemIndex) => {
          const t1 = item.T1 || '(T1 not found)';
          const e1 = item.E1 || '(E1 not found)';
          console.log(`[Line T0: "${line.T0}"]`);
          console.log(`  T1: ${t1}`);
          console.log(`  E1: ${e1}`);
          console.log('  ---');
        });
      }
    });
    console.log('\n--- End of Pairs ---');
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 