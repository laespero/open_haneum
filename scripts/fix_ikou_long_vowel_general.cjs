const fs = require('fs');
const path = require('path');
const glob = require('glob');

const songsDir = path.join(__dirname, '..', 'songs');
const targetVowel = '이코우';
const replacementVowel = '이코오';
// 제외할 단어 목록 (사이코우, 세이코우, 헤이코우 등)
const exclusionWords = ['사이코우', '세이코우', '헤이코우'];
let totalChangesMade = 0;

const files = glob.sync(path.join(songsDir, 'deep_*.json'));

files.forEach(filePath => {
  try {
    let rawData = fs.readFileSync(filePath, 'utf-8');
    let data = JSON.parse(rawData);
    let changesMadeInFile = 0;

    // 특정 구문 우선 처리 ("잇쇼 니 이코우 네"는 이미 fix_ikou_long_vowel_specific.cjs에서 처리됨)
    // 여기서는 일반적인 "이코우"를 처리하되, 제외 단어에 포함되지 않는 경우만 변경

    if (data && Array.isArray(data.translatedLines)) {
      data.translatedLines.forEach(line => {
        const fieldsToUpdate = ['R0', 'R1', 'R2', 'XR'];
        fieldsToUpdate.forEach(field => {
          if (line[field] && typeof line[field] === 'string') {
            let originalValue = line[field];
            let valueToProcess = originalValue;
            let modified = false;

            // 제외 단어가 포함된 경우, 해당 단어는 변경하지 않도록 임시로 치환
            const placeholders = [];
            exclusionWords.forEach((word, index) => {
              const placeholder = `__EXCLUDED_WORD_${index}__`;
              const regex = new RegExp(word, 'g');
              if (valueToProcess.includes(word)) {
                valueToProcess = valueToProcess.replace(regex, placeholder);
                placeholders.push({ placeholder, word });
              }
            });

            // "이코우"를 "이코오"로 변경
            if (valueToProcess.includes(targetVowel)) {
              valueToProcess = valueToProcess.replace(new RegExp(targetVowel, 'g'), replacementVowel);
              modified = true;
            }

            // 임시 치환된 단어들 복원
            placeholders.forEach(ph => {
              valueToProcess = valueToProcess.replace(new RegExp(ph.placeholder, 'g'), ph.word);
            });

            if (modified && originalValue !== valueToProcess) {
              line[field] = valueToProcess;
              console.log(`- File: ${path.basename(filePath)}, Field: ${field}, Original: "${originalValue}", New: "${line[field]}" (T0: "${line.T0}")`);
              changesMadeInFile++;
            }
          }
        });

        if (line.LI && Array.isArray(line.LI)) {
          line.LI.forEach(item => {
            fieldsToUpdate.forEach(field => {
              if (item[field] && typeof item[field] === 'string') {
                let originalValue = item[field];
                let valueToProcess = originalValue;
                let modified = false;

                const placeholders = [];
                exclusionWords.forEach((word, index) => {
                  const placeholder = `__EXCLUDED_WORD_${index}__`;
                  const regex = new RegExp(word, 'g');
                  if (valueToProcess.includes(word)) {
                    valueToProcess = valueToProcess.replace(regex, placeholder);
                    placeholders.push({ placeholder, word });
                  }
                });

                if (valueToProcess.includes(targetVowel)) {
                  valueToProcess = valueToProcess.replace(new RegExp(targetVowel, 'g'), replacementVowel);
                  modified = true;
                }

                placeholders.forEach(ph => {
                  valueToProcess = valueToProcess.replace(new RegExp(ph.placeholder, 'g'), ph.word);
                });

                if (modified && originalValue !== valueToProcess) {
                  item[field] = valueToProcess;
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
        console.log(`\nSuccessfully updated ${path.basename(filePath)} with ${changesMadeInFile} changes for '${targetVowel}' (excluding specified words).`);
        totalChangesMade += changesMadeInFile;
      }
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
});

if (totalChangesMade > 0) {
  console.log(`\nTotal ${totalChangesMade} changes made across all files for '${targetVowel}' (excluding specified words).`);
} else {
  console.log(`\nNo changes needed for '${targetVowel}' (excluding specified words) in any of the processed files.`);
} 