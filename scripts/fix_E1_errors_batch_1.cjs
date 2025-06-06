const fs = require('fs');
const filePath = 'songs/deep_song_has_no_form.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let songData = JSON.parse(rawData);
  let changesMade = 0;

  // translatedLines[1].LI[0] 수정 (ひらひら)
  if (songData.translatedLines && songData.translatedLines.length > 1 && 
      songData.translatedLines[1].LI && songData.translatedLines[1].LI.length > 0 &&
      songData.translatedLines[1].LI[0].T1 === "ひらひら") {
    songData.translatedLines[1].LI[0].E1 = "가볍게 날리거나 펄럭이는 모습을 나타내는 의태어 또는 부사입니다.";
    changesMade++;
  }

  // translatedLines[2].LI[0] 수정 (僕)
  if (songData.translatedLines && songData.translatedLines.length > 2 &&
      songData.translatedLines[2].LI && songData.translatedLines[2].LI.length > 0 &&
      songData.translatedLines[2].LI[0].T1 === "僕") {
    songData.translatedLines[2].LI[0].E1 = "1인칭 대명사로, 주로 남성이 자신을 가리킬 때 사용하며, 친구나 아랫사람에게 주로 씁니다.";
    changesMade++;
  }

  // translatedLines[2].LI[1] 수정 (は)
  if (songData.translatedLines && songData.translatedLines.length > 2 &&
      songData.translatedLines[2].LI && songData.translatedLines[2].LI.length > 1 &&
      songData.translatedLines[2].LI[1].T1 === "は") {
    songData.translatedLines[2].LI[1].E1 = "제시의 조사로, 문장의 주제('~은/는')를 나타냅니다.";
    changesMade++;
  }

  // translatedLines[2].LI[2] 수정 (笑えた)
  if (songData.translatedLines && songData.translatedLines.length > 2 &&
      songData.translatedLines[2].LI && songData.translatedLines[2].LI.length > 2 &&
      songData.translatedLines[2].LI[2].T1 === "笑えた") {
    songData.translatedLines[2].LI[2].E1 = "동사 '笑う(웃다)'의 가능형 과거형으로, '웃을 수 있었다'는 의미입니다. 예: 昨日、久しぶりに心から笑えた。(어제 오랜만에 진심으로 웃을 수 있었다.)";
    songData.translatedLines[2].LI[2].XE = "昨日、久しぶりに心から笑えた。";
    songData.translatedLines[2].LI[2].XK = "어제 오랜만에 진심으로 웃을 수 있었다.";
    changesMade++;
  }

  // translatedLines[2].LI[3] 수정 (はず)
  if (songData.translatedLines && songData.translatedLines.length > 2 &&
      songData.translatedLines[2].LI && songData.translatedLines[2].LI.length > 3 &&
      songData.translatedLines[2].LI[3].T1 === "はず") {
    songData.translatedLines[2].LI[3].E1 = "강한 추측이나 당연한 예상을 나타내는 형식 명사로, '분명 ~일 것이다', '~할 리가 없다(부정형)' 등의 의미를 만듭니다. 문맥에 따라 '웃을 수 있었을 것이라는 당연한 기대'를 나타냅니다.";
    songData.translatedLines[2].LI[3].XE = "会議は3時に終わるはずだ。";
    songData.translatedLines[2].LI[3].XK = "회의는 3시에 끝날 것이다.";
    changesMade++;
  }

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(songData, null, 2), 'utf-8');
    console.log(`파일 수정 완료: ${filePath} (${changesMade}개 E1 항목 수정됨)`);
  } else {
    console.log("수정할 E1 항목이 없거나 대상 항목을 찾지 못했습니다.");
  }

} catch (error) {
  console.error('스크립트 실행 중 오류 발생:', error);
} 