const fs = require('fs');
const path = require('path');

const songsDir = path.join(__dirname, '../songs');

try {
    const files = fs.readdirSync(songsDir);
    let updatedCount = 0;

    console.log('Starting name fix process...');

    files.forEach(file => {
        if (path.extname(file) === '.json') {
            const filePath = path.join(songsDir, file);
            const fileNameNoExt = path.basename(file, '.json');

            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const data = JSON.parse(content);

                if (data.name !== fileNameNoExt) {
                    console.log(`Updating: ${file}`);
                    console.log(`  - Old Name: "${data.name}"`);
                    console.log(`  - New Name: "${fileNameNoExt}"`);
                    
                    data.name = fileNameNoExt;
                    
                    // Write back with 2-space indentation
                    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                    updatedCount++;
                }
            } catch (err) {
                console.error(`Error processing ${file}:`, err.message);
            }
        }
    });

    console.log('--------------------------------------------------');
    console.log(`Process complete. Total files updated: ${updatedCount}`);

} catch (err) {
    console.error("Error reading directory:", err);
}

