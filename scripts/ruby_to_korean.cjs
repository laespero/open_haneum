const fs = require('fs');
const path = require('path');
const Hangul = require('hangul-js');

// 명령줄 인자 확인
const args = process.argv.slice(2);
const jsonFileArg = args.find(arg => arg.endsWith('.json'));
const shouldWrite = args.includes('--write');
const shouldCompare = args.includes('--compare');

if (!jsonFileArg) {
    console.log('사용법: node scripts/ruby_to_korean.cjs <파일명.json> [--write | --compare]');
    console.log('  --write:   자동 생성된 발음(R0_auto)을 파일에 씁니다.');
    console.log('  --compare: 기존 발음(R0)과 자동 생성된 발음(R0_auto)을 비교합니다.');
    process.exit(1);
}

const filename = jsonFileArg;
const filepath = path.join('songs', filename);

// 파일 존재 확인
if (!fs.existsSync(filepath)) {
    console.error(`❌ 파일을 찾을 수 없습니다: ${filepath}`);
    process.exit(1);
}

// 히라가나 → 한글 변환 매핑 테이블
const hiraganaToKorean = {
    // あ행
    'あ': '아', 'い': '이', 'う': '우', 'え': '에', 'お': '오',
    // か행
    'か': '카', 'き': '키', 'く': '쿠', 'け': '케', 'こ': '코',
    'が': '가', 'ぎ': '기', 'ぐ': '구', 'げ': '게', 'ご': '고',
    // さ행
    'さ': '사', 'し': '시', 'す': '스', 'せ': '세', 'そ': '소',
    'ざ': '자', 'じ': '지', 'ず': '즈', 'ぜ': '제', 'ぞ': '조',
    // た행
    'た': '타', 'ち': '치', 'つ': '츠', 'て': '테', 'と': '토',
    'だ': '다', 'ぢ': '지', 'づ': '즈', 'で': '데', 'ど': '도',
    // な행
    'な': '나', 'に': '니', 'ぬ': '누', 'ね': '네', 'の': '노',
    // は행
    'は': '하', 'ひ': '히', 'ふ': '후', 'へ': '헤', 'ほ': '호',
    'ば': '바', 'び': '비', 'ぶ': '부', 'べ': '베', 'ぼ': '보',
    'ぱ': '파', 'ぴ': '피', 'ぷ': '푸', 'ぺ': '페', 'ぽ': '포',
    // ま행
    'ま': '마', 'み': '미', 'む': '무', 'め': '메', 'も': '모',
    // や행
    'や': '야', 'ゆ': '유', 'よ': '요',
    // ら행
    'ら': '라', 'り': '리', 'る': '루', 'れ': '레', 'ろ': '로',
    // わ행
    'わ': '와', 'ゐ': '위', 'ゑ': '웨', 'を': '오',
    
    // 요음 (小音) - きゃ, きゅ, きょ 등
    'きゃ': '캬', 'きゅ': '큐', 'きょ': '쿄',
    'しゃ': '샤', 'しゅ': '슈', 'しょ': '쇼',
    'ちゃ': '차', 'ちゅ': '추', 'ちょ': '초',
    'にゃ': '냐', 'にゅ': '뉴', 'にょ': '뇨',
    'ひゃ': '햐', 'ひゅ': '휴', 'ひょ': '효',
    'みゃ': '먀', 'みゅ': '뮤', 'みょ': '묘',
    'りゃ': '랴', 'りゅ': '류', 'りょ': '료',
    'ぎゃ': '갸', 'ぎゅ': '규', 'ぎょ': '교',
    'じゃ': '쟈', 'じゅ': '쥬', 'じょ': '죠',
    'びゃ': '뱌', 'びゅ': '뷰', 'びょ': '뵤',
    'ぴゃ': '퍄', 'ぴゅ': '퓨', 'ぴょ': '표',
    
    // 특수 문자
    'ー': '', // 장음 기호
};

