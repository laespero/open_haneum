const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../songs/Tomoo_Window.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('Top level keys:', Object.keys(data));

Object.keys(data).forEach(key => {
    if (Array.isArray(data[key])) {
        console.log(`\nKey: ${key} is an Array. Length: ${data[key].length}`);
        if (data[key].length > 0) {
            console.log(`First element keys of ${key}:`, Object.keys(data[key][0]));
            // Check if O0 exists in the first few elements
            const sample = data[key].find(item => item.O0);
            if (sample) {
                console.log(`Found O0 in ${key} array.`);
            }
        }
    }
});







