const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');
const searchTerms = ["怒鳴りあい", "怒鳴り合う"];

try {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);
  let foundItems = 0;

  if (data && Array.isArray(data.translatedLines)) {
    console.log(`Occurrences of ${searchTerms.join(' or ')} in T1/T2 fields and their K1/K2 translations in ${path.basename(filePath)}:\n`);
    data.translatedLines.forEach((line, lineIndex) => {
      if (line.LI && Array.isArray(line.LI)) {
        let printedLineHeader = false;
        line.LI.forEach((item, itemIndex) => {
          let matchFound = false;
          let tField = '';
          let kField = '';
          let tValue = '';
          let kValue = '';

          if (searchTerms.includes(item.T1)) {
            matchFound = true;
            tField = 'T1';
            kField = 'K1';
            tValue = item.T1;
            kValue = item.K1;
          } else if (item.T2 && searchTerms.includes(item.T2)) {
            matchFound = true;
            tField = 'T2';
            kField = 'K2';
            tValue = item.T2;
            kValue = item.K2;
          }

          if (matchFound) {
            if (!printedLineHeader) {
              console.log(`--- Line ${lineIndex + 1} (T0: ${line.T0}) ---`);
              printedLineHeader = true;
            }
            console.log(`  Item ${itemIndex + 1}:`);
            console.log(`    ${tField}: ${tValue}`);
            console.log(`    ${kField}: ${kValue}`);
            if (tField === 'T1' && item.T2) { // Show T2/K2 if T1 matched and T2 exists
                console.log(`    T2: ${item.T2}`);
                console.log(`    K2: ${item.K2}`);
            }
             if (tField === 'T2' && item.T1) { // Show T1/K1 if T2 matched and T1 exists
                console.log(`    T1: ${item.T1}`);
                console.log(`    K1: ${item.K1}`);
            }
            console.log(''); // Newline for readability
            foundItems++;
          }
        });
      }
    });
    if (foundItems === 0) {
        console.log(`No occurrences found for ${searchTerms.join(' or ')} in T1/T2 fields.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error(`Error processing the file ${filePath}:`, error);
} 