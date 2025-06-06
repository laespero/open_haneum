const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  const targetPhrase = '사라케다스';
  const replacementPhrase = '사라케 다스';
  
  // 구체적인 문장 전체를 타겟팅하여 정확도를 높일 수 있습니다.
  const specificSentenceTarget = '혼네 오 사라케다스';
  const specificSentenceReplacement = '혼네 오 사라케 다스';

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      const fieldsToUpdate = ['R0', 'R1', 'R2', 'XR'];
      fieldsToUpdate.forEach(field => {
        if (line[field] && typeof line[field] === 'string') {
          const originalValue = line[field];
          // 특정 문장 전체를 대상으로 우선 변경 시도
          if (originalValue.includes(specificSentenceTarget)) {
            line[field] = originalValue.replace(new RegExp(specificSentenceTarget, 'g'), specificSentenceReplacement);
          } 
          // 만약 특정 문장으로 찾지 못했다면, '사라케다스' 단독으로도 변경 시도 (주의: 다른 문맥에서 의도치 않게 변경될 수 있음)
          else if (originalValue.includes(targetPhrase)) {
             // 이 경우는 좀 더 주의가 필요하므로, 우선은 특정 문장만 처리하도록 주석 처리
            // line[field] = originalValue.replace(new RegExp(targetPhrase, 'g'), replacementPhrase);
          }

          if (originalValue !== line[field]) {
            console.log(`- ${field}: "${originalValue}" -> "${line[field]}" (T0: "${line.T0}")`);
            changesMade++;
          }
        }
      });

      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          fieldsToUpdate.forEach(field => {
            if (item[field] && typeof item[field] === 'string') {
              const originalValue = item[field];
              if (item[field].includes(specificSentenceTarget)) {
                item[field] = item[field].replace(new RegExp(specificSentenceTarget, 'g'), specificSentenceReplacement);
              }
              else if (item[field].includes(targetPhrase)) {
                // item[field] = item[field].replace(new RegExp(targetPhrase, 'g'), replacementPhrase);
              }

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
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} changes related to '${specificSentenceTarget}'.`);
    } else {
      console.log(`\nNo changes needed for ${filePath} regarding '${specificSentenceTarget}'.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 