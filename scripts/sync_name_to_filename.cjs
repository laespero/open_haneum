const fs = require('fs');
const path = require('path');

const songsDir = path.join(__dirname, '../songs');

console.log('Starting check: Syncing JSON "name" field to match filenames...');

let updatedCount = 0;
let errorCount = 0;
let totalCount = 0;

try {
    const files = fs.readdirSync(songsDir);

    files.forEach(file => {
        if (path.extname(file) !== '.json') return;

        totalCount++;
        const filePath = path.join(songsDir, file);
        const fileNameNoExt = path.basename(file, '.json');

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);
            
            // Check if name is different from filename (case-sensitive check covers case differences too)
            if (data.name !== fileNameNoExt) {
                console.log(`[Mismatch] File: ${file}`);
                console.log(`  Current "name": "${data.name}"`);
                console.log(`  New "name"    : "${fileNameNoExt}"`);
                
                data.name = fileNameNoExt;
                
                // Write the file back with standard formatting
                fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
                updatedCount++;
            }
        } catch (err) {
            console.error(`Error processing file ${file}:`, err.message);
            errorCount++;
        }
    });

    console.log('------------------------------------------------');
    console.log(`Process completed.`);
    console.log(`Total JSON files checked: ${totalCount}`);
    console.log(`Updated files: ${updatedCount}`);
    console.log(`Errors: ${errorCount}`);

} catch (err) {
    console.error('Failed to read songs directory:', err);
}

