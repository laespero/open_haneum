import fs from 'fs';
import path from 'path';

const songsDir = 'songs';

async function cleanupDuplicateSongs() {
    try {
        const files = await fs.promises.readdir(songsDir);
        const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');
        
        // 대소문자 무시한 이름을 키로 하여 파일 목록 그룹화
        const groups = new Map();
        
        for (const file of jsonFiles) {
            const name = path.basename(file, '.json');
            const lowerName = name.toLowerCase();
            
            if (!groups.has(lowerName)) {
                groups.set(lowerName, []);
            }
            groups.get(lowerName).push(file);
        }
        
        const deleteList = [];
        
        for (const [lowerName, fileList] of groups) {
            if (fileList.length > 1) {
                console.log(`중복 발견: ${lowerName} -> ${fileList.join(', ')}`);
                
                const fileDetails = [];
                
                for (const file of fileList) {
                    const filePath = path.join(songsDir, file);
                    const content = await fs.promises.readFile(filePath, 'utf8');
                    let createdAt = new Date(0); // 기본값: 1970-01-01
                    
                    try {
                        const data = JSON.parse(content);
                        if (data.createdAt) {
                            createdAt = new Date(data.createdAt);
                        } else {
                             // JSON에 createdAt이 없으면 파일 스탯 사용
                             const stats = await fs.promises.stat(filePath);
                             createdAt = stats.birthtime || stats.mtime;
                        }
                    } catch (err) {
                        console.error(`JSON 파싱 오류 (${file}):`, err.message);
                        // 파싱 실패 시 파일 수정 시간을 사용
                        const stats = await fs.promises.stat(filePath);
                        createdAt = stats.birthtime || stats.mtime;
                    }
                    
                    fileDetails.push({
                        file,
                        createdAt
                    });
                }
                
                // 최신순 정렬 (내림차순)
                fileDetails.sort((a, b) => b.createdAt - a.createdAt);
                
                const keptFile = fileDetails[0];
                const filesToDelete = fileDetails.slice(1);
                
                console.log(`  - 유지: ${keptFile.file} (${keptFile.createdAt.toISOString()})`);
                for (const item of filesToDelete) {
                    console.log(`  - 삭제 대상: ${item.file} (${item.createdAt.toISOString()})`);
                    deleteList.push(item.file);
                }
            }
        }
        
        if (deleteList.length === 0) {
            console.log('중복된 노래 파일이 없습니다.');
            return;
        }

        console.log(`\n총 ${deleteList.length}개의 중복 파일을 삭제합니다.`);
        
        for (const file of deleteList) {
            await fs.promises.unlink(path.join(songsDir, file));
            console.log(`삭제 완료: ${file}`);
        }
        
        console.log('정리 완료.');
        
    } catch (error) {
        console.error('오류 발생:', error);
    }
}

cleanupDuplicateSongs();

