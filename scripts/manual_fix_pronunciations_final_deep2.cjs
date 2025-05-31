const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep2_super_idol.json');

// 수정할 T0과 새로운 R0 값의 매핑 (Batch 4 - Final)
const corrections = {
  // Batch 1 (이미 적용되었지만, 혹시 모르니 포함)
  "痛快的热爱": "통콰이 더 르어아이",
  "喝一口哟": "허 이 커우 요",
  "痛快去热爱": "통콰이 취 르어아이",
  "在这独一无二": "짜이 저 두이우얼",
  "属于我的时代": "수위 워 더 스다이",
  // Batch 2 (이미 적용되었지만, 혹시 모르니 포함)
  "放着让我来": "팡 저 랑 워 라이",
  "不怕有我在": "부 파 요우 워 짜이",
  "都没你的甜": "더우 메이 니 더 톈",
  "那坚定的模样": "나 지엔딩 더 무양",
  "莫忘了初心常在": "모 왕 러 추신 창 짜이",
  // Batch 3 (이미 적용되었지만, 혹시 모르니 포함)
  "热爱105℃的你": "르어아이 이 바이 링 우 두 더 니",
  "再次回到最佳状态": "짜이츠 후이다오 쭈이지아 주앙타이",
  "八月正午的阳光": "바 웨 정 우 더 양 광",
  "都没你耀眼": "더우 메이 니 야오 옌",
  "不怕失败来一场": "부 파 스바이 라이 이 창",
  // Batch 4 (신규)
  "滴滴清纯的蒸馏水": "디 디 칭춘 더 정리우쉐이",
  "勇敢追自己的梦想": "용간 주이 쯔지 더 멍시앙",
  "喝一口又活力全开": "허 이 커우 요우 후어리 취엔 카이",
  "你从来都不轻言失败": "니 총라이 더우 부 칭옌 스바이",
  "你不知道你有多可爱": "니 부 즈다오 니 요우 두어 커아이",
  "很安心 当你对我说": "헌 안신 당 니 두이 워 슈어",
  "Super Idol的笑容": "슈퍼 아이돌 더 샤오롱",
  "对梦想的执着一直不曾更改": "두이 멍시앙 더 즈주어 이즈 부청 껑가이",
  "跌倒后会傻笑着再站起来": "디에다오 허우 후이 샤 샤오 저 짜이 잔 치라이"
};

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;
  let logOutput = [];

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (corrections.hasOwnProperty(line.T0)) {
        if (line.R0 !== corrections[line.T0]) {
          logOutput.push(`Updating R0 for T0: "${line.T0}" (I0: "${line.I0}")`);
          logOutput.push(`  Old R0: "${line.R0}"`);
          line.R0 = corrections[line.T0];
          logOutput.push(`  New R0: "${line.R0}"`);
          changesMade++;
        } else {
          logOutput.push(`No change needed for T0: "${line.T0}". R0 is already "${corrections[line.T0]}".`);
        }
      }
    });
  }

  console.log("--- Manual Correction Log (Final Batch) ---");
  logOutput.forEach(log => console.log(log));

  if (changesMade > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\nSuccessfully updated ${filePath} with ${changesMade} change(s).`);
  } else {
    console.log('\nNo changes made in this batch. R0 values might already be correct or target T0s not found in the correction list.');
  }

} catch (error) {
  console.error('Error processing the file:', error);
} 