const fs = require('fs');
const filePath = 'songs/deep_song_has_no_form.json';
const numberOfLinesToExamine = 3; // 검토할 translatedLines 항목 수

try {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const songData = JSON.parse(rawData);

  if (songData.translatedLines && songData.translatedLines.length > 0) {
    for (let i = 0; i < Math.min(numberOfLinesToExamine, songData.translatedLines.length); i++) {
      const translatedLine = songData.translatedLines[i];
      console.log(`\n--- translatedLines[${i}] ---`);
      console.log(`T0 (원문): ${translatedLine.T0}`);
      console.log(`K0 (번역): ${translatedLine.K0}`);
      if (translatedLine.LI && translatedLine.LI.length > 0) {
        translatedLine.LI.forEach((liItem, index) => {
          console.log(`  LI[${index}]:`);
          console.log(`    T1: ${liItem.T1}`);
          console.log(`    K1: ${liItem.K1}`);
          console.log(`    E1: ${liItem.E1}`);
          console.log(`    XE: ${liItem.XE}`);
          console.log(`    XK: ${liItem.XK}`);
        });
      } else {
        console.log("  LI 배열이 없거나 비어있습니다.");
      }
    }
  } else {
    console.log("translatedLines 배열이 없거나 비어있습니다.");
  }

} catch (error) {
  console.error('스크립트 실행 중 오류 발생:', error);
} 