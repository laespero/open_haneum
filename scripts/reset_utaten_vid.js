const fs = require('fs');
const path = require('path');

const songsDir = path.join(__dirname, 'songs');

async function resetVidForUtatenImport() {
    try {
        const files = await fs.promises.readdir(songsDir);
        let updateCount = 0;

        for (const file of files) {
            if (path.extname(file) !== '.json') continue;

            const filePath = path.join(songsDir, file);
            const data = await fs.promises.readFile(filePath, 'utf8');
            
            try {
                const songData = JSON.parse(data);
                
                if (songData.tags && songData.tags.includes('UtatenImport')) {
                    if (songData.vid !== "") {
                        songData.vid = "";
                        await fs.promises.writeFile(filePath, JSON.stringify(songData, null, 2));
                        console.log(`Updated: ${file}`);
                        updateCount++;
                    }
                }
            } catch (err) {
                console.error(`Error processing ${file}:`, err.message);
            }
        }

        console.log(`\nTotal songs updated: ${updateCount}`);

    } catch (error) {
        console.error('Error reading songs directory:', error);
    }
}

resetVidForUtatenImport();

