const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'Farewell_is_the_Only_Life.json');

const rubyLyrics = `さよならだけが人生(じんせい)だという
誰(だれ)が言(い)ったか忘(わす)れたけれど
間違(まちが)いではないような気(き)がして
振(ふ)り返(かえ)り 立(た)ち止(ど)まるの
出会(であ)いがあれば 別(わか)れがあると
誰(だれ)が言(い)ったか忘(わす)れたけれど
それじゃ何(なに)もはじめられないだろう
なぜ生(う)まれてきたのか わからないなぁ
まるで僕(ぼく)は 作(つく)り物(もの)で構(かま)わない
でも転(ころ)んだら 血(ち)が流(なが)れるんだよ
どうかお願(ねが)いだ 見(み)せてくれないか
君(きみ)が愛(あい)したものをすべて
どうかお願(ねが)いだ 見(み)せてくれないか
君(きみ)が恐(おそ)れるものを
どんな時(とき)でも そばにいさせて
この悲(かな)しみが汚(よご)れてるなら
きれいな雪(ゆき)が降(ふ)り積(つ)もるという
当(あ)たり前(まえ)のように 生(い)きてたけど
気(き)づいたら 埋(う)もれてしまいそうだ
たとえどんな風(かぜ)が吹(ふ)けど変(か)わらない
この想(おも)いは 変(か)えられはしないからさ
ひとは誰(だれ)でも孤独(こどく)だという
実(じつ)は僕(ぼく)もそう思(おも)うんだ
君(きみ)の孤独(こどく)も僕(ぼく)の孤独(こどく)も
消(け)すことはできない
でも分(わ)かち合(あ)えるだろう
どうかお願(ねが)いだ見(み)せてくれないか
血(ち)を流(なが)してる君(きみ)の心(こころ)
どうかお願(ねが)いだ見(み)せてくれないか
汚(よご)れたままの過(す)ぎた時間(じかん)も
どうかお願(ねが)いだ見(み)せてくれないか
君(きみ)が愛(あい)したものをすべて
どうかお願(ねが)いだ見(み)せてくれないか
君(きみ)が抱(かか)えるものを
どんな君(きみ)でも そばにいさせて`;

// Function to convert text like "漢字(かんじ)" to HTML ruby spans
function convertToHtmlRuby(text) {
    // Regex to find kanji followed by furigana in parentheses
    const rubyRegex = /([\u4e00-\u9faf\u3040-\u309f\u30a0-\u30ff]+?)\(([\u3040-\u309f]+)\)/g;
    return text.replace(rubyRegex, (match, kanji, furigana) => {
        return `<span class="ruby"><span class="rb">${kanji}</span><span class="rt">${furigana}</span></span>`;
    });
}

try {
    let rawData = fs.readFileSync(filePath, 'utf-8');
    let data = JSON.parse(rawData);

    // Convert the lyrics to the correct HTML format
    const htmlFormattedLyrics = convertToHtmlRuby(rubyLyrics);
    const finalRubyData = htmlFormattedLyrics.replace(/\n/g, '<br>');

    // Remove the old, incorrect rubyData if it exists
    delete data.rubyData;

    // Create a new object to ensure the correct order of keys
    const newData = {};
    for (const key in data) {
        // Add the new rubyData right before translatedLines
        if (key === 'translatedLines') {
            newData.rubyData = finalRubyData;
        }
        newData[key] = data[key];
    }
    
    // If the file didn't have translatedLines for some reason, add rubyData at the end
    if (!('rubyData' in newData)) {
        newData.rubyData = finalRubyData;
    }

    fs.writeFileSync(filePath, JSON.stringify(newData, null, 2), 'utf-8');
    console.log(`Successfully updated rubyData in ${filePath} with the correct HTML format.`);

} catch (error) {
    console.error('Error processing the file:', error);
} 