const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../songs/deep_twilight.json');
const content = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(content);

const p1Set = new Set(data.p1);

data.translatedLines.forEach((line, index) => {
    if (line.O0 && !p1Set.has(line.O0)) {
        console.log(`Mismatch found at index ${index}`);
        console.log('Object content:', JSON.stringify(line, null, 2));
    }
});

