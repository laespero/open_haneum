const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep2_like_addicted_poison.json');

// 숫자 성조를 병음 부호로 변환하는 간단한 함수 (완벽하지 않을 수 있음)
function convertNumberPinyinToMark(pinyin) {
  if (!pinyin || !/\d$/.test(pinyin)) return pinyin; // 숫자로 끝나지 않으면 변환 안 함

  const toneMap = {
    a: ['ā', 'á', 'ǎ', 'à', 'a'],
    e: ['ē', 'é', 'ě', 'è', 'e'],
    i: ['ī', 'í', 'ǐ', 'ì', 'i'],
    o: ['ō', 'ó', 'ǒ', 'ò', 'o'],
    u: ['ū', 'ú', 'ǔ', 'ù', 'u'],
    ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü'],
    A: ['Ā', 'Á', 'Ǎ', 'À', 'A'],
    E: ['Ē', 'É', 'Ě', 'È', 'E'],
    I: ['Ī', 'Í', 'Ĭ', 'Ì', 'I'],
    O: ['Ō', 'Ó', 'Ǒ', 'Ò', 'O'],
    U: ['Ū', 'Ú', 'Ǔ', 'Ù', 'U'],
    Ü: ['Ǖ', 'Ǘ', 'Ǚ', 'Ǜ', 'Ü']
  };

  let syllable = pinyin.slice(0, -1);
  const toneNumber = parseInt(pinyin.slice(-1)) - 1;

  if (toneNumber < 0 || toneNumber > 4) return pinyin; // 1-5성만 처리

  // 모음 우선순위에 따라 성조 부호 적용 (간단화된 로직)
  // a, o, e 순으로 우선권
  let foundVowel = false;
  for (let char of ['a', 'A']) {
    if (syllable.includes(char)) {
      syllable = syllable.replace(char, toneMap[char][toneNumber]);
      foundVowel = true;
      break;
    }
  }
  if (foundVowel) return syllable;

  for (let char of ['o', 'O', 'e', 'E']) {
    if (syllable.includes(char)) {
      syllable = syllable.replace(char, toneMap[char][toneNumber]);
      foundVowel = true;
      break;
    }
  }
  if (foundVowel) return syllable;

  // i, u, ü (iu, ui 와 같은 복모음의 경우 마지막 모음에 표기)
  if (syllable.endsWith('iu')) {
    syllable = syllable.replace('u', toneMap['u'][toneNumber]);
    return syllable;
  }
  if (syllable.endsWith('ui')) {
    syllable = syllable.replace('i', toneMap['i'][toneNumber]);
    return syllable;
  }
  
  // 나머지 단일 모음 i, u, ü
  // ü가 포함된 경우 ü에 우선적으로 표기
  if (syllable.includes('ü')) {
    syllable = syllable.replace('ü', toneMap['ü'][toneNumber]);
    return syllable;
  }
  if (syllable.includes('Ü')) {
    syllable = syllable.replace('Ü', toneMap['Ü'][toneNumber]);
    return syllable;
  }
  // 그 다음 u
   if (syllable.includes('u')) {
    syllable = syllable.replace('u', toneMap['u'][toneNumber]);
    return syllable;
  }
  if (syllable.includes('U')) {
    syllable = syllable.replace('U', toneMap['U'][toneNumber]);
    return syllable;
  }
  // 마지막 i
  if (syllable.includes('i')) {
    syllable = syllable.replace('i', toneMap['i'][toneNumber]);
    return syllable;
  }
   if (syllable.includes('I')) {
    syllable = syllable.replace('I', toneMap['I'][toneNumber]);
    return syllable;
  }

  return pinyin; // 변환 규칙에 안 맞으면 원본 반환
}


