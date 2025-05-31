const fs = require('fs');
const filePath = './songs/deep_player_one.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(line => {
    if (line.T0 === "相も変わらずまだ土壇場") {
      if (line.LI && line.LI.length > 0) {
        line.LI.forEach(item => {
          if (item.T1 === "相" && item.E1 === "In the phrase '相も変わらず' (aimokawarazu), it doesn't mean 'each other' but is part of an idiomatic expression meaning 'as usual' or 'still the same'.") {
            item.E1 = "'相も変わらず(あいかわらず)'라는 관용구의 일부로, '서로'라는 의미가 아니라 '여느 때와 같이', '변함없이'라는 뜻을 나타냅니다.";
            changesMade++;
          }
        });
      }
    }
  });

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log("[相 E1 수정] 파일 수정 완료: " + filePath + " (" + changesMade + "개 항목 수정됨)");
  } else {
    console.log("[相 E1 수정] 수정 대상 항목이 없거나 이미 E1이 한국어로 되어 있습니다.");
  }

} catch (error) {
  console.error('[相 E1 수정] 스크립트 실행 중 오류 발생:', error);
} 