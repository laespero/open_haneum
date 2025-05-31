const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_song_has_no_form.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  const fixTaiSpacing = (text, fieldName, t0, t1) => {
    if (typeof text !== 'string') {
      return text;
    }

    // 제외할 특정 단어/패턴 목록
    if (text.endsWith('이타이')) return text;
    if (text.includes('타이요')) return text; // 타이요우 등
    if (text.includes('타이세츠')) return text;
    if (text.endsWith('테타이')) return text; // 하바타이테 등 방지

    // "타이"로 끝나고, 이미 " 타이" (공백+타이) 형태가 아니고, 전체가 "타이"가 아닌 경우
    if (text.endsWith('타이') && 
        !text.endsWith(' 타이') && // 이미 띄어쓰기 된 경우 제외
        text !== '타이'
        ) {
      const newText = text.slice(0, -2) + ' 타이';
      // 이전에 ' 나이'로 끝나는 경우는 없다고 가정 (이미 이전 스크립트로 처리됨)
      if (text !== newText) {
        let logMessage = `- Updating ${fieldName}`;
        if (t0) logMessage += ` for T0: "${t0}"`;
        if (t1) logMessage += `, T1: "${t1}"`;
        console.log(`${logMessage}. Old: "${text}", New: "${newText}"`);
        changesMade++;
        return newText;
      }
    }
    return text;
  };

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.R0) {
        line.R0 = fixTaiSpacing(line.R0, 'R0', line.T0);
      }

      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.R1) {
            item.R1 = fixTaiSpacing(item.R1, 'R1', line.T0, item.T1);
          }
          if (item.R2) {
            item.R2 = fixTaiSpacing(item.R2, 'R2', line.T0, item.T1);
          }
          if (item.XR) {
            item.XR = fixTaiSpacing(item.XR, 'XR', line.T0, item.T1);
          }
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} changes.`);
    } else {
      console.log(`\nNo changes needed for ${filePath}.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 