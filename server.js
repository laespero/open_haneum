import express from 'express';
import fs from 'fs';
import OpenAI from 'openai'; 
import cors from 'cors';
import path from "path";
import { KR_MSG } from './messages.js';  // MSG import 추가
import { JP_MSG } from './jp_messages.js';
import 'dotenv/config';

console.log('API Key:', process.env.OPENROUTER_API_KEY);

if (!process.env.OPENROUTER_API_KEY) {
    console.warn('\x1b[31m%s\x1b[0m', '⚠️ 경고: OPENROUTER_API_KEY가 설정되지 않았습니다.');
    console.warn('\x1b[33m%s\x1b[0m', '노래 추가 및 번역 기능을 사용하려면 .env 파일에 OPENROUTER_API_KEY를 설정해주세요.');
}

let MSG = KR_MSG;
let lang = "kr";
const input = process.argv[2]; 

if (!input) {
  console.log("한국어 모드");
}
else if(input==="jp"){
    console.log("일본어 모드");
    MSG = JP_MSG;
    lang = "jp";
}
else {
    console.log("한국어 모드");
}

const app = express();
app.use(cors())
// const chatModel = "openrouter/auto";
// const chatModel = "deepseek/deepseek-chat";

const chatModel = "deepseek/deepseek-chat-v3-0324";
//const chatModel = "qwen/qwen3-235b-a22b";

// const chatModel = "google/gemini-2.5-pro-preview-03-25";
// const chatModel = "deepseek-chat";

let openai;
if (process.env.OPENROUTER_API_KEY) {
    openai = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY
    });
} else {
    openai = {
        chat: {
            completions: {
                create: async () => {
                    throw new Error('API 키가 설정되지 않았습니다. .env 파일에 OPENROUTER_API_KEY를 설정해주세요.');
                }
            }
        }
    };
}

// JSON Schema 정의
const lyricJsonSchema = {
    name: "lyric_analysis",  // 스키마 이름 (원하는 것으로 지정 가능)
    strict: true,            // true로 설정 시, 스키마에 정의되지 않은 속성 반환 불가
    schema: {
      type: "object",
      properties: {
        T0: {
          type: "string",
          description: "Lyrics to process"
        },
        C0: {
          type: "string",
          description: "Please translate the surrounding context (CX) into Korean."
        },
        G0: {
          type: "string",
          description: "Please explain the sentence structure of T0 in Korean."
        },
        K0: {
          type: "string",
          description: "Considering the context, please translate T0 into natural Korean."
        },
        I0: {
          type: "string",
          description: "Please transcribe the pronunciation of T0 in IPA."
        },
        R0: {
          type: "string",
          description: "Pronunciation of T0 according to 외래어 표기법."
        },
        LI: {
          type: "array",
          description: "List of morphological units to analyze",
          items: {
            type: "object",
            properties: {
              T1: { type: "string" },
              K1: { type: "string" },
              I1: { type: "string" },
              R1: { type: "string" },
              E1: { type: "string" },
  
              T2: { type: "string" },
              K2: { type: "string" },
              I2: { type: "string" },
              R2: { type: "string" },
  
              XE: { type: "string" },
              XK: { type: "string" },
              XI: { type: "string" },
              XR: { type: "string" }
            },
            required: [
              "T1", "K1", "I1", "R1",
              "E1", "T2", "K2", "I2",
              "R2", "XE", "XK", "XI", "XR"
            ],
            additionalProperties: false
          }
        }
      },
      required: ["T0","C0","G0","K0","I0","R0","LI"],
      additionalProperties: false
    }
  };
  

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// 정적 파일 제공 설정
app.use(express.static('public'));
app.use('/', express.static('songs'));

let songCache = [];  // 노래 데이터를 저장할 캐시

