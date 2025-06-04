const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'yama_nova.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          // 수정 규칙 1
          if (line.T0 === "だけの心なんかで" && item.T1 === "心" && item.E1 === "'마음'을 의미하는 명사입니다.") {
            item.E1 = "'마음'을 의미하는 명사로, 사람의 감정, 의지, 생각 등이 작용하는 정신의 중심 부분을 가리킵니다.";
            console.log(`- Updated E1 for T0: "${line.T0}", T1: "${item.T1}"`);
            console.log(`  Old E1: "'마음'을 의미하는 명사입니다."`);
            console.log(`  New E1: "${item.E1}"`);
            changesMade++;
          }
          // 수정 규칙 2
          if (line.T0 === "だけの心なんかで" && item.T1 === "なんかで" && item.E1 === "'~로'라는 의미로, 어떤 상태나 방식을 나타냅니다.") {
            item.E1 = "'~따위로', '~같은 것으로'라는 의미를 가지며, 대상을 가볍게 보거나 예시를 들 때 사용합니다. 여기서는 '그런 마음 따위로' 정도의 뉘앙스를 전달합니다.";
            console.log(`- Updated E1 for T0: "${line.T0}", T1: "${item.T1}"`);
            console.log(`  Old E1: "'~로'라는 의미로, 어떤 상태나 방식을 나타냅니다."`);
            console.log(`  New E1: "${item.E1}"`);
            changesMade++;
          }
          // 수정 규칙 3
          if (line.T0 === "ちゃんと立っているよ」" && item.T1 === "ちゃんと" && item.E1 === "어떤 행동이 정확하거나 완벽하게 이루어짐을 나타내는 부사입니다.") {
            item.E1 = "'제대로', '확실히', '단정히' 등의 의미를 가지며, 어떤 행동이나 상태가 기준에 맞게 올바르게 이루어짐을 나타내는 부사입니다.";
            console.log(`- Updated E1 for T0: "${line.T0}", T1: "${item.T1}"`);
            console.log(`  Old E1: "어떤 행동이 정확하거나 완벽하게 이루어짐을 나타내는 부사입니다."`);
            console.log(`  New E1: "${item.E1}"`);
            changesMade++;
          }
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} changes.`);
    } else {
      console.log("\nNo changes needed or matching items found for the specified E1 corrections.");
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 