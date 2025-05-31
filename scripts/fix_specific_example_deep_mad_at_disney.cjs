const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_mad_at_disney.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  const targetT0 = "They tricked me, tricked me";
  const targetT1 = "tricked"; // 이 T1은 반복되는 두번째 tricked 입니다.
  const targetXE = "They tricked me, yes, they tricked me good.";
  const newXI = "ðeɪ tɹɪkt mi, jɛs, ðeɪ tɹɪkt mi ɡʊd";
  const newXR = "데이 트릭트 미, 예스, 데이 트릭트 미 굿";

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.T0 === targetT0 && line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          // 두 번째 "tricked"를 찾아야 하므로, 인덱스나 더 구체적인 식별자가 필요할 수 있으나
          // 여기서는 E1 설명과 XE 내용을 함께 사용하여 최대한 특정합니다.
          // 이 경우, XE가 고유하므로 XE로 직접 타겟팅합니다.
          if (item.T1 === targetT1 && item.XE === targetXE) {
            if (item.XI !== newXI || item.XR !== newXR) {
              console.log(`Found item to update in T0: "${targetT0}", T1: "${item.T1}", XE: "${item.XE}"`);
              console.log(`  Old XI: "${item.XI}" -> New XI: "${newXI}"`);
              console.log(`  Old XR: "${item.XR}" -> New XR: "${newXR}"`);
              item.XI = newXI;
              item.XR = newXR;
              changesMade++;
            }
          }
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} specific example changes.`);
    } else {
      console.log(`\nNo changes made. Target example for T0: "${targetT0}", T1: "${targetT1}", XE: "${targetXE}" not found or already correct.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 