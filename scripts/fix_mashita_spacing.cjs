const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  // 정규식: 한글 음절 다음에 '마시타'가 붙어있는 경우를 찾습니다.
  const regex = /([가-힣]+)(마시타)/g;
  const replacementPattern = '$1 $2';

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      const fieldsToUpdate = ['R0', 'R1', 'R2', 'XR'];
      fieldsToUpdate.forEach(field => {
        if (line[field] && typeof line[field] === 'string' && line[field].match(regex)) {
          const originalValue = line[field];
          // 이미 띄어쓰기가 되어 있는 경우는 제외
          if (!originalValue.match(/([가-힣]+)\s+(마시타)/g) && originalValue.match(regex)) {
            line[field] = originalValue.replace(regex, replacementPattern);
            if (originalValue !== line[field]) {
              console.log(`- ${field}: "${originalValue}" -> "${line[field]}" (T0: "${line.T0}")`);
              changesMade++;
            }
          }
        }
      });

      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          fieldsToUpdate.forEach(field => {
            if (item[field] && typeof item[field] === 'string' && item[field].match(regex)) {
              const originalValue = item[field];
              if (!originalValue.match(/([가-힣]+)\s+(마시타)/g) && originalValue.match(regex)) {
                 item[field] = originalValue.replace(regex, replacementPattern);
                 if (originalValue !== item[field]) {
                    let context = `(T1: "${item.T1}", T0: "${line.T0}")`;
                    if (field === 'R2') context = `(T2: "${item.T2}", ${context})`;
                    if (field === 'XR') context = `(XE: "${item.XE}", ${context})`;
                    console.log(`  - ${field}: "${originalValue}" -> "${item[field]}" ${context}`);
                    changesMade++;
                 }
              }
            }
          });
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} changes related to '마시타' spacing.`);
    } else {
      console.log(`\nNo changes needed for ${filePath} regarding '마시타' spacing.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 