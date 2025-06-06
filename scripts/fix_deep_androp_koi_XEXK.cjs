const fs = require('fs');
const filePath = './songs/deep_androp_koi.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          // T1: を (T0: 物語が僕を拒んだって)
          if (item.T1 === "を" && line.T0 === "物語が僕を拒んだって" && item.XE === "本を読みます。" && item.XK === "책을 읽습니다.") {
                 item.XE = "手紙を書く。";
                 item.XK = "편지를 쓴다.";
                 changesMade++;
          }
          // T1: を (T0: 約束をするよ 에 해당하는 LI 내의 'を')
          else if (item.T1 === "を" && line.T0 === "約束をするよ" && item.XE === "本を読む") {
            item.XE = "約束を破る。";
            item.XK = "약속을 깨다.";
            changesMade++;
          }
          // T1: に (T0: 夏の暑さに 에 해당하는 LI 내의 'に')
          else if (item.T1 === "に" && line.T0 === "夏の暑さに" && item.XE === "学校に行く。") {
            item.XE = "暑さに負ける。";
            item.XK = "더위에 지다.";
            changesMade++;
          }
          // T1: に (T0: 君となら特別に変わる 에 해당하는 LI 내의 'に')
          else if (item.T1 === "に" && line.T0 === "君となら特別に変わる" && item.XE === "きれいになる。") {
            item.XE = "静かになる。";
            item.XK = "조용해지다.";
            changesMade++;
          }
          // T1: くらい
          else if (item.T1 === "くらい" && item.XE === "一時間くらいかかる。") {
            item.XE = "死ぬくらい辛い。";
            item.XK = "죽을 만큼 괴로워.";
            changesMade++;
          }
          // T1: なら (T0: 忘れるくらいなら)
          else if (item.T1 === "なら" && line.T0 === "忘れるくらいなら" && item.XE === "行くなら教えて。") {
            item.XE = "泣くくらいなら、笑った方がいい。";
            item.XK = "울 정도라면, 웃는 편이 나아.";
            changesMade++;
          }
          // T1: いい
          else if (item.T1 === "いい" && item.XE === "この料理はいい味だ。") {
            item.XE = "何でもいいよ。";
            item.XK = "뭐든지 괜찮아.";
            changesMade++;
          }
          // T1: の (T0: いつも隣にいるのは)
          else if (item.T1 === "の" && line.T0 === "いつも隣にいるのは" && item.XE === "食べるのが好きだ。" && item.XK === "먹는 것을 좋아한다.") {
            item.XE = "私が好きなのは、この歌だ。";
            item.XK = "내가 좋아하는 것은 이 노래야.";
            changesMade++;
          }
          // T1: が (T0: 君が遠くに行ってしまって)
          else if (item.T1 === "が" && line.T0 === "君が遠くに行ってしまって" && item.XE === "私が行きます。") {
            item.XE = "風が強い。";
            item.XK = "바람이 강하다.";
            changesMade++;
          }
          // T1: を (T0: 君の姿を)
          else if (item.T1 === "を" && line.T0 === "君の姿を" && item.XE === "りんごを食べる") {
            item.XE = "彼女の姿を見る。";
            item.XK = "그녀의 모습을 본다.";
            changesMade++;
          }
          // T1: だめ
          else if (item.T1 === "だめ" && item.XE === "ここで遊んではだめだ。") {
            item.XE = "君じゃなきゃだめだ。";
            item.XK = "네가 아니면 안 돼.";
            changesMade++;
          }
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Successfully updated XE/XK fields in ${filePath} with ${changesMade} changes.`);
    } else {
      console.log(`No XE/XK fields needed updates based on the specified conditions in ${filePath}.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 