// 캐시 갱신 함수
async function refreshSongCache() {
    try {
        const files = await fs.promises.readdir('songs');
        songCache = await Promise.all(files.map(async file => {
            const filePath = `songs/${file}`;
            const data = await fs.promises.readFile(filePath, 'utf8');
            const stats = await fs.promises.stat(filePath);
            const songData = JSON.parse(data);
            // 파일의 수정 시간을 createdAt으로 사용
            songData.createdAt = stats.mtime.toISOString();
            return songData;
        }));
        console.log(`${songCache.length}개의 노래 데이터를 메모리에 로드했습니다.`);
    } catch (err) {
        console.error('노래 데이터 로드 중 오류 발생:', err);
    }
}

// 서버 시작 시 캐시 로드
refreshSongCache();

app.post('/add', async (req, res) => {
    let { title, ori_name, kor_name, eng_name, vid, artist, text } = req.body;
    let isJapanSong = false;
    let japanData = [];

    try {
        japanData = JSON.parse(text);
        if(japanData[0].jp.length > 0) {
            text = japanData.map(x=>x.jp).join("\n");
            isJapanSong = true;
        }
    }
    catch {}



    let trimedTextArr;
    if(text.includes("<br>")) {
        trimedTextArr = text
            .replace(/\r/g, '')
            .replace(/\n/g, '')
            .split("<br>")
            .map(line => line.trim())
            .filter(x => x !== '');
    }else {    
        trimedTextArr = text
            .replace(/\r/g, '')
            .split("\n")
            .map(line => line.trim())
            .filter(x => x !== '');
    }

    const uniqueLines = [...new Set(trimedTextArr)];

    const songData = {
        name: title,
        ori_name,
        kor_name,
        eng_name,
        vid,
        artist,
        text : text.replaceAll("  "," "),
        createdAt: new Date().toISOString(),
        p1: uniqueLines
    };
    if(isJapanSong) {
        songData.japanSongData = japanData;
    }

    fs.writeFile(`songs/${title}.json`, JSON.stringify(songData, null, 2), async (err) => {
        if (err) {
            console.error(err);
            res.send('노래 저장 중 오류 발생');
        } else {
            await refreshSongCache(); // 캐시 갱신
            res.render('songDetail', { song: songData });
        }
    });
});

app.post('/update', (req, res) => {
    const originalTitle = req.body.originalTitle;
    const title = req.body.title;
    const vid = req.body.vid;
    const text = req.body.text
        .replace(/\r/g, '')
        .split("\n")
        .map(line => line.trim())
        .filter(x => x !== '')
        .join("\n");
    const uniqueLines = [...new Set(text.split('\n'))];

    const songData = {
        name: title,
        text: text,
        vid: vid,
        p1: uniqueLines
    };

    fs.unlink(`songs/${originalTitle}.json`, async (err) => {
        if (err && err.code !== 'ENOENT') {
            console.error(err);
            res.send('노래 업데이트 중 오류 발생');
        } else {
            fs.writeFile(`songs/${title}.json`, JSON.stringify(songData, null, 2), async (err) => {
                if (err) {
                    console.error(err);
                    res.send('노래 저장 중 오류 발생');
                } else {
                    await refreshSongCache(); // 캐시 갱신
                    res.redirect('/songs');
                }
            });
        }
    });
});

app.get('/songs/:title', (req, res) => {
    const title = req.params.title;
    fs.readFile(`songs/${title}.json`, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.send('노래 불러오기 중 오류 발생');
        } else {
            const songData = JSON.parse(data);
            
            // contextText와 translatedLines가 모두 존재하는 경우에만 정렬 시도
            if (songData.contextText && songData.translatedLines) {
                try {
                    // contextText의 순서를 기준으로 translatedLines 정렬
                    const sortedTranslatedLines = songData.contextText
                        .map(context => {
                            // T0 또는 O0와 일치하는 번역된 라인 찾기
                            const translatedLine = songData.translatedLines.find(
                                line => line.T0 === context.T0 || line.O0 === context.T0
                            );
                            return translatedLine || { T0: context.T0, K0: "번역 없음" };
                        })
                        .filter(line => line); // null이나 undefined 제거
                    
                    songData.translatedLines = sortedTranslatedLines;
                } catch (error) {
                    console.error('정렬 중 오류 발생:', error);
                    // 정렬 실패 시 원본 데이터 유지
                }
            }
            
            res.render('lyrics', { song: songData });
        }
    });
});

