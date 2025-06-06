const fs = require('fs');
const path = require('path');

const targetFile = 'deep2_super_idol.json';
const filePath = path.join(__dirname, '..', 'songs', targetFile);

// 수정할 예문(XE)과 새로운 한글 발음(XR) 값의 매핑
// T0와 T1은 정확한 타겟팅을 위한 추가 정보로 활용 (필요시 로깅 또는 조건 강화에 사용)
const corrections = [
  {
    T0: "痛快的热爱", T1: "热爱", XE: "他对音乐充满了热爱。",
    newXR: "타 두이 인위에 충만 러 르어아이"
  },
  {
    T0: "那坚定的模样", T1: "模样", XE: "他的模样很帅气。",
    newXR: "타 더 무양 헌 슈아이치"
  },
  {
    T0: "热爱105℃的你", T1: "105℃", XE: "水的沸点是100℃。",
    newXR: "슈이 더 페이디엔 스 이 바이 두"
  },
  {
    T0: "再次回到最佳状态", T1: "最佳", XE: "这是最佳的选择。",
    newXR: "저 스 쭈이지아 더 쉬안저"
  },
  {
    T0: "滴滴清纯的蒸馏水", T1: "蒸馏水", XE: "蒸馏水很纯净。",
    newXR: "정리우슈이 헌 춘징"
  },
  {
    T0: "Super Idol的笑容", T1: "笑容", XE: "她的笑容很美。",
    newXR: "타 더 샤오롱 헌 메이"
  },
  {
    T0: "对梦想的执着一直不曾更改", T1: "对", XE: "对这个问题，我有不同的看法。",
    newXR: "두이 저거 원티, 워 여우 부통 더 칸파"
  },
  {
    T0: "对梦想的执着一直不曾更改", T1: "不曾", XE: "他从不曾迟到。",
    newXR: "타 총 부청 치다오"
  }
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
          const correction = corrections.find(c => c.XE === item.XE && c.T0 === line.T0 && c.T1 === item.T1);
          if (correction) {
            if (item.XR !== correction.newXR) {
              logOutput.push(`Updating XR for T0: "${line.T0}", T1: "${item.T1}", XE: "${item.XE}"`);
              logOutput.push(`  Old XR: "${item.XR}"`);
              item.XR = correction.newXR;
              logOutput.push(`  New XR: "${item.XR}"`);
              changesMade++;
            } else {
              logOutput.push(`No change needed for T0: "${line.T0}", T1: "${item.T1}", XE: "${item.XE}". XR is already "${correction.newXR}".`);
            }
          }
        });
      }
    });
  }

  console.log("--- XR Correction Log (deep2_super_idol.json) ---");
  if (logOutput.length > 0) {
    logOutput.forEach(log => console.log(log));
  } else {
    console.log("No matching entries found for correction or no changes needed.");
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