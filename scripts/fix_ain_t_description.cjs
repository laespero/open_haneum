const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_dont_look_back_in_anger.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMadeCount = 0; // 변경된 translatedLines 아이템 또는 LI 아이템의 수
  let accumulatedLogs = [];

  // G0에서 사용될 원본 및 새 설명 부분
  const g0OriginalSnippet = "'ain\'t\'는 \'am not/is not/are not/has not/have not\'의 비격식 표현으로 여기서는 \'have not\'의 의미로 사용되었습니다.";
  const g0NewSnippet = "'ain\'t\'는 \'have not\'의 비격식 표현입니다.";

  // E1에서 사용될 원본 및 새 설명
  const e1Original = "'am not/is not/are not/has not/have not\'의 비격식 표현으로, 여기서는 \'have not\'의 의미로 사용되었습니다.";
  const e1New = "'have not\'의 비격식 표현입니다.";
  
  // T2에서 사용될 원본 및 새 값
  const t2OriginalForAint = "am not/is not/are not/has not/have not";
  const t2NewForAint = "have not";
  const i2NewForHaveNot = "hæv nɒt"; // "have not"의 IPA
  const r2NewForHaveNot = "해브 낫";   // "have not"의 한글 발음

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach((line, lineIndex) => {
      let lineSpecificLogs = [];
      let lineItselfChanged = false;

      // G0 수정
      if (line.G0 && typeof line.G0 === 'string') {
        const oldG0 = line.G0;
        if (oldG0.includes(g0OriginalSnippet)) {
            line.G0 = oldG0.replace(g0OriginalSnippet, g0NewSnippet);
            lineSpecificLogs.push(`  - G0 field updated. Snippet "${g0OriginalSnippet}" replaced with "${g0NewSnippet}"`);
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
            // E1 수정
            if (item.E1 === e1Original) {
              const oldE1 = item.E1;
              item.E1 = e1New;
              itemSpecificLogs.push(`    - E1 updated. Old: "${oldE1}", New: "${item.E1}"`);
              currentItemChanged = true;
            }
            // T2, I2, R2를 함께 수정
            if (item.T2 === t2OriginalForAint) {
              const oldT2 = item.T2;
              const oldI2 = item.I2;
              const oldR2 = item.R2;

              item.T2 = t2NewForAint;
              item.I2 = i2NewForHaveNot;
              item.R2 = r2NewForHaveNot;

              itemSpecificLogs.push(`    - T2 updated. Old: "${oldT2}", New: "${item.T2}"`);
              itemSpecificLogs.push(`    - I2 updated for new T2. Old: "${oldI2}", New: "${item.I2}"`);
              itemSpecificLogs.push(`    - R2 updated for new T2. Old: "${oldR2}", New: "${item.R2}"`);
              currentItemChanged = true;
            }
          }

          if (currentItemChanged) {
            liChangesLog.push(`  Item ${itemIndex + 1} (T1: "${item.T1 || ''}"):`);
            liChangesLog.push(...itemSpecificLogs);
            liItemChangedInThisLine = true;
          }
        });
        if (liItemChangedInThisLine) {
            lineSpecificLogs.push(...liChangesLog); // LI 변경 로그를 라인 로그에 추가
            lineItselfChanged = true; // LI 변경이 있으면 라인 변경으로 간주
        }
      }

      if (lineItselfChanged) {
        changesMadeCount++; // 변경된 translatedLines 아이템 수로 카운트
        accumulatedLogs.push(`Changes in Line Index ${lineIndex} (T0: "${line.T0 || 'N/A'}"):`);
        accumulatedLogs.push(...lineSpecificLogs);
      }
    });
  }

  if (changesMadeCount > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    accumulatedLogs.forEach(log => console.log(log));
    console.log(`\nSuccessfully updated ${filePath}. Corrected descriptions and T2/I2/R2 for 'ain't' in ${changesMadeCount} translatedLine entry/entries.`);
  } else {
    console.log(`\nNo corrections needed or made for 'ain't' descriptions in ${filePath}.`);
  }

} catch (error) {
  console.error('Error processing the file:', error);
} 