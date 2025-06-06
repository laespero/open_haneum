const fs = require('fs');
const path = require('path');
const glob = require('glob');

const songsDir = path.join(__dirname, '..', 'songs');
const targetPhrase = '아이마쇼오';
const replacementPhrase = '아이 마쇼오';
let totalChangesMade = 0;

// songs 디렉토리 내의 모든 deep_*.json 파일을 찾습니다.
const files = glob.sync(path.join(songsDir, 'deep_*.json'));

files.forEach(filePath => {
  try {
    let rawData = fs.readFileSync(filePath, 'utf-8');
    let data = JSON.parse(rawData);
    let changesMadeInFile = 0;

    if (data && Array.isArray(data.translatedLines)) {
      data.translatedLines.forEach(line => {
        const fieldsToUpdate = ['R0', 'R1', 'R2', 'XR'];
        fieldsToUpdate.forEach(field => {
          if (line[field] && typeof line[field] === 'string' && line[field].includes(targetPhrase)) {
            const originalValue = line[field];
            line[field] = originalValue.replace(new RegExp(targetPhrase, 'g'), replacementPhrase);
            if (originalValue !== line[field]) {
              console.log(`- File: ${path.basename(filePath)}, Field: ${field}, Original: "${originalValue}", New: "${line[field]}" (T0: "${line.T0}")`);
              changesMadeInFile++;
            }
          }
        });

        if (line.LI && Array.isArray(line.LI)) {
          line.LI.forEach(item => {
            fieldsToUpdate.forEach(field => {
              if (item[field] && typeof item[field] === 'string' && item[field].includes(targetPhrase)) {
                const originalValue = item[field];
                item[field] = item[field].replace(new RegExp(targetPhrase, 'g'), replacementPhrase);
                if (originalValue !== item[field]) {
                  let context = `(T1: "${item.T1}", T0: "${line.T0}")`;
                  if (field === 'R2') context = `(T2: "${item.T2}", ${context})`;
                  if (field === 'XR') context = `(XE: "${item.XE}", ${context})`;
                  console.log(`  - File: ${path.basename(filePath)}, Field: ${field}, Original: "${originalValue}", New: "${item[field]}" ${context}`);
                  changesMadeInFile++;
                }
              }
            });
          });
        }
      });

      if (changesMadeInFile > 0) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`\nSuccessfully updated ${path.basename(filePath)} with ${changesMadeInFile} changes for '${targetPhrase}'.`);
        totalChangesMade += changesMadeInFile;
      }
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
});

if (totalChangesMade > 0) {
  console.log(`\nTotal ${totalChangesMade} changes made across all files for '${targetPhrase}'.`);
} else {
  console.log(`\nNo changes needed for '${targetPhrase}' in any of the processed files.`);
} 