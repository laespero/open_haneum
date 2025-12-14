
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const songsDir = path.join(__dirname, 'songs');

// 간단한 Levenshtein 거리 구현
function levenshtein(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

function stripTags(str) {
    if (!str) return '';
    // <rt>...</rt> 및 <rp>...</rp> 내용 제거
    let text = str.replace(/<rt\b[^>]*>.*?<\/rt>/gi, '')
                  .replace(/<rp\b[^>]*>.*?<\/rp>/gi, '');
    return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function fixSongs(dryRun = true) {
    console.log(dryRun ? 'Running in DRY RUN mode...' : 'Running in FIX mode...');
    const files = fs.readdirSync(songsDir);
    let fixCount = 0;

    const targetFiles = [
        'BlueHearts_Image.json',
        'GreenApple_Que_Sera_Sera.json',
        'GreenApple_Whales_Song.json',
        'Mrs_GREEN_APPLE_Dancehall_Official_Music_Video.json',
        'Zig_Blaming_The_Lonely_Summer.json',
        'deep_twilight.json',
        'yoasobi_Idol.json',
        'yorushika.json'
    ];

    files.forEach(file => {
        if (!targetFiles.includes(file)) return;

        const filePath = path.join(songsDir, file);
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            let song = JSON.parse(data);
            let modified = false;

            if (song.p1 && Array.isArray(song.p1) && song.translatedLines && Array.isArray(song.translatedLines)) {
                const p1Set = new Set(song.p1);
                
                const p1Stripped = song.p1.map((text, index) => ({
                    original: text,
                    stripped: stripTags(text),
                    index: index
                }));

                song.translatedLines.forEach((line, index) => {
                    if (line.O0 && !p1Set.has(line.O0)) {
                        const o0Stripped = stripTags(line.O0);
                        
                        let bestMatch = null;
                        let minDistance = Infinity;

                        for (const p1Item of p1Stripped) {
                            const distance = levenshtein(o0Stripped, p1Item.stripped);
                            if (distance < minDistance) {
                                minDistance = distance;
                                bestMatch = p1Item;
                            }
                        }

                        const maxLength = Math.max(o0Stripped.length, bestMatch.stripped.length);
                        const similarity = maxLength === 0 ? 0 : 1 - (minDistance / maxLength);

                        if (file === 'BlueHearts_Image.json') {
                             console.log(`DEBUG [${file}]: O0="${o0Stripped}"`);
                             console.log(`DEBUG [${file}]: Best="${bestMatch.stripped}" (Dist: ${minDistance}, Sim: ${similarity})`);
                        }

                        if (similarity > 0.6) {
                             console.log(`\n[FIX CANDIDATE] File: ${file} (Index: ${index})`);
                             console.log(`  Current O0: ${line.O0}`);
                             console.log(`  Target p1 : ${bestMatch.original}`);
                             console.log(`  Similarity: ${(similarity * 100).toFixed(2)}%`);

                             if (!dryRun) {
                                 line.O0 = bestMatch.original;
                                 modified = true;
                                 fixCount++;
                             }
                        } else {
                             console.log(`\n[SKIPPED] File: ${file} (Index: ${index}) - Low similarity`);
                             console.log(`  Current O0: ${line.O0}`);
                             console.log(`  Best Match: ${bestMatch ? bestMatch.original : 'None'}`);
                             console.log(`  Similarity: ${(similarity * 100).toFixed(2)}%`);
                        }
                    }
                });
            }

            if (!dryRun && modified) {
                fs.writeFileSync(filePath, JSON.stringify(song, null, 2), 'utf8');
                console.log(`Saved changes to ${file}`);
            }

        } catch (err) {
            console.error(`Error processing file ${file}:`, err.message);
        }
    });

    console.log(`\nProcess complete. Fixed ${fixCount} items.`);
}

const isDryRun = !process.argv.includes('--fix');
fixSongs(isDryRun);
