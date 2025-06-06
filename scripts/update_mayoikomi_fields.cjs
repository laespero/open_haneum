const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_damashiai.json');

const targetT0 = "藻掻くほど迷い込み";
const targetT1 = "迷い込み";

const newFields = {
  K1: "헤매다",
  E1: "'迷う(헤매다)'에 '込む(깊이 빠지다)'가 더해져 '깊이 헤매다', '길을 잃고 헤매다'의 의미를 나타냅니다.",
  K2: "헤매다", // T2가 迷い込む (동사형) 이므로 K2도 동사형으로 유지
  XK: "숲에서 길을 잃고 헤맸다."
};

let foundAndModified = false;

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.T0 === targetT0 && line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.T1 === targetT1) {
            console.log(`- Updating fields for T0: "${targetT0}", T1: "${targetT1}"`);
            console.log(`  Old K1: "${item.K1}" -> New K1: "${newFields.K1}"`);
            item.K1 = newFields.K1;
            console.log(`  Old E1: "${item.E1}" -> New E1: "${newFields.E1}"`);
            item.E1 = newFields.E1;
            console.log(`  Old K2: "${item.K2}" -> New K2: "${newFields.K2}"`);
            item.K2 = newFields.K2;
            console.log(`  Old XK: "${item.XK}" -> New XK: "${newFields.XK}"`);
            item.XK = newFields.XK;
            foundAndModified = true;
          }
        });
      }
    });

    if (foundAndModified) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated fields in ${filePath}.`);
    } else {
      console.log('Target T0 and T1 not found, or fields already updated. No changes made.');
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 