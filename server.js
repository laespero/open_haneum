import express from 'express';
import fs from 'fs';
import OpenAI from 'openai'; 
import cors from 'cors';
import path from "path";
import { KR_MSG } from './messages.js';  // MSG import 추가
import { JP_MSG } from './jp_messages.js';
import 'dotenv/config';
import 'express-async-errors'; // express-async-errors 임포트

// 처리되지 않은 프로미스 거부(rejection)를 처리
process.on('unhandledRejection', (reason, promise) => {
    console.error('====================================');
    console.error('처리되지 않은 프로미스 거부:', reason);
    console.error('====================================');
    // 애플리케이션을 종료하고, PM2와 같은 프로세스 관리자가 재시작하도록 하는 것이 안전합니다.
    process.exit(1); 
});

// 예기치 않은 예외(exception)를 처리
process.on('uncaughtException', (err) => {
    console.error('====================================');
    console.error('예기치 않은 예외:', err);
    console.error('====================================');
    // 예외 발생 후에는 애플리케이션 상태를 신뢰할 수 없으므로 종료하는 것이 가장 안전합니다.
    process.exit(1);
});

// 사용자가 API 제공자를 선택할 수 있는 변수
// 'deepseek', 'openrouter', 또는 'auto' (기본값) 중 하나로 설정하세요.
const API_PROVIDER_CHOICE = 'openrouter'; 

console.log('OPENROUTER API Key:', process.env.OPENROUTER_API_KEY);
console.log('DeepSeek API Key:', process.env.DEEPSEEK_API_KEY);

if (!process.env.OPENROUTER_API_KEY && !process.env.DEEPSEEK_API_KEY) {
    console.warn('\x1b[31m%s\x1b[0m', '⚠️ 경고: OPENROUTER_API_KEY 또는 DEEPSEEK_API_KEY가 설정되지 않았습니다.');
    console.warn('\x1b[33m%s\x1b[0m', '노래 추가 및 번역 기능을 사용하려면 .env 파일에 OPENROUTER_API_KEY 또는 DEEPSEEK_API_KEY를 설정해주세요.');
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

let chatModel;
//const chatModel = "deepseek/deepseek-chat-v3-0324";
//chatModel = "deepseek/deepseek-chat";

// const chatModel = "openrouter/auto";
// const chatModel = "google/gemini-2.5-pro-preview-03-25";
// const chatModel = "deepseek-chat";

let openai;
let initializationLog = "";
let isUsingDeepSeekDirectly = false; // DeepSeek 직접 사용 여부 플래그

if (API_PROVIDER_CHOICE === 'deepseek') {
    if (process.env.DEEPSEEK_API_KEY) {
        initializationLog = "설정(API_PROVIDER_CHOICE='deepseek')에 따라 DeepSeek API를 사용합니다.";
        openai = new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: process.env.DEEPSEEK_API_KEY
        });
        chatModel = "deepseek-chat";
        isUsingDeepSeekDirectly = true;
    } else {
        initializationLog = "⚠️ 경고: API_PROVIDER_CHOICE='deepseek'으로 설정되었으나 DEEPSEEK_API_KEY가 없습니다. API 기능이 제한됩니다.";
    }
} else if (API_PROVIDER_CHOICE === 'openrouter') {
    if (process.env.OPENROUTER_API_KEY) {
        initializationLog = "설정(API_PROVIDER_CHOICE='openrouter')에 따라 OpenRouter API를 사용합니다.";
        openai = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: process.env.OPENROUTER_API_KEY
        });
        chatModel = "deepseek/deepseek-chat";
        isUsingDeepSeekDirectly = false;
    } else {
        initializationLog = "⚠️ 경고: API_PROVIDER_CHOICE='openrouter'으로 설정되었으나 OPENROUTER_API_KEY가 없습니다. API 기능이 제한됩니다.";
    }
} else { // 'auto' 또는 다른 값일 경우 자동 선택 로직
    if (API_PROVIDER_CHOICE !== 'auto') {
        console.log(`알 수 없는 API_PROVIDER_CHOICE 값 ('${API_PROVIDER_CHOICE}') 입니다. 자동 선택 모드로 동작합니다.`);
    }
    initializationLog = "자동 선택 모드: ";
    if (process.env.DEEPSEEK_API_KEY) {
        initializationLog += "DeepSeek API를 사용합니다.";
        openai = new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: process.env.DEEPSEEK_API_KEY
        });
        chatModel = "deepseek-chat";
        isUsingDeepSeekDirectly = true;
    } else if (process.env.OPENROUTER_API_KEY) {
        initializationLog += "OpenRouter API를 사용합니다 (DeepSeek 키 부재).";
        openai = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: process.env.OPENROUTER_API_KEY
        });
        chatModel = "deepseek/deepseek-chat";
        isUsingDeepSeekDirectly = false;
    } else {
        initializationLog += "⚠️ 경고: 사용 가능한 API 키가 없습니다. .env 파일에 키를 설정해주세요. API 기능이 제한됩니다.";
        isUsingDeepSeekDirectly = false; // 추가: API 사용 불가 시 false
    }
}

