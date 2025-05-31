const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  // 정규식: 단어 경계((\b) 또는 非단어문자 (\B))와 '타이' 사이에 있는 한글 음절((\S+) 또는 [가-힣]+)을 찾습니다.
  // (\S+)타이 -> $1 타이 (공백 추가)
  // 스크립트가 '나리타이'를 '나리 타이'로 바꾸고, '아이타이'를 '아이 타이'로 바꿀 수 있도록 합니다.
  // 좀 더 안전하게 하려면, '타이'가 문장 끝에 오거나 특정 조사 앞에 오는 경우 등으로 제한할 수 있으나,
  // 우선은 넓은 범위로 적용합니다.
  const regex = /([가-힣]+)(타이)/g;
  const replacementPattern = '$1 $2';

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      const fieldsToUpdate = ['R0', 'R1', 'R2', 'XR'];
      fieldsToUpdate.forEach(field => {
        if (line[field] && typeof line[field] === 'string' && line[field].match(regex)) {
          const originalValue = line[field];
          // 이미 띄어쓰기가 되어 있는 경우는 제외 (예: "나리 타이"는 변경하지 않음)
          // 정규식을 좀 더 정교하게 만들어 이중 공백을 피하거나, replace 후 trim/공백정리도 가능
          if (!originalValue.match(/([가-힣]+)\s+(타이)/g)) { // 이미 "ㅇㅇ 타이" 형태가 아닌 경우만
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
              if (!originalValue.match(/([가-힣]+)\s+(타이)/g)) {
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
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} changes related to '타이' spacing.`);
    } else {
      console.log(`\nNo changes needed for ${filePath} regarding '타이' spacing.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 