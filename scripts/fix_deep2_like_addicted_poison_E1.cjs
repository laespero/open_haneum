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
          let originalE1 = item.E1; // 변경 전 E1 값 저장
          let t1 = item.T1;

          // E1 수정 규칙 시작
          if (t1 === "一天") {
            item.E1 = "명사. 시간의 단위로, '하루(24시간)'를 의미합니다. 하루 동안의 시간을 가리킵니다.";
          } else if (t1 === "的") {
            item.E1 = "구조 조사. 명사나 대명사 뒤에 쓰여 소유나 수식 관계를 나타냅니다. 대표적으로 '~의'와 같이 해석됩니다.";
          } else if (t1 === "时间") {
            item.E1 = "명사. 때의 흐름, 또는 어느 한 시점으로부터 다른 시점까지의 사이를 의미합니다. 여기서는 '시간'이라는 일반적인 개념으로 사용되었습니다.";
          } else if (t1 === "其实") {
            item.E1 = "부사. 실제로, 사실은. 문장 앞에서 실제 상황이나 화자의 솔직한 생각을 나타낼 때 사용됩니다.";
          } else if (t1 === "说") {
            item.E1 = "동사. 말하다, 이야기하다. 생각이나 의견을 언어로 표현하는 행위를 나타냅니다. '말하기에는', '따지자면' 등으로 해석될 수도 있습니다.";
          } else if (t1 === "多") {
            item.E1 = "형용사. 수량이나 정도가 많음을 나타냅니다. 반의어는 '少(shǎo, 적다)'입니다.";
          } else if (t1 === "算") {
            item.E1 = "동사. 계산하다, 셈하다. 여기서는 '...라고 여기다', '...라고 치다'의 의미로 사용되어 '不算多'는 '많다고 할 수 없다', '많은 편은 아니다'로 해석됩니다.";
          } else if (t1 === "好多") {
            item.E1 = "수량 형용사. '아주 많다', '꽤 많다'는 의미로, '很多(hěn duō)'보다 구어적인 느낌을 줍니다.";
          } else if (t1 === "时钟") {
            item.E1 = "명사. 시계. 시간을 알려주는 기계 장치를 의미합니다.";
          } else if (t1 === "圈") {
            item.E1 = "명사. 원형, 동그라미. 또는 동사로 '돌다', '한 바퀴 돌다'라는 의미도 있습니다. 여기서는 시계의 문자판이나 시계 바늘이 그리는 원을 연상시킵니다.";
          } else if (t1 === "足够") {
            item.E1 = "부사 또는 동사. 충분하다, 넉넉하다. 필요한 양이나 정도에 도달했음을 나타냅니다.";
          } else if (t1 === "想念") {
            item.E1 = "동사. 그리워하다, 보고 싶어 하다. 멀리 있거나 만날 수 없는 대상을 애틋하게 생각하는 마음을 나타냅니다.";
          } else if (t1 === "旁边") {
            item.E1 = "명사. 옆, 곁. 어떤 대상의 좌우 가까운 곳을 가리킵니다.";
          } else if (t1 === "谁") {
            item.E1 = "대명사. 누구. 사람을 물을 때 쓰는 의문 대명사입니다.";
          } else if (t1 === "怎么") {
            item.E1 = "부사. 왜, 어째서 (이유를 물음). 또는 '어떻게' (방식을 물음). 여기서는 이유를 묻는 '왜', '어째서'의 의미로 쓰였습니다.";
          } else if (t1 === "没") {
            item.E1 = "부사. (동사나 형용사 앞에 쓰여) ...하지 않았다, ...이 없다. 과거의 동작이나 상태를 부정할 때 주로 사용됩니다. '没有(méiyǒu)'와 같습니다.";
          } else if (t1 === "看过") {
            item.E1 = "동사구. '看(kàn, 보다)'와 동태조사 '过(guo, ~한 적이 있다)'가 결합된 형태로, '본 적이 있다'는 경험을 나타냅니다. 앞에 부정부사 '没(méi)'가 와서 '본 적이 없다'는 의미가 됩니다.";
          } else if (t1 === "脸") {
            item.E1 = "명사. 얼굴. 사람이나 동물의 머리 앞부분을 가리킵니다.";
          } else if (t1 === "奇怪") {
            item.E1 = "형용사. 이상하다, 기이하다. 평소와 다르거나 이해하기 어려운 상황이나 느낌을 표현합니다.";
          } else if (t1 === "感觉") {
            item.E1 = "명사 또는 동사. 느낌, 감각. 또는 '느끼다'. 외부 자극이나 마음속에서 일어나는 생각이나 기분을 의미합니다.";
          } else if (t1 === "明明") {
            item.E1 = "부사. 분명히, 명백히. 사실이 명확함을 강조할 때 사용되며, 종종 반전이나 예상과 다른 결과가 뒤따를 때 쓰입니다.";
          } else if (t1 === "知道") {
            item.E1 = "동사. 알다, 인지하다. 어떤 사실이나 정보를 인식하고 있음을 나타냅니다.";
          } else if (t1 === "危险") {
            item.E1 = "형용사 또는 명사. 위험하다, 위험. 해를 입거나 손실을 볼 가능성이 있는 상태를 의미합니다. 이 노래에서는 감정의 위험성을 암시합니다.";
          } else if (t1 === "飞蛾") {
            item.E1 = "명사. 나방. 빛을 향해 날아드는 습성이 있어, 종종 위험을 알면서도 빠져드는 존재에 비유됩니다. 여기서는 사랑에 대한 맹목적인 끌림을 상징할 수 있습니다.";
          } else if (t1 === "总") {
            item.E1 = "부사. 늘, 항상, 언제나. 어떤 상황이나 행동이 반복적으로 일어남을 나타냅니다. '总是(zǒngshì)'와 의미가 유사합니다.";
          } else if (t1 === "时候") {
            item.E1 = "명사. 때, 시간, 시절. 특정 시점이나 기간을 나타냅니다. '危险时候'는 '위험한 때'를 의미합니다.";
          } else if (t1 === "把") {
            item.E1 = "개사(전치사). 목적어를 동사 앞으로 도치시킬 때 사용되어, 목적어에 대한 처치나 결과를 강조합니다. '把 A 동사 B'는 'A를 B하게 동사하다'와 같이 해석됩니다.";
          } else if (t1 === "自己") {
            item.E1 = "대명사. 자기, 자신. 말하는 사람 또는 문맥상의 주어를 가리킵니다.";
          } else if (t1 === "奉献") {
            item.E1 = "동사. 바치다, 헌신하다. 자신의 것을 아낌없이 내놓거나 희생하는 것을 의미합니다. 여기서는 불나방이 불에 몸을 던지는 모습을 묘사합니다.";
          } else if (t1 === "乱") {
            item.E1 = "형용사 또는 동사. 어지럽다, 혼란스럽다. 또는 '어지럽히다'. 질서가 없거나 정돈되지 않은 상태를 나타냅니다.";
          } else if (t1 === "一切") {
            item.E1 = "대명사. 모든 것, 전부. 어떤 범위 내의 모든 사물이나 상황을 가리킵니다.";
          } else if (t1 === "像是") {
            item.E1 = "동사. 마치 ...와 같다, ...인 것 같다. 어떤 대상이나 상황을 다른 것에 비유하거나 추측할 때 사용합니다. '好像(hǎoxiàng)'과 유사합니다.";
          } else if (t1 === "中") {
            item.E1 = "동사. 맞다, 적중하다, 당하다. 여기서는 '中毒(zhòngdú, 독에 중독되다)'의 '中'으로, '독에 걸리다', '독에 빠지다'라는 의미로 사용되었습니다.";
          } else if (t1 === "毒") {
            item.E1 = "명사. 독. 생물에게 해로운 물질을 의미하며, 비유적으로 헤어나오기 힘든 매력이나 중독성을 가진 것을 나타내기도 합니다.";
          } else if (t1 === "快乐") {
            item.E1 = "명사 또는 형용사. 즐거움, 기쁨. 또는 '즐겁다', '기쁘다'. 마음이 만족스럽고 유쾌한 상태를 나타냅니다.";
          } else if (t1 === "藏") {
            item.E1 = "동사. 숨기다, 감추다. 다른 사람에게 보이지 않거나 알려지지 않도록 하는 행위를 의미합니다.";
          } else if (t1 === "住") {
            item.E1 = "동사 뒤에 쓰여 결과보어 역할을 하며, 동작의 결과로 고정되거나 안정됨을 나타냅니다. '藏不住(cáng bu zhù)'는 '숨길 수 없다'는 의미입니다.";
          } else if (t1 === "再次") {
            item.E1 = "부사. 다시 한번, 재차. 이미 일어났던 일이 또 반복됨을 나타냅니다.";
          } else if (t1 === "假装") {
            item.E1 = "동사. ...인 체하다, 가장하다. 실제와 다르게 꾸미는 행동을 나타냅니다.";
          } else if (t1 === "在乎") {
            item.E1 = "동사. 마음에 두다, 신경 쓰다. 어떤 일이나 사람에 대해 중요하게 생각하고 관심을 가지는 것을 의미합니다. '不在乎(bù zàihu)'는 '신경 쓰지 않다'는 뜻입니다.";
          } else if (t1 === "面前") {
            item.E1 = "명사. 앞, 면전. 어떤 사람이나 사물의 바로 앞을 가리킵니다.";
          } else if (t1 === "装") {
            item.E1 = "동사. 꾸미다, ...인 체하다. 여기서는 '装酷(zhuāng kù, 쿨한 척하다)'의 일부로 사용되었습니다.";
          } else if (t1 === "酷") {
            item.E1 = "형용사. 멋있다, 쿨하다. 영어 'cool'을 음차한 단어로, 태도나 스타일이 세련되고 멋진 것을 표현합니다.";
          } else if (t1 === "需要") {
            item.E1 = "동사. 필요하다, 요구되다. 어떤 것이 반드시 있어야 하거나 어떤 행위가 이루어져야 함을 나타냅니다.";
          } else if (t1 === "monday blue") {
            item.E1 = "명사구(영어). 월요병. 주말이 지나고 월요일에 느끼는 우울감이나 피로감을 뜻하는 영어 표현입니다.";
          } else if (t1 === "隐藏") {
            item.E1 = "동사. 숨기다, 감추다. '藏(cáng)'과 의미가 유사하지만 좀 더 문어적인 느낌을 줄 수 있습니다. 생각이나 감정 등을 드러내지 않는 것을 의미합니다.";
          } else if (t1 === "喜怒") {
            item.E1 = "명사. 기쁨과 노여움. 사람의 여러 가지 감정을 대표적으로 이르는 말입니다. 여기서는 전반적인 감정을 의미합니다.";
          } else if (t1 === "thought") { // 영어 단어에 대한 설명
             item.E1 = "동사(영어). 'think(생각하다)'의 과거형 또는 과거분사형. 여기서는 '...라고 생각했다'는 의미로 쓰였습니다.";
          } else if (t1 === "pretty cool") { // 영어 구문에 대한 설명
             item.E1 = "형용사구(영어). 꽤 멋진, 상당히 괜찮은. 'pretty'는 '꽤, 상당히'라는 부사로 'cool'을 수식합니다.";
          } else if (t1 === "发现") {
            item.E1 = "동사. 발견하다, 깨닫다. 몰랐던 사실이나 존재를 알게 되거나 찾아내는 것을 의미합니다.";
          } else if (t1 === "lots of work") {
            item.E1 = "명사구(영어). 많은 일, 많은 업무. 처리해야 할 일이 많음을 나타내는 영어 표현입니다.";
          } else if (t1 === "等着") {
            item.E1 = "동사구. 기다리다. '等(děng, 기다리다)'에 동태조사 '着(zhe, 동작의 지속)'가 붙은 형태로, 기다리고 있는 상태를 나타냅니다.";
          } else if (t1 === "慢慢") {
            item.E1 = "부사. 천천히, 느릿느릿. 동작이나 과정이 서서히 진행됨을 나타냅니다.";
          } else if (t1 === "完成") {
            item.E1 = "동사. 완성하다, 끝내다. 어떤 일이나 작업을 마무리하는 것을 의미합니다.";
          } else if (t1 === "brain just fart") {
            item.E1 = "관용구(영어). (직역: 뇌가 방귀를 뀌다) 머리가 제대로 작동하지 않다, 멍해지다, 갑자기 바보 같은 생각을 하거나 말을 하다. 비격식적인 영어 표현입니다. 여기서는 갑자기 아무 생각이 나지 않거나 혼란스러운 상태를 표현한 것으로 보입니다.";
          } else if (t1 === "昨晚") {
            item.E1 = "명사. 어젯밤. 어제 저녁부터 밤까지의 시간을 가리킵니다.";
          } else if (t1 === "路口") {
            item.E1 = "명사. 교차로, 길 어귀. 둘 이상의 길이 만나는 곳을 의미합니다.";
          } else if (t1 === "红灯") {
            item.E1 = "명사. 빨간불, 적신호. 교통 신호등의 빨간색 등불로, 정지를 의미합니다. 여기서는 강렬한 기억이나 멈칫하게 만드는 순간을 상징할 수 있습니다.";
          } else if (t1 === "目光") {
            item.E1 = "명사. 시선, 눈길. 눈으로 보는 빛깔이나 대상을 향하는 눈의 방향을 의미합니다.";
          } else if (t1 === "变") {
            item.E1 = "동사. 변하다, 바뀌다. 이전과 다른 상태나 모습으로 되는 것을 의미합니다.";
          } else if (t1 === "炙热") {
            item.E1 = "형용사. 뜨겁다, 열렬하다. 온도가 매우 높거나 감정 등이 매우 강렬한 것을 묘사합니다.";
          } else if (t1 === "停滞") {
            item.E1 = "동사. 정체하다, 멈추다. 사물이나 상황이 발전하거나 나아가지 못하고 한곳에 머무르는 것을 의미합니다.";
          } else if (t1 === "梦到") {
            item.E1 = "동사구. 꿈에서 보다, 꿈꾸다. 잠자는 동안 꿈속에서 어떤 장면이나 내용을 경험하는 것을 의미합니다. '梦(mèng, 꿈)'과 '到(dào, 결과보어)'가 결합된 형태입니다.";
          } else if (t1 === "一起") {
            item.E1 = "부사. 함께, 같이. 둘 이상의 사람이나 사물이 동시에 어떤 동작이나 상태에 있음을 나타냅니다.";
          } else if (t1 === "走在") {
            item.E1 = "동사구. 걸어가다. '走(zǒu, 걷다)'와 장소를 나타내는 개사 '在(zài, ~에 있다)'가 결합된 형태로, 특정 장소를 걷고 있는 상태를 나타냅니다.";
          } else if (t1 === "沙滩") {
            item.E1 = "명사. 모래사장, 해변. 바닷가나 강가에 모래가 넓게 깔린 곳을 의미합니다.";
          } else if (t1 === "温柔") {
            item.E1 = "형용사 또는 명사. 부드럽다, 상냥하다. 또는 '부드러움', '상냥함'. 성격이나 태도, 느낌 등이 온화하고 따뜻한 것을 나타냅니다.";
          } else if (t1 === "一道一道") {
            item.E1 = "수량사구. 한 줄기 한 줄기, 하나하나. 가늘고 긴 모양의 것이 연이어 나타나는 모습을 묘사합니다. '一道(yīdào)'는 '한 줄기'를 의미합니다.";
          } else if (t1 === "阳光") {
            item.E1 = "명사. 햇빛, 햇살. 태양에서 나오는 빛을 의미합니다.";
          } else if (t1 === "让") {
            item.E1 = "동사. ...하게 하다, ...시키다 (사동). 또는 '양보하다'. 여기서는 앞의 원인이 뒤의 결과를 초래하는 사동의 의미로 사용되었습니다.";
          } else if (t1 === "身处") {
            item.E1 = "동사. 몸을 두다, 처해 있다. 어떤 장소나 환경에 자신이 위치해 있음을 나타냅니다.";
          } else if (t1 === "粉红") {
            item.E1 = "형용사 또는 명사. 분홍색의, 분홍색. 연한 빨간색을 의미하며, 종종 사랑스럽거나 부드러운 느낌을 표현할 때 사용됩니다.";
          } else if (t1 === "宇宙") {
            item.E1 = "명사. 우주. 모든 시간, 공간, 물질, 에너지를 포함하는 총체를 의미합니다. 여기서는 황홀하거나 꿈같은 분위기를 비유적으로 표현합니다.";
          } else if (t1 === "这一刻") {
            item.E1 = "시간 명사구. 이 순간, 바로 지금. 현재의 짧은 시간을 강조하여 나타냅니다.";
          }
          // E1 수정 규칙 끝

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
      console.log(`
Successfully updated ${filePath} with ${changesMade} E1 field changes.`);
    } else {
      console.log(`
No E1 field changes needed for ${filePath} based on the current rules.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 