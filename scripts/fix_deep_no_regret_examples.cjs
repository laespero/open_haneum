const fs = require('fs');
const filePath = 'songs/deep_no_regret.json'; // 실제 파일 경로로 수정

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(line => {
    if (line.LI) {
      line.LI.forEach(item => {
        // 여기에 수정 로직 추가
        // 예시: 특정 XE에 해당하는 XK 수정
        if (item.XE === "彼はズルい人だ。" && item.XK === "그는 약삭빠른 사람이야.") {
          item.XK = "그는 치사한 사람이야.";
          changesMade++;
        }
        if (item.XE === "きれいだな。" && item.XK === "예쁘구나.") {
          item.XK = "아름답구나.";
          changesMade++;
        }
        if (item.XE === "食べることが好きだ。" && item.XK === "먹는 것을 좋아한다.") {
          item.XK = "먹는 걸 좋아해.";
          changesMade++;
        }
        if (item.XE === "仕事を終わらせたりした。" && item.XK === "일을 끝내기도 했어.") {
          item.XK = "일을 마치기도 했어.";
          changesMade++;
        }
        if (item.XE === "夢のような話" && item.XK === "꿈 같은 이야기") {
          item.XK = "꿈같은 이야기";
          changesMade++;
        }
        if (item.XE === "子供だって分かるよ。" && item.XK === "아이도 이해할 수 있어.") {
          item.XK = "애들도 알겠다.";
          changesMade++;
        }
        if (item.XE === "優しい言葉をかける。" && item.XK === "상냥한 말을 건넨다.") {
          item.XK = "다정한 말을 건넨다.";
          changesMade++;
        }
        // 기존 "大丈夫なの。:괜찮아." 에 대한 수정은 여러 가능성이 있어, 가장 일반적인 의문형으로 수정
        if (item.XE === "大丈夫なの。" && item.XK === "괜찮아.") {
          item.XK = "괜찮아?";
          changesMade++;
        }
        if (item.XE === "あなたは誰ですか？" && item.XK === "너는 누구니?") {
          item.XK = "넌 누구야?"; // 반말로 통일
          changesMade++;
        }
        if (item.XE === "私も行きます。" && item.XK === "나도 갈 거야.") {
          item.XK = "나도 갈게."; // 반말로 통일
          changesMade++;
        }
        if (item.XE === "早く来てください。" && item.XK === "빨리 와주세요.") {
          item.XK = "빨리 와 주세요."; // 띄어쓰기 수정
          changesMade++;
        }
        if (item.XE === "疲れた。だから休む。" && (item.XK === "피곤해. 그래서 쉴 거야." || item.XK === "피곤하니까 쉴게.")) {
          // 원본 XK가 두 가지 형태를 가질 수 있으므로 OR 조건 사용 및 일관된 형태로 수정
          item.XK = "피곤해. 그래서 쉴게."; 
          changesMade++;
        }
        if (item.XE === "きれいだね。" && item.XK === "예쁘네.") {
          item.XK = "아름답네.";
          changesMade++;
        }
         if (item.XE === "あなたの名前は何ですか？" && item.XK === "너의 이름은 뭐야?") {
          item.XK = "네 이름은 뭐니?"; // 반말로 통일
          changesMade++;
        }
        if (item.XE === "どんな音楽が好きですか？" && item.XK === "어떤 음악을 좋아하세요?") {
          item.XK = "어떤 음악을 좋아해?"; // 반말로 통일
          changesMade++;
        }
        if (item.XE === "彼は「大丈夫」と言った。" && item.XK === "그는 \"괜찮아\"라고 말했다.") {
          item.XK = "그는 \"괜찮아\"라고 말했어."; // 구어체 통일
          changesMade++;
        }
        // 추가된 수정 규칙들
        if (item.XE === "疲れたから休む。" && item.XK === "피곤하니까 쉴게.") {
            item.XK = "피곤해서 쉬려고.";
            changesMade++;
        }
        if (item.XE === "疲れた。だけど頑張る。" && item.XK === "피곤해. 하지만 힘낼게.") {
            item.XK = "피곤하지만 힘낼게."; // 좀 더 자연스러운 연결
            changesMade++;
        }
        if (item.XE === "食べずに出かけた。" && item.XK === "먹지 않고 나갔다.") {
            item.XK = "안 먹고 나갔어."; // 구어체
            changesMade++;
        }
        if (item.XE === "声を出す" && item.XK === "소리를 내다") {
            item.XK = "소리 내다"; // '-를' 생략 가능
            changesMade++;
        }
        if (item.XE === "今、食事をしてる。" && item.XK === "지금 식사하고 있어.") {
            item.XK = "지금 밥 먹고 있어."; // '식사' -> '밥' (구어체)
            changesMade++;
        }
         if (item.XE === "お金がなくて困っています。" && item.XK === "돈이 없어서 곤란합니다.") {
            item.XK = "돈이 없어서 곤란해."; // 반말 구어체
            changesMade++;
        }
        if (item.XE === "ありがとうと言う" && item.XK === "고맙다고 말하다") {
            item.XK = "고맙다고 하다"; // '-를' 생략
            changesMade++;
        }
        if (item.XE === "電車に乗り遅れてしまった。" && item.XK === "기차를 놓쳐버렸다.") {
            item.XK = "전철을 놓쳤어."; // '기차' -> '전철', 구어체
            changesMade++;
        }
        if (item.XE === "お金がなくて困った。" && item.XK === "돈이 없어서 곤란했다.") {
            item.XK = "돈이 없어서 곤란했어."; // 반말 구어체
            changesMade++;
        }
        if (item.XE === "痛いとこを触らないで。" && item.XK === "아픈 곳을 만지지 마.") {
            item.XK = "아픈 데 만지지 마."; // '곳' -> '데' (구어체)
            changesMade++;
        }
        if (item.XE === "なるべく早く来てください。" && item.XK === "최대한 빨리 와주세요.") {
            item.XK = "웬만하면 빨리 와 줘."; // '최대한' -> '웬만하면', 반말 구어체
            changesMade++;
        }
        if (item.XE === "ちゃんと座りなさい。" && item.XK === "제대로 앉으세요.") {
            item.XK = "똑바로 앉아."; // '제대로' -> '똑바로', 반말 구어체
            changesMade++;
        }
        if (item.XE === "映画とか見る" && item.XK === "영화 같은 거 보다") {
            item.XK = "영화 같은 거 봐"; // 반말 구어체
            changesMade++;
        }
        if (item.XE === "彼氏とデートする。" && item.XK === "남자친구와 데이트하다.") {
            item.XK = "남친이랑 데이트해."; // '남자친구' -> '남친', 반말 구어체
            changesMade++;
        }
        if (item.XE === "だめだや。" && item.XK === "안 되는 거야.") {
            item.XK = "안 돼."; // 더 짧고 흔한 표현
            changesMade++;
        }
        if (item.XE === "余裕を持つことが大切だ。" && item.XK === "여유를 갖는 것이 중요하다.") {
            item.XK = "여유를 갖는 게 중요해."; // 반말 구어체
            changesMade++;
        }
        if (item.XE === "時間があってよかった。" && item.XK === "시간이 있어서 다행이야.") {
            item.XK = "시간 있어서 다행이다."; // 반말 구어체, 조금 더 자연스럽게
            changesMade++;
        }
        if (item.XE === "食事の前に手を洗います。" && item.XK === "식사 전에 손을 씻습니다.") {
            item.XK = "밥 먹기 전에 손 씻어."; // 반말 구어체
            changesMade++;
        }
        if (item.XE === "正しい答えを選ぶ" && item.XK === "옳은 답을 고르다") {
            item.XK = "정답을 고르다"; // '옳은 답' -> '정답'
            changesMade++;
        }
        if (item.XE === "水しか飲まない" && item.XK === "물밖에 마시지 않는다") {
            item.XK = "물밖에 안 마셔."; // 반말 구어체
            changesMade++;
        }
        if (item.XE === "子供たちがはしゃいでいる" && item.XK === "아이들이 떠들며 놀고 있다") {
            item.XK = "애들이 떠들고 있어."; // '아이들' -> '애들', 구어체
            changesMade++;
        }
        if (item.XE === "映画とか見に行かない？" && item.XK === "영화 같은 거 보러 가지 않을래?") {
            item.XK = "영화나 보러 갈래?"; // 좀 더 자연스러운 구어체
            changesMade++;
        }
        if (item.XE === "私は早起きタイプだ。" && item.XK === "나는 일찍 일어나는 타입이야.") {
            item.XK = "난 아침형 인간이야."; // '일찍 일어나는 타입' -> '아침형 인간'
            changesMade++;
        }
        if (item.XE === "寒いだけど、窓を開けよう。" && item.XK === "춥지만 창문을 열자.") {
            item.XK = "춥지만 창문 열자."; // 띄어쓰기
            changesMade++;
        }
        if (item.XE === "お金なんていらない。" && item.XK === "돈 따위 필요 없어.") {
            item.XK = "돈 같은 거 필요 없어."; // '따위' -> '같은 거' (좀 더 부드럽게)
            changesMade++;
        }
         if (item.XE === "天気もいいし、出かけよう。" && item.XK === "날씨도 좋으니까 나가자.") {
            item.XK = "날씨도 좋으니까 나가자!"; // 느낌표 추가로 어조 변화
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