const fs = require('fs');
const filePath = 'songs/deep_no_regret.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(line => {
    if (line.LI) {
      line.LI.forEach(item => {
        if (item.T1 === "見つめていて") {
          item.E1 = "'주시하다', '응시하다'라는 의미의 동사 '見つめる'의 활용형으로, '계속 주시하고 있어'라는 의미를 전달합니다.";
          changesMade++;
        }
        if (item.T1 === "終わらせたり") {
          item.E1 = "'끝내다'라는 동사 '終わらせる'의 활용형으로, 여러 행동 중 하나로 '끝내거나' 하는 의미를 나타냅니다.";
          changesMade++;
        }
        if (item.T1 === "の" && item.E1.includes("감정을 강조하거나 설명하는 역할")) {
          item.E1 = "문장 끝에 쓰여, 설명, 강조, 또는 부드러운 질문의 느낌을 더하는 종조사입니다.";
          changesMade++;
        }
        if (item.T1 === "の" && item.E1.includes("설명이나 물음을 나타냅니다")) {
          item.E1 = "문장 끝에 쓰여, 설명, 강조, 또는 부드러운 질문의 느낌을 더하는 종조사입니다.";
          changesMade++;
        }
        if (item.T1 === "の" && item.E1.includes("문장 끝에 오며 설명이나 감정을 부드럽게 전달하는 종조사")) {
          item.E1 = "문장 끝에 쓰여, 설명, 강조, 또는 부드러운 질문의 느낌을 더하는 종조사입니다.";
          changesMade++;
        }
        if (item.T1 === "の" && item.E1.includes("설명이나 강조를 나타내는 종조사입니다. 설명이나 강조를 나타내는 종조사입니다")) {
          item.E1 = "문장 끝에 쓰여, 설명, 강조, 또는 부드러운 질문의 느낌을 더하는 종조사입니다.";
          changesMade++;
        }
        if (item.T1 === "だって" && item.E1.includes("예시를 들거나 조건을 나\n타낼 때 사용합니다.")) {
            item.E1 = "명사에 붙어 '~라도', '~이어도'라는 의미를 나타내는 조사입니다. 조건을 나타내거나, '~라니'처럼 놀람을 표현할 때도 씁니다.";
            changesMade++;
        }
        if (item.T1 === "会いたい" && item.E1.includes("희망을 나타내는 접미사 '-たい'가 결합된 형태로")) {
            item.E1 = "'만나다'(会う) 동사에 '-고 싶다'(たい)는 희망의 의미가 더해진 표현입니다.";
            changesMade++;
        }
        if (item.T1 === "ズルい" && item.E1.includes("약삭빠르거나 교활한 성격을 나타내는 형용사입니다")) {
            item.E1 = "'교활하다', '치사하다' 등 공정하지 못하거나 이기적인 태도를 나타내는 형용사입니다.";
            changesMade++;
        }
        if (item.T1 === "お洒落" && item.E1.includes("'お'가 접두사로 붙어 정중한 표현\n이 되었습니다.")) {
            item.E1 = "'멋을 냄', '세련됨'을 의미하는 명사입니다. 옷차림이나 외모를 멋지게 꾸미는 것을 말합니다.";
            changesMade++;
        }
        if (item.T1 === "叱られて" && item.E1.includes("수동형이므로 주\n어가 타인으로부터 어떤 행동을 당함을 나타냅니다.")) {
            item.E1 = "'꾸중을 듣다'(叱られる)의 활용형으로, 남에게 꾸중을 듣는 상황을 의미합니다.";
            changesMade++;
        }
        if (item.T1 === "ちゃんとしてる" && item.E1.includes("어떤 행동을 하고 있는 중임을 나타냅니다.")) {
            // 이미 존재하는 "ちゃんと"의 설명을 참고하여 더 명확하게 수정
            item.E1 = "'제대로 하다', '착실하게 하다'의 구어체 표현입니다.";
            changesMade++;
        }
        if (item.T1 === "どんな" && item.E1.includes("불특정한 대상을 질문하거나 가리킬 때 사용하는 의문사 혹은 지시사입니다.")) {
            item.E1 = "'어떤'이라는 의미로, 종류나 내용을 물을 때 사용하는 말입니다.";
            changesMade++;
        }
        if (item.T1 === "詳しくて" && item.E1.includes("문장을 연결하거나 이유를 나타냅\n니다.")) {
            item.E1 = "'자세하다', '상세하다'(詳しい)의 활용형으로, 무언가에 대해 잘 알고 있음을 의미합니다.";
            changesMade++;
        }
        if (item.T1 === "ちゃんと" && item.E1.includes("행동을 강조하거나 정중함을 표현할 때 씁\n니다.")) {
            item.E1 = "'제대로', '확실히', '분명히'라는 의미로, 규칙이나 기대에 맞게 행동하는 모습을 나타내는 부사입니다.";
            changesMade++;
        }
        if (item.T1 === "ずるい" && item.E1.includes("여기서는 '너무하다'라\n는 의미로 해석됩니다.")) {
            item.E1 = "'교활하다', '치사하다' 또는 상황에 따라 '너무하다' 등 부정적인 의미로 사용되는 형용사입니다.";
            changesMade++;
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