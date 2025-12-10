const fs = require('fs');
const path = require('path');

// 설정
const HANJA_JS_PATH = path.join(__dirname, '../public/hanja.js');
const SONGS_DIR = path.join(__dirname, '../songs');
const BATCH_SIZE = 50; // 한 번에 처리할 파일 수 (메모리 관리)

/**
 * public/hanja.js 파일에서 모든 한자를 추출하여 Set으로 반환
 */
function loadKnownHanja() {
    console.log('Loading hanja.js...');
    const content = fs.readFileSync(HANJA_JS_PATH, 'utf8');
    
    // JS 파일 내의 따옴표나 백틱으로 묶인 문자열들을 추출
    // const variable = `...` 또는 "..." 형태 매칭
    const stringRegex = /=(?:\s*)?([`"'])((?:(?!\1)[\s\S])*)\1/g;
    
    const knownHanjaSet = new Set();
    let match;
    
    while ((match = stringRegex.exec(content)) !== null) {
        const strContent = match[2];
        // 문자열 내의 한자만 추출 (\p{Script=Han} 사용 - Node 10+ 지원)
        // u 플래그 중요
        const hanjaMatches = strContent.match(/\p{Script=Han}/gu);
        if (hanjaMatches) {
            for (const char of hanjaMatches) {
                knownHanjaSet.add(char);
            }
        }
    }
    
    console.log(`Loaded ${knownHanjaSet.size} unique known Hanja characters.`);
    return knownHanjaSet;
}

/**
 * songs 폴더의 모든 파일을 스캔하여 누락된 한자 찾기
 */
async function findMissingHanja() {
    const knownHanja = loadKnownHanja();
    const missingStats = new Map(); // { char: [file1, file2, ...] }
    
    console.log('Scanning songs directory...');
    const files = fs.readdirSync(SONGS_DIR).filter(f => f.endsWith('.json'));
    console.log(`Found ${files.length} song files.`);
    
    let processedCount = 0;
    
    // 배치 처리
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        
        await Promise.all(batch.map(async (file) => {
            try {
                const filePath = path.join(SONGS_DIR, file);
                const fileContent = await fs.promises.readFile(filePath, 'utf8');
                const json = JSON.parse(fileContent);
                
                // text 필드에서 한자 추출
                if (json.text) {
                    // NFKC 정규화 적용: 강희자전 부수 등을 일반 한자로 변환
                    const normalizedText = json.text.normalize('NFKC');
                    const hanjaInSong = normalizedText.match(/\p{Script=Han}/gu);
                    if (hanjaInSong) {
                        for (const char of hanjaInSong) {
                            if (!knownHanja.has(char)) {
                                if (!missingStats.has(char)) {
                                    missingStats.set(char, []);
                                }
                                // 파일명 중복 방지
                                const fileList = missingStats.get(char);
                                if (!fileList.includes(file)) {
                                    fileList.push(file);
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                console.error(`Error processing file ${file}:`, err.message);
            }
        }));
        
        processedCount += batch.length;
        if (processedCount % 500 === 0) {
            console.log(`Processed ${processedCount}/${files.length} files...`);
        }
    }
    
    // 결과 출력
    console.log('\n=== Analysis Result ===');
    console.log(`Total missing Hanja characters found: ${missingStats.size}`);
    
    if (missingStats.size > 0) {
        console.log('\nMissing Characters and occurrence count:');
        const sortedMissing = [...missingStats.entries()].sort((a, b) => b[1].length - a[1].length);
        
        const reportPath = path.join(__dirname, '../missing_hanja_report.txt');
        let reportContent = `Analysis Date: ${new Date().toLocaleString()}\n`;
        reportContent += `Total scanned files: ${files.length}\n`;
        reportContent += `Missing Hanja count: ${missingStats.size}\n\n`;
        
        sortedMissing.forEach(([char, fileList]) => {
            console.log(`${char}: Found in ${fileList.length} files (e.g., ${fileList.slice(0, 3).join(', ')})`);
            reportContent += `${char}\tCount: ${fileList.length}\tFiles: ${fileList.join(', ')}\n`;
        });
        
        fs.writeFileSync(reportPath, reportContent);
        console.log(`\nFull report saved to: ${reportPath}`);
    } else {
        console.log('No missing Hanja found! All Hanja in songs are present in hanja.js.');
    }
}

findMissingHanja().catch(console.error);

