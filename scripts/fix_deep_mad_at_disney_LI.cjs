const fs = require('fs');
const filePath = './songs/deep_mad_at_disney.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(line => {
    if (line.LI && line.LI.length > 0) {
      line.LI.forEach(item => {
        // T1: hell 개선
        if (line.T0 === "What the hell is love supposed to feel like?" && item.T1 === "hell") {
          if (item.E1 !== "의문을 강조하는 감탄사") {
            item.E1 = "의문을 강조하는 감탄사";
            changesMade++;
          }
        }
        if (line.T0 === "What the hell is love? What the hell is love?" && item.T1 === "hell") {
            if (item.E1.includes("원래 의미는 '지옥'이지만")) { // 기존 설명을 좀 더 구체적으로 타겟팅
                item.E1 = "의문을 강조하는 감탄사";
                changesMade++;
            }
        }

        // T1: tricked (두 번째 등장) 개선
        if (line.T0 === "They tricked me, tricked me" && item.T1 === "tricked" && item.E1 === "앞의 동사를 반복하여 강조하는 용법입니다.") {
          item.E1 = "앞선 동사의 반복을 통해 행위를 강조합니다.";
          item.XE = "They tricked me, yes, they tricked me good.";
          item.XK = "그들이 날 속였어, 그래, 제대로 속였지.";
          changesMade++;
        }

        // T1: me (두 번째 등장) 개선
        if (line.T0 === "They tricked me, tricked me" && item.T1 === "me" && item.E1 === "앞의 목적어를 반복하여 강조하는 용법입니다.") {
          item.E1 = "앞선 목적어의 반복을 통해 대상을 강조합니다.";
          item.XE = "They didn't just trick anyone, they tricked me!";
          item.XK = "아무나 속인 게 아냐, 그들은 바로 날 속였다고!";
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