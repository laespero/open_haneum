const fs = require('fs');
const filePath = './songs/deep_androp_koi.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.T0 === "いつも隣にいるのは") { // 특정 T0 라인 타겟
        if (line.LI && Array.isArray(line.LI)) {
          line.LI.forEach(item => {
            if (item.T1 === "の" && item.XE === "食べるのが好きだ。" && item.XK === "먹는 것을 좋아한다.") {
              item.XE = "私が好きなのは、この歌だ。";
              item.XK = "내가 좋아하는 것은 이 노래야.";
              changesMade++;
            }
          });
        }
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Successfully updated specific XE/XK for T1:"の" in ${filePath}`);
    } else {
      console.log(`Specific XE/XK for T1:"の" not found or already updated in ${filePath}.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 