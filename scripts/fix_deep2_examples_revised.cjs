const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep2_like_addicted_poison.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          // T0: "目光都变炙热 一切都停滞了" / T1: "炙热"
          // 현재 XE: "夏天的阳光很炙热。"
          // 수정 목표 XE: "他的目光中充满了炙热的感情。"
          if (item.T1 === "炙热" && typeof line.T0 === 'string' && line.T0.includes("目光都变炙热")) {
            if (item.XE === "夏天的阳光很炙热。") { // "太阳"을 "阳光"으로 수정
                item.XE = "他的目光中充满了炙热的感情。";
                item.XK = "그의 시선에는 뜨거운 감정이 가득했다.";
                changesMade++;
                console.log(`Updated XE/XK for T1: "${item.T1}" (炙热) in T0: "${line.T0}" to be more context-aware. Old XE: "夏天的阳光很炙热。"`);
            }
          }

          // T0: "梦到与你一起走在沙滩上的温柔" / T1: "温柔"
          // 현재 XE: "她的声音很温柔。" - 이 예문은 이미 적절하므로 추가 수정 없음.
          // 스크립트의 이전 버전에서는 "他是一个温柔的人。"을 찾으려고 했었음.
          if (item.T1 === "温柔" && typeof line.T0 === 'string' && line.T0.includes("沙滩上的温柔")) {
            if (item.XE === "他是一个温柔的人。") { // 이 조건은 현재 파일 내용과 맞지 않음
                item.XE = "她的声音很温柔。";
                item.XK = "그녀의 목소리는 매우 부드럽다.";
                changesMade++;
                console.log(`Updated XE/XK for T1: "${item.T1}" (温柔) in T0: "${line.T0}" to "她的声音很温柔。"`);
            }
          }
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Successfully updated ${filePath} with ${changesMade} changes regarding XE/XK examples based on guidelines.`);
    } else {
      console.log(`No specific XE/XK changes were made based on the implemented script logic for ${filePath}. (Revised script)`);
    }
  } else {
    console.error(`Error: Could not find translatedLines array or data structure is not as expected in ${filePath}.`);
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 