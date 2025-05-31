const JapaneseSpecial = `
Japanese Rules:
When processing Japanese, always use Hepburn romanization(ヘボン式ローマ字), instead of IPA(International Phonetic Alphabet).
If possible, it's preferable to write the "K1" elements within "LI" in such a way that, when read sequentially, they form a coherent sentence in Korean.
If you have been given a ruby in HTML format as follows, put the result of the restoration to the original Text into the T0 entry.
(Example Input)   <span class="ruby"><span class="rb">諦</span><span class="rt">あきら</span></span>めの<span class="ruby"><span class="rb">悪</span><span class="rt">わる</span></span>い<span class="ruby"><span class="rb">輩</span><span class="rt">やから</span></span>
(Example T0)    諦めの悪い輩
형태소 분석 시에 어간과 어근을 분리해서 처리하지 마세요!
형태소 분식 시에 조사를 빼먹지 않도록 주의해 주세요!

[일본어 표기 세칙]
-장음-
기본 장음 규칙
あ단 + あ, い단 + い, う단 + う, え단 + え, お단 + う, お단 + お, 작은 글자 ぁ, ぃ, ぅ, ぇ, ぉ로 표기된 장음 및 장음 부호(ー)를 써서 표기한 장음은 전음의 모음을 따라 표기합니다.
원어	햅번식 로마자 표기	한글 표기
放送	ほうそう	hōsō	호오소오
融通	ゆうずう	yūzū	유우즈으
お母(かあ)さん	okaasan	오카아상
お姉(ねえ)さん	oneesan	오네에상
おじいさん	ojiisan	오지이상
しいたけ	shiitake	시이타케
たましい	tamashii	타마시이
いいだ	Iida	이이다
にいみ	Niimi	니이미
ひいらぎ	hiiragi	히이라기
おおきい	ōkii	오오키이
とおい	tōi	토오이
こおろぎ さとみ	Kōrogi Satomi	코오로기 사토미
おおおかやま	Ōokayama	오오오카야마

拗音(ゃ ゅ ょ) + 장음도 비슷한 규칙을 적용한다. ょ＋う → ㅛ오, ゅ＋う → ㅠ우.
状況	じょうきょう	jōkyō	죠오쿄오
集中	しゅうちゅう	shūchū	슈우츄우

따로 표기하는 경우
え단 + い는 '에이'로 표기합니다.
원어	햅번식 로마자 표기	한글 표기
けいか	keika	케이카
せいめい	seimei	세이메이
えいが	eiga	에이가
ようへい	Yōhei	요오헤이

-발음이 변형된 경우-
は와 へ가 조사로 쓰여 각각 ワ, エ로 발음될 경우, 각각 '와', '에'로 표기합니다.

-촉음-
촉음(っ)은 か행, さ행, た행, ぱ행 앞에서만 받침 ㅅ으로 표기하고, 다른 행이 뒤따를 때는 표기하지 않습니다. 앞 말 없이 촉음으로 바로 시작하는 경우와 ん 바로 뒤의 촉음도 따로 표기하지 않습니다.
원어	햅번식 로마자 표기	한글 표기
あっさり	assari	앗사리
きっと	kitto	킷토
しゅっぱつ	shuppatsu	슛파츠
がっこう	gakkō	갓코오
つっこみ	tsukkomi	츳코미
だっしゅ	dasshu	닷슈
ねっちゅう	netchū	넷추우
みっつ	mittsu	밋츠
すっごい	suggoi	스고이
っていうか	tte iu ka	테 이우 카
がんって	gan tte	간 테

-발음-
발음(ん)은 원칙적으로 받침 ㄴ으로 표기합니다.
단, 다음에 한해 예외적으로 ㅇ 받침으로 표기합니다.
漫画, 団子, 林檎, 蜜柑
원어	햅번식 로마자 표기	한글 표기
がんばる	ganbaru	간바루
かんこく	kankoku	칸코쿠
ばんごう	bangō	반고오
しんぱい	shinpai	신파이
ぜんぶ	zenbu	젠부
あんまり	anmari	안마리
しんいち	Shin'ichi	신이치
ぜんや	zen'ya	젠야
원어	햅번식 로마자 표기	한글 표기
漫画(まんが)  manga 망가
団子  だんご  dango	당고
林檎  りんご  ringo	링고
蜜柑  みかん  mikan	미캉

"んだ"(のだ의 변형)는 단독으로 적을 때, 꼭 "은다"로 한글 발음을 적어주세요!
"つ"는 "쓰"나 "쯔"가 아닌, "츠"로 한글 발음을 적어주세요!
"ja"(じゃ)나, "cha"(チャ)로 표기되는 경우, 각각 "쟈"와 "챠"로 한글 발음을 적어주세요!
"cho"(チョ)로 표기되는 경우, "쵸"로 한글 발음을 적어주세요!
`;

