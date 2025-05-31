const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep2_like_addicted_poison.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let totalItemsChanged = 0; // 변경된 총 아이템(R0 또는 XR) 수
  let accumulatedLogs = [];

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach((line, lineIndexL) => {
      let lineSpecificLogs = [];
      let lineItselfChanged = false;

      // R0 수정
      const originalR0 = line.R0;
      if (line.T0 === "再次隐藏着喜怒 thought it's pretty cool" && line.R0 === "짜이 츠 인 창 저 시 누 thought it's pretty cool") {
        line.R0 = "짜이 츠 인 창 저 시 누 쏘트 잇츠 프리티 쿨";
        lineSpecificLogs.push(`  - R0 updated. Old: "${originalR0}", New: "${line.R0}"`);
        lineItselfChanged = true;
      }
      if (line.T0 === "其实我需要你 so there's no monday blue" && line.R0 === "치스 워 쉬야오 니 so 데어즈 노 먼데이 블루") {
        line.R0 = "치스 워 쉬야오 니 쏘 데어즈 노 먼데이 블루";
        lineSpecificLogs.push(`  - R0 updated (so->쏘). Old: "${originalR0}", New: "${line.R0}"`);
        lineItselfChanged = true;
      }

      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach((item, itemIndexL) => {
          let itemSpecificLogs = [];
          let currentT1 = item.T1 || item.T2 || '';
          const originalXR = item.XR;
          let xrChangedInItem = false;

          if (line.T0 === "再次隐藏着喜怒 thought it's pretty cool") {
            if (currentT1 === "thought" && item.XR === "아이 thought 유 워 coming") {
              item.XR = "아이 쏘트 유 워 커밍";
              itemSpecificLogs.push(`    - XR for T1:"thought" updated. Old:"${originalXR}", New:"${item.XR}"`);
              xrChangedInItem = true;
            } else if (currentT1 === "it's" && item.XR === "it's raining outside") {
              item.XR = "잇츠 레이닝 아웃사이드";
              itemSpecificLogs.push(`    - XR for T1:"it's" updated. Old:"${originalXR}", New:"${item.XR}"`);
              xrChangedInItem = true;
            } else if (currentT1 === "pretty" && item.XR === "she's pretty smart") {
              item.XR = "쉬즈 프리티 스마트";
              itemSpecificLogs.push(`    - XR for T1:"pretty" updated. Old:"${originalXR}", New:"${item.XR}"`);
              xrChangedInItem = true;
            } else if (currentT1 === "cool" && item.XR === "that's a cool car") {
              item.XR = "댓츠 어 쿨 카";
              itemSpecificLogs.push(`    - XR for T1:"cool" updated. Old:"${originalXR}", New:"${item.XR}"`);
              xrChangedInItem = true;
            }
          }
          if (xrChangedInItem) {
            if (!lineItselfChanged && lineSpecificLogs.length === 0) { // 이 LI 아이템에서 처음 변경 발생
                 // lineSpecificLogs에 라인 변경 정보가 아직 없을 때만 라인 헤더 추가
            }
            lineSpecificLogs.push(`  Item ${itemIndexL + 1} (T1: ${currentT1}):`);
            lineSpecificLogs.push(...itemSpecificLogs);
            lineItselfChanged = true; // LI 중 하나라도 바뀌면 line자체가 바뀐것으로 간주
          }
        });
      }
      
      if (lineItselfChanged) {
        totalItemsChanged++;
        accumulatedLogs.push(`Changes for Line ${lineIndexL + 1} (T0: ${line.T0}):`);
        accumulatedLogs.push(...lineSpecificLogs);
      }
    });
  }

  if (totalItemsChanged > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    accumulatedLogs.forEach(log => console.log(log));
    console.log(`\nSuccessfully updated ${filePath} with changes in ${totalItemsChanged} line(s)/item(s) for English Hangeul transcription.`);
  } else {
    console.log(`\nNo English Hangeul transcription corrections made based on the implemented script logic in ${filePath}.`);
  }

} catch (error) {
  console.error('Error processing the file:', error);
} 