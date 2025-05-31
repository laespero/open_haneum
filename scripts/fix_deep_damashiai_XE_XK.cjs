const fs = require('fs');
const filePath = '/Users/jaminku/Desktop/open-haneum/songs/deep_damashiai.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(line => {
    if (line.LI) {
      line.LI.forEach(item => {
        // 규칙 1: XE: 新しい車が欲しい。 / XK: 새 차를 원해. -> XK: 새 차를 갖고 싶어.
        if (item.XE === "新しい車が欲しい。" && item.XK === "새 차를 원해.") {
          item.XK = "새 차를 갖고 싶어.";
          changesMade++;
        }

        // 규칙 2: XE: 食べない。 / XK: 먹지 않아. -> XK: 안 먹어.
        if (item.XE === "食べない。" && item.XK === "먹지 않아.") {
          item.XK = "안 먹어.";
          changesMade++;
        }

        // 규칙 3: XE: きれいだわ。 / XK: 예쁘다야. -> XK: 예쁘네.
        if (item.XE === "きれいだわ。" && item.XK === "예쁘다야.") {
          item.XK = "예쁘네.";
          changesMade++;
        }

        // 규칙 4: XE: どうして来なかったの？ / XK: 왜 안 왔어? -> XK: 왜 안 왔니?
        if (item.XE === "どうして来なかったの？" && item.XK === "왜 안 왔어?") {
          item.XK = "왜 안 왔니?";
          changesMade++;
        }

        // 규칙 5: XE: 未来を象る。 / XK: 미래를 형상화하다. -> XK: 미래를 그리다.
        if (item.XE === "未来を象る。" && item.XK === "미래를 형상화하다.") {
          item.XK = "미래를 그리다.";
          changesMade++;
        }

        // 규칙 6: XE: 鍵を忘れてしまった。 / XK: 열쇠를 잊어버렸다. -> XK: 열쇠를 깜빡했어.
        if (item.XE === "鍵を忘れてしまった。" && item.XK === "열쇠를 잊어버렸다.") {
          item.XK = "열쇠를 깜빡했어.";
          changesMade++;
        }

        // 규칙 7: XE: 水が欲しい。 / XK: 물이 원해. -> XK: 물 마시고 싶어.
        if (item.XE === "水が欲しい。" && item.XK === "물이 원해.") {
          item.XK = "물 마시고 싶어.";
          changesMade++;
        }

        // 규칙 8: XE: 約束をつく。 / XK: 약속을 하다. -> XE: 約束をする。 / XK: 약속을 해.
        if (item.XE === "約束をつく。" && item.XK === "약속을 하다.") {
          item.XE = "約束をする。";
          item.XK = "약속을 해.";
          changesMade++;
        }
        
        // 규칙 9: XE: 彼女の瞳は美しい。 / XK: 그녀의 눈동자는 아름답다. -> XK: 그녀의 눈은 아름다워.
        if (item.XE === "彼女の瞳は美しい。" && item.XK === "그녀의 눈동자는 아름답다.") {
          item.XK = "그녀의 눈은 아름다워.";
          changesMade++;
        }

        // 규칙 10: XE: 猫がいる。 (고양이가 있다) -> XK: 고양이가 있네. (보다 자연스러운 발견)
        if (item.XE === "猫がいる。" && item.XK === "고양이가 있다.") {
            item.XK = "고양이가 있네.";
            changesMade++;
        }

        // 규칙 11: XE: もう我慢できない。 (이제 더 이상 참을 수 없어.) -> XK: 더는 못 참겠어.
        if (item.XE === "もう我慢できない。" && item.XK === "이제 더 이상 참을 수 없어.") {
            item.XK = "더는 못 참겠어.";
            changesMade++;
        }

        // 규칙 12: XE: 道を見失った。 (길을 잃어버렸다.) -> XK: 길을 잃었어.
        if (item.XE === "道を見失った。" && item.XK === "길을 잃어버렸다.") {
            item.XK = "길을 잃었어.";
            changesMade++;
        }

        // 규칙 13: XE: 頑張るから。 (열심히 할 거니까.) -> XK: 힘낼 테니까.
        if (item.XE === "頑張るから。" && item.XK === "열심히 할 거니까.") {
            item.XK = "힘낼 테니까.";
            changesMade++;
        }
        
        // 규칙 14: XE: 学校に行く。 (학교에 가다.) -> XK: 학교에 가.
        if (item.XE === "学校に行く。" && item.XK === "학교에 가다.") {
            item.XK = "학교에 가.";
            changesMade++;
        }
        
        // 규칙 15: XE: 彼は懸命に生きている。 (그는 열심히 살고 있다.) -> XK: 그는 열심히 살고 있어.
        if (item.XE === "彼は懸命に生きている。" && item.XK === "그는 열심히 살고 있다.") {
            item.XK = "그는 열심히 살고 있어.";
            changesMade++;
        }
        
        // 규칙 16: XE: 雨が降ったから試合は中止になった。 (비가 왔기 때문에 시합은 중단됐다.) -> XK: 비가 와서 경기가 취소됐어.
        if (item.XE === "雨が降ったから試合は中止になった。" && item.XK === "비가 왔기 때문에 시합은 중단됐다.") {
            item.XK = "비가 와서 경기가 취소됐어.";
            changesMade++;
        }
        
        // 규칙 17: XE: テレビを見る (텔레비전을 보다) -> XK: TV 봐.
        if (item.XE === "テレビを見る" && item.XK === "텔레비전을 보다") {
            item.XK = "TV 봐.";
            changesMade++;
        }

        // 규칙 18: XE: いい天気だね (좋은 날씨네) -> XK: 날씨 좋네.
        if (item.XE === "いい天気だね" && item.XK === "좋은 날씨네") {
            item.XK = "날씨 좋네.";
            changesMade++;
        }

        // 규칙 19: XE: 彼は悲しそうな顔をしている。(그는 슬퍼 보이는 얼굴을 하고 있다.) -> XK: 그는 슬픈 표정을 하고 있어.
        if (item.XE === "彼は悲しそうな顔をしている。" && item.XK === "그는 슬퍼 보이는 얼굴을 하고 있다.") {
            item.XK = "그는 슬픈 표정을 하고 있어.";
            changesMade++;
        }

        // 규칙 20: XE: 子供に勉強をさせる。 (아이에게 공부를 시키다.) -> XK: 아이에게 공부시켜.
        if (item.XE === "子供に勉強をさせる。" && item.XK === "아이에게 공부를 시키다.") {
            item.XK = "아이에게 공부시켜.";
            changesMade++;
        }

        // 규칙 21: XE: 彼は人を騙すのが上手だ。 (그는 사람을 속이는 것이 능숙하다.) -> XK: 그는 남을 잘 속여.
        if (item.XE === "彼は人を騙すのが上手だ。" && item.XK === "그는 사람을 속이는 것이 능숙하다.") {
            item.XK = "그는 남을 잘 속여.";
            changesMade++;
        }
        
        // 규칙 22: XE: 闇が深くなる。 (어둠이 깊어지다.) -> XK: 어둠이 깊어져.
        if (item.XE === "闇が深くなる。" && item.XK === "어둠이 깊어지다.") {
            item.XK = "어둠이 깊어져.";
            changesMade++;
        }

        // 규칙 23: XE: 彼は成功を望んでいる。 (그는 성공을 바라고 있다.) -> XK: 그는 성공을 바라고 있어.
        if (item.XE === "彼は成功を望んでいる。" && item.XK === "그는 성공을 바라고 있다.") {
            item.XK = "그는 성공을 바라고 있어.";
            changesMade++;
        }

        // 규칙 24: XE: これは大切な事だ。 (이것은 중요한 일이다.) -> XK: 이건 중요한 일이야.
        if (item.XE === "これは大切な事だ。" && item.XK === "이것은 중요한 일이다.") {
            item.XK = "이건 중요한 일이야.";
            changesMade++;
        }

        // 규칙 25: XE: 彼は文句ばかり言っている。 (그는 불평뿐이야.) -> XK: 그는 불평만 해.
        if (item.XE === "彼は文句ばかり言っている。" && item.XK === "그는 불평뿐이야.") {
            item.XK = "그는 불평만 해.";
            changesMade++;
        }
        
        // 규칙 26: XE: 彼は信じられる人だ。 (그는 믿을 수 있는 사람이다.) -> XK: 그는 믿을 만한 사람이야.
        if (item.XE === "彼は信じられる人だ。" && item.XK === "그는 믿을 수 있는 사람이다.") {
            item.XK = "그는 믿을 만한 사람이야.";
            changesMade++;
        }
        
        // 규칙 27: XE: これは大切な物です。 (이것은 중요한 물건입니다.) -> XK: 이건 소중한 물건이에요.
        if (item.XE === "これは大切な物です。" && item.XK === "이것은 중요한 물건입니다.") {
            item.XK = "이건 소중한 물건이에요.";
            changesMade++;
        }

        // 규칙 28: XE: 鍵を探しています。 (열쇠를 찾고 있습니다.) -> XK: 열쇠를 찾고 있어요.
        if (item.XE === "鍵を探しています。" && item.XK === "열쇠를 찾고 있습니다.") {
            item.XK = "열쇠를 찾고 있어요.";
            changesMade++;
        }

        // 규칙 29: XE: この問題がわからない。 (이 문제를 이해할 수 없다.) -> XK: 이 문제 모르겠어.
        if (item.XE === "この問題がわからない。" && item.XK === "이 문제를 이해할 수 없다.") {
            item.XK = "이 문제 모르겠어.";
            changesMade++;
        }

        // 규칙 30: XE: 彼は人を騙す。 (그는 사람을 속인다.) -> XK: 그는 남을 속여.
        if (item.XE === "彼は人を騙す。" && item.XK === "그는 사람을 속인다.") {
            item.XK = "그는 남을 속여.";
            changesMade++;
        }

        // 추가된 규칙: T1: ついて 예문 수정
        // XE: 彼は嘘をついてばかりいる。
        // XK: 그는 거짓말만 해.
        // XI (헵번식 로마자): Kare wa uso o tsuite bakari iru.
        // XR (한글 발음 표기): 카레 와 우소 오 츠이테 바카리 이루
        // XT: 그는 거짓말만 하고 있다.
        if (item.T1 === "ついて" && item.XE === "彼は嘘をついてばかりいる。" && item.XK === "그는 거짓말만 해.") {
            item.XI = "Kare wa uso o tsuite bakari iru.";
            item.XR = "카레 와 우소 오 츠이테 바카리 이루";
            item.XT = "그는 거짓말만 하고 있다.";
            changesMade++;
        }

      });
    }
  });

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`파일 수정 완료 (XE, XK): ${filePath} (${changesMade}개 항목 수정됨)`);
  } else {
    console.log("수정된 항목이 없습니다 (XE, XK).");
  }

} catch (error) {
  console.error('스크립트 실행 중 오류 발생 (XE, XK):', error);
} 