import fs from 'fs';

const filePath = './songs/example_let_it_go.json'; // 대상 파일 경로

// 파일 읽기
let rawData = fs.readFileSync(filePath, 'utf-8');
let data = JSON.parse(rawData);

// K0 값 수정
data.translatedLines.forEach(item => {
  // 1. 특정 T0 값에 대한 K0 수정
  if (item.T0 === "Let the storm rage on") {
    item.K0 = "폭풍이 계속 휘몰아치도록 내버려 둬.";
  } else if (item.T0 === "And one thought crystallizes like an icy blast") {
    item.K0 = "그리고 한 생각이 얼음 폭풍처럼 선명해져.";
  } else if (item.T0 === "You'll never see me cry") {
    item.K0 = "내가 우는 모습은 절대 보지 못할 거야.";
  } else if (item.T0 === "It's funny how some distance makes everything seem small") {
    item.K0 = "거리를 두고 보면 모든 게 작아 보이는 게 재미있네.";
  } else if (item.T0 === "Let it go, let it go") {
    item.K0 = "다 잊어, 다 잊어";
  }

  // 2. 특정 K0 값에 대한 직접 수정 (어미 변경)
  //    사용자 요청: "오늘 밤 산 위에 눈이 하얗게 빛난다" -> "오늘 밤 산 위에 눈이 하얗게 빛나네"
  if (item.K0 === "오늘 밤 산 위에 눈이 하얗게 빛난다") {
    item.K0 = "오늘 밤 산 위에 눈이 하얗게 빛나네.";
  }
  // 여기에 추가적으로 "~다."로 끝나는 다른 K0 값들에 대한 직접적인 매핑을 추가할 수 있습니다.
  // 예: else if (item.K0 === "다른 ~다 로 끝나는 문장") { item.K0 = "다른 ~네 로 끝나는 문장"; }
});

// 수정된 내용을 다시 파일에 쓰기
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
console.log('파일 수정 완료 (직접 지정 방식)'); 