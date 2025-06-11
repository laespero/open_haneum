const fs = require('fs');
const path = require('path');

// 명령줄 인자에서 파일 경로와 rubyData를 받습니다
const [,, filePath, rubyData] = process.argv;

if (!filePath || !rubyData) {
  console.error('사용법: node update_ruby_data.cjs <파일경로> <rubyData>');
  process.exit(1);
}

try {
  // JSON 파일 읽기
  const fullPath = path.join(process.cwd(), filePath);
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));

  // rubyData 업데이트
  data.rubyData = rubyData;

  // 변경사항 저장
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`성공적으로 ${filePath}의 rubyData가 업데이트되었습니다.`);
} catch (error) {
  console.error('오류 발생:', error.message);
  process.exit(1);
} 