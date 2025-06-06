const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_world_you_desire.json');
const punctuationRegex = /^[\.\?!,~\uff0c\u3002\uff1f\uff01]$/; // .,?!~，。？！

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.LI && Array.isArray(line.LI)) {
        const originalLiLength = line.LI.length;
        line.LI = line.LI.filter(item => {
          if (item.T1 && punctuationRegex.test(item.T1)) {
            console.log(`- Removing LI item with T1: "${item.T1}" from T0: "${line.T0}"`);
            changesMade++;
            return false; // 이 항목을 제거
          }
          return true; // 이 항목을 유지
        });
        if (line.LI.length !== originalLiLength) {
          console.log(`  Original LI count: ${originalLiLength}, New LI count: ${line.LI.length} for T0: "${line.T0}"`);
        }
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Successfully updated ${filePath} with ${changesMade} LI items removed.`);
    } else {
      console.log(`No LI items matching punctuation criteria found in ${filePath}.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 