const ChineseSpecial = `
Chinese Rules:
When processing Chinese, always use Hanyu Pinyin(汉语拼音) instead of IPA(International Phonetic Alphabet).
Please refer to the following table(한어 병음/한글 대응표) when transferring to Korean.

[한어 병음/한글 대응표]
group,pinyin,zhuyin,hangul,example1_pinyin,example1_hangul,example2_pinyin,example2_hangul,example3_pinyin,example3_hangul
consonant,b,ㄅ,ㅂ,bā,바,bó,보,bù,부
consonant,p,ㄆ,ㅍ,pā,파,pó,포,pù,푸
consonant,m,ㄇ,ㅁ,mā,마,mó,모,mù,무
consonant,f,ㄈ,ㅃ,fā,빠,fó,뽀,fù,뿌
consonant,d,ㄉ,ㄷ,dā,다,dé,더,dù,두
consonant,t,ㄊ,ㅌ,tā,타,té,터,tù,투
consonant,n,ㄋ,ㄴ,nā,나,nó,노,nù,누
consonant,l,ㄌ,ㄹ,lā,라,ló,로,lù,루
consonant,g,ㄍ,ㄱ,gā,가,gé,거,gù,구
consonant,k,ㄎ,ㅋ,kā,카,ké,커,kù,쿠
consonant,h,ㄏ,ㅎ,hā,하,hé,허,hù,후
consonant,j,ㄐ,ㅈ,jiā,지아,jié,지에,jiù,지우
consonant,q,ㄑ,ㅊ,qiā,치아,qié,치에,qiú,치우
consonant,x,ㄒ,ㅅ(시 계열),xiā,시아,xié,시에,xiù,시우
consonant,zh [zhi],ㄓ,ㅈ[즈],zhī,즈,zhá,자,zhōng,종
consonant,ch [chi],ㄔ,ㅊ[츠],chī,츠,chá,차,chōng,총
consonant,sh [shi],ㄕ,ㅅ[스],shī,스,shá,샤,shōu,셔우
consonant,r [ri],ㄖ,ㄹ[르],rì,르,rá,라,róng,롱
consonant,z [zi],ㄗ,ㅉ[쯔],zī,쯔,zá,짜,zǒu,쩌우
consonant,c [ci],ㄘ,ㅊ[츠],cī,츠,cáo,차오,còu,초우
consonant,s [si],ㄙ,ㅆ[쓰],sī,쓰,sá,싸,sòu,쏘우
vowel,a,ㄚ,아,bā,바,mā,마,dā,다
vowel,o,ㄛ,오,bō,보,mó,모,dō,도
vowel,e,ㄜ,어,bè,버,mè,머,dè,더
vowel,ê,ㄝ,에,xiē,시에,piē,피에,liē,리에
vowel,i (yi),ㄧ,이,yī,이,bǐ,비,mì,미
vowel,u (wu),ㄨ,우,wū,우,bù,부,mù,무
vowel,ü (yu),ㄩ,위,nǚ,뉘,jǔ,쥐,lǜ,뤼
vowel,ai,ㄞ,아이,bái,바이,mài,마이,tái,타이
vowel,ei,ㄟ,에이,bèi,베이,méi,메이,lèi,레이
vowel,ao,ㄠ,아오,bāo,바오,māo,마오,dào,다오
vowel,ou,ㄡ,어우,dòu,더우,gòu,거우,kòu,커우
vowel,wa (ua),ㄨㄚ,와,wā,와,guā,과,kuā,콰
vowel,wo (uo),ㄨㄛ,우어,wǒ,워,duō,두어,guō,구어
vowel,wai (uai),ㄨㄞ,와이,wāi,와이,huái,화이,kuài,콰이
vowel,wei (ui),ㄨㄟ,웨이(우이),wéi,웨이,duì,두이,suī,쑤이
vowel,an,ㄢ,안,bān,반,màn,만,dàn,단
vowel,en,ㄣ,언,bēn,번,mēn,먼,dēn,던
vowel,ang,ㄤ,앙,bāng,방,máng,망,dàng,당
vowel,eng,ㄥ,엉,bēng,벙,méng,멍,dèng,덩
vowel,wan (uan),ㄨㄢ,완(우안),wān,완,duān,두안,suān,쑤안
vowel,wen (un),ㄨㄣ,원(운),wēn,원,dūn,둔,sūn,쑨
vowel,wang (uang),ㄨㄤ,왕(우앙),wāng,왕,huāng,황,kuāng,쾅
vowel,weng (ong),ㄨㄥ,웡(웅),wēng,웡,dōng,동,gōng,공
vowel,er (r),ㄦ,얼,ér,얼,ěr,얼,èr,얼
vowel,yue (üe),ㄩㄝ,웨,yuē,웨,jué,줴,quē,췌
vowel,ya (ia),ㄧㄚ,야,yā,야,jiā,지아,xiā,시아
vowel,yo,,요,"(현대 표준중국어에서는 감탄사 등으로 매우 드묾)","(별도 예시 없음)",,,
vowel,ye (ie),ㄧㄝ,예(이에),yē,예,jiē,지에,xiē,시에
vowel,yai,,야이,yāi,"야이 (현대 중국어에서 실제 사용은 거의 없음)",,,
vowel,yao (iao),ㄧㄠ,야오,yāo,야오,jiǎo,쟈오,xiāo,샤오
vowel,you (iou, iu),ㄧㄡ,요우(이우),yōu,요우,jiù,지우,xiù,시우
vowel,yan (ian),ㄧㄢ,옌,yān,옌,jiān,지엔,xiān,시엔
vowel,yin (in),ㄧㄣ,인,yīn,인,jīn,진,xīn,신
vowel,yang (iang),ㄧㄤ,양(이앙),yāng,양,jiāng,지앙,xiāng,시앙
vowel,ying (ing),ㄧㄥ,잉,yīng,잉,jīng,징,xīng,싱
vowel,yuan (üan),ㄩㄢ,위엔,yuān,위엔,juān,쥐엔,quán,취엔
vowel,yun (ün),ㄩㄣ,윈,yún,윈,jùn,쥔,xùn,쉰
vowel,yong (iong),ㄩㄥ,용(이옹),yōng,용,jiōng,지옹,xiōng,시옹

When you transcribe 'duō/duǒ/duó/duò', always write it as '두어'.
When you transcribe 'dōu/dǒu/dóu/dòu', always write it as '더우'.
When you transcribe 'yòu/yǒu/yóu/yōu', always write it as '요우'.
When you transcribe 'bié/biè', always write it as '비에'.
When you transcribe 'biǎn/biàn/biān', always write it as '비엔'.
When you transcribe 'diǎn/diàn/diān', always write it as '디엔'.
When you transcribe 'tiān/tián/tiǎn/tiàn', always write it as '티엔'.
When you transcribe 'gěi', always write it as '게이'.
When you transcribe 'yān/yǎn/yán/yàn', always write it as '옌'.
When you transcribe 'céng/cèng/cēng', always write it as '청'.
When you transcribe 'gēng/gěng', always write it as '껑'.
When you transcribe 'yù/yǔ/yú', always write it as '위'.
When you transcribe 'tuī/tuì/tuǐ/tuí', always write it as '투이'.
When you transcribe 'què/quē/qué', always write it as '췌'.
When you transcribe 'jué/juè', always write it as '줴'.
When you transcribe 'shēn/shén/shèn', always write it as '션'.
When you transcribe 'shēng/shěng/shèng', always write it as '셩'.
When you transcribe 'shǒu/shōu/shòu/shóu', always write it as '셔우'.
When you transcribe 'shuō/shuò', always write it as '슈어'.
When you transcribe 'shuǐ/shuì/shuí', always write it as '쉐이'.
When you transcribe 'tè', always write it as '터'.
When you transcribe 'fēn/fèn/fěn', always write it as '펀'.
When you transcribe 'xiě/xiè/xié/xiē', always write it as '시에'.
When you transcribe 'xià/xiā/xiá', always write it as '시아'.
When you transcribe 'cuò/cuō/cuó', always write it as '추어'.
When you transcribe 'cóng/cōng', always write it as '총'.
When you transcribe 'cǐ/cì/cī/cí', always write it as '츠'.
When you transcribe 'jǐ/jì/jī/jí', always write it as '지'.
When you transcribe 'tǐ/tí/tì/tī', always write it as '티'.
When you transcribe 'qǐ/qì/qī/qí', always write it as '치'.
When you transcribe 'jiě/jié/jiē/jiè', always write it as '지에'.
When you transcribe 'guài/guāi/guái/guǎi', always write it as '과이'.
When you transcribe 'guǎn/guān/guàn', always write it as '구안'.
When you transcribe 'duàn/duǎn/duān', always write it as '두안'.
When you transcribe 'hái/hāi/hái/hǎi', always write it as '하이'.
When you transcribe 'huǒ/huó/huò', always write it as '후어'.
When you transcribe 'miáo/miǎo/miào', always write it as '먀오'.
When you transcribe '么(me)', always write it as '머'.
When you transcribe '什么(shénme)', always write it as '션머'.
When you transcribe '怎么(zěnme)', always write it as '쩐머'.
When you transcribe '否(fǒu)', always write it as '뻐우'.
When you transcribe '是(shì)', always write it as '스'.
When you transcribe '想(xiǎng)', always write it as '시앙'.
When you transcribe '这(zhè)', always write it as '저'.
When you transcribe '便(biàn)', always write it as '비엔'.
When you transcribe '气(qì)', always write it as '치'.
When you transcribe '跳(tiào)', always write it as '탸오'.
`;


