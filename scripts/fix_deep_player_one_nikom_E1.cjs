const fs = require('fs');
const filePath = './songs/deep_player_one.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(line => {
    if (line.T0 === "心の奥底に煮込まれ") {
      if (line.LI && line.LI.length > 0) {
        line.LI.forEach(item => {
          if (item.T1 === "煮込" && item.E1 === "오랜 시간 푹 끓이거나 조리는 것을 의미하는 동사 '煮込む(にこむ)'의 어간입니다.") {
            item.E1 = "오랜 시간 푹 끓이거나 조리는 것을 의미하는 동사 '煮込む'의 어간입니다.";
            changesMade++;
          }
        });
      }
    }
  });

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log("[煮込 E1 수정] 파일 수정 완료: " + filePath + " (" + changesMade + "개 항목 수정됨)");
  } else {
    console.log("[煮込 E1 수정] 수정 대상 항목이 없거나 이미 E1이 수정되었습니다.");
  }

} catch (error) {
  console.error('[煮込 E1 수정] 스크립트 실행 중 오류 발생:', error);
} 