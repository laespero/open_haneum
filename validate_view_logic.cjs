const fs = require('fs');
const path = require('path');

// Server.js logic copy - cleanUtatenHtml function
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

function validateSong(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let songData;
    try {
        songData = JSON.parse(content);
    } catch (e) {
        return null;
    }

    if (songData.tags && songData.tags.includes('개발용')) return null;
    if (!songData.translatedLines || !Array.isArray(songData.translatedLines) || songData.translatedLines.length === 0) return null;

    // EXACT logic from /api/songs/:title/translated in server.js
    if (!songData.text) return null;

    const trimedTextArr = songData.text
        .replace(/\r/g, '')
        .split("\n")
        .map(line => line.trim())
        .filter(x => x !== '');

    let missingCount = 0;
    const missingLines = [];

    trimedTextArr.forEach(x => {
        // 1. Exact match
        let found = songData.translatedLines.find(y => 
            y.T0.trim().toLowerCase() === x.trim().toLowerCase() ||
            (y.O0 && y.O0.trim().toLowerCase() === x.trim().toLowerCase())
        );

        // 2. Robust match
        if (!found) {
            const cleanX = cleanUtatenHtml(x).trim().toLowerCase();
            found = songData.translatedLines.find(y => {
                const cleanY = cleanUtatenHtml(y.T0).trim().toLowerCase();
                const cleanO0 = y.O0 ? cleanUtatenHtml(y.O0).trim().toLowerCase() : '';
                return cleanY === cleanX || cleanO0 === cleanX;
            });
        }

        if (!found) {
            missingCount++;
            missingLines.push(x);
        }
    });

    if (missingCount > 0) {
        return {
            name: songData.name,
            missingCount,
            totalLines: trimedTextArr.length,
            missingExamples: missingLines.slice(0, 3)
        };
    }
    return null;
}

const songsDir = path.join(__dirname, 'songs');
const files = fs.readdirSync(songsDir).filter(f => f.endsWith('.json'));

console.log(`Scanning ${files.length} songs...`);

let invalidSongs = [];

files.forEach(file => {
    try {
        const result = validateSong(path.join(songsDir, file));
        if (result) {
            invalidSongs.push(result);
        }
    } catch (err) {
        console.error(`Error processing ${file}:`, err.message);
    }
});

console.log(`\nFound ${invalidSongs.length} songs with missing translations (using /view logic).`);
invalidSongs.forEach(s => {
    console.log(`\n[${s.name}] Missing: ${s.missingCount}/${s.totalLines}`);
    s.missingExamples.forEach(l => console.log(` - "${l.substring(0, 50)}..."`));
});

// Specifically check Cerise_Bouquet_Special_Thanks
const cerise = invalidSongs.find(s => s.name === 'Cerise_Bouquet_Special_Thanks');
if (cerise) {
    console.log("\nWARNING: Cerise_Bouquet_Special_Thanks is still flagged!");
} else {
    console.log("\nCerise_Bouquet_Special_Thanks passed validation.");
}




