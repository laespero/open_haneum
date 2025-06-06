const fs = require('fs');
const filePath = 'songs/deep_yes_gladly.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let splitLinesCount = 0;

  const originalTotalLines = data.translatedLines.length;
  const newTranslatedLines = [];
  
  for (let i = 0; i < data.translatedLines.length; i++) {
    let currentLine = data.translatedLines[i];

    if (currentLine.T0 === "ギリギリダンスギリギリダンス(もっと鳴らせ)" && 
        currentLine.K0 === "아슬아슬 댄스 아슬아슬 댄스(더 울려)") {
      
      // 첫 번째 라인 생성
      const line1 = {
        ...currentLine, // C0, G0, I0, R0, LI 등은 기존 값 사용
        T0: "ギリギリダンスギリギリダンス(もっと",
        K0: "아슬아슬 댄스 아슬아슬 댄스(더"
      };
      // LI 필드는 원본 T0에 해당하는 분석 결과이므로 그대로 사용합니다.

      // 두 번째 라인 생성 (보조 필드는 초기화)
      const line2 = {
        T0: "鳴らせ)",
        K0: "울려)",
        C0: "", // 이전 병합에서 손실되어 빈 값으로 초기화
        G0: "", // 이전 병합에서 손실되어 빈 값으로 초기화
        I0: "", // 이전 병합에서 손실되어 빈 값으로 초기화
        R0: "", // 이전 병합에서 손실되어 빈 값으로 초기화
        LI: []  // 이전 병합에서 손실되어 빈 배열로 초기화
      };
      
      newTranslatedLines.push(line1);
      newTranslatedLines.push(line2);
      splitLinesCount++;
    } else {
      newTranslatedLines.push(currentLine);
    }
  }

  data.translatedLines = newTranslatedLines;

  if (splitLinesCount > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`파일 수정 완료: ${filePath} (${splitLinesCount}개 라인이 2개로 분리되었습니다. 총 라인 수 변경: ${originalTotalLines} -> ${data.translatedLines.length})`);
    console.log("참고: 분리된 두 번째 라인(\"鳴らせ)\")의 C0, G0, I0, R0, LI 필드는 이전 병합 과정에서 정보가 유실되어 초기화되었습니다.");
  } else {
    console.log("지정된 패턴의 합쳐진 라인을 찾지 못했습니다. 변경된 항목이 없습니다.");
  }

} catch (error) {
  console.error('스크립트 실행 중 오류 발생:', error);
} 