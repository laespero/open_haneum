const fs = require('fs');
const filePath = './songs/deep_player_one.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(line => {
    if (line.LI && line.LI.length > 0) {
      line.LI.forEach(item => {
        let originalItem = JSON.stringify(item); // 변경 전 항목 저장

        // どうしようもないほど土壇場
        if (line.T0 === "どうしようもないほど土壇場") {
          if (item.T1 === "どうしようもない") {
            item.K1 = "어쩔 도리가 없는";
          }
          if (item.T1 === "土壇場") {
            // 원래 일본어 예문으로 복원
            item.XE = "土壇場で逆転した。";
            item.XK = "마지막 순간에 역전했다.";
          }
        }
        // ここが1番の見せ場
        if (line.T0 === "ここが1番の見せ場") {
          if (item.T1 === "1番") {
            item.K1 = "첫 번째, 최고";
          }
          if (item.T1 === "見せ場") {
            // 원래 일본어 예문으로 복원
            item.XE = "このドラマの見せ場";
            item.XK = "이 드라마의 명장면";
          }
        }
        // 擦り切れたHP
        if (line.T0 === "擦り切れたHP") {
          if (item.T1 === "擦り切れた") {
            item.E1 = "Worn out, frayed. Often used for items that have been used a lot.";
            item.K1 = "닳아 해진";
          }
          if (item.T1 === "HP") { // T1이 영어이므로 영어 예문 유지 또는 개선
            item.E1 = "Abbreviation for Hit Points or Health Points, a common term in games representing a character\'s vitality.";
            item.K1 = "체력 수치";
            // XE, XK는 원본이 영어였거나, 문맥에 맞는 영어 예문 유지
          }
        }
        // 超自分的なアクション
        if (line.T0 === "超自分的なアクション") {
          if (item.T1 === "超自分的な") {
            item.E1 = "Very personal, unique to oneself. '超' (chou) means 'super' or 'ultra', and '自分的' (jibunteki) means 'personal' or 'of oneself'.";
            item.K1 = "매우 자기다운, 자기만의";
          }
        }
        // まだこんなもんじゃないぜ
        if (line.T0 === "まだこんなもんじゃないぜ") {
          if (item.T1 === "もん") {
            item.E1 = "A colloquial contraction of 'もの' (mono), meaning 'thing' or 'stuff'. Can also imply a certain level or standard.";
            item.K1 = "것 (구어체)";
            // 원래 일본어 예문으로 복원
            item.XE = "そんなもんいらない";
            item.XK = "그런 건 필요 없어";
          }
        }
        // いま呼吸は整って 超次元なモーション
        if (line.T0 === "いま呼吸は整って 超次元なモーション") {
          if (item.T1 === "整って") {
            // 원래 일본어 예문으로 복원 (사용자님 지적 사항)
            item.XE = "準備が整った。";
            item.XK = "준비가 갖춰졌다.";
          }
        }
        // 巻き起こせBAN狂わせ
        if (line.T0 === "巻き起こせBAN狂わせ") {
          if (item.T1 === "BAN") { // T1이 영어이므로 영어 예문 유지 또는 개선
            item.XE = "Cause a BAN sensation! Let the wild rumpus start!";
            item.XK = "BAN 센세이션을 일으켜! 광란의 소동을 시작하자!";
          }
        }
        // 身体中満ちてくる底なしパワー
        if (line.T0 === "身体中満ちてくる底なしパワー") {
          if (item.T1 === "底なし") {
            // 원래 일본어 예문으로 복원
            item.XE = "底なしの愛情";
            item.XK = "무한한 사랑";
          }
        }
        // そんなときにこそ行くぜ
        if (line.T0 === "そんなときにこそ行くぜ") {
          if (item.T1 === "ぜ") {
            item.E1 = "A sentence-ending particle used by males to add emphasis, conviction, or a sense of 'let\'s do it!'";
            item.K1 = "(강한 의지, 남성어투)";
          }
        }
        // でも諦めの悪さは
        if (line.T0 === "でも諦めの悪さは") {
          if (item.T1 === "悪さ") {
            item.K1 = "쉽사리 포기하지 않음, 끈기";
            // 원래 일본어 예문으로 복원
            item.XE = "彼の悪さが目立つ。";
            item.XK = "그의 나쁜 점이 눈에 띄어.";
          }
        }
        // 相も変わらずまだ土壇場
        if (line.T0 === "相も変わらずまだ土壇場") {
          if (item.T1 === "相") {
            item.E1 = "In the phrase '相も変わらず' (aimokawarazu), it doesn\'t mean 'each other' but is part of an idiomatic expression meaning 'as usual' or 'still the same'.";
            item.K1 = "(관용구의 일부)";
            // 원래 일본어 예문으로 복원
            item.XE = "相変わらず元気だね。";
            item.XK = "여전히 건강하네.";
          }
        }
        // 歯が立たないバグったような敵も
        if (line.T0 === "歯が立たないバグったような敵も") {
          if (item.T1 === "立たない") {
            item.K1 = "(관용구) 상대가 안 되다";
          }
          if (item.T1 === "バグった") { // T1 어원은 영어이나 일본어화된 표현
            // 원래 일본어 예문으로 복원
            item.XE = "ゲームがバグった。";
            item.XK = "게임이 버그 났다.";
          }
        }
        // 頭ん中バグったように軽い
        if (line.T0 === "頭ん中バグったように軽い") {
          if (item.T1 === "ん") {
            item.K1 = "~의 (구어체)";
          }
          if (item.T1 === "バグった") {
            // 원래 일본어 예문으로 복원
            item.XE = "このゲーム、バグったよ。";
            item.XK = "이 게임, 버그 났어.";
          }
        }
        // 絶対絶命ってチャンスなんじゃないの? and 絶体絶命ってチャンスなんじゃないの?
        if (line.T0 === "絶対絶命ってチャンスなんじゃないの?" || line.T0 === "絶体絶命ってチャンスなんじゃないの?") {
          if (item.T1 === "なん") {
            item.E1 = "Part of 'なんじゃないの' (nan ja nai no), a colloquial way of asking a question or expressing a strong suggestion, like 'isn\'t it?' or 'shouldn\'t it be?'.";
            item.K1 = "(구어체 의문/제안)";
          }
          if (item.T1 === "絶対絶命" || item.T1 === "絶体絶命") {
             // 원래 일본어 예문으로 복원
             item.XE = "絶対絶命のピンチを乗り越えた";
             item.XK = "절체절명의 위기를 극복했다";
          }
        }
        // 脈絡なく湧くTask Task Task
        if (line.T0 === "脈絡なく湧くTask Task Task") {
          if (item.T1 === "Task") {
            // 첫 번째 Task의 E1, K1 수정
            if (item.K1 === "과제" && (item.E1.startsWith("English word for") || item.E1.startsWith("A piece of work"))) { 
              item.E1 = "A specific piece of work required to be done as a duty or assignment.";
              item.K1 = "해야 할 일이나 과업, 과제.";
              // XE, XK는 이전 스크립트에서 이미 문맥에 맞게 수정되었으므로 유지
            } else if (item.K1 === "과제 (반복 강조)") { // 두 번째 Task
              item.E1 = "Repeated for emphasis, indicating multiple or a continuous stream of tasks.";
              // K1, XE, XK 유지
            } else if (item.K1 === "과제 (강력 반복 강조)") { // 세 번째 Task
              item.E1 = "Further repetition to strongly emphasize the overwhelming number or pressure of tasks.";
              // K1, XE, XK 유지
            }
          }
        }
        // 詰んだと見せてから正念場
        if (line.T0 === "詰んだと見せてから正念場") {
          if (item.T1 === "詰んだ") {
            // 원래 일본어 예문으로 복원
            item.XE = "ゲームが詰んだ。";
            item.XK = "게임이 끝났다.";
          }
        }
        // これで感触はEZで終宴はGGでしょう
        if (line.T0 === "これで感触はEZで終宴はGGでしょう") {
          if (item.T1 === "EZ") { // T1이 영어 약자이므로 영어 예문 유지 또는 개선
            item.E1 = "Abbreviation for 'Easy'. In gaming, it means something is not difficult.";
            item.K1 = "이지 (쉬움)";
            item.XE = "Now that I've got the feel for it, this should be EZ (easy)!";
            item.XK = "이제 감을 잡았으니, 이건 EZ(쉽겠지)!";
          }
          if (item.T1 === "GG") { // T1이 영어 약자이므로 영어 예문 유지 또는 개선
            item.E1 = "Abbreviation for 'Good Game'. Used in gaming to acknowledge a game well played, often at the end of a match.";
            item.K1 = "지지 (좋은 게임이었다)";
            item.XE = "The finale should be a GG (Good Game)!";
            item.XK = "피날레는 GG(좋은 게임)가 될 거야!";
          }
        }
        // 容赦なく泣く泣くTick Tick Tack...BOOM!!
        if (line.T0 === "容赦なく泣く泣くTick Tick Tack...BOOM!!") {
          if (item.T1 === "泣く" && item.K1 === "계속 울다") { // 제가 '계속 울다'로 바꾼 K1을 조건으로 사용
            item.E1 = "Repeated '泣く' (naku - to cry) emphasizes the act of crying, implying crying a lot or continuously.";
            // K1 = "계속 울다"; (이미 이 값일 때 변경하므로 다시 설정할 필요 없음)
          }
          if (item.T1 === "Tack") { // T1이 영어이므로 영어 예문 유지 또는 개선
            item.XE = "The sound of time running out, tick tack, then BOOM!";
            item.XK = "시간이 흘러가는 소리, 틱 택, 그리고 붐!";
          }
        }

        if (JSON.stringify(item) !== originalItem) {
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