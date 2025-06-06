const fs = require('fs');
const path = require('path');

const targetFile = 'deep2_super_idol.json';
const filePath = path.join(__dirname, '..', 'songs', targetFile);

let wordPronunciations = [];

try {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach((line, lineIndex) => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach((item, itemIndex) => {
          // T1 필드는 항상 존재한다고 가정 (LI 항목의 핵심이므로)
          // I1, R1은 없을 수도 있음
          wordPronunciations.push({
            fileName: targetFile,
            T0: line.T0, // 어떤 가사 라인에 속한 단어인지 식별
            T1: item.T1,
            I1: item.I1 || '[I1 없음]', // I1 필드가 없을 경우 대비
            R1: item.R1 || '[R1 없음]', // R1 필드가 없을 경우 대비
          });
        });
      }
    });
  }

  if (wordPronunciations.length > 0) {
    console.log(`--- Word Pronunciations (T1, I1, R1) from ${targetFile} ---`);
    wordPronunciations.forEach(wp => {
      console.log(`\nFile: ${wp.fileName}`);
      console.log(`T0  : ${wp.T0}`);
      console.log(`T1  : ${wp.T1}`);
      console.log(`I1  : ${wp.I1}`);
      console.log(`R1  : ${wp.R1}`);
    });
    console.log(`\n--- Found ${wordPronunciations.length} word pronunciation pair(s) in ${targetFile}. ---`);
  } else {
    console.log(`No LI items (and thus no T1) found in ${targetFile}.`);
  }

} catch (error) {
  if (error.code === 'ENOENT') {
    console.error(`Error: File not found at ${filePath}`);
  } else {
    console.error(`Error processing file ${targetFile}:`, error.message);
  }
} 