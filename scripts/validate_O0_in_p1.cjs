const fs = require('fs');
const path = require('path');

const songsDir = path.join(__dirname, '../songs');
const files = fs.readdirSync(songsDir).filter(file => file.endsWith('.json'));

console.log(`Checking ${files.length} files...`);

let errorCount = 0;

files.forEach(file => {
    try {
        const filePath = path.join(songsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);

        if (!data.translatedLines || !Array.isArray(data.translatedLines)) {
            // translatedLines가 없거나 배열이 아니면 건너뜁니다 (구조가 다른 경우)
            return;
        }

        if (!data.p1 || !Array.isArray(data.p1)) {
            // p1이 없으면 비교할 수 없으므로 건너뜁니다
            return;
        }

        const p1Set = new Set(data.p1);

        data.translatedLines.forEach((line, index) => {
            if (line.O0) {
                // p1 배열에 O0 값이 존재하는지 확인
                if (!p1Set.has(line.O0)) {
                    console.log(`\n[Found Mismatch] File: ${file}`);
                    console.log(`  Index in translatedLines: ${index}`);
                    console.log(`  Value of O0: "${line.O0}"`);
                    console.log(`  Exists in p1? NO`);
                    errorCount++;
                }
            }
        });

    } catch (err) {
        console.error(`Error processing file ${file}:`, err.message);
    }
});

console.log(`\nScan complete. Found ${errorCount} mismatches.`);





