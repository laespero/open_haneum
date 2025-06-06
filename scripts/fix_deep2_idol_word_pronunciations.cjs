const fs = require('fs');
const path = require('path');

const targetFile = 'deep2_super_idol.json';
const filePath = path.join(__dirname, '..', 'songs', targetFile);

const corrections = [
  { T0: "痛快的热爱", T1: "热爱", oldI1: "rè'ài", newR1: "르어아이" },
  { T0: "痛快去热爱", T1: "热爱", oldI1: "rè'ài", newR1: "르어아이" },
  { T0: "属于我的时代", T1: "属于", oldI1: "shǔyú", newR1: "수위" },
  { T0: "都没你的甜", T1: "甜", oldI1: "tián", newR1: "티엔" },
  { T0: "热爱105℃的你", T1: "热爱", oldI1: "rè ài", newI1: "rè'ài", newR1: "르어아이" },
  { T0: "热爱105℃的你", T1: "105℃", oldI1: "yī líng wǔ dù", newI1: "yībǎi líng wǔ dù", newR1: "이 바이 링 우 두" },
  { T0: "滴滴清纯的蒸馏水", T1: "蒸馏水", oldI1: "zhēngliúshuǐ", newR1: "정리우슈이" },
  { T0: "喝一口又活力全开", T1: "活力", oldI1: "huólì", newR1: "후어리" },
  { T0: "喝一口又活力全开", T1: "全开", oldI1: "quán kāi", newI1: "quánkāi", newR1: "취안카이" },
  { T0: "你不知道你有多可爱", T1: "多", oldI1: "duō", newR1: "뚜오" },
  { T0: "很安心 当你对我说", T1: "说", oldI1: "shuō", newR1: "슈어" },
  { T0: "Super Idol的笑容", T1: "笑容", oldI1: "xiàoróng", newR1: "샤오롱" },
  { T0: "对梦想的执着一直不曾更改", T1: "对", oldI1: "duì", newR1: "두이" },
  { T0: "对梦想的执着一直不曾更改", T1: "执着", oldI1: "zhízhuó", newR1: "즈주어" },
  { T0: "对梦想的执着一直不曾更改", T1: "不曾", oldI1: "bùcéng", newR1: "부청" },
  { T0: "跌倒后会傻笑着再站起来", T1: "傻笑", oldI1: "shǎ xiào", newI1: "shǎxiào", newR1: "샤샤오" }
];

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;
  let logOutput = [];

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          const correction = corrections.find(c => c.T0 === line.T0 && c.T1 === item.T1 && (c.oldI1 ? c.oldI1 === item.I1 : true));
          if (correction) {
            let itemChanged = false;
            let currentLog = [`Found match for T0: "${line.T0}", T1: "${item.T1}"`];
            if (correction.newI1 !== undefined && item.I1 !== correction.newI1) {
              currentLog.push(`  Updating I1: from "${item.I1}" to "${correction.newI1}"`);
              item.I1 = correction.newI1;
              itemChanged = true;
            }
            if (correction.newR1 !== undefined && item.R1 !== correction.newR1) {
              currentLog.push(`  Updating R1: from "${item.R1}" to "${correction.newR1}"`);
              item.R1 = correction.newR1;
              itemChanged = true;
            }

            if (itemChanged) {
              logOutput.push(...currentLog);
              changesMade++;
            } else {
              // logOutput.push(`No change needed for T0: "${line.T0}", T1: "${item.T1}". Values are already correct.`);
            }
          }
        });
      }
    });
  }

  console.log("--- T1/I1/R1 Correction Log (deep2_super_idol.json) ---");
  if (logOutput.length > 0) {
    logOutput.forEach(log => console.log(log));
  } else {
    console.log("No matching entries found for correction or no changes needed.");
  }

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\nSuccessfully applied ${changesMade} correction(s) to ${filePath}.`);
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