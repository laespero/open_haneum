const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_mad_at_disney.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  const targetT0 = "But now I'm twenty-something"; // T1 "twenty-something"이 속한 T0
  const targetT1 = "twenty-something";
  
  const newK1 = "20대의"; // 또는 "스물 몇 살의"
  const newE1 = "20세부터 29세까지의 나이를 통칭하는 비격식적 표현입니다.";
  const newK2 = "20대의"; // K1과 일관성 있게

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.T0 === targetT0 && line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.T1 === targetT1) {
            let itemModified = false;
            if (item.K1 !== newK1) {
              console.log(`Updating K1 for T1: "${item.T1}" in T0: "${line.T0}". Old: "${item.K1}", New: "${newK1}"`);
              item.K1 = newK1;
              itemModified = true;
            }
            if (item.E1 !== newE1) {
              console.log(`Updating E1 for T1: "${item.T1}" in T0: "${line.T0}". Old: "${item.E1}", New: "${newE1}"`);
              item.E1 = newE1;
              itemModified = true;
            }
            // T2가 T1과 동일하고, K2도 K1과 일관성 있게 수정
            if (item.T2 === targetT1 && item.K2 !== newK2) { 
              console.log(`Updating K2 for T2: "${item.T2}" in T0: "${line.T0}". Old: "${item.K2}", New: "${newK2}"`);
              item.K2 = newK2;
              itemModified = true;
            }
            if (itemModified) {
              changesMade++;
            }
          }
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} changes for 'twenty-something'.`);
    } else {
      console.log(`\nNo changes needed for 'twenty-something' in T0: "${targetT0}". Item not found or already correct.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 