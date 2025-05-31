const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_mad_at_disney.json');

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;
  let linesReviewed = 0;
  let itemsReviewed = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach((line, lineIndex) => {
      linesReviewed++;
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach((item, itemIndex) => {
          itemsReviewed++;
          let itemChanged = false;

          // 가이드라인: XE, XK, XI, XR은 함께 존재하거나 함께 비어있어야 함
          // XE가 있는데 XK가 없거나 플레이스홀더인 경우, 관련 필드 모두 삭제
          if (item.XE && (!item.XK || item.XK.trim() === "" || item.XK.trim() === "번역 필요")) {
            console.log(`[T0: "${line.T0}", T1: "${item.T1}"] XE ("${item.XE}") exists but XK is missing/placeholder. Clearing example fields.`);
            item.XE = "";
            item.XK = "";
            item.XI = "";
            item.XR = "";
            itemChanged = true;
          }

          // XE가 비어있는데 다른 예문 필드가 채워져 있는 경우, 다른 필드도 비움
          if (!item.XE && (item.XK || item.XI || item.XR)) {
            console.log(`[T0: "${line.T0}", T1: "${item.T1}"] XE is missing but other example fields exist. Clearing all example fields.`);
            item.XK = "";
            item.XI = "";
            item.XR = "";
            itemChanged = true;
          }
          
          // 가이드라인: XR은 한글 발음이어야 함. 영어 철자 등이 들어간 경우 삭제.
          // 간단한 정규식으로 영어 알파벳 포함 여부 확인 (완벽하지 않지만 일반적인 경우 커버)
          if (item.XR && /[a-zA-Z]/.test(item.XR)) {
            // XR에 IPA와 유사한 기호가 들어간 경우도 있으므로, 일단 로깅만 하고, 명백한 영어 철자 위주로 삭제 고려
            // 여기서는 XR에 영어 알파벳이 포함된 경우, 잘못된 것으로 간주하고 빈 값으로 처리
            if (!item.XI || item.XI.trim() === "") { // IPA 정보가 없다면 한글 발음 추정 불가
                 console.log(`[T0: "${line.T0}", T1: "${item.T1}"] XR ("${item.XR}") contains non-Korean characters and no XI. Clearing XR.`);
                 item.XR = "";
                 itemChanged = true;
            } else {
                 // XI가 있다면, XR을 비우고 나중에 수동으로 채우도록 유도하거나,
                 // 여기서는 일단 비우는 것으로 처리
                 console.log(`[T0: "${line.T0}", T1: "${item.T1}"] XR ("${item.XR}") contains non-Korean characters. Clearing XR (XI exists: "${item.XI}").`);
                 item.XR = "";
                 itemChanged = true;
            }
          }

          // 가이드라인: XI는 IPA 또는 병음이어야 함.
          // XE가 영어인데 XI가 병음 표기(성조 부호 등)를 포함하는 경우 XI를 비움
          if (item.XE && item.XI) {
            const isEnglishWord = /^[a-zA-Z\s.,!?'"-]+$/.test(item.XE); // 간단한 영어 단어/문장 판별
            const hasPinyinTone = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(item.XI); // 병음 성조 부호 확인
            if (isEnglishWord && hasPinyinTone) {
              console.log(`[T0: "${line.T0}", T1: "${item.T1}"] XE ("${item.XE}") seems English but XI ("${item.XI}") contains Pinyin tones. Clearing XI.`);
              item.XI = "";
              itemChanged = true;
            }
          }
          
          // XK가 있는데 XE가 없는 경우, XK도 비움 (일관성)
          if (!item.XE && item.XK) {
            console.log(`[T0: "${line.T0}", T1: "${item.T1}"] XK ("${item.XK}") exists but XE is missing. Clearing XK.`);
            item.XK = "";
            itemChanged = true;
          }

          if (itemChanged) {
            changesMade++;
          }
        });
      }
    });

    console.log(`\nReviewed ${linesReviewed} lines and ${itemsReviewed} LI items.`);

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Successfully updated ${filePath} with ${changesMade} changes related to examples.`);
    } else {
      console.log(`No changes needed for examples in ${filePath}.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 