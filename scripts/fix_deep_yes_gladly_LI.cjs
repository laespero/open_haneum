const fs = require('fs');
const filePath = 'songs/deep_yes_gladly.json';

// 형태소 분석에서 제외할 문장 부호 및 기호 목록
const punctuationToRemove = [
  '.', ',', '?', '!', ':', ';',
  '"', "'", '(', ')', '[', ']', '{', '}',
  '「', '」', '『', '』',
  '・・・', 'ーーー', '~',
  '(', ')' // 괄호도 T1으로 단독 존재 시 제거
];

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let linesChanged = 0;

  data.translatedLines.forEach(line => {
    if (line.LI && Array.isArray(line.LI)) {
      const originalLILength = line.LI.length;
      line.LI = line.LI.filter(morpheme => {
        // T1 값이 문자열이고, punctuationToRemove에 포함되는지 확인
        return typeof morpheme.T1 === 'string' && !punctuationToRemove.includes(morpheme.T1.trim());
      });

      if (line.LI.length !== originalLILength) {
        linesChanged++;
      }
    }
  });

  if (linesChanged > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`파일 수정 완료: ${filePath} (${linesChanged}개 라인에서 형태소 분석(LI) 변경됨)`);
  } else {
    console.log("형태소 분석(LI)에서 수정된 항목이 없습니다.");
  }

} catch (error) {
  console.error('스크립트 실행 중 오류 발생:', error);
} 