const fs = require('fs');
const filePath = 'songs/deep_yes_gladly.json'; // 실제 파일 경로

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(item => {
    let k0ModifiedThisIteration = false;

    // 규칙 1: 『はい喜んで』
    if (item.T0 === "『はい喜んで』" && item.K0 === "『네, 기꺼이』") {
      item.K0 = "네, 기꺼이"; // 『 』 제거
      k0ModifiedThisIteration = true;
    }
    // 규칙 2: 『あなた方のため』 - 현재 K0 값 "『당신들을 위해』"는 『』를 포함하므로 아래 일반 정리에서 처리될 것임.

    // 규칙 3: 『はい謹んで』
    else if (item.T0 === "『はい謹んで』" && item.K0 === "『네, 삼가』") {
      item.K0 = "네, 삼가"; // 『 』 제거
      k0ModifiedThisIteration = true;
    }
    // 규칙 4: 『あなた方のために』 - 현재 K0 값 "『당신들을 위해』"는 『』를 포함하므로 아래 일반 정리에서 처리될 것임.

    // 규칙 5: 差し伸びてきた手
    else if (item.T0 === "差し伸びてきた手" && item.K0 === "뻗어 온 손") {
      // item.K0 = "뻗어 온 손"; // 변경 없음, 『』 이슈 없음
    }

    // 규칙 6: さながら正義仕立て
    else if (item.T0 === "さながら正義仕立て" && item.K0 === "마치 정의인 양 꾸며대고") {
      // item.K0 = "마치 정의인 양 꾸며대고"; // 변경 없음, 『』 이슈 없음
    }
    
    // 규칙 7: 嫌嫌で生き延びて
    else if (item.T0 === "嫌嫌で生き延びて" && item.K0 === "싫지만 억지로 버텨왔지") {
      // item.K0 = "싫지만 억지로 버텨왔지"; // 변경 없음, 『』 이슈 없음
    }

    // 규칙 8: わからずやに盾
    else if (item.T0 === "わからずやに盾" && item.K0 === "고집불통에게 방패를 들고") {
      // item.K0 = "고집불통에게 방패를 들고"; // 변경 없음, 『』 이슈 없음
    }
    
    // 규칙 9: 『はい喜んであなた方のために』
    else if (item.T0 === "『はい喜んであなた方のために』" && item.K0 === "『네, 기꺼이 여러분을 위해』") {
      item.K0 = "네, 기꺼이 여러분을 위해"; // 『 』 제거
      k0ModifiedThisIteration = true;
    }

    // 규칙 10: 『出来ることなら出来るとこまで』 - 현재 K0 값은 『』 포함. 아래 일반 정리에서 처리.

    // 규칙 11: 奈落音頭奏でろ
    else if (item.T0 === "奈落音頭奏でろ" && item.K0 === "나락의 노래를 연주해라") {
      // item.K0 = "나락의 노래를 연주해라"; // 변경 없음, 『』 이슈 없음
    }

    // 규칙 12: 慣らせ君の病の町を
     else if (item.T0 === "慣らせ君の病の町を" && item.K0 === "익숙해져라, 네 병든 마을에") {
      // item.K0 = "익숙해져라, 네 병든 마을에"; // 변경 없음, 『』 이슈 없음
    }

    // 규칙 13: 隠せ笑える他人のオピニオン
    else if (item.T0 === "隠せ笑える他人のオピニオン" && item.K0 === "감춰라, 비웃음 살 타인의 의견") {
      // item.K0 = "감춰라, 비웃음 살 타인의 의견"; // 변경 없음, 『』 이슈 없음
    }
    
    // 규칙 14: うっちゃれ正義の超人たちを
    else if (item.T0 === "うっちゃれ正義の超人たちを" && item.K0 === "내던져 버려, 정의의 초인들") {
      // item.K0 = "내던져 버려, 정의의 초인들"; // 변경 없음, 『』 이슈 없음
    }
    
    // 규칙 15: 救われたのは僕のうちの1人で (중복 라인 중 첫번째)
    else if (item.T0 === "救われたのは僕のうちの1人で" && item.K0 === "구원받은 건 나 하나뿐이었지") {
      // item.K0 = "구원받은 건 나 하나뿐이었지"; // 변경 없음, 『』 이슈 없음
    }
    
    // 규칙 16: 欠けたとこが希望 (Save this game ,Mr.A.) 救われたのは僕のうちの1人で
    else if (item.T0 === "欠けたとこが希望 (Save this game ,Mr.A.) 救われたのは僕のうちの1人で" && item.K0 === "부족한 부분이 희망 (Save this game, Mr.A.) 구원받은 건 나 혼자였어") {
        // item.K0 = "부족한 부분이 희망 (Save this game, Mr.A.) 구원받은 건 나 혼자였어"; // 변경 없음, 『』 이슈 없음
    }

    // 규칙 17: さぁ!奏でろハクナマタタな音は
    else if (item.T0 === "さぁ!奏でろハクナマタタな音は" && item.K0 === "자! 연주해, 하쿠나마타타 그 소리를") {
        // item.K0 = "자! 연주해, 하쿠나마타타 그 소리를"; // 변경 없음, 『』 이슈 없음
    }
    
    // 규칙 18: 『はい謹んであなた方のために』
    else if (item.T0 === "『はい謹んであなた方のために』" && item.K0 === "『네, 삼가 여러분을 위해』") {
        item.K0 = "네, 삼가 여러분을 위해"; // 『 』 제거
        k0ModifiedThisIteration = true;
    }

    // 모든 K0 값에 대해 남아있을 수 있는 『 』 최종 제거
    const k0_before_final_cleanup = item.K0;
    item.K0 = item.K0.replace(/『|』/g, ''); // 정규식을 사용하여 『 와 』 모두 제거

    if (k0_before_final_cleanup !== item.K0) {
        k0ModifiedThisIteration = true; // 이 최종 정리로 인해 변경된 경우에도 플래그 설정
    }

    if (k0ModifiedThisIteration) {
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