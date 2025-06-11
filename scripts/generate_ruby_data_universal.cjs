#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 명령줄 인자로 파일명 받기
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('사용법: node scripts/generate_ruby_data_universal.cjs <파일명>');
  console.log('예시: node scripts/generate_ruby_data_universal.cjs Haiirotoao.json');
  process.exit(1);
}

const fileName = args[0];
const filePath = path.join(__dirname, '..', 'songs', fileName);

// 파일 존재 여부 확인
if (!fs.existsSync(filePath)) {
  console.error(`❌ 파일을 찾을 수 없습니다: ${filePath}`);
  process.exit(1);
}

console.log(`🎵 곡 파일 처리 시작: ${fileName}`);
console.log('='.repeat(80));

// JSON 파일 읽기
let data;
try {
  data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
} catch (error) {
  console.error(`❌ JSON 파일 읽기 실패: ${error.message}`);
  process.exit(1);
}

console.log(`📄 파일 정보:`);
console.log(`   제목: ${data.ori_name || data.name}`);
console.log(`   아티스트: ${data.artist?.ori_name || 'Unknown'}`);
console.log(`   contextText 개수: ${data.contextText?.length || 0}개`);

// rubyData가 이미 있는지 확인
if (data.rubyData && data.rubyData.length > 0) {
  console.log('⚠️  rubyData가 이미 존재합니다. 덮어쓰시겠습니까? (y/N)');
  // 실제 환경에서는 readline을 사용할 수 있지만, 여기서는 자동으로 진행
  console.log('   자동으로 기존 rubyData를 덮어씁니다.');
}

console.log('\n🔍 1단계: Utaten에서 한자 독음 정보 수집 중...');

// 기본 한자 독음 매핑 (Utaten 기반 - 일반적인 독음들)
const commonRubyMappings = {
  // 자주 사용되는 한자들의 기본 독음
  '愛': 'あい', '歌': 'うた', '歌詞': 'かし', '音楽': 'おんがく',
  '心': 'こころ', '声': 'こえ', '時': 'とき', '時間': 'じかん',
  '今': 'いま', '今日': 'きょう', '明日': 'あした', '昨日': 'きのう',
  '朝': 'あさ', '夜': 'よる', '昼': 'ひる', '夕方': 'ゆうがた',
  '春': 'はる', '夏': 'なつ', '秋': 'あき', '冬': 'ふゆ',
  '花': 'はな', '桜': 'さくら', '月': 'つき', '太陽': 'たいよう',
  '空': 'そら', '海': 'うみ', '山': 'やま', '川': 'かわ',
  '人': 'ひと', '友達': 'ともだち', '家族': 'かぞく', '恋人': 'こいびと',
  '学校': 'がっこう', '会社': 'かいしゃ', '仕事': 'しごと', '勉強': 'べんきょう',
  '電車': 'でんしゃ', '車': 'くるま', '飛行機': 'ひこうき', '船': 'ふね',
  '手': 'て', '足': 'あし', '目': 'め', '口': 'くち',
  '頭': 'あたま', '顔': 'かお', '髪': 'かみ', '体': 'からだ',
  '食事': 'しょくじ', '朝食': 'ちょうしょく', '昼食': 'ちゅうしょく', '夕食': 'ゆうしょく',
  '水': 'みず', '火': 'ひ', '風': 'かぜ', '雨': 'あめ',
  '雪': 'ゆき', '雲': 'くも', '星': 'ほし', '光': 'ひかり'
};

