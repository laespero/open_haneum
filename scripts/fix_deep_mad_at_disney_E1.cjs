const fs = require('fs');
const filePath = './songs/deep_mad_at_disney.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(line => {
    if (line.LI && line.LI.length > 0) {
      line.LI.forEach(item => {
        // T1: to 개선
        if (line.T0 === "What the hell is love supposed to feel like?" && item.T1 === "to") {
          if (item.E1 === "부정사(to 부정사)를 만드는 전치사입니다.") {
            item.E1 = "주로 동사 앞에 쓰여 '~하는 것', '~하기 위해' 등의 의미를 만드는 역할을 합니다. 여기서는 'to feel'(느끼는 것)처럼 사용되었어요.";
            changesMade++;
          }
        }

        // T1: shooting 개선
        if (line.T0 === "Had me wishing on a shooting star" && item.T1 === "shooting") {
          if (item.E1 === "'shoot'의 현재분사형으로, 여기서는 '별똥별'을 수식하는 형용사 역할을 합니다.") {
            item.E1 = "'shoot(쏘다)'의 형태가 바뀐 것으로, 여기서는 'shooting star(별똥별)'처럼 명사를 꾸며주는 역할을 해요. '빠르게 떨어지는 별' 같은 느낌을 줍니다.";
            changesMade++;
          }
        }

        // T1: star 개선
        if (line.T0 === "Had me wishing on a shooting star" && item.T1 === "star") {
          if (item.E1 === "하늘의 별을 의미하는 명사로, 여기서는 '별똥별'을 의미합니다.") {
            item.E1 = "일반적으로 '별'을 의미하지만, 이 노래에서는 'shooting star'의 일부로 쓰여 '별똥별'을 나타내요.";
            changesMade++;
          }
        }
        
        // T1: ain't 개선
        if (line.T0 === "The prince ain't sleeping when he takes his sleeping beauty" && item.T1 === "ain't") {
            if (item.E1 === "'am not/is not/are not'의 비격식 표현입니다. 여기서는 'is not'의 의미로 사용되었습니다.") {
                item.E1 = "'is not' 또는 'are not' 등을 줄여서 편하게 말할 때 쓰는 표현이에요. 여기서는 'is not sleeping' (잠자고 있지 않다)의 의미로 쓰였어요. 정식 문법은 아니지만, 노래 가사나 일상 대화에서 종종 들을 수 있어요.";
                changesMade++;
            }
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