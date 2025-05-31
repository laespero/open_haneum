const fs = require('fs');
const filePath = 'songs/deep_yes_gladly.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  
  // 원본 K0 값을 저장하기 위한 복사본 생성 (깊은 복사)
  const originalData = JSON.parse(JSON.stringify(data));
  let actualChangesMade = 0;

  // 1. 기존 번역 개선 규칙 적용
  data.translatedLines.forEach(item => {
    if (item.T0 === "「・・・ーーー・・・」" && item.K0 === "「・・・ーーー・・・」(SOS 신호)") {
      item.K0 = "・・・ーーー・・・";
    } else if (item.T0 === "嫌なこと思い出して" && item.K0 === "싫은 일을 떠올려.") {
      item.K0 = "싫은 일을 떠올려";
    } else if (item.T0 === "『はい喜んであなた方のために』" && item.K0 === "『네, 기쁘게 당신들을 위해』") {
      item.K0 = "『네, 기꺼이 여러분을 위해』"; // 이 부분은 아래에서 다시 작은따옴표로 변경됨
    } else if (item.T0 === "さぁ!奏でろハクナマタタな音は" && item.K0 === "자! 하쿠나마타타 같은 소리를 연주해!") {
      item.K0 = "자! 연주해, 하쿠나마타타 같은 음악을!";
    } else if (item.T0 === "うっちゃれ正義の超人たちを" && item.K0 === "버려진 정의의 초인들을") {
      item.K0 = "내팽개쳐라, 정의의 초인들을!";
    } else if (item.T0 === "奈落音頭奏でろ" && item.K0 === "나락 음도를 연주해라.") {
      item.K0 = "나락의 장단을 울려라";
    } else if (item.T0 === "わからずやに盾" && item.K0 === "이해하지 못하는 사람에게 반대해") {
      item.K0 = "고집불통에게 대항해";
    } else if (item.T0 === "隠せ笑える他人のオピニオン" && item.K0 === "숨길 수 있는 타인의 웃음의 의견") {
      item.K0 = "감춰, 남들의 우스운 의견 따위";
    } else if (item.T0 === "差し伸びてきた手" && item.K0 === "내밀어져 온 손") {
      item.K0 = "뻗어 온 손길";
    } else if (item.T0 === "嫌嫌で生き延びて" && item.K0 === "싫어 싫어하며 살아남아") {
      item.K0 = "마지못해 살아남아";
    } else if (item.T0 === "『はい謹んで』" && item.K0 === "『예, 삼가서』") {
      item.K0 = "『네, 삼가』"; // 이 부분은 아래에서 다시 작은따옴표로 변경됨
    } else if (item.T0 === "任せたきりワガママな言葉" && item.K0 === "맡겨둔 채로 제멋대로인 말") {
      item.K0 = "전부 맡겨놓고 내뱉는 제멋대로인 말";
    } else if (item.T0 === "さながら正義仕立て" && item.K0 === "마치 정의로 꾸민 것처럼") {
      item.K0 = "마치 정의의 사도인 양";
    } else if (item.T0 === "鳴らせ君の3～6マス") {
      item.K0 = "울려라, 너의 산로쿠마스 리듬을";
      item.R0 = "나라세 키미 노 산 카라 로쿠 마스";
    } else if (item.T0 === "救われたのは僕のうちの1人で" && item.K0 === "구출된 것은 나의 가족 중 한 명으로.") {
      item.K0 = "구원받은 건 우리 중 나 하나뿐이고";
    } else if (item.T0 === "慣らせ君の病の町を" && item.K0 === "익숙해져라 너의 병의 마을을") {
      item.K0 = "길들여, 너의 병든 거리를";
    } else if (item.T0 === "はい謹んであなた方のために" && item.K0 === "예, 삼가 여러분을 위해") {
      item.K0 = "네, 삼가 여러분을 위해"; // 『 』가 없으므로 아래 로직에서 처리 안됨
    } else if (item.T0 === "分かれ道思うがままGo to Earth" && item.K0 === "갈림길 마음대로 지구로 가라") {
      item.K0 = "갈림길, 마음 가는 대로 Go to Earth";
    } else if (item.T0 === "欠けたとこが希望 (Save this game ,Mr.A.) 救われたのは僕のうちの1人で" && item.K0 === "부족한 부분이 희망 (이 게임을 저장하세요, Mr.A.) 구원받은 건 나 혼자였어") {
      item.K0 = "부족한 부분이 희망 (Save this game, Mr.A.) 구원받은 건 나 하나뿐이었고";
    } else if (item.T0 === "『出来ることなら出来るとこまで』" && item.K0 === "『할 수 있는 일이라면 할 수 있는 한까지』") {
      item.K0 = "『할 수 있는 일이라면, 할 수 있는 데까지』"; // 이 부분은 아래에서 다시 작은따옴표로 변경됨
    } else if (item.T0 === "・・・ーーー・・・" && item.K0 === "SOS 신호 (・・・ーーー・・・)") {
      item.K0 = "・・・ーーー・・・";
    }
  });

  // 2. 『 』 기호를 작은따옴표 ' '로 변경하는 규칙 적용
  data.translatedLines.forEach(item => {
    if (typeof item.K0 === 'string' && item.K0.startsWith('『') && item.K0.endsWith('』')) {
      item.K0 = "\"" + item.K0.substring(1, item.K0.length - 1) + "\"";
    } else if (typeof item.K0 === 'string' && item.K0.startsWith("'") && item.K0.endsWith("'")) {
      // 이미 작은따옴표로 바뀐 경우 큰따옴표로 재변경
      item.K0 = "\"" + item.K0.substring(1, item.K0.length - 1) + "\"";
    }
  });
  
  // 3. 원본과 비교하여 실제 변경된 항목 수 계산
  for (let i = 0; i < data.translatedLines.length; i++) {
    if (data.translatedLines[i].K0 !== originalData.translatedLines[i].K0) {
      actualChangesMade++;
    }
  }

  if (actualChangesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`파일 수정 완료: ${filePath} (${actualChangesMade}개 항목 수정됨)`);
  } else {
    console.log("수정된 항목이 없습니다.");
  }

} catch (error) {
  console.error('스크립트 실행 중 오류 발생:', error);
} 