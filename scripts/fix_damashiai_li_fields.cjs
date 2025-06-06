const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_damashiai.json');

// 수정할 LI 항목 목록
// 각 항목: { targetT0, targetT1, newK1, newE1, newXE, newXK, newXI, newXR, (optional) oldE1_for_check }
// oldE1_for_check: E1을 수정할 때, 현재 값이 특정 값일 경우에만 수정하도록 하기 위한 조건. 없으면 E1은 무조건 newE1으로 덮어씀.
const corrections = [
  {
    targetT0: "瞳が欲しい",
    targetT1: "瞳",
    newXK: "그녀의 눈동자는 아름다워."
  },
  {
    targetT0: "もう見失わないから",
    targetT1: "見失わ",
    newK1: "잃어버리다",
    oldE1_for_check: "'見失う'의 미연형으로, '잃어버리지 않다', '놓치지 않다'라는 의미를 나타냅니다.",
    newE1: "'見失う(잃어버리다, 놓치다)'의 어간입니다. 뒤에 부정의 조동사가 붙어 '잃어버리지 않다' 등의 의미로 활용됩니다.",
    newXE: "見失わないように、しっかり見ていよう。",
    newXK: "놓치지 않도록 똑바로 보고 있자.",
    newXI: "miushinawanai youni, shikkari miteiyou.",
    newXR: "미우시나와 나이 요오니, 싯카리 미테 이요오."
  },
  {
    targetT0: "私を象ろう",
    targetT1: "象ろう",
    newXK: "미래를 형상화하다."
  },
  {
    targetT0: "騙し愛の闇の中で",
    targetT1: "騙し",
    newK1: "속임",
    // E1은 해당 T1의 기존 값을 알 수 없으므로, 스크립트에서 읽어서 처리하거나, 여기서 지정하지 않고 필요한 경우 수동으로 추가합니다.
    // 이번 실행에서는 기존 E1이 없거나, 있어도 덮어쓰도록 newE1을 정의합니다.
    newE1: "'속이다'라는 의미의 동사 '騙す'의 명사형입니다. '속임수'라는 의미도 가집니다.",
    newXE: "騙しの手口に気をつける。",
    newXK: "속임수의 수법을 조심한다.",
    newXI: "damashi no teguchi ni ki o tsukeru.",
    newXR: "다마시노 테구치니 키오 츠케루."
  },
  {
    targetT0: "望まない事ばかりだ",
    targetT1: "望まない",
    newXE: "誰もが失敗を望まない。",
    newXK: "누구도 실패를 바라지 않는다.",
    newXI: "daremo ga shippai o nozomanai.",
    newXR: "다레모가 십파이오 노조마나이."
  },
  {
    targetT0: "青いままで熟れた果実みたいに",
    targetT1: "青い",
    oldE1_for_check: "색상을 나타내는 형용사로 '파란'이라는 의미입니다.",
    newE1: "색상을 나타내는 형용사로 '파란'이라는 기본적인 의미 외에, '미숙한', '덜 익은'이라는 의미도 가집니다. (예: 青二才 아오니사이 - 풋내기)",
    newXE: "まだ青い果実だ。",
    newXK: "아직 덜 익은 과일이다.",
    newXI: "mada aoi kajitsu da.",
    newXR: "마다 아오이 카지츠다."
  },
  {
    targetT0: "触れてしまうことが怖くなったの",
    targetT1: "触れて",
    newK1: "닿아서",
    // oldE1_for_check와 newE1을 유사하게 처리
    newE1: "'触れる(닿다, 만지다)'의 て형입니다. 행동의 연속이나 원인/이유를 나타낼 수 있습니다.",
    newXE: "手に触れて、温かさを感じた。",
    newXK: "손에 닿아서 따뜻함을 느꼈다.",
    newXI: "te ni furete, atatakasa o kanjita.",
    newXR: "테니 후레테, 아타타카사오 칸지타."
  },
  {
    targetT0: "月の裏側も知らずに",
    targetT1: "裏側",
    newXR: "카아도 노 우라 가와 오 미루"
  },
  {
    targetT0: "私は知らぬふりをするのでしょう",
    targetT1: "のでしょう",
    newR1: "노 데쇼오",
    newXR: "아메 가 후루 노 데쇼오"
  },
  {
    targetT0: "いつか必ず出会うだろう同じ痛み",
    targetT1: "だろう",
    newR1: "다로오",
    newR2: "다로오",
    newXR: "아시타 와 하레루 다로오"
  },
  {
    targetT0: "分け合えるような貴方と出会うために",
    targetT1: "ような",
    newR1: "요오 나",
    newR2: "요오 다",
    newXR: "유메 노 요오 나 하나시"
  },
  {
    targetT0: "分け合えるような貴方と出会うために",
    targetT1: "貴方",
    newXR: "아나타 와 도오 오모이마스 카"
  },
  {
    targetT0: "分け合えるような貴方と出会うために",
    targetT1: "ために",
    newXR: "켄코오 노 타메 니 운도오 스루"
  }
];

