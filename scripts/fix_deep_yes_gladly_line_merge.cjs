const fs = require('fs');
const filePath = 'songs/deep_yes_gladly.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let mergedPairsCount = 0;

  const originalTotalLines = data.translatedLines.length;
  const newTranslatedLines = [];
  let i = 0;
  while (i < data.translatedLines.length) {
    let currentLine = data.translatedLines[i];
    let nextLine = (i + 1 < data.translatedLines.length) ? data.translatedLines[i+1] : null;

    if (currentLine.T0 === "ギリギリダンスギリギリダンス(もっと" && 
        nextLine && 
        nextLine.T0 === "鳴らせ)") {
      
      // T0를 합칩니다.
      currentLine.T0 = "ギリギリダンスギリギリダンス(もっと鳴らせ)";
      
      // K0를 합칩니다: "아슬아슬 댄스 아슬아슬 댄스(더" + " " + "울려)" 
      // 결과: "아슬아슬 댄스 아슬아슬 댄스(더 울려)"
      if (typeof currentLine.K0 === 'string' && typeof nextLine.K0 === 'string') {
        currentLine.K0 = currentLine.K0 + " " + nextLine.K0;
      } else {
        // K0 값이 예상과 다를 경우를 대비한 로깅 (실제 운영에서는 더 견고한 에러 처리 필요)
        console.warn(`주의: K0 합치기 중 예상치 못한 값 발견. T0: ${currentLine.T0}`);
        // 기본값으로 설정하거나, 에러를 발생시킬 수도 있습니다.
        // 여기서는 일단 기존 currentLine.K0을 유지하거나, 합치기를 시도합니다.
        currentLine.K0 = (currentLine.K0 || "") + " " + (nextLine.K0 || "");
      }
      
      // C0, G0, I0, R0, LI 등의 다른 필드는 currentLine의 것을 그대로 사용합니다.
      // nextLine의 해당 정보는 사용되지 않고 버려집니다.
      // LI의 경우, 합쳐진 T0에 맞게 형태소 재분석이 이상적이나, 현재 스코프에서는 currentLine의 LI를 유지합니다.
      
      newTranslatedLines.push(currentLine);
      mergedPairsCount++;
      i += 2; // 두 라인을 처리했으므로 인덱스를 2 증가시킵니다.
    } else {
      newTranslatedLines.push(currentLine);
      i += 1;
    }
  }

  data.translatedLines = newTranslatedLines;

  if (mergedPairsCount > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`파일 수정 완료: ${filePath} (${mergedPairsCount}개 쌍의 라인이 합쳐졌습니다. 총 라인 수 변경: ${originalTotalLines} -> ${data.translatedLines.length})`);
  } else {
    console.log("지정된 패턴의 분할된 라인을 찾지 못했습니다. 변경된 항목이 없습니다.");
  }

} catch (error) {
  console.error('스크립트 실행 중 오류 발생:', error);
} 