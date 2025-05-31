const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');

try {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);
  let count = 0;

  console.log('\nWord (T1) and Example (XE) pairs from deep_no_regret.json:\n');

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach((line, lineIndex) => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach((item, itemIndex) => {
          if (item.T1 && item.XE) {
            count++;
            console.log(`${count}. Word (T1): "${item.T1}"`);
            console.log(`   Example (XE): "${item.XE}"`);
            // 필요하다면 다른 관련 필드(예: T0, XR, XK 등)도 여기에 추가하여 출력할 수 있습니다.
            // console.log(`   Original Japanese Line (T0): "${line.T0}"`);
            console.log('---');
          } else if (item.T1 && !item.XE) {
            // T1은 있지만 XE가 없는 경우
            // count++;
            // console.log(`${count}. Word (T1): "${item.T1}"`);
            // console.log(`   Example (XE): Not available`);
            // console.log('---');
          }
        });
      }
    });
  }

  if (count === 0) {
    console.log('No word (T1) and example (XE) pairs found in the specified format.');
  }

} catch (error) {
  console.error('Error processing the file:', error);
} 