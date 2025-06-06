const fs = require('fs');
const filePath = './songs/deep_player_one.json';

try {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  data.translatedLines.forEach(line => {
    if (line.LI && line.LI.length > 0) {
      line.LI.forEach(item => {
        console.log(`T0: ${line.T0}`);
        console.log(`T1: ${item.T1}`);
        if (item.E1) console.log(`E1: ${item.E1}`);
        if (item.K1) console.log(`K1: ${item.K1}`);
        if (item.XE) console.log(`XE: ${item.XE}`);
        if (item.XK) console.log(`XK: ${item.XK}`);
        console.log('---');
      });
    }
  });

} catch (error) {
  console.error('스크립트 실행 중 오류 발생:', error);
} 