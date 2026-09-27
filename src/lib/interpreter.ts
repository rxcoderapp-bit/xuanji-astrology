import type { PalaceData, HoroscopeState, SanFangSiZheng, MutagenType } from '../types';

export interface StarInterpretation {
  nature: string; // 核心賦性
  inPalace: string; // 在此宮位的世俗表現
  brightnessNote: string; // 廟旺平陷影響
}

// Comprehensive descriptions for 14 major stars
export const MAJOR_STAR_DESCRIPTIONS: Record<string, {
  element: string;
  role: string;
  keywords: string[];
  personality: string;
  career: string;
  wealth: string;
  relationship: string;
}> = {
  '紫微': {
    element: '己土 (陰土)',
    role: '帝座、北斗主星、萬星之尊',
    keywords: ['尊貴', '權威', '好面子', '掌控力', '包容力'],
    personality: '厚重端莊，有領袖風範與自主意志，自尊心極強，不願隨波逐流，但有時流於孤高清冷，易感精神孤獨。',
    career: '天生適合主導、統御、管理或獨立創業。在企事業單位多居高層，喜掌實權。',
    wealth: '主尊貴而非主橫發，名先於利，靠聲譽、地位與專業管理累積豐厚資產。',
    relationship: '擇偶標準高，重視伴侶之教養、體面與能力，喜在感情中占據主導地位。'
  },
  '天機': {
    element: '乙木 (陰木)',
    role: '南斗一星、智多星、謀略之曜',
    keywords: ['機敏', '策劃', '善變', '智慧', '神經敏感'],
    personality: '心思靈活細膩，反應迅捷，長於邏輯推演與策略企劃；缺點為思慮過多、容易精神緊繃或猶豫不決。',
    career: '極佳的顧問、幕僚、研發、數據、IT與創意思考者。善於適應環境變遷。',
    wealth: '財源多動態，靠動腦、智慧技術或靈活交易求財，不宜死守固定模式。',
    relationship: '重視心靈共鳴與智慧對話，感情中細膩多思，偶有患得患失之慮。'
  },
  '太陽': {
    element: '丙火 (陽火)',
    role: '中天主星、官祿主、光明之星',
    keywords: ['博愛', '熱情', '付出', '名譽', '勞碌顯貴'],
    personality: '豪爽磊落，心胸寬廣，樂於助人且極度重視榮譽與尊嚴；容易打腫臉充充胖子，為他人過度操心奔忙。',
    career: '公職、教育、法律、政治、大型機構傳媒及對外開拓之先鋒，極具公眾影響力。',
    wealth: '名高於利，重視社會聲望，貴重於富，隨社會地位提升而自然得財。',
    relationship: '熱情主動，全心付出，但有時過於強勢或將重心放在公眾事務而忽略家庭細節。'
  },
  '武曲': {
    element: '辛金 (陰金)',
    role: '北斗六星、正財星、將星',
    keywords: ['果斷', '剛毅', '執行力', '求實', '財政權柄'],
    personality: '剛毅木訥，言出必行，做事雷厲風行，抗壓性極強；不喜阿諛奉承，偶顯剛硬少情面。',
    career: '金融、會計、科技硬體、軍警重工業或獨立實業。實幹興家之典型。',
    wealth: '正財之本，最利積蓄與經營實體產業，善於資產配置與風險控管，財庫穩健。',
    relationship: '不擅甜言蜜語，以實際行動照顧對方，需防在親密關係中過度講求原則而缺少溫潤。'
  },
  '天同': {
    element: '壬水 (陽水)',
    role: '南斗四星、福德主、解厄之神',
    keywords: ['溫和', '享樂', '好人緣', '知足', '欠缺衝勁'],
    personality: '隨和寬厚，不喜爭執，富有童心與同理心；隨遇而安，但在缺乏外在激勵時易生惰性。',
    career: '文化娛樂、休閒旅遊、人際公關、生活美學、慈善輔導等富有人情味的行業。',
    wealth: '福祿自然，生活衣食無虞，重在生活品質與享受，不易因求財過度耗損心神。',
    relationship: '溫柔體貼，依賴感較強，追求和諧溫馨的浪漫氛圍，需防感情上過度優柔寡斷。'
  },
  '廉貞': {
    element: '丁火 (陰火)',
    role: '北斗五星、次桃花、事業雄星',
    keywords: ['原則', '衝勁', '敏銳', '公關手腕', '傲骨深沉'],
    personality: '具傲骨與強烈個人原則，識人眼光極銳利，善於人際博弈；性格亦剛亦柔，感情濃烈而內斂。',
    career: '政法、外交、高階行銷、文藝影視、精密工業與大型組織核心公關。',
    wealth: '具有商業冒險精神與競爭意識，善於在複雜局面中抓取商機，起伏中求突破。',
    relationship: '次桃花之主，極具神秘魅力與吸引力，擇偶看重精神契合度與氣質。'
  },
  '天府': {
    element: '戊土 (陽土)',
    role: '南斗主星、令星、財帛田宅庫主',
    keywords: ['沉穩', '包容', '財庫', '守成', '保守尊榮'],
    personality: '沉穩厚重，雍容大度，包容性強，極有條理；行事偏向穩健保守，不輕易涉險。',
    career: '金融銀行、行政主管、物業地產、財政國企及成熟大企業的高階守成者。',
    wealth: '號稱「祿庫」，善於儲蓄、理財與資產增值，一生不易匱乏，擅長長線複利。',
    relationship: '重視門當戶對與家庭穩定性，能給予伴侶極佳的物質後盾與庇護感。'
  },
  '太陰': {
    element: '癸水 (陰水)',
    role: '中天主星、田宅主、富星',
    keywords: ['細膩', '母性', '文雅', '蓄積', '深思敏感'],
    personality: '溫柔沉靜，富有審美與浪漫情懷，注重隱私與居所品質；情感深沉細膩，心思不易外顯。',
    career: '房地產、財務管理、文藝設計、策劃分析、女性消費或夜間靈感型工作。',
    wealth: '主「富」，善於以柔克剛積累不動產與長遠財富，細水長流，財源深厚。',
    relationship: '極具家庭觀念與照顧本能，感情細水長流，重視伴侶的精神溫柔相待。'
  },
  '貪狼': {
    element: '甲木 (陽木) 兼 癸水',
    role: '北斗一星、正桃花主、慾望之星',
    keywords: ['交際', '慾望', '才藝', '多變', '生命力旺盛'],
    personality: '八面玲瓏，好奇心與勝負慾皆強，多才多藝，善察言觀色；勇於追求世俗享受與精神未知。',
    career: '公關商務、演藝娛樂、跨國貿易、美妝潮流、心理玄學與高利潤投機業。',
    wealth: '偏財性質強，若遇火星、鈴星成「火貪、鈴貪格」易有突發性機遇與巨幅躍升。',
    relationship: '正桃花之首，浪漫熱情，異性緣絕佳，在感情中渴望新鮮感與深刻體驗。'
  },
  '巨門': {
    element: '癸水 (陰水)',
    role: '北斗二星、是非之星、暗曜',
    keywords: ['口才', '洞察', '專研', '質疑', '化暗為明'],
    personality: '思維嚴謹，批判與懷疑精神強，善於發現微小破綻；心直口快，易因言語招惹無心之非。',
    career: '法律司法、演講教學、研究考證、醫療問診、自媒體評述及精密檢驗。',
    wealth: '典型「口舌生財」、「專業技術求財」，靠專業名聲與過人學識累積身家。',
    relationship: '內心防禦心較重，需長期信任方能敞開扉頁；宜學會以溫柔言語代替批判挑剔。'
  },
  '天相': {
    element: '壬水 (陽水)',
    role: '南斗二星、印星、宰相之宰',
    keywords: ['正直', '輔佐', '體面', '同情心', '中規中矩'],
    personality: '敦厚誠懇，樂善好施，極度重視儀表、秩序與承諾；公正客觀，多為不可或缺的左右手。',
    career: '企業行政主管、特助顧問、司法公證、品質管理、大型會議策劃與慈善事業。',
    wealth: '俸祿之財，收入穩定清正，善借他人之勢或平臺資源獲得優厚待遇。',
    relationship: '擇偶注重對方人品、談吐與社會風評，婚後善於料理家務與內外平衡。'
  },
  '天梁': {
    element: '戊土 (陽土)',
    role: '南斗二星、蔭星、壽星、長者之風',
    keywords: ['成熟', '庇護', '解難', '原則', '倚老賣老'],
    personality: '老成持重，喜照拂弱小，極具長者風範與道德操守；好為人師，偶有自以為是之傾向。',
    career: '醫療、中醫、慈善、監察審計、法律、宗教哲學與老牌學術機構。',
    wealth: '主「蔭」，多得長輩、祖蔭或政策制度庇佑；逢凶化吉，越經考驗越顯身價。',
    relationship: '常有照顧伴侶之長兄長姊心態，感情深沉負責，重視相互敬重與道德默契。'
  },
  '七殺': {
    element: '庚金 (陽金)',
    role: '南斗六星、大將之星、肅殺之神',
    keywords: ['開創', '果決', '勇猛', '孤芳自賞', '破釜沉舟'],
    personality: '剛毅雄健，敢作敢當，不畏艱險，具開疆拓土之霸氣；不甘平庸，耐性稍欠，易感情用事。',
    career: '開創性事業、軍警海巡、急診外科、高風險專案負責人或新興市場操盤手。',
    wealth: '偏財與開創財，大開大合，在市場動盪與未知領域中能抓取超額利潤。',
    relationship: '愛恨分明，熱烈而直接，不屑虛情假意；宜包容其自主性，避免硬碰硬。'
  },
  '破軍': {
    element: '癸水 (陰水)',
    role: '北斗七星、耗星、前鋒先鋒',
    keywords: ['變革', '破壞', '創新', '大膽', '不立不破'],
    personality: '敢破敢立，厭惡成規，具有強烈革新破壞力；敢為天下先，但亦可能因衝動破耗而起伏甚劇。',
    career: '設計重組、風險投資、前沿科技研發、開拓新通路或危機變革領導者。',
    wealth: '破耗再成之財，先破後立，一生常經歷大幅度洗牌轉折，破而後成乃為大富。',
    relationship: '感情大開大合，不喜平淡無奇的世俗相處，重視彼此在靈魂與理想上的同步變革。'
  }
};