app.get('/songview/:title', (req, res) => {
    const title = req.params.title;
    fs.readFile(`songs/${title}.json`, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.send('노래 불러오기 중 오류 발생');
        } else {
            const songData = JSON.parse(data);
            res.render('songView', { song: songData, lang: lang });
        }
    });
});

app.get('/songdetail/:title', (req, res) => {
    const title = req.params.title;
    fs.readFile(`songs/${title}.json`, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.send('노래 불러오기 중 오류 발생');
        } else {
            const songData = JSON.parse(data);
            res.render('songDetail', { song: songData });
        }
    });
});

app.get('/songs', (req, res) => {
    const searchQuery = req.query.q || '';
    const filteredSongs = searchQuery ? 
        songCache.filter(song => 
            song.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            song.ori_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            song.kor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            song.artist?.toLowerCase().includes(searchQuery.toLowerCase())
        ) : songCache;

    const sortedSongs = filteredSongs.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
    });

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSongs = sortedSongs.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredSongs.length / limit);

    res.render('search', {
        songs: paginatedSongs,
        currentPage: page,
        totalPages: totalPages,
        searchQuery: searchQuery,
        totalResults: filteredSongs.length
    });
});

app.get('/edit/:title', (req, res) => {
    const title = req.params.title;
    fs.readFile(`songs/${title}.json`, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.send('노래 불러오기 중 오류 발생');
        } else {
            const songData = JSON.parse(data);
            res.render('edit', { song: songData });
        }
    });
});

app.post('/translate/:title', async (req, res) => {
    const title = req.params.title;
    console.log(`시작 : [${title}]`);

    try {
        const data = await fs.promises.readFile(`songs/${title}.json`, 'utf8');
        let songData = JSON.parse(data);

        if (!Array.isArray(songData.p1)) {
            console.error('songData.p1은 배열이어야 합니다:', songData.p1);
            return res.status(400).send('잘못된 노래 데이터 형식');
        }

        const contextText = toContextObj(songData.p1);
        songData.contextText = contextText;

        let parsedTranslatedLines = [];
        let failedLines = [];

        const translationPromises = contextText.map(async (context) => {
            try {
                let alpha = "";
                if(songData.japanSongData){
                    const japanData = songData.japanSongData.find(x=>x.jp===context.T0);
                    alpha += "\n\n";
                    alpha += `한국어 번역 시, 다음 번역을 그대로 사용할 것. "${japanData.kr}"`;
                    if(japanData.jp !== japanData.pr) alpha += `\n한글 발음을 적을 때, 다음을 그대로 사용할 것. "${japanData.pr}"`;
                    console.log(alpha);
                }
                const completion = await openai.chat.completions.create({
                    model: chatModel,
                    max_tokens: 8192,
                    temperature:0.5,
                    messages: [
                        { role: "system", content: MSG },
                        { role: 'user', content: JSON.stringify(context)+alpha },
                    ],
                    response_format: { 
                        type: "json_object" 
                    },
                    provider: {
                        ignore: [
                            'InferenceNet',
                            'Together'
                        ]
                    }
                });

                const translatedLine = completion.choices[0].message.content.replaceAll("```json", "").replaceAll("```", "").trim();
                console.log(translatedLine.substring(0,100));
                const parsedResult = JSON.parse(translatedLine);
                if (parsedResult && parsedResult.K0) {
                    parsedResult.O0 = context.T0;
                    parsedTranslatedLines.push(parsedResult);
                } else {
                    failedLines.push(context);
                }
            } catch (error) {
                console.error('번역 오류:', error);
                failedLines.push(context);
            }
        });

        await Promise.all(translationPromises);

        songData.translatedLines = parsedTranslatedLines;
        songData.failedLines = failedLines;

        await fs.promises.writeFile(`songs/${title}.json`, JSON.stringify(songData, null, 2));
        console.log(`끝 : [${title}]`);

        res.render('songDetail', { song: songData });
    } catch (error) {
        console.error('번역 오류:', error);
        res.send('번역 중 오류 발생');
    }
});

