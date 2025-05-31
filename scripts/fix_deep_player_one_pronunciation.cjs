const fs = require('fs');
const filePath = './songs/deep_player_one.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  // K0 번역 수정 (절체절명 관련)
  data.translatedLines.forEach(line => {
    if (line.T0 === "絶体絶命ってチャンスなんじゃないの?" && line.K0 === "절체절명이 기회 아닌가?") {
      line.K0 = "절체절명의 위기가 오히려 기회 아니겠어?";
      changesMade++;
    }
  });

  // 발음 표기 (R1) 수정
  const pronunciationFixes = {
    "BAN": "반",
    "EZ": "이지",
    "GG": "지지",
    "Tack": "택"
  };

  data.translatedLines.forEach(line => {
    if (line.LI && line.LI.length > 0) {
      line.LI.forEach(item => {
        if (item.T1 && pronunciationFixes[item.T1] && item.R1 !== pronunciationFixes[item.T1]) {
          item.R1 = pronunciationFixes[item.T1];
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