if (!openai || !openai.chat) { // openai 객체가 제대로 초기화되지 않은 경우
    openai = {
        chat: {
            completions: {
                create: async () => {
                    throw new Error(`API 클라이언트가 초기화되지 않았습니다. 원인: ${initializationLog}`);
                }
            }
        }
    };
}
console.log(initializationLog);

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
        const songPromises = files.map(async file => {
            const filePath = `songs/${file}`;
            try {
                const data = await fs.promises.readFile(filePath, 'utf8');
                const songData = JSON.parse(data);
                return songData;
            } catch (parseErr) {
                console.error(`'${filePath}' 파일 처리 중 오류 발생:`, parseErr);
                return null; // 오류 발생 시 null 반환
            }
        });
        songCache = (await Promise.all(songPromises)).filter(song => song !== null); // null이 아닌 것만 필터링
        console.log(`${songCache.length}개의 노래 데이터를 메모리에 로드했습니다.`);
    } catch (err) {
        console.error('노래 데이터 로드 중 오류 발생:', err);
    }
}

// 서버 시작 시 캐시 로드
refreshSongCache();

app.post('/add', async (req, res) => {
    let { title, ori_name, kor_name, eng_name, vid, artist_ori_name, artist_kor_name, artist_eng_name, text, tags } = req.body;
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

    // Process tags: split string by comma, trim whitespace, and remove empty tags
    const processedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    const artist = {
        ori_name: artist_ori_name,
        kor_name: artist_kor_name || '',
        eng_name: artist_eng_name || ''
    };

    const songData = {
        name: title,
        ori_name,
        kor_name,
        eng_name,
        vid,
        artist,
        tags: processedTags,
        text : text.replaceAll("  "," "),
        createdAt: new Date().toISOString(),
        p1: uniqueLines
    };
    if(isJapanSong) {
        songData.japanSongData = japanData;
    }

    await fs.promises.writeFile(`songs/${title}.json`, JSON.stringify(songData, null, 2));
    
    // 캐시를 효율적으로 업데이트 (전체 리프레시 대신)
    const existingSongIndex = songCache.findIndex(song => song.name === title);
    if (existingSongIndex > -1) {
        songCache[existingSongIndex] = songData;
    } else {
        songCache.unshift(songData); // 새 노래를 맨 앞에 추가
    }
    console.log(`메모리 캐시를 효율적으로 업데이트했습니다: ${title}`);

    res.render('songDetail', { song: songData });
});

