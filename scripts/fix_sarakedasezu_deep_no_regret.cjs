const fs = require('fs');
const path = require('path');

// 스크립트 위치: open-haneum/scripts/fix_sarakedasezu_deep_no_regret.cjs
// 대상 파일 위치: open-haneum/songs/deep_no_regret.json
const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');
const targetT0 = "ずっとさらけ出せず";

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let fileModified = false; // 파일 전체가 수정되었는지 여부

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.T0 === targetT0) {
        if (line.LI && Array.isArray(line.LI)) {
          let sarakeModified = false;
          const originalLiCount = line.LI.length;

          // 1단계: "さらけ" 항목 수정
          const mappedLiArray = line.LI.map(item => {
            if (item.T1 === "さらけ") {
              console.log(`- Modifying T1: "さらけ" in T0: "${targetT0}".`);
              console.log(`  Old K1: "${item.K1}", Old E1: "${item.E1}"`);
              item.T1 = "さらけ出せず";
              item.K1 = "드러내지 못하고";
              item.I1 = "sarakedasezu";
              item.R1 = "사라케다세즈";
              item.E1 = "'さらけ出す(드러내다)'의 미연형 'さらけ出さ'에 부정의 조동사 'ず'가 붙은 형태로, '드러내지 못하고'라는 의미입니다.";
              // T2, K2, I2, R2, XE, XK, XI, XR 필드는 기존 "さらけ" 항목의 값을 유지합니다.
              console.log(`  New T1: "${item.T1}", K1: "${item.K1}", I1: "${item.I1}", R1: "${item.R1}"`);
              console.log(`  New E1: "${item.E1}"`);
              sarakeModified = true;
              fileModified = true; // 파일 수정 플래그 설정
            }
            return item;
          });

          // 2단계: "さらけ"가 수정되었다면 "出せず" 항목 제거
          if (sarakeModified) {
            line.LI = mappedLiArray.filter(item => {
              if (item.T1 === "出せず") {
                console.log(`- Removing T1: "出せず" as "さらけ" was modified to "さらけ出せず".`);
                fileModified = true; // 파일 수정 플래그 설정 (이미 true일 수 있지만 명시)
                return false; // "出せず" 항목 제거
              }
              return true; // 그 외 항목 유지
            });
            if (line.LI.length < originalLiCount) {
                 console.log(`  Successfully removed the "出せず" item. LI count changed from ${originalLiCount} to ${line.LI.length}.`);
            }
          } else {
            // "さらけ" 항목이 없어서 수정이 일어나지 않은 경우
            const sarakeExists = line.LI.some(i => i.T1 === "さらけ");
            if (!sarakeExists) {
              console.log(`- T1: "さらけ" not found in T0: "${targetT0}". No changes made to this line's LI.`);
            } else {
              // "さらけ"는 존재하지만 sarakeModified가 false인 경우는 로직 오류일 수 있음
              console.log(`Warning: T1: "さらけ" exists but was not marked as modified. "出せず" will not be removed.`);
            }
          }
        }
      }
    });

    if (fileModified) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Successfully updated ${filePath} with changes targeting T0: "${targetT0}".`);
    } else {
      console.log(`No changes made to ${filePath}. Ensure T0: "${targetT0}" and its T1: "さらけ" item exist, or no modification was needed.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 