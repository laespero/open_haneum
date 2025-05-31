const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_lalala_love_song.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          // Case 1: T0: "めぐり会えた奇跡が", T1: "めぐり"
          if (line.T0 === "めぐり会えた奇跡が" && item.T1 === "めぐり") {
            if (item.E1 !== "'巡る(めぐる, 돌다/둘러싸다)'의 연용형 명사화 표현. 여기서는 뒤의 '会えた(あえた, 만날 수 있었다)'와 함께 쓰여 '우연히 만나게 됨' 정도의 의미를 형성합니다.") {
              item.E1 = "'巡る(めぐる, 돌다/둘러싸다)'의 연용형 명사화 표현. 여기서는 뒤의 '会えた(あえた, 만날 수 있었다)'와 함께 쓰여 '우연히 만나게 됨' 정도의 의미를 형성합니다.";
              changesMade++;
              console.log(`Updated E1 for T0: "${line.T0}", T1: "${item.T1}"`);
            }
            if (item.XE !== "偶然のめぐりあわせで彼と出会った。") {
              item.XE = "偶然のめぐりあわせで彼と出会った。";
              item.XK = "우연한 만남으로 그와 만났다.";
              item.XI = "gūzen no meguriawase de kare to deatta.";
              item.XR = "구우젠 노 메구리아와세 데 카레 토 데앗타.";
              changesMade++; // XE, XK, XI, XR은 하나의 변경으로 간주 (필요시 세분화)
              console.log(`Updated XE/XK/XI/XR for T0: "${line.T0}", T1: "${item.T1}"`);
            }
          }

          // Case 2: T0: "涙の色を変えた", T1: "変えた"
          if (line.T0 === "涙の色を変えた" && item.T1 === "変えた") {
            if (item.E1 === "동사 '変える'(변하다)의 과거형으로, 무언가를 변화시키거나 바꾸는 행위를 의미합니다.") { // 현재 E1이 이것과 같다면 수정
              item.E1 = "동사 '変える(かえる, 바꾸다/변하게 하다)'의 과거형. '눈물의 색을 바꿨다'는 것은 슬픔이 기쁨으로 변하는 등 감정의 극적인 변화를 시사합니다.";
              changesMade++;
              console.log(`Updated E1 for T0: "${line.T0}", T1: "${item.T1}"`);
            }
            // XE, XK는 기존 것이 문맥에 맞으므로 유지
          }
          
          // Case 3: T0: "ドシャ降りの午後を待って", T1: "ドシャ降り"
          if (line.T0 === "ドシャ降りの午後を待って" && item.T1 === "ドシャ降り") {
            if (item.E1 === "'ドシャ'는 '폭우'를 의미하는 비표준 표현이고, '降り'는 '내림'을 의미합니다. 합쳐서 '폭우가 쏟아지는'이라는 의미가 됩니다.") {
                item.E1 = "'どしゃ降り(도샤부리)'. 억수같이 퍼붓는 비, 폭우를 의미하는 명사. 'どしゃっ'이라는 비가 세차게 내리는 소리를 나타내는 의성어에서 유래했을 가능성이 있습니다.";
                changesMade++;
                console.log(`Updated E1 for T0: "${line.T0}", T1: "${item.T1}"`);
            }
            if (item.XE === "今日はドシャ降りだ。" ) {
                item.XE = "昨夜はどしゃ降りだった。";
                item.XK = "어젯밤에는 폭우가 쏟아졌어.";
                item.XI = "sakuya wa doshaburi datta.";
                item.XR = "사쿠야 와 도샤부리 닷타.";
                changesMade++;
                console.log(`Updated XE/XK/XI/XR for T0: "${line.T0}", T1: "${item.T1}"`);
            }
          }

          // Case 4: T0: "Wanna make love,", T1: "make"
          if (line.T0 === "Wanna make love," && item.T1 === "make") {
            if (item.E1 === "무언가를 생성하거나 행하는 동사입니다.") {
              item.E1 = "'(사랑을) 나누다', '(관계를) 갖다'의 의미로 사용된 동사. 'make love'는 '성관계를 갖다'라는 관용적 표현입니다.";
              changesMade++;
              console.log(`Updated E1 for T0: "${line.T0}", T1: "${item.T1}"`);
            }
            if (item.XE === "She can make a cake.") { // 기존 예문이 문맥과 다름
              item.XE = "They decided to make love.";
              item.XK = "그들은 사랑을 나누기로 결정했다.";
              item.XI = "ðeɪ dɪˈsaɪdɪd tu meɪk lʌv.";
              item.XR = "데이 디사이디드 투 메이크 러브.";
              changesMade++;
              console.log(`Updated XE/XK/XI/XR for T0: "${line.T0}", T1: "${item.T1}"`);
            }
          }

          // Case 5: T0: "「まっぴら!」と横向いて", T1: "まっぴら"
          if (line.T0 === "「まっぴら!」と横向いて" && item.T1 === "まっぴら") {
            if (item.E1 === "강한 거절이나 부정을 표현하는 감탄사입니다. '전혀', '절대로'라는 의미로 사용됩니다." || item.E1 === "'真っ平(まっぴら)'. 강한 거절이나 사절의 뜻을 나타내는 말. 'まっぴら御免(ごめん)'의 형태로 자주 쓰이며, '절대 사절', '질색'이라는 의미입니다.") {
              // E1은 이미 올바르게 수정되었거나, 또는 이전 스크립트 실행으로 수정된 상태일 수 있으므로 조건 수정
              if (item.E1 !== "'真っ平(まっぴら)'. 강한 거절이나 사절의 뜻을 나타내는 말. 'まっぴら御免(ごめん)'의 형태로 자주 쓰이며, '절대 사절', '질색'이라는 의미입니다.") {
                item.E1 = "'真っ平(まっぴら)'. 강한 거절이나 사절의 뜻을 나타내는 말. 'まっぴら御免(ごめん)'의 형태로 자주 쓰이며, '절대 사절', '질색'이라는 의미입니다.";
                changesMade++;
                console.log(`Updated E1 for T0: "${line.T0}", T1: "${item.T1}"`);
              }
            }
            if (item.XE !== "まっぴらごめんだ！" || item.XK !== "절대 사절이야! / 질색이야!") {
              item.XE = "まっぴらごめんだ！";
              item.XK = "절대 사절이야! / 질색이야!"; // XK 값을 명시적으로 수정
              item.XI = "mappira gomen da!";
              item.XR = "맛피라 고멘 다!";
              changesMade++;
              console.log(`Updated XE/XK/XI/XR for T0: "${line.T0}", T1: "${item.T1}"`);
            }
          }

          // Case 6: T0: "まわれ まわれ メリーゴーラウンド", T1: "まわれ" (첫 번째)
          if (line.T0 === "まわれ まわれ メリーゴーラウンド" && 
              item.T1 === "まわれ" && 
              item.E1 === "'돌다'라는 의미의 동사 'まわる'의 명령형으로, 상대방에게 돌라고 명령할 때 사용합니다.") {
            if (item.XE === "風車がまわれ！") {
              item.XE = "風車よ、もっとまわれ！";
              item.XK = "풍차야, 더 돌아라!";
              item.XI = "kazaguruma yo, motto maware!";
              item.XR = "카자구루마 요, 못토 마와레!";
              changesMade++;
              console.log(`Updated XE/XK/XI/XR for T0: "${line.T0}", T1: "${item.T1}" (first occurrence)`);
            }
          }

          // Case 7: Universal change for T1: "を"
          if (item.T1 === "を" && item.K1 === "~을/를") {
            // item.K1 = "~을/를"; // 이미 변경된 값이므로, 다시 변경할 필요는 없습니다.
            // changesMade++;
            // console.log(`Updated K1 for T1: "${item.T1}" in T0: "${line.T0}"`);
          }

          // Case 8: Universal change for T1: "が"
          if (item.T1 === "が" && (item.K1 === "주격 조사" || item.K1 === "(주격 조사)")) {
            item.K1 = "~이/가";
            changesMade++;
            console.log(`Updated K1 for T1: "${item.T1}" in T0: "${line.T0}"`);
          }

          // Case 9: Fix incorrect example for T1: "の" in T0: "息が止まるくらいの"
          if (line.T0 === "息が止まるくらいの" && item.T1 === "の" && item.XE === "私の本") { // XE 조건은 이미 수정된 "私の本"으로 변경
            // 이미 변경된 내용이므로 주석 처리
          }

          // Case 10: Fix incorrect example and potentially E1 for T1: "な" in T0: "言葉よりも本気な"
          if (line.T0 === "言葉よりも本気な" && item.T1 === "な" && item.XE === "優しいな人") {
            item.E1 = "형용동사(な형용사)의 어간에 붙어 명사를 수식하거나, 문장 끝에서 가벼운 단정/감탄을 나타내는 종조사로 쓰입니다."; // E1도 함께 개선
            item.XE = "静かな部屋";
            item.XK = "조용한 방";
            item.XI = "shizuka na heya";
            item.XR = "시즈카 나 헤야";
            changesMade++;
            console.log(`Updated example and E1 for T1: "な" in T0: "${line.T0}"`);
          }

        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} changes.`);
    } else {
      console.log(`\nNo changes needed for ${filePath}.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 