const fs = require('fs');
const filePath = './songs/deep_song_has_no_form.json';

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error("파일을 읽는 중 오류 발생:", err);
    return;
  }

  let jsonData;
  try {
    jsonData = JSON.parse(data);
  } catch (parseErr) {
    console.error("JSON 파싱 오류:", parseErr);
    return;
  }

  let changesMade = 0;

  jsonData.translatedLines.forEach(line => {
    if (line.LI) {
      line.LI.forEach(morpheme => {
        if (morpheme.XR && morpheme.XR.includes('훗테')) {
          const originalXR = morpheme.XR;
          morpheme.XR = morpheme.XR.replace(/훗테/g, '훗테');
          if (originalXR !== morpheme.XR) {
            console.log(`수정: ${originalXR} -> ${morpheme.XR}`);
            changesMade++;
          }
        }
      });
    }
  });

  if (changesMade > 0) {
    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (writeErr) => {
      if (writeErr) {
        console.error("파일을 쓰는 중 오류 발생:", writeErr);
        return;
      }
      console.log(`총 ${changesMade}개의 XR 필드가 수정되었습니다. (${filePath})`);
    });
  } else {
    console.log("수정할 내용이 없습니다.");
  }
}); 