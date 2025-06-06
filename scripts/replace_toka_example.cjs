const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');

// 기존에 찾았던 예문 정보
const oldXE = "映画とか見る";

// 새로운 예문 정보 (올바르게 수정된 내용)
const newXE = "週末は買い物とか料理とかをします。";
const newXR = "슈우마츠 와 카이모노 토카 료오리 토카 오 시마스.";
const newXK = "주말에는 쇼핑이라든가 요리 같은 것을 합니다.";
const newXI = "'とか'는 여러 항목을 불확실하게 나열할 때 사용됩니다. '買い物(かいもの)'는 '쇼핑', '料理(りょうり)'는 '요리'를 의미합니다. '週末(しゅうまつ)'는 '주말'입니다.";

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.XE === oldXE) {
            console.log(`Found old XE at T0: "${line.T0}", T1: "${item.T1}"`);
            console.log(`  Original XE: "${item.XE}"`);
            item.XE = newXE;
            item.XR = newXR;
            item.XK = newXK;
            item.XI = newXI;
            console.log(`  Replaced with New XE: "${item.XE}"`);
            console.log(`    New XR: "${item.XR}"`);
            console.log(`    New XK: "${item.XK}"`);
            console.log(`    New XI: "${item.XI}"`);
            changesMade++;
          }
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath}, replacing ${changesMade} example(s).`);
    } else {
      console.log(`\nNo changes needed in ${filePath}. Old example "${oldXE}" not found.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 