const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep2_like_addicted_poison.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;
  let accumulatedLogs = [];

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach((line, index) => {
      let itemChanged = false; // 각 라인(translatedLines의 아이템)별 변경 여부
      let logMessages = [];
      const lineNum = index + 1; // 1-based line number for logging

      // Line 3 수정 (R0)
      if (lineNum === 3 && line.R0 === "팡비엔 스 쉬이 쩐머 워 메이 칸궈 타 더 리엔") {
        const oldR0 = line.R0;
        line.R0 = "팡비엔 스 쉐이 쩐머 워 메이 칸궈 타 더 리엔";
        logMessages.push(`R0 '스 쉬이' -> '스 쉐이'. Old: "${oldR0}", New: "${line.R0}"`);
        itemChanged = true;
      }

      // Line 12 수정 (I0)
      if (lineNum === 12 && line.I0 === "fa1 xian4 wo3 xu1 yao4 ni3 so ðɛr z noʊ ˈmʌndeɪ bluː") {
        const oldI0 = line.I0;
        line.I0 = "fāxiàn wǒ xūyào nǐ so ðɛr z noʊ ˈmʌndeɪ bluː"; // 영어 부분은 그대로 유지
        logMessages.push(`I0 숫자 성조 -> 병음 부호. Old: "${oldI0}", New: "${line.I0}"`);
        itemChanged = true;
      }

      // Line 13 수정 (I0 및 R0)
      if (lineNum === 13) {
        const originalI0_13 = line.I0;
        const originalR0_13 = line.R0;
        let i0changed_13 = false;

        const expectedOldI0_13 = "aɪ gɒt lɒts əv wɜːk dɛŋ ʐə ʈʂʰɯ tɕʰy man man wan ʈʂʰɤŋ";
        const engPartI0_13 = "aɪ gɒt lɒts əv wɜːk ";
        const targetChineseI0_13 = "děngzhe wǒ qù mànmàn wánchéng";
        
        if (line.I0 === expectedOldI0_13) {
            line.I0 = engPartI0_13 + targetChineseI0_13;
            logMessages.push(`I0 중국어 부분 표준 병음으로 수정. Old: "${originalI0_13}", New: "${line.I0}"`);
            itemChanged = true;
            i0changed_13 = true;
        }
        
        const expectedOldR0_13 = "아이 갯 롯츠 오브 워크 덩 저 츠 취 만 완 완 청";
        const targetR0_13 = "아이 갯 롯츠 오브 워크 덩저 워 취 만만 완청";
        if (line.R0 === expectedOldR0_13 || i0changed_13) { // I0가 바뀌었거나, R0가 이전 값과 일치하면 R0도 수정
            if(line.R0 !== targetR0_13){
              line.R0 = targetR0_13;
              logMessages.push(`R0 발음 수정. Old: "${originalR0_13}", New: "${line.R0}"`);
              itemChanged = true; // 이미 위에서 true가 될 수 있지만, 명시적으로
            }
        }
      }
      
      // Line 14 수정 (R0)
      if (lineNum === 14 && line.R0 === "벗 더 브레인 저스트 파트 주어 완 나 루 커우 더 홍 덩") {
        const oldR0 = line.R0;
        line.R0 = "밧 더 브레인 저스트 파트 주어 완 나 루 커우 더 홍 덩";
        logMessages.push(`R0 '벗' -> '밧'. Old: "${oldR0}", New: "${line.R0}"`);
        itemChanged = true;
      }

      if (itemChanged) {
        changesMade++; // 수정된 translatedLines 아이템 수
        accumulatedLogs.push(`Changes for Line ${lineNum} (T0: ${line.T0}):`);
        logMessages.forEach(msg => accumulatedLogs.push(`  - ${msg}`));
      }
    });
  }

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    accumulatedLogs.forEach(log => console.log(log));
    console.log(`\nSuccessfully updated ${filePath} with ${changesMade} line pronunciation corrections.`);
  } else {
    console.log(`\nNo line pronunciation corrections made based on the implemented script logic in ${filePath}.`);
  }

} catch (error) {
  console.error('Error processing the file:', error);
} 