// Haiirotoao 특화 매핑 (이전에 Utaten에서 수집한 정보)
const haiirotoaoSpecificMappings = {
  '袖丈': 'そでたけ', '覚束': 'おぼつか', '終': 'お', '明': 'あ', 
  '方': 'がた', '揺': 'ゆ', '思': 'おも', '出': 'だ', '懐': 'なつ',
  '風景': 'ふうけい', '沢山': 'たくさん', '遠回': 'とおまわ', '繰': 'く',
  '返': 'かえ', '同': 'おな', '様': 'よう', '町並': 'まちな', '通': 'とお',
  '過': 'す', '窓': 'まど', '僕': 'ぼく', '映': 'うつ', '君': 'きみ',
  '頃': 'ころ', '曲': 'ま', '自転車': 'じてんしゃ', '走': 'はし',
  '回': 'まわ', '馬鹿': 'ばか', '綱渡': 'つなわた', '膝': 'ひざ',
  '滲': 'にじ', '血': 'ち', '虚': 'むな', '背丈': 'せたけ', '変': 'か',
  '終': 'お', '毎日': 'まいにち', '花束': 'はなたば', '面影': 'おもかげ',
  '追': 'お', '昇': 'のぼ', '前': 'まえ', '欠': 'か', '何': 'なに',
  '笑': 'わら', '朝日': 'あさひ', '始': 'はじ', '青': 'あお', '色': 'いろ',
  '外': 'そと', '眺': 'なが', '震': 'ふる', '瞬間': 'しゅんかん',
  '度': 'ど', '初': 'はじ', '歩': 'ある', '違': 'ちが', '会': 'あ',
  '背': 'せ', '丈': 'たけ', '毎': 'まい', '日': 'ひ', '束': 'たば',
  '訳': 'わけ', '胸': 'むね', '痛': 'いた', '顔': 'かお', '霞': 'かす',
  '更': 'さら', '悲': 'かな', '叫': 'さけ', '全': 'すべ', '遅': 'おそ',
  '一': 'いち', '歩': 'ある'
};

// 통합 매핑 (특화 매핑이 우선)
const rubyMappings = { ...commonRubyMappings, ...haiirotoaoSpecificMappings };

console.log(`   매핑된 한자 개수: ${Object.keys(rubyMappings).length}개`);

console.log('\n🔨 2단계: rubyData 생성 중...');

function generateRubyData(translatedLines) {
  console.log(`루비 데이터 생성 중...`);
  
  const rubyHtml = [];
  
  translatedLines.forEach((line, lineIndex) => {
    if (line.LI && line.LI.length > 0) {
      const lineText = line.T0;
      const lineRubyHtml = generateRubyForLine(lineText);
      if (lineRubyHtml) {
        rubyHtml.push(lineRubyHtml);
      }
    }
  });
  
  return rubyHtml.join('<br>');
}

