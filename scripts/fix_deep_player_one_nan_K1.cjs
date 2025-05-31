const fs = require('fs');
const filePath = './songs/deep_player_one.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(line => {
    if (line.LI && line.LI.length > 0) {
      line.LI.forEach(item => {
        if (item.T1 === "なん" && item.K1 === "(구어체 의문/제안)") {
          item.K1 = "~인 것"; // 사용자의 요청대로 수정
          changesMade++;
        }
      });
    }
  });

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log("[なん K1 수정] 파일 수정 완료: " + filePath + " (" + changesMade + "개 항목 수정됨)");
  } else {
    console.log("[なん K1 수정] 수정된 항목이 없습니다. (T1: なん, K1: (구어체 의문/제안)을 찾지 못했거나 이미 수정되었을 수 있습니다.)");
  }

} catch (error) {
  console.error('[なん K1 수정] 스크립트 실행 중 오류 발생:', error);
} 