const fs = require('fs');
const path = require('path');

// JSON 파일 읽기
const jsonPath = path.join(__dirname, '../songs/Haiirotoao.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let rubyData = jsonData.rubyData;

// 1.覚束無 ruby 블록 뒤에 'ない'가 일반 텍스트로 붙는 패턴을 찾아 전체를 하나의 ruby 블록으로 합침
rubyData = rubyData.replace(
  /<span class="ruby"><span class="rb">覚束無<\/span><span class="rt">おぼつか<\/span><\/span>ない/g,
  '<span class="ruby"><span class="rb">覚束無い</span><span class="rt">おぼつかない</span></span>'
);

// 2. <span class="rb"> 終</span>의 공백만 제거
rubyData = rubyData.replace(/<span class="rb">\s*終<\/span>/g, '<span class="rb">終</span>');

// 3. <span class="rt">...</span> 뒤에 ruby 닫는 태그가 없고, 바로 일반 텍스트(の, わり 등)가 나오면 그 앞에 </span> 삽입
rubyData = rubyData.replace(/(<span class="rt">[^<]*<\/span>)([のわり])/g, '$1</span>$2');

jsonData.rubyData = rubyData;
fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');

console.log('rubyData가 최종적으로 보정되었습니다.'); 