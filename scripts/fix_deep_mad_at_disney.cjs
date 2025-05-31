const fs = require('fs');
const filePath = './songs/deep_mad_at_disney.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(item => {
    if (item.T0 === "What the hell is love supposed to feel like?") {
      item.K0 = "사랑이란 대체 어떤 느낌이어야 해?";
      changesMade++;
    } else if (item.T0 === "But now I'm twenty-something") {
      item.K0 = "하지만 이제 난 스물 몇 살인데,";
      changesMade++;
    } else if (item.T0 === "I still know nothing") {
      item.K0 = "여전히 아무것도 모르겠어.";
      changesMade++;
    } else if (item.T0 === "But I don't believe in it") {
      item.K0 = "더는 믿지 않아.";
      changesMade++;
    } else if (item.T0 === "My fairy grandma warned me") {
      item.K0 = "내 요정 할머니가 경고했었지.";
      changesMade++;
    } else if (item.T0 === "Finding a true love's kiss is bullsh-") {
      item.K0 = "진정한 사랑의 키스를 찾는 건 전부 개소리라고.";
      changesMade++;
    } else if (item.T0 === "I'm mad at Disney, Disney") {
      item.K0 = "난 디즈니한테 화가 나, 디즈니.";
      changesMade++;
    } else if (item.T0 === "Had me wishing on a shooting star") {
      item.K0 = "별똥별에 소원이나 빌게 만들었잖아.";
      changesMade++;
    } else if (item.T0 === "They tricked me, tricked me") {
      item.K0 = "그들이 날 속였어, 속였다고.";
      changesMade++;
    } else if (item.T0 === "'Bout who I am or what I'm not") {
      item.K0 = "내가 어떤 사람인지, 아닌지에 대해서 말이야.";
      changesMade++;
    } else if (item.T0 === "To the motel on his snow white horse") {
      item.K0 = "백마 타고 모텔로 향하는 그런 거.";
      changesMade++;
    } else if (item.T0 === "What the hell is love? What the hell is love?") {
      item.K0 = "사랑이 다 뭐야? 사랑이 다 뭐냐고?";
      changesMade++;
    } else if (item.T0 === "So call me a pessimist") {
      item.K0 = "그러니 날 비관주의자라고 불러.";
      changesMade++;
    } else if (item.T0 === "No more wishing on a shooting star") {
      item.K0 = "더 이상 별똥별에 소원 따윈 안 빌어.";
      changesMade++;
    } else if (item.T0 === "I felt hurt love 'bout the word love") {
      item.K0 = "사랑이란 단어에 상처만 받았어.";
      changesMade++;
    } else if (item.T0 === "Turns into giving up") {
      item.K0 = "결국 포기하게 돼.";
      changesMade++;
    } else if (item.T0 === "Cinderella's story only ended in a bad divorce") {
      item.K0 = "신데렐라 이야기는 결국 끔찍한 이혼으로 끝났잖아.";
      changesMade++;
    } else if (item.T0 === "The prince ain't sleeping when he takes his sleeping beauty") {
      item.K0 = "왕자님은 잠자는 숲속의 공주를 데려갈 때 잠들지 않아."; // 혹은 좀 더 직설적으로 "왕자님은 잠자는 숲속의 공주를 덮칠 때 잠들지 않아."
      changesMade++;
    } else if (item.T0 === "'Cause I felt sad love, I felt bad love") {
      item.K0 = "슬픈 사랑도, 나쁜 사랑도 겪어봤으니까.";
      changesMade++;
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