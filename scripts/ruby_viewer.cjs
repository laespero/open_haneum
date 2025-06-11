const fs = require('fs');
const path = require('path');

// 명령줄 인자 확인
const args = process.argv.slice(2);
if (args.length !== 1) {
    console.log('사용법: node scripts/ruby_viewer.cjs <파일명.json>');
    console.log('예시: node scripts/ruby_viewer.cjs Ilove.json');
    process.exit(1);
}

const filename = args[0];
const filepath = path.join('songs', filename);

// 파일 존재 확인
if (!fs.existsSync(filepath)) {
    console.error(`❌ 파일을 찾을 수 없습니다: ${filepath}`);
    process.exit(1);
}

// HTML을 간단한 형태로 변환하는 함수
function simplifyRubyHTML(html) {
    if (!html) return '';
    return html
        .replace(/<span class="ruby"><span class="rb">([^<]+)<\/span><span class="rt">([^<]+)<\/span><\/span>/g, '$1($2)')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

// rubyData에서 특정 라인 추출
function extractLineFromRubyData(rubyData, targetLine) {
    if (!rubyData || !targetLine) return '';
    
    const lines = rubyData.split('<br>');
    for (const line of lines) {
        const simplified = simplifyRubyHTML(line);
        const cleanTarget = targetLine.replace(/\s/g, '');
        const cleanLine = simplified.replace(/\s/g, '').replace(/\([^)]*\)/g, '');
        
        if (cleanLine.includes(cleanTarget) || cleanTarget.includes(cleanLine)) {
            return simplified;
        }
    }
    return '';
}

// messages.js 규정에 맞는 일본어 한글 표기법 수정 함수
function correctJapaneseKoreanTranscription(text) {
    if (!text) return '';
    
    let corrected = text;
    
    // 1. 장음 규칙 수정 - ou 조합
    const ouPatterns = [
        { pattern: /도오/g, replacement: '도우' },
        { pattern: /소오/g, replacement: '소우' },
        { pattern: /코오/g, replacement: '코우' },
        { pattern: /토오/g, replacement: '토우' },
        { pattern: /노오/g, replacement: '노우' },
        { pattern: /요오/g, replacement: '요우' },
        { pattern: /로오/g, replacement: '로우' },
        { pattern: /보오/g, replacement: '보우' },
        { pattern: /모오/g, replacement: '모우' },
        { pattern: /호오/g, replacement: '호우' },
        { pattern: /조오/g, replacement: '조우' },
        { pattern: /포오/g, replacement: '포우' },
        { pattern: /쇼오/g, replacement: '쇼우' },
        { pattern: /료오/g, replacement: '료우' },
        { pattern: /교오/g, replacement: '교우' },
        { pattern: /효오/g, replacement: '효우' },
        { pattern: /뇨오/g, replacement: '뇨우' },
        { pattern: /오오/g, replacement: '오우' }
    ];
    
    ouPatterns.forEach(({ pattern, replacement }) => {
        corrected = corrected.replace(pattern, replacement);
    });
    
    // 2. え단 + い는 '에이'로 표기
    const eiPatterns = [
        { pattern: /데에/g, replacement: '데이' },
        { pattern: /레에/g, replacement: '레이' },
        { pattern: /케에/g, replacement: '케이' },
        { pattern: /세에/g, replacement: '세이' },
        { pattern: /네에/g, replacement: '네이' },
        { pattern: /메에/g, replacement: '메이' },
        { pattern: /테에/g, replacement: '테이' },
        { pattern: /페에/g, replacement: '페이' },
        { pattern: /헤에/g, replacement: '헤이' },
        { pattern: /베에/g, replacement: '베이' },
        { pattern: /게에/g, replacement: '게이' },
        { pattern: /제에/g, replacement: '제이' },
        { pattern: /체에/g, replacement: '체이' },
        { pattern: /셰에/g, replacement: '셰이' }
    ];
    
    eiPatterns.forEach(({ pattern, replacement }) => {
        corrected = corrected.replace(pattern, replacement);
    });
    
    // 3. uu 조합 처리 (ちゅう, しゅう 등)
    const uuPatterns = [
        { pattern: /츄우/g, replacement: '추우' },
        { pattern: /슈우/g, replacement: '슈우' },
        { pattern: /류우/g, replacement: '류우' },
        { pattern: /큐우/g, replacement: '큐우' },
        { pattern: /뮤우/g, replacement: '뮤우' },
        { pattern: /휴우/g, replacement: '휴우' },
        { pattern: /뉴우/g, replacement: '뉴우' }
    ];
    
    uuPatterns.forEach(({ pattern, replacement }) => {
        corrected = corrected.replace(pattern, replacement);
    });
    
    // 4. 특정 단어/구문별 수정
    const specificCorrections = {
        // 일반적인 단어들
        '데에타': '데이타',
        '코레쿠타아': '코레쿠타',
        '타이요오': '타이요우',
        '반소오': '반소우',
        '칸소오': '칸소우',
        '하쿠슈': '하쿠슈',
        '신카이': '신카이',
        '유메': '유메',
        '키보오': '키보우',
        '다로오': '다로우',
        '마로오': '마로우',
        
        // 조사 및 어미
        '은다테': '은다떼',
        
        // 자주 나오는 표현들
        '스노오': '스노우',
        '가쿠': '가쿠',
        '세다이': '세다이',
        '키보오': '키보우'
    };
    
    // 단어별 치환
    for (const [wrong, correct] of Object.entries(specificCorrections)) {
        const regex = new RegExp(wrong, 'g');
        corrected = corrected.replace(regex, correct);
    }
    
    // 5. 촉음(っ) 규칙 확인 - 이미 올바른지 체크
    // か행, さ행, た행, ぱ행 앞에서만 받침 ㅅ
    // 다른 경우는 표기하지 않음
    
    // 6. んだ는 '은다'로 표기
    corrected = corrected.replace(/운다/g, '은다');
    
    // 7. つ는 '츠'로 표기 (쓰, 쯔 -> 츠)
    corrected = corrected.replace(/\b쓰\b/g, '츠');
    corrected = corrected.replace(/\b쯔\b/g, '츠');
    
    // 8. 장음부호(ー) 처리
    corrected = corrected.replace(/아아/g, '아');
    corrected = corrected.replace(/이이/g, '이');
    corrected = corrected.replace(/우우/g, '우');
    corrected = corrected.replace(/에에/g, '에');
    
    // 9. 기타 특수 케이스
    corrected = corrected.replace(/지옹/g, '지우'); // iong -> 요우
    corrected = corrected.replace(/시옹/g, '시우'); // iong -> 요우
    
    return corrected;
}

