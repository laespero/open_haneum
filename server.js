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
let isCacheReady = false; // 캐시 준비 상태 플래그
let viewCounts = {};  // 조회수 데이터를 저장할 객체

// 캐시 준비 상태 확인 미들웨어
app.use((req, res, next) => {
    if (isCacheReady) {
        return next(); // 캐시가 준비되었으면 다음 라우트로 진행
    }
    
    // /api/로 시작하는 요청에는 JSON으로 응답
    if (req.originalUrl.startsWith('/api/')) {
        return res.status(503).json({ error: '서버가 시작 중입니다. 잠시 후 다시 시도해주세요.' });
    }
    
    // 그 외의 모든 요청에는 HTML 메시지를 보냄
    res.status(503).send('<h1>서버 준비 중...</h1><p>데이터를 로딩하고 있습니다. 잠시 후 새로고침 해주세요.</p>');
});

/**
 * 사용자 입력(title)을 기반으로 안전한 파일 경로를 생성합니다.
 * 경로 순회 공격을 방지하기 위해 `path.basename`을 사용합니다.
 * @param {string} title - 노래 제목.
 * @returns {string} - 'songs' 디렉토리 내의 안전한 파일 경로.
 * @throws {Error} - 제목이 유효하지 않은 경우 오류를 발생시킵니다.
 */
function getSafeSongPath(title) {
    if (!title) {
        const error = new Error('노래 제목이 필요합니다.');
        error.status = 400; // Bad Request
        throw error;
    }
    // basename은 경로의 마지막 부분만 반환하여 '..' 같은 상위 디렉토리 이동 문자를 제거합니다.
    const safeTitle = path.basename(title);
    if (safeTitle !== title) {
        const error = new Error('잘못된 경로가 포함된 제목입니다.');
        error.status = 400; // Bad Request
        throw error;
    }
    return `songs/${safeTitle}.json`;
}

// 조회수 데이터 로드/저장 함수
async function loadViewCounts() {
    try {
        const data = await fs.promises.readFile('viewCounts.json', 'utf8');
        viewCounts = JSON.parse(data);
        console.log('조회수 데이터를 로드했습니다.');
    } catch (error) {
        console.log('조회수 데이터 파일이 없어 새로 생성합니다.');
        viewCounts = {};
        await saveViewCounts();
    }
}

async function saveViewCounts() {
    try {
        await fs.promises.writeFile('viewCounts.json', JSON.stringify(viewCounts, null, 2));
    } catch (error) {
        console.error('조회수 데이터 저장 중 오류:', error);
    }
}

// 조회수 증가 함수 (분석 결과창 /view/:title 접근 시에만 카운트)
function incrementViewCount(songName) {
    if (!viewCounts[songName]) {
        viewCounts[songName] = 0;
    }
    viewCounts[songName]++;
    
    // 비동기로 저장 (성능을 위해 await 하지 않음)
    saveViewCounts().catch(err => {
        console.error('조회수 저장 중 오류:', err);
    });
}

// 인기 노래 조회 함수
function getPopularSongs(limit = 10) {
    return Object.entries(viewCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
        .map(([songName, views]) => {
            const song = songCache.find(s => s.name === songName);
            return song ? { ...song, views } : null;
        })
        .filter(song => song !== null)
        .filter(song => !song.tags || !song.tags.includes('개발용')); // 개발용 제외
}

// 인기 아티스트 조회 함수
function getPopularArtists(limit = 10) {
    const artistViews = {};
    
    // 각 아티스트별 총 조회수 계산
    Object.entries(viewCounts).forEach(([songName, views]) => {
        const song = songCache.find(s => s.name === songName);
        if (song && (!song.tags || !song.tags.includes('개발용'))) {
            const artistName = typeof song.artist === 'object' 
                ? (song.artist.kor_name || song.artist.eng_name || song.artist.ori_name)
                : song.artist;
            
            if (artistName) {
                if (!artistViews[artistName]) {
                    artistViews[artistName] = {
                        name: artistName,
                        totalViews: 0,
                        songs: [],
                        artist: song.artist
                    };
                }
                artistViews[artistName].totalViews += views;
                artistViews[artistName].songs.push({
                    name: song.name,
                    ori_name: song.ori_name,
                    views: views
                });
            }
        }
    });
    
    return Object.values(artistViews)
        .sort((a, b) => b.totalViews - a.totalViews)
        .slice(0, limit);
}

// 언어별 노래 필터링 함수
function filterSongsByLanguage(language, limit = 16) {
    let filteredSongs = songCache.filter(song => !song.tags || !song.tags.includes('개발용'));
    
    if (language === 'all') {
        // 전체: 개발용만 제외
        return filteredSongs
            .sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                return dateB - dateA;
            })
            .slice(0, limit);
    }
    
    if (language === 'english') {
        filteredSongs = filteredSongs.filter(song => 
            song.tags && song.tags.some(tag => tag.includes('영어'))
        );
    } else if (language === 'japanese') {
        filteredSongs = filteredSongs.filter(song => 
            song.tags && song.tags.some(tag => tag.includes('일본어'))
        );
    } else if (language === 'chinese') {
        filteredSongs = filteredSongs.filter(song => 
            song.tags && song.tags.some(tag => tag.includes('중국어'))
        );
    } else if (language === 'other') {
        // 기타: 영어, 일본어, 중국어가 아닌 모든 노래
        filteredSongs = filteredSongs.filter(song => 
            !song.tags || !song.tags.some(tag => 
                tag.includes('영어') || tag.includes('일본어') || tag.includes('중국어')
            )
        );
    }
    
    return filteredSongs
        .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB - dateA;
        })
        .slice(0, limit);
}

