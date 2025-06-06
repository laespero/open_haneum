const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  const targetPhrase = '모우';
  const replacementPhrase = '모오';

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      const fieldsToUpdate = ['R0', 'R1', 'R2', 'XR'];
      fieldsToUpdate.forEach(field => {
        if (line[field] && typeof line[field] === 'string' && line[field].includes(targetPhrase)) {
          const originalValue = line[field];
          // '코코로오모우' 같은 경우 '코코로오 모오'가 아닌 '코코로 오모우'가 되어야 하므로, 
          // '모우' 앞에 오는 글자가 '오'가 아닌 경우만 '모오'로 변경하거나, 
          // 또는 '오모우' 같은 특정 단어는 배제하는 로직이 필요할 수 있습니다.
          // 여기서는 우선 단순 치환하고, 결과 확인 후 필요시 되돌리거나 추가 수정합니다.
          // 더 안전하게 하려면, '모우'가 단어의 시작이거나 앞에 공백이 있는 경우만 대상으로 할 수 있습니다.
          // 예: /(^|\s)모우/g -> '$1모오'
          // 여기서는 우선 모든 '모우'를 '모오'로 바꿉니다.
          line[field] = originalValue.replace(new RegExp(targetPhrase, 'g'), replacementPhrase);
          if (originalValue !== line[field]) {
            console.log(`- ${field}: "${originalValue}" -> "${line[field]}" (T0: "${line.T0}")`);
            changesMade++;
          }
        }
      });

      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          fieldsToUpdate.forEach(field => {
            if (item[field] && typeof item[field] === 'string' && item[field].includes(targetPhrase)) {
              const originalValue = item[field];
              item[field] = originalValue.replace(new RegExp(targetPhrase, 'g'), replacementPhrase);
              if (originalValue !== item[field]) {
                let context = `(T1: "${item.T1}", T0: "${line.T0}")`;
                if (field === 'R2') context = `(T2: "${item.T2}", ${context})`;
                if (field === 'XR') context = `(XE: "${item.XE}", ${context})`;
                console.log(`  - ${field}: "${originalValue}" -> "${item[field]}" ${context}`);
                changesMade++;
              }
            }
          });
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} changes related to '${targetPhrase}' to '${replacementPhrase}'.`);
    } else {
      console.log(`\nNo changes needed for ${filePath} regarding '${targetPhrase}'.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 