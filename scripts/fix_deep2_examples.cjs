const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep2_like_addicted_poison.json'); // 스크립트 위치 기준으로 상대 경로 수정

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => { // 각 가사 라인 (T0) 순회
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => { // 각 LI 항목 (T1, E1, XE, XK 등) 순회
          // 가이드라인 7. XE/XK (예문) 작성 가이드에 따른 검토 및 수정 로직

          // 예시: 'の'의 부적절한 예문 ("美しいの花" -> "美しい花") - 이 파일은 중국어이므로 해당 없음
          // if (item.T1 === "の" && item.XE === "美しいの花") {
          //   item.XE = "美しい花";
          //   item.XK = "아름다운 꽃";
          //   changesMade++;
          //   console.log(`Corrected XE/XK for T1: "${item.T1}" in T0: "${line.T0}" (美しいの花 -> 美しい花)`);
          // }

          // 예시: 형용사 활용 오류 ("優しいな人" -> "優しい人") - 이 파일은 중국어이므로 해당 없음
          // if (item.XE === "優しいな人" && item.E1 && item.E1.includes("い형용사")) { 
          //   item.XE = "優しい人";
          //   if (item.XK === "상냥한 사람" || item.XK === "친절한 사람") {
          //   } else {
          //        item.XK = "상냥한 사람"; 
          //   }
          //   changesMade++;
          //   console.log(`Corrected XE for T1: "${item.T1}" in T0: "${line.T0}" (優しいな人 -> 優しい人)`);
          // }
          
          // T0: "梦到与你一起走在沙滩上的温柔" / T1: "温柔" (wēnróu - 부드럽다, 다정하다)
          // 현재 XE: "他是一个温柔的人。" (그는 부드러운 사람이다.) / XK: "그는 부드러운 사람이다."
          // 수정 제안: XE: "她的声音很温柔。" (그녀의 목소리는 매우 부드럽다.) / XK: "그녀의 목소리는 매우 부드럽다."
          // 또는 가사 문맥(모래사장의 부드러움/다정함)을 살려서
          // XE: "他用温柔的眼神看着她。" (그는 부드러운 눈빛으로 그녀를 바라보았다.) XK: "그는 부드러운 눈빛으로 그녀를 바라보았다."
          if (item.T1 === "温柔" && line.T0.includes("沙滩上的温柔")) {
            if (item.XE === "他是一个温柔的人。") {
                item.XE = "她的声音很温柔。";
                item.XK = "그녀의 목소리는 매우 부드럽다.";
                changesMade++;
                console.log(`Updated XE/XK for T1: "${item.T1}" (温柔) in T0: "${line.T0}" to "她的声音很温柔。"`);
            }
          }

          // T0: "目光都变炙热 一切都停滞了" / T1: "炙热" (zhìrè - 뜨겁다, 열렬하다)
          // 현재 XE: "夏天的太阳很炙热。" (여름의 태양은 매우 뜨겁다.) / XK: "여름의 태양은 매우 뜨겁다."
          // 가사 문맥은 "시선이 뜨거워지다"
          // 수정 제안: XE: "他的目光中充满了炙热的感情。" (그의 시선에는 뜨거운 감정이 가득했다.) / XK: "그의 시선에는 뜨거운 감정이 가득했다."
          if (item.T1 === "炙热" && line.T0.includes("目光都变炙热")) {
            if (item.XE === "夏天的太阳很炙热。") {
                item.XE = "他的目光中充满了炙热的感情。";
                item.XK = "그의 시선에는 뜨거운 감정이 가득했다.";
                changesMade++;
                console.log(`Updated XE/XK for T1: "${item.T1}" (炙热) in T0: "${line.T0}" to be more context-aware.`);
            }
          }
          
          // 가이드라인 "7. XE/XK (예문) 작성 가이드" 중 "부적절한 예시 수정 사례" (make love)
          // 이 파일은 중국어 노래이므로 직접 적용되지는 않지만, 문맥 적합성 원칙은 항상 중요.
          // 해당 T1 "make"가 파일에 없으므로 이 조건은 실행되지 않음.
          if (item.T1 === "make" && typeof line.T0 === 'string' && line.T0.includes("Wanna make love")) { 
            if (item.XE === "She can make a cake.") {
                item.XE = "They decided to make love.";
                item.XK = "그들은 사랑을 나누기로 결정했다.";
                changesMade++;
                console.log(`Updated XE/XK for T1: "${item.T1}" in T0: "${line.T0}" for contextual relevance (make love).`);
            }
          }

        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Successfully updated ${filePath} with ${changesMade} changes regarding XE/XK examples based on guidelines.`);
    } else {
      console.log(`No specific XE/XK changes were made based on the implemented script logic for ${filePath}. Further manual review might be needed or the examples are already compliant.`);
    }
  } else {
    console.error(`Error: Could not find translatedLines array or data structure is not as expected in ${filePath}.`);
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 