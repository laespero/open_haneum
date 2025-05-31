const fs = require('fs');
const filePath = './songs/deep_player_one.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(line => {
    if (line.T0 === "相も変わらずまだ土壇場") {
      if (line.G0 && line.G0.includes("'相'은 '서로'")) { // 기존 problematic G0 내용 포함 여부 확인
        line.G0 = "이 문장은 '相も変わらず(あいかわらず)'와 'まだ土壇場(まだどたんば)' 두 부분으로 나뉩니다. '相も変わらず'는 '여전히', '변함없이'라는 뜻의 관용구입니다. 'まだ土壇場'은 '아직 막다른 상황' 또는 '아직 궁지'라는 의미입니다. 전체적으로 '여전히 변함없이 막다른 상황에 처해 있다'는 긴박한 상황을 나타냅니다.";
        changesMade++;
      }
    }
  });

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log("[G0 수정 - 相も変わらず] 파일 수정 완료: " + filePath + " (" + changesMade + "개 항목 수정됨)");
  } else {
    console.log("[G0 수정 - 相も変わらず] 수정 대상 G0 필드가 없거나 이미 수정되었습니다.");
  }

} catch (error) {
  console.error('[G0 수정 - 相も変わらず] 스크립트 실행 중 오류 발생:', error);
} 