app.get('/makebatch/:title', async (req, res) => {
    const title = req.params.title;

    try {
        const data = await fs.promises.readFile(`songs/${title}.json`, 'utf8');
        let songData = JSON.parse(data);
        const contextText = toContextObj(songData.p1);
        songData.contextText = contextText;
        const batchObj = (id,body) => ({"custom_id": id, "method": "POST", "url": "/v1/chat/completions", "body": body});

        const batchJoin = contextText.map((context, idx) => {
            const body = {
                model: chatModel,
                messages: [
                    { role: "system", content: MSG },
                    { role: 'user', content: JSON.stringify(context) },
                ],   
                response_format: { type: "json_object" }
            };
            return JSON.stringify(batchObj("jamin"+idx, body));
        }).join("\n");

        await fs.promises.writeFile(`batchs/${title}.jsonl`, batchJoin);
        console.log('배치 완료');
        res.render('songDetail', { song: songData });
    } catch (error) {
        console.error('배치 생성 오류:', error);
        res.send('배치 생성 중 오류 발생');
    }
});

app.post('/retry-translation/:title', async (req, res) => {
    const title = req.params.title;

    try {
        const data = await fs.promises.readFile(`songs/${title}.json`, 'utf8');
        let songData = JSON.parse(data);

        if (!Array.isArray(songData.failedLines) || songData.failedLines.length === 0) {
            return res.send('실패한 번역 없음');
        }

        let parsedTranslatedLines = songData.translatedLines || [];
        let failedLines = [];

        const translationPromises = songData.failedLines.map(async (context) => {
            try {
                const completion = await openai.chat.completions.create({
                    model: chatModel,
                    max_tokens: 8192,
                    messages: [
                        { role: "system", content: MSG },
                        { role: 'user', content: JSON.stringify(context) },
                    ],
                    response_format: { 
                        type: "json_object" 
                    },
                    provider: {
                        ignore: [
                            'InferenceNet'
                        ]
                    }
                });

                const translatedLine = completion.choices[0].message.content.replaceAll("```json", "").replaceAll("```", "").trim();
                const parsedResult = JSON.parse(translatedLine);
                if (parsedResult && parsedResult.K0) {
                    parsedResult.O0 = context.T0;
                    parsedTranslatedLines.push(parsedResult);
                } else {
                    failedLines.push(context);
                }
            } catch (error) {
                console.error('재번역 오류:', error);
                failedLines.push(context);
            }
        });

        await Promise.all(translationPromises);

        songData.translatedLines = parsedTranslatedLines;
        songData.failedLines = failedLines;

        await fs.promises.writeFile(`songs/${title}.json`, JSON.stringify(songData, null, 2));
        res.render('songDetail', { song: songData });
    } catch (error) {
        console.error('재번역 오류:', error);
        res.send('재번역 중 오류 발생');
    }
});