app.post('/update-song-meta/:title', async (req, res) => {
    const { title } = req.params;
    const { artist_ori_name, artist_kor_name, artist_eng_name, vid, ori_name, kor_name, eng_name, tags } = req.body;

    const filePath = `songs/${title}.json`;

    const data = await fs.promises.readFile(filePath, 'utf8');
    const songData = JSON.parse(data);

    // Update artist field
    if (artist_ori_name !== undefined) {
        songData.artist = {
            ori_name: artist_ori_name,
            kor_name: artist_kor_name || '',
            eng_name: artist_eng_name || ''
        };
    }

    // Update other fields
    if (vid !== undefined) songData.vid = vid;
    if (ori_name !== undefined) songData.ori_name = ori_name;
    if (kor_name !== undefined) songData.kor_name = kor_name;
    if (eng_name !== undefined) songData.eng_name = eng_name;
    if (tags !== undefined) {
        songData.tags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    }
    
    await fs.promises.writeFile(filePath, JSON.stringify(songData, null, 2));
    
    // 캐시를 효율적으로 업데이트 (전체 리프레시 대신)
    const songIndex = songCache.findIndex(song => song.name === title);
    if (songIndex > -1) {
        songCache[songIndex] = { ...songCache[songIndex], ...songData };
        console.log(`메모리 캐시를 효율적으로 업데이트했습니다: ${title}`);
    } else {
        // 만약 캐시에 없다면 (이론상 발생하기 어려움), 전체 리프레시로 안전하게 처리
        await refreshSongCache();
        console.log(`캐시에 없는 노래(${title})가 업데이트되어 전체 캐시를 갱신합니다.`);
    }
    
    res.redirect(`/songdetail/${title}`);
});

app.get('/songs/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const data = await fs.promises.readFile(`songs/${title}.json`, 'utf8');
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
    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.redirect('/');
        }
        throw error; // 그 외 다른 에러는 전역 에러 핸들러로 전달
    }
});

app.get('/songview/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const data = await fs.promises.readFile(`songs/${title}.json`, 'utf8');
        const songData = JSON.parse(data);
        res.render('songView', { song: songData, lang: lang });
    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.redirect('/');
        }
        throw error;
    }
});

app.get('/songdetail/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const data = await fs.promises.readFile(`songs/${title}.json`, 'utf8');
        const songData = JSON.parse(data);
        res.render('songDetail', { song: songData });
    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.redirect('/');
        }
        throw error;
    }
});

app.get('/songs', (req, res) => {
    const searchQuery = req.query.q || '';
    const lowerCaseQuery = searchQuery.toLowerCase();

    // "개발용" 태그가 있는 노래를 제외한 리스트를 먼저 만듭니다.
    let filteredSongs = songCache.filter(song => !song.tags || !song.tags.includes('개발용'));

    // 검색어가 있는 경우 추가로 필터링합니다.
    if (searchQuery) {
        filteredSongs = filteredSongs.filter(song => {
            const artistMatch = typeof song.artist === 'object' 
                ? song.artist.ori_name?.toLowerCase().includes(lowerCaseQuery) || song.artist.kor_name?.toLowerCase().includes(lowerCaseQuery) || song.artist.eng_name?.toLowerCase().includes(lowerCaseQuery)
                : song.artist?.toLowerCase().includes(lowerCaseQuery);

            return song.name?.toLowerCase().includes(lowerCaseQuery) ||
                song.ori_name?.toLowerCase().includes(lowerCaseQuery) ||
                song.kor_name?.toLowerCase().includes(lowerCaseQuery) ||
                artistMatch ||
                (song.tags && song.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery)));
        });
    }

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

