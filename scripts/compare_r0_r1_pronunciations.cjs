const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');

try {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);
  let mismatchesFound = 0;

  if (data && Array.isArray(data.translatedLines)) {
    console.log(`Comparing R0 and joined R1 values from ${path.basename(filePath)}:\n`);
    data.translatedLines.forEach((line, lineIndex) => {
      const r0_value = line.R0 ? String(line.R0).trim() : '';
      let joined_r1_values = '';

      if (line.LI && Array.isArray(line.LI)) {
        joined_r1_values = line.LI
          .map(item => item.R1 ? String(item.R1).trim() : '')
          .filter(r1 => r1) // 빈 문자열 제거
          .join(' ');
      }

      // R0나 joined_r1_values 둘 중 하나라도 내용이 있을 때만 비교 (둘 다 비어있으면 불일치로 보지 않음)
      if ((r0_value || joined_r1_values) && r0_value !== joined_r1_values) {
        if (mismatchesFound === 0) {
          console.log("Found mismatches:\n");
        }
        mismatchesFound++;
        console.log(`--- Mismatch #${mismatchesFound} (Line ${lineIndex + 1}) ---`);
        console.log(`  T0: ${line.T0}`);
        console.log(`  R0: "${r0_value}"`);
        console.log(`  R1s: "${joined_r1_values}"\n`);
      }
    });

    if (mismatchesFound > 0) {
      console.log(`\nTotal mismatches found: ${mismatchesFound}`);
    } else {
      console.log('No mismatches found between R0 and joined R1 values.');
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error(`Error processing the file ${filePath}:`, error);
} 