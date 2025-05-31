const fs = require('fs');
const filePath = './songs/deep_player_one.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(line => {
    if (line.T0 === "先天性トップランカー") {
      if (line.LI && line.LI.length > 0) {
        line.LI.forEach(item => {
          if (item.T1 === "トップランカー" && item.K1 === "최고의 달리기 선수") {
            item.K1 = "톱 랭커";
            changesMade++;
          }
        });
      }
    }
  });

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log("[トップランカー K1 수정] 파일 수정 완료: " + filePath + " (" + changesMade + "개 항목 수정됨)");
  } else {
    console.log("[トップランカー K1 수정] 수정된 항목이 없거나 이미 K1이 '톱 랭커'입니다.");
  }

} catch (error) {
  console.error('[トップランカー K1 수정] 스크립트 실행 중 오류 발생:', error);
} 