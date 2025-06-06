const fs = require('fs');
const filePath = './songs/deep_let_it_be.json'; // 실제 파일 경로로 수정

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(item => {
    if (item.T0 === "Shinin' until tomorrow, let it be") {
      item.K0 = "내일이 올 때까지 빛나도록, 그대로 두렴.";
      changesMade++;
    } else if (item.T0 === "Whisper words of wisdom, let it be, be") {
      item.K0 = "지혜의 말을 속삭이네, 순리대로, 순리대로.";
      changesMade++;
    } else if (item.T0 === "And when the broken hearted people living in the world agree") {
      item.K0 = "세상 모든 상처입은 사람들이 동의할 때,";
      changesMade++;
    } else if (item.T0 === "Let it be, let it be, let it be, let it be" && item.K0 === "그냥 두렴, 그냥 두렴, 그냥 두렴, 그냥 두렴.") {
      item.K0 = "순리대로, 순리대로, 순리대로, 순리대로.";
      changesMade++;
    } else if (item.T0 === "And let it be, let it be, let it be, let it be" && item.K0 === "그리고 그냥 두렴, 그냥 두렴, 그냥 두렴, 그냥 두렴.") {
      item.K0 = "그래, 순리대로, 순리대로, 순리대로, 순리대로.";
      changesMade++;
    } else if (item.T0 === "And in my hour of darkness she is standing right in front of me") {
      item.K0 = "내 어둠의 시간 속에 그녀는 바로 내 앞에 서 있네.";
      changesMade++;
    } else if (item.T0 === "When I find myself in times of trouble, Mother Mary comes to me") {
      item.K0 = "내가 힘든 시간에 처했을 때, 어머니 마리아께서 내게 오시네.";
      changesMade++;
    } else if (item.T0 === "For though they may be parted, there is still a chance that they will see") {
      item.K0 = "비록 헤어져 있을지라도, 그들이 깨달을 기회는 아직 남아있네.";
      changesMade++;
    } else if (item.T0 === "And when the night is cloudy there is still a light that shines on me") {
      item.K0 = "흐린 밤에도 여전히 나를 비추는 빛이 있네.";
      changesMade++;
    } else if (item.T0 === "Speaking words of wisdom, let it be") {
      item.K0 = "지혜의 말씀을 하시네, 순리대로.";
      changesMade++;
    } else if (item.T0 === "Whisper words of wisdom, let it be") {
      item.K0 = "지혜의 말을 속삭이네, 순리대로.";
      changesMade++;
    } else if (item.T0 === "There will be an answer, let it be") {
      item.K0 = "해답이 있을 것이니, 순리대로.";
      changesMade++;
    } else if (item.T0 === "I wake up to the sound of music, Mother Mary comes to me") {
      item.K0 = "음악 소리에 잠에서 깨어나면, 어머니 마리아께서 내게 오시네.";
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