// Dual Star combinations interpretation
export const DUAL_STAR_MAP: Record<string, { title: string; desc: string }> = {
  '紫微天府': {
    title: '紫府同宮 · 萬乘之尊',
    desc: '南北斗雙帝同宮，氣象宏大，性格沉穩端莊，包容力極佳。一生多居領導管理之位，財帛官祿皆有厚底，缺點在於自尊極重，稍嫌保守持重而魄力不足。'
  },
  '紫微天相': {
    title: '君臣慶會 · 官祿清貴',
    desc: '君臣相伴，剛柔並濟。待人接物進退有度，既有主導力又懂協調輔佐，具極佳政治手腕與組織才能，一生貴人緣深厚。'
  },
  '紫微七殺': {
    title: '紫殺化權 · 將星得令',
    desc: '帝王御駕親征之象。極具開創霸氣與破陣魄力，敢想敢拚，雷厲風行。若能搭配吉星化解殺氣，必成新興領域之霸主，惟須防性格剛烈招忌。'
  },
  '紫微破軍': {
    title: '君臨開拓 · 破舊立新',
    desc: '不破不立之格局。具有強烈改革創新的魄力，敢於打破既有體制重組新秩序，一生波瀾起伏而成果輝煌。'
  },
  '紫微貪狼': {
    title: '桃花犯主 · 智勇才情',
    desc: '具有高超之交際手腕與文藝才情，八面玲瓏，世俗與精神慾望兼備。若遇吉星，為商界社交名流或行業外交先鋒。'
  },
  '天機太陰': {
    title: '機月同梁 · 靈活深沉',
    desc: '思維敏捷極富策劃力，處世溫和細膩，擅長幕僚、分析與人際協調。男女皆具極佳審美情趣與文字策劃天賦。'
  },
  '天機巨門': {
    title: '巨機同臨 · 雄辯精研',
    desc: '心思縝密，邏輯分析力與批判口才極為拔尖，長於技術研發、法務諮詢與策劃論辯。若有化祿化權，必成權威名嘴或智庫核心。'
  },
  '天機天梁': {
    title: '機梁加會 · 善謀智囊',
    desc: '智慧與長者經驗之結合，深謀遠慮，長於策略擘劃與解決疑難雜症。極適合諮詢顧問、策略企劃、中醫慈善之職。'
  },
  '太陽太陰': {
    title: '日月同輝 · 剛柔合一',
    desc: '中天雙曜同宮，性格兼具熱情博愛與細膩深沉，一生思維多變，外在開朗而內心常自省。男女皆具有兼顧家庭與事業之才能。'
  },
  '太陽巨門': {
    title: '巨日同宮 · 化暗為明',
    desc: '太陽之光驅散巨門之陰暗，化是非為聲譽。極利對外傳播、跨國貿易、外交公關與司法大眾傳播，多憑聲名與口才立業。'
  },
  '太陽天梁': {
    title: '陽梁昌祿 · 清貴博學',
    desc: '傳統大格局之一。光明磊落，具長者正義感與公眾聲望，考運與官祿運絕佳，極適合法律、學術公職或專業巨擘。'
  },
  '武曲天府': {
    title: '雙財並臨 · 巨富之基',
    desc: '正財星加財庫，理財經商之最吉組合。行事穩健謹慎，善抓商機又善守家業，一生財源豐厚，實業興家之典型。'
  },
  '武曲天相': {
    title: '文韜武略 · 實幹親和',
    desc: '剛毅執行力配以宰相之協調手腕，做事腳踏實地，深受上司信任。在金融、法務及行政管理崗位上成就斐然。'
  },
  '武曲七殺': {
    title: '金殺肅穆 · 開拓先鋒',
    desc: '兩金相會，殺伐果斷，最具開創衝勁與執行效率。行事雷厲風行，勇於涉險突破，惟須注意情緒過於剛硬與肢體勞頓。'
  },
  '武曲破軍': {
    title: '破耗再起 · 風浪搏擊',
    desc: '經歷大風大浪後白手起家之格。敢於投資創新，破舊立新，早年多奔波磨練，中晚年歷練成熟後多成大器。'
  },
  '武曲貪狼': {
    title: '武貪同行 · 大器晚成',
    desc: '著名「武貪格」。三十歲前歷經打磨沉澱，三十後漸入佳境，遇火鈴同度更易爆發橫發，具商賈大格局。'
  },
  '天同太陰': {
    title: '水潤天合 · 溫雅富足',
    desc: '溫柔體貼，富有生活情調與浪漫文藝氣質。人緣極佳，衣食富足，惟處事偶有柔懦缺乏決斷之傾向。'
  },
  '天同巨門': {
    title: '口舌心結 · 磨難成金',
    desc: '心思多敏感，早期多感人際隔閡或感情波折。需經世故磨鍊，若能以寬和心態專研一門專業，中晚年大放異彩。'
  },
  '天同天梁': {
    title: '福蔭相聚 · 逢凶化吉',
    desc: '天生福澤深厚，一生多得貴人化解難題，性格樂觀豁達，長壽康寧，適合公眾事業或文化傳播。'
  },
  '廉貞天府': {
    title: '天府廉貞 · 寬猛相濟',
    desc: '廉貞之開拓銳氣受天府厚土所包容，剛柔適度，既善經營事業又善穩固後方，為不可多得之全才領袖。'
  },
  '廉貞天相': {
    title: '廉相印信 · 清正得力',
    desc: '為人端莊正派，善於交際與政策落實，在公門或大企業中多為得力主幹，掌管公關、人資或行政實權。'
  },
  '廉貞七殺': {
    title: '雄宿朝元 · 萬里長征',
    desc: '熱情似火，果決剛毅，具有高度事業野心與拼搏精神。在軍工、高階行銷與艱鉅專案中戰功赫赫。'
  },
  '廉貞破軍': {
    title: '烈火狂瀾 · 破格奇才',
    desc: '敢想敢做，具有極強的破壞力與超前創新觀念，不走尋常路，人生起伏大，成功時往往顛覆傳統。'
  },
  '廉貞貪狼': {
    title: '雙桃花會 · 藝界乾坤',
    desc: '才情四溢，魅力非凡，交際手腕與靈性直覺極佳。極宜文藝、自媒體、商務公關或時尚設計行業。'
  }
};