// 언어별 인기 노래 필터링 함수
function getPopularSongsByLanguage(language, limit = 10) {
    let allPopularSongs = getPopularSongs(100); // 우선 많이 가져온 후 필터링
    
    if (language === 'all') {
        return allPopularSongs.slice(0, limit);
    }
    
    let filteredSongs = allPopularSongs;
    
    if (language === 'english') {
        filteredSongs = allPopularSongs.filter(song => 
            song.tags && song.tags.some(tag => tag.includes('영어'))
        );
    } else if (language === 'japanese') {
        filteredSongs = allPopularSongs.filter(song => 
            song.tags && song.tags.some(tag => tag.includes('일본어'))
        );
    } else if (language === 'chinese') {
        filteredSongs = allPopularSongs.filter(song => 
            song.tags && song.tags.some(tag => tag.includes('중국어'))
        );
    } else if (language === 'other') {
        filteredSongs = allPopularSongs.filter(song => 
            !song.tags || !song.tags.some(tag => 
                tag.includes('영어') || tag.includes('일본어') || tag.includes('중국어')
            )
        );
    }
    
    return filteredSongs.slice(0, limit);
}

// 언어별 인기 아티스트 필터링 함수
function getPopularArtistsByLanguage(language, limit = 10) {
    if (language === 'all') {
        return getPopularArtists(limit);
    }
    
    const filteredSongs = filterSongsByLanguage(language, 1000); // 충분히 많은 수로 필터링
    const artistViews = {};
    
    // 필터링된 노래들로 아티스트별 조회수 계산
    filteredSongs.forEach(song => {
        const views = viewCounts[song.name] || 0;
        if (views > 0) {
            const artistName = typeof song.artist === 'object' 
                ? (song.artist.kor_name || song.artist.eng_name || song.artist.ori_name)
                : song.artist;
            
            if (artistName) {
                if (!artistViews[artistName]) {
                    artistViews[artistName] = {
                        name: artistName,
                        totalViews: 0,
                        songs: [],
                        artist: song.artist
                    };
                }
                artistViews[artistName].totalViews += views;
                artistViews[artistName].songs.push({
                    name: song.name,
                    ori_name: song.ori_name,
                    views: views
                });
            }
        }
    });
    
    return Object.values(artistViews)
        .sort((a, b) => b.totalViews - a.totalViews)
        .slice(0, limit);
}

// 캐시 갱신 함수
async function refreshSongCache() {
    try {
        const files = (await fs.promises.readdir('songs')).filter(file => path.extname(file).toLowerCase() === '.json');
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
        isCacheReady = true; // 캐시 로딩 완료, 이제 서버는 모든 요청을 처리할 준비가 됨
        console.log(`${songCache.length}개의 노래 데이터를 메모리에 로드했으며, 서버가 정상적으로 요청을 처리할 준비를 마쳤습니다.`);
    } catch (err) {
        console.error('노래 데이터 로드 중 심각한 오류 발생:', err);
        // 캐시 로딩은 핵심 기능이므로, 실패 시 프로세스를 종료하여 pm2 등이 재시작하도록 유도
        process.exit(1);
    }
}

// 서버 시작 시 캐시 로드, listen 전에 완료되도록 수정합니다.
// refreshSongCache(); // 기존 방식

// 공백 정규화 함수 - 전각 공백, 반각 공백 등을 모두 제거
function normalizeSpaces(text) {
    if (!text) return '';
    return text.replace(/[\s\u3000\u00A0\u2000-\u200A\u2028\u2029\u202F\u205F]/g, '');
}

