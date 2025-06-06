const fs = require('fs');
const filePath = 'songs/deep_song_has_no_form.json'; // 상대 경로 수정

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(item => {
    if (item.T0 === "僕は笑えたはず" && item.K0 === "나는 웃을 수 있었어야 해.") {
      item.K0 = "나는 웃을 수 있었을 텐데";
      changesMade++;
    } else if (item.T0 === "僕らが残した" && item.K0 === "우리가 남겼어") {
      item.K0 = "우리가 남긴";
      changesMade++;
    } else if (item.T0 === "きっと夢が終わる" && item.K0 === "분명 꿈은 끝나겠지.") {
      item.K0 = "분명 꿈이 끝날 거야";
      changesMade++;
    } else if (item.T0 === "伸ばす腕は何もつかめない" && item.K0 === "뻗은 팔은 아무것도 잡을 수 없다.") {
      item.K0 = "뻗은 팔은 아무것도 잡지 못해";
      changesMade++;
    } else if (item.T0 === "僕は何を失った?" && item.K0 === "나는 무엇을 잃었나?") {
      item.K0 = "나는 무엇을 잃었을까?";
      changesMade++;
    } else if (item.T0 === "君の支えになりたい" && item.K0 === "네 의지가 되고 싶어.") {
      item.K0 = "너의 버팀목이 되고 싶어";
      changesMade++;
    } else if (item.T0 === "それは光となった" && item.K0 === "그것은 빛이 되었어.") {
      item.K0 = "그것은 빛이 되었어.";
      changesMade++;
    } else if (item.T0 === "頼りのない僕だけれど" && item.K0 === "미숙한 나지만") {
      item.K0 = "믿음직 하지 못한 나지만";
      changesMade++;
    }
  });

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`파일 수정 완료: ${filePath} (${changesMade}개 항목 수정됨)`);
  } else {
    console.log("수정된 항목이 없습니다. K0 값이나 T0 값을 다시 확인해주세요.");
  }

} catch (error) {
  console.error('스크립트 실행 중 오류 발생:', error);
} 