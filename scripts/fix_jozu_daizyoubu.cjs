const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_song_has_no_form.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.R0) {
        const originalR0 = line.R0;
        if (line.R0.includes('조우즈')) {
          line.R0 = line.R0.replace(/조우즈/g, '죠오즈');
          if (originalR0 !== line.R0) {
            console.log(`- R0: "${originalR0}" -> "${line.R0}" (T0: "${line.T0}")`);
            changesMade++;
          }
        }
        if (line.R0.includes('다이죠부')) {
          line.R0 = line.R0.replace(/다이죠부/g, '다이죠오부');
          if (originalR0 !== line.R0 && !originalR0.includes('조우즈')) { // 조우즈 변경 시 이미 로그를 남겼으므로 중복 방지
             console.log(`- R0: "${originalR0}" -> "${line.R0}" (T0: "${line.T0}")`);
             changesMade++;
          } else if (originalR0 !== line.R0 && originalR0.includes('조우즈') && line.R0.includes('다이죠오부')) { // 조우즈와 다이죠부가 함께 변경된 경우
            // 이 경우는 위에서 이미 로그 남김 (조우즈 -> 죠오즈). 추가 로그 필요 없음.
            // changesMade는 이미 증가됨.
          }
        }
      }

      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.R1) {
            const originalR1 = item.R1;
            if (item.R1.includes('조우즈')) {
              item.R1 = item.R1.replace(/조우즈/g, '죠오즈');
              if (originalR1 !== item.R1) {
                console.log(`  - R1: "${originalR1}" -> "${item.R1}" (T1: "${item.T1}", T0: "${line.T0}")`);
                changesMade++;
              }
            }
            if (item.R1.includes('다이죠부')) {
              item.R1 = item.R1.replace(/다이죠부/g, '다이죠오부');
              if (originalR1 !== item.R1 && !originalR1.includes('조우즈')) {
                console.log(`  - R1: "${originalR1}" -> "${item.R1}" (T1: "${item.T1}", T0: "${line.T0}")`);
                changesMade++;
              } else if (originalR1 !== item.R1 && originalR1.includes('조우즈') && item.R1.includes('다이죠오부')) {
                 // 위에서 이미 로그 남김.
              }
            }
          }
          if (item.R2) {
            const originalR2 = item.R2;
            if (item.R2.includes('조우즈')) {
              item.R2 = item.R2.replace(/조우즈/g, '죠오즈');
              if (originalR2 !== item.R2) {
                console.log(`    - R2: "${originalR2}" -> "${item.R2}" (T2: "${item.T2}", T1: "${item.T1}", T0: "${line.T0}")`);
                changesMade++;
              }
            }
            if (item.R2.includes('다이죠부')) {
              item.R2 = item.R2.replace(/다이죠부/g, '다이죠오부');
               if (originalR2 !== item.R2 && !originalR2.includes('조우즈')) {
                console.log(`    - R2: "${originalR2}" -> "${item.R2}" (T2: "${item.T2}", T1: "${item.T1}", T0: "${line.T0}")`);
                changesMade++;
              } else if (originalR2 !== item.R2 && originalR2.includes('조우즈') && item.R2.includes('다이죠오부')) {
                // 위에서 이미 로그 남김.
              }
            }
          }
          if (item.XR) {
            const originalXR = item.XR;
            if (item.XR.includes('조우즈')) {
              item.XR = item.XR.replace(/조우즈/g, '죠오즈');
              if (originalXR !== item.XR) {
                console.log(`    - XR: "${originalXR}" -> "${item.XR}" (XE: "${item.XE}", T1: "${item.T1}", T0: "${line.T0}")`);
                changesMade++;
              }
            }
            if (item.XR.includes('다이죠부')) {
              item.XR = item.XR.replace(/다이죠부/g, '다이죠오부');
              if (originalXR !== item.XR && !originalXR.includes('조우즈')) {
                console.log(`    - XR: "${originalXR}" -> "${item.XR}" (XE: "${item.XE}", T1: "${item.T1}", T0: "${line.T0}")`);
                changesMade++;
              } else if (originalXR !== item.XR && originalXR.includes('조우즈') && item.XR.includes('다이죠오부')) {
                // 위에서 이미 로그 남김.
              }
            }
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