// Palace secular interpretations
export const PALACE_SECULAR_MEANING: Record<string, {
  core: string;
  scope: string;
  modernSignificance: string;
  reflectionQuestion: string;
}> = {
  '命宮': {
    core: '精神總樞鈕、先天氣質與核心世界觀',
    scope: '統攝個人性格、人生第一直覺反應、天生體質與命運底色。',
    modernSignificance: '代表個人的「品牌形象」與面對逆境時的內心錨點。',
    reflectionQuestion: '在沒有外界評價束縛時，你最核心的價值觀與底線是什麼？'
  },
  '兄弟': {
    core: '同儕夥伴、平輩手足與現金庫（田宅之氣數）',
    scope: '代表兄弟姊妹感情、創業核心夥伴、同行競爭者與短期現金流儲備。',
    modernSignificance: '在現代評估「團隊協作商譽」與「現金周轉安全性」。',
    reflectionQuestion: '你的事業夥伴與身邊密友，是在為你賦能還是消耗你的精力？'
  },
  '夫妻': {
    core: '親密關係、配偶特質與契約伴侶互動機制',
    scope: '反映婚姻價值觀、喜好的對象類型、感情相處模式與夫妻緣分厚薄。',
    modernSignificance: '現代人長期親密關係的心理投射與婚姻防禦機制。',
    reflectionQuestion: '你是在尋找一個拯救你的對象，還是一個願意一同成長的同行者？'
  },
  '子女': {
    core: '晚輩傳承、投資孵化與性生活荷爾蒙',
    scope: '主生育子女之緣分與才智、部屬徒弟、新投資項目與個人精力熱情。',
    modernSignificance: '現代評估「新項目開拓運」與「培養下一代團隊」的能量。',
    reflectionQuestion: '你對待晚輩與部屬，是控制多於引導，還是給予充分空間？'
  },
  '財帛': {
    core: '資金流通管道、理財思維與獲取世俗價值的途徑',
    scope: '掌握求財方式（正財、偏財、智慧財、體力財）、金錢流轉速度與交易決策。',
    modernSignificance: '評估現代人的「變現能力」、「現金流品質」與消費習慣。',
    reflectionQuestion: '你的賺錢方式是可持續的長期複利，還是依賴透支體力與人情？'
  },
  '疾厄': {
    core: '生理機能體質、深層潛意識與家庭遺傳密碼',
    scope: '顯示臟腑五行偏弱部位、先天潛在病灶、情緒抗壓臨界點與隱密癖好。',
    modernSignificance: '身體即命運的載體，此宮是「能量存量」與「身心亞健康防線」。',
    reflectionQuestion: '你是否長期忽略身體發出的疲倦與緊繃警訊？'
  },
  '遷移': {
    core: '外部環境感知、出外機遇與大眾社會評價',
    scope: '主出外遠行、移居升遷、在公眾面前展現的魅力與出門在外的貴人煞星。',
    modernSignificance: '在數位時代代表「個人公開人設」與「國際化/跨界開拓運」。',
    reflectionQuestion: '當你離開熟悉的舒適圈時，你能否迅速適應並抓住陌生的機會？'
  },
  '僕役': {
    core: '廣義社交圈、群眾人脈、粉絲顧客與公眾緣分',
    scope: '掌管部屬群體、普通朋友、泛泛之交、社群網絡與人際是非。',
    modernSignificance: '現代指「流量運」、「社群影響力」與防範職場小人暗箭。',
    reflectionQuestion: '在你的社交圈中，是否有足夠高質量的能量互補，抑或只是無效社交？'
  },
  '官祿': {
    core: '事業抱負、工作風格、社會地位與專業護城河',
    scope: '主事業企圖心、適合的職業型態、職場升遷機遇與面對功名利祿的態度。',
    modernSignificance: '評估個人的「專業競爭力」、「事業天花板」與職涯專注力。',
    reflectionQuestion: '你現在的工作是在積累長遠的專業資產，還是單純拿時間換薪水？'
  },
  '田宅': {
    core: '家族根基、不動產資產庫、辦公環境與內心安全感',
    scope: '主房屋不動產、祖蔭家產、公司辦公室風水及個人歸宿安全感。',
    modernSignificance: '現代評估「淨資產沉澱能力」、「資產保值抗風險力」與居住環境。',
    reflectionQuestion: '你的資產是否轉化為穩定的抗風險壁壘，讓內心感到安頓？'
  },
  '福德': {
    core: '靈魂追求、精神世界、心理素質與晚年安寧',
    scope: '掌握心理承受力、興趣品味、前世因果積澱、抗抑鬱韌性與享樂觀。',
    modernSignificance: '心理健康與精神自由的關鍵宮位，決定了「有錢是否快樂」。',
    reflectionQuestion: '當一切外界物質被抽離時，你的內在是否擁有自給自足的平靜？'
  },
  '父母': {
    core: '原生家庭烙印、長輩緣分、政策法規與官方認可',
    scope: '代表父母親情、師長長官提攜、合約文書、學歷文憑與法治監管。',
    modernSignificance: '評估現代人的「貴人運（得師長青睞）」與「合約合規風險」。',
    reflectionQuestion: '你與原生家庭或權威長官的相處模式，是否正在無意識複製到職場中？'
  }
};