// 히라가나를 한글로 변환하는 함수 (hangul-js 적용)
function convertHiraganaToKorean(hiragana) {
    if (!hiragana) return '';
    let text = '';
    let i = 0;

    // 1단계: 기본적인 히라가나-한글 자모 매핑
    while (i < hiragana.length) {
        let consumed = 0;
        // 요음(ゃ, ゅ, ょ) 처리
        if (i + 1 < hiragana.length) {
            const twoChar = hiragana.substring(i, i + 2);
            if (hiraganaToKorean[twoChar]) {
                text += hiraganaToKorean[twoChar];
                consumed = 2;
            }
        }
        if (consumed === 0) {
            const oneChar = hiragana[i];
            if (hiraganaToKorean[oneChar]) {
                text += hiraganaToKorean[oneChar];
            } else if (oneChar === 'ん') {
                // 'ん'은 'ㄴ' 받침으로 처리하기 위해 분해된 형태로 추가
                text += 'ㄴ';
            } else if (oneChar === 'っ') {
                // 촉음 'っ' 처리: 뒤따르는 자음이 [か행, さ행, た행, ぱ행]일 경우 'ㅅ' 받침 추가
                 if (i + 1 < hiragana.length) {
                    const nextKana = hiragana[i + 1];
                    if (['か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ', 'た', 'ち', 'つ', 'て', 'と', 'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'].some(char => nextKana.startsWith(char))) {
                        text += 'ㅅ';
                    }
                }
            } else {
                text += oneChar;
            }
            consumed = 1;
        }
        i += consumed;
    }

    // 2단계: hangul-js를 사용하여 자모를 완성된 한글로 조립
    let assembledText = Hangul.assemble(text.split(''));
    
    // 3단계: 장음 처리
    return applyLongVowelRules(assembledText);
}


// 장음 규칙 적용 함수
function applyLongVowelRules(text) {
    // 장음 규칙은 그대로 유지
    text = text.replace(/오오/g, '오우');
    text = text.replace(/에에/g, '에이');
    text = text.replace(/아아/g, '아');
    text = text.replace(/이이/g, '이');
    text = text.replace(/우우/g, '우');
    return text;
}

// rubyData에서 모든 루비 정보 추출
function extractAllRubyData(rubyData) {
    if (!rubyData) return [];
    const rubyPattern = /<span class="ruby"><span class="rb">([^<]+)<\/span><span class="rt">([^<]+)<\/span><\/span>/g;
    const results = [];
    let match;
    while ((match = rubyPattern.exec(rubyData)) !== null) {
        results.push({ kanji: match[1], hiragana: match[2], korean: convertHiraganaToKorean(match[2]) });
    }
    return results;
}

// 루비가 적용된 텍스트를 한글 발음으로 변환
function convertRubyToKoreanText(rubyDataLine) {
    if (!rubyDataLine) return '';

    // 1단계: 루비 태그를 해당 히라가나 발음으로 대체하여 순수 일본어 문자열 생성
    let fullJapaneseString = rubyDataLine.replace(
        /<span class="ruby"><span class="rb">[^<]+<\/span><span class="rt">([^<]+)<\/span><\/span>/g,
        (match, hiragana) => hiragana
    );

    // 2단계: 혹시 모를 다른 태그 제거 및 HTML 엔티티 변환
    fullJapaneseString = fullJapaneseString.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

    // 3단계: 완성된 순수 일본어 문자열 전체를 한글로 변환
    return convertHiraganaToKorean(fullJapaneseString);
}

function normalizePronunciation(str) {
    if (!str) return '';
    // 모든 공백 제거, 소문자화 (혹시 모를 영문 대비)
    return str.replace(/\s+/g, '').toLowerCase();
}

