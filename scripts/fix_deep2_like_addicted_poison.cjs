const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep2_like_addicted_poison.json'); // 경로 수정

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(item => {
      let originalK0 = item.K0; // 변경 전 K0 값 저장

      if (item.T0 === "一天 的时间 其实说多也不算多" && item.K0 !== "하루란 시간, 길다면 길지만 또 짧기도 해.") {
        item.K0 = "하루란 시간, 길다면 길지만 또 짧기도 해.";
      } else if (item.T0 === "好多 时钟的圈 足够想念你了七遍" && item.K0 !== "수많은 시계 바늘이 일곱 번쯤 너를 그렸을 만큼.") {
        item.K0 = "수많은 시계 바늘이 일곱 번쯤 너를 그렸을 만큼.";
      } else if (item.T0 === "旁边 是谁 怎么我没看过他的脸" && item.K0 !== "옆엔 누구? 얼굴도 본 적 없는 사람인데.") {
        item.K0 = "옆엔 누구? 얼굴도 본 적 없는 사람인데.";
      } else if (item.T0 === "飞蛾 总在 危险时候把自己奉献" && item.K0 !== "불나방은 늘 위험한 순간에 제 몸을 던지곤 해.") {
        item.K0 = "불나방은 늘 위험한 순간에 제 몸을 던지곤 해.";
      } else if (item.T0 === "我像是中了你的毒 快乐藏不住" && item.K0 !== "네 독에 중독된 듯, 기쁨을 감출 수가 없어.") {
        item.K0 = "네 독에 중독된 듯, 기쁨을 감출 수가 없어.";
      } else if (item.T0 === "再次假装不在乎 你面前装酷" && item.K0 !== "또다시 괜찮은 척, 네 앞에선 쿨한 척.") {
        item.K0 = "또다시 괜찮은 척, 네 앞에선 쿨한 척.";
      } else if (item.T0 === "其实我需要你 so there's no monday blue" && item.K0 !== "사실 난 네가 필요해, 그래서 먼데이 블루 같은 건 없어.") {
        item.K0 = "사실 난 네가 필요해, 그래서 먼데이 블루 같은 건 없어.";
      } else if (item.T0 === "再次隐藏着喜怒 thought it's pretty cool" && item.K0 !== "다시 한번 감정을 숨기는 게, 꽤 멋지다고 생각했지.") {
        item.K0 = "다시 한번 감정을 숨기는 게, 꽤 멋지다고 생각했지.";
      } else if (item.T0 === "发现我需要你 so there's no monday blue" && item.K0 === "내가 너를 필요로 한다는 걸 발견했어, 그래서 월요일 우울증이 없어") { // 이전 값으로 정확히 타겟팅
        item.K0 = "네가 필요하단 걸 깨달았어, 그래서 먼데이 블루 같은 건 없어.";
      } else if (item.T0 === "I got lots of work 等着我去慢慢完成" && item.K0 !== "쌓인 일이 많지만, 천천히 해나가면 돼.") {
        item.K0 = "쌓인 일이 많지만, 천천히 해나가면 돼.";
      } else if (item.T0 === "But the brain just fart 昨晚那路口的红灯" && item.K0 !== "근데 머릿속은 멍해, 어젯밤 그 교차로의 빨간불처럼.") {
        item.K0 = "근데 머릿속은 멍해, 어젯밤 그 교차로의 빨간불처럼.";
      } else if (item.T0 === "梦到与你一起走在沙滩上的温柔" && item.K0 !== "너와 해변을 거닐던 꿈, 그 부드러운 감촉.") {
        item.K0 = "너와 해변을 거닐던 꿈, 그 부드러운 감촉.";
      } else if (item.T0 === "一道一道阳光让我身处粉红宇宙" && item.K0 !== "한 줄기 햇살에 온 세상이 핑크빛 우주가 돼.") {
        item.K0 = "한 줄기 햇살에 온 세상이 핑크빛 우주가 돼.";
      }

      if (originalK0 !== item.K0) {
        changesMade++;
        console.log(`T0: "${item.T0}"`);
        console.log(` - K0 (Old): "${originalK0}"`);
        console.log(` - K0 (New): "${item.K0}"`);
        console.log('---');
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} changes.`);
    } else {
      console.log(`\nNo changes needed for ${filePath}.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 