// Four Mutagens interpretation
export const MUTAGEN_MEANINGS: Record<MutagenType, {
  character: string;
  effect: string;
  warning: string;
}> = {
  '祿': {
    character: '春生之氣 · 機遇 · 豐盈 · 善緣',
    effect: '為宮位帶來順遂、財源增長、人際好感與自然而然的機遇。',
    warning: '吉處藏凶，防因過於順風順水而滋生懶惰、盲目擴張或貪圖安逸。'
  },
  '權': {
    character: '夏長之氣 · 掌控 · 權力 · 魄力',
    effect: '強化主導力、執行力與競爭實力，賦予該領域突破困境的鐵腕手段。',
    warning: '過剛易折，易造成霸道專橫、人際摩擦與精神高度緊繃，需學會妥協藝術。'
  },
  '科': {
    character: '秋收之氣 · 名譽 · 條理 · 貴人',
    effect: '提升聲望名譽、考運考試、學術品味，在關鍵時刻能逢凶化吉得貴人解危。',
    warning: '好面子，易重名輕利或流於形式主義，甚至因過度粉飾太平而掩蓋真實問題。'
  },
  '忌': {
    character: '冬藏之氣 · 執著 · 坎坷 · 淬鍊',
    effect: '引動該宮位之虧欠感、深刻牽絆、波折考驗與不可自拔的專注力。',
    warning: '易鑽牛角尖、患得患失或遭逢現實阻滯，然「忌出為變，大破大立」，是靈魂進化的核心考驗場。'
  }
};

