const fs = require('fs');
const filePath = '/Users/jaminku/Desktop/open-haneum/songs/deep_damashiai.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  data.translatedLines.forEach(line => {
    if (line.LI) {
      line.LI.forEach(item => {
        if (item.T1 === 'の' && item.E1 === '의문을 나타내는 종조사입니다.' && item.K1 === '~일까') {
          item.K1 = '~것일까';
          changesMade++;
        }

        if (item.T1 === 'んだろう' && item.K1 === '을까') {
          item.K1 = '~일까';
          changesMade++;
        }
      });
    }
  });

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`파일 수정 완료 (K1 수정): ${filePath} (${changesMade}개 항목 수정됨)`);
  } else {
    console.log("수정된 항목이 없습니다 (K1 수정).");
  }

} catch (error) {
  console.error('스크립트 실행 중 오류 발생 (K1 수정):', error);
} 