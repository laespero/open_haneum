const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_mad_at_disney.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  const targetT0 = "They tricked me, tricked me";
  const targetT1 = "me";
  const targetE1 = "앞선 목적어의 반복을 통해 대상을 강조합니다."; 
  // We need to use the CURRENT XE value to find the correct item to update
  const currentXE = "They didn't just trick anyone, they tricked me!";

  const newXE = "It was me they were looking for.";
  const newXK = "그들이 찾던 건 바로 나였어.";
  const newXI = "ɪt wəz mi ðeɪ wər ˈlʊkɪŋ fɔr.";
  const newXR = "잇 워즈 미 데이 워 루킹 포.";

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.T0 === targetT0 && line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.T1 === targetT1 && item.E1 === targetE1 && item.XE === currentXE) {
            console.log(`Found item to update in T0: "${targetT0}", T1: "${item.T1}", E1: "${item.E1}"`);
            console.log(`  Old XE: "${item.XE}" -> New XE: "${newXE}"`);
            console.log(`  Old XK: "${item.XK}" -> New XK: "${newXK}"`);
            console.log(`  Old XI: "${item.XI}" -> New XI: "${newXI}"`);
            console.log(`  Old XR: "${item.XR}" -> New XR: "${newXR}"`);
            item.XE = newXE;
            item.XK = newXK;
            item.XI = newXI;
            item.XR = newXR;
            changesMade++;
          }
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} new example for 'me'.`);
    } else {
      console.log(`\nNo changes made. Target example for T0: "${targetT0}", T1: "${targetT1}", E1: "${targetE1}", Current XE: "${currentXE}" not found.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 