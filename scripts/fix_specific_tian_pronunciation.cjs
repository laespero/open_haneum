const fs = require('fs');
const path = require('path');

const targetFile = 'deep2_super_idol.json';
const filePath = path.join(__dirname, '..', 'songs', targetFile);

const corrections = [
  {
    T0: "都没你的甜",
    T1: "甜",
    // oldI1: "tián", // I1은 변경되지 않으므로, R1 값만으로도 타겟팅 가능 (필요시 oldR1: "티앤" 추가)
    newR1: "티엔"
  }
];

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;
  let logOutput = [];

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.T0 === "都没你的甜" && line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          if (item.T1 === "甜") {
            const correction = corrections.find(c => c.T0 === line.T0 && c.T1 === item.T1);
            if (correction) {
              if (item.R1 !== correction.newR1) {
                logOutput.push(`Updating R1 for T0: "${line.T0}", T1: "${item.T1}" (I1: "${item.I1}")`);
                logOutput.push(`  Old R1: "${item.R1}"`);
                item.R1 = correction.newR1;
                logOutput.push(`  New R1: "${item.R1}"`);
                changesMade++;
              } else {
                logOutput.push(`No change needed for T0: "${line.T0}", T1: "${item.T1}". R1 is already "${correction.newR1}".`);
              }
            }
          }
        });
      }
    });
  }

  console.log("--- Specific R1 Correction Log (deep2_super_idol.json) ---");
  if (logOutput.length > 0) {
    logOutput.forEach(log => console.log(log));
  } else {
    console.log("No matching entry found for correction or no changes needed.");
  }

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\nSuccessfully updated ${filePath} with ${changesMade} change(s).`);
  } else {
    console.log('\nNo changes made to the file.');
  }

} catch (error) {
  if (error.code === 'ENOENT') {
    console.error(`Error: File not found at ${filePath}`);
  } else {
    console.error(`Error processing file ${targetFile}:`, error.message);
  }
} 