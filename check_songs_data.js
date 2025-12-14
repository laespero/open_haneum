
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const songsDir = path.join(__dirname, 'songs');

function checkSongs() {
    console.log('Checking songs data...');
    const files = fs.readdirSync(songsDir);
    let errorCount = 0;

    files.forEach(file => {
        if (path.extname(file) === '.json') {
            const filePath = path.join(songsDir, file);
            try {
                const data = fs.readFileSync(filePath, 'utf8');
                const song = JSON.parse(data);

                if (song.p1 && Array.isArray(song.p1) && song.translatedLines && Array.isArray(song.translatedLines)) {
                    // p1의 값들을 Set으로 만들어 검색 속도 향상
                    const p1Set = new Set(song.p1);
                    
                    song.translatedLines.forEach((line, index) => {
                        // O0 값이 존재하고, p1Set에 없는 경우 에러 출력
                        if (line.O0 && !p1Set.has(line.O0)) {
                            console.error(`\n[ERROR] File: ${file}`);
                            console.error(`  Index: ${index}`);
                            console.error(`  Missing O0 in p1: "${line.O0}"`);
                            errorCount++;
                        }
                    });
                }
            } catch (err) {
                console.error(`Error reading or parsing file ${file}:`, err.message);
            }
        }
    });

    console.log(`\nCheck complete. Found ${errorCount} errors.`);
}

checkSongs();
