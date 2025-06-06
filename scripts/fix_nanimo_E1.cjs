const fs = require('fs');
const filePath = './songs/deep_androp_koi.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.T1 === "何も") {
            // 현재 E1이 상세 설명을 포함하고 있다면 간결하게 수정
            if (item.E1.includes("부정형으로 '필요 없다'는 의미입니다") || item.E1.includes("강한 단언의 느낌을 줍니다")) {
              item.E1 = "`何(なに)も`는 '아무것도'라는 의미의 부사구 또는 명사입니다.";
              changesMade++;
            }
          }
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Successfully updated E1 for "何も" in ${filePath} with ${changesMade} changes.`);
    } else {
      console.log(`No E1 for "何も" needed updates in ${filePath}.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 