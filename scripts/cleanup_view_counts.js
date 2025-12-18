import fs from 'fs';
import path from 'path';

const songsDir = 'songs';
const viewCountsPath = 'viewCounts.json';

async function cleanupViewCounts() {
    try {
        // 1. songs 디렉토리의 실제 파일 목록 가져오기
        const files = await fs.promises.readdir(songsDir);
        const realSongNames = new Set(
            files
                .filter(file => path.extname(file).toLowerCase() === '.json')
                .map(file => path.basename(file, '.json'))
        );

        console.log(`실제 노래 파일 개수: ${realSongNames.size}`);

        // 2. viewCounts.json 로드
        const viewCountsData = await fs.promises.readFile(viewCountsPath, 'utf8');
        let viewCounts = JSON.parse(viewCountsData);
        
        const initialCount = Object.keys(viewCounts).length;
        console.log(`초기 viewCounts 항목 수: ${initialCount}`);

        // 3. 존재하지 않는 키 삭제
        const deletedKeys = [];
        const newViewCounts = {};

        for (const [key, count] of Object.entries(viewCounts)) {
            if (realSongNames.has(key)) {
                newViewCounts[key] = count;
            } else {
                deletedKeys.push(key);
            }
        }

        const finalCount = Object.keys(newViewCounts).length;
        console.log(`정리 후 viewCounts 항목 수: ${finalCount}`);
        console.log(`삭제된 항목 수: ${deletedKeys.length}`);

        if (deletedKeys.length > 0) {
            console.log('--- 삭제된 키 목록 (일부) ---');
            deletedKeys.slice(0, 10).forEach(key => console.log(key));
            if (deletedKeys.length > 10) console.log(`...외 ${deletedKeys.length - 10}개`);
            
            // 4. 저장
            await fs.promises.writeFile(viewCountsPath, JSON.stringify(newViewCounts, null, 2));
            console.log('\nviewCounts.json 파일이 성공적으로 업데이트되었습니다.');
        } else {
            console.log('\n삭제할 항목이 없습니다.');
        }

    } catch (error) {
        console.error('오류 발생:', error);
    }
}

cleanupViewCounts();

