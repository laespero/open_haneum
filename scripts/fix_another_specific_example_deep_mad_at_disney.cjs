const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_mad_at_disney.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  const targetT0 = "They tricked me, tricked me";
  const targetT1 = "me";
  // To be more specific, we also check E1 as there are multiple "me" T1s under this T0.
  const targetE1 = "앞선 목적어의 반복을 통해 대상을 강조합니다."; 
  const targetXE = "They didn't just trick anyone, they tricked me!";
  const newXI = "ðeɪ ˈdɪdənt dʒʌst trɪk ˈɛniwʌn, ðeɪ trɪkt mi!";
  const newXR = "데이 디든트 저스트 트릭 애니원, 데이 트릭트 미!";

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.T0 === targetT0 && line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.T1 === targetT1 && item.E1 === targetE1 && item.XE === targetXE) {
            if (item.XI !== newXI || item.XR !== newXR) {
              console.log(`Found item to update in T0: "${targetT0}", T1: "${item.T1}", E1: "${item.E1}", XE: "${item.XE}"`);
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
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} specific example changes for 'tricked me'.`);
    } else {
      console.log(`\nNo changes made. Target example for T0: "${targetT0}", T1: "${targetT1}", E1: "${targetE1}", XE: "${targetXE}" not found or already correct.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 