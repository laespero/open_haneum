const fs = require('fs');
const path = require('path');

const songsDir = path.join(__dirname, '../songs');
const tagToAdd = '개발용';

if (!fs.existsSync(songsDir)) {
    console.error('songs directory not found at:', songsDir);
    process.exit(1);
}

const files = fs.readdirSync(songsDir);
let processedCount = 0;

console.log('Scanning files...');

files.forEach(file => {
    if (!file.endsWith('.json')) return;

    const filePath = path.join(songsDir, file);
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);

        // Check condition: p1 array has length 1
        if (Array.isArray(data.p1) && data.p1.length === 1) {
            
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
            }
        }
    } catch (err) {
        console.error(`Error processing ${file}:`, err.message);
    }
});

console.log(`Done. Updated ${processedCount} files.`);

