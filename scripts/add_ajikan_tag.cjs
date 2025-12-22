const fs = require('fs');
const path = require('path');

const songsDir = path.join(__dirname, '../songs');
const tagToAdd = '아지캉';
const targetArtistOriName = 'ASIAN KUNG-FU GENERATION';

if (!fs.existsSync(songsDir)) {
    console.error('songs directory not found at:', songsDir);
    process.exit(1);
}

const files = fs.readdirSync(songsDir);
let processedCount = 0;
let skippedCount = 0;

console.log('Scanning files...');

files.forEach(file => {
    if (!file.endsWith('.json')) return;

    const filePath = path.join(songsDir, file);
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);

        // Check if artist.ori_name matches
        if (data.artist && data.artist.ori_name === targetArtistOriName) {
            
            // Initialize tags if not present
            if (!Array.isArray(data.tags)) {
                data.tags = [];
            }

            // Add tag if not present
            if (!data.tags.includes(tagToAdd)) {
                data.tags.push(tagToAdd);
                
                // Write back with 2 spaces indentation (matching observed style)
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                console.log(`Updated: ${file}`);
                processedCount++;
            } else {
                skippedCount++;
            }
        }
    } catch (err) {
        console.error(`Error processing ${file}:`, err.message);
    }
});

console.log(`Done. Updated ${processedCount} files. Skipped ${skippedCount} files (already had tag).`);

