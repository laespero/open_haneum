const fs = require('fs');
const filePath = './songs/deep_player_one.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(line => {
    if (line.LI && line.LI.length > 0) {
      line.LI.forEach(item => {
        let originalE1 = item.E1;

        // T1이 영어 단어/약자인 경우 E1을 한국어 설명으로 수정
        if (item.T1 === "HP") {
          item.E1 = "게임에서 캐릭터의 체력이나 생명력을 나타내는 '히트 포인트(Hit Points)' 또는 '헬스 포인트(Health Points)'의 줄임말이에요. 보통 '체력'이라고 이해하면 쉬워요.";
        } else if (item.T1 === "CLEAR") {
          item.E1 = "게임에서 특정 단계나 목표를 '완료했다', '성공했다'는 의미로 사용돼요. '클리어했다'고 말하죠.";
        } else if (item.T1 === "BAN") {
          item.E1 = "게임이나 온라인 커뮤니티 등에서 특정 사용자나 콘텐츠를 '금지하다', '추방하다'라는 뜻으로 쓰여요. 또는 '금지된 것' 자체를 의미하기도 해요.";
        } else if (item.T1 === "GAME") {
          item.E1 = "놀이나 경기를 의미하는 영어 단어예요. 컴퓨터 게임, 보드 게임 등 다양한 종류가 있죠.";
        } else if (item.T1 === "Task") {
          if (item.K1 === "해야 할 일이나 과업, 과제." || item.K1 === "과제") { // 기존 K1 값들을 고려
             item.E1 = "주어진 의무나 과제로서 해야 할 특정한 일을 의미해요. 보통 '일', '과제', '임무' 등으로 번역돼요.";
          } else if (item.K1 === "과제 (반복 강조)") {
             item.E1 = "앞의 'Task'를 반복하며, 해야 할 일이 여러 개 있거나 계속됨을 강조하는 표현이에요.";
          } else if (item.K1 === "과제 (강력 반복 강조)") {
             item.E1 = "매우 여러 번 반복하여, 엄청나게 많은 과제나 그로 인한 압박감을 아주 강하게 나타내는 표현이에요.";
          }
        } else if (item.T1 === "EZ") {
          item.E1 = "영단어 'Easy(쉬운)'의 줄임말로, 주로 게임에서 '아주 쉽다', '간단하다'는 의미로 사용돼요.";
        } else if (item.T1 === "GG") {
          item.E1 = "주로 게임이 끝났을 때 하는 말로, 'Good Game(좋은 게임이었다)'의 줄임말이에요. 서로의 플레이를 칭찬하는 의미도 있고, 때로는 패배를 인정하는 의미로도 쓰여요.";
        } else if (item.T1 === "Tick") {
           // K1을 확인하여 구분
          if (item.K1 === "틱") { // 첫번째 Tick으로 가정 (가장 일반적인 의미)
            item.E1 = "시계 소리처럼 '똑딱'거리는 소리를 나타내는 의성어예요. 시간이 흘러가는 것을 표현할 때 자주 쓰이죠.";
          } else if (item.K1 === "틱 (반복)") { // 만약 반복을 나타내는 K1이 있다면
            item.E1 = "앞의 'Tick' 소리가 반복되는 것을 나타내며, 시간이 계속 흐르거나 긴박한 상황을 표현할 수 있어요.";
          }
        } else if (item.T1 === "Tack") {
          item.E1 = "보통 '택' 또는 '탁' 하는, 무언가 가볍게 부딪히거나 고정시키는 소리, 또는 그런 동작을 의미해요. 문맥에 따라 여러 뜻으로 쓰일 수 있어요.";
        } else if (item.T1 === "BOOM") {
          item.E1 = "'쾅!', '펑!' 하는 큰 폭발음이나 충격음을 나타내는 의성어예요.";
        }
        // 일본어 단어의 E1 필드를 한국어 설명으로 (이전 스크립트에서 일부 한국어 설명이 이미 적용되었을 수 있음, 필요한 경우 여기서 추가/수정)
        else if (item.T1 === "どうしようもない") {
          item.E1 = "어찌할 방법이 없거나 희망이 없는 절망적인 상황을 나타내는 표현이에요. '어쩔 도리가 없다', '속수무책이다'라는 뜻이죠.";
        } else if (item.T1 === "ほど") {
          item.E1 = "정도나 수준을 나타내는 말이에요. '너무 ~해서 ~할 정도이다'처럼 쓰여요.";
        } else if (item.T1 === "土壇場") {
          item.E1 = "일이 더 이상 어찌할 수 없는 마지막 극한 상황이나, 승패 등이 결정되는 매우 중요한 순간을 의미해요.";
        } else if (item.T1 === "見せ場") {
          item.E1 = "연극, 영화, 이야기 등에서 가장 흥미롭거나 인상적인 장면, 또는 가장 중요한 부분을 뜻해요. '하이라이트'와 비슷한 의미죠.";
        } else if (item.T1 === "もん") {
          item.E1 = "\'것\', \'물건\'을 의미하는 일본어 \'もの(모노)\'가 구어체에서 줄어든 말이에요. 때로는 어떤 수준이나 기준을 암시하기도 해요.";
        } else if (item.T1 === "なん") {
          item.E1 = "일본어 구어체에서 질문을 하거나 강한 제안을 할 때 쓰이는 \'なんじゃないの(난쟈나이노)\'의 일부예요. \'...것 아니야?\', \'...해야 하지 않겠어?\', \'...잖아?\', \'...인가?\' 정도의 느낌을 전달해요.";
        } else if (item.T1 === "ぜ") {
          item.E1 = "주로 남성이 사용하는 문장 끝맺음 조사로, 강조나 확신, 또는 \'해보자!\'와 같은 느낌을 더해줘요.";
        } else if (line.T0 === "容赦なく泣く泣くTick Tick Tack...BOOM!!" && item.T1 === "泣く" && item.K1 === "계속 울다") {
          item.E1 = "\'울다\'라는 뜻의 \'泣く(나쿠)\'를 반복 사용하여, 매우 많이 또는 계속해서 우는 모습을 강조하는 표현이에요.";
        } else if (line.T0 === "先天性トップランカー" && item.T1 === "トップランカー") {
          item.E1 = "영어 \'top ranker\'에서 온 외래어로, 특정 분야나 경쟁에서 최상위 순위를 차지한 사람이나 팀을 의미해요. 게임, 스포츠, 학문 등 다양한 분야에서 쓰일 수 있어요.";
        }
        // ... (다른 일본어 T1에 대한 E1 한국어 설명 추가) ...

        if (item.E1 !== originalE1) {
          changesMade++;
        }
      });
    }
  });

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log("[E1 한국어 설명 수정] 파일 수정 완료: " + filePath + " (" + changesMade + "개 항목 수정됨)");
  } else {
    console.log("[E1 한국어 설명 수정] 수정된 항목이 없습니다.");
  }

} catch (error) {
  console.error('[E1 한국어 설명 수정] 스크립트 실행 중 오류 발생:', error);
} 