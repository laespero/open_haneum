const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_lalala_love_song.json'); // 스크립트 위치에 따라 경로 수정

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(item => {
      // 1. T0: "もうけして止まらないように"
      if (item.T0 === "もうけして止まらないように" && item.K0 === "결코 멈추지 않도록") {
        item.K0 = "이제 결코 멈추지 않도록";
        changesMade++;
        console.log(`Updated K0 for T0: "${item.T0}" to "${item.K0}"`);
      }

      // 2. T0: "本音はウラハラ"
      if (item.T0 === "本音はウラハラ" && item.K0 === "본심은 뒤죽박죽") {
        item.K0 = "속마음은 정반대";
        changesMade++;
        console.log(`Updated K0 for T0: "${item.T0}" to "${item.K0}"`);
      }

      // 3. T0: "お互いさまだから"
      if (item.T0 === "お互いさまだから" && item.K0 === "서로가 서로니까") {
        item.K0 = "피차일반이니까";
        changesMade++;
        console.log(`Updated K0 for T0: "${item.T0}" to "${item.K0}"`);
      }
      
      // 4. T0: "涙の色を変えた"
      if (item.T0 === "涙の色を変えた" && item.K0 === "눈물의 색을 바꿨어") {
        item.K0 = "눈물의 색깔을 바꿨지";
        changesMade++;
        console.log(`Updated K0 for T0: "${item.T0}" to "${item.K0}"`);
      }

      // 5. T0: "ひと言もいらないさ"
      if (item.T0 === "ひと言もいらないさ" && item.K0 === "한 마디도 필요 없어.") {
        item.K0 = "한마디 말도 필요 없어";
        changesMade++;
        console.log(`Updated K0 for T0: "${item.T0}" to "${item.K0}"`);
      }
      
      // 6. T0: "とびきりの今を"
      if (item.T0 === "とびきりの今を" && item.K0 === "최고의 지금을") {
        item.K0 = "더없이 소중한 지금을";
        changesMade++;
        console.log(`Updated K0 for T0: "${item.T0}" to "${item.K0}"`);
      }

      // 7. T0: "知らぬ間に落としてた"
      if (item.T0 === "知らぬ間に落としてた" && item.K0 === "모르는 사이에 떨어뜨렸다") {
        item.K0 = "나도 모르게 떨어뜨렸던";
        changesMade++;
        console.log(`Updated K0 for T0: "${item.T0}" to "${item.K0}"`);
      }
      
      // 8. T0: "小さなかけらを"
      if (item.T0 === "小さなかけらを" && item.K0 === "작은 조각을") {
        item.K0 = "자그만 조각을";
        changesMade++;
        console.log(`Updated K0 for T0: "${item.T0}" to "${item.K0}"`);
      }

      // 9. T0: "肌でたしかめあう"
      if (item.T0 === "肌でたしかめあう" && item.K0 === "피부로 서로 확인해") {
        item.K0 = "살결로 서로 확인하지";
        changesMade++;
        console.log(`Updated K0 for T0: "${item.T0}" to "${item.K0}"`);
      }
      
      // 10. T0: "宇宙の見えない夜"
      if (item.T0 === "宇宙の見えない夜" && item.K0 === "우주의 보이지 않는 밤") {
        item.K0 = "아무것도 보이지 않는 밤"; // "우주"보다는 "아무것도" 가 문맥상 더 자연스러움
        changesMade++;
        console.log(`Updated K0 for T0: "${item.T0}" to "${item.K0}"`);
      }
      
      // 11. T0: "かまわない 君が見える"
      if (item.T0 === "かまわない 君が見える" && item.K0 === "신경 쓰지 않아, 너를 볼 수 있어") {
        item.K0 = "상관없어 네가 보이니까";
        changesMade++;
        console.log(`Updated K0 for T0: "${item.T0}" to "${item.K0}"`);
      }
      
      // 12. T0: "とめどなく楽しくて"
      if (item.T0 === "とめどなく楽しくて" && item.K0 === "끊임없이 즐겁고") {
        item.K0 = "한없이 즐거워서";
        changesMade++;
        console.log(`Updated K0 for T0: "${item.T0}" to "${item.K0}"`);
      }
      
      // 13. T0: "やるせないほど切なくて"
      if (item.T0 === "やるせないほど切なくて" && item.K0 === "안타까울 정도로 아파서") {
        item.K0 = "안타까울 만큼 애절해서";
        changesMade++;
        console.log(`Updated K0 for T0: "${item.T0}" to "${item.K0}"`);
      }

      // 14. T0: "そんな朝に生まれる"
      if (item.T0 === "そんな朝に生まれる" && item.K0 === "그런 아침에 태어나는") {
        item.K0 = "그런 아침에 만들어지는";
        changesMade++;
        console.log(`Updated K0 for T0: "${item.T0}" to "${item.K0}"`);
      }
      
      // 15. T0: "ためいきの前に"
      if (item.T0 === "ためいきの前に" && item.K0 === "한숨을 쉬기 전에") {
        item.K0 = "한숨이 나오기 전에";
        changesMade++;
        console.log(`Updated K0 for T0: "${item.T0}" to "${item.K0}"`);
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