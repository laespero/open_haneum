const fs = require('fs');

const filePath = './songs/deep_androp_koi.json'; // 대상 파일 경로

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);

  if (data && Array.isArray(data.translatedLines)) {
    let changesMade = 0;

    data.translatedLines.forEach(line => {
      if (line.T0 === "物語が僕を拒んだって" && line.K0 === "세상이 나를 거부한다 해도") {
        line.K0 = "세상이 나를 거부한대도";
        changesMade++;
      } else if (line.T0 === "誰かが運命を定めたって" && line.K0 === "누군가 운명을 정해버렸다 해도") {
        line.K0 = "누군가 운명을 정했대도";
        changesMade++;
      } else if (line.T0 === "会いに行くよ" && line.K0 === "만나러 갈게.") {
        line.K0 = "만나러 갈게,";
        changesMade++;
      } else if (line.T0 === "どこにだって" && line.K0 === "어디라도 갈 수 있어,") {
        line.K0 = "어디라도,";
        changesMade++;
      } else if (line.T0 === "探し続けるよ" && line.K0 === "계속 찾아갈 거야,") {
        line.K0 = "계속 찾을 거야,";
        changesMade++;
      } else if (line.T0 === "出会えた頃とまた同じように" && line.K0 === "처음 만났을 때처럼 똑같이,") {
        line.K0 = "처음 만났을 때와 똑같이,";
        changesMade++;
      } else if (line.T0 === "恋するよ" && line.K0 === "사랑할게.") {
        line.K0 = "사랑할게,";
        changesMade++;
      } else if (line.T0 === "何もいらない" && line.K0 === "아무것도 필요 없는걸,") {
        line.K0 = "아무것도 필요 없어,";
        changesMade++;
      } else if (line.T0 === "君以外は" && line.K0 === "너 말고는 아무것도") {
        line.K0 = "네가 아니면";
        changesMade++;
      } else if (line.T0 === "終わりまで守ろう" && line.K0 === "끝까지 지킬게.") {
        line.K0 = "끝까지 지킬 것을";
        changesMade++;
      } else if (line.T0 === "目を合わせて" && line.K0 === "눈을 맞추고,") {
        line.K0 = "눈을 맞추고";
        changesMade++;
      } else if (line.T0 === "そっと笑って" && line.K0 === "살짝 웃어주고") {
        line.K0 = "살짝 웃어주면";
        changesMade++;
      } else if (line.T0 === "春にほころぶ小さな蕾" && line.K0 === "봄에 피어나는 작은 꽃봉오리") {
        line.K0 = "봄에 피어나는 작은 꽃봉오리와";
        changesMade++;
      } else if (line.T0 === "夏の暑さに" && line.K0 === "여름의 더위에") {
        line.K0 = "여름의 더위, 그리고";
        changesMade++;
      } else if (line.T0 === "眩しい光" && line.K0 === "눈부신 빛") {
        line.K0 = "눈부신 빛,";
        changesMade++;
      } else if (line.T0 === "秋の彩り" && line.K0 === "가을의 색채") {
        line.K0 = "가을의 색채와";
        changesMade++;
      } else if (line.T0 === "冬の冷たさ" && line.K0 === "겨울의 차가움") {
        line.K0 = "겨울의 차가움까지";
        changesMade++;
      } else if (line.T0 === "そんな前が前が" && line.K0 === "그런 당연한 것이") {
        line.K0 = "그런 평범한 것들이";
        changesMade++;
      } else if (line.T0 === "君となら特別に変わる" && line.K0 === "너와 함께라면 모든 게 특별해지고,") {
        line.K0 = "너와 함께라면 특별해져,";
        changesMade++;
      } else if (line.T0 === "忘れるなら" && line.K0 === "잊을 수 있다면,") {
        line.K0 = "잊을 수 있다면";
        changesMade++;
      } else if (line.T0 === "君じゃなくて誰でもいいのに" && line.K0 === "네가 아닌 다른 누구라도 괜찮을 텐데") {
        line.K0 = "네가 아니라 누구라도 좋을 텐데";
        changesMade++;
      } else if (line.T0 === "君の仕草も約束も" && line.K0 === "너의 몸짓도 약속도") {
        line.K0 = "너의 몸짓도, 약속도,";
        changesMade++;
      } else if (line.T0 === "くだらないことだって覚えてる" && line.K0 === "하찮은 일조차 기억하고 있어.") {
        line.K0 = "사소한 것까지 기억해.";
        changesMade++;
      } else if (line.T0 === "思い描く夢も" && line.K0 === "마음속으로 그려본 꿈도") {
        line.K0 = "마음속에 그린 꿈도,";
        changesMade++;
      } else if (line.T0 === "イメージのシナリオも" && line.K0 === "이미지의 시나리오도") {
        line.K0 = "머릿속 시나리오도";
        changesMade++;
      } else if (line.T0 === "いつも" && line.K0 === "항상") {
        line.K0 = "언제나";
        changesMade++;
      } else if (line.T0 === "隣にいるのは" && line.K0 === "옆에 있는 것은") {
        line.K0 = "곁에는 네가 있어.";
        changesMade++;
      } else if (line.T0 === "君が遠くに行ってしまって" && line.K0 === "네가 멀리 떠나가 버려서") {
        line.K0 = "네가 멀리 떠나버려서";
        changesMade++;
      } else if (line.T0 === "もう会えないとわかっていたって" && line.K0 === "이제 만날 수 없단 걸 알면서도") {
        line.K0 = "이제 만날 수 없다는 걸 알아도";
        changesMade++;
      } else if (line.T0 === "僕は探すよ" && line.K0 === "나는 찾을게.") {
        line.K0 = "나는 찾을게,";
        changesMade++;
      } else if (line.T0 === "君の姿を" && line.K0 === "너의 모습을") {
        line.K0 = "너의 모습을.";
        changesMade++;
      } else if (line.T0 === "君じゃなければだめなんだ" && line.K0 === "네가 아니면 안 될 것 같아") {
        line.K0 = "네가 아니면 안 되니까.";
        changesMade++;
      } else if (line.T0 === "恋して" && line.K0 === "사랑을 하고,") {
        line.K0 = "사랑하고,";
        changesMade++;
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Successfully updated ${filePath} with ${changesMade} changes.`);
    } else {
      console.log(`No changes needed for ${filePath}.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 