// Auxiliary lucky & harmful stars
export const AUX_STARS_MEANING: Record<string, string> = {
  '左輔': '助力強勁的平輩、合夥人或得力幹將，做事善協調，能解凶增吉。',
  '右弼': '細膩周到的貴人助力，擅長暗中協助、出謀劃策，亦帶有桃花調和之能。',
  '天魁': '陽貴人，多為顯著的師長、長官提攜，在體制內提供明朗的晉升機遇。',
  '天鉞': '陰貴人，多為異性、暗處或機緣巧合下的貴人援助，常逢難呈祥。',
  '文昌': '正統文藝、合約文書、法理考試之星，賦予人典雅氣質與學術才華。',
  '文曲': '口才才藝、靈感直覺、偏門技術之星，長於溝通表達與現代傳播。',
  '祿存': '天祿之星，財庫穩定，善於積累，但前後必有羊陀相夾，需防保守孤芳。',
  '天馬': '奔馳變動之星，主出外走動、出國開拓、業務奔波，逢吉則發。',
  '擎羊': '剛烈之刀，明面衝撞、果斷直接，敢打硬仗，但易有血光與人際衝突。',
  '陀羅': '暗中阻力，磨難拖延、糾纏不清，需耐心持久戰，亦主深鑽專業。',
  '火星': '突發爆發之煞，急性子、暴烈迅疾，有橫發之機，亦有暴破之險。',
  '鈴星': '沉著隱忍之煞，工於心計、暗中較勁，爆發雖慢但持久深沉。',
  '地空': '天馬行空、物質損耗之曜，反傳統思維，極利哲學靈性與前瞻創意。',
  '地劫': '突如其來的波動與坎坷，考驗心理韌性，宜看淡世俗浮沉，轉化為精神財富。'
};

