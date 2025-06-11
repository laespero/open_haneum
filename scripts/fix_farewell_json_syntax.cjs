const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'Farewell_is_the_Only_Life.json');

console.log(`Attempting to fix JSON syntax in: ${filePath}`);

try {
    let fileContent = fs.readFileSync(filePath, 'utf-8');
    let changesMade = 0;

    // "tags" 배열의 닫는 대괄호와 "rubyData" 키 사이에 쉼표가 없는 오류를 찾기 위해 정규식을 사용합니다.
    // 이번에는 좀 더 구체적인 패턴을 사용합니다.
    const regex = /(\"tags\":\s*\[\s*\"일본어\"\s*\])\s*\n\s*(\"rubyData\":)/;
    
    if (regex.test(fileContent)) {
        console.log("Found the specific syntax error. Applying fix...");
        fileContent = fileContent.replace(regex, '$1,\n$2');
        changesMade++;
    }

    if (changesMade > 0) {
        // 수정된 내용이 유효한 JSON인지 파싱하여 확인합니다.
        try {
            const data = JSON.parse(fileContent);
            // 유효하다면, 보기 좋게 포맷팅하여 파일에 다시 씁니다.
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
            console.log(`Successfully fixed syntax and reformatted ${filePath}.`);
        } catch (e) {
            console.error('Error: The fix was applied, but the file is still not valid JSON. Aborting write.', e);
            console.log('This might happen if there are other syntax errors in the file.');
        }
    } else {
        console.log('Could not find the specific syntax error (missing comma before "rubyData"). Checking if the file is already valid.');
        try {
            JSON.parse(fileContent);
            console.log('File seems to be valid JSON already.');
        } catch (e) {
            console.error('File is not valid JSON and the script could not automatically fix it.', e);
        }
    }
} catch (error) {
    console.error('Error reading or processing the file:', error);
} 