try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;
  let accumulatedLogs = [];

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach((line, lineIndexL) => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach((item, itemIndexL) => {
          let itemChanged = false;
          let logMessages = [];
          let currentT1 = item.T1 || item.T2 || '';

          // 1. 데이터 불일치 해결
          if (line.T0 === "目光都变炙热 一切都停滞了" && (item.T1 === "炙热" || item.T2 === "炙热")) {
            if (item.XE === "他的目光中充满了炙热的感情。" && item.XR === "시아티엔 더 양광 휀 즈르") {
              const oldXR = item.XR;
              const oldXI = item.XI;
              item.XI = "tā de mùguāng zhōng chōngmǎn le zhìrè de gǎnqíng";
              item.XR = "타 더 무광 중 충만 러 즈러 더 간칭";
              logMessages.push(`Data mismatch fixed. Old XR:"${oldXR}", New XR:"${item.XR}". Old XI:"${oldXI}", New XI:"${item.XI}"`);
              itemChanged = true;
            }
          }

          // 2. zh 발음 "젤리" -> "저리"
          if (item.XI && item.XI.startsWith("zhèlǐ") && item.XR && item.XR.startsWith("젤리")) {
            const oldXR = item.XR;
            item.XR = item.XR.replace("젤리", "저리");
            logMessages.push(`Corrected 'zhè' pronunciation: "${oldXR}" -> "${item.XR}"`);
            itemChanged = true;
          }

          // 3. shuí 발음 "쉬이" -> "쉐이"
          if (item.XI && item.XI.includes("shuí") && item.XR && item.XR.includes("스 쉬이")) {
            const oldXR = item.XR;
            item.XR = item.XR.replace("스 쉬이", "스 쉐이");
            logMessages.push(`Corrected 'shuí' pronunciation: "${oldXR}" -> "${item.XR}"`);
            itemChanged = true;
          }
          
          // 4. xue 발음 "쉐에" 등 -> "쉬에"
          const originalXRxue = item.XR;
          let xueCorrected = false;
          if (item.XR && item.XR.includes("쉐에")) {
             item.XR = item.XR.replace(/쉐에/g, "쉬에");
             xueCorrected = true;
          }
          if (item.XR && item.XR.includes("쉐 솅")) { // "쉐 솅" -> "쉬에셩"
             item.XR = item.XR.replace(/쉐 솅/g, "쉬에셩");
             xueCorrected = true;
          }
          if (item.XR && item.XR.includes("쉐셩") && !item.XR.includes("쉬에셩")) { // "쉐셩" -> "쉬에셩"
             item.XR = item.XR.replace(/쉐셩/g, "쉬에셩");
             xueCorrected = true;
          }
          if (xueCorrected) {
            logMessages.push(`Corrected 'xue' pronunciation: "${originalXRxue}" -> "${item.XR}"`);
            itemChanged = true;
          }

          // 5. zuò 발음 "쪄 " -> "쭤 "
          if (item.XR && item.XR.includes("쪄 ")) { //공백 포함하여 정확히 타겟팅
            const oldXR = item.XR;
            item.XR = item.XR.replace(/쪄 /g, "쭤 ");
            logMessages.push(`Corrected 'zuò' pronunciation: "${oldXR}" -> "${item.XR}"`);
            itemChanged = true;
          }
          
          // 6. XI 필드 숫자 성조 -> 병음 부호 (간단한 시도)
          if (item.XI && /[a-zA-ZüÜ]+[1-5]$/.test(item.XI.split(' ').pop() || "")) { 
            const originalXI = item.XI;
            const xiWords = item.XI.split(' ');
            const convertedXiWords = xiWords.map(word => convertNumberPinyinToMark(word));
            const newXI = convertedXiWords.join(' ');
            if (item.XI !== newXI) {
              item.XI = newXI;
              logMessages.push(`Converted XI to mark pinyin: "${originalXI}" -> "${item.XI}"`);
              itemChanged = true;
            }
          }

          if (itemChanged) {
            changesMade++;
            accumulatedLogs.push(`Changes for Line ${lineIndexL + 1}, Item ${itemIndexL + 1} (T0: ${line.T0} / T1: ${currentT1}):`);
            logMessages.forEach(msg => accumulatedLogs.push(`  - ${msg}`));
          }
        });
      }
    });
  }

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    accumulatedLogs.forEach(log => console.log(log));
    console.log(`\nSuccessfully updated ${filePath} with ${changesMade} accumulated corrections.`);
  } else {
    console.log(`\nNo corrections made based on the implemented script logic in ${filePath}.`);
  }

} catch (error) {
  console.error('Error processing the file:', error);
} 