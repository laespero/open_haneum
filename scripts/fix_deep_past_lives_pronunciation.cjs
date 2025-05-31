const fs = require('fs');
const filePath = './songs/deep_past_lives.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(line => {
    if (line.R0 && line.R0.includes("커든트")) {
      line.R0 = line.R0.replace(/커든트/g, "쿠든트");
      changesMade++;
    }
    if (line.LI && line.LI.length > 0) {
      line.LI.forEach(item => {
        if (item.R1 && item.R1 === "커든트") {
          item.R1 = "쿠든트";
          changesMade++;
        }
        if (item.XR && item.XR.includes("커든트")) {
          item.XR = item.XR.replace(/커든트/g, "쿠든트");
          changesMade++;
        }
        if (item.R2 && item.R2 === "커드 낫") {
          item.R2 = "쿠드낫";
          changesMade++;
        }
      });
    }
  });

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`파일 수정 완료: ${filePath} (${changesMade}개 항목 수정됨)`);
  } else {
    console.log("수정된 항목이 없습니다.");
  }

} catch (error) {
  console.error('스크립트 실행 중 오류 발생:', error);
} 