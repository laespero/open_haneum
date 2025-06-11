const fs = require('fs');
const path = require('path');

// JSON 파일 읽기
const jsonPath = path.join(__dirname, '../songs/Haiirotoao.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// 현재 rubyData 백업
const backupPath = path.join(__dirname, '../songs/Haiirotoao.rubyData.backup.json');
fs.writeFileSync(backupPath, JSON.stringify({ rubyData: jsonData.rubyData }, null, 2), 'utf8');
console.log('기존 rubyData가 백업되었습니다:', backupPath);

// rubyData 초기화
jsonData.rubyData = '';

// 수정된 JSON 저장
fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');
console.log('rubyData가 초기화되었습니다.'); 