/**
 * 쿼리와 태그를 기반으로 노래를 검색하고 정렬하는 함수.
 * @param {string} searchQuery - 검색어.
 * @param {string[]} excludeTags - 검색에서 제외할 태그 배열.
 * @returns {object[]} - 검색 및 정렬된 노래 객체의 배열.
 */
function searchSongs(searchQuery, excludeTags = []) {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const normalizedQuery = normalizeSpaces(lowerCaseQuery);

    // 1. 태그를 기준으로 노래 필터링
    let filteredByTag = songCache;
    if (excludeTags.length > 0) {
        filteredByTag = songCache.filter(song => 
            !song.tags || !song.tags.some(tag => excludeTags.includes(tag))
        );
    }
    
    // '개발용' 태그 특별 처리
    if (lowerCaseQuery === '개발용') {
        return songCache.filter(song => song.tags && song.tags.includes('개발용'))
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    // 2. 검색어로 필터링
    let searchedSongs;
    if (searchQuery) {
        searchedSongs = filteredByTag.filter(song => {
            const artistMatch = typeof song.artist === 'object' 
                ? normalizeSpaces(song.artist.ori_name?.toLowerCase() || '').includes(normalizedQuery) || 
                  normalizeSpaces(song.artist.kor_name?.toLowerCase() || '').includes(normalizedQuery) || 
                  normalizeSpaces(song.artist.eng_name?.toLowerCase() || '').includes(normalizedQuery)
                : normalizeSpaces(song.artist?.toLowerCase() || '').includes(normalizedQuery);

            return normalizeSpaces(song.name?.toLowerCase() || '').includes(normalizedQuery) ||
                normalizeSpaces(song.ori_name?.toLowerCase() || '').includes(normalizedQuery) ||
                normalizeSpaces(song.kor_name?.toLowerCase() || '').includes(normalizedQuery) ||
                normalizeSpaces(song.eng_name?.toLowerCase() || '').includes(normalizedQuery) ||
                artistMatch ||
                (song.tags && song.tags.some(tag => normalizeSpaces(tag.toLowerCase()).includes(normalizedQuery)));
        });
    } else {
        searchedSongs = filteredByTag;
    }

    // 3. 생성일 기준으로 내림차순 정렬
    return searchedSongs.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
    });
}

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

    const safePath = getSafeSongPath(title);
    await fs.promises.writeFile(safePath, JSON.stringify(songData, null, 2));
    
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

    const filePath = getSafeSongPath(title);

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
    
    res.redirect(`/detail/${title}`);
});

app.get('/songs/:title', async (req, res) => {
    const title = req.params.title;
    const filePath = getSafeSongPath(title);
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        const songData = JSON.parse(data);
        
        // 조회수는 분석 결과창(/view/)에서만 카운트하므로 여기서는 제거
        
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

app.get('/view/:title', async (req, res) => {
    const title = req.params.title;
    const filePath = getSafeSongPath(title);
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        const songData = JSON.parse(data);
        
        // 조회수 증가
        incrementViewCount(title);
        
        res.render('songView', { song: songData, lang: lang });
    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.redirect('/');
        }
        throw error;
    }
});

app.get('/songview/:title', (req, res) => {
    res.redirect(`/view/${req.params.title}`);
});

app.get('/songdetail/:title', (req, res) => {
    res.redirect(`/detail/${req.params.title}`);
});

