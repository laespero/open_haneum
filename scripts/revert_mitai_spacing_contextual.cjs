const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  const targetKoreanSpace = '미 타이';
  const replacementKoreanNoSpace = '미타이';
  const contextJapanese = 'みたい'; // Keyword for "~처럼" context

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      // Check R0
      if (line.R0 && typeof line.R0 === 'string' && line.R0.includes(targetKoreanSpace)) {
        if (line.T0 && line.T0.includes(contextJapanese)) {
          const originalValue = line.R0;
          line.R0 = originalValue.replace(new RegExp(targetKoreanSpace, 'g'), replacementKoreanNoSpace);
          if (originalValue !== line.R0) {
            console.log(`- R0: "${originalValue}" -> "${line.R0}" (Context T0: "${line.T0}")`);
            changesMade++;
          }
        }
      }

      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          // Check R1
          if (item.R1 && typeof item.R1 === 'string' && item.R1.includes(targetKoreanSpace)) {
            if (item.T1 && item.T1.includes(contextJapanese)) {
              const originalValue = item.R1;
              item.R1 = originalValue.replace(new RegExp(targetKoreanSpace, 'g'), replacementKoreanNoSpace);
              if (originalValue !== item.R1) {
                console.log(`  - R1: "${originalValue}" -> "${item.R1}" (Context T1: "${item.T1}", T0: "${line.T0}")`);
                changesMade++;
              }
            }
          }
          // Check R2
          if (item.R2 && typeof item.R2 === 'string' && item.R2.includes(targetKoreanSpace)) {
            if (item.T2 && item.T2.includes(contextJapanese)) {
              const originalValue = item.R2;
              item.R2 = originalValue.replace(new RegExp(targetKoreanSpace, 'g'), replacementKoreanNoSpace);
              if (originalValue !== item.R2) {
                console.log(`    - R2: "${originalValue}" -> "${item.R2}" (Context T2: "${item.T2}", T1: "${item.T1}", T0: "${line.T0}")`);
                changesMade++;
              }
            }
          }
          // Check XR
          if (item.XR && typeof item.XR === 'string' && item.XR.includes(targetKoreanSpace)) {
            if (item.XE && item.XE.includes(contextJapanese)) {
              const originalValue = item.XR;
              item.XR = originalValue.replace(new RegExp(targetKoreanSpace, 'g'), replacementKoreanNoSpace);
              if (originalValue !== item.XR) {
                console.log(`    - XR: "${originalValue}" -> "${item.XR}" (Context XE: "${item.XE}", T1: "${item.T1}", T0: "${line.T0}")`);
                changesMade++;
              }
            }
          }
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} changes for '미 타이' to '미타이' based on 'みたい' context.`);
    } else {
      console.log(`\nNo changes needed for ${filePath} regarding '미 타이' with 'みたい' context.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 