const fs = require('fs');
const filePath = 'songs/deep_song_has_no_form.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let songData = JSON.parse(rawData);
  let changesMade = 0;

  if (songData.translatedLines && songData.translatedLines.length > 0) {
    // 첫 번째 translatedLines 항목의 E1 복원
    if (songData.translatedLines[0] && songData.translatedLines[0].LI) {
      const liArray = songData.translatedLines[0].LI;
      if (liArray[0] && liArray[0].T1 === "薄紅") {
        liArray[0].E1 = "'옅은 붉은색'을 의미하는 명사로, 연분홍이나 살구색에 가까운 부드러운 색상을 나타냅니다.";
        changesMade++;
      }
      if (liArray[1] && liArray[1].T1 === "の") {
        liArray[1].E1 = "소유나 속격을 나타내는 조사로, 앞의 명사가 뒤의 명사를 수식하는 관계를 만듭니다.";
        changesMade++;
      }
      if (liArray[2] && liArray[2].T1 === "時") {
        liArray[2].E1 = "시간을 의미하는 명사로, 특정한 순간이나 시기를 나타냅니다.";
        changesMade++;
      }
      if (liArray[3] && liArray[3].T1 === "を") {
        liArray[3].E1 = "목적격 조사로, 동사의 대상이 되는 것을 나타냅니다.";
        changesMade++;
      }
      if (liArray[4] && liArray[4].T1 === "彩る") {
        liArray[4].E1 = "색을 입히거나 아름답게 꾸미는 것을 의미하는 동사입니다.";
        changesMade++;
      }
      if (liArray[5] && liArray[5].T1 === "花びら") {
        liArray[5].E1 = "꽃의 잎을 의미하는 명사입니다.";
        changesMade++;
      }
    }

    // 두 번째 translatedLines 항목의 E1 복원
    if (songData.translatedLines.length > 1 && songData.translatedLines[1] && songData.translatedLines[1].LI) {
      const liArray = songData.translatedLines[1].LI;
      if (liArray[0] && liArray[0].T1 === "ひらひら") {
        liArray[0].E1 = "가볍게 날리거나 펄럭이는 모습을 나타내는 부사입니다.";
        changesMade++;
      }
      if (liArray[1] && liArray[1].T1 === "舞う") {
        liArray[1].E1 = "춤추거나 가볍게 날리는 동작을 나타내는 동사입니다.";
        changesMade++;
      }
      if (liArray[2] && liArray[2].T1 === "光") {
        liArray[2].E1 = "빛을 의미하는 명사입니다.";
        changesMade++;
      }
      if (liArray[3] && liArray[3].T1 === "の") {
        liArray[3].E1 = "소유격 조사로, 앞의 명사가 뒤의 명사를 수식하는 관계를 나타냅니다.";
        changesMade++;
      }
      if (liArray[4] && liArray[4].T1 === "中") {
        liArray[4].E1 = "무엇의 내부나 속을 의미하는 명사입니다.";
        changesMade++;
      }
    }
  }

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(songData, null, 2), 'utf-8');
    console.log(`파일 복원 완료: ${filePath} (${changesMade}개 E1 항목 복원됨)`);
  } else {
    console.log("복원할 E1 항목이 없거나 T1 값 또는 인덱스가 일치하지 않습니다.");
  }

} catch (error) {
  console.error('스크립트 실행 중 오류 발생:', error);
} 