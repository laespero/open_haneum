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
const API_PROVIDER_CHOICE = 'deepseek'; 

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

const OPENROUTER_DEEPSEEK_CHAT = "deepseek/deepseek-v3.2";
const OPENROUTER_CHATGPT = "openai/gpt-5.2-chat";
const OPENROUTER_GEMINI = "google/gemini-2.5-flash-lite";

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
        chatModel = OPENROUTER_DEEPSEEK_CHAT;
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
        chatModel = OPENROUTER_DEEPSEEK_CHAT;
        isUsingDeepSeekDirectly = false;
    } else {
        initializationLog += "⚠️ 경고: 사용 가능한 API 키가 없습니다. .env 파일에 키를 설정해주세요. API 기능이 제한됩니다.";
        isUsingDeepSeekDirectly = false; // 추가: API 사용 불가 시 false
    }
}

console.log("[chatModel] : ", chatModel);   

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

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.set('view engine', 'ejs');

// 정적 파일 제공 설정
app.use(express.static('public'));
app.use('/', express.static('songs'));

// 노래 메타데이터를 저장하는 메모리 캐시
// [주의] 메모리 최적화를 위해 가사 데이터(p1, contextText, translatedLines 등)는 제외되고 축약된 정보만 저장됩니다.
// 따라서 이 객체를 그대로 파일에 덮어쓰면 가사 데이터가 영구적으로 유실되므로, 
// 파일 수정 작업 시에는 반드시 fs.readFile로 원본 파일을 읽어서 처리해야 합니다.
let songCache = [];
let songCacheMap = new Map();  // 노래 이름을 키로 하는 Map (빠른 검색용)
let songCacheKeyMap = new Map(); // 소문자 이름 -> 실제 이름 매핑 (대소문자 무시 검색용)
let isCacheReady = false; // 캐시 준비 상태 플래그
let lastCacheReloadTime = 0; // 마지막 캐시 리로딩 시간
let viewCounts = {};  // 조회수 데이터를 저장할 객체

