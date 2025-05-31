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
          let originalE1 = item.E1;
          if (item.T1 === "拒んだ" && item.E1 === "거부하다의 과거형으로, 어떤 것을 받아들이지 않는다는 의미입니다.") {
            item.E1 = "동사 `拒む(こばむ)`의 과거형으로, '거부했다', '마다했다'의 의미입니다. 주로 요구나 제안을 받아들이지 않거나, 관계를 끊는 상황에 사용됩니다.";
            changesMade++;
          } else if (item.T1 === "って" && line.T0 === "物語が僕を拒んだって" && item.E1 === "인용이나 가정을 나타내는 종조사입니다.") {
            item.E1 = "구어체에서 인용, 강조, 또는 가정의 의미를 나타내는 조사 `とて`의 축약형입니다. 여기서는 '~라고 해도', '~하더라도' 정도의 양보의 의미로 사용되었습니다.";
            changesMade++;
          } else if (item.T1 === "会い" && item.E1 === "'만나다'의 명사형으로, 여기서는 '만나러'라는 뜻으로 사용되었습니다.") {
            item.E1 = "동사 `会う(あう)`의 연용형(명사형)입니다. 뒤에 오는 조사 `に`와 함께 쓰여 '만나러'라는 목적의 의미를 나타냅니다.";
            changesMade++;
          } else if (item.T1 === "探し" && item.E1 === "'探す(찾다)'의 연용형으로, 동사가 다른 동사와 연결될 때 사용되는 형태입니다.") {
            item.E1 = "동사 `探す(さがす)`의 연용형입니다. 뒤에 오는 동사 `続ける`와 결합하여 '계속 찾다'라는 의미를 만듭니다.";
            changesMade++;
          } else if (item.T1 === "続ける" && item.E1 === "앞의 동작이 계속됨을 나타내는 동사입니다. 다른 동사의 연용형 뒤에 붙어 '~계속하다'의 의미를 만듭니다.\n다.                                                                                                         よ\n : 문장 끝에 붙어 화자의 의지나 감정을 강조하는 종조사입니다.") {
            item.E1 = "동사 `続ける(つづける)`는 '계속하다'라는 의미입니다. 앞 동사의 연용형에 붙어 복합동사를 만듭니다."; 
            changesMade++;
          } else if (item.T1 === "何も" && line.T0.includes("何もいらない") && !line.T0.includes("何もいらないんだよ") && item.E1.startsWith("부정문에서 '아무 것도'라는 의미를 나타내는 표현입니다.")) { 
            item.E1 = "`何(なに)も`는 '아무것도'라는 의미의 부사구입니다. `いらない`는 5단 동사 `要る(いる)`의 부정형으로 '필요 없다'는 의미입니다.";
             if (originalE1 !== item.E1) changesMade++;
          } else if (item.T1 === "何も" && line.T0.includes("何もいらないんだよ") && item.E1.startsWith("부정문에서 '아무 것도'라는 의미를 나타내는 표현입니다.")) { 
            item.E1 = "`何(なに)も`는 '아무것도'라는 의미, `いらない`는 `要る(いる)`의 부정형 '필요 없다', `んだ`는 설명/강조의 종조사 `のだ`의 구어체, `よ`는 강조의 종조사입니다. 전체적으로 '아무것도 필요 없어!'라는 강한 단언의 느낌을 줍니다.";
            if (originalE1 !== item.E1) changesMade++;
          } else if (item.T1 === "写せ" && item.E1 === "'写す(capture)'의 가능형으로, '담을 수 있다'는 의미입니다.") {
            item.E1 = "동사 `写す(うつす)`의 가능형 `写せる(うつせる)`의 명령형 또는 어미생략형으로 볼 수 있으며, 문맥상 '담아내다', '찍어내다' 정도의 의미입니다. 뒤에 오는 `やしない`와 함께 강한 부정을 나타냅니다.";
            changesMade++;
          } else if (item.T1 === "やしない" && item.E1 === "강한 부정을 나타내는 표현으로, '절대 ~하지 않는다'는 뜻입니다.") {
            item.E1 = "동사의 연용형에 접속하여 강한 부정(~따위 하지 않는다, 결코 ~하지 않는다)을 나타내는 관용적 표현입니다. `はしない`가 변한 형태로 볼 수 있습니다.";
            changesMade++;
          } else if (item.T1 === "がある" && item.E1 === "무언가가 존재함을 나타내는 표현입니다.") {
            item.E1 = "동사 `ある`는 '있다', '존재하다'의 의미입니다. 주격조사 `が`와 함께 쓰여 '~이/가 있다'는 존재 표현을 만듭니다.";
            changesMade++;
          } else if (item.T1 === "守ろう" && item.E1 === "'지키다'라는 의미의 동사로, 권유나 제안을 나타냅니다.") {
            item.E1 = "5단 동사 `守る(まもる)`의 의지형/권유형으로, '지키자', '지킬 것이다'라는 의미입니다.";
            changesMade++;
          } else if (item.T1 === "合わせて" && item.E1 === "동사 '合わせる'(맞추다)의 연용형(て형)으로, '~하고'라는 연결의 의미를 가집니다.") {
            item.E1 = "하1단 동사 `合わせる(あわせる)`의 연용형(て형)으로, '맞추고', '맞대고'의 의미입니다.";
            changesMade++;
          } else if (item.T1 === "当たり前" && item.E1.includes("'당연한 것' 또는 '자연스러운 것'을 의미하는 명사입니다.") && item.E1.includes("가 : 주어를 나타내는 조사입니다.")) { 
             item.E1 = "'당연함, 당연한 일'을 의미하는 명사 `当たり前(あたりまえ)`입니다.";
             changesMade++;
          } else if (item.T1 === "しまって" && item.E1 === "동사 'しまう'의 연용형으로, 완료나 후회의 의미를 나타냅니다.") {
            item.E1 = "동사 `しまう`의 연용형(て형)입니다. 보통 동사의 て형에 접속하여 '(무심코) ~해 버리다' (완료, 유감, 후회)의 뉘앙스를 더합니다.";
            changesMade++;
          } else if (item.T1 === "わかっていた" && item.E1 === "'わかる(알다)'의 과거 진행형으로, '알고 있었다'는 의미를 가집니다.") {
            item.E1 = "5단 동사 `分かる(わかる)`의 연용형 `わかっ` + 보조동사 `いる`의 과거형 `いた`가 결합된 형태로, '알고 있었다'는 상태의 지속을 나타냅니다.";
            changesMade++;
          } else if (item.T1 === "って" && line.T0 === "もう会えないとわかっていたって" && item.E1 === "양보를 나타내는 종조사로, '라고 해도'라는 의미를 가집니다.") {
            item.E1 = "구어체에서 인용, 강조, 또는 가정의 의미를 나타내는 조사 `とて`의 축약형입니다. 여기서는 '~라고 알고 있었음에도 불구하고', '~라고 알고 있었지만' 정도의 양보/역접의 의미로 사용되었습니다.";
            changesMade++;
          } else if (item.T1 === "じゃなければ" && item.E1 === "'~가 아니면'이라는 조건을 나타내는 표현입니다. 'ではない'의 구어체 형태인 'じゃない'의 가정형입니다.") {
            item.E1 = "명사 + `ではないか`의 가정형 `でなければ`의 구어체 표현입니다. 'A가 아니면'이라는 의미의 조건절을 만듭니다.";
            changesMade++;
          } else if (item.T1 === "なんだ" && item.E1 === "설명이나 강조를 나타내는 종조사입니다. 'のだ'의 구어체 형태입니다.") {
            item.E1 = "단정의 조동사 `だ`에 강조/설명의 종조사 `のだ`가 결합된 `なのだ`의 구어체 표현입니다. 강한 단정이나 이유 설명을 나타냅니다.";
            changesMade++;
          }
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Successfully updated E1 fields in ${filePath} with ${changesMade} changes.`);
    } else {
      console.log(`No E1 fields needed updates in ${filePath}.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 