app.get('/edit/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const data = await fs.promises.readFile(`songs/${title}.json`, 'utf8');
        const songData = JSON.parse(data);
        res.render('edit', { song: songData });
    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.redirect('/');
        }
        throw error;
    }
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

                const requestBody = {
                    model: isUsingDeepSeekDirectly ? "deepseek-chat" : chatModel,
                    max_tokens: 8192,
                    temperature:0.5,
                    messages: [
                        { role: "system", content: MSG },
                        { role: 'user', content: JSON.stringify(context)+alpha },
                    ],
                    response_format: { 
                        type: "json_object" 
                    }
                };

                if (!isUsingDeepSeekDirectly) {
                    requestBody.provider = {
                        ignore: [
                            'InferenceNet',
                            'Together'
                        ]
                    };
                }

                const completion = await openai.chat.completions.create(requestBody);

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
                const requestBody = {
                    model: isUsingDeepSeekDirectly ? "deepseek-chat" : chatModel,
                    max_tokens: 8192,
                    messages: [
                        { role: "system", content: MSG },
                        { role: 'user', content: JSON.stringify(context) },
                    ],
                    response_format: { 
                        type: "json_object" 
                    }
                };

                if (!isUsingDeepSeekDirectly) {
                    requestBody.provider = {
                        ignore: [
                            'InferenceNet'
                        ]
                    };
                }

                const completion = await openai.chat.completions.create(requestBody);

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
        const requestBody = {
            model: isUsingDeepSeekDirectly ? "deepseek-chat" : chatModel,
            max_tokens: 8192,
            temperature: 0.2,
            messages: [
                { role: "system", content: MSG },
                { role: 'user', content: JSON.stringify(thatLine) },
            ],
            response_format: { type: "json_object" }
        };

        if (!isUsingDeepSeekDirectly) {
            requestBody.provider = {
                ignore: [
                    'InferenceNet'
                ]
            };
        }
        const completion = await openai.chat.completions.create(requestBody);

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
        res.redirect('back');
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
            model: isUsingDeepSeekDirectly ? "deepseek-chat" : "google/gemini-2.0-flash-001",
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
        res.redirect('back');
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
        const requestBody = {
            model: isUsingDeepSeekDirectly ? "deepseek-chat" : 'openai/gpt-4o',
            max_tokens: 8192,
            temperature: 0.2,
            messages: [
                { role: "system", content: MSG },
                { role: 'user', content: JSON.stringify(thatLine) + "\n\n" + req.body.correctionMessage },
            ],
            response_format: { type: "json_object" }
        };

        if (!isUsingDeepSeekDirectly) {
            requestBody.provider = {
                ignore: [
                    'InferenceNet'
                ]
            };
        }

        const completion = await openai.chat.completions.create(requestBody);

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
        res.redirect('back');
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
                    model: isUsingDeepSeekDirectly ? "deepseek-chat" : "google/gemini-2.0-flash-001",
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

        res.redirect('back');
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
            model: isUsingDeepSeekDirectly ? "deepseek-chat" : "google/gemini-2.0-flash-001",
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
        .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB - dateA;
        })
        .slice(0, 24);

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
            // "개발용" 태그가 있는 노래는 결과에서 제외합니다.
            if (song.tags && song.tags.includes('개발용')) {
                return false;
            }

            const searchFields = [
                song.name?.toLowerCase(),
                song.ori_name?.toLowerCase(),
                song.kor_name?.toLowerCase(),
                song.eng_name?.toLowerCase(),
            ].filter(Boolean);

            if (typeof song.artist === 'object') {
                searchFields.push(song.artist.ori_name?.toLowerCase());
                searchFields.push(song.artist.kor_name?.toLowerCase());
                searchFields.push(song.artist.eng_name?.toLowerCase());
            } else {
                searchFields.push(song.artist?.toLowerCase());
            }

            const hasTagMatch = song.tags && song.tags.some(tag => tag.toLowerCase().includes(query));

            return searchFields.some(field => field && field.includes(query)) || hasTagMatch;
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

// 전역 에러 처리 미들웨어 (모든 라우터 뒤, listen 전에 위치)
app.use((err, req, res, next) => {
    console.error('====================================');
    console.error('전역 에러 핸들러가 에러를 포착했습니다:');
    console.error(err.stack);
    console.error('====================================');
    
    if (res.headersSent) {
        return next(err);
    }
    
    res.status(500).send('<h1> 서버 오류 </h1><p> 죄송합니다, 서버에 예상치 못한 문제가 발생했습니다. </p>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버 시작: http://localhost:${PORT}`);
}); 