const SimMsg = `Perform morphological analysis on these foreign song lyrics and process them into the following JSON data format.

Data Input Format:
{
  "T0": "Lyrics to process",
  "C0": "Context of the lyrics (for reference only. Do not perform morphological analysis on this!)"
}

Data Output Format:
{
  "T0": "Lyrics to process",
  "C0": "Please translate the surrounding context (CX) into Korean.",
  "G0": "Please explain the sentence structure of T0 in Korean.",
  "K0": "Considering the context, please translate T0 into natural Korean.",
  "I0": "Please transcribe the pronunciation of T0 in IPA (International Phonetic Alphabet).",
  "R0": "Pronunciation of the sentence according to foreign language transcription rules(대한민국 국립국어원 외래어 표기법)",
  "LI": [
    {
     "T1": "Morphological unit to analyze",
     "K1": "Korean translation of T1",
     "I1": "Please transcribe the pronunciation of T1 in IPA (International Phonetic Alphabet).",
     "R1": "Pronunciation of I1 according to foreign language transcription rules",

     "E1": "Please explain the meaning of the morphological unit (T1) in a way that korean students can easily understand.",

     "T2": "Base form of T1",
     "K2": "Korean translation of T2",
     "I2": "Please transcribe the pronunciation of T2 in IPA (International Phonetic Alphabet).",
     "R2": "Pronunciation of I2 according to foreign language transcription rules",

     "XE": "Example sentence using T1",
     "XK": "Korean translation of XE",
     "XI": "Please transcribe the pronunciation of XE in IPA (International Phonetic Alphabet).",
     "XR": "Pronunciation of XI according to foreign language transcription rules",
    } 
  ]
}

Input Example 1:
{"T0":"We used to hold hands, man, that was enough (yeah)","C0":"When I was young, I fell in love We used to hold hands, man, that was enough (yeah) Then we grew up, started to touch"}

Output Example 1:
{"T0":"We used to hold hands, man, that was enough (yeah)","C0":"내가 어렸을 때, 사랑에 빠졌어. 우리는 손을 잡곤 했지, 그걸로 충분했어 (그래). 그러다가 우리는 자라서 서로 만지기 시작했어.","G0":"이 문장은 두 개의 독립적인 절로 구성되어 있습니다. 첫 번째 절은 주어(We) + 동사구(used to hold) + 목적어(hands)로 이루어져 있으며, 과거에 습관적으로 손을 잡았음을 나타냅니다. 두 번째 절은 주어(that) + 동사(was) + 보어(enough)로 구성되어 있으며, 앞서 언급한 행동이 충분했음을 강조합니다. 중간의 'man'과 문장 끝의 '(yeah)'는 감탄사로서 친근함과 감정을 표현합니다. 전체적으로 과거의 습관과 그 만족감을 나타내는 구문입니다.","K0":"우리는 손을 잡곤 했지, 그걸로 충분했어 (그래).","I0":"wi juzd tʊ hoʊld hændz, mæn, ðæt wəz ɪˈnʌf (jɛ)","R0":"위 유즈드 투 홀드 핸즈, 맨, 댓 워즈 이너프 (예)","LI":[{"T1":"We","K1":"우리","I1":"wi","R1":"위","E1":"1인칭 복수(말하는 사람을 포함한 여러 사람), 주격(주어 자리에 오는) 대명사입니다.","T2":"we","K2":"우리","I2":"wi","R2":"위","XE":"We are going to the park.","XK":"우리는 공원에 갈 거야.","XI":"wi ɑr ˈɡoʊɪŋ tə ðə pɑrk","XR":"위 아 고잉 투 더 파크"},{"T1":"used to","K1":"~하곤 했다","I1":"juzd tʊ","R1":"유즈드 투","E1":"과거에 자주 했던 반복적인 행동을 표현하는 구문입니다. 현재는 더 이상 하지 않는 행동을 의미합니다.","T2":"use","K2":"사용하다","I2":"juz","R2":"유즈","XE":"He used to play soccer every weekend.","XK":"그는 매주 주말에 축구를 하곤 했어.","XI":"hi juzd tʊ pleɪ ˈsɑkər ˈɛvri ˈwikɛnd","XR":"히 유즈드 투 플레이 사커 에브리 위켄드"},{"T1":"hold","K1":"잡다","I1":"hoʊld","R1":"홀드","E1":"손을 잡거나 물체를 붙잡는 행위를 나타내는 동사입니다.","T2":"hold","K2":"잡다","I2":"hoʊld","R2":"홀드","XE":"Can you hold this for a second?","XK":"이거 잠깐 잡아줄래?","XI":"kæn ju hoʊld ðɪs fɔr ə ˈsɛkənd","XR":"캔 유 홀드 디스 포어 세컨드"},{"T1":"hands","K1":"손","I1":"hændz","R1":"핸즈","E1":"사람의 손을 나타내는 명사입니다.","T2":"hand","K2":"손","I2":"hænd","R2":"핸드","XE":"She raised her hands in the air.","XK":"그녀는 공중으로 손을 들었다.","XI":"ʃi reɪzd hɜr hændz ɪn ði ɛr","XR":"쉬 레이즈드 허 핸즈 인 디 에어"},{"T1":"man","K1":"이봐","I1":"mæn","R1":"맨","E1":"이 문맥에서 친근하게 상대에게 말을 걸 때 사용하는 호칭으로, 명사의 호격 용법입니다.","T2":"man","K2":"남자","I2":"mæn","R2":"맨","XE":"Hey man, how's it going?","XK":"이봐, 어떻게 지내?","XI":"heɪ mæn, haʊz ɪt ˈɡoʊɪŋ","XR":"헤이 맨, 하우즈 잇 고잉?"},{"T1":"that","K1":"그것","I1":"ðæt","R1":"댓","E1":"특정 대상이나 상황을 가리키는 지시 대명사입니다. 여기서는 앞서 언급된 행동을 의미합니다.","T2":"that","K2":"그것","I2":"ðæt","R2":"댓","XE":"That is what I mean.","XK":"그게 내가 말하는 거야.","XI":"ðæt ɪz wʌt aɪ min","XR":"댓 이즈 왓 아이 민"},{"T1":"was","K1":"~였다","I1":"wəz","R1":"워즈","E1":"과거 시제를 나타내는 be 동사의 한 형태입니다. 주어가 단수일 때 사용됩니다.","T2":"be","K2":"~이다","I2":"bi","R2":"비","XE":"She was happy yesterday.","XK":"그녀는 어제 행복했어.","XI":"ʃi wəz ˈhæpi ˈjɛstərˌdeɪ","XR":"쉬 워즈 해피 예스터데이"},{"T1":"enough","K1":"충분한","I1":"ɪˈnʌf","R1":"이너프","E1":"필요한 만큼의 양이나 정도를 나타내는 형용사입니다.","T2":"enough","K2":"충분한","I2":"ɪˈnʌf","R2":"이너프","XE":"That's enough for today.","XK":"오늘은 이 정도면 충분해.","XI":"ðæts ɪˈnʌf fɔr təˈdeɪ","XR":"댓츠 이너프 포어 투데이"},{"T1":"yeah","K1":"그래","I1":"jɛ","R1":"예","E1":"긍정의 뜻을 나타내는 비격식 표현입니다.","T2":"yeah","K2":"그래","I2":"jɛ","R2":"예","XE":"Yeah, I know what you mean.","XK":"그래, 무슨 말인지 알아.","XI":"jɛ aɪ noʊ wʌt ju min","XR":"예, 아이 노우 왓 유 민"}]}

Input Example 2:
{"T0":"Uầy uầy uây uây sao mới gặp lần đầu mà đầu mình quay quay","C0":"Uầy uầy uây uây sao mới gặp lần đầu mà đầu mình quay quay Anh ơi anh à anh bỏ bùa gì mà lại làm em yêu vậy"}

Output Example 2:
{"T0":"Uầy uầy uây uây sao mới gặp lần đầu mà đầu mình quay quay","C0":"우와 우와 왜 처음 만났는데 내 머리가 빙글빙글 돌지? 오빠, 무슨 마법을 걸었길래 내가 이렇게 당신을 사랑하게 된 거예요?","G0":"이 문장은 감탄사로 시작하여 화자의 놀람이나 당황을 표현하고 있습니다. 'Uầy uầy uây uây'는 감탄사로서 '우와 우와'에 해당하며, 연속적으로 사용되어 감정을 강조합니다. 그 다음 'sao mới gặp lần đầu mà đầu mình quay quay'는 '왜 처음 만났는데 내 머리가 빙글빙글 돌지?'라는 의미로, 'sao'는 '왜', 'mới gặp lần đầu'는 '처음 만났는데', 'mà'는 접속사 '그런데', 'đầu mình quay quay'는 '내 머리가 빙글빙글 돈다'를 의미합니다. 전체적으로 화자가 상대방을 처음 만났음에도 불구하고 강한 감정을 느끼는 상황을 표현합니다.","K0":"우와 우와 왜 처음 만났는데 내 머리가 빙글빙글 돌지?","I0":"uə̆j uə̆j uəj uəj saːw məːj ɣəp lə̆n ɗəw maː ɗəw miŋ kwaj kwaj","R0":"우에이 우에이 우에이 우에이 사오 머이 갑 런 더우 마 더우 밍 꽈이 꽈이","LI":[{"T1":"Uầy","K1":"우와","I1":"uə̆j","R1":"우에이","E1":"놀람이나 감탄을 나타내는 감탄사입니다.","T2":"Uầy","K2":"우와","I2":"uə̆j","R2":"우에이","XE":"Uầy, đẹp quá!","XK":"우와, 정말 예쁘다!","XI":"uə̆j ɗɛp kwaː","XR":"우에이 덥 꽈"},{"T1":"uầy","K1":"우와","I1":"uə̆j","R1":"우에이","E1":"앞의 감탄사를 반복하여 감정을 강조합니다.","T2":"uầy","K2":"우와","I2":"uə̆j","R2":"우에이","XE":"Cô ấy nói uầy khi thấy món quà.","XK":"그녀는 선물을 보고 우와라고 말했다.","XI":"ko əj nɔj uə̆j khi tʰəj mɔn kwaː","XR":"고 아이 노이 우에이 키 터이 몬 꽈"},{"T1":"uây","K1":"우와","I1":"uəj","R1":"우에이","E1":"비슷한 감탄사로, 놀람을 표현합니다.","T2":"uây","K2":"우와","I2":"uəj","R2":"우에이","XE":"Uây, anh giỏi thật!","XK":"우와, 당신 정말 잘하네요!","XI":"uəj aŋ zɔj tʰət","XR":"우에이 앙 조이 턷"},{"T1":"uây","K1":"우와","I1":"uəj","R1":"우에이","E1":"앞의 감탄사를 반복하여 감정을 지속합니다.","T2":"uây","K2":"우와","I2":"uəj","R2":"우에이","XE":"Cậu bé kêu uây khi thấy pháo hoa.","XK":"소년은 불꽃놀이를 보고 우와라고 외쳤다.","XI":"kəw be kew uəj khi tʰəj faw hwaː","XR":"꺼우 베 께우 우에이 키 터이 파오 화"},{"T1":"sao","K1":"왜","I1":"saːw","R1":"사오","E1":"의문사로 이유를 물을 때 사용합니다.","T2":"sao","K2":"왜","I2":"saːw","R2":"사오","XE":"Sao bạn đến muộn?","XK":"왜 늦었어요?","XI":"saːw ban den muən","XR":"사오 반 덴 무언"},{"T1":"mới","K1":"방금, 막","I1":"məːj","R1":"머이","E1":"최근의 동작이나 상태를 나타냅니다.","T2":"mới","K2":"새로운","I2":"məːj","R2":"머이","XE":"Tôi mới ăn trưa.","XK":"나는 막 점심을 먹었어.","XI":"toj məːj ʔan tɕɨə","XR":"또이 머이 안 쯔어"},{"T1":"gặp","K1":"만나다","I1":"ɣəp","R1":"갑","E1":"사람을 만나는 행위를 나타냅니다.","T2":"gặp","K2":"만나다","I2":"ɣəp","R2":"갑","XE":"Tôi gặp bạn ở trường.","XK":"나는 학교에서 당신을 만났어.","XI":"toj ɣəp ban ʔə tɕɨəŋ","XR":"또이 갑 반 어 쯔엉"},{"T1":"lần","K1":"번, 회","I1":"lə̆n","R1":"런","E1":"횟수를 나타내는 명사입니다.","T2":"lần","K2":"번","I2":"lə̆n","R2":"런","XE":"Đây là lần đầu tôi đến đây.","XK":"여기가 내가 처음 오는 곳이야.","XI":"ɗəj la lə̆n ɗəw toj den ɗəj","XR":"더이 라 런 더우 또이 덴 더이"},{"T1":"đầu","K1":"처음, 머리","I1":"ɗəw","R1":"더우","E1":"문맥에 따라 '처음' 또는 '머리'를 의미합니다.","T2":"đầu","K2":"머리","I2":"ɗəw","R2":"더우","XE":"Đầu tôi đau quá.","XK":"머리가 너무 아파.","XI":"ɗəw toj ɗaw kwaː","XR":"더우 또이 다우 꽈"},{"T1":"mà","K1":"그런데","I1":"maː","R1":"마","E1":"접속사로 대조나 추가 정보를 나타냅니다.","T2":"mà","K2":"그런데","I2":"maː","R2":"마","XE":"Tôi muốn đi mà trời mưa.","XK":"가고 싶은데 비가 와.","XI":"toj muən di maː tɕəːj mɨə","XR":"또이 무언 디 마 쯔어이 므어"},{"T1":"đầu","K1":"머리","I1":"ɗəw","R1":"더우","E1":"신체 부위인 '머리'를 의미합니다.","T2":"đầu","K2":"머리","I2":"ɗəw","R2":"더우","XE":"Đầu anh ấy bị thương.","XK":"그의 머리가 다쳤어.","XI":"ɗəw aŋ əj bi tʰɨəŋ","XR":"더우 앙 아이 비 트엉"},{"T1":"mình","K1":"나, 자기","I1":"miŋ","R1":"밍","E1":"화자를 지칭하는 대명사입니다.","T2":"mình","K2":"나","I2":"miŋ","R2":"밍","XE":"Mình thích học tiếng Hàn.","XK":"나는 한국어 공부를 좋아해.","XI":"miŋ tʰik hɔk tiəŋ haːn","XR":"밍 틱 학 띠엥 한"},{"T1":"quay","K1":"돌다","I1":"kwaj","R1":"꽈이","E1":"회전하거나 돌다를 의미하는 동사입니다.","T2":"quay","K2":"돌다","I2":"kwaj","R2":"꽈이","XE":"Bánh xe đang quay.","XK":"바퀴가 돌고 있어.","XI":"baɲ se daŋ kwaj","XR":"반 쎄 당 꽈이"},{"T1":"quay","K1":"돌다","I1":"kwaj","R1":"꽈이","E1":"앞의 동사를 반복하여 동작의 지속이나 강도를 나타냅니다.","T2":"quay","K2":"돌다","I2":"kwaj","R2":"꽈이","XE":"Trái đất quay quanh mặt trời.","XK":"지구는 태양 주위를 돈다.","XI":"tɕaj ʔət kwaj kwaɲ mat tɕɤɪ","XR":"짜이 얻 꽈이 꽝 맛 쯔어이"}]}

Input Example 3:
{"T0":"时间只不过是考验","C0":"没有一丝丝改变 时间只不过是考验 种在心中信念丝毫未减"}

Output Example 3:
{"T0":"时间只不过是考验","C0":"조금도 변하지 않았어. 시간은 단지 시험일 뿐이야. 마음속에 심은 신념은 조금도 줄지 않았어.","G0":"이 문장은 주어(时间) + 부사(只不过) + 서술어(是考验)로 구성되어 있습니다. '时间'은 '시간'을 의미하며, '只不过'는 '단지 ~일 뿐이다'라는 의미로, '是考验'은 '시험이다'를 나타냅니다. 전체적으로 시간의 흐름이 단지 시험에 불과하다는 의미를 전달합니다.","K0":"시간은 단지 시험일 뿐이야.","I0":"shíjiān zhǐ bùguò shì kǎoyàn","R0":"스지엔 즈 부궈 스 카오옌","LI":[{"T1":"时间","K1":"시간","I1":"shíjiān","R1":"스지엔","E1":"시간을 의미하는 명사로, 어떤 일이 일어나는 시점을 나타냅니다.","T2":"时间","K2":"시간","I2":"shíjiān","R2":"스지엔","XE":"时间过得真快。","XK":"시간이 정말 빨리 간다.","XI":"shíjiān guò de zhēn kuài","XR":"스지엔 궈 더 젠 콰이"},{"T1":"只不过","K1":"단지 ~일 뿐이다","I1":"zhǐ bùguò","R1":"즈 부궈","E1":"어떤 것이 단순하거나 중요하지 않음을 강조하는 표현입니다.","T2":"只不过","K2":"단지 ~일 뿐이다","I2":"zhǐ bùguò","R2":"즈 부궈","XE":"这只不过是个误会。","XK":"이건 단지 오해일 뿐이야.","XI":"zhè zhǐ bùguò shì gè wùhuì","XR":"저 즈 부궈 스 거 우회이"},{"T1":"是","K1":"~이다","I1":"shì","R1":"스","E1":"사물이나 사람의 상태를 설명할 때 사용하는 동사입니다.","T2":"是","K2":"~이다","I2":"shì","R2":"스","XE":"他是我的朋友。","XK":"그는 내 친구야.","XI":"tā shì wǒ de péngyǒu","XR":"타 스 워 더 펑요우"},{"T1":"考验","K1":"시험","I1":"kǎoyàn","R1":"카오옌","E1":"어떤 능력이나 성격을 시험하거나 검증하는 것을 의미합니다.","T2":"考验","K2":"시험","I2":"kǎoyàn","R2":"카오옌","XE":"这次旅行是对我们的考验。","XK":"이번 여행은 우리에 대한 시험이다.","XI":"zhè cì lǚxíng shì duì wǒmen de kǎoyàn","XR":"저 츠 뤼싱 스 두이 워먼 더 카오옌"}]}

Input Example 4:
{"T0":"Es gibt 194 Länder, ich will jedes davon seh'n","C0":"Ich schick' 'n Herz in Rot zu dir Es gibt 194 Länder, ich will jedes davon seh'n Sechseinhalb Tausend Sprachen"}

Output Example 4:
{"T0":"Es gibt 194 Länder, ich will jedes davon seh'n","C0":"나는 빨간 하트를 보내. 194개국이 있는데 다 보고 싶어요. 65,000개 언어","G0":"이 문장은 두 개의 절로 구성되어 있습니다. 첫 번째 절은 'Es gibt 194 Länder'로, 독일어에서 '있다'라는 개념을 나타내기 위해 비인칭 형태인 'es gibt'를 사용합니다. '194 Länder'는 '194개의 나라'를 의미합니다. 두 번째 절은 'ich will jedes davon seh'n'으로, 'ich'는 주어 '나', 'will'은 '원하다', 'jedes davon'은 '그들 각각을', 'seh'n'은 '보다'의 의미입니다. 이 문장은 전 세계의 모든 나라를 방문하고 싶다는 소망을 표현하고 있습니다.","K0":"194개 나라가 있다, 나는 그들 각각을 보고 싶다.","I0":"ɛs ɡɪpt hʊndɐt fiːɐ̯ ʊnt ˈnɔɪ̯nʦɪç ˈlɛndɐ, ɪç vɪl ˈjeːdəs daˌfoːn zeːn","R0":"에스 깁트 훈더트 퓌어 운트 노인치히 렌더, 이히 빌 예데스 다폰 제흔","LI":[{"T1":"Es","K1":"그것이","I1":"ɛs","R1":"에스","E1":"비인칭 주어로 사용되는 대명사로, 주어진 맥락에서 '있다'는 의미를 전달할 때 사용됩니다.","T2":"es","K2":"그것이","I2":"ɛs","R2":"에스","XE":"Es regnet heute.","XK":"오늘 비가 온다.","XI":"ɛs ˈʁeːɡnət ˈhɔʏtə","XR":"에스 레이그너트 호이테"},{"T1":"gibt","K1":"있다","I1":"ɡɪpt","R1":"깁트","E1":"'있다'라는 의미로 사용되는 동사 'geben'의 3인칭 단수형입니다.","T2":"geben","K2":"주다","I2":"ˈɡeːbən","R2":"게븐","XE":"Es gibt einen Hund im Garten.","XK":"정원에 개가 있다.","XI":"ɛs ɡɪpt ˈaɪnən hʊnt ɪm ˈɡaːrtən","XR":"에스 깁트 아이넌 훈트 임 가튼"},{"T1":"194","K1":"194","I1":"hʊndɐt fiːɐ̯ ʊnt ˈnɔɪ̯nʦɪç","R1":"훈더트 퓌어 운트 노인치히","E1":"숫자 194를 의미. 100(hundert) + 4(vier) + 그리고(und) + 90(neunzig)","T2":"hundertvierundneunzig","K2":"100, 4 그리고 90","I2":"hʊndɐt fiːɐ̯ ʊnt ˈnɔɪ̯nʦɪç","R2":"훈더트 퓌어 운트 노인치히","XE":"Die Stadt hat 194 Schulen.","XK":"그 도시는 194개의 학교가 있다.","XI":"diː ʃtat hat hʊndɐt fiːɐ̯ ʊnt ˈnɔɪ̯nʦɪç ˈʃuːlən","XR":"디 슈타트 핫 훈더트 퓌어 운트 노인치히 슐른"},{"T1":"Länder","K1":"나라들","I1":"ˈlɛndɐ","R1":"렌더","E1":"Land의 복수형을 나타내는 명사입니다.","T2":"Land","K2":"나라","I2":"lant","R2":"란트","XE":"Die Länder sind vielfältig.","XK":"나라는 다양하다.","XI":"diː ˈlɛndɐ zɪnt ˈfiːlˌfɛːltɪç","XR":"디 렌더 진트 필 펠티히"},{"T1":"ich","K1":"나","I1":"ɪç","R1":"이히","E1":"1인칭 단수 주어로, 말을 하고 있는 사람 자체를 이야기할 때 사용됩니다.","T2":"ich","K2":"나","I2":"ɪç","R2":"이히","XE":"Ich bin müde.","XK":"나는 피곤하다.","XI":"ɪç bɪn ˈmyːdə","XR":"이히 빈 무댜"},{"T1":"will","K1":"원하다","I1":"vɪl","R1":"빌","E1":"'원하다'라는 의미의 동사 'wollen'의 1인칭 단수 형태입니다.","T2":"wollen","K2":"원하다","I2":"ˈvɔlən","R2":"볼렌","XE":"Ich will ein Buch lesen.","XK":"나는 책을 읽고 싶다.","XI":"ɪç vɪl ʔaɪn buːx ˈleːzən","XR":"이히 빌 아인 부흐 레젠"},{"T1":"jedes","K1":"각각의","I1":"ˈjeːdəs","R1":"예데스","E1":"모든 '각각의' 대상에 대해 언급할 때 사용하는 형용사입니다.","T2":"jeder","K2":"각각의","I2":"ˈjeːdɐ","R2":"예다","XE":"Jedes Kind hat das Recht zu lernen.","XK":"모든 아이는 배울 권리가 있다.","XI":"ˈjeːdəs kɪnt hat das ʁɛçt tsuː ˈleːɐnən","XR":"예데스 킨트 핫 다스 레흐트 추 레어은"},{"T1":"davon","K1":"그 중에서","I1":"daˈfoːn","R1":"다폰","E1":"'그 중에서', '거기서부터' 등의 의미를 갖는 부사적 표현","T2":"von","K2":"에서","I2":"fɔn","R2":"폰","XE":"Ich habe viel davon gehört.","XK":"나는 그에 대해 많이 들었다.","XI":"ɪç ˈhaːbə fiːl daˌfoːn ɡəˈhøːɐt","XR":"이히 하브 필 다폰 그흐어트"},{"T1":"seh'n","K1":"보다","I1":"zeːn","R1":"제흔","E1":"'보다'라는 의미의 동사 'sehen'의 비공식적 축약형입니다.","T2":"sehen","K2":"보다","I2":"ˈzeːən","R2":"제흔","XE":"Ich will die Welt sehen.","XK":"나는 세상을 보고 싶다.","XI":"ɪç vɪl diː vɛlt ˈzeːən","XR":"이히 빌 디 벨트 제흔"}]}

Input Example 5:
{"T0":"heavy heavy heavy?","C0":"<span class=\"ruby\"><span class=\"rb\">四六時中</span><span class=\"rt\">しろくじちゅう</span></span><span class=\"ruby\"><span class=\"rb\">渋滞</span><span class=\"rt\">じゅうたい</span></span> heavy heavy heavy? りんご2<span class=\"ruby\"><span class=\"rb\">個</span><span class=\"rt\">こ</span></span><span class=\"ruby\"><span class=\"rb\">分</span><span class=\"rt\">ぶん</span></span>?"}

Output Example 5:
{"T0":"heavy heavy heavy?","C0":"사시사철 정체 heavy heavy heavy? 사과 2개 분량?","G0":"이 문장은 영어 단어 'heavy'가 세 번 반복되어 감정이나 상태의 무거움을 강조하고 있습니다. 의문문 부호가 붙어 있어, 무거움에 대한 의문이나 놀람을 표현하는 것으로 해석할 수 있습니다.","K0":"무거워, 무거워, 무거워?","I0":"ˈhɛvi ˈhɛvi ˈhɛvi","R0":"헤비 헤비 헤비","LI":[{"T1":"heavy","K1":"무거운","I1":"ˈhɛvi","R1":"헤비","E1":"무게가 많이 나가거나, 부담이 크다는 뜻으로 쓸 수 있습니다.","T2":"heavy","K2":"무거운","I2":"ˈhɛvi","R2":"헤비","XE":"This bag is heavy.","XK":"이 가방은 무거워.","XI":"ðɪs bæɡ ɪz ˈhɛvi","XR":"디스 백 이즈 헤비"},{"T1":"heavy","K1":"무거운","I1":"ˈhɛvi","R1":"헤비","E1":"앞의 단어를 반복하여 강조하는 용법입니다.","T2":"heavy","K2":"무거운","I2":"ˈhɛvi","R2":"헤비","XE":"The rain is heavy heavy today.","XK":"오늘 비가 정말 많이 와.","XI":"ðə reɪn ɪz ˈhɛvi ˈhɛvi təˈdeɪ","XR":"더 레인 이즈 헤비 헤비 투데이"},{"T1":"heavy","K1":"무거운","I1":"ˈhɛvi","R1":"헤비","E1":"세 번째 반복으로, 감정이나 상태의 강도를 더욱 강조합니다.","T2":"heavy","K2":"무거운","I2":"ˈhɛvi","R2":"헤비","XE":"My heart feels heavy heavy heavy.","XK":"내 마음이 정말 너무 무거워.","XI":"maɪ hɑrt filz ˈhɛvi ˈhɛvi ˈhɛvi","XR":"마이 하트 필즈 헤비 헤비 헤비"}]}

Rules:
Do not confuse "T0" with "C0" when analyzing. "C0" is a combination of the line before and the line after the lyrics of "T0", along with "T0" itself.
Analyze all morphemes in "T0" without omission. 
Even if the same morpheme repeats multiple times, do not omit any of them and process all morphemes in order.
Please exclude punctuation marks from morpheme analysis.
Don't use grammar terms in the "K1" attribute. 
"K1" and "K2" are attributes for brief description. Even if the morpheme has more than one meaning, write down only the one that best fits the context. (Exact description can be done at "E1".)
Since multiple languages may be used in a single sentence, please be careful when writing down pronunciations.
When reading numbers, please consider the context and decide which language to read in.

${JapaneseSpecial}

${ChineseSpecial}

The lyrics we need to process are as follows:
`;

export const KR_MSG = SimMsg;
