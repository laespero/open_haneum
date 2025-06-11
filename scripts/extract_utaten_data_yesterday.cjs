const puppeteer = require('puppeteer');
const fs = require('fs');

async function extractUtenData() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    try {
        // Official髭男dism - Yesterday (イエスタディ) utaten 페이지
        await page.goto('https://utaten.com/lyric/mi19090903/', { waitUntil: 'networkidle2' });
        
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
            console.log(`✅ 데이터 추출 성공!`);
            console.log(`사용된 셀렉터: ${usedSelector}`);
            console.log(`루비 태그 개수: ${rubyCount}개`);
            
            // 파일에 저장
            fs.writeFileSync('extracted_utaten_data_yesterday.html', htmlContent, 'utf8');
            console.log('📄 extracted_utaten_data_yesterday.html 파일에 저장됨');
            
            // 루비 태그 미리보기
            const rubyMatches = htmlContent.match(/<span class="ruby">.*?<\/span>/g);
            if (rubyMatches && rubyMatches.length > 0) {
                console.log('\n🔍 루비 태그 미리보기 (처음 5개):');
                rubyMatches.slice(0, 5).forEach((match, index) => {
                    console.log(`${index + 1}. ${match}`);
                });
            }
        } else {
            console.log('❌ 데이터 추출 실패');
        }
        
    } catch (error) {
        console.error('오류 발생:', error);
    } finally {
        await browser.close();
    }
}

extractUtenData(); 