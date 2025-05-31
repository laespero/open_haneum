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
      // 수정 대상: T0: "不用 猜忌 下个地点"
      if (line.T0 === "不用 猜忌 下个地点") {
        const targetK0 = "다음 갈 곳은 의심할 필요 없어.";
        if (line.K0 !== targetK0) {
          console.log(`- Updating K0 for T0: "${line.T0}". Old: "${line.K0}", New: "${targetK0}"`);
          line.K0 = targetK0;
          changesMade++;
        }
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