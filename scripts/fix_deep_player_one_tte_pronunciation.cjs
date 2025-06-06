const fs = require('fs');
const filePath = './songs/deep_player_one.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(line => {
    // R0 수정
    if (line.R0 && line.R0.includes("젯타이 젯스메이 테 챤스 난 자 나이 노?")) {
      line.R0 = line.R0.replace("젯타이 젯스메이 테 챤스 난 자 나이 노?", "젯타이 젯스메이 떼 챤스 난 자 나이 노?");
      changesMade++;
    }
    // 가사 "絶対絶命ってチャンスなんじゃないの?" 의 R0에 대한 다른 케이스도 확인 (혹시나 해서)
    if (line.T0 === "絶対絶命ってチャンスなんじゃないの?" && line.R0 && line.R0.includes(" 테 ")) { 
      // 위에서 이미 수정되었을 수 있지만, 포괄적으로 한 번 더 체크
      const oldR0 = line.R0;
      line.R0 = line.R0.replace(/ 테 /g, " 떼 "); // 공백을 포함하여 더 정확하게 교체
      if (oldR0 !== line.R0) changesMade++;
    }

    if (line.LI && line.LI.length > 0) {
      line.LI.forEach(item => {
        if (item.T1 === "って") {
          if (item.R1 === "테") {
            item.R1 = "떼";
            changesMade++;
          }
          if (item.XR && item.XR.includes(" 테 ")) {
            const oldXR = item.XR;
            item.XR = item.XR.replace(/ 테 /g, " 떼 "); // 공백 포함하여 교체
            if (oldXR !== item.XR) changesMade++;
          }
        }
      });
    }
  });

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log("[って 발음 수정] 파일 수정 완료: " + filePath + ". " + changesMade + "개 위치에서 수정 발생 (항목 수와 다를 수 있음)");
  } else {
    console.log("[って 발음 수정] 수정된 항목이 없습니다.");
  }

} catch (error) {
  console.error('[って 발음 수정] 스크립트 실행 중 오류 발생:', error);
} 