const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');

// 새로운 예문 정보
const newXE = "子供だけど、意見は一人前だ。";
const newXR = "코도모다케도, 이켄 와 이치닌마에다.";
const newXK = "어린애지만, 의견은 어른 몫이다."; // 또는 "어린애지만, 의견은 제 몫을 한다."
const newXI = "'子供(こども)'는 '어린이'라는 뜻의 명사입니다. 명사 뒤에 'だけど'가 붙어 '어린이지만'이라는 역접의 의미를 나타냅니다. '一人前(いちにんまえ)'는 '한 사람 몫, 제 몫을 함'을 의미합니다.";


try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  const targetXE = "寒いだけど、窓を開けよう。";

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.XE === targetXE) {
            console.log(`Found target XE at T0: "${line.T0}", T1: "${item.T1}"`);
            console.log(`  Original XE: "${item.XE}"`);
            item.XE = newXE;
            console.log(`  New XE: "${item.XE}"`);

            if (item.XR) { // 기존 XR 필드가 있다면 수정
              console.log(`  Original XR: "${item.XR}"`);
              item.XR = newXR;
              console.log(`  New XR: "${item.XR}"`);
            } else { // 없다면 새로 추가
              item.XR = newXR;
              console.log(`  Added new XR: "${item.XR}"`);
            }

            if (item.XK) { // 기존 XK 필드가 있다면 수정
              console.log(`  Original XK: "${item.XK}"`);
              item.XK = newXK;
              console.log(`  New XK: "${item.XK}"`);
            } else { // 없다면 새로 추가
              item.XK = newXK;
              console.log(`  Added new XK: "${item.XK}"`);
            }

            if (item.XI) { // 기존 XI 필드가 있다면 수정
              console.log(`  Original XI: "${item.XI}"`);
              item.XI = newXI;
              console.log(`  New XI: "${item.XI}"`);
            } else { // 없다면 새로 추가
              item.XI = newXI;
              console.log(`  Added new XI: "${item.XI}"`);
            }
            changesMade++;
          }
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} changes for the example sentence.`);
    } else {
      console.log(`\nNo changes needed in ${filePath} for the example sentence "${targetXE}".`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 