const fs = require('fs');
const path = require('path');

const targetFile = 'deep2_super_idol.json';
const filePath = path.join(__dirname, '..', 'songs', targetFile);

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;
  let r0Updated = false;
  let r1Updated = false;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.T0 === "喝一口又活力全开") {
        // Update R0
        if (line.R0 === "허 이 커우 요우 후어리 취엔 카이") {
          line.R0 = "허 이 커우 요우 후어리 취앤 카이";
          changesMade++;
          r0Updated = true;
          console.log(`Updated R0 for T0="${line.T0}" from "허 이 커우 요우 후어리 취엔 카이" to "허 이 커우 요우 후어리 취앤 카이"`);
        } else if (line.R0 === "허 이 커우 요우 후어리 취앤 카이") {
          console.log(`R0 for T0="${line.T0}" is already "허 이 커우 요우 후어리 취앤 카이". No change needed.`);
        } else {
          console.log(`Unexpected R0 value "${line.R0}" for T0="${line.T0}". Expected "허 이 커우 요우 후어리 취엔 카이" or "허 이 커우 요우 후어리 취앤 카이".`);
        }

        if (line.LI && Array.isArray(line.LI)) {
          line.LI.forEach(item => {
            if (item.T1 === "全开") {
              // Update R1
              if (item.R1 === "취안카이") {
                item.R1 = "취앤카이";
                changesMade++;
                r1Updated = true;
                console.log(`Updated R1 for T1="全开" in T0="${line.T0}" from "취안카이" to "취앤카이"`);
              } else if (item.R1 === "취앤카이") {
                console.log(`R1 for T1="全开" in T0="${line.T0}" is already "취앤카이". No change needed.`);
              } else {
                console.log(`Unexpected R1 value "${item.R1}" for T1="全开" in T0="${line.T0}". Expected "취안카이" or "취앤카이".`);
              }
              // XR for "全开" is already "화 얼 취앤 카이 러", which uses "취앤". No change needed for XR based on current data.
              // R2 for "全开" is already "취앤 카이", which uses "취앤". No change needed for R2 based on current data.
            }
          });
        }
      }
    });
  }

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\nSuccessfully updated ${filePath} with ${changesMade} change(s).`);
  } else {
    let noChangeMessage = "\nNo changes made to the file.";
    if (!r0Updated) {
      noChangeMessage += ` R0 for T0="喝一口又活力全开" was not "허 이 커우 요우 후어리 취엔 카이" or already "허 이 커우 요우 후어리 취앤 카이".`;
    }
    if (!r1Updated) {
      noChangeMessage += ` R1 for T1="全开" in T0="喝一口又活力全开" was not "취안카이" or already "취앤카이".`;
    }
    console.log(noChangeMessage);
  }

} catch (error) {
  console.error(`Error processing file ${targetFile}:`, error);
} 