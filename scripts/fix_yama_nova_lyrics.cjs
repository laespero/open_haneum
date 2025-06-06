const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'yama_nova.json'); // 파일 경로 수정 필요 시

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    const translationsToUpdate = [
      { T0: "「君のこと思っては歌っているよ", K0: "「너를 생각하며 노래하고 있어" },
      { T0: "ずっと情けないなりに", K0: "줄곧 한심하지만, 나름대로" },
      { T0: "ちゃんと立っているよ」", K0: "꿋꿋이 서 있어」" },
      { T0: "愛や平和を誰かが語っていたよ", K0: "사랑이나 평화를 누군가 얘기하고 있었지" },
      { T0: "くだらないくだらない", K0: "시시해, 시시해" },
      { T0: "くだらないみたいね", K0: "시시한가 봐" },
      { T0: "青から赤に変わる信号を待って", K0: "파란불에서 빨간불로 바뀌는 신호를 기다리며" },
      { T0: "メガホン越しの思想を浴びた", K0: "메가폰 너머의 사상을 뒤집어썼어" },
      { T0: "イヤホン挿して白い目を向けた", K0: "이어폰을 꽂고 외면했지" },
      { T0: "散々な鈍感な僕も僕なのに", K0: "이렇게나 형편없고 둔감한 나지만, 이것도 나인데" },
      { T0: "ああ 耳元で貴方は歌っているよ", K0: "아아, 귓가에서 당신은 노래하고 있어" },
      { T0: "ずっと歩けないわりに", K0: "줄곧 걷지도 못하는 주제에" },
      { T0: "ちゃんと立っているんだよ", K0: "제대로 서 있단 말이야" },
      { T0: "今朝も平和を誰かが騙っていたよ", K0: "오늘 아침도 누군가 평화를 떠들어댔지" }, // '騙る'는 속이다, 사칭하다 외에, 그럴듯하게 말하다, 떠들어대다의 뉘앙스도 가능
      { T0: "許せない許せない許せない", K0: "용서 못 해, 용서 못 해, 용서 못 해" },
      { T0: "だけの子どもみたいに", K0: "그저 어린애처럼" },
      { T0: "もしも僕が歌を書くなら", K0: "만약 내가 노래를 만든다면" },
      { T0: "どんな詞をさ 乗せるんだろう?", K0: "어떤 가사를 담을까?" },
      { T0: "言えないことが山ほど増えていって", K0: "말 못 할 것들만 산더미처럼 불어나서" },
      { T0: "幾年越しの思考を止めた", K0: "몇 년이고 해오던 생각을 그만뒀어" },
      { T0: "嫌気が差して期待すら止めた", K0: "진력이 나서 기대조차 관뒀지" },
      { T0: "傲慢な頓痴気なそんな僕なのに", K0: "오만하고 어리석은, 그런 나인데도" },
      { T0: "青白い空の端で", K0: "창백한 하늘 끝에서" },
      { T0: "僕はそんな新星になったよ", K0: "나는 그런 신성이 되었어" },
      { T0: "光り方とか分からないから", K0: "빛나는 법 같은 건 모르니까" },
      { T0: "誰の目にも映らないけど", K0: "누구의 눈에도 띄지 않겠지만" },
      { T0: "音1つ鳴らない町で", K0: "소리 하나 없는 거리에서" },
      { T0: "僕はそんなシンガーになったよ", K0: "나는 그런 가수가 되었어" },
      { T0: "歌い方とか分からないけど", K0: "노래하는 법 같은 건 모르지만" },
      { T0: "誰の耳にも届かなくても", K0: "누구의 귀에도 닿지 않는다 해도" },
      { T0: "耳元で貴方が歌っていたよ", K0: "귓가에서 당신이 노래하고 있었지" },
      { T0: "ああ 君のこと思っては歌っていたいよ", K0: "아아, 너를 생각하며 노래하고 싶어" },
      { T0: "ずっと頼りないけれど", K0: "한없이 미덥지 못해도" },
      { T0: "ちゃんと立っていたいんだよ", K0: "꿋꿋이 서 있고 싶은 거야" },
      { T0: "愛や平和は誰かが語ってくれよ", K0: "사랑이나 평화 같은 건 누가 좀 얘기해 줘" },
      { T0: "飾らない飾らない飾らない", K0: "꾸밈없이, 꾸밈없이, 꾸밈없이" },
      { T0: "だけの心なんかで", K0: "그런 꾸밈없는 마음 따위로" }, // 앞의 '飾らない'와 연결
      { T0: "もしも僕がスターになったら", K0: "만약 내가 스타가 된다면" },
      { T0: "どんな詞をさ 歌えるんだろう?", K0: "어떤 노래를 부를 수 있을까?" },
      { T0: "どんな言葉でさ 訴えるんだろう", K0: "어떤 말로 마음을 전할 수 있을까" },
      { T0: "この星で この僕で", K0: "이 별에서, 이런 나로서" }
    ];

    data.translatedLines.forEach(line => {
      const update = translationsToUpdate.find(u => u.T0 === line.T0);
      if (update && line.K0 !== update.K0) {
        console.log(`- T0: "${line.T0}"`);
        console.log(`  Old K0: "${line.K0}"`);
        line.K0 = update.K0;
        console.log(`  New K0: "${line.K0}"`);
        changesMade++;
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} changes.`);
    } else {
      console.log(`\nNo changes needed for ${filePath}. All translations are already up to date.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 