app.post('/retry-line/:title', async (req, res) => {
    const title = req.params.title;
    const data = await fs.promises.readFile(`songs/${title}.json`, 'utf8');
    let songData = JSON.parse(data);
    
    const thatLine = songData.contextText.find(x=>x.T0 === req.body.originalLine);

    if (!thatLine) {
        return res.status(400).send('원본 가사 없음');
    }

    try {
        const completion = await openai.chat.completions.create({
            model: chatModel,
            max_tokens: 8192,
            temperature: 0.2,
            messages: [
                { role: "system", content: MSG },
                { role: 'user', content: JSON.stringify(thatLine) },
            ],
            response_format: { type: "json_object" },
            provider: {
                ignore: [
                    'InferenceNet'
                ]
            }
        });

        const translatedLine = completion.choices[0].message.content.replaceAll("```json", "").replaceAll("```", "").trim();
        const parsedResult = JSON.parse(translatedLine);
        const foundIdx = songData.translatedLines.findIndex(t=>t.T0===req.body.originalLine);   
        
        if(foundIdx===-1){
            songData.translatedLines.push(parsedResult);
        }
        else{
            songData.translatedLines[foundIdx] = parsedResult;
        }
        songData.failedLines = songData.failedLines.filter(x=> !songData.translatedLines.some(y => y.T0 === x.T0));

        await fs.promises.writeFile(`songs/${title}.json`, JSON.stringify(songData, null, 2));
        res.redirect(`/songs/${title}`);
    } catch (error) {
        console.error('특정 라인 재번역 오류:', error);
        res.status(500).send('특정 라인 재번역 중 오류 발생');
    }
});

app.post('/correct-hangul/:title', async (req, res) => {
    const title = req.params.title;
    const data = await fs.promises.readFile(`songs/${title}.json`, 'utf8');
    let songData = JSON.parse(data);
    
    const thatLine = songData.translatedLines.find(x=>x.T0 === req.body.originalLine);

    if (!thatLine) {
        return res.status(400).send('원본 가사 없음');
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-001",
            max_tokens: 8192,
            temperature: 0,
            messages: [
                { role: "system", content: "다음 JSON에서 만약 틀린 점이 있다면 수정하세요. 출력 형식은 입력의 형식과 같은 JSON입니다." },
                { role: 'user', content: JSON.stringify(thatLine) },
            ],
            response_format: { type: "json_object" }
        });

        console.log(completion.choices[0].message.content.substring(0,1000));
        const translatedLine = completion.choices[0].message.content.replaceAll("```json", "").replaceAll("```", "").trim();
        const parsedResult = JSON.parse(translatedLine);

        const foundIdx = songData.translatedLines.findIndex(t=>t.T0===req.body.originalLine);   
        
        if(foundIdx===-1){
            //songData.translatedLines.push(parsedResult);
        }
        else{
            songData.translatedLines[foundIdx] = parsedResult;
        }
        //songData.failedLines = songData.failedLines.filter(x=> !songData.translatedLines.some(y => y.T0 === x.T0));

        await fs.promises.writeFile(`songs/${title}.json`, JSON.stringify(songData, null, 2));
        res.redirect(`/songs/${title}`);
    } catch (error) {
        console.error('특정 라인 한글 정정 오류:', error);
        res.status(500).send('특정 라인 한글 정정 중 오류 발생');
    }
});

app.post('/correct-with-message/:title', async (req, res) => {
    const title = req.params.title;
    const data = await fs.promises.readFile(`songs/${title}.json`, 'utf8');
    let songData = JSON.parse(data);
    
    console.log(req.body.originalLine);
    const thatLine = songData.contextText.find(x=>x.T0?.trim() === req.body.originalLine?.trim() || x.O0?.trim() === req.body.originalLine?.trim());

    if (!thatLine) {
        return res.status(400).send('원본 가사 없음');
    }

    try {
        const completion = await openai.chat.completions.create({
            model: 'openai/gpt-4.1',
            max_tokens: 8192,
            temperature: 0.2,
            messages: [
                { role: "system", content: MSG },
                { role: 'user', content: JSON.stringify(thatLine) + "\n\n" + req.body.correctionMessage },
            ],
            response_format: { type: "json_object" },
            provider: {
                ignore: [
                    'InferenceNet'
                ]
            }
        });

        const translatedLine = completion.choices[0].message.content.replaceAll("```json", "").replaceAll("```", "").trim();
        const parsedResult = JSON.parse(translatedLine);
        parsedResult.O0 = thatLine.T0;
        const foundIdx = songData.translatedLines.findIndex(t=>t.T0===req.body.originalLine||t.O0===parsedResult.O0);   
        
        if(foundIdx===-1){
            songData.translatedLines.push(parsedResult);
        }
        else{
            songData.translatedLines[foundIdx] = parsedResult;
        }
        songData.failedLines = songData.failedLines.filter(x=> !songData.translatedLines.some(y => y.T0 === x.T0));

        await fs.promises.writeFile(`songs/${title}.json`, JSON.stringify(songData, null, 2));
        res.redirect(`/songs/${title}`);
    } catch (error) {
        console.error('특정 라인 재번역 오류:', error);
        res.status(500).send('특정 라인 재번역 중 오류 발생');
    }

});

