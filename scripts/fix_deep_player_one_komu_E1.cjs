const fs = require('fs');
const filePath = './songs/deep_player_one.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(line => {
    if (line.LI && line.LI.length > 0) {
      line.LI.forEach(item => {
        if (item.E1 === "‘込む(こむ, komu)’는 ‘안으로 들어가다, 몰리다’의 뜻이고, ‘込まれ’는 수동형 ‘몰리다’의 연용형입니다.") {
          item.E1 = "‘込む’는 ‘안으로 들어가다, 몰리다’의 뜻이고, ‘込まれ’는 수동형 ‘몰리다’의 연용형입니다.";
          changesMade++;
        }
      });
    }
  });

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log("[込 E1 수정] 파일 수정 완료: " + filePath + " (" + changesMade + "개 항목 수정됨)");
  } else {
    console.log("[込 E1 수정] 수정 대상 항목이 없거나 이미 E1이 수정되었습니다.");
  }

} catch (error) {
  console.error('[込 E1 수정] 스크립트 실행 중 오류 발생:', error);
} 