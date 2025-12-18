const fs = require('fs');

const viewCounts = JSON.parse(fs.readFileSync('viewCounts.json', 'utf8'));
const keys = Object.keys(viewCounts);
const normalizedKeys = new Map();
const duplicates = [];

keys.forEach(key => {
    const lowerKey = key.toLowerCase();
    if (normalizedKeys.has(lowerKey)) {
        duplicates.push({
            original: normalizedKeys.get(lowerKey),
            duplicate: key,
            normalized: lowerKey
        });
    } else {
        normalizedKeys.set(lowerKey, key);
    }
});

if (duplicates.length > 0) {
    console.log('Found case-insensitive duplicates:');
    duplicates.forEach(d => {
        console.log(`- "${d.original}" and "${d.duplicate}" (normalized: "${d.normalized}")`);
    });
} else {
    console.log('No case-insensitive duplicates found.');
}

