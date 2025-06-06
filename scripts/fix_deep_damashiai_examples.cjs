const fs = require('fs');
const filePath = '/Users/jaminku/Desktop/open-haneum/songs/deep_damashiai.json'; // 파일 경로는 실제 환경에 맞게 수정

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(item => {
    // 규칙 1: "私を生きてくから" -> "나로서 살아갈 테니까"
    if (item.T0 === "私を生きてくから" && item.K0 === "나를 살아가게 해줘서") {
      item.K0 = "나로서 살아갈 테니까";
      changesMade++;
    } else if (item.T0 === "私を生きてくから" && item.K0 === "나를 살아가니까") { // 기존 로그에 없던 케이스 추가
      item.K0 = "나로서 살아갈 테니까";
      changesMade++;
    } else if (item.T0 === "私を生きてくから" && item.K0 === "나로서 살아갈테니까") { // 띄어쓰기 수정
        item.K0 = "나로서 살아갈 테니까";
        changesMade++;
    }


    // 규칙 2: "信じられる物を探す"의 K0를 "믿을 수 있는 것을 찾네"로 변경 (기존 K0가 "믿을 수 있는 것을 찾다" 또는 "믿을 수 있는 것을 찾아"인 경우)
    if (item.T0 === "信じられる物を探す") {
      if (item.K0 === "믿을 수 있는 것을 찾다") {
        item.K0 = "믿을 수 있는 것을 찾네";
        changesMade++;
      } else if (item.K0 === "믿을 수 있는 것을 찾아") {
        item.K0 = "믿을 수 있는 것을 찾네";
        changesMade++;
      }
    }
    
    // 규칙 2-1: "信じられるものを探す"의 K0를 "믿을 수 있는 것을 찾네"로 변경 (기존 K0가 "믿을 수 있는 것을 찾다" 또는 "믿을 수 있는 것을 찾아"인 경우)
    // 위와 동일 T0이나 조사만 다름
    if (item.T0 === "信じられるものを探す") {
      if (item.K0 === "믿을 수 있는 것을 찾다") {
        item.K0 = "믿을 수 있는 것을 찾네";
        changesMade++;
      } else if (item.K0 === "믿을 수 있는 것을 찾아") {
        item.K0 = "믿을 수 있는 것을 찾네";
        changesMade++;
      }
    }

    // 규칙 3: "瞳が欲しい" (K0: "눈동자를 원해") -> "그 눈동자를 원해"
    if (item.T0 === "瞳が欲しい" && item.K0 === "눈동자를 원해") {
      item.K0 = "그 눈동자를 원해";
      changesMade++;
    }

    // 규칙 4: "もう見失わないから" (K0: "이제 더 이상 잃어버리지 않을 거야.") -> "이제 더는 놓치지 않을 테니까."
    if (item.T0 === "もう見失わないから" && item.K0 === "이제 더 이상 잃어버리지 않을 거야.") {
      item.K0 = "이제 더는 놓치지 않을 테니까.";
      changesMade++;
    }

    // 규칙 5: "一口齧って欲しいだけ" (K0: "한 입만 깨물어서 원할 뿐") -> "한 입 맛보길 원할 뿐"
    if (item.T0 === "一口齧って欲しいだけ" && item.K0 === "한 입만 깨물어서 원할 뿐") {
      item.K0 = "한 입 맛보길 원할 뿐";
      changesMade++;
    } else if (item.T0 === "一口齧って欲しいだけ" && item.K0 === "한 입 맛보길 원할 뿐") { // 이미 수정된 케이스지만, 혹시 모를 중복 실행 방지
      // No change needed
    }


    // 규칙 6: "夢だけ見ていたね" (K0: "꿈만 꾸고 있었네.") -> "꿈만 꾸고 있었지."
    if (item.T0 === "夢だけ見ていたね" && item.K0 === "꿈만 꾸고 있었네.") {
      item.K0 = "꿈만 꾸고 있었지.";
      changesMade++;
    }

    // 규칙 7: "私を象ろう" (K0: "나를 형상화하자.") -> "나를 만들어가자."
    if (item.T0 === "私を象ろう" && item.K0 === "나를 형상화하자.") {
      item.K0 = "나를 만들어가자.";
      changesMade++;
    }

    // 규칙 8: "悲しそうな顔させてしまうわ" (K0: "슬픈 표정 짓게 만들어 버리네.") -> "슬픈 표정을 짓게 해버렸네."
    if (item.T0 === "悲しそうな顔させてしまうわ" && item.K0 === "슬픈 표정 짓게 만들어 버리네.") {
      item.K0 = "슬픈 표정을 짓게 해버렸네.";
      changesMade++;
    }

    // 규칙 9: "触れてしまうことが怖くなったの" (K0: "맞닥뜨리는 게 두려워졌어요.") -> "닿는 것이 두려워졌어." (로그 기반)
    if (item.T0 === "触れてしまうことが怖くなったの" && item.K0 === "맞닥뜨리는 게 두려워졌어요.") {
        item.K0 = "닿는 것이 두려워졌어.";
        changesMade++;
    } else if (item.T0 === "触れてしまうことが怖くなったの" && item.K0 === "닿는 것이 두려워졌어.") { // 이미 수정된 케이스
        // No change needed
    }


    // 추가 개선 규칙들
    // 규칙 10: "どうして嘘を覚えたんだろう" (K0: "왜 거짓말을 배웠을까?") -> "어째서 거짓말을 배운 걸까?"
    if (item.T0 === "どうして嘘を覚えたんだろう" && item.K0 === "왜 거짓말을 배웠을까?") {
        item.K0 = "어째서 거짓말을 배운 걸까?";
        changesMade++;
    }

    // 규칙 11: "望まない事ばかりだ" (K0: "원치 않는 일들뿐이야.") -> "원하지 않는 일들뿐이야." (띄어쓰기 및 표현)
    if (item.T0 === "望まない事ばかりだ" && item.K0 === "원치 않는 일들뿐이야.") {
        item.K0 = "원하지 않는 일들뿐이야.";
        changesMade++;
    }
    
    // 규칙 12: "まだ未来は何も決まっちゃいないよ" (K0: "아직 미래는 아무것도 정해지지 않았어.") -> "미래는 아직 아무것도 정해지지 않았어." (어순 자연스럽게)
    if (item.T0 === "まだ未来は何も決まっちゃいないよ" && item.K0 === "아직 미래는 아무것도 정해지지 않았어.") {
        item.K0 = "미래는 아직 아무것도 정해지지 않았어.";
        changesMade++;
    }

    // 규칙 13: "自分を守りたいだけじゃないの?" (K0: "나 자신을 지키고 싶은 것뿐이잖아?") -> "자신을 지키고 싶은 것뿐이잖아?" (보다 간결하게)
    if (item.T0 === "自分を守りたいだけじゃないの?" && item.K0 === "나 자신을 지키고 싶은 것뿐이잖아?") {
        item.K0 = "자신을 지키고 싶은 것뿐이잖아?";
        changesMade++;
    }
    
    // 규칙 14: "青いままで熟れた果実みたいに" (K0: "파란 채로 익은 과일처럼") -> "푸른 채로 익은 과일처럼" (표현 개선)
    if (item.T0 === "青いままで熟れた果実みたいに" && item.K0 === "파란 채로 익은 과일처럼") {
        item.K0 = "푸른 채로 익은 과일처럼";
        changesMade++;
    }

    // 규칙 15: "枯れてしまう前に" (K0: "시들어 버리기 전에") -> "시들기 전에" (간결하게)
    if (item.T0 === "枯れてしまう前に" && item.K0 === "시들어 버리기 전에") {
        item.K0 = "시들기 전에";
        changesMade++;
    }
    
    // 규칙 16: "心、裏切らないで" (K0: "마음, 배신하지 말아줘") -> "마음아, 배신하지 마" (호격조사 및 어투 변경)
    if (item.T0 === "心、裏切らないで" && item.K0 === "마음, 배신하지 말아줘") {
        item.K0 = "마음아, 배신하지 마";
        changesMade++;
    }

    // 규칙 17: "騙し合いのこの世界で" (K0: "서로 속이는 이 세상에서") -> "서로 속이는 이 세계에서" (세계 표현 통일)
    if (item.T0 === "騙し合いのこの世界で" && item.K0 === "서로 속이는 이 세상에서") {
        item.K0 = "서로 속이는 이 세계에서";
        changesMade++;
    }
    
    // 규칙 18: "月の裏側も知らずに" (K0: "달의 뒷면도 모르면서") -> "달의 뒷모습도 모른 채" (시적 표현)
    if (item.T0 === "月の裏側も知らずに" && item.K0 === "달의 뒷면도 모르면서") {
        item.K0 = "달의 뒷모습도 모른 채";
        changesMade++;
    }

    // 규칙 19: "どうして本当を話せないんだろう" (K0: "어째서 진실을 말할 수 없는 걸까?") -> "어째서 진실을 말하지 못하는 걸까?" (표현 개선)
    if (item.T0 === "どうして本当を話せないんだろう" && item.K0 === "어째서 진실을 말할 수 없는 걸까?") {
        item.K0 = "어째서 진실을 말하지 못하는 걸까?";
        changesMade++;
    }
    
    // 규칙 20: "覚えていられるか" (K0: "기억할 수 있을까?") -> "기억하고 있을까?" (의미 명확화)
    if (item.T0 === "覚えていられるか" && item.K0 === "기억할 수 있을까?") {
        item.K0 = "기억하고 있을까?";
        changesMade++;
    }
    
    // 규칙 21: "どうして本当を隠すのだろう" (K0: "왜 진실을 숨기는 걸까?") -> "어째서 진실을 숨기는 걸까?" (어투 통일)
    if (item.T0 === "どうして本当を隠すのだろう" && item.K0 === "왜 진실을 숨기는 걸까?") {
        item.K0 = "어째서 진실을 숨기는 걸까?";
        changesMade++;
    }

    // 규칙 22: "信じられる物を透かす" (K0: "믿을 수 있는 것을 비추다") -> "믿을 수 있는 것을 꿰뚫어 보네" (보다 강한 표현)
    if (item.T0 === "信じられる物を透かす" && item.K0 === "믿을 수 있는 것을 비추다") {
        item.K0 = "믿을 수 있는 것을 꿰뚫어 보네";
        changesMade++;
    }
    
    // 규칙 23: "いつか必ず出会うだろう同じ痛み" (K0: "언젠가 반드시 만나게 될 거야, 같은 아픔") -> "언젠가 반드시 마주칠 같은 아픔" (간결하고 시적인 표현)
    if (item.T0 === "いつか必ず出会うだろう同じ痛み" && item.K0 === "언젠가 반드시 만나게 될 거야, 같은 아픔") {
        item.K0 = "언젠가 반드시 마주칠 같은 아픔";
        changesMade++;
    }

    // 규칙 24: "気付かれもしないで" (K0: "아무도 눈치채지 못한 채") -> "눈치채지 못한 채로" (자연스러운 연결)
    if (item.T0 === "気付かれもしないで" && item.K0 === "아무도 눈치채지 못한 채") {
        item.K0 = "눈치채지 못한 채로";
        changesMade++;
    }
    
    // 규칙 25: "私は知らぬふりをするのでしょう" (K0: "나는 모르는 척하겠지.") -> "나는 모르는 척하겠지" (마침표 제거, 다른 라인과 통일)
    if (item.T0 === "私は知らぬふりをするのでしょう" && item.K0 === "나는 모르는 척하겠지.") {
        item.K0 = "나는 모르는 척하겠지";
        changesMade++;
    }

    // 규칙 26: "手探りでいいよ" (K0: "더듬거리며 찾아도 괜찮아.") -> "더듬거리며 찾아도 돼." (반말 어투 일관성)
    if (item.T0 === "手探りでいいよ" && item.K0 === "더듬거리며 찾아도 괜찮아.") {
        item.K0 = "더듬거리며 찾아도 돼.";
        changesMade++;
    }

    // 규칙 27: "真実は零れてく" (K0: "진실은 흘러넘쳐.") -> "진실은 흘러넘치네." (어투 변경)
    if (item.T0 === "真実は零れてく" && item.K0 === "진실은 흘러넘쳐.") {
        item.K0 = "진실은 흘러넘치네.";
        changesMade++;
    }
    
    // 규칙 28: "一口齧って欲しいだけ" (K0: "한 입 맛보길 원할 뿐") -> "한 입 맛보길 바랄 뿐" (표현 개선)
    // 이 규칙은 규칙 5와 T0, K0가 동일하므로, 규칙 5의 수정 이후에 적용되지 않도록 주의해야 합니다.
    // 여기서는 규칙 5에서 이미 "한 입 맛보길 원할 뿐"으로 변경되었으므로, 이 규칙은 사실상 작동하지 않거나,
    // 만약 규칙 5가 다른 값으로 수정한다면 그 다음에 이어서 적용될 수 있습니다.
    // 여기서는 명확성을 위해 K0 조건을 "한 입 맛보길 원할 뿐"으로 명시합니다.
    if (item.T0 === "一口齧って欲しいだけ" && item.K0 === "한 입 맛보길 원할 뿐") {
        item.K0 = "한 입 맛보길 바랄 뿐";
        changesMade++;
    }
    
    // 규칙 29: "どうして嘘をついてしまったの" (K0: "어째서 거짓말을 해버린 걸까?") -> "어째서 거짓말을 해버린 걸까" (마침표 제거)
    if (item.T0 === "どうして嘘をついてしまったの" && item.K0 === "어째서 거짓말을 해버린 걸까?") {
        item.K0 = "어째서 거짓말을 해버린 걸까";
        changesMade++;
    }

    // 규칙 30: "あなたはどんな顔するでしょう" (K0: "그대는 어떤 표정을 지을까.") -> "그댄 어떤 표정을 지을까" (마침표 제거 및 축약)
    if (item.T0 === "あなたはどんな顔するでしょう" && item.K0 === "그대는 어떤 표정을 지을까.") {
        item.K0 = "그댄 어떤 표정을 지을까";
        changesMade++;
    }

    // 규칙 31: "触れたはずのぬくもりだけ" (K0: "분명히 닿았던 따뜻함만") -> "닿았을 온기만이" (시적 표현)
    if (item.T0 === "触れたはずのぬくもりだけ" && item.K0 === "분명히 닿았던 따뜻함만") {
        item.K0 = "닿았을 온기만이";
        changesMade++;
    }
    
    // 규칙 32: "分け合えるような貴方と出会うために" (K0: "나눌 수 있는 당신과 만나기 위해") -> "함께 나눌 당신과 만나기 위해" (표현 개선)
    if (item.T0 === "分け合えるような貴方と出会うために" && item.K0 === "나눌 수 있는 당신과 만나기 위해") {
        item.K0 = "함께 나눌 당신과 만나기 위해";
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