const fs = require('fs');
const path = require('path');

const targetFile = 'deep2_super_idol.json';
const filePath = path.join(__dirname, '..', 'songs', targetFile);

let examples = [];

try {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach((line, lineIndex) => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach((item, itemIndex) => {
          if (item.XE) { // XE 필드가 있는 경우에만
            examples.push({
              fileName: targetFile,
              T0: line.T0, // 어떤 가사 라인인지 식별
              T1: item.T1, // 어떤 단어/구문의 예문인지 식별
              XE: item.XE,
              XI: item.XI || '[XI 없음]', // XI 필드가 없을 경우 대비
              XR: item.XR || '[XR 없음]', // XR 필드가 없을 경우 대비
            });
          }
        });
      }
    });
  }

  if (examples.length > 0) {
    console.log(`--- Examples (XE, XI, XR) from ${targetFile} ---`);
    examples.forEach(ex => {
      console.log(`\nFile: ${ex.fileName}`);
      console.log(`T0  : ${ex.T0}`);
      console.log(`T1  : ${ex.T1}`);
      console.log(`XE  : ${ex.XE}`);
      console.log(`XI  : ${ex.XI}`);
      console.log(`XR  : ${ex.XR}`);
    });
    console.log(`\n--- Found ${examples.length} example(s) in ${targetFile}. ---`);
  } else {
    console.log(`No examples (XE) found in ${targetFile}.`);
  }

} catch (error) {
  if (error.code === 'ENOENT') {
    console.error(`Error: File not found at ${filePath}`);
  } else {
    console.error(`Error processing file ${targetFile}:`, error.message);
  }
} 