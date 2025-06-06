const fs = require('fs');
const filePath = 'songs/deep_unmoved_challenge.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);

  data.translatedLines.forEach(item => {
    if (item.T0 === "什么情况下的你会口是心非") {
      item.K0 = "어떤 상황에서 넌 말과 마음이 다를까?";
    } else if (item.T0 === "奇怪的笑点") {
      item.K0 = "이상한 웃음 코드";
    } else if (item.T0 === "爱有什么关系") {
      item.K0 = "사랑이 뭐 그리 중요해.";
    } else if (item.T0 === "我不夸张 牛仔裤") {
      item.K0 = "과장 없이, 그냥 청바지 차림인데.";
    } else if (item.T0 === "U can trust baby") {
      item.K0 = "날 믿어도 돼, 자기야.";
    } else if (item.T0 === "分享我你的过去当然糗事也要汇报") {
      item.K0 = "네 과거를 내게 공유해줘, 물론 부끄러운 일도 말해줘야 해.";
    } else if (item.T0 === "你做什么都可以") {
      item.K0 = "넌 뭐든지 할 수 있어.";
    } else if (item.T0 === "晚餐就吃蛋炒饭") {
      item.K0 = "저녁은 달걀 볶음밥으로 하자.";
    } else if (item.T0 === "我没化妆 穿朴素") {
      item.K0 = "난 화장 안 하고 수수하게 입었어.";
    } else if (item.T0 === "相离 无所谓是什么距离") {
      item.K0 = "떨어져 있어도, 거리는 아무 상관 없어.";
    } else if (item.T0 === "告诉我什么情况下") {
      item.K0 = "어떤 상황인지 말해줘.";
    } else if (item.T0 === "我不会置你于陷阱") {
      item.K0 = "널 함정에 빠뜨리지 않을 거야.";
    } else if (item.T0 === "我需要保护你的脆弱") {
      item.K0 = "너의 연약함을 지켜줘야 해.";
    } else if (item.T0 === "我们做同样奇怪的梦") {
      item.K0 = "우린 똑같이 이상한 꿈을 꿔.";
    } else if (item.T0 === "什么情况下的我们不需要争对错") {
      item.K0 = "어떤 상황에서 우린 옳고 그름을 다툴 필요가 없을까?";
    } else if (item.T0 === "爱让人有胆小的那面") {
      item.K0 = "사랑은 사람을 소심하게 만들기도 해.";
    } else if (item.T0 === "相邻的两颗心连接我和你") {
      item.K0 = "이웃한 두 마음이 나와 너를 이어줘.";
    } else if (item.T0 === "你像不心动挑战") {
      item.K0 = "넌 참기 힘든 심쿵 챌린지 같아.";
    } else if (item.T0 === "我头发香 沐浴露") {
      item.K0 = "내 머리 향기로워, 네 바디워시 향인가.";
    } else if (item.T0 === "废话讲一夜") {
      item.K0 = "밤새도록 수다 떨기.";
    } else if (item.T0 === "反正有你我选你 没你就重开") {
      item.K0 = "어차피 네가 있다면 너를 선택할 거고, 네가 없다면 다시 시작할 거야.";
    } else if (item.T0 === "哎算了无所谓反正先尽力爱一回") {
      item.K0 = "에라, 아무렴 어때, 일단 최선을 다해 사랑해보자.";
    } else if (item.T0 === "你越简单越好看") {
      item.K0 = "넌 꾸미지 않을수록 더 예뻐 보여.";
    } else if (item.T0 === "爱你我就可以") {
      item.K0 = "널 사랑하기만 하면 난 뭐든지 할 수 있어.";
    } else if (item.T0 === "你一句晚安胜过世上所有褪黑素") {
      item.K0 = "네 \"잘 자\" 한마디가 세상 모든 수면제보다 나아.";
    } else if (item.T0 === "你也没精致打扮") {
      item.K0 = "너도 정교하게 꾸미지 않았어.";
    } else if (item.T0 === "爱是每一天都像是不心动挑战") {
      item.K0 = "사랑은 매일매일이 심쿵 참기 챌린지 같아.";
    } else if (item.T0 === "不疲倦不舍得睡觉") {
      item.K0 = "지치지 않고, 잠들기도 아쉬워.";
    } else if (item.T0 === "告诉我 你的爱 你的恨 你的渴望") {
      item.K0 = "말해줘, 너의 사랑, 너의 증오, 너의 갈망을.";
    } else if (item.T0 === "如果有得选我会毫不犹豫的选择你") {
      item.K0 = "만약 선택권이 있다면, 난 망설임 없이 널 선택할 거야.";
    } else if (item.T0 === "如果爱我是场比赛你会被黑幕") {
      item.K0 = "날 사랑하는 게 게임이라면, 넌 아마 편파 판정으로 이길 걸.";
    } else if (item.T0 === "没原因的爱到偏心") {
      item.K0 = "이유 없이 편애할 만큼 사랑해.";
    } else if (item.T0 === "不管什么情况下我都和你共进退") {
      item.K0 = "어떤 상황에서든 너와 함께 나아가고 물러설 거야.";
    } else if (item.T0 === "只要你爱的坚定") {
      item.K0 = "네 사랑이 확고하기만 하다면.";
    } else if (item.T0 === "胸口小鹿乱撞心跳思念泛滥后成灾") {
      item.K0 = "가슴이 두근거리고, 심장이 뛰고, 그리움이 넘쳐 감당이 안 돼.";
    } else if (item.T0 === "只想在我们爱里加糖不想加火药") {
      item.K0 = "우리 사랑엔 설탕만 넣고 싶어, 화약은 말고.";
    } else if (item.T0 === "也会担心害怕问这关系是否真的对") {
      item.K0 = "이 관계가 정말 괜찮은 건지, 걱정되고 두려워 묻기도 해.";
    } else if (item.T0 === "你的情绪都合理") {
      item.K0 = "너의 모든 감정은 다 이해돼.";
    } else if (item.T0 === "冷笑话我们乐在其中") {
      item.K0 = "썰렁한 농담에도 우리는 즐거워.";
    } else if (item.T0 === "遇到了不顺心的事情那就躲掉") {
      item.K0 = "마음에 안 드는 일이 생기면 그냥 피해 버리자.";
    } else if (item.T0 === "给我看 你的坏 你的笨 你的沮丧") {
      item.K0 = "나에게 보여줘, 너의 못된 모습, 너의 바보 같은 모습, 너의 좌절까지도.";
    } else if (item.T0 === "你的爱让我的悲伤变短暂") {
      item.K0 = "네 사랑 덕분에 내 슬픔은 짧아져.";
    } else if (item.T0 === "你让生活变缓慢") {
      item.K0 = "넌 삶의 속도를 늦춰줘.";
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log("파일 수정 완료: " + filePath);

} catch (error) {
  console.error('스크립트 실행 중 오류 발생:', error);
} 