try {
    const jsonString = fs.readFileSync(filepath, 'utf8');
    const data = JSON.parse(jsonString);
    
    console.log('='.repeat(80));
    console.log(`🎵 곡명: ${data.name} (${data.ori_name})`);
    console.log(`🎤 아티스트: ${data.artist.ori_name}`);
    console.log('='.repeat(80));

    if (!data.rubyData) {
        console.log('❌ rubyData가 없습니다.');
        process.exit(1);
    }
    
    if (shouldCompare) {
        console.log('🔍 --compare 옵션 감지. 기존 R0와 자동 생성 R0_auto를 비교합니다...');
        if (!data.translatedLines || data.translatedLines.length === 0) {
            console.error('❌ 비교할 translatedLines 데이터가 없습니다.');
            process.exit(1);
        }

        let comparedCount = 0;
        let mismatchCount = 0;
        const mismatches = [];

        data.translatedLines.forEach((line, index) => {
            const originalJapanese = line.T0;
            const manualR0 = line.R0;
            
            // R0_auto가 없으면 이 자리에서 생성해서 비교
            const autoR0 = line.R0_auto || convertRubyToKoreanText(
                data.rubyData.split('<br>')[index] || ''
            );

            if (manualR0) {
                comparedCount++;
                const normalizedManual = normalizePronunciation(manualR0);
                const normalizedAuto = normalizePronunciation(autoR0);

                if (normalizedManual !== normalizedAuto) {
                    mismatchCount++;
                    mismatches.push({
                        index: index + 1,
                        T0: originalJapanese,
                        R0: manualR0,
                        R0_auto: autoR0,
                    });
                }
            }
        });

        console.log('='.repeat(80));
        console.log('📊 비교 결과 요약');
        console.log(`- 총 비교 라인: ${comparedCount}개`);
        console.log(`- 불일치 라인: ${mismatchCount}개`);
        console.log('='.repeat(80));

        if (mismatchCount > 0) {
            console.log('\n🚨 발음 불일치 상세 내역:');
            mismatches.forEach(m => {
                console.log(`\n[${m.index}번째 라인]`);
                console.log(`  - 원본 (T0)  : ${m.T0}`);
                console.log(`  - 기존 (R0)  : ${m.R0}`);
                console.log(`  - 자동 (R0_auto): ${m.R0_auto}`);
            });
        } else {
            console.log('\n✅ 모든 발음이 일치합니다!');
        }

    } else if (shouldWrite) {
        console.log('🖊️  --write 옵션 감지. 파일에 자동 생성된 발음을 추가합니다...');
        
        const rubyLines = data.rubyData.split('<br>');
        const generatedKoreanLines = rubyLines.map(line => convertRubyToKoreanText(line));
        
        let updated = false;
        if (data.translatedLines && data.translatedLines.length > 0) {
            if (data.translatedLines.length === generatedKoreanLines.length) {
                data.translatedLines.forEach((line, index) => {
                    line.R0_auto = generatedKoreanLines[index];
                });
                updated = true;
                console.log(`✅ ${data.translatedLines.length}개의 라인에 'R0_auto' 필드를 추가/업데이트했습니다.`);
            } else {
                console.warn(`⚠️ 경고: translatedLines(${data.translatedLines.length})와 rubyData 라인 수(${generatedKoreanLines.length})가 일치하지 않아 자동 업데이트를 건너뜁니다.`);
            }
        } else {
            console.warn('⚠️ 경고: translatedLines 배열이 없어 파일에 쓸 수 없습니다.');
        }

        if (updated) {
            fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`💾 파일 저장 완료: ${filepath}`);
        }

    } else {
        console.log('\n📚 루비 데이터 → 한글 발음 변환 결과 (개선된 규칙 적용):');
        console.log('-'.repeat(80));
        const allRubyData = extractAllRubyData(data.rubyData);
        console.log(`총 ${allRubyData.length}개의 루비 표기 발견`);
        console.log('-'.repeat(80));
        allRubyData.forEach((item, index) => {
            console.log(`${(index + 1).toString().padStart(3, ' ')}. ${item.kanji} → ${item.hiragana} → ${item.korean}`);
        });
        
        console.log('\n' + '='.repeat(80));
        console.log('🎌 전체 가사의 한글 발음 생성:');
        console.log('='.repeat(80));
        data.rubyData.split('<br>').forEach((line, index) => {
            if (line.trim()) {
                const koreanLine = convertRubyToKoreanText(line);
                if (koreanLine.trim()) {
                    console.log(`${(index + 1).toString().padStart(2, '0')}. ${koreanLine}`);
                }
            }
        });
    }
    
    console.log('\n' + '='.repeat(80));
    
} catch (error) {
    console.error(`❌ 파일 처리 중 오류 발생: ${error.message}`);
    process.exit(1);
} 