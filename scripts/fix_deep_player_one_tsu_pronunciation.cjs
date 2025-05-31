const fs = require('fs');
const filePath = './songs/deep_player_one.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(line => {
    // R0 수정 (해당 가사 라인 특정)
    if (line.T0 === "詰んだと見せてから正念場" && line.R0 === "쯘다 토 미세테 카라 쇼오넨바") {
      line.R0 = "츤다 토 미세테 카라 쇼오넨바";
      changesMade++;
    }

    if (line.LI && line.LI.length > 0) {
      line.LI.forEach(item => {
        let originalR1 = item.R1;
        let originalR2 = item.R2;
        let originalXR = item.XR;

        if (item.T1 === "詰んだ") {
          if (item.R1 === "쯘다") {
            item.R1 = "츤다";
            changesMade++;
          }
          if (item.XR === "게무 가 쯘다") { // 예문 발음도 수정
            item.XR = "게무 가 츤다";
            changesMade++;
          }
          // T2와 R2 수정
          if (item.T2 === "詰む" && item.R2 === "쯔무") {
            item.R2 = "츠무";
            changesMade++;
          }
        }
        // 추가적으로, 혹시 다른 곳에서도 詰む가 T1으로 쓰이고 R1이 쯔무라면 수정
        if (item.T1 === "詰む" && item.R1 === "쯔무") {
          item.R1 = "츠무";
          changesMade++;
        }
      });
    }
  });

  if (changesMade > 0) {
    // 중복 카운트를 방지하기 위해 실제 변경된 항목 수를 다시 정확히 세기보다는
    // 스크립트 실행 로그에는 단순히 변경이 발생했다는 사실과 파일명을 명시합니다.
    // 정확한 변경 개수는 console.log에서 직접 세어보는 것이 좋습니다.
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log("[詰んだ/詰む 발음 수정] 파일 수정 완료: " + filePath + ". 변경된 항목 수는 로그를 확인해주세요.");
  } else {
    console.log("[詰んだ/詰む 발음 수정] 수정된 항목이 없습니다.");
  }

} catch (error) {
  console.error('[詰んだ/詰む 발음 수정] 스크립트 실행 중 오류 발생:', error);
} 