app.post('/correct-every-hangul/:title', async (req, res) => {
    const title = req.params.title;
    console.log(`정정 시작 : [${title}]`);

    try {
        const data = await fs.promises.readFile(`songs/${title}.json`, 'utf8');
        let songData = JSON.parse(data);    

        const translationPromises = songData.translatedLines.map(async (context) => {
            try {
                const completion = await openai.chat.completions.create({
                    model: "google/gemini-2.0-flash-001",
                    max_tokens: 8192,
                    temperature:0.2,
                    messages: [
                        { role: "system", content: `다음 JSON의 "R0","R1","R2","XR" 항목에 적힌 한글 발음 표기가 틀린 것을 수정하세요. 출력 형식은 입력의 형식과 같은 JSON입니다.` },
                        { role: 'user', content: JSON.stringify(context) },
                    ],
                    response_format: { 
                        type: "json_object" 
                    }
                });

                const translatedLine = completion.choices[0].message.content.replaceAll("```json", "").replaceAll("```", "").trim();
                console.log(translatedLine.substring(0,100));
                const parsedResult = JSON.parse(translatedLine);

                const foundIdx = songData.translatedLines.findIndex(t=>t.T0===context.T0);   
        
                if(foundIdx!==-1){
                    songData.translatedLines[foundIdx] = parsedResult;
                }

            } catch (error) {
                console.error('정정 오류:', error);
            }
        });

        await Promise.all(translationPromises);

        await fs.promises.writeFile(`songs/${title}.json`, JSON.stringify(songData, null, 2));
        console.log(`정정 끝 : [${title}]`);

        res.render('songDetail', { song: songData });
    } catch (error) {
        console.error('정정 오류:', error);
        res.send('정정 중 오류 발생');
    }
});

app.get('/api/songs/:title/translated', async (req, res) => {
    const title = req.params.title;

    try {
        const data = await fs.promises.readFile(`songs/${title}.json`, 'utf8');
        let songData = JSON.parse(data);

        if (Array.isArray(songData.translatedLines) && songData.translatedLines.length > 0) {
            const toExData = t0 => ({
                "T0": t0,
                "K0": "데이터 없음",
                "R0": "",
                "LI": []
            });

            const trimedTextArr = songData.text
                .replace(/\r/g, '')
                .split("\n")
                .map(line => line.trim())
                .filter(x => x !== '');
            
            const result = trimedTextArr.map(x=> {
                const found = songData.translatedLines.find(y => y.T0.trim().toLowerCase() === x.trim().toLowerCase());
                if(found) {
                    return found;
                }
                else {
                    return toExData(x);
                }
            });
            songData.translatedLines = result;
        
            res.json({
                title: songData.name,
                translatedLines: result
            });
        } else {
            res.status(404).json({
                error: '번역된 가사 없음'
            });
        }
    } catch (error) {
        console.error('API 오류:', error);
        res.status(500).json({
            error: '서버 오류'
        });
    }
});