app.get('/detail/:title', async (req, res) => {
    const title = req.params.title;
    const filePath = getSafeSongPath(title);
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
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
    const filteredSongs = searchSongs(searchQuery, ['개발용']);
    
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSongs = filteredSongs.slice(startIndex, endIndex);
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
    const filePath = getSafeSongPath(title);
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
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

    const filePath = getSafeSongPath(title);
    const data = await fs.promises.readFile(filePath, 'utf8');
    let songData = JSON.parse(data);

    if (!Array.isArray(songData.p1)) {
        console.error('songData.p1은 배열이어야 합니다:', songData.p1);
        const err = new Error('잘못된 노래 데이터 형식');
        err.status = 400;
        throw err;
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

    await fs.promises.writeFile(filePath, JSON.stringify(songData, null, 2));
    console.log(`끝 : [${title}]`);

    res.render('songDetail', { song: songData });
});


app.post('/retry-translation/:title', async (req, res) => {
    const title = req.params.title;
    const filePath = getSafeSongPath(title);

    const data = await fs.promises.readFile(filePath, 'utf8');
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

    await fs.promises.writeFile(filePath, JSON.stringify(songData, null, 2));
    res.render('songDetail', { song: songData });
});

// 부분 재번역 라우트 (스키마 오류가 있는 라인들만)
app.post('/retry-invalid-lines/:title', async (req, res) => {
    const title = req.params.title;
    const filePath = getSafeSongPath(title);

    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        let songData = JSON.parse(data);

        // contextText가 없으면 생성
        if (!songData.contextText && songData.p1) {
            songData.contextText = toContextObj(songData.p1);
        }

        // 스키마 오류가 있는 라인들 찾기
        const invalidLines = getInvalidLines(songData);
        
        if (invalidLines.length === 0) {
            return res.json({ success: true, message: '재번역할 오류 라인이 없습니다.' });
        }

        console.log(`[${title}] ${invalidLines.length}개의 오류 라인 부분 재번역 시작`);

        let successCount = 0;
        let failCount = 0;

        // retry-translation 방식으로 오류 라인들만 재번역
        const translationPromises = invalidLines.map(async (invalidLine) => {
            try {
                const requestBody = {
                    model: isUsingDeepSeekDirectly ? "deepseek-chat" : chatModel,
                    max_tokens: 8192,
                    temperature: 0.1,
                    messages: [
                        { role: "system", content: MSG },
                        { role: 'user', content: JSON.stringify(invalidLine.context) },
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
                const parsedResult = JSON.parse(translatedLine);
                
                if (parsedResult && parsedResult.K0) {
                    parsedResult.O0 = invalidLine.context.T0;
                    
                    // 기존 translatedLines에서 해당 라인 교체
                    songData.translatedLines[invalidLine.index] = parsedResult;
                    successCount++;
                    
                    console.log(`[${title}] 라인 ${invalidLine.index} 재번역 성공`);
                } else {
                    failCount++;
                    console.log(`[${title}] 라인 ${invalidLine.index} 재번역 실패 - 결과 없음`);
                }
                
            } catch (error) {
                console.error(`[${title}] 라인 ${invalidLine.index} 재번역 오류:`, error);
                failCount++;
            }
        });

        await Promise.all(translationPromises);

        // 파일 저장
        await fs.promises.writeFile(filePath, JSON.stringify(songData, null, 2));
        
        // 캐시 업데이트
        const songIndex = songCache.findIndex(song => song.name === title);
        if (songIndex > -1) {
            songCache[songIndex] = songData;
        }

        console.log(`[${title}] 부분 재번역 완료: 성공 ${successCount}개, 실패 ${failCount}개`);
        
        res.json({ 
            success: true, 
            message: `부분 재번역 완료: 성공 ${successCount}개, 실패 ${failCount}개`,
            successCount,
            failCount
        });
        
    } catch (error) {
        console.error(`[${title}] 부분 재번역 중 오류:`, error);
        res.status(500).json({ 
            success: false, 
            message: '부분 재번역 중 오류가 발생했습니다.',
            error: error.message 
        });
    }
});

app.post('/retry-line/:title', async (req, res) => {
    const title = req.params.title;
    const filePath = getSafeSongPath(title);
    const data = await fs.promises.readFile(filePath, 'utf8');
    let songData = JSON.parse(data);
    
    const thatLine = songData.contextText.find(x=>x.T0?.trim() === req.body.originalLine?.trim() || x.O0?.trim() === req.body.originalLine?.trim());

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
        parsedResult.O0 = thatLine.T0;
        const foundIdx = songData.translatedLines.findIndex(t=>t.T0===req.body.originalLine||t.O0===parsedResult.O0);   
        
        if(foundIdx===-1){
            songData.translatedLines.push(parsedResult);
        }
        else{
            songData.translatedLines[foundIdx] = parsedResult;
        }
        songData.failedLines = songData.failedLines.filter(x=> !songData.translatedLines.some(y => y.T0 === x.T0));

        await fs.promises.writeFile(filePath, JSON.stringify(songData, null, 2));
        res.redirect(`/detail/${title}`);
    } catch (error) {
        console.error('특정 라인 재번역 오류:', error);
        error.status = 500;
        error.message = '특정 라인 재번역 중 오류 발생';
        throw error;
    }
});

app.post('/correct-with-message/:title', async (req, res) => {
    const title = req.params.title;
    const filePath = getSafeSongPath(title);
    const data = await fs.promises.readFile(filePath, 'utf8');
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

        await fs.promises.writeFile(filePath, JSON.stringify(songData, null, 2));
        res.redirect(`/detail/${title}`);
    } catch (error) {
        console.error('특정 라인 재번역 오류:', error);
        error.status = 500;
        error.message = '특정 라인 재번역 중 오류 발생';
        throw error;
    }

});

