const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep2_like_addicted_poison.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMadeCount = 0; // 변경된 아이템(LI)의 총 개수
  let accumulatedLogs = [];

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach((line, lineIndexL) => {
      if (line.T0 === "再次隐藏着喜怒 thought it's pretty cool" && line.LI && Array.isArray(line.LI)) {
        let lineSpecificLogs = [];
        let lineContainedChanges = false;

        line.LI.forEach((item, itemIndexL_inner) => {
          let itemSpecificLogs_inner = [];
          let itemItselfChanged = false;
          const currentT1 = item.T1 || '';
          const currentT2 = item.T2 || '';

          // R1 수정
          const originalR1 = item.R1;
          let newR1 = originalR1;

          if (currentT1 === "thought" && originalR1 === "thought") {
            newR1 = "쏘트";
          } else if (currentT1 === "it's" && originalR1 === "it's") {
            newR1 = "잇츠";
          } else if (currentT1 === "pretty" && originalR1 === "pretty") {
            newR1 = "프리티";
          } else if (currentT1 === "cool" && originalR1 === "cool") {
            newR1 = "쿨";
          }

          if (newR1 !== originalR1) {
            item.R1 = newR1;
            itemSpecificLogs_inner.push(`    - R1 for T1:"${currentT1}" updated. Old:"${originalR1}", New:"${item.R1}" (I1: ${item.I1 || 'N/A'})`);
            itemItselfChanged = true;
          }

          // R2 수정
          const originalR2 = item.R2;
          let newR2 = originalR2;

          if (currentT1 === "thought" && currentT2 === "think" && originalR2 === "think") {
            newR2 = "씽크";
          } else if (currentT1 === "it's" && currentT2 === "it is" && originalR2 === "it is") {
            newR2 = "잇 이즈";
          } else if (currentT1 === "pretty" && currentT2 === "pretty" && originalR2 === "pretty") {
            // 위에서 R1이 pretty -> 프리티로 바뀌었다면, R2도 동일하게 바꿔야 할 수 있음 (T2도 pretty이므로)
            // 하지만 이미 R1과 T1이 같을 때 수정했으므로, T2와 R2가 같은 경우도 유사하게 처리.
            newR2 = "프리티"; 
          } else if (currentT1 === "cool" && currentT2 === "cool" && originalR2 === "cool") {
            newR2 = "쿨";
          }
          
          if (newR2 !== originalR2) {
            item.R2 = newR2;
            itemSpecificLogs_inner.push(`    - R2 for T2:"${currentT2}" (T1:"${currentT1}") updated. Old:"${originalR2}", New:"${item.R2}" (I2: ${item.I2 || 'N/A'})`);
            itemItselfChanged = true;
          }

          if (itemItselfChanged) {
            lineSpecificLogs.push(`  Item ${itemIndexL_inner + 1} (T1: "${currentT1}", T2: "${currentT2}"):`);
            lineSpecificLogs.push(...itemSpecificLogs_inner);
            lineContainedChanges = true;
            changesMadeCount++; // 개별 아이템 변경 시 카운트 증가
          }
        });

        if (lineContainedChanges) {
          // changesMadeCount는 위에서 LI 아이템별로 증가했으므로, 라인 단위 카운트는 별도로 하지 않음.
          accumulatedLogs.push(`Changes in Line ${lineIndexL + 1} (T0: ${line.T0}):`);
          accumulatedLogs.push(...lineSpecificLogs);
        }
      }
    });
  }

  if (changesMadeCount > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    accumulatedLogs.forEach(log => console.log(log));
    console.log(`\nSuccessfully updated ${filePath}. Corrected R1/R2 English Hangeul transcriptions for ${changesMadeCount} item(s).`);
  } else {
    console.log(`\nNo R1/R2 English Hangeul transcription corrections needed or made based on the script logic in ${filePath}.`);
  }

} catch (error) {
  console.error('Error processing the file:', error);
} 