// Interpretation Generator
export function generatePalaceAnalysis(
  palace: PalaceData,
  allPalaces: PalaceData[],
  sanFang: SanFangSiZheng,
  _horoscope: HoroscopeState
) {
  const palaceName = palace.name;
  const secular = PALACE_SECULAR_MEANING[palaceName] || {
    core: '生活領域',
    scope: '人生面向',
    modernSignificance: '社會功能',
    reflectionQuestion: '如何在此處修煉自我？'
  };

  const majorNames = palace.majorStars.map(s => s.name);
  const dualKey = majorNames.slice(0, 2).sort().join('');
  const reverseDualKey = majorNames.slice(0, 2).reverse().join('');
  const dualMatch = DUAL_STAR_MAP[dualKey] || DUAL_STAR_MAP[reverseDualKey] || DUAL_STAR_MAP[majorNames.join('')];

  const oppositePalace = allPalaces[sanFang.oppositeIndex];
  const trine1Palace = allPalaces[sanFang.trine1Index];
  const trine2Palace = allPalaces[sanFang.trine2Index];

  // Self Mutagens
  const selfMutagenText = palace.selfMutagens.length > 0
    ? palace.selfMutagens.map(sm => `【宮干 ${palace.heavenlyStem} 引動 ${sm.star} 自化${sm.mutagen}】`).join('、')
    : '無自化';

  return {
    palaceName,
    earthlyBranch: palace.earthlyBranch,
    heavenlyStem: palace.heavenlyStem,
    secular,
    majorNames,
    dualMatch,
    selfMutagenText,
    oppositePalace: {
      name: oppositePalace?.name || '',
      stars: oppositePalace?.majorStars.map(s => s.name) || []
    },
    trines: [
      { name: trine1Palace?.name || '', stars: trine1Palace?.majorStars.map(s => s.name) || [] },
      { name: trine2Palace?.name || '', stars: trine2Palace?.majorStars.map(s => s.name) || [] }
    ]
  };
}
