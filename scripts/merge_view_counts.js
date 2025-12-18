import fs from 'fs';
import path from 'path';

async function mergeViewCounts() {
    const viewCountsPath = 'viewCounts.json';
    const songsDir = 'songs';

    try {
        const viewCountsData = await fs.promises.readFile(viewCountsPath, 'utf8');
        let viewCounts = JSON.parse(viewCountsData);
        
        // 실제 존재하는 노래 파일 목록 가져오기 (확장자 제거)
        const files = await fs.promises.readdir(songsDir);
        const realSongNames = new Set(
            files
                .filter(f => f.endsWith('.json'))
                .map(f => path.basename(f, '.json'))
        );
        
        // 대소문자 무시 매핑 (소문자 -> 실제 이름)
        const lowerToReal = new Map();
        realSongNames.forEach(name => lowerToReal.set(name.toLowerCase(), name));

        const newViewCounts = {};
        const changes = [];

        for (const [key, count] of Object.entries(viewCounts)) {
            const lowerKey = key.toLowerCase();
            
            // 1. 실제 파일명이 존재하는 경우 (우선순위 1)
            if (realSongNames.has(key)) {
                newViewCounts[key] = (newViewCounts[key] || 0) + count;
            } 
            // 2. 대소문자만 다른 실제 파일명이 있는 경우 -> 병합
            else if (lowerToReal.has(lowerKey)) {
                const realKey = lowerToReal.get(lowerKey);
                newViewCounts[realKey] = (newViewCounts[realKey] || 0) + count;
                changes.push(`'${key}' (${count}) -> '${realKey}' 로 병합`);
            }
            // 3. 파일이 없는 경우 (삭제된 노래 등) -> 원래 키 유지
            else {
                newViewCounts[key] = (newViewCounts[key] || 0) + count;
            }
        }

        // 변경 사항이 있으면 저장
        if (changes.length > 0) {
            console.log('--- 병합된 항목들 ---');
            changes.forEach(c => console.log(c));
            console.log('---------------------');
            
            await fs.promises.writeFile(viewCountsPath, JSON.stringify(newViewCounts, null, 2));
            console.log('viewCounts.json 파일이 성공적으로 업데이트되었습니다.');
        } else {
            console.log('병합할 항목이 없습니다.');
        }

    } catch (error) {
        console.error('오류 발생:', error);
    }
}

mergeViewCounts();