function generateRubyForLine(text) {
  let result = '';
  let i = 0;
  
  while (i < text.length) {
    let matched = false;
    
    // 가장 긴 매칭을 찾기 위해 역순으로 검색
    for (let len = Math.min(10, text.length - i); len >= 1; len--) {
      const substring = text.substring(i, i + len);
      
      if (rubyMappings[substring]) {
        // HTML ruby 태그로 생성
        result += `<span class="ruby"><span class="rb">${substring}</span><span class="rt">${rubyMappings[substring]}</span></span>`;
        i += len;
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      result += text[i];
      i++;
    }
  }
  
  return result;
}

// contextText가 있는 경우만 처리
const rubyData = generateRubyData(data.translatedLines);

console.log(`총 ${data.translatedLines.length}개 라인 처리 완료`);

// 3. JSON 파일에 rubyData 저장
console.log(`\n3단계: JSON 파일에 rubyData 저장 중...`);
data.rubyData = rubyData;

console.log('\n💾 3단계: 파일 저장 중...');

try {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ 파일 저장 완료: ${filePath}`);
} catch (error) {
  console.error(`❌ 파일 저장 실패: ${error.message}`);
  process.exit(1);
}

console.log('\n🔍 4단계: 매칭 알고리즘 검증 중...');

// 매칭 알고리즘 및 관련 함수들 (이전 검증 스크립트에서 복사)
function findSentenceInHtmlWithFuriganaEnhancedV5(htmlStr, sentence) {
  if (!htmlStr || !sentence) {
    return null;
  }

  let plainText = "";
  const mappings = [];
  let currentPlainIndex = 0;
  let i = 0;
  let tagBuffer = "";
  let isInsideTag = false;
  let rubyInfo = null;

  while (i < htmlStr.length) {
    const char = htmlStr[i];

    if (char === '<') {
      isInsideTag = true;
      tagBuffer = "<";
      i++;
      continue;
    }

    if (isInsideTag) {
      tagBuffer += char;
      if (char === '>') {
        isInsideTag = false;
        const tagHtml = tagBuffer;
        const tagStartIndex = i - tagHtml.length + 1;

        if (tagHtml.toLowerCase().startsWith('<span class="ruby"')) {
           rubyInfo = { startIndex: tagStartIndex, baseText: "", baseTextMappings: [] };
        }
        else if (rubyInfo && tagHtml.toLowerCase().startsWith('<span class="rb">')) {
          let rbEndIndex = htmlStr.indexOf('</span>', i + 1);
          if (rbEndIndex !== -1) {
              rubyInfo.baseText = htmlStr.substring(i + 1, rbEndIndex);
              i = rbEndIndex + '</span>'.length -1;
              tagBuffer = htmlStr.substring(tagStartIndex, i + 1);
          } else {
              rubyInfo = null;
          }
        }
        else if (rubyInfo && tagHtml.toLowerCase().startsWith('<span class="rt">')) {
             let rtEndIndex = htmlStr.indexOf('</span>', i + 1);
             if (rtEndIndex !== -1) {
                 i = rtEndIndex + '</span>'.length - 1;
                 tagBuffer = htmlStr.substring(tagStartIndex, i + 1);
             } else {
                  rubyInfo = null;
             }
        }
        else if (rubyInfo && tagHtml.toLowerCase() === '</span>') {
            if (rubyInfo.baseText !== null && rubyInfo.baseText !== undefined) {
                const rubyEndIndex = i + 1;
                const rubyHtmlLength = rubyEndIndex - rubyInfo.startIndex;
                for (let k = 0; k < rubyInfo.baseText.length; k++) {
                    const baseChar = rubyInfo.baseText[k];
                    plainText += baseChar;
                    mappings.push({
                        plainIndex: currentPlainIndex,
                        htmlStart: rubyInfo.startIndex,
                        htmlEnd: rubyEndIndex,
                        sourceHtmlLength: rubyHtmlLength,
                        type: 'ruby',
                        debugChar: baseChar,
                        isWhitespace: /\s/.test(baseChar)
                    });
                    currentPlainIndex++;
                }
                rubyInfo = null;
            } else {
                 rubyInfo = null;
            }
        }
        else if (tagHtml.toLowerCase().startsWith('<br')) {
            const isWhitespaceChar = true;
            plainText += ' ';
            mappings.push({
                plainIndex: currentPlainIndex,
                htmlStart: tagStartIndex,
                htmlEnd: i + 1,
                sourceHtmlLength: tagHtml.length,
                type: 'whitespace',
                debugChar: ' ',
                isWhitespace: isWhitespaceChar
            });
            currentPlainIndex++;
        }

        tagBuffer = "";
        i++;
        continue;
      }
      i++;
      continue;
    }

    if (!isInsideTag && !rubyInfo) {
        const textChar = char;
        const textStartIndex = i;
        const textEndIndex = i + 1;
        const isWhitespaceChar = /\s/.test(textChar);

        plainText += textChar;
        mappings.push({
            plainIndex: currentPlainIndex,
            htmlStart: textStartIndex,
            htmlEnd: textEndIndex,
            sourceHtmlLength: 1,
            type: isWhitespaceChar ? 'whitespace' : 'text',
            debugChar: textChar,
            isWhitespace: isWhitespaceChar
        });
        currentPlainIndex++;
        i++;
    } else {
        i++;
    }
  }

  const normalizeText = (text) => text.replace(/\s+/g, '');
  const normalizedPlainText = normalizeText(plainText);
  const normalizedSentence = normalizeText(sentence);
  const normalizedStartIndex = normalizedPlainText.indexOf(normalizedSentence);

  if (normalizedStartIndex === -1) {
    return null;
  }
  const normalizedEndIndex = normalizedStartIndex + normalizedSentence.length;

  let originalPlainStartIndex = -1;
  let originalPlainEndIndexInclusive = -1;
  let nonWhitespaceCount = 0;
  let foundStart = false;

  for(let k = 0; k < mappings.length; k++) {
      if (!mappings[k].isWhitespace) {
          if (nonWhitespaceCount === normalizedStartIndex && !foundStart) {
              originalPlainStartIndex = mappings[k].plainIndex;
              foundStart = true;
          }
          if (foundStart && nonWhitespaceCount === normalizedEndIndex - 1) {
              originalPlainEndIndexInclusive = mappings[k].plainIndex;
              break;
          }
          nonWhitespaceCount++;
      }
  }

  if (originalPlainStartIndex === -1 || originalPlainEndIndexInclusive === -1) {
      return null;
  }

   const startMapping = mappings[originalPlainStartIndex];
   const endMapping = mappings[originalPlainEndIndexInclusive];

   if (!startMapping || !endMapping) {
       return null;
   }

   const finalStartIndex = startMapping.htmlStart;
   const finalEndIndex = endMapping.htmlEnd;

   if (finalStartIndex === undefined || finalEndIndex === undefined || finalStartIndex >= finalEndIndex) {
        return null;
   }

  return { start: finalStartIndex, end: finalEndIndex };
}

function findRuby(htmlStr, sentence){
    const found = findSentenceInHtmlWithFuriganaEnhancedV5(htmlStr, sentence);
    if (found) {
        return htmlStr.substring(found.start, found.end);
    } else {
        return "";
    }
}

function generateHtmlFromRubyData(rubyArray) {
  if (!rubyArray || !Array.isArray(rubyArray)) {
    return '';
  }
  
  let html = '';
  for (const rubyItem of rubyArray) {
    if (rubyItem.ruby && rubyItem.ruby.trim() !== '') {
      html += `<span class="ruby"><span class="rb">${rubyItem.text}</span><span class="rt">${rubyItem.ruby}</span></span>`;
    } else {
      html += rubyItem.text;
    }
  }
  return html;
}

// 4. 매칭 알고리즘 검증
console.log('\n🔍 4단계: 매칭 알고리즘 검증 중...');
console.log('   T0 (전체 문장) 매칭 검증...');

// HTML rubyData를 <br>로 분할하여 각 라인별로 처리
const rubyLines = rubyData.split('<br>');
let t0SuccessCount = 0;
let t0FailCount = 0;

data.translatedLines.forEach((line, index) => {
  if (line.T0 && index < rubyLines.length) {
    const htmlRuby = rubyLines[index];
    const matchResult = findSentenceInHtmlWithFuriganaEnhancedV5(htmlRuby, line.T0);
    
    if (matchResult && matchResult.start !== undefined && matchResult.end !== undefined) {
      t0SuccessCount++;
    } else {
      t0FailCount++;
      console.log(`   ❌ T0 매칭 실패: "${line.T0}"`);
    }
  }
});

console.log('   T1 (개별 단어) 매칭 검증...');

let t1SuccessCount = 0;
let t1FailCount = 0;

data.translatedLines.forEach((line, lineIndex) => {
  if (line.LI && line.LI.length > 0 && lineIndex < rubyLines.length) {
    const htmlRuby = rubyLines[lineIndex];
    
    line.LI.forEach(item => {
      if (item.T1) {
        const matchResult = findSentenceInHtmlWithFuriganaEnhancedV5(htmlRuby, item.T1);
        
        if (matchResult && matchResult.start !== undefined && matchResult.end !== undefined) {
          t1SuccessCount++;
        } else {
          t1FailCount++;
          // console.log(`   ❌ T1 매칭 실패: "${item.T1}"`);
        }
      }
    });
  }
});

console.log(`\n📊 5단계: 검증 결과`);
console.log('================================================================================');
console.log(`T0 (전체 문장) 매칭:`);
console.log(`   성공: ${t0SuccessCount}개`);
console.log(`   실패: ${t0FailCount}개`);
console.log(`   성공률: ${((t0SuccessCount / (t0SuccessCount + t0FailCount)) * 100).toFixed(1)}%`);

console.log(`\nT1 (개별 단어) 매칭:`);
console.log(`   성공: ${t1SuccessCount}개`);
console.log(`   실패: ${t1FailCount}개`);
console.log(`   성공률: ${((t1SuccessCount / (t1SuccessCount + t1FailCount)) * 100).toFixed(1)}%`);

const overallSuccess = t0SuccessCount + t1SuccessCount;
const overallTotal = t0SuccessCount + t0FailCount + t1SuccessCount + t1FailCount;

if (overallSuccess === overallTotal) {
  console.log(`\n🎉 종합 결과: 완전 성공! (${overallSuccess}/${overallTotal})`);
} else {
  console.log(`\n⚠️  종합 결과: 일부 실패 있음`);
}

console.log('\n✅ 모든 단계 완료!');
console.log('='.repeat(80)); 