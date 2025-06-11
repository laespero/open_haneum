const puppeteer = require('puppeteer');

async function extractUtenData(url) {
    if (!url) {
        console.log('❌ 사용법: node extract_utaten_data.cjs <utaten_url>');
        console.log('예시: node extract_utaten_data.cjs https://utaten.com/lyric/mi19090903/');
        process.exit(1);
    }

    // URL 유효성 검사
    if (!url.includes('utaten.com')) {
        console.log('❌ 올바른 utaten.com URL을 입력해주세요.');
        process.exit(1);
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    try {
        console.log(`🔍 URL 접속 중: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2' });
        
        // 여러 가능한 셀렉터 시도
        const selectors = [
            '.hiragana',
            '.kashi .hiragana',
            '.kashi-area .hiragana',
            '.lyric .hiragana',
            '.lyric-area .hiragana',
            '[class*="hiragana"]'
        ];
        
        let htmlContent = null;
        let usedSelector = null;
        
        for (const selector of selectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    htmlContent = await page.evaluate((sel) => {
                        const elem = document.querySelector(sel);
                        return elem ? elem.innerHTML : null;
                    }, selector);
                    
                    if (htmlContent && htmlContent.trim().length > 0) {
                        usedSelector = selector;
                        break;
                    }
                }
            } catch (error) {
                console.log(`셀렉터 ${selector} 실패:`, error.message);
            }
        }
        
        if (!htmlContent) {
            // 페이지 전체에서 ruby 태그 찾기
            const rubyTags = await page.evaluate(() => {
                const rubyElements = document.querySelectorAll('.ruby, ruby');
                return rubyElements.length;
            });
            
            if (rubyTags > 0) {
                htmlContent = await page.evaluate(() => {
                    const container = document.querySelector('.kashi, .lyric, .lyric-area, .kashi-area') || document.body;
                    return container.innerHTML;
                });
                usedSelector = 'fallback: full container';
            }
        }
        
        if (htmlContent) {
            // 루비 태그 개수 확인
            const rubyCount = (htmlContent.match(/<span class="ruby">/g) || []).length;
            console.log(`\n✅ 데이터 추출 성공!`);
            console.log(`사용된 셀렉터: ${usedSelector}`);
            console.log(`루비 태그 개수: ${rubyCount}개`);
            
            // 루비 태그 미리보기
            const rubyMatches = htmlContent.match(/<span class="ruby">.*?<\/span>/g);
            if (rubyMatches && rubyMatches.length > 0) {
                console.log('\n🔍 루비 태그 미리보기 (처음 10개):');
                rubyMatches.slice(0, 10).forEach((match, index) => {
                    console.log(`${index + 1}. ${match}`);
                });
                
                if (rubyMatches.length > 10) {
                    console.log(`... 그 외 ${rubyMatches.length - 10}개 더`);
                }
            }
            
            // 전체 HTML 내용 출력
            console.log('\n📄 추출된 HTML 내용:');
            console.log('=' + '='.repeat(50));
            console.log(htmlContent);
            console.log('=' + '='.repeat(50));
            
        } else {
            console.log('❌ 데이터 추출 실패');
            console.log('페이지에서 히라가나 가사를 찾을 수 없습니다.');
        }
        
    } catch (error) {
        console.error('❌ 오류 발생:', error.message);
    } finally {
        await browser.close();
    }
}

// 커맨드라인 인자 받기
const url = process.argv[2];
extractUtenData(url); 