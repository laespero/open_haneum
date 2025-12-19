const fs = require('fs');
const path = require('path');

const songsDir = path.join(__dirname, '../songs');

async function check() {
    try {
        const files = await fs.promises.readdir(songsDir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));

        console.log(`총 ${jsonFiles.length}개의 파일을 검사합니다...`);
        console.log('----------------------------------------');

        let mismatchCount = 0;
        let errorCount = 0;

        for (const file of jsonFiles) {
            const filePath = path.join(songsDir, file);
            
            try {
                const content = await fs.promises.readFile(filePath, 'utf8');
                const data = JSON.parse(content);
                
                // 파일명에서 .json 확장자 제거
                const fileNameNoExt = path.basename(file, '.json');
                const internalName = data.name;

                // 1. name 필드가 없는 경우
                if (!internalName) {
                    console.log(`[경고] 'name' 필드 없음: ${file}`);
                    errorCount++;
                    continue;
                }

                // 2. 파일명과 name 필드가 다른 경우 (대소문자 포함 정확한 비교)
                if (fileNameNoExt !== internalName) {
                    console.log(`[불일치 발견]`);
                    console.log(`  파일: ${file}`);
                    console.log(`  내부: ${internalName}`);
                    
                    // 대소문자만 다른 경우인지 확인
                    if (fileNameNoExt.toLowerCase() === internalName.toLowerCase()) {
                        console.log(`  -> 대소문자만 다름 (Case Mismatch)`);
                    } else {
                        console.log(`  -> 완전히 다름`);
                    }
                    console.log('----------------------------------------');
                    mismatchCount++;
                }

            } catch (err) {
                console.error(`[에러] 파일 읽기/파싱 실패: ${file}`, err.message);
                errorCount++;
            }
        }

        console.log(`\n검사 완료.`);
        console.log(`불일치 파일 수: ${mismatchCount}`);
        if (errorCount > 0) console.log(`에러/경고 수: ${errorCount}`);

    } catch (err) {
        console.error('디렉토리 읽기 실패:', err);
    }
}

check();