try {
    // JSON 파일 읽기
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    console.log('='.repeat(80));
    console.log(`🎵 곡명: ${data.name} (${data.ori_name})`);
    console.log(`🎤 아티스트: ${data.artist.ori_name}`);
    console.log('='.repeat(80));
    
    // rubyData 통계 정보
    console.log('\n🔤 루비 데이터 통계:');
    console.log('-'.repeat(50));
    if (data.rubyData) {
        const rubyMatches = data.rubyData.match(/<span class="ruby">/g);
        const rubyCount = rubyMatches ? rubyMatches.length : 0;
        console.log(`📊 총 루비 표기 수: ${rubyCount}개`);
        
        // 한자 추출 (rubyData에서)
        const kanjiMatches = data.rubyData.match(/<span class="rb">([^<]+)<\/span>/g);
        if (kanjiMatches) {
            const kanjis = kanjiMatches.map(match => 
                match.replace(/<span class="rb">([^<]+)<\/span>/, '$1')
            );
            console.log(`📚 루비가 적용된 한자들: ${[...new Set(kanjis)].join(', ')}`);
        }
    }
    
    console.log('\n📋 T0/매칭 결과/R0 순서별 가사:');
    console.log('='.repeat(80));
    
    // translatedLines가 있으면 우선 사용, 없으면 contextText 사용
    let sourceData = null;
    let dataType = '';
    
    if (data.translatedLines && data.translatedLines.length > 0) {
        sourceData = data.translatedLines;
        dataType = 'translatedLines';
        console.log(`📋 데이터 소스: translatedLines (${sourceData.length}개 라인)`);
    } else if (data.contextText && data.contextText.length > 0) {
        sourceData = data.contextText;
        dataType = 'contextText';
        console.log(`📋 데이터 소스: contextText (${sourceData.length}개 라인)`);
    } else if (data.p1) {
        sourceData = data.p1.map(line => ({ T0: line }));
        dataType = 'p1';
        console.log(`📋 데이터 소스: p1 (${sourceData.length}개 라인)`);
    }
    
    console.log('='.repeat(80));
    
    // T0/매칭 결과/R0 순서로 한 문장씩 출력
    if (sourceData) {
        sourceData.forEach((item, index) => {
            console.log(`\n[${(index + 1).toString().padStart(2, '0')}번째 문장]`);
            
            // T0가 객체인 경우와 문자열인 경우 처리
            const t0Text = typeof item === 'string' ? item : item.T0;
            console.log(`📝 T0 (원본): ${t0Text}`);
            
            // 매칭 결과 찾기
            const matchedRuby = extractLineFromRubyData(data.rubyData, t0Text);
            if (matchedRuby) {
                console.log(`🔤 매칭 결과: ${matchedRuby}`);
            } else {
                console.log(`🔤 매칭 결과: (매칭된 루비 없음)`);
            }
            
            // R0 (발음) 출력 - messages.js 규정에 맞게 수정
            if (typeof item === 'object' && item.R0) {
                const originalR0 = item.R0;
                const correctedR0 = correctJapaneseKoreanTranscription(originalR0);
                
                console.log(`🎌 R0 (원본): ${originalR0}`);
                if (originalR0 !== correctedR0) {
                    console.log(`🎌 R0 (수정): ${correctedR0}`);
                } else {
                    console.log(`🎌 R0 (수정): (수정사항 없음)`);
                }
            } else {
                console.log(`🎌 R0 (발음): (발음 정보 없음)`);
            }
            
            console.log('-'.repeat(60));
        });
    } else {
        console.log('❌ 처리할 수 있는 가사 데이터를 찾을 수 없습니다.');
    }
    
    // 실패한 라인이 있다면 표시
    if (data.failedLines && data.failedLines.length > 0) {
        console.log('\n⚠️  처리되지 않은 라인들:');
        console.log('-'.repeat(50));
        data.failedLines.forEach((line, index) => {
            console.log(`${index + 1}. ${line}`);
        });
    } else {
        console.log('\n✅ 모든 라인이 성공적으로 처리되었습니다!');
    }
    
    console.log('\n' + '='.repeat(80));
    
} catch (error) {
    console.error(`❌ 파일 처리 중 오류 발생: ${error.message}`);
    process.exit(1);
} 