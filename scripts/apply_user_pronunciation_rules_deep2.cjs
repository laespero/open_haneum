const fs = require('fs');
const path = require('path');

// --- messages.js 규칙 파싱 로직 (시작) ---
function removeToneMarks(pinyin) {
  if (!pinyin) return '';
  return pinyin.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function parseChineseRules() {
  const messagesFilePath = path.join(__dirname, '..', 'messages.js');
  const rulesContent = fs.readFileSync(messagesFilePath, 'utf-8');
  const chineseSpecialSection = rulesContent.match(/const ChineseSpecial = `([^`]*)`;/s);
  if (!chineseSpecialSection || !chineseSpecialSection[1]) {
    throw new Error("Could not find ChineseSpecial section in messages.js");
  }
  const rulesText = chineseSpecialSection[1];

  const pinyinToHangulTable = {};     // For full syllable mappings from CSV examples (e.g., bā -> 바)
  const basePinyinToHangul = {};      // For base pinyin components (e.g., b -> ㅂ, a -> 아)
  const specificPinyinRules = {};     // For "When you transcribe..." rules (e.g., duo -> 두어)
  // specificWordRules는 현재 R0 변환 로직에서 직접 사용하기 어려워 일단 파싱만 해둠
  const specificWordRules = {};

  const lines = rulesText.split('\n');
  let isTableSection = false;

  for (const line of lines) {
    if (line.includes('[한어 병음/한글 대응표]')) {
      isTableSection = true;
      continue;
    }
    if (isTableSection && line.startsWith('group,pinyin,zhuyin,hangul')) continue; // CSV Header

    if (isTableSection && line.includes(',')) {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 4) {
        const basePinyin = parts[1].includes('[') ? parts[1].substring(0, parts[1].indexOf('[')).trim() : parts[1];
        const baseHangul = parts[3].includes('[') ? parts[3].substring(0, parts[3].indexOf('[')).trim() : parts[3];
        if (basePinyin && baseHangul) {
          basePinyinToHangul[basePinyin] = baseHangul;
        }

        // 예시 열에서 전체 음절 매핑 추출 (최대 3개의 예시 처리)
        for (let i = 4; i < parts.length && i + 1 < parts.length; i += 2) {
          const examplePinyin = parts[i];
          const exampleHangul = parts[i+1];
          if (examplePinyin && exampleHangul) {
            // 성조 포함된 키와 성조 없는 키 모두 저장 (특정 규칙과의 일관성 위해)
            pinyinToHangulTable[examplePinyin] = exampleHangul;
            // pinyinToHangulTable[removeToneMarks(examplePinyin)] = exampleHangul; // 필요시 활성화
          }
        }
      }
    }

    const specificRuleMatch = line.match(/^When you transcribe '(.+?)'(?:\(.+?\))?, always write it as '(.+?)'\./);
    if (specificRuleMatch) {
      const pinyinKeyRaw = specificRuleMatch[1];
      const hangulValue = specificRuleMatch[2];
      
      if (pinyinKeyRaw.includes('(')) { // 예: 是(shì)
        const word = pinyinKeyRaw.substring(0, pinyinKeyRaw.indexOf('('));
        const pinyinInWord = pinyinKeyRaw.substring(pinyinKeyRaw.indexOf('(') + 1, pinyinKeyRaw.indexOf(')'));
        specificWordRules[word] = { pinyin: pinyinInWord, hangul: hangulValue };
        // 병음 자체(성조 제거)에 대한 규칙도 specificPinyinRules에 추가
        specificPinyinRules[removeToneMarks(pinyinInWord)] = hangulValue;
        specificPinyinRules[pinyinInWord] = hangulValue; // 성조 있는 버전도 추가
      } else if (pinyinKeyRaw.includes('/')) { // 예: duō/duǒ/duó/duò
        const pinyins = pinyinKeyRaw.split('/');
        pinyins.forEach(p => {
          const trimmedP = p.trim();
          specificPinyinRules[removeToneMarks(trimmedP)] = hangulValue;
          specificPinyinRules[trimmedP] = hangulValue; // 성조 있는 버전도 추가
        });
      } else {
        const trimmedPKey = pinyinKeyRaw.trim();
        specificPinyinRules[removeToneMarks(trimmedPKey)] = hangulValue;
        specificPinyinRules[trimmedPKey] = hangulValue; // 성조 있는 버전도 추가
      }
    }
  }
  return { pinyinToHangulTable, basePinyinToHangul, specificWordRules, specificPinyinRules };
}

const { pinyinToHangulTable, basePinyinToHangul, specificWordRules, specificPinyinRules } = parseChineseRules();

function convertPinyinToHangul(pinyinWord) {
  if (!pinyinWord) return '';
  const pinyinWordLower = pinyinWord.toLowerCase(); // I0은 이미 소문자화해서 넘어올 것으로 예상되나 안전장치
  const pinyinWordToneless = removeToneMarks(pinyinWordLower);

  // 1. specificPinyinRules (성조 없는 키 우선, 그 다음 성조 있는 키)
  if (specificPinyinRules.hasOwnProperty(pinyinWordToneless)) {
    return specificPinyinRules[pinyinWordToneless];
  }
  if (specificPinyinRules.hasOwnProperty(pinyinWordLower)) {
    return specificPinyinRules[pinyinWordLower];
  }

  // 2. pinyinToHangulTable (CSV 예시에서 추출된 전체 음절 매핑, 성조 있는 키 우선)
  if (pinyinToHangulTable.hasOwnProperty(pinyinWordLower)) {
    return pinyinToHangulTable[pinyinWordLower];
  }
  if (pinyinToHangulTable.hasOwnProperty(pinyinWordToneless)) {
    return pinyinToHangulTable[pinyinWordToneless];
  }
  
  // 3. 분해 및 조합 (매우 단순화된 버전 - 개선 필요)
  // 현재 basePinyinToHangul은 사용하지 않고, 매칭 실패 시 원본 반환
  // TODO: 여기에 성모/운모 분리 및 basePinyinToHangul 기반 조합 로직 추가 필요

  return pinyinWord; // 규칙 못 찾으면 원본 반환 (지난번처럼 깨지지 않도록)
}
// --- messages.js 규칙 파싱 로직 (끝) ---

const targetFilePath = path.join(__dirname, '..', 'songs', 'deep2_super_idol.json');

try {
  let rawData = fs.readFileSync(targetFilePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;
  let conversionLog = [];

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (!line.I0) {
        conversionLog.push(`Skipping T0: "${line.T0}" - Missing I0 (Pinyin)`);
        return;
      }

      const originalPinyinLine = line.I0.trim();
      const pinyinWords = originalPinyinLine.toLowerCase().split(/\s+/);
      let newR0Parts = [];

      for (const pinyinWord of pinyinWords) {
        if (!pinyinWord) continue;
        const convertedWord = convertPinyinToHangul(pinyinWord);
        newR0Parts.push(convertedWord);
      }
      
      const newR0 = newR0Parts.join(' ');

      if (line.R0 !== newR0) {
        conversionLog.push(`T0: "${line.T0}"`);
        conversionLog.push(`  I0: "${line.I0}" (Processed as: ${pinyinWords.join(' ')})`);
        conversionLog.push(`  Old R0: "${line.R0}"`);
        conversionLog.push(`  New R0: "${newR0}"`);
        line.R0 = newR0;
        changesMade++;
      }
    });
  }

  console.log("--- Conversion Log ---");
  conversionLog.forEach(log => console.log(log));

  if (changesMade > 0) {
    fs.writeFileSync(targetFilePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\nSuccessfully updated ${targetFilePath} with ${changesMade} change(s).`);
  } else {
    console.log('\nNo changes made to R0 values based on the new rules, or I0 fields were missing.');
  }

} catch (error) {
  console.error('Error processing the file:', error);
  console.error('Specific Pinyin Rules loaded:', Object.keys(specificPinyinRules).length);
  console.error('Pinyin to Hangul Table (from examples) loaded:', Object.keys(pinyinToHangulTable).length);
  // console.error('Base Pinyin to Hangul loaded:', Object.keys(basePinyinToHangul).length);
} 