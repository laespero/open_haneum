const fs = require('fs');
const filePath = './songs/deep_high_hopes.json'; // 실제 파일 경로로 수정

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(item => {
    if (item.K0 === "가서 유산을 남겨라.") {
      item.K0 = "가서 위업을 남겨.";
      changesMade++;
    } else if (item.K0 === "당신의 역사를 다시 써라.") {
      item.K0 = "너의 역사를 새로 써.";
      changesMade++;
    } else if (item.K0 === "박물관에서의 승리는 매일 있어") {
      item.K0 = "매일 박물관에 전시될 승리를 만들어가.";
      changesMade++;
    } else if (item.K0 === "별을 향해 쏘아 올리며") {
      item.K0 = "저 별들을 향해 쏘아 올리는 거야.";
      changesMade++;
    } else if (item.K0 === "명백한 운명") {
      item.K0 = "정해진 운명을 따라.";
      changesMade++;
    } else if (item.K0 === "엄마는 포기하지 말라고 말했어.") {
      item.K0 = "엄마가 말씀하셨지, 포기하지 말라고.";
      changesMade++;
    } else if (item.K0 === "높은 것을 가져야 했어.") {
      item.K0 = "언제나 큰 꿈을 꿔야 했어.";
      changesMade++;
    } else if (item.K0 === "결코 되고 싶지 않은 사람들") {
      item.K0 = "그저 그런 사람이 되긴 싫었지.";
      changesMade++;
    } else if (item.K0 === "예언을 이루어라.") {
      item.K0 = "예언을 실현시켜.";
      changesMade++;
    } else if (item.K0 === "더 위대한 존재가 되어라.") {
      item.K0 = "더 위대한 존재가 되는 거야.";
      changesMade++;
    } else if (item.K0 === "특이한 것들에게는 힘겨운 싸움이야.") {
      item.K0 = "남다른 이들에게는 험난한 길이지.";
      changesMade++;
    } else if (item.K0 === "낯선 성전사들") {
      item.K0 = "이방의 십자군들처럼.";
      changesMade++;
    } else if (item.K0 === "옛날로 돌아가") {
      item.K0 = "예전에는 말이지.";
      changesMade++;
    } else if (item.K0 === "모두 묶여 있고 더 이상 사랑은 없어") {
      item.K0 = "모든 게 묶여있고, 더는 사랑도 없었지.";
      changesMade++;
    } else if (item.K0 === "그리고 네가 기다리는 걸 보기 싫어.") {
      item.K0 = "네가 기다리는 모습은 차마 볼 수 없었어.";
      changesMade++;
    } else if (item.K0 === "우리는 모든 것을 원했어 모든 것을 원했어") {
      item.K0 = "우린 모든 걸 원했지, 모든 걸.";
      changesMade++;
    } else if (item.K0 === "항상 높은 희망을 가졌지.") {
      item.K0 = "항상 드높은 희망을 품었지.";
      changesMade++;
    } else if (item.K0 === "당신의 가장 대담한 꿈들을 밝히세요.") {
      item.K0 = "너의 가장 대담한 꿈들을 펼쳐봐.";
      changesMade++;
    } else if (item.K0 === "그 높은 곳에 머물러.") {
      item.K0 = "저 높은 곳에 계속 머무는 거야.";
      changesMade++;
    } else if (item.K0 === "조금 복잡해.") {
      item.K0 = "조금 복잡하긴 해.";
      changesMade++;
    } else if (item.K0 === "살기 위해 높은 희망을") {
      item.K0 = "살아가기 위한 드높은 희망.";
      changesMade++;
    } else if (item.K0 === "특이하고 새로운 것들") {
      item.K0 = "이상하고 새로운 것들.";
      changesMade++;
    } else if (item.K0 === "그래서 나는 한 번 더 달릴 거야.") {
      item.K0 = "그래서 한 번 더 달려보려고 해.";
      changesMade++;
    } else if (item.K0 === "한 푼도 없었지만 항상 비전은 있었어.") {
      item.K0 = "한 푼 없었지만, 언제나 비전은 있었지.";
      changesMade++;
    } else if (item.K0 === "엄마가 말했어") {
      item.K0 = "엄마가 말씀하셨지.";
      changesMade++;
    } else if (item.K0 === "높은 곳에 머무르고 절대 내려오지 마.") {
      item.K0 = "저 높은 곳에 머무르고 절대 내려오지 마.";
      changesMade++;
    } else if (item.K0 === "하지만 그들은 내 최고의 모습을 본 적이 없어.") {
      item.K0 = "하지만 그들은 아직 내 최고의 모습을 보지 못했어.";
      changesMade++;
    } else if (item.K0 === "너의 전기를 불태워 버려") {
      item.K0 = "너의 지난 기록들은 불태워 버려.";
      changesMade++;
    } else if (item.K0 === "나는 백만 명 중 한 명이 될 거였어.") {
      item.K0 = "난 백만 중 하나가 될 운명이었지.";
      changesMade++;
    } else if (item.K0 === "어떻게인지 몰랐지만 항상 느낌이 있었어.") {
      item.K0 = "어떻게 될진 몰랐지만, 언제나 그런 예감이 있었어.";
      changesMade++;
    } else if (item.K0 === "절대 변하지 마.") {
      item.K0 = "절대 변하지 마."; // 변경 없음, 유지
      changesMade++;
    } else if (item.K0 === "그들은 모든 것이 다 끝났다고 말해") {
      item.K0 = "사람들은 이제 다 끝났다고들 하지만.";
      changesMade++;
    } else if (item.K0 === "내가 큰 돈을 벌지 못했을 때") {
      item.K0 = "큰돈 한번 못 벌어 봤을 때도.";
      changesMade++;
    } else if (item.K0 === "한 푼도 없었어.") {
      item.K0 = "단 한 푼도 없었지.";
      changesMade++;
    } else if (item.K0 === "하지만 난 항상 비전을 가졌어.") {
      item.K0 = "하지만 언제나 비전은 있었어.";
      changesMade++;
    } else if (item.K0 === "생계를 위해 높은 희망을 가져야 했어.") {
      item.K0 = "살아가려면 드높은 희망을 가져야 했지.";
      changesMade++;
    } else if (item.K0 === "그리고 그것은 정말 볼만한 광경이 될 거야") {
      item.K0 = "정말 볼만한 광경이 펼쳐질 거야.";
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