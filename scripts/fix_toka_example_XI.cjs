const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error("파일을 읽는 중 오류가 발생했습니다:", err);
    return;
  }

  let jsonData;
  try {
    jsonData = JSON.parse(data);
  } catch (parseErr) {
    console.error("JSON 파싱 중 오류가 발생했습니다:", parseErr);
    return;
  }

  let changed = false;
  let foundTargetLiItem = false;

  // const targetT0 = '<span class=\"ruby\"><span class=\"rb\">夢</span><span class=\"rt\">ゆめ</span></span>や<span class=\"ruby\"><span class=\"rb\">希望</span><span class=\"rt\">きぼう</span></span>とかを'; // 더 이상 targetT0에 직접 의존하지 않음
  const targetT1ForSearch = 'とか';
  const targetXE = '週末は買い物とか料理とかをします。';

  console.log(`[DEBUG] 목표 T1: ${JSON.stringify(targetT1ForSearch)}`);
  console.log(`[DEBUG] 목표 XE: ${JSON.stringify(targetXE)}`);

  if (jsonData.translatedLines && Array.isArray(jsonData.translatedLines)) {
    console.log(`[DEBUG] jsonData.translatedLines 배열의 길이: ${jsonData.translatedLines.length}`);
    jsonData.translatedLines.forEach((translatedLineItem, lineIndex) => {
      // console.log(`[DEBUG] translatedLines[${lineIndex}] 순회 중. 키: ${Object.keys(translatedLineItem).join(', ')}`);
      if (translatedLineItem.LI && Array.isArray(translatedLineItem.LI)) {
        // console.log(`  [DEBUG] translatedLines[${lineIndex}]에는 LI 배열이 존재하며, 길이는 ${translatedLineItem.LI.length}입니다.`);
        // if (translatedLineItem.LI.length > 0) {
        //     console.log(`    [DEBUG] translatedLines[${lineIndex}].LI[0]의 키: ${Object.keys(translatedLineItem.LI[0]).join(', ')}`);
        // }
        translatedLineItem.LI.forEach((liItem, liIndex) => {
          if (liItem.T1 === targetT1ForSearch && liItem.XE && liItem.XE.trim() === targetXE) {
            foundTargetLiItem = true;
            console.log(`[INFO] *** 수정 대상 liItem 찾음! ***`);
            console.log(`       위치: translatedLines[${lineIndex}] -> LI[${liIndex}]`);
            console.log(`       해당 translatedLineItem.T0: ${translatedLineItem.T0 || 'N/A'}`);
            console.log(`       liItem.T1: ${liItem.T1}`);
            console.log(`       liItem.XE: ${liItem.XE}`);
            console.log(`       기존 XI: ${liItem.XI}`);
            liItem.XI = 'shūmatsu wa kaimono toka ryōri toka o shimasu';
            console.log(`       새로운 XI: ${liItem.XI}`);
            changed = true;
          }
        });
      } else {
        // console.log(`  [DEBUG] translatedLines[${lineIndex}]에는 LI 배열이 없거나 배열 타입이 아닙니다.`);
      }
    });
  } else {
    console.log("jsonData.translatedLines가 배열이 아니거나 존재하지 않습니다.");
  }

  if (!foundTargetLiItem) {
    console.log('[INFO] 조건에 맞는 liItem(T1="とか", XE="週末は...")을 찾지 못했습니다.');
  }

  if (changed) {
    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', writeErr => {
      if (writeErr) {
        console.error("파일을 쓰는 중 오류가 발생했습니다:", writeErr);
        return;
      }
      console.log('[SUCCESS] `deep_no_regret.json` 파일의 "とか" 예문 XI 필드가 성공적으로 업데이트되었습니다.');
    });
  } else {
    if(foundTargetLiItem) { 
        console.log('[INFO] 대상을 찾았지만, 변경할 내용이 없거나 이미 적용되었습니다.');
    } else { 
        console.log('[INFO] 수정 대상 예문을 찾지 못했거나 파일 구조가 예상과 다릅니다.');
    }
  }
}); 