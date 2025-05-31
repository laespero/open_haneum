const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep2_like_addicted_poison.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          let originalE1 = item.E1;
          let t1 = item.T1;

          // E1 수정 규칙 (선별적)
          if (t1 === "谁" && originalE1 === "누군가를 가리키는 대명사입니다.") {
            item.E1 = "의문 대명사. '누구'라는 의미로, 사람을 물을 때 사용합니다.";
          } else if (t1 === "总" && originalE1 === "항상 또는 전체를 의미하는 부사입니다.") {
            item.E1 = "부사. '늘', '항상', '언제나'의 의미로 어떤 상황이나 행동이 변함없이 지속되거나 반복됨을 나타냅니다. 또는 '총괄하여', '전부'라는 의미도 가집니다. 문맥에 따라 적절히 해석해야 합니다.";
          } else if (t1 === "时候" && originalE1 === "특정 시점이나 기간을 나타내는 명사입니다.") {
            item.E1 = "명사. '때', '시간', '시절'. 특정 시점이나 기간을 나타냅니다. 예를 들어 '小时候(xiǎoshíhou)'는 '어릴 적'을, '危险时候(wēixiǎn shíhou)'는 '위험한 때'를 의미합니다.";
          } else if (t1 === "中" && originalE1 === "어떤 상황에 처하거나 영향을 받는 것을 나타내는 동사입니다.") {
            item.E1 = "동사. (zhòng) '맞다', '당첨되다', '(독 등에) 중독되다'. (zhōng) '가운데', '중간'. 여기서는 '中毒(zhòngdú, 중독되다)'의 용법으로 '독에 걸리다', '독에 빠지다'라는 의미로 사용되었습니다 (성조: zhòng).";
          } else if (t1 === "住" && originalE1 === "동사 뒤에 붙어 동작의 완료나 결과를 나타내는 보어입니다.") {
            item.E1 = "결과 보어. 동사 뒤에 쓰여 동작의 결과로 '고정됨', '멈춤', '확실함' 등의 상태를 나타냅니다. 예를 들어 '记住(jìzhu, 기억하다)', '抓住(zhuāzhù, 꽉 잡다)'와 같이 쓰입니다. '藏不住(cáng bu zhù)'에서는 '숨겨서 그 상태를 유지할 수 없다' 즉, '숨길 수 없다'는 의미를 나타냅니다.";
          } else if (t1 === "在乎" && originalE1 === "마음속으로 중요하게 여기거나 신경 쓰는 것을 의미하는 동사입니다.") {
            item.E1 = "동사. '마음에 두다', '신경 쓰다'. 어떤 사람이나 일을 중요하게 생각하여 관심을 가지는 것을 의미합니다. 부정형은 '不在乎(bú zàihu, 신경 쓰지 않다)'입니다.";
          } else if (t1 === "装" && originalE1 === "옷을 입거나 꾸미는 것을 의미하는 동사입니다. 여기서는 태도를 꾸미는 것을 나타냅니다.") {
            item.E1 = "동사. '꾸미다', '~인 체하다', '가장하다'. 물건을 담거나 설치하는 의미도 있습니다. 여기서는 '装酷(zhuāng kù, 쿨한 척하다)'의 일부로, 태도를 꾸미는 것을 나타냅니다.";
          } else if (t1 === "酷" && originalE1 === "멋있거나 시원한 느낌을 주는 형용사입니다.") {
            item.E1 = "형용사. (영어 cool 음차) '멋있다', '쿨하다'. 사람의 외모, 행동, 스타일 등이 매우 멋지고 인상적임을 나타냅니다.";
          } else if (t1 === "monday blue" && originalE1 === "월요병을 뜻하는 영어 표현입니다.") {
            item.E1 = "명사구(영어). '월요병'. 주말이 끝난 후 월요일에 느끼는 피로감이나 우울감을 이르는 말입니다.";
          } else if (t1 === "隐藏" && originalE1 === "무언가를 숨기거나 감추는 동사입니다.") {
            item.E1 = "동사. '숨기다', '감추다'. 물건이나 사실, 감정 등을 드러나지 않도록 하는 것을 의미합니다. '藏(cáng)'보다 다소 문어적인 느낌을 줄 수 있습니다.";
          } else if (t1 === "pretty cool" && originalE1 === "매우 멋지다는 뜻의 영어 구문입니다.") {
            item.E1 = "형용사구(영어). '꽤 멋진', '상당히 괜찮은'. 'pretty'는 부사로 '꽤', '상당히'의 의미를 가지며, 'cool'은 형용사로 '멋진', '근사한'의 의미를 가집니다.";
          } else if (t1 === "lots of work" && originalE1 === "많은 양의 일을 의미하는 영어 구문입니다.") {
            item.E1 = "명사구(영어). '많은 일', '많은 업무'. 처리해야 할 일이 산적해 있음을 나타냅니다.";
          } else if (t1 === "brain just fart" && originalE1 === "갑자기 멍해지거나 바보 같은 생각을 하는 것을 비유하는 영어 관용구입니다.") {
            item.E1 = "관용구(영어). (직역: 뇌가 방귀를 뀌다) '머리가 갑자기 멍해지다', '순간적으로 바보 같은 생각을 하다/말을 하다'라는 의미의 비격식적 표현입니다. 여기서는 갑자기 아무 생각이 나지 않거나 혼란스러운 상태를 익살스럽게 표현한 것입니다.";
          } else if (t1 === "沙滩" && originalE1 === "해변이나 강가에 있는 모래밭을 의미하는 명사입니다.") {
            item.E1 = "명사. '모래사장', '해변'. 바닷가나 강가에 모래가 넓게 펼쳐져 있는 곳을 말합니다.";
          } else if (t1 === "一道一道" && originalE1 === "하나하나, 한 줄기 한 줄기를 의미하는 표현입니다.") {
            item.E1 = "수량사 중첩. '한 줄기 한 줄기', '하나하나 차례로'. 양사 '道(dào)'는 빛줄기, 길, 강물, 명령, 요리 등을 세는 단위로 쓰이며, 중첩되어 연속됨을 나타냅니다. 여기서는 햇빛이 여러 줄기로 비치는 모습을 묘사합니다.";
          } else if (t1 === "这一刻" && originalE1 === "지금 이 순간을 가리키는 시간 표현입니다.") {
            item.E1 = "시간 명사구. '바로 이 순간', '지금 이 때'. 현재의 특정 시점을 강조하여 나타냅니다.";
          }

          if (originalE1 !== item.E1) {
            changesMade++;
            console.log(`T0: "${line.T0}" | T1: "${t1}"`);
            console.log(` - E1 (Old): "${originalE1}"`);
            console.log(` - E1 (New): "${item.E1}"`);
            console.log('---');
          }
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} E1 field changes.`);
    } else {
      console.log(`\nNo E1 fields needed an update in ${filePath} based on the current selective rules.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 