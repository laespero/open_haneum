const fs = require('fs');
const filePath = './songs/deep_player_one.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(line => {
    if (line.LI && line.LI.length > 0) {
      line.LI.forEach(item => {
        let originalXE = item.XE;
        let originalXK = item.XK;

        if (item.T1 === "込まれ" && line.T0 === "追い込まれてくほどに") {
          item.XE = "彼は困難な状況に追い込まれた。";
          item.XK = "그는 어려운 상황에 몰렸다.";
        } else if (item.T1 === "擦り" && line.T0 === "擦り切れたHP") {
          item.XE = "靴が擦り切れて穴が開いた。";
          item.XK = "신발이 닳아서 구멍이 났다.";
        } else if (item.T1 === "立たない" && line.T0 === "歯が立たないバグったような敵も") {
          item.XE = "彼には全く歯が立たない。";
          item.XK = "그에게는 전혀 상대가 되지 않는다.";
        } else if (item.T1 === "BAN" && line.T0 === "巻き起こせBAN狂わせ") {
          item.XE = "He was banned from the game for cheating.";
          item.XK = "그는 부정행위로 게임에서 추방당했다 (BAN 당했다).";
        } else if (item.T1 === "HP" && line.T0 === "擦り切れたHP") {
          item.XE = "My character\'s HP is low.";
          item.XK = "내 캐릭터의 HP(체력)가 낮아.";
        } else if (item.T1 === "詰んだ" && line.T0 === "詰んだと見せてから正念場") {
          item.XE = "この盤面では完全に詰んだ。";
          item.XK = "이 판국에서는 완전히 (수가 막혀) 졌다 / 끝장이다.";
        } else if (line.T0 === "先天性トップランカー" && item.T1 === "トップランカー") {
          item.XK = "그는 톱 랭커(최상위 순위자)로 유명하다.";
        }

        if (item.XE !== originalXE || item.XK !== originalXK) {
          changesMade++;
        }
      });
    }
  });

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log("[예문 수정 v1] 파일 수정 완료: " + filePath + " (" + changesMade + "개 항목 수정됨)");
  } else {
    console.log("[예문 수정 v1] 수정된 항목이 없습니다.");
  }

} catch (error) {
  console.error('[예문 수정 v1] 스크립트 실행 중 오류 발생:', error);
} 