app.post('/update-line/:title', async (req, res) => {
    const { title } = req.params;
    const { originalLine, jsonContent } = req.body;

    if (!originalLine || !jsonContent) {
        return res.status(400).send('필수 데이터가 누락되었습니다.');
    }

    const filePath = getSafeSongPath(title);

    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        let songData = JSON.parse(data);

        let updatedLineData;
        try {
            updatedLineData = JSON.parse(jsonContent);
        } catch (parseError) {
            console.error('수정된 JSON 파싱 오류:', parseError);
            const err = new Error(`<h1>JSON 형식 오류</h1><p>제출된 JSON 형식이 올바르지 않습니다. 다시 확인해주세요.</p><a href="/detail/${title}">돌아가기</a>`);
            err.status = 400;
            throw err;
        }

        const lineIndex = songData.translatedLines.findIndex(
            line => line.T0 === originalLine || line.O0 === originalLine
        );
        
        if (lineIndex === -1) {
            return res.status(404).send('수정할 가사 라인을 찾을 수 없습니다.');
        }

        songData.translatedLines[lineIndex] = updatedLineData;
        
        await fs.promises.writeFile(filePath, JSON.stringify(songData, null, 2));

        console.log(`[${title}] 가사 라인이 수동으로 업데이트되었습니다. 원본: "${originalLine}"`);
        
        // 캐시 업데이트
        const songIndex = songCache.findIndex(song => song.name === title);
        if (songIndex > -1) {
            songCache[songIndex] = songData;
            console.log(`메모리 캐시를 효율적으로 업데이트했습니다: ${title}`);
        }

        res.redirect(`/detail/${title}`);

    } catch (error) {
        console.error('가사 라인 수동 업데이트 중 오류:', error);
        if (error.code === 'ENOENT') {
            const err = new Error('노래 파일을 찾을 수 없습니다.');
            err.status = 404;
            throw err;
        }
        // 다른 에러는 그대로 전역 핸들러로 전달
        throw error;
    }
});

app.get('/api/songs/:title/translated', async (req, res) => {
    const title = req.params.title;
    const filePath = getSafeSongPath(title);

    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
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
        // ENOENT (파일 없음) 오류도 404로 처리
        if (error.code === 'ENOENT') {
            return res.status(404).json({ error: '노래를 찾을 수 없습니다.' });
        }
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

/**
 * 노래 데이터의 JSON 스키마가 유효한지 검증합니다.
 * @param {object} songData - 검증할 노래 데이터 객체
 * @returns {object} - { isValid: boolean, errors: string[] }
 */
function validateSongSchema(songData) {
    const errors = [];

    // 기본 필드 검증
    if (!songData.name) {
        errors.push('노래 제목(name)이 없습니다.');
    }

    // translatedLines 검증
    if (!songData.translatedLines) {
        errors.push('translatedLines 필드가 없습니다.');
    } else if (!Array.isArray(songData.translatedLines)) {
        errors.push('translatedLines가 배열이 아닙니다.');
    } else if (songData.translatedLines.length === 0) {
        errors.push('translatedLines가 비어있습니다.');
    } else {
        // 각 translatedLine 항목에 대해 상세한 스키마 검증
        songData.translatedLines.forEach((line, index) => {
            const lineErrors = validateLineSchema(line, index);
            errors.push(...lineErrors);
        });
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * 개별 translatedLine 항목의 스키마를 검증합니다.
 * songDetail.ejs의 validateSchema 함수 기반
 * @param {object} data - 검증할 라인 데이터
 * @param {number} lineIndex - 라인 인덱스
 * @returns {string[]} - 오류 메시지 배열
 */
function validateLineSchema(data, lineIndex) {
    const errors = [];
    const rootRequired = ["T0", "C0", "G0", "K0", "I0", "R0", "LI"];
    const liRequired = [
        "T1", "K1", "I1", "R1", "E1",
        "T2", "K2", "I2", "R2",
        "XE", "XK", "XI", "XR"
    ];

    if (typeof data !== 'object' || data === null) {
        return [`translatedLines[${lineIndex}]: 항목은 객체여야 합니다.`];
    }

    // 최상위 필수 필드 검증
    for (const key of rootRequired) {
        if (!(key in data)) {
            errors.push(`translatedLines[${lineIndex}]: 필수 필드 '${key}'가 없습니다.`);
        }
    }

    // T0 특별 검증
    if ('T0' in data && (typeof data.T0 !== 'string' || data.T0.length === 0)) {
        errors.push(`translatedLines[${lineIndex}]: 'T0'는 비어 있지 않은 문자열이어야 합니다.`);
    }

    // 문자열 필드들 타입 검증
    const stringKeys = ["C0", "G0", "K0", "I0", "R0"];
    for (const key of stringKeys) {
        if (key in data && typeof data[key] !== 'string') {
            errors.push(`translatedLines[${lineIndex}]: '${key}'는 문자열이어야 합니다.`);
        }
    }

    // LI 배열 검증
    if (!('LI' in data) || !Array.isArray(data.LI)) {
        errors.push(`translatedLines[${lineIndex}]: 'LI'는 배열이어야 합니다.`);
    } else {
        data.LI.forEach((item, liIndex) => {
            if (typeof item !== 'object' || item === null) {
                errors.push(`translatedLines[${lineIndex}].LI[${liIndex}]: 항목은 객체여야 합니다.`);
                return;
            }
            
            // LI 항목의 필수 필드들 검증
            for (const key of liRequired) {
                if (!(key in item)) {
                    errors.push(`translatedLines[${lineIndex}].LI[${liIndex}]: 필수 필드 '${key}'가 없습니다.`);
                } else if (typeof item[key] !== 'string') {
                    errors.push(`translatedLines[${lineIndex}].LI[${liIndex}]: '${key}'는 문자열이어야 합니다.`);
                }
            }
        });
    }

    return errors;
}

/**
 * 특정 노래에서 스키마가 유효하지 않은 라인들을 찾습니다.
 * @param {object} songData - 검증할 노래 데이터 객체
 * @returns {object[]} - 유효하지 않은 라인들의 인덱스와 원본 텍스트 배열
 */
function getInvalidLines(songData) {
    const invalidLines = [];
    
    if (!songData.translatedLines || !Array.isArray(songData.translatedLines)) {
        console.log('translatedLines가 없거나 배열이 아님');
        return invalidLines;
    }
    
    songData.translatedLines.forEach((line, index) => {
        const lineErrors = validateLineSchema(line, index);
        if (lineErrors.length > 0) {
            console.log(`라인 ${index}에서 스키마 오류 발견:`, lineErrors);
            
            // contextText에서 원본 텍스트 찾기
            let originalContext = songData.contextText?.find(ctx => 
                ctx.T0 === line.T0 || ctx.O0 === line.T0
            );
            
            if (originalContext) {
                console.log(`라인 ${index}: contextText 매칭 성공`);
            } else {
                console.log(`라인 ${index}: contextText 매칭 실패 - T0: "${line.T0}"`);
                console.log('사용 가능한 contextText:', songData.contextText?.map(ctx => ctx.T0).slice(0, 5));
                
                // contextText 매칭에 실패한 경우 대체 방법들 시도
                
                // 1. p1 배열에서 찾기
                const targetText = line.T0 || line.O0;
                let foundInP1 = null;
                
                if (songData.p1 && Array.isArray(songData.p1) && targetText) {
                    foundInP1 = songData.p1.find(p1Line => 
                        p1Line && (
                            p1Line === targetText ||
                            p1Line.trim() === targetText.trim() ||
                            p1Line.toLowerCase() === targetText.toLowerCase()
                        )
                    );
                }
                
                // 2. 원본 텍스트에서 찾기
                let foundInText = null;
                if (!foundInP1 && songData.text && targetText) {
                    const textLines = songData.text.split('\n').map(line => line.trim()).filter(line => line);
                    foundInText = textLines.find(textLine =>
                        textLine === targetText ||
                        textLine.toLowerCase() === targetText.toLowerCase()
                    );
                }
                
                // 찾은 텍스트로 context 생성
                const contextText = foundInP1 || foundInText || targetText || `라인_${index}`;
                
                originalContext = {
                    T0: contextText,
                    // 추가 정보가 있으면 활용
                    ...(line.O0 && { O0: line.O0 })
                };
                
                console.log(`라인 ${index}: 대체 context 생성 - T0: "${originalContext.T0}" (출처: ${foundInP1 ? 'p1' : foundInText ? 'text' : 'fallback'})`);
            }
            
            invalidLines.push({
                index: index,
                context: originalContext,
                errors: lineErrors,
                line: line
            });
        }
    });
    
    console.log(`총 ${invalidLines.length}개의 오류 라인 발견`);
    return invalidLines;
}

/**
 * 전체 노래 캐시에서 스키마가 유효하지 않은 노래들을 찾습니다.
 * @param {number} limit - 반환할 최대 노래 수 (기본값: 100)
 * @returns {object[]} - 유효하지 않은 노래 객체들의 배열
 */
function getInvalidSongs(limit = 100) {
    const invalidSongs = [];
    
    for (const song of songCache) {
        if (invalidSongs.length >= limit) break;
        
        // '개발용' 태그가 있는 노래는 관리 대상에서 제외
        if (song.tags && song.tags.includes('개발용')) {
            continue;
        }
        
        const validation = validateSongSchema(song);
        if (!validation.isValid) {
            invalidSongs.push({
                song: song,
                errors: validation.errors
            });
        }
    }
    
    return invalidSongs;
}

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
    // 최근 추가된 노래 16개를 가져옵니다
    const latestSongs = songCache
        .filter(song => !song.tags || !song.tags.includes('개발용'))
        .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB - dateA;
        })
        .slice(0, 16);

    // 인기 노래 10개를 가져옵니다
    const popularSongs = getPopularSongs(10);
    
    // 인기 아티스트 10개를 가져옵니다
    const popularArtists = getPopularArtists(10);

    res.render('landing', {
        latestSongs,
        popularSongs,
        popularArtists
    });
});