let changesMadeCount = 0;

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      for (const correction of corrections) {
        if (line.T0 === correction.targetT0 && line.LI && Array.isArray(line.LI)) {
          line.LI.forEach(item => {
            if (item.T1 === correction.targetT1) {
              let itemChanged = false;
              console.log(`\nFound item for T0: "${line.T0}", T1: "${item.T1}"`);

              if (correction.newK1 !== undefined && item.K1 !== correction.newK1) {
                console.log(`  - Updating K1: "${item.K1}" -> "${correction.newK1}"`);
                item.K1 = correction.newK1;
                itemChanged = true;
              }
              if (correction.newR1 !== undefined && item.R1 !== correction.newR1) {
                console.log(`  - Updating R1: "${item.R1}" -> "${correction.newR1}"`);
                item.R1 = correction.newR1;
                itemChanged = true;
              }
              if (correction.newR2 !== undefined && item.R2 !== correction.newR2) {
                console.log(`  - Updating R2: "${item.R2}" -> "${correction.newR2}"`);
                item.R2 = correction.newR2;
                itemChanged = true;
              }
              if (correction.newE1 !== undefined) {
                if (correction.oldE1_for_check !== undefined) {
                  if (item.E1 === correction.oldE1_for_check) {
                    console.log(`  - Updating E1 (condition met): "${item.E1}" -> "${correction.newE1}"`);
                    item.E1 = correction.newE1;
                    itemChanged = true;
                  } else if (item.E1 !== correction.newE1) {
                    console.warn(`  - WARNING: E1 for T1: "${item.T1}" is "${item.E1}". Expected oldE1: "${correction.oldE1_for_check}" or already newE1. Not overwriting with "${correction.newE1}".`);
                  }
                } else if (item.E1 !== correction.newE1) {
                  console.log(`  - Updating E1: "${item.E1}" -> "${correction.newE1}"`);
                  item.E1 = correction.newE1;
                  itemChanged = true;
                }
              }
              if (correction.newXE !== undefined && item.XE !== correction.newXE) {
                console.log(`  - Updating XE: "${item.XE}" -> "${correction.newXE}"`);
                item.XE = correction.newXE;
                itemChanged = true;
              }
              if (correction.newXK !== undefined && item.XK !== correction.newXK) {
                console.log(`  - Updating XK: "${item.XK}" -> "${correction.newXK}"`);
                item.XK = correction.newXK;
                itemChanged = true;
              }
              if (correction.newXI !== undefined && item.XI !== correction.newXI) {
                console.log(`  - Updating XI: "${item.XI}" -> "${correction.newXI}"`);
                item.XI = correction.newXI;
                itemChanged = true;
              }
              if (correction.newXR !== undefined && item.XR !== correction.newXR) {
                console.log(`  - Updating XR: "${item.XR}" -> "${correction.newXR}"`);
                item.XR = correction.newXR;
                itemChanged = true;
              }

              if (itemChanged) {
                changesMadeCount++;
              } else {
                console.log("  - No changes applied to this item based on new values (already up-to-date or conditions not met for K1,R1,R2,E1,XE,XK,XI,XR).");
              }
            }
          });
        }
      }
    });

    if (changesMadeCount > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${changesMadeCount} LI item(s) fields in ${filePath}.`);
    } else {
      console.log(`\nNo LI items were updated in ${filePath}. Check if T0/T1 match or if values are already correct.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 