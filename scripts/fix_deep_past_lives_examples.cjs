const fs = require('fs');
const filePath = './songs/deep_past_lives.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(line => {
    if (line.LI && line.LI.length > 0) {
      line.LI.forEach(item => {
        // T0: Sometimes the dreamers finally wake up, T1: up 개선
        if (line.T0 === "Sometimes the dreamers finally wake up" && item.T1 === "up") {
          if (item.XE === "Stand up straight.") {
            item.XE = "He didn't wake up until noon.";
            item.XK = "그는 정오까지 깨어나지 않았어.";
            changesMade++;
          }
        }

        // T0: Past lives couldn't ever hold me down, T1: hold 개선
        if (line.T0 === "Past lives couldn't ever hold me down" && item.T1 === "hold") {
          if (item.XE === "The police held the crowd back.") {
            item.XE = "You can't hold me down with your threats.";
            item.XK = "너의 위협으로 날 억누를 순 없어.";
            changesMade++;
          }
        }

        // T0: Past lives couldn't ever hold me down, T1: down 개선
        if (line.T0 === "Past lives couldn't ever hold me down" && item.T1 === "down") {
          if (item.XE === "He pushed me down.") {
            item.XE = "Don't let negative thoughts bring you down.";
            item.XK = "부정적인 생각에 짓눌리지 마.";
            changesMade++;
          }
        }
        
        // T0: Past lives couldn't ever come between us, T1: come 개선
        if (line.T0 === "Past lives couldn't ever come between us" && item.T1 === "come") {
          if (item.XE === "Spring comes after winter.") {
            item.XE = "Nothing can come between us.";
            item.XK = "아무것도 우리 사이를 갈라놓을 수 없어.";
            changesMade++;
          }
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