app.get('/api/songs/:title/finetune', async (req, res) => {
    const title = req.params.title;

    try {
        const data = await fs.promises.readFile(`songs/${title}.json`, 'utf8');
        let songData = JSON.parse(data);

        if (Array.isArray(songData.translatedLines) && songData.translatedLines.length > 0) {
            const a = songData.contextText;
            const b = songData.translatedLines;
            const c = a.filter(x=>b.find(y=>y.T0==x.T0)).map(x=>({context:x, result:b.find(y=>y.T0==x.T0)}));
            const gen = (A, B, C) => ({"messages": [{"role": "system", "content": A}, {"role": "user", "content": B}, {"role": "assistant", "content": C }]});

            res.json(c.map(o=>gen(MSG, JSON.stringify(o.context), JSON.stringify(o.result))).map(o=>JSON.stringify(o)));
        } else {
            res.status(404).json({
                error: '번역된 가사 없음'
            });
        }
    } catch (error) {
        console.error('API 오류:', error);
        res.status(500).json({
            error: '서버 오류'
        });
    }
});

app.post('/auto-fill-names', async (req, res) => {
    const oriName = req.body.ori_name;
    
    try {
        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-001",
            messages: [
                {
                    role: "system",
                    content: `Given a song title in its original language, provide the Korean and English translations. Respond in JSON format: {"kor_name": "Korean translation", "eng_name": "English translation"}`
                },
                {
                    role: "user",
                    content: `Original title: ${oriName}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content.replaceAll("```json", "").replaceAll("```", "").trim());
        res.json({
            kor_name: result.kor_name,
            eng_name: result.eng_name
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate names' });
    }
});

function toContextObj(sentences) {
    if (!Array.isArray(sentences)) {
        console.error('toContextObj: sentences는 배열이어야 합니다.', sentences);
        return [];
    }

    let result = [];
    for (let i = 0; i < sentences.length; i++) {
        let sentence = sentences[i];
        let startIndex = Math.max(0, i - 1);
        let endIndex = Math.min(sentences.length, i + 2);
        let contextSentences = sentences.slice(startIndex, endIndex);
        let context = contextSentences.join(' ');
        result.push({ T0: sentence, C0: context });
    }
    return result;
}

// 루트 경로 라우트
app.get('/', (req, res) => {
    // 최근 추가된 노래 20개를 가져옵니다
    const latestSongs = songCache
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 20);

    res.render('landing', {
        latestSongs
    });
});

app.get('/add-song', (req, res) => {
    res.render('addSong');
});

app.get('/api/search', (req, res) => {
    const query = decodeURIComponent(req.query.q).toLowerCase();
    const page = parseInt(req.query.page) || 1;
    const limit = 30;
    
    try {
        const allResults = songCache.filter(song => {
            const searchFields = [
                song.name?.toLowerCase(),
                song.ori_name?.toLowerCase(),
                song.kor_name?.toLowerCase(),
                song.eng_name?.toLowerCase(),
                song.artist?.toLowerCase()
            ].filter(Boolean);

            return searchFields.some(field => field.includes(query));
        });

        const totalPages = Math.ceil(allResults.length / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const results = allResults.slice(startIndex, endIndex);
        
        res.json({
            results,
            currentPage: page,
            totalPages
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Failed to search songs' });
    }
});

app.get('/songs/:name', async (req, res) => {
    const songName = decodeURIComponent(req.params.name);
    const searchQuery = req.query.q || '';

    console.log('Request URL:', req.originalUrl);
    console.log('Extracted searchQuery:', searchQuery);

    try {
        const data = await fs.promises.readFile(`songs/${songName}.json`, 'utf8');
        const songData = JSON.parse(data);

        console.log('Rendering songView with:', { song: songData, searchQuery });

        res.render('songView', {
            song: songData,
            searchQuery: searchQuery,
            lang: lang
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(404).send('Song not found');
    }
});

app.listen(3000, () => {
    console.log('서버 시작: http://localhost:3000');
}); 