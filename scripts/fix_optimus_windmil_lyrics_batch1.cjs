const fs = require('fs');
const path = require('path');

// 스크립트 파일이 위치한 디렉토리(__dirname, 예: scripts)의
// 상위 디렉토리(..) 아래의 'songs' 폴더에 있는 대상 파일을 지정합니다.
const filePath = path.join(__dirname, '..', 'songs', 'optimus_windmil.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      // 첫 번째 수정 대상: T0: "被风车带走不在"
      if (line.T0 === "被风车带走不在" && line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.T1 === "不在") {
            let k1Changed = false;
            let e1Changed = false;
            const targetK1BuZai = "없다";
            const targetE1BuZai = "어떤 사람이나 사물이 특정 장소에 없거나, 존재하지 않음, 또는 (비유적으로) 사라짐을 나타냅니다.";

            if (item.K1 !== targetK1BuZai) {
              console.log(`- Updating K1 for T0: "${line.T0}", T1: "${item.T1}". Old: "${item.K1}", New: "${targetK1BuZai}"`);
              item.K1 = targetK1BuZai;
              k1Changed = true;
            }
            if (item.E1 !== targetE1BuZai) {
              console.log(`- Updating E1 for T0: "${line.T0}", T1: "${item.T1}". Old: "${item.E1}", New: "${targetE1BuZai}"`);
              item.E1 = targetE1BuZai;
              e1Changed = true;
            }
            if (k1Changed || e1Changed) {
              changesMade++;
            }
          }
        });
      }

      // 두 번째 수정 대상: T0: "至少年轻我还记得"
      if (line.T0 === "至少年轻我还记得" && line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.T1 === "年轻") {
            const targetE1NianQing = "나이가 어리고 활기찬 상태를 나타내는 형용사입니다. 때로는 '젊은 시절', '젊음'과 같이 명사적으로도 사용될 수 있습니다.";
            if (item.E1 !== targetE1NianQing) {
              console.log(`- Updating E1 for T0: "${line.T0}", T1: "${item.T1}". Old: "${item.E1}", New: "${targetE1NianQing}"`);
              item.E1 = targetE1NianQing;
              changesMade++;
            }
          }
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Successfully updated ${filePath} with ${changesMade} changes.\nReview the changes and commit if they are correct.`);
    } else {
      console.log(`No changes needed for ${filePath} based on the current script logic.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array in the JSON data, or the data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
}
 