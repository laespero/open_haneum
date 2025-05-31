const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  // 수정 대상 사자성어와 변경될 형태 정의
  const yojiJukugoPatterns = [
    { target: '잇쇼우켄메이', replacement: '잇쇼우 켄메이' },
    // 다른 사자성어 패턴들을 여기에 추가할 수 있습니다.
    // 예: { target: '일기일회', replacement: '일기 일회' } 
    // (원문 한자와 한글 발음이 정확히 일치하는지 확인 필요)
  ];

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      const fieldsToUpdate = ['R0', 'R1', 'R2', 'XR'];
      
      fieldsToUpdate.forEach(field => {
        if (line[field] && typeof line[field] === 'string') {
          let originalValue = line[field];
          let modifiedValue = originalValue;

          yojiJukugoPatterns.forEach(pattern => {
            if (modifiedValue.includes(pattern.target)) {
              modifiedValue = modifiedValue.replace(new RegExp(pattern.target, 'g'), pattern.replacement);
            }
          });

          if (originalValue !== modifiedValue) {
            console.log(`- ${field}: "${originalValue}" -> "${modifiedValue}" (T0: "${line.T0}")`);
            line[field] = modifiedValue;
            changesMade++;
          }
        }
      });

      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          fieldsToUpdate.forEach(field => {
            if (item[field] && typeof item[field] === 'string') {
              let originalValue = item[field];
              let modifiedValue = originalValue;

              yojiJukugoPatterns.forEach(pattern => {
                if (modifiedValue.includes(pattern.target)) {
                  modifiedValue = modifiedValue.replace(new RegExp(pattern.target, 'g'), pattern.replacement);
                }
              });

              if (originalValue !== modifiedValue) {
                let context = `(T1: "${item.T1}", T0: "${line.T0}")`;
                if (field === 'R2') context = `(T2: "${item.T2}", ${context})`;
                if (field === 'XR') context = `(XE: "${item.XE}", ${context})`;
                console.log(`  - ${field}: "${originalValue}" -> "${modifiedValue}" ${context}`);
                item[field] = modifiedValue;
                changesMade++;
              }
            }
          });
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} changes related to yojijukugo spacing.`);
    } else {
      console.log(`\nNo changes needed for ${filePath} regarding specified yojijukugo spacing.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 