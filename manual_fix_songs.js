
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const songsDir = path.join(__dirname, 'songs');

function manualFix() {
    console.log('Applying manual fixes...');

    const fixes = [
        {
            file: 'BlueHearts_Image.json',
            index: 16,
            // p1[28]
            newO0: '<span class="ruby"><span class="rb">針</span><span class="rt">はり</span></span>が<span class="ruby"><span class="rb">棒</span><span class="rt">ぼう</span></span>になり <span class="ruby"><span class="rb">隣</span><span class="rt">となり</span></span>の<span class="ruby"><span class="rb">芝生</span><span class="rt">しばふ</span></span><span class="ruby"><span class="rb">今日</span><span class="rt">きょう</span></span>も<span class="ruby"><span class="rb">青</span><span class="rt">あお</span></span>い'
        },
        {
            file: 'GreenApple_Que_Sera_Sera.json',
            index: 40,
            // p1[52]
            newO0: '<span class="ruby"><span class="rb">何</span><span class="rt">なに</span></span>のせい?<span class="ruby"><span class="rb">誰</span><span class="rt">だれ</span></span>のせい?'
        },
        {
            file: 'GreenApple_Whales_Song.json',
            index: 21,
            // p1[28]
            newO0: '<span class="ruby"><span class="rb">怖</span><span class="rt">こわ</span></span>がらないで <span class="ruby"><span class="rb">貴方</span><span class="rt">あなた</span></span>は<span class=\"ruby\"><span class=\"rb\">貴方</span><span class=\"rt\">あなた</span></span>の'
        },
        {
            file: 'Mrs_GREEN_APPLE_Dancehall_Official_Music_Video.json',
            index: 5,
            // p1[12] or p1[0] depending on index mapping, but value is clear
            newO0: 'いつだって大丈夫だいじょうぶ'
        },
        {
            file: 'Mrs_GREEN_APPLE_Dancehall_Official_Music_Video.json',
            index: 11,
            // Splitting combined line, matching p1[13]
            newO0: 'この世界せかいはダンスホール'
        },
        {
            file: 'Zig_Blaming_The_Lonely_Summer.json',
            index: 9,
            // p1[24]
            newO0: '"本心じゃなくても'
        },
        {
            file: 'deep_twilight.json',
            index: 36,
            // p1[67]
            newO0: 'TWILIGHT!!!-TWILIGHT!!!-TWILIGHT!!!-'
        },
        {
            file: 'deep_twilight.json',
            index: 43,
            // p1[71]
            newO0: '<span class="ruby"><span class="rb">刹那</span><span class="rt">せつな</span></span>、<span class="ruby"><span class="rb">春夏秋冬</span><span class="rt">ひととせ</span></span>よ TWILIGHT!!!'
        },
        {
            file: 'yoasobi_Idol.json',
            index: 70,
            // p1[51]
            newO0: '知（し）り得（え）ない。'
        },
        {
            file: 'yoasobi_Idol.json',
            index: 125,
            // p1[57]
            newO0: '君（きみ）は完璧（かんぺき）。'
        },
        {
            file: 'yorushika.json',
            index: 25,
            // p1[56]
            newO0: '記憶(きおく)に夏野(なつの)の石(いし)一(ひと)つ。'
        }
    ];

    fixes.forEach(fix => {
        const filePath = path.join(songsDir, fix.file);
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            let song = JSON.parse(data);

            if (song.translatedLines && song.translatedLines[fix.index]) {
                const oldVal = song.translatedLines[fix.index].O0;
                song.translatedLines[fix.index].O0 = fix.newO0;
                
                // Mrs_GREEN_APPLE_Dancehall의 경우 T0도 수정하는 것이 좋음 (내용 일치 위해)
                if (fix.file === 'Mrs_GREEN_APPLE_Dancehall_Official_Music_Video.json' && fix.index === 11) {
                     song.translatedLines[fix.index].T0 = fix.newO0;
                }

                fs.writeFileSync(filePath, JSON.stringify(song, null, 2), 'utf8');
                console.log(`[FIXED] ${fix.file} (Index: ${fix.index})`);
                console.log(`  Old: ${oldVal}`);
                console.log(`  New: ${fix.newO0}`);
            } else {
                console.error(`[ERROR] Could not find translatedLines[${fix.index}] in ${fix.file}`);
            }

        } catch (err) {
            console.error(`Error processing file ${fix.file}:`, err.message);
        }
    });

    console.log('\nManual fixes applied.');
}

manualFix();
