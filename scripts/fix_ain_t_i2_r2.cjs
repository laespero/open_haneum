const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_dont_look_back_in_anger.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMadeCount = 0;
  let accumulatedLogs = [];

  const g0OriginalSnippet = "'ain\\'t\\'는 \\'am not/is not/are not/has not/have not\\'의 비격식 표현으로 여기서는 \\'have not\\'의 의미로 사용되었습니다.";
  const g0NewSnippet = "'ain\\'t\\'는 \\'have not\\'의 비격식 표현입니다.";

  const e1OriginalLong = "'am not/is not/are not/has not/have not\\'의 비격식 표현으로, 여기서는 \\'have not\\'의 의미로 사용되었습니다.";
  const e1NewShort = "'have not\\'의 비격식 표현입니다.";
  
  const i2OldLong = "æm nɒt/ɪz nɒt/ɑr nɒt/hæz nɒt/hæv nɒt";
  const i2NewForHaveNot = "hæv nɒt";
  const r2OldLong = "앰 낫/이즈 낫/아 낫/해즈 낫/해브 낫";
  const r2NewForHaveNot = "해브 낫";

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach((line, lineIndex) => {
      let lineSpecificLogs = [];
      let lineItselfChanged = false;

      // G0 수정 (이전 스크립트에서 이미 처리되었을 수 있지만, 안전을 위해 재확인)
      if (line.G0 && typeof line.G0 === 'string' && line.G0.includes(g0OriginalSnippet)) {
        const oldG0 = line.G0;
        line.G0 = line.G0.replace(g0OriginalSnippet, g0NewSnippet);
        if (oldG0 !== line.G0) {
            lineSpecificLogs.push(`  - G0 field updated. Snippet \"${g0OriginalSnippet}\" replaced with \"${g0NewSnippet}\".`);
            lineItselfChanged = true;
        }
      }

      if (line.LI && Array.isArray(line.LI)) {
        let liChangesLog = [];
        let liItemChangedInThisLine = false;
        line.LI.forEach((item, itemIndex) => {
          let itemSpecificLogs = [];
          let currentItemChanged = false;

          if (item.T1 === "ain't") {
            // E1 간결화 (이전 스크립트에서 이미 처리되었을 수 있지만, 안전을 위해 재확인)
            if (item.E1 === e1OriginalLong) {
              item.E1 = e1NewShort;
              itemSpecificLogs.push(`    - E1 updated to be concise. Old: \"${e1OriginalLong}\", New: \"${item.E1}\".`);
              currentItemChanged = true;
            }

            // T2가 "have not"으로 이미 수정된 경우, I2와 R2를 확인하고 수정
            if (item.T2 === "have not") {
              const oldI2 = item.I2;
              const oldR2 = item.R2;

              if (item.I2 === i2OldLong) {
                item.I2 = i2NewForHaveNot;
                itemSpecificLogs.push(`    - I2 for T2: \"have not\" updated. Old: \"${oldI2}\", New: \"${item.I2}\".`);
                currentItemChanged = true;
              }
              if (item.R2 === r2OldLong) {
                item.R2 = r2NewForHaveNot;
                itemSpecificLogs.push(`    - R2 for T2: \"have not\" updated. Old: \"${oldR2}\", New: \"${item.R2}\".`);
                currentItemChanged = true;
              }
            }
          }

          if (currentItemChanged) {
            liChangesLog.push(`  Item ${itemIndex + 1} (T1: \"${item.T1 || ''}\"):`);
            liChangesLog.push(...itemSpecificLogs);
            liItemChangedInThisLine = true;
          }
        });
        if (liItemChangedInThisLine) {
            lineSpecificLogs.push(...liChangesLog);
            lineItselfChanged = true;
        }
      }

      if (lineItselfChanged) {
        changesMadeCount++;
        accumulatedLogs.push(`Changes in Line Index ${lineIndex} (T0: \"${line.T0 || 'N/A'}\"):`);
        accumulatedLogs.push(...lineSpecificLogs);
      }
    });
  }

  if (changesMadeCount > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    accumulatedLogs.forEach(log => console.log(log));
    console.log(`\nSuccessfully updated ${filePath}. Corrected I2/R2 for T2='have not' (and other fields for 'ain\'t') in ${changesMadeCount} translatedLine entry/entries.`);
  } else {
    console.log(`\nNo further corrections needed for I2/R2 for T2='have not' (or other fields for 'ain\'t') in ${filePath}.`);
  }

} catch (error) {
  console.error('Error processing the file:', error);
} 