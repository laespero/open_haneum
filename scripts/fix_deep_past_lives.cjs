const fs = require('fs');
const filePath = './songs/deep_past_lives.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(item => {
    if (item.T0 === "Sometimes the dreamers finally wake up") {
      item.K0 = "때로는 꿈꾸는 이들도 마침내 깨어나곤 해.";
      changesMade++;
    } else if (item.T0 === "This isn't our first time around") {
      item.K0 = "우리가 처음은 아니잖아.";
      changesMade++;
    } else if (item.T0 === "Past lives couldn't ever hold me down") {
      item.K0 = "지난 생들이 결코 날 붙잡아 둘 순 없었지.";
      changesMade++;
    } else if (item.T0 === "Don't wake me, I'm not dreaming") {
      item.K0 = "깨우지 마, 꿈을 꾸는 게 아니니까.";
      changesMade++;
    } else if (item.T0 === "I've got the strangest feeling") {
      item.K0 = "정말 이상한 기분이 들어.";
      changesMade++;
    } else if (item.T0 === "Past lives couldn't ever come between us") {
      item.K0 = "지난 생들이 결코 우리 사이를 갈라놓지 못했으니.";
      changesMade++;
    } else if (item.T0 === "Lost love is sweeter when it's finally found") {
      item.K0 = "잃어버린 사랑은 마침내 되찾았을 때 더욱 달콤한 법이지.";
      changesMade++;
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