// 쿠키 파싱 유틸리티 함수
function parseCookies(cookieHeader) {
    const cookies = {};
    if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
            const parts = cookie.split('=');
            if (parts.length === 2) {
                cookies[parts[0].trim()] = decodeURIComponent(parts[1].trim());
            }
        });
    }
    return cookies;
}

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
function getSafeSongPath(title, useCache = true) {
    if (!title) {
        const error = new Error('노래 제목이 필요합니다.');
        error.status = 400; // Bad Request
        throw error;
    }

    // 캐시가 준비되어 있고, 입력된 타이틀의 소문자 버전이 캐시에 있다면 그 실제 이름을 사용 (대소문자 자동 보정)
    // 단, useCache가 false이면 캐시를 무시하고 입력된 타이틀 그대로 사용 (파일 생성/이름 변경 시 사용)
    if (useCache && isCacheReady && songCacheKeyMap && songCacheKeyMap.has(title.toLowerCase())) {
        title = songCacheKeyMap.get(title.toLowerCase());
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

/**
 * songs 디렉토리의 모든 파일을 스캔하여 파일명과 내부 'name' 필드가 일치하도록 동기화합니다.
 * Bulk Import 후 대소문자 차이 등으로 인한 불일치를 해결하기 위해 사용됩니다.
 */
async function syncAllSongNames() {
    const songsDir = path.join(path.resolve(), 'songs');
    console.log('[Sync] Starting to sync song names with filenames...');
    
    try {
        const files = await fs.promises.readdir(songsDir);
        let updatedCount = 0;
        
        for (const file of files) {
             if (path.extname(file) !== '.json') continue;
             
             const filePath = path.join(songsDir, file);
             const fileNameNoExt = path.basename(file, '.json');
             
             try {
                 const content = await fs.promises.readFile(filePath, 'utf8');
                 const data = JSON.parse(content);
                 
                 // 파일명과 내부 name이 다른 경우 (대소문자 포함)
                 if (data.name !== fileNameNoExt) {
                     // console.log(`[Sync] Updating name for ${file}: "${data.name}" -> "${fileNameNoExt}"`);
                     data.name = fileNameNoExt;
                     await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
                     updatedCount++;
                 }
             } catch (err) {
                 console.error(`[Sync] Error processing file ${file}:`, err.message);
             }
        }
        
        if (updatedCount > 0) {
            console.log(`[Sync] Completed. Updated ${updatedCount} files.`);
            // 이름이 변경되었으므로 캐시 리프레시 필요
            await refreshSongCache();
        } else {
            console.log('[Sync] Completed. No changes needed.');
        }
        
        return updatedCount;
    } catch (err) {
        console.error('[Sync] Failed to read songs directory:', err);
    }
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

// viewCounts와 songCache 동기화 함수
async function syncViewCountsWithSongs() {
    let updated = false;
    let addedCount = 0;
    
    if (!songCache || songCache.length === 0) return;

    songCache.forEach(song => {
        // 개발용 태그가 아닌 노래에 대해서만
        if (!song.tags || !song.tags.includes('개발용')) {
            // viewCounts에 해당 곡이 없으면 1로 초기화
            if (viewCounts[song.name] === undefined) {
                viewCounts[song.name] = 1;
                updated = true;
                addedCount++;
            }
        }
    });
    
    if (updated) {
        console.log(`viewCounts에 누락된 곡 ${addedCount}개를 추가했습니다.`);
        await saveViewCounts();
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
        .map(([songName, views]) => {
            const song = songCacheMap.get(songName); // Map으로 O(1) 검색
            return song ? { ...song, views } : null;
        })
        .filter(song => song !== null)
        .filter(song => !song.tags || !song.tags.includes('개발용')) // 개발용 제외
        .slice(0, limit);
}

// 인기 아티스트 조회 함수
function getPopularArtists(limit = 10) {
    const artistViews = {};
    
    // 각 아티스트별 총 조회수 계산
    Object.entries(viewCounts).forEach(([songName, views]) => {
        const song = songCacheMap.get(songName); // Map으로 O(1) 검색
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
                    kor_name: song.kor_name,
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
    if (language === 'all') {
        return getPopularSongs(limit);
    }
    
    // 전체 노래에서 언어별로 먼저 필터링
    let filteredSongs = songCache.filter(song => 
        !song.tags || !song.tags.includes('개발용')
    );
    
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
        filteredSongs = filteredSongs.filter(song => 
            !song.tags || !song.tags.some(tag => 
                tag.includes('영어') || tag.includes('일본어') || tag.includes('중국어')
            )
        );
    }
    
    // 필터링된 노래들을 조회수 순으로 정렬
    return filteredSongs
        .map(song => ({
            ...song,
            views: viewCounts[song.name] || 1
        }))
        .filter(song => song.views > 0) // 조회수가 있는 노래만
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);
}

// 언어별 인기 아티스트 필터링 함수
function getPopularArtistsByLanguage(language, limit = 10) {
    if (language === 'all') {
        return getPopularArtists(limit);
    }
    
    // 전체 노래에서 언어별로 먼저 필터링
    let filteredSongs = songCache.filter(song => 
        !song.tags || !song.tags.includes('개발용')
    );
    
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
        filteredSongs = filteredSongs.filter(song => 
            !song.tags || !song.tags.some(tag => 
                tag.includes('영어') || tag.includes('일본어') || tag.includes('중국어')
            )
        );
    }
    
    const artistViews = {};
    
    // 필터링된 노래들로 아티스트별 조회수 계산
    filteredSongs.forEach(song => {
        const views = viewCounts[song.name] || 1;
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
                    kor_name: song.kor_name,
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
        
        // 파일 오픈 제한(EMFILE) 방지를 위해 배치 처리
        const BATCH_SIZE = 50;
        let newSongCache = [];
        
        for (let i = 0; i < files.length; i += BATCH_SIZE) {
            const batch = files.slice(i, i + BATCH_SIZE);
            const songPromises = batch.map(async file => {
                const filePath = `songs/${file}`;
                try {
                    const data = await fs.promises.readFile(filePath, 'utf8');
                    const songData = JSON.parse(data);
                    
                    // 메모리 최적화: 전체 데이터 대신 메타데이터와 검증 결과만 저장
                    // 중요: validateSongSchema 함수가 아래에 정의되어 있어야 함
                    const validation = validateSongSchema(songData);
                    
                    return {
                        name: songData.name,
                        ori_name: songData.ori_name,
                        kor_name: songData.kor_name,
                        eng_name: songData.eng_name,
                        artist: songData.artist,
                        tags: songData.tags,
                        createdAt: songData.createdAt,
                        failedLines: songData.failedLines,
                        validation: validation,
                        vid: songData.vid
                    };
                } catch (parseErr) {
                    console.error(`'${filePath}' 파일 처리 중 오류 발생:`, parseErr);
                    return null; // 오류 발생 시 null 반환
                }
            });
            
            const batchResults = await Promise.all(songPromises);
            newSongCache.push(...batchResults.filter(song => song !== null));
        }
        
        songCache = newSongCache;
        
        // Map 인덱스 생성 (빠른 검색을 위해)
        songCacheMap = new Map(songCache.map(song => [song.name, song]));
        // 소문자 키 맵 생성 (대소문자 무시 검색을 위해)
        songCacheKeyMap = new Map(songCache.map(song => [song.name.toLowerCase(), song.name]));
        
        isCacheReady = true; // 캐시 로딩 완료, 이제 서버는 모든 요청을 처리할 준비가 됨
        console.log(`${songCache.length}개의 노래 데이터를 메모리에 로드했으며, 서버가 정상적으로 요청을 처리할 준비를 마쳤습니다.`);
    } catch (err) {
        console.error('노래 데이터 로드 중 심각한 오류 발생:', err);
        // 캐시 리로딩 실패 시 서버를 종료하지 않고 에러를 던짐
        throw err;
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


function cleanUtatenHtml(html) {
    if (!html) return "";
    
    // 1. <span class="rt">...</span> (읽는 법) 제거
    let text = html.replace(/<span class="rt">.*?<\/span>/g, '');
    
    // 2. <br/>, <br>을 개행 문자로 변경
    text = text.replace(/<br\s*\/?>/gi, '\n');
    
    // 3. 나머지 모든 HTML 태그 제거
    text = text.replace(/<[^>]*>/g, '');
    
    // 4. HTML 엔티티 디코딩
    text = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
    
    // 5. 트림
    return text.trim();
}

/**
 * 노래 번역 프로세스를 처리하는 핵심 함수
 * @param {string} title - 노래 제목
 * @returns {Promise<object>} - 업데이트된 노래 데이터
 */
async function processTranslation(title) {
    console.log(`[processTranslation] 시작 : [${title}]`);

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
                if (japanData) {
                    alpha += "\n\n";
                    alpha += `한국어 번역 시, 다음 번역을 그대로 사용할 것. "${japanData.kr}"`;
                    if(japanData.jp !== japanData.pr) alpha += `\n한글 발음을 적을 때, 다음을 그대로 사용할 것. "${japanData.pr}"`;
                }
            }

            context.C0 = cleanUtatenHtml(context.C0);
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
            const parsedResult = JSON.parse(translatedLine);
            
            if (parsedResult && parsedResult.K0) {
                // 저장할 때는 원본(태그 포함) T0를 O0에 강제 저장 (LLM 응답 무시 및 소실 방지)
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
    console.log(`[processTranslation] 끝 : [${title}]`);
    
    return songData;
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

    // 캐시를 무시하고 입력된 title 그대로 경로 생성 (파일명을 name과 일치시키기 위함)
    const safePath = getSafeSongPath(title, false);
    
    // 기존 파일이 존재하고 대소문자가 다른 경우 이름 변경 처리
    // (macOS/Windows 등 대소문자 구분 없는 파일 시스템에서 덮어쓰기 시 원래 파일명 유지되는 문제 해결)
    if (isCacheReady && songCacheKeyMap && songCacheKeyMap.has(title.toLowerCase())) {
        const existingTitle = songCacheKeyMap.get(title.toLowerCase());
        // 기존 이름과 새 이름이 다르면 (대소문자 차이)
        if (existingTitle !== title) {
            const oldPath = getSafeSongPath(existingTitle, false); // 기존 경로
            try {
                // 기존 파일이 실제로 존재하는지 확인 후 이름 변경
                await fs.promises.access(oldPath);
                await fs.promises.rename(oldPath, safePath);
                console.log(`파일명을 변경했습니다: ${existingTitle} -> ${title}`);
            } catch (err) {
                // 파일이 없을 수 있음 (새로 생성하는 경우 등), 에러 로그만 남기고 진행
                console.log(`기존 파일(${existingTitle}) 접근 실패 또는 이름 변경 실패 (새 파일로 생성됨): ${err.message}`);
            }
        }
    }

    await fs.promises.writeFile(safePath, JSON.stringify(songData, null, 2));
    
    // 캐시를 효율적으로 업데이트 (전체 리프레시 대신)
    const existingSongIndex = songCache.findIndex(song => song.name === title);
    if (existingSongIndex > -1) {
        songCache[existingSongIndex] = songData;
    } else {
        songCache.unshift(songData); // 새 노래를 맨 앞에 추가
    }
    songCacheMap.set(title, songData); // Map도 함께 업데이트
    songCacheKeyMap.set(title.toLowerCase(), title); // KeyMap도 업데이트
    console.log(`메모리 캐시를 효율적으로 업데이트했습니다: ${title}`);
    
    // POST-Redirect-GET(PRG) 패턴 적용:
    // POST /add 응답을 바로 렌더링하면 브라우저 주소창이 /add로 남아있고,
    // 이후 번역 완료 시 reload() 등이 "폼 재전송"을 유발해 /add가 다시 실행될 수 있습니다.
    // 303 See Other로 /detail/:title(GET)로 이동시켜 URL을 안정화합니다.
    return res.redirect(303, `/detail/${encodeURIComponent(title)}`);
});

// 대량 임포트 페이지 렌더링
app.get('/bulk-import', (req, res) => {
    res.render('bulkImport');
});

// Utaten 데이터 대량 임포트 및 분석 처리
app.post('/bulk-import-utaten', async (req, res) => {
    // 요청 타임아웃 방지 (대량 처리 시 시간 소요)
    req.setTimeout(0); 

    const { songs, prefix, tags, concurrency } = req.body;
    if (!songs || !Array.isArray(songs)) {
        return res.status(400).send('잘못된 데이터 형식입니다.');
    }

    // 동시 처리 개수 설정 (기본값 1)
    const batchSize = parseInt(concurrency) || 1;

    // 태그 처리
    const commonTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    // 기본 태그에 사용자 입력 태그 추가
    const finalTags = ['UtatenImport', ...commonTags];

    // Streaming response headers 설정
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    res.write(`총 ${songs.length}개의 노래 처리를 시작합니다.\n`);
    if (prefix) res.write(`파일명 접두어: "${prefix}"\n`);
    if (commonTags.length > 0) res.write(`적용 태그: ${commonTags.join(', ')}\n`);
    res.write(`동시 처리 개수: ${batchSize}\n`);
    
    console.log(`[Bulk Import] 총 ${songs.length}개 노래 처리 시작 (Prefix: ${prefix || 'None'}, Tags: ${commonTags.join(', ')}, Concurrency: ${batchSize})`);

    // 노래 하나를 처리하는 함수
    const processSong = async (item, index) => {
        const oriTitle = item.title;
        const artist = item.artist;
        const youtubeUrl = item.youtube_url;
        // ruby_html이 null이나 undefined인 경우 빈 문자열로 처리
        const rubyHtml = (item.ruby_html || '').replace(/<br\s*\/?>/gi, '<br>');

        // ruby_html이 없으면 스킵
        if (!rubyHtml || rubyHtml.trim() === '') {
            res.write(`\n[${index+1}/${songs.length}] "${oriTitle}" 스킵 (가사 데이터 없음)\n`);
            return;
        }

        try {
            res.write(`\n[${index+1}/${songs.length}] "${oriTitle}" (${artist}) 처리 시작...\n`);
            
            // 1. 제목 번역 (한글/영문)
            let korName = '';
            let engName = '';
            
            try {
                const nameCompletion = await openai.chat.completions.create({
                    model: isUsingDeepSeekDirectly ? "deepseek-chat" : OPENROUTER_GEMINI, 
                    messages: [
                        {
                            role: "system",
                            content: `Given a song title in its original language, provide the Korean and English translations. Respond in JSON format: {"kor_name": "Korean translation", "eng_name": "English translation"}`
                        },
                        {
                            role: "user",
                            content: `Original title: ${oriTitle}`
                        }
                    ],
                    response_format: { type: "json_object" }
                });
                
                const nameResult = JSON.parse(nameCompletion.choices[0].message.content.replaceAll("```json", "").replaceAll("```", "").trim());
                korName = nameResult.kor_name || '';
                engName = nameResult.eng_name || '';
                res.write(`  - [${index+1}] 제목 번역: ${korName} / ${engName}\n`);
            } catch (nameErr) {
                console.error(`제목 번역 실패 (${oriTitle}):`, nameErr);
                res.write(`  - [${index+1}] ⚠️ 제목 번역 실패 (기본값 사용)\n`);
                engName = oriTitle; // 실패 시 원어 제목 사용
            }

            // 2. 파일명 생성
            let safeFileName = engName.trim()
                .replace(/\s+/g, '_')       
                .replace(/[^a-zA-Z0-9_\-]/g, ''); 
            
            if (safeFileName.length < 2) {
                 safeFileName = oriTitle.trim()
                    .replace(/\s+/g, '_')
                    .replace(/[^a-zA-Z0-9_\-]/g, '') || 'unknown_song';
            }

            if (prefix) {
                const safePrefix = prefix.trim()
                    .replace(/\s+/g, '_')
                    .replace(/[^a-zA-Z0-9_\-]/g, '');
                if (safePrefix) {
                    safeFileName = `${safePrefix}_${safeFileName}`;
                }
            }
            
            const finalTitle = safeFileName; 

            // 3. 데이터 준비
            let vid = '';
            try {
                if (youtubeUrl) {
                    const urlObj = new URL(youtubeUrl);
                    vid = urlObj.searchParams.get('v') || '';
                }
            } catch (e) {
                console.warn(`Invalid YouTube URL for ${oriTitle}: ${youtubeUrl}`);
            }
            
            const text = rubyHtml;
            
            let trimedTextArr;
            if(text.includes("<br") || text.includes("<BR")) {
                trimedTextArr = text
                    .replace(/\r/g, '')
                    .replace(/\n/g, '')
                    .split(/<br\s*\/?>/i) 
                    .map(line => line.trim())
                    .filter(x => x !== '');
            } else {
                trimedTextArr = text
                    .replace(/\r/g, '')
                    .split("\n")
                    .map(line => line.trim())
                    .filter(x => x !== '');
            }
            
            const uniqueLines = [...new Set(trimedTextArr)];

            const artistObj = {
                ori_name: artist,
                kor_name: '',
                eng_name: ''
            };

            const songData = {
                name: finalTitle, 
                ori_name: oriTitle, 
                kor_name: korName,
                eng_name: engName,
                vid: "",
                artist: artistObj,
                tags: finalTags,
                text: text.replaceAll("  ", " "),
                createdAt: new Date().toISOString(),
                p1: uniqueLines
            };

            // 4. 파일 저장
            const safePath = `songs/${finalTitle}.json`;
            await fs.promises.writeFile(safePath, JSON.stringify(songData, null, 2));
            
            // 캐시 업데이트
            const existingSongIndex = songCache.findIndex(song => song.name === finalTitle);
            if (existingSongIndex > -1) {
                songCache[existingSongIndex] = songData;
            } else {
                songCache.unshift(songData);
            }
            songCacheMap.set(finalTitle, songData);
            songCacheKeyMap.set(finalTitle.toLowerCase(), finalTitle);

            res.write(`  - [${index+1}] 기본 데이터 저장 완료. AI 분석 시작...\n`);

            // 5. 분석 실행
            await processTranslation(finalTitle);
            
            res.write(`  - [${index+1}] 분석 완료.\n`);

        } catch (err) {
            console.error(`[Bulk Import] Error processing ${oriTitle}:`, err);
            res.write(`  - [${index+1}] ❌ 오류 발생: ${err.message}\n`);
        }
    };

    // 동시성 제어하며 처리 실행 (Sliding Window 방식)
    const activePromises = new Set();

    for (let i = 0; i < songs.length; i++) {
        // 현재 실행 중인 작업이 설정된 동시 처리 개수보다 많거나 같으면, 하나가 끝날 때까지 대기
        if (activePromises.size >= batchSize) {
            await Promise.race(activePromises);
        }

        const song = songs[i];
        
        // 작업 시작 (에러 핸들링은 processSong 내부에서 처리됨)
        const promise = processSong(song, i);
        
        // 작업이 끝나면 Set에서 제거하는 래퍼 프로미스
        // processSong은 내부에서 try-catch로 에러를 처리하므로 항상 성공적으로 resolve된다고 가정
        const wrapper = promise.then(() => {
            activePromises.delete(wrapper);
        });
        
        activePromises.add(wrapper);
    }
    
    // 남은 작업들이 완료될 때까지 대기
    await Promise.all(activePromises);

    // Bulk Import 후 이름 동기화 실행
    res.write(`\n[System] 파일명과 내부 이름 동기화 검사 중...\n`);
    const syncedCount = await syncAllSongNames();
    if (syncedCount > 0) {
        res.write(`[System] ${syncedCount}개의 파일 이름을 동기화했습니다.\n`);
    } else {
        res.write(`[System] 파일 이름 동기화 완료 (변경 사항 없음).\n`);
    }

    res.write(`\n=== 모든 작업이 완료되었습니다 ===\n`);
    res.end();
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
        songCacheMap.set(title, songCache[songIndex]); // Map도 함께 업데이트
        // KeyMap은 title이 바뀌지 않았으므로 업데이트 불필요 (만약 이름 변경 기능이 있다면 필요)
        console.log(`메모리 캐시를 효율적으로 업데이트했습니다: ${title}`);
    } else {
        // 만약 캐시에 없다면 (이론상 발생하기 어려움), 전체 리프레시로 안전하게 처리
        await refreshSongCache();
        console.log(`캐시에 없는 노래(${title})가 업데이트되어 전체 캐시를 갱신합니다.`);
    }
    
    res.json({ success: true, message: '정보가 수정되었습니다.' });
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
                        // 1. T0 또는 O0와 정확히 일치하는 번역된 라인 찾기
                        let translatedLine = songData.translatedLines.find(
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
    const sort = req.query.sort || 'popular'; // 기본값 인기순
    let filteredSongs = searchSongs(searchQuery, ['개발용']);
    
    // 정렬 로직
    if (sort === 'popular') {
        filteredSongs.sort((a, b) => {
            const viewsA = viewCounts[a.name] || 0;
            const viewsB = viewCounts[b.name] || 0;
            return viewsB - viewsA;
        });
    } else if (sort === 'latest') {
        filteredSongs.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        });
    }

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
        totalResults: filteredSongs.length,
        currentSort: sort
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

// SSE를 이용한 번역 스트리밍 엔드포인트
app.get('/api/translate/stream/:title', async (req, res) => {
    const title = req.params.title;
    console.log(`[SSE] 번역 스트리밍 시작 : [${title}]`);

    // SSE 헤더 설정
    // NOTE: 실서버(특히 Nginx/Cloudflare 등 프록시) 환경에서는 응답 버퍼링/압축으로 인해
    // SSE 이벤트가 "끝날 때까지" 클라이언트에 전달되지 않을 수 있습니다.
    // 아래 헤더/flush/heartbeat는 이를 완화합니다.
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform'); // no-transform: 프록시/중간자 변형 방지
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Nginx buffering off 힌트
    res.setHeader('Content-Encoding', 'none'); // 일부 환경에서 압축/변형 방지 힌트
    
    // 소켓/요청 타임아웃 방지 (일부 호스팅에서 기본 타임아웃 존재)
    try {
        req.setTimeout(0);
        req.socket?.setTimeout?.(0);
        req.socket?.setNoDelay?.(true);
    } catch {}

    // 헤더 즉시 전송 (프록시 버퍼링 완화)
    if (typeof res.flushHeaders === 'function') {
        res.flushHeaders();
    }

    // 프록시 버퍼링을 깨기 위한 패딩(2KB+) 주석 + 초기 keep-alive
    // (일부 프록시는 일정 바이트 이상 쌓이기 전까지 클라이언트로 전달하지 않습니다)
    res.write(`: sse-open ${' '.repeat(2048)}\n\n`);

    // heartbeat: 연결 유지 + 버퍼링 완화
    const heartbeat = setInterval(() => {
        try {
            res.write(`: ping ${Date.now()}\n\n`);
        } catch {}
    }, 15000);

    const cleanup = () => {
        try { clearInterval(heartbeat); } catch {}
    };

    // 클라이언트가 탭을 닫거나 네트워크가 끊긴 경우
    req.on('close', cleanup);
    res.on('close', cleanup);

    try {
        const filePath = getSafeSongPath(title);
        const data = await fs.promises.readFile(filePath, 'utf8');
        let songData = JSON.parse(data);

        if (!Array.isArray(songData.p1)) {
            throw new Error('잘못된 노래 데이터 형식: p1이 배열이 아닙니다.');
        }

        const contextText = toContextObj(songData.p1);
        songData.contextText = contextText;

        let parsedTranslatedLines = [];
        let failedLines = [];
        
        const totalLines = contextText.length;
        let completedLines = 0;

        // 동시성 제어를 위한 Promise 배열 생성
        // Promise.all로 실행하되, 각 Promise 완료 시점에 이벤트를 전송
        const translationPromises = contextText.map(async (context) => {
            try {
                let alpha = "";
                if(songData.japanSongData){
                    const japanData = songData.japanSongData.find(x=>x.jp===context.T0);
                    if (japanData) {
                        alpha += "\n\n";
                        alpha += `한국어 번역 시, 다음 번역을 그대로 사용할 것. "${japanData.kr}"`;
                        if(japanData.jp !== japanData.pr) alpha += `\n한글 발음을 적을 때, 다음을 그대로 사용할 것. "${japanData.pr}"`;
                    }
                }

                context.C0 = cleanUtatenHtml(context.C0);
                const requestBody = {
                    model: isUsingDeepSeekDirectly ? "deepseek-chat" : chatModel,
                    max_tokens: 8192,
                    temperature: 0.5,
                    messages: [
                        { role: "system", content: MSG },
                        { role: 'user', content: JSON.stringify(context)+alpha },
                    ],
                    response_format: { type: "json_object" }
                };

                if (!isUsingDeepSeekDirectly) {
                    requestBody.provider = {
                        ignore: ['InferenceNet', 'Together']
                    };
                }

                const completion = await openai.chat.completions.create(requestBody);

                const translatedLine = completion.choices[0].message.content.replaceAll("```json", "").replaceAll("```", "").trim();
                const parsedResult = JSON.parse(translatedLine);
                
                if (parsedResult && parsedResult.K0) {
                    parsedResult.O0 = parsedResult.O0 || context.T0;
                    parsedTranslatedLines.push(parsedResult);
                } else {
                    failedLines.push(context);
                }
            } catch (error) {
                console.error('번역 오류:', error);
                failedLines.push(context);
            } finally {
                // 작업 완료 시 진행률 업데이트
                completedLines++;
                const percentage = (completedLines / totalLines) * 100;
                res.write(`data: ${JSON.stringify({ type: 'progress', current: completedLines, total: totalLines, percentage: percentage })}\n\n`);
            }
        });

        await Promise.all(translationPromises);

        // 결과 저장
        songData.translatedLines = parsedTranslatedLines;
        songData.failedLines = failedLines;

        await fs.promises.writeFile(filePath, JSON.stringify(songData, null, 2));
        
        // 캐시 업데이트
        const songIndex = songCache.findIndex(song => song.name === title);
        if (songIndex > -1) {
            songCache[songIndex] = songData;
            songCacheMap.set(title, songData);
        }

        console.log(`[SSE] 번역 완료 : [${title}]`);
        res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
        cleanup();
        res.end();

    } catch (error) {
        console.error('[SSE] 오류 발생:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
        cleanup();
        res.end();
    }
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

            context.C0 = cleanUtatenHtml(context.C0);
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
            const translatedLine = completion.choices[0].message.content;

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
    res.json({ success: true, message: '재번역이 완료되었습니다.' });
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
                    
                    if (invalidLine.isMissing) {
                        // 누락된 번역인 경우 배열에 추가
                        songData.translatedLines.push(parsedResult);
                        console.log(`[${title}] 누락된 라인 재번역 및 추가 성공`);
                    } else {
                        // 기존 translatedLines에서 해당 라인 교체
                        songData.translatedLines[invalidLine.index] = parsedResult;
                        console.log(`[${title}] 라인 ${invalidLine.index} 재번역 성공`);
                    }

                    successCount++;
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
            songCacheMap.set(title, songData); // Map도 함께 업데이트
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
    
    const contextText = songData.contextText.find(x=>x.T0?.trim() === req.body.originalLine?.trim() || x.O0?.trim() === req.body.originalLine?.trim());

    if (!contextText) {
        return res.status(400).send('원본 가사 없음');
    }

    try {
        contextText.C0 = cleanUtatenHtml(contextText.C0);
        const requestBody = {
            model: isUsingDeepSeekDirectly ? "deepseek-chat" : chatModel,
            max_tokens: 8192,
            temperature: 0.2,
            messages: [
                { role: "system", content: MSG },
                { role: 'user', content: JSON.stringify(contextText) },
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

        if (parsedResult.error) {
             throw new Error(`AI 응답 에러: ${parsedResult.error}`);
        }

        if (!parsedResult.T0) {
            throw new Error('AI 응답 데이터에 필수 필드(T0)가 누락되었습니다.');
        }

        parsedResult.O0 = contextText.T0;
        const foundIdx = songData.translatedLines.findIndex(t=>t.T0===req.body.originalLine||t.O0===parsedResult.O0);   
        
        if(foundIdx===-1){
            songData.translatedLines.push(parsedResult);
        }
        else{
            songData.translatedLines[foundIdx] = parsedResult;
        }
        songData.failedLines = songData.failedLines.filter(x=> !songData.translatedLines.some(y => y.T0 === x.T0));

        await fs.promises.writeFile(filePath, JSON.stringify(songData, null, 2));
        res.json({ success: true, message: '라인 재번역이 완료되었습니다.' });
    } catch (error) {
        console.error('특정 라인 재번역 오류:', error);
        error.status = 500;
        // 원본 에러 메시지를 포함하여 클라이언트에 전달
        error.message = `특정 라인 재번역 중 오류 발생: ${error.message}`;
        throw error;
    }
});

app.post('/correct-with-message/:title', async (req, res) => {
    const title = req.params.title;
    const filePath = getSafeSongPath(title);
    const data = await fs.promises.readFile(filePath, 'utf8');
    let songData = JSON.parse(data);
    
    const contextText = songData.contextText.find(x=>x.T0?.trim() === req.body.originalLine?.trim() || x.O0?.trim() === req.body.originalLine?.trim());

    if (!contextText) {
        return res.status(400).send('원본 가사 없음');
    }

    try {
        contextText.C0 = cleanUtatenHtml(contextText.C0);
        const requestBody = {
            model: isUsingDeepSeekDirectly ? "deepseek-chat" : OPENROUTER_CHATGPT,
            max_tokens: 8192,
            temperature: 0.2,
            messages: [
                { role: "system", content: MSG },
                { role: 'user', content: JSON.stringify(contextText) + "\n\n" + req.body.correctionMessage },
            ],
            response_format: { type: "json_object" }
        };
        console.log(req.body.correctionMessage);

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

        if (parsedResult.error) {
             throw new Error(`AI 응답 에러: ${parsedResult.error}`);
        }

        if (!parsedResult.T0) {
            throw new Error('AI 응답 데이터에 필수 필드(T0)가 누락되었습니다.');
        }

        parsedResult.O0 = contextText.T0;
        const foundIdx = songData.translatedLines.findIndex(t=>t.T0===req.body.originalLine||t.O0===parsedResult.O0);   
        
        if(foundIdx===-1){
            songData.translatedLines.push(parsedResult);
        }
        else{
            songData.translatedLines[foundIdx] = parsedResult;
        }
        songData.failedLines = songData.failedLines.filter(x=> !songData.translatedLines.some(y => y.T0 === x.T0));

        await fs.promises.writeFile(filePath, JSON.stringify(songData, null, 2));
        res.json({ success: true, message: '요청하신 내용으로 수정되었습니다.' });
    } catch (error) {
        console.error('특정 라인 재번역 오류:', error);
        error.status = 500;
        // 원본 에러 메시지를 포함하여 클라이언트에 전달
        error.message = `특정 라인 재번역 중 오류 발생: ${error.message}`;
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
            songCacheMap.set(title, songData); // Map도 함께 업데이트
            console.log(`메모리 캐시를 효율적으로 업데이트했습니다: ${title}`);
        }

        res.json({ success: true, message: '가사가 수정되었습니다.' });

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
                // 1. 정확한 매칭 시도
                let found = songData.translatedLines.find(y => 
                    y.T0.trim().toLowerCase() === x.trim().toLowerCase() ||
                    (y.O0 && y.O0.trim().toLowerCase() === x.trim().toLowerCase())
                );

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
            model: isUsingDeepSeekDirectly ? "deepseek-chat" : OPENROUTER_GEMINI,
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

// Puppeteer를 사용한 YouTube VID 검색 함수
async function findYoutubeVid(artist, title) {
    let puppeteer;
    try {
        // 동적으로 puppeteer 모듈 로드
        puppeteer = (await import('puppeteer')).default;
    } catch (error) {
        console.warn('Puppeteer 모듈을 찾을 수 없습니다. YouTube 검색 기능을 건너뜁니다.');
        return null;
    }

    let browser = null;
    try {
        // 브라우저 실행 옵션 최적화
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox', 
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });
        const page = await browser.newPage();
        
        // 리소스 로드 최적화 (이미지, 폰트 등 차단)
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });
        
        // User Agent 설정
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        const query = encodeURIComponent(`${artist} ${title}`);
        const searchUrl = `https://www.youtube.com/results?search_query=${query}`;
        
        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
        
        // 비디오 링크 셀렉터 대기
        const videoSelector = 'a#video-title';
        try {
            await page.waitForSelector(videoSelector, { timeout: 10000 });
        } catch (e) {
            console.log('Selector wait timeout, searching in DOM...');
        }
        
        // 첫 번째 비디오의 href 속성 가져오기
        const href = await page.$eval(videoSelector, el => el.href).catch(() => null);
        
        if (href) {
            const urlObj = new URL(href);
            const vid = urlObj.searchParams.get('v');
            return vid;
        }
        
        return null;
    } catch (error) {
        console.error('YouTube search error:', error);
        return null;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 태그 통계 집계 함수
function getTagStats() {
    const tagStats = {};
    
    songCache.forEach(song => {
        if (song.tags && Array.isArray(song.tags)) {
            song.tags.forEach(tag => {
                tagStats[tag] = (tagStats[tag] || 0) + 1;
            });
        }
    });
    
    // 카운트 기준 내림차순 정렬
    return Object.entries(tagStats)
        .sort(([, a], [, b]) => b - a)
        .map(([tag, count]) => ({ tag, count }));
}

// 관리자 - 태그 관리 페이지
app.get('/admin/tags', (req, res) => {
    try {
        const tags = getTagStats();
        res.render('adminTags', { tags });
    } catch (error) {
        console.error('태그 관리 페이지 오류:', error);
        res.status(500).send('서버 오류가 발생했습니다.');
    }
});

// 관리자 - 태그 일괄 변경 API
app.post('/admin/tags/replace', async (req, res) => {
    const { oldTag, newTag } = req.body;
    
    if (!oldTag || !newTag) {
        return res.status(400).json({ success: false, message: '변경 전/후 태그가 모두 필요합니다.' });
    }
    
    if (oldTag === newTag) {
        return res.status(400).json({ success: false, message: '변경 전과 후의 태그가 같습니다.' });
    }
    
    try {
        let updatedCount = 0;
        const updatePromises = [];
        
        // 캐시된 모든 노래 순회
        for (let i = 0; i < songCache.length; i++) {
            const song = songCache[i];
            
            if (song.tags && song.tags.includes(oldTag)) {
                // 태그 변경
                const newTags = song.tags.map(t => t === oldTag ? newTag : t);
                
                // 중복 제거 (이미 newTag가 있었을 경우)
                song.tags = [...new Set(newTags)];
                
                // 파일 저장 작업 추가 (중요: songCache 데이터를 쓰지 않고, 파일을 읽어서 부분 수정해야 함)
                const filePath = getSafeSongPath(song.name);
                
                // 클로저로 filePath와 변경할 태그 정보 캡처
                updatePromises.push((async (path, oTag, nTag) => {
                    try {
                        // 1. 원본 파일 읽기
                        const fileData = await fs.promises.readFile(path, 'utf8');
                        const fullSongData = JSON.parse(fileData);

                        // 2. 원본 데이터에서 태그 수정
                        if (fullSongData.tags && fullSongData.tags.includes(oTag)) {
                            const updatedTags = fullSongData.tags.map(t => t === oTag ? nTag : t);
                            fullSongData.tags = [...new Set(updatedTags)];
                            
                            // 3. 파일 저장 (가사 데이터 보존됨)
                            await fs.promises.writeFile(path, JSON.stringify(fullSongData, null, 2));
                            return true;
                        }
                        return false;
                    } catch (err) {
                        console.error(`파일 업데이트 실패 (${path}):`, err);
                        return false;
                    }
                })(filePath, oldTag, newTag));
                
                updatedCount++;
            }
        }
        
        if (updatedCount === 0) {
            return res.json({ success: true, message: '해당 태그를 가진 노래가 없습니다.', count: 0 });
        }
        
        // 병렬로 파일 저장 실행
        await Promise.all(updatePromises);
        
        // 캐시 맵 업데이트 (참조형이라 songCache 수정 시 자동 반영되지만, 명시적 갱신이 안전할 수 있음)
        songCache.forEach(song => songCacheMap.set(song.name, song));
        
        console.log(`태그 일괄 변경 완료: "${oldTag}" -> "${newTag}" (${updatedCount}곡)`);
        
        res.json({ 
            success: true, 
            message: `${updatedCount}개의 노래에서 태그가 변경되었습니다.`, 
            count: updatedCount 
        });
        
    } catch (error) {
        console.error('태그 일괄 변경 중 오류:', error);
        res.status(500).json({ success: false, message: '태그 변경 중 서버 오류가 발생했습니다.' });
    }
});

// 아티스트 통계 집계 함수
function getArtistStats() {
    const artistStats = {};
    
    songCache.forEach(song => {
        // 아티스트 정보 추출 (문자열 또는 객체)
        let oriName = "";
        let korName = "";
        let engName = "";
        
        if (typeof song.artist === 'object') {
            oriName = song.artist.ori_name || "";
            korName = song.artist.kor_name || "";
            engName = song.artist.eng_name || "";
            
            // ori_name이 없으면 name 필드 사용 시도
            if (!oriName && song.artist.name) oriName = song.artist.name;
        } else {
            oriName = song.artist || "";
        }
        
        if (!oriName) return; // 원어명이 없으면 건너뜀
        
        if (!artistStats[oriName]) {
            artistStats[oriName] = {
                ori_name: oriName,
                kor_name: korName,
                eng_name: engName,
                count: 0
            };
        } else {
            // 이미 있는 경우, kor_name/eng_name이 비어있으면 채워넣기 시도
            if (!artistStats[oriName].kor_name && korName) artistStats[oriName].kor_name = korName;
            if (!artistStats[oriName].eng_name && engName) artistStats[oriName].eng_name = engName;
        }
        
        artistStats[oriName].count++;
    });
    
    // 카운트 기준 내림차순 정렬
    return Object.values(artistStats)
        .sort((a, b) => b.count - a.count);
}

// 관리자 - 아티스트 관리 페이지
app.get('/admin/artists', (req, res) => {
    try {
        const artists = getArtistStats();
        res.render('adminArtists', { artists });
    } catch (error) {
        console.error('아티스트 관리 페이지 오류:', error);
        res.status(500).send('서버 오류가 발생했습니다.');
    }
});

// 관리자 - 아티스트 정보 일괄 수정 API
app.post('/admin/artists/update', async (req, res) => {
    const { targetOriName, newKorName, newEngName } = req.body;
    
    if (!targetOriName) {
        return res.status(400).json({ success: false, message: '대상 아티스트(원어명)가 필요합니다.' });
    }
    
    try {
        let updatedCount = 0;
        const updatePromises = [];
        
        // 캐시된 모든 노래 순회
        for (let i = 0; i < songCache.length; i++) {
            const song = songCache[i];
            let isMatch = false;
            
            // 아티스트 매칭 확인
            if (typeof song.artist === 'object') {
                if ((song.artist.ori_name === targetOriName) || (song.artist.name === targetOriName)) {
                    isMatch = true;
                }
            } else if (song.artist === targetOriName) {
                isMatch = true;
            }
            
            if (isMatch) {
                // 아티스트 정보 업데이트 (항상 객체 형태로 변환)
                if (typeof song.artist !== 'object') {
                    song.artist = {
                        ori_name: targetOriName,
                        kor_name: newKorName || "",
                        eng_name: newEngName || ""
                    };
                } else {
                    song.artist.ori_name = targetOriName; // 원어명도 통일성을 위해 덮어쓰기 가능
                    song.artist.kor_name = newKorName || song.artist.kor_name || "";
                    song.artist.eng_name = newEngName || song.artist.eng_name || "";
                }
                
                // 파일 저장 작업 추가 (중요: songCache 데이터를 쓰지 않고, 파일을 읽어서 부분 수정해야 함)
                const filePath = getSafeSongPath(song.name);
                
                // 클로저로 filePath와 변경할 아티스트 정보 캡처
                updatePromises.push((async (path, tOri, nKor, nEng) => {
                    try {
                        // 1. 원본 파일 읽기
                        const fileData = await fs.promises.readFile(path, 'utf8');
                        const fullSongData = JSON.parse(fileData);

                        // 2. 원본 데이터에서 아티스트 수정
                        let isFileMatch = false;
                        if (typeof fullSongData.artist === 'object') {
                            // 원어명이나 이름이 매칭되는 경우
                            if ((fullSongData.artist.ori_name === tOri) || (fullSongData.artist.name === tOri)) {
                                isFileMatch = true;
                            }
                        } else if (fullSongData.artist === tOri) {
                            isFileMatch = true;
                        }

                        if (isFileMatch) {
                            if (typeof fullSongData.artist !== 'object') {
                                fullSongData.artist = {
                                    ori_name: tOri,
                                    kor_name: nKor || "",
                                    eng_name: nEng || ""
                                };
                            } else {
                                fullSongData.artist.ori_name = tOri;
                                fullSongData.artist.kor_name = nKor || fullSongData.artist.kor_name || "";
                                fullSongData.artist.eng_name = nEng || fullSongData.artist.eng_name || "";
                            }

                            // 3. 파일 저장 (가사 데이터 보존됨)
                            await fs.promises.writeFile(path, JSON.stringify(fullSongData, null, 2));
                            return true;
                        }
                        return false;
                    } catch (err) {
                        console.error(`아티스트 업데이트 실패 (${path}):`, err);
                        return false;
                    }
                })(filePath, targetOriName, newKorName, newEngName));
                
                updatedCount++;
            }
        }
        
        if (updatedCount === 0) {
            return res.json({ success: true, message: '해당 아티스트의 노래를 찾을 수 없습니다.', count: 0 });
        }
        
        // 병렬로 파일 저장 실행
        await Promise.all(updatePromises);
        
        // 캐시 맵 업데이트
        songCache.forEach(song => songCacheMap.set(song.name, song));
        
        console.log(`아티스트 정보 일괄 수정 완료: "${targetOriName}" (${updatedCount}곡)`);
        
        res.json({ 
            success: true, 
            message: `${updatedCount}개의 노래에서 아티스트 정보가 수정되었습니다.`, 
            count: updatedCount 
        });
        
    } catch (error) {
        console.error('아티스트 정보 수정 중 오류:', error);
        res.status(500).json({ success: false, message: '아티스트 정보 수정 중 서버 오류가 발생했습니다.' });
    }
});

// 관리자 - 자동 VID 추출 페이지
app.get('/admin/auto-vid', async (req, res) => {
    try {
        // 1. VID가 없는 노래 필터링
        const songsMissingVid = songCache.filter(song => {
            return (!song.vid || song.vid.trim() === "") && (!song.tags || !song.tags.includes('개발용'));
        }).map(song => ({
            artist: typeof song.artist === 'object' ? (song.artist.ori_name || song.artist.name) : song.artist,
            title: song.ori_name || song.name,
            filename: song.name,
            vid: song.vid
        }));
        
        // 2. VID가 있는 노래들 (유효성 검사용) - 개발용 제외
        const songsWithVid = songCache.filter(song => {
            return (song.vid && song.vid.trim() !== "") && (!song.tags || !song.tags.includes('개발용'));
        }).map(song => ({
            filename: song.name,
            vid: song.vid
        }));
        
        res.render('autoVid', { 
            songs: songsMissingVid,
            songsWithVid: songsWithVid 
        });
    } catch (error) {
        console.error('Auto VID page error:', error);
        res.status(500).send('Server Error');
    }
});

// API - 특정 노래의 VID 강제 재검색 및 교체 (에러 발생 시 사용)
app.post('/api/songs/refresh-vid', async (req, res) => {
    const { filename, oldVid } = req.body;
    
    if (!filename) {
        return res.status(400).json({ success: false, message: 'Filename required' });
    }
    
    try {
        // 1. 파일 읽기
        const filePath = getSafeSongPath(filename);
        const data = await fs.promises.readFile(filePath, 'utf8');
        const songData = JSON.parse(data);
        
        // 2. 검색 정보 추출
        const artistName = typeof songData.artist === 'object' ? 
            (songData.artist.ori_name || songData.artist.name || "") : 
            (songData.artist || "");
        const titleName = songData.ori_name || songData.name || "";
        
        if (!artistName && !titleName) {
             return res.json({ success: false, message: 'Artist or Title missing' });
        }

        // 3. Puppeteer 검색
        // 기존과 동일한 검색어라도, YouTube 검색 결과가 바뀌었을 수 있고
        // Puppeteer 로직을 개선하여 '비디오만' 필터링하거나 다른 결과를 가져오도록 할 수 있음.
        // 여기서는 단순 재검색을 수행하되, 만약 검색된 결과가 oldVid와 같다면
        // (삭제된 영상이 여전히 검색 상위에 뜰 수도 있으므로) 주의가 필요함.
        // 하지만 일단 재검색 시도.
        
        console.log(`Refetching VID for: ${artistName} - ${titleName} (Old: ${oldVid})`);
        
        // TODO: Puppeteer 검색 시 oldVid를 제외하고 찾거나, 
        // 검색 결과 목록 중 재생 가능한 것을 찾는 로직이 추가되면 좋음.
        // 현재는 findYoutubeVid가 첫 번째 결과만 가져오므로, 
        // 검색어가 동일하면 같은 결과가 나올 확률이 높음.
        // 개선안: 검색어에 'official' 등을 추가하거나, 검색 로직을 수정해야 함.
        // 여기서는 일단 'official audio'나 'mv' 등을 붙여서 검색 시도해볼 수 있음.
        
        let vid = await findYoutubeVid(artistName, titleName);
        
        // 만약 찾은 VID가 에러난 VID와 같다면, 검색어를 조금 바꿔서 재시도
        if (vid === oldVid) {
            console.log('Same VID found, retrying with modified query...');
            vid = await findYoutubeVid(artistName, titleName + " official");
        }
        
        if (vid && vid !== oldVid) {
            // 4. 저장
            songData.vid = vid;
            await fs.promises.writeFile(filePath, JSON.stringify(songData, null, 2));
            
            // 캐시 업데이트
            const songIndex = songCache.findIndex(s => s.name === filename);
            if (songIndex > -1) {
                songCache[songIndex] = songData;
                songCacheMap.set(filename, songData);
            }
            
            console.log(`Refreshed VID: ${oldVid} -> ${vid}`);
            return res.json({ success: true, vid, oldVid });
        } else {
            console.log('New VID not found or same as old one');
            return res.json({ success: false, message: 'New VID not found', sameVid: vid === oldVid });
        }
    } catch (error) {
        console.error('Refresh VID error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// API - 특정 노래의 VID 추출 및 저장
app.post('/api/songs/fetch-vid', async (req, res) => {
    const { filename } = req.body;
    
    if (!filename) {
        return res.status(400).json({ success: false, message: 'Filename required' });
    }
    
    try {
        // 1. 파일 읽기
        const filePath = getSafeSongPath(filename);
        const data = await fs.promises.readFile(filePath, 'utf8');
        const songData = JSON.parse(data);
        
        // 2. 검색 정보 추출 (아티스트 + 제목)
        const artistName = typeof songData.artist === 'object' ? 
            (songData.artist.ori_name || songData.artist.name || "") : 
            (songData.artist || "");
            
        const titleName = songData.ori_name || songData.name || "";
        
        if (!artistName && !titleName) {
             return res.json({ success: false, message: 'Artist or Title missing' });
        }

        // 3. Puppeteer 검색
        console.log(`Searching VID for: ${artistName} - ${titleName}`);
        const vid = await findYoutubeVid(artistName, titleName);
        
        if (vid) {
            // 4. 저장
            songData.vid = vid;
            await fs.promises.writeFile(filePath, JSON.stringify(songData, null, 2));
            
            // 캐시 업데이트
            const songIndex = songCache.findIndex(s => s.name === filename);
            if (songIndex > -1) {
                songCache[songIndex] = songData;
                songCacheMap.set(filename, songData);
            }
            
            console.log(`Found and saved VID: ${vid}`);
            return res.json({ success: true, vid });
        } else {
            console.log('VID not found');
            return res.json({ success: false, message: 'VID not found' });
        }
    } catch (error) {
        console.error('Fetch VID error:', error);
        return res.status(500).json({ success: false, message: error.message });
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

        // contextText와 translatedLines 매칭 검증 (누락된 번역 확인)
        if (songData.contextText && Array.isArray(songData.contextText)) {
            let missingCount = 0;
            songData.contextText.forEach(context => {
                let translatedLine = songData.translatedLines.find(
                    line => line.T0 === context.T0 || line.O0 === context.T0
                );


                if (!translatedLine) {
                    missingCount++;
                }
            });

            if (missingCount > 0) {
                errors.push(`번역 누락된 문장이 ${missingCount}개 있습니다.`);
            }
        }
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

    // K0(한국어 번역) 내용 유효성 검증 ("데이터 없음" 또는 빈 문자열 체크)
    if ('K0' in data && (data.K0 === "데이터 없음" || (typeof data.K0 === 'string' && data.K0.trim() === ""))) {
        errors.push(`translatedLines[${lineIndex}]: 'K0' 데이터가 누락되었습니다(빈 값 또는 '데이터 없음').`);
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
                ctx.T0 === line.T0 || ctx.T0 === line.O0
            );
            
            if (originalContext) {
                console.log(`라인 ${index}: contextText 매칭 성공`);
            } else {
                console.log(`라인 ${index}: contextText 매칭 실패 - T0: "${line.T0}"`);
                console.log('사용 가능한 contextText:', songData.contextText?.map(ctx => ctx.T0).slice(0, 5));
                
                // contextText 매칭에 실패한 경우 대체 방법들 시도
                
                // 1. p1 배열에서 찾기
                const targetText = line.O0 || line.T0;
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
                
                if (!foundInP1 && !foundInText) {
                    console.log(`라인 ${index}: 원본 텍스트(p1/text)를 찾을 수 없어 재번역 대상에서 제외함 (target: "${targetText}")`);
                    return;
                }

                // 찾은 텍스트로 context 생성
                const contextText = foundInP1 || foundInText;
                
                originalContext = {
                    T0: contextText,
                    // 추가 정보가 있으면 활용
                    ...(line.O0 && { O0: line.O0 })
                };
                
                console.log(`라인 ${index}: 대체 context 생성 - T0: "${originalContext.T0}" (출처: ${foundInP1 ? 'p1' : 'text'})`);
            }
            
            invalidLines.push({
                index: index,
                context: originalContext,
                errors: lineErrors,
                line: line
            });
        }
    });

    // 누락된 번역 찾기
    if (songData.contextText && Array.isArray(songData.contextText)) {
        songData.contextText.forEach((context) => {
            let translatedLine = songData.translatedLines.find(
                line => line.T0 === context.T0 || line.O0 === context.T0
            );


            if (!translatedLine) {
                console.log(`Missing translation found for context: ${context.T0}`);
                invalidLines.push({
                    index: -1,
                    context: context,
                    errors: ["Missing translation"],
                    line: null,
                    isMissing: true
                });
            }
        });
    }
    
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
        
        // 캐시 최적화 대응: 캐시된 validation 결과 사용 (없으면 기본값)
        // 주의: 여기서 validateSongSchema(song)을 호출하면 translatedLines가 없어서 무조건 에러 발생함
        const validation = song.validation ? JSON.parse(JSON.stringify(song.validation)) : { isValid: true, errors: [] };
        
        // failedLines 체크
        let failedLinesError = false;
        if (Array.isArray(song.failedLines) && song.failedLines.length > 0) {
            validation.errors.push(`번역 실패한 문장이 ${song.failedLines.length}개 있습니다.`);
            validation.isValid = false;
            failedLinesError = true;
        }

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
    const cookies = parseCookies(req.headers.cookie);
    const preferredLanguage = cookies.preferredLanguage || 'all';
    const language = req.query.language || preferredLanguage;

    // 최근 추가된 노래 16개를 가져옵니다 (언어별)
    const latestSongs = filterSongsByLanguage(language, 16);

    // 인기 노래 10개를 가져옵니다 (언어별)
    const popularSongs = getPopularSongsByLanguage(language, 10);
    
    // 인기 아티스트 10개를 가져옵니다 (언어별)
    const popularArtists = getPopularArtistsByLanguage(language, 10);

    res.render('landing', {
        latestSongs,
        popularSongs,
        popularArtists,
        currentLanguage: language
    });
});

app.get('/add-song', (req, res) => {
    res.render('addSong');
});

// 인기 노래 순위 페이지
app.get('/popular/songs', (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const preferredLanguage = cookies.preferredLanguage || 'all';
    const language = req.query.language || preferredLanguage;
    const popularSongs = getPopularSongsByLanguage(language, 100); // 상위 100개 노래 (언어별)
    
    res.render('popularSongs', {
        popularSongs: popularSongs,
        currentLanguage: language
    });
});

// 인기 아티스트 순위 페이지
app.get('/popular/artists', (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const preferredLanguage = cookies.preferredLanguage || 'all';
    const language = req.query.language || preferredLanguage;
    const popularArtists = getPopularArtistsByLanguage(language, 100); // 상위 100명 아티스트 (언어별)
    
    res.render('popularArtists', {
        popularArtists: popularArtists,
        currentLanguage: language
    });
});

// 관리 페이지 라우트
app.get('/admin', async (req, res) => {
    try {
        // admin 페이지 접근 시 songCache 자동 갱신 제거 (사용자 요청 시에만 갱신)
        
        const invalidSongs = getInvalidSongs(100);
        // '개발용' 태그가 있는 노래들을 제외한 총 노래 수 계산
        const totalSongs = songCache.filter(song => 
            !song.tags || !song.tags.includes('개발용')
        ).length;
        
        res.render('admin', {
            invalidSongs: invalidSongs,
            totalSongs: totalSongs
        });
    } catch (error) {
        console.error('admin 페이지 렌더링 중 오류:', error);
        res.status(500).send('관리 페이지 로딩 중 오류가 발생했습니다.');
    }
});

// 관리자 - 데이터 퀄리티 검증 페이지
app.get('/admin/validate', (req, res) => {
    try {
        const songs = songCache.map(s => ({ 
            name: s.name, 
            title: s.kor_name || s.name 
        })).sort((a, b) => a.title.localeCompare(b.title));
        
        res.render('validate', { songs });
    } catch (error) {
        console.error('검증 페이지 렌더링 오류:', error);
        res.status(500).send('서버 오류가 발생했습니다.');
    }
});

// 관리자 - 노래 데이터 검증 API
app.post('/admin/validate/check', async (req, res) => {
    const { songName } = req.body;
    if (!songName) return res.status(400).json({ error: '노래 이름이 필요합니다.' });
    
    const songMeta = songCacheMap.get(songName);
    if (!songMeta) return res.status(404).json({ error: '노래를 찾을 수 없습니다.' });
    
    let song;
    try {
        const filePath = getSafeSongPath(songName);
        const data = await fs.promises.readFile(filePath, 'utf8');
        song = JSON.parse(data);
    } catch (err) {
        console.error('파일 읽기 오류:', err);
        return res.status(500).json({ error: '노래 파일을 읽을 수 없습니다.' });
    }
    
    if (!song.translatedLines || song.translatedLines.length === 0) {
        return res.json({ grade: 'C', desc: '번역 데이터가 없습니다.', songName: song.kor_name || songName });
    }
    
    // 전체 라인 개별 처리 (1라인당 1개 요청: 번역 검증만 수행)
    const allLines = song.translatedLines;
    console.log(`[${songName}] 전체 ${allLines.length}개 라인 개별 검증 시작 (번역 검증만 수행)`);

    try {
        const linePromises = allLines.map(async (line, idx) => {
            const lineIndex = idx + 1;
            const translationText = line.K0;

            // 번역 검증 프롬프트
            const transPrompt = `다음 노래 가사의 한국어 번역이 정확한지 평가하여 JSON으로 응답하세요.

[가사 정보]
원문: ${line.T0}
한국어 번역: ${translationText}

[평가 기준]
A. 자연스럽고 정확함
B. 의미는 통하나 어색함
C. 오역

[출력 JSON 형식]
{ "grade": "A/B/C", "desc": "평가 사유" }`;

            try {
                // 번역 검증 API 호출
                const transResult = await openai.chat.completions.create({
                    messages: [
                        { role: "system", content: "You are a Japanese-Korean translation validator. Output valid JSON only." },
                        { role: "user", content: transPrompt }
                    ],
                    model: chatModel,
                    response_format: { type: "json_object" }
                });

                const transData = JSON.parse(transResult.choices[0].message.content);

                return {
                    lineIndex,
                    grade: transData.grade || 'B',
                    desc: transData.desc || (transData.grade === 'A' ? "적절함" : "사유 없음")
                };

            } catch (e) {
                console.error(`Line ${lineIndex} Error:`, e);
                return {
                    lineIndex,
                    grade: 'B',
                    desc: 'API 호출 오류: ' + e.message
                };
            }
        });

        // 모든 라인 병렬 실행 및 결과 정렬
        const results = (await Promise.all(linePromises)).sort((a, b) => a.lineIndex - b.lineIndex);

        // 결과 집계
        let finalGrade = 'A';
        let problemCount = 0;
        let criticalCount = 0;
        const problems = [];

        results.forEach(r => {
            if (r.grade === 'C') {
                finalGrade = 'C';
                criticalCount++;
                problems.push(`[Line ${r.lineIndex}] (C) ${r.desc}`);
            } else if (r.grade === 'B') {
                if (finalGrade !== 'C') finalGrade = 'B';
                problemCount++;
                problems.push(`[Line ${r.lineIndex}] (B) ${r.desc}`);
            }
        });

        let summaryDesc = "";
        if (finalGrade === 'A') {
            summaryDesc = "모든 라인이 적절하게 번역되었습니다.";
        } else {
            summaryDesc = `총 ${results.length}라인 중 C등급 ${criticalCount}개, B등급 ${problemCount}개 발견.\n`;
            summaryDesc += "주요 문제:\n" + problems.slice(0, 3).join('\n');
            if (problems.length > 3) summaryDesc += `\n...외 ${problems.length - 3}건`;
        }
        
        res.json({
            grade: finalGrade,
            desc: summaryDesc,
            songName: song.kor_name || songName,
            details: results 
        });
        
    } catch (error) {
        console.error('검증 API 오류:', error);
        res.status(500).json({ error: 'LLM 검증 중 오류가 발생했습니다.' });
    }
});

// 캐시 수동 갱신 라우트
app.post('/admin/reload-cache', async (req, res) => {
    const now = Date.now();
    // 1초에 1번까지만 허용 (1000ms 제한)
    if (now - lastCacheReloadTime < 1000) {
        return res.status(429).json({ 
            success: false, 
            message: '요청이 너무 빠릅니다. 잠시 후 다시 시도해주세요.' 
        });
    }
    
    lastCacheReloadTime = now;
    
    try {
        console.log('관리자 요청으로 캐시 갱신 시작...');
        await refreshSongCache();
        // 캐시 갱신 후 조회수 데이터 동기화
        await syncViewCountsWithSongs();
        
        console.log('캐시 갱신 완료');
        res.json({ success: true, message: '노래 데이터가 새로고침되었습니다.' });
    } catch (error) {
        console.error('캐시 갱신 중 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '캐시 갱신 중 오류가 발생했습니다.' 
        });
    }
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
                
                // failedLines 확인
                const failedLines = Array.isArray(songData.failedLines) ? songData.failedLines : [];
                
                if (invalidLines.length === 0 && failedLines.length === 0) {
                    console.log(`[${songName}] 오류 라인 및 실패한 문장이 없어 건너뜀`);
                    return { songName, successCount: 0, failCount: 0, skipped: true };
                }

                console.log(`[${songName}] 오류/실패 재번역 시작: 스키마 오류 ${invalidLines.length}개, 실패 문장 ${failedLines.length}개`);

                // 번역 작업 프라미스 배열
                const translationPromises = [];

                // 1. 스키마 오류 라인 재번역 작업 생성
                invalidLines.forEach((invalidLine) => {
                    translationPromises.push(async () => {
                        try {
                            invalidLine.context.C0 = cleanUtatenHtml(invalidLine.context.C0);
                            const requestBody = {
                                model: isUsingDeepSeekDirectly ? "deepseek-chat" : chatModel,
                                max_tokens: 8192,
                                temperature: 0.1,
                                messages: [
                                    { role: "system", content: MSG },
                                    { role: 'user', content: JSON.stringify(invalidLine.context) },
                                ],
                                response_format: { type: "json_object" }
                            };

                            if (!isUsingDeepSeekDirectly) {
                                requestBody.provider = { ignore: ['InferenceNet', 'Together'] };
                            }

                            const completion = await openai.chat.completions.create(requestBody);
                            const translatedLine = completion.choices[0].message.content.replaceAll("```json", "").replaceAll("```", "").trim();
                            const parsedResult = JSON.parse(translatedLine);
                            
                            if (parsedResult && parsedResult.K0) {
                                parsedResult.O0 = invalidLine.context.T0;
                                if (invalidLine.isMissing) {
                                    songData.translatedLines.push(parsedResult);
                                } else {
                                    songData.translatedLines[invalidLine.index] = parsedResult;
                                }
                                songSuccessCount++;
                            } else {
                                songFailCount++;
                            }
                        } catch (error) {
                            console.error(`[${songName}] 라인 ${invalidLine.index} 재번역 오류:`, error);
                            songFailCount++;
                        }
                    });
                });

                // 2. failedLines 재번역 작업 생성
                if (failedLines.length > 0) {
                    // 재시도할 failedLines 목록 복사
                    const failedLinesToRetry = [...failedLines];
                    // songData의 failedLines는 재번역 성공 여부에 따라 다시 채워짐 (초기화)
                    // 하지만 병렬 처리 중 데이터 정합성을 위해, 일단 성공한 것만 translatedLines에 추가하고
                    // 실패한 것은 그대로 두거나 다시 추가해야 함.
                    // 여기서는 songData.failedLines를 비우고 실패 시 다시 추가하는 방식을 사용
                    songData.failedLines = []; 
                    
                    failedLinesToRetry.forEach((contextText) => {
                        translationPromises.push(async () => {
                            try {
                                contextText.C0 = cleanUtatenHtml(contextText.C0);
                                const requestBody = {
                                    model: isUsingDeepSeekDirectly ? "deepseek-chat" : chatModel,
                                    max_tokens: 8192,
                                    temperature: 0.1,
                                    messages: [
                                        { role: "system", content: MSG },
                                        { role: 'user', content: JSON.stringify(contextText) },
                                    ],
                                    response_format: { type: "json_object" }
                                };

                                if (!isUsingDeepSeekDirectly) {
                                    requestBody.provider = { ignore: ['InferenceNet', 'Together'] };
                                }

                                const completion = await openai.chat.completions.create(requestBody);
                                const translatedLine = completion.choices[0].message.content.replaceAll("```json", "").replaceAll("```", "").trim();
                                const parsedResult = JSON.parse(translatedLine);
                                
                                if (parsedResult && parsedResult.K0) {
                                    parsedResult.O0 = contextText.T0;
                                    // 성공 시 translatedLines에 추가
                                    songData.translatedLines.push(parsedResult);
                                    songSuccessCount++;
                                } else {
                                    // 실패 시 다시 failedLines에 추가
                                    songData.failedLines.push(contextText);
                                    songFailCount++;
                                }
                            } catch (error) {
                                console.error(`[${songName}] 실패한 문장 재번역 오류:`, error);
                                songData.failedLines.push(contextText); // 에러 시 다시 추가
                                songFailCount++;
                            }
                        });
                    });
                }

                await Promise.all(translationPromises.map(p => p()));

                // 파일 저장
                await fs.promises.writeFile(filePath, JSON.stringify(songData, null, 2));
                
                // 캐시 업데이트
                const songIndex = songCache.findIndex(song => song.name === songName);
                if (songIndex > -1) {
                    songCache[songIndex] = songData;
                    songCacheMap.set(songName, songData); // Map도 함께 업데이트
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
        ]).then(() => {
            // 초기 로딩 완료 후 동기화 실행
            return syncViewCountsWithSongs();
        }).catch(err => {
            console.error('초기 데이터 로딩 중 오류:', err);
        });
    });
}

startServer(); 