app.get('/add-song', (req, res) => {
    res.render('addSong');
});

// 인기 노래 순위 페이지
app.get('/popular/songs', (req, res) => {
    const popularSongs = getPopularSongs(100); // 상위 100개 노래
    
    res.render('popularSongs', {
        popularSongs: popularSongs
    });
});

// 인기 아티스트 순위 페이지
app.get('/popular/artists', (req, res) => {
    const popularArtists = getPopularArtists(100); // 상위 100명 아티스트
    
    res.render('popularArtists', {
        popularArtists: popularArtists
    });
});

// 관리 페이지 라우트
app.get('/admin', (req, res) => {
    const invalidSongs = getInvalidSongs(100);
    // '개발용' 태그가 있는 노래들을 제외한 총 노래 수 계산
    const totalSongs = songCache.filter(song => 
        !song.tags || !song.tags.includes('개발용')
    ).length;
    
    res.render('admin', {
        invalidSongs: invalidSongs,
        totalSongs: totalSongs
    });
});

// 전체 재번역 라우트
app.post('/admin/retranslate-all', async (req, res) => {
    try {
        const invalidSongs = getInvalidSongs(100);
        
        if (invalidSongs.length === 0) {
            return res.json({ success: true, message: '재번역할 노래가 없습니다.' });
        }

        console.log(`관리자 요청으로 ${invalidSongs.length}개 노래의 오류 부분만 부분 재번역을 시작합니다.`);
        
        // 모든 노래를 동시에 부분 재번역
        const songRetranslationPromises = invalidSongs.map(async (invalidSong) => {
            let songSuccessCount = 0;
            let songFailCount = 0;
            try {
                const songName = invalidSong.song.name;
                const filePath = getSafeSongPath(songName);
                
                const data = await fs.promises.readFile(filePath, 'utf8');
                let songData = JSON.parse(data);

                // contextText가 없으면 생성
                if (!songData.contextText && songData.p1) {
                    songData.contextText = toContextObj(songData.p1);
                }

                // 스키마 오류가 있는 라인들 찾기
                const invalidLines = getInvalidLines(songData);
                
                if (invalidLines.length === 0) {
                    console.log(`[${songName}] 오류 라인이 없어 건너뜀`);
                    return { songName, successCount: 0, failCount: 0, skipped: true };
                }

                console.log(`[${songName}] ${invalidLines.length}개의 오류 라인 부분 재번역 시작`);

                // retry-translation 방식으로 오류 라인들만 재번역
                const translationPromises = invalidLines.map(async (invalidLine) => {
                    try {
                        const requestBody = {
                            model: isUsingDeepSeekDirectly ? "deepseek-chat" : chatModel,
                            max_tokens: 8192,
                            temperature: 0.1,
                            messages: [
                                { role: "system", content: MSG },
                                { role: 'user', content: JSON.stringify(invalidLine.context) },
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
                        const parsedResult = JSON.parse(translatedLine);
                        
                        if (parsedResult && parsedResult.K0) {
                            parsedResult.O0 = invalidLine.context.T0;
                            
                            // 기존 translatedLines에서 해당 라인 교체
                            songData.translatedLines[invalidLine.index] = parsedResult;
                            songSuccessCount++;
                        } else {
                            songFailCount++;
                        }
                        
                    } catch (error) {
                        console.error(`[${songName}] 라인 ${invalidLine.index} 재번역 오류:`, error);
                        songFailCount++;
                    }
                });

                await Promise.all(translationPromises);

                // 파일 저장
                await fs.promises.writeFile(filePath, JSON.stringify(songData, null, 2));
                
                // 캐시 업데이트
                const songIndex = songCache.findIndex(song => song.name === songName);
                if (songIndex > -1) {
                    songCache[songIndex] = songData;
                }
                
                console.log(`[${songName}] 부분 재번역 완료: 성공 ${songSuccessCount}개, 실패 ${songFailCount}개`);
                
                return { songName, successCount: songSuccessCount, failCount: songFailCount, skipped: false };
                
            } catch (error) {
                console.error(`[${invalidSong.song.name}] 부분 재번역 실패:`, error);
                return { songName: invalidSong.song.name, successCount: 0, failCount: 1, skipped: false, error: error.message };
            }
        });

        // 모든 노래 처리 완료 대기
        const results = await Promise.all(songRetranslationPromises);
        
        // 결과 집계
        let totalSuccessCount = 0;
        let totalFailCount = 0;
        let processedSongs = 0;
        
        results.forEach(result => {
            totalSuccessCount += result.successCount;
            totalFailCount += result.failCount;
            if (!result.skipped) {
                processedSongs++;
            }
        });
        
        console.log(`관리자 부분 재번역 완료: 총 성공 ${totalSuccessCount}개, 실패 ${totalFailCount}개`);
        
        res.json({ 
            success: true, 
            message: `부분 재번역 완료: 성공 ${totalSuccessCount}개, 실패 ${totalFailCount}개 (${processedSongs}개 노래 처리)` 
        });
        
    } catch (error) {
        console.error('전체 재번역 중 오류:', error);
        res.status(500).json({ 
            success: false, 
            error: '전체 재번역 중 오류가 발생했습니다.' 
        });
    }
});

app.get('/api/search', (req, res) => {
    const query = decodeURIComponent(req.query.q).toLowerCase();
    const page = parseInt(req.query.page) || 1;
    const limit = 30;
    
    try {
        const allResults = searchSongs(query, ['개발용']);
        
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

// 언어별 필터링 API (메인 페이지용)
app.get('/api/filter', (req, res) => {
    const language = req.query.language || 'all';
    
    try {
        // 언어별로 필터링된 데이터 가져오기
        const latestSongs = filterSongsByLanguage(language, 16);
        const popularSongs = getPopularSongsByLanguage(language, 10);
        const popularArtists = getPopularArtistsByLanguage(language, 10);
        
        res.json({
            latestSongs,
            popularSongs,
            popularArtists
        });
    } catch (err) {
        console.error('언어 필터링 오류:', err);
        res.status(500).json({ error: 'Failed to filter songs by language' });
    }
});

// 인기 노래 순위 페이지용 언어 필터링 API
app.get('/api/popular/songs', (req, res) => {
    const language = req.query.language || 'all';
    
    try {
        const popularSongs = getPopularSongsByLanguage(language, 100); // 100위까지 표시
        
        res.json({
            popularSongs
        });
    } catch (err) {
        console.error('인기 노래 언어 필터링 오류:', err);
        res.status(500).json({ error: 'Failed to filter popular songs by language' });
    }
});

// 인기 아티스트 순위 페이지용 언어 필터링 API
app.get('/api/popular/artists', (req, res) => {
    const language = req.query.language || 'all';
    
    try {
        const popularArtists = getPopularArtistsByLanguage(language, 100); // 100위까지 표시
        
        res.json({
            popularArtists
        });
    } catch (err) {
        console.error('인기 아티스트 언어 필터링 오류:', err);
        res.status(500).json({ error: 'Failed to filter popular artists by language' });
    }
});

// 전역 에러 처리 미들웨어 (모든 라우터 뒤, listen 전에 위치)
app.use((err, req, res, next) => {
    console.error('====================================');
    console.error('전역 에러 핸들러가 에러를 포착했습니다:');
    console.error('Request URL:', req.originalUrl);
    console.error(err);
    console.error('====================================');
    
    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.status || 500;
    // HTML이 포함된 오류 메시지는 그대로 렌더링하고, 아닌 경우 일반 메시지 포맷 사용
    const isHtmlMessage = /<[a-z][\s\S]*>/i.test(err.message);
    const errorMessage = err.message || '서버에 예상치 못한 문제가 발생했습니다.';

    // API 요청은 JSON으로 응답
    if (req.originalUrl.startsWith('/api/')) {
        return res.status(statusCode).json({ error: errorMessage });
    }
    
    if (isHtmlMessage) {
        return res.status(statusCode).send(errorMessage);
    }

    res.status(statusCode).send(`<h1>서버 오류</h1><p>죄송합니다, 예상치 못한 문제가 발생했습니다.</p><p><i>${errorMessage}</i></p><a href="javascript:history.back()">돌아가기</a>`);
});

const PORT = process.env.PORT || 3000;

function startServer() {
    // 서버가 요청을 받기 전에 캐시를 먼저 로드합니다.
    app.listen(PORT, () => {
        console.log(`서버 시작: http://localhost:${PORT}`);
        console.log('백그라운드에서 노래 캐시 및 조회수 데이터 로딩을 시작합니다...');
        // await 없이 호출하여, 서버 시작을 지연시키지 않고 백그라운드에서 캐시를 로딩합니다.
        Promise.all([
            refreshSongCache(),
            loadViewCounts()
        ]).catch(err => {
            console.error('초기 데이터 로딩 중 오류:', err);
        });
    });
}

startServer(); 