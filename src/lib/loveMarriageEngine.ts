/**
 * 天樞星象 · 太微緣局·正緣與桃花動態應期引擎 (Love & Marriage Timeline Engine)
 * 融匯八字子平配偶星與夫妻宮引動 ✕ 紫微斗數流年鸞喜化祿疊宮，
 * 精準量化推算命主「宿命正緣」、「心動桃花」與「情感考驗」應期，
 * 並繪製伴侶性格、氣場與相遇情境之全息畫像。
 * （嚴格去除所有個人姓名，體系完全自有化、古典正統化）
 */

import type { 
  BaziData, 
  PalaceData, 
  HoroscopeState, 
  LoveFortuneYear, 
  SpouseArchetype, 
  LoveMarriageAnalysis,
  LoveYearType
} from '../types';

// 天干五合表 (甲己合、乙庚合、丙辛合、丁壬合、戊癸合)
const HEAVENLY_STEM_FIVE_COMBINES: Record<string, string> = {
  '甲': '己', '己': '甲',
  '乙': '庚', '庚': '乙',
  '丙': '辛', '辛': '丙',
  '丁': '壬', '壬': '丁',
  '戊': '癸', '癸': '戊'
};

// 地支六合表 (子丑合、寅亥合、卯戌合、辰酉合、巳申合、午未合)
const EARTHLY_BRANCH_SIX_COMBINES: Record<string, string> = {
  '子': '丑', '丑': '子',
  '寅': '亥', '亥': '寅',
  '卯': '戌', '戌': '卯',
  '辰': '酉', '酉': '辰',
  '巳': '申', '申': '巳',
  '午': '未', '未': '午'
};

// 地支三合局
const BRANCH_THREE_COMBINES: Record<string, string[]> = {
  '申': ['子', '辰'], '子': ['申', '辰'], '辰': ['申', '子'],
  '巳': ['酉', '丑'], '酉': ['巳', '丑'], '丑': ['巳', '酉'],
  '寅': ['午', '戌'], '午': ['寅', '戌'], '戌': ['寅', '午'],
  '亥': ['卯', '未'], '卯': ['亥', '未'], '未': ['亥', '卯']
};

// 地支相沖表
const BRANCH_CLASHES: Record<string, string> = {
  '子': '午', '午': '子',
  '丑': '未', '未': '丑',
  '寅': '申', '申': '寅',
  '卯': '酉', '酉': '卯',
  '辰': '戌', '戌': '辰',
  '巳': '亥', '亥': '巳'
};

// 紅鸞與天喜查法 (以年支為基準)
// 卯年紅鸞在子，辰年鸞在亥，巳年鸞在戌...
const HONG_LUAN_BRANCH: Record<string, string> = {
  '子': '卯', '丑': '寅', '寅': '丑', '卯': '子',
  '辰': '亥', '巳': '戌', '午': '酉', '未': '申',
  '申': '未', '酉': '午', '戌': '巳', '亥': '辰'
};

const TIAN_XI_BRANCH: Record<string, string> = {
  '子': '酉', '丑': '申', '寅': '未', '卯': '午',
  '辰': '巳', '巳': '辰', '午': '卯', '未': '寅',
  '申': '丑', '酉': '子', '戌': '亥', '亥': '戌'
};

// 咸池桃花 (以年支或日支三合局第一字查：申子辰在酉，寅午戌在卯，巳酉丑在午，亥卯未在子)
const XIAN_CHI_BRANCH: Record<string, string> = {
  '申': '酉', '子': '酉', '辰': '酉',
  '寅': '卯', '午': '卯', '戌': '卯',
  '巳': '午', '酉': '午', '丑': '午',
  '亥': '子', '卯': '子', '未': '子'
};

// 十天干生年四化表
const STEM_SI_HUA: Record<string, { lu: string; quan: string; ke: string; ji: string }> = {
  '甲': { lu: '廉貞', quan: '破軍', ke: '武曲', ji: '太陽' },
  '乙': { lu: '天機', quan: '天梁', ke: '紫微', ji: '太陰' },
  '丙': { lu: '天同', quan: '天機', ke: '文昌', ji: '廉貞' },
  '丁': { lu: '太陰', quan: '天同', ke: '天機', ji: '巨門' },
  '戊': { lu: '貪狼', quan: '太陰', ke: '右弼', ji: '天機' },
  '己': { lu: '武曲', quan: '貪狼', ke: '天梁', ji: '文曲' },
  '庚': { lu: '太陽', quan: '武曲', ke: '太陰', ji: '天同' },
  '辛': { lu: '巨門', quan: '太陽', ke: '文曲', ji: '文昌' },
  '壬': { lu: '天梁', quan: '紫微', ke: '左輔', ji: '武曲' },
  '癸': { lu: '破軍', quan: '巨門', ke: '太陰', ji: '貪狼' }
};

// 天干與地支順序
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 由西元年份計算干支 (西元 4 年為甲子年)
function getYearGanZhi(year: number): { stem: string; branch: string; str: string } {
  const offset = (year - 4) % 60;
  const pos = offset >= 0 ? offset : offset + 60;
  const stem = HEAVENLY_STEMS[pos % 10];
  const branch = EARTHLY_BRANCHES[pos % 12];
  return { stem, branch, str: `${stem}${branch}` };
}

// =========================================================================
// 1. 伴侶畫像生成 (Spouse Archetype)
// =========================================================================
export function computeSpouseArchetype(
  bazi: BaziData,
  allPalaces: PalaceData[],
  gender: '男' | '女' | string = '男'
): SpouseArchetype {
  const dayBranch = bazi.day.branch;
  const dayBranchTenGod = bazi.day.branchShiShen;
  const spousePalace = allPalaces.find(p => p.name === '夫妻') || allPalaces[2];
  const spouseStars = spousePalace.majorStars.map(s => s.name);
  const isFemale = gender === '女';

  // 根據夫妻宮主星與日支十神深度畫像
  let personality = '';
  let appearanceTraits = '';
  let careerDirection = '';
  let meetingScenarios = '';
  let harmonyTips = '';

  const hasZiwei = spouseStars.includes('紫微');
  const hasTianfu = spouseStars.includes('天府');
  const hasTaiyang = spouseStars.includes('太陽');
  const hasTaiyin = spouseStars.includes('太陰');
  const hasWuqu = spouseStars.includes('武曲');
  const hasTanlang = spouseStars.includes('貪狼');
  const hasTiantong = spouseStars.includes('天同');
  const hasTianliang = spouseStars.includes('天梁');
  const hasJumen = spouseStars.includes('巨門');
  const hasQisha = spouseStars.includes('七殺');
  const hasPojun = spouseStars.includes('破軍');
  const hasLianzhen = spouseStars.includes('廉貞');

  if (hasZiwei || hasTianfu) {
    personality = '性格端莊穩重，具領袖氣度與決策魄力，自尊心強，有大局觀，處事條理分明。';
    appearanceTraits = '氣宇軒昂，面容飽滿大氣，眼神沉穩堅定，舉止沉著具威儀，穿著講究得體。';
    careerDirection = '多從事企管領導、金融架構、公職權威部門或自主創業經理人。';
    meetingScenarios = '商務高端論壇、大型機構年會、專業決策場合或長輩貴人正式引薦。';
    harmonyTips = '多在人前給予對方尊重與肯定，遇分歧宜私下溫和交流，切忌當眾駁其顏面。';
  } else if (hasTaiyang) {
    personality = '熱情開朗、慷慨博愛，樂於助人且具號召力，光明磊落但有時略顯急躁操心。';
    appearanceTraits = '面色紅潤光澤，神采飛揚，笑容極具感染力，步履生風，聲線洪亮。';
    careerDirection = '公眾傳播、教育學術、海外貿易、科技開拓或政商法務領域。';
    meetingScenarios = '公共講座、學術論壇、跨國交流合作、戶外運動或公益義工活動。';
    harmonyTips = '理解對方的博愛與熱心，多肯定其在外界的成就，給予足夠的情感讚揚。';
  } else if (hasTaiyin) {
    personality = '溫柔體貼、心思細膩，善解人意且重視精神共鳴，具藝術美感與審美追求。';
    appearanceTraits = '皮膚白皙潤澤，五官清秀精緻，眼神柔和如水，氣質文雅謙遜。';
    careerDirection = '文化出版、藝術設計、金融投資、醫藥心理諮詢或不動產管理。';
    meetingScenarios = '藝文展覽、書店圖書館、心靈沙龍或溫馨的朋友聚會。';
    harmonyTips = '細心呵護其敏感心靈，生活多營造浪漫儀式感，遇事多傾聽其內心感受。';
  } else if (hasWuqu) {
    personality = '務實果決、剛毅幹練，執行力極強，重承諾與信義，不尚空談而講求實質成果。';
    appearanceTraits = '骨骼清奇，神情嚴謹專注，線條硬朗幹練，衣著簡潔俐落。';
    careerDirection = '財務精算、工程技術、資本運作、軍憲警界或精密製造業。';
    meetingScenarios = '職場專案攻堅、商務合作簽約、理財投資課程或職場同僚。';
    harmonyTips = '說話直率不拐彎抹角，共同建立家庭財務規劃，彼此在事業上互相扶持。';
  } else if (hasTanlang || hasLianzhen) {
    personality = '聰慧敏銳、風趣多才，社交手腕圓融，充滿生活情趣與個人魅力，追求新鮮感。';
    appearanceTraits = '容貌俊朗秀麗，眉目含情，身型挺拔勻稱，穿著時尚且具個人品味。';
    careerDirection = '公關行銷、影視娛樂、創意設計、新興互聯網或高階商務談判。';
    meetingScenarios = '派對酒會、慶功宴會、社交俱樂部、文娛活動或旅行偶遇。';
    harmonyTips = '保持適度個人空間與神秘感，共同探索新愛好新事物，切忌過度猜疑查勤。';
  } else if (hasTiantong || hasTianliang) {
    personality = '福德深厚、寬厚仁慈，心態隨和包容，具長者智者之風，樂於照顧伴侶生活。';
    appearanceTraits = '慈眉善目，面帶親和微笑，儀態從容祥和，給人安心依靠之感。';
    careerDirection = '醫療衛生、社會福利、文教公職、諮詢顧問或傳統文化研究。';
    meetingScenarios = '師長牽線引薦、校園學府、進修培訓班或宗教慈善場合。';
    harmonyTips = '尊重對方的原則與包容心，日常多陪伴分享溫馨家常，知足常樂即是福。';
  } else if (hasQisha || hasPojun) {
    personality = '獨立自主、敢作敢當，個性分明具開拓冒險精神，敢愛敢恨，不甘平庸。';
    appearanceTraits = '眼神銳利敏捷，英氣逼人，動作敏捷俐落，帶有獨特氣場。';
    careerDirection = '新創開拓者、特種行業、創新技術研發、國際物流或自由職業者。';
    meetingScenarios = '旅行途中、突發緊急事件、競技競賽場合或變革性專案合作。';
    harmonyTips = '欣賞其獨立性而非試圖控制，做其背後最堅實的後盾，共享冒險人生。';
  } else if (hasJumen) {
    personality = '心思敏捷、擅長思辨分析，口才極佳且觀察入微，重視心靈深度契合。';
    appearanceTraits = '眼神專注靈動，談吐自信生動，神情略帶知性深思之美。';
    careerDirection = '法務律師、演講傳媒、學術研究、公關發言人或教育培訓。';
    meetingScenarios = '辯論會、知識分享沙龍、學術研討會或線上思想交流。';
    harmonyTips = '遇意見分歧切忌爭論口舌高下，用溫柔和默契化解心防。';
  } else {
    // 預設綜合型
    personality = '溫良恭儉、行事周密，重視家庭價值與責任，具備極強的持家與共建能力。';
    appearanceTraits = '五官和善端莊，氣度自然大方，給人如沐春風的信賴感。';
    careerDirection = '行政企劃、專業技術、教育輔導或自營穩健事業。';
    meetingScenarios = '親友聚會牽線、日常工作往來或同儕共同圈子。';
    harmonyTips = '用心經營生活細節，相互分擔家庭責任，細水長流最為可貴。';
  }

  // 融合八字日支十神加權修正
  if (dayBranchTenGod.includes('印')) {
    personality += ' 同時八字夫妻宮坐印綬，伴侶具母性或長者般的包容心，能在人生低谷時成為心靈港灣。';
  } else if (dayBranchTenGod.includes('財')) {
    personality += ' 八字夫妻宮坐財星，伴侶精明幹練，極擅持家理財，能帶來實質物質福澤。';
  } else if (dayBranchTenGod.includes('官') || dayBranchTenGod.includes('殺')) {
    personality += ' 八字夫妻宮坐官殺，伴侶有事業心與自律威嚴，家庭中具備主心骨特質。';
  } else if (dayBranchTenGod.includes('食') || dayBranchTenGod.includes('傷')) {
    personality += ' 八字夫妻宮坐食傷，伴侶才華洋溢、幽默風趣，重視情調與生活審美。';
  }

  appearanceTraits += isFemale ? '（具成熟可靠、氣度沉穩之夫君風範）' : '（具溫柔持家、蕙質蘭心之賢妻氣質）';

  return {
    spouseStars: spouseStars.length > 0 ? spouseStars : ['本氣主星'],
    dayBranch,
    dayBranchTenGod,
    personality,
    appearanceTraits,
    careerDirection,
    meetingScenarios,
    harmonyTips
  };
}

// =========================================================================
// 2. 未來 10 年正緣與桃花動態應期探測
// =========================================================================
export function computeLoveMarriageTimeline(
  bazi: BaziData,
  allPalaces: PalaceData[],
  horoscope: HoroscopeState,
  gender: '男' | '女' | string = '男'
): LoveMarriageAnalysis {
  const currentBaseYear = horoscope.selectedYear || new Date().getFullYear();
  const dayMaster = bazi.dayMaster;
  const dayBranch = bazi.day.branch;
  const birthYearBranch = bazi.year.branch;

  const spouseArchetype = computeSpouseArchetype(bazi, allPalaces, gender);

  const hongLuanBranch = HONG_LUAN_BRANCH[birthYearBranch] || '卯';
  const tianXiBranch = TIAN_XI_BRANCH[birthYearBranch] || '酉';
  const xianChiBranch = XIAN_CHI_BRANCH[birthYearBranch] || '子';
  const dayFiveCombine = HEAVENLY_STEM_FIVE_COMBINES[dayMaster] || '';
  const daySixCombine = EARTHLY_BRANCH_SIX_COMBINES[dayBranch] || '';
  const dayThreeCombines = BRANCH_THREE_COMBINES[dayBranch] || [];
  const dayClash = BRANCH_CLASHES[dayBranch] || '';

  const timeline: LoveFortuneYear[] = [];

  for (let offset = 0; offset < 10; offset++) {
    const year = currentBaseYear + offset;
    const { stem: yStem, branch: yBranch, str: yGanZhi } = getYearGanZhi(year);
    const nominalAge = year - (bazi.year ? parseInt(bazi.year.stem) || 2000 : 2000) + 1;

    let score = 50; // 基準中和分
    const baziSigns: string[] = [];
    const ziweiSigns: string[] = [];
    let isTrueLoveTrigger = false;
    let isPeachBlossomTrigger = false;
    let isClashTrigger = false;

    // --- 八字婚戀信號探測 ---
    // 1. 天干五合 (日主逢合，正緣最強徵兆之一)
    if (yStem === dayFiveCombine) {
      score += 25;
      isTrueLoveTrigger = true;
      baziSigns.push(`天干五合【${dayMaster}${yStem}合】：日元得合，宿命良緣強烈共鳴`);
    }

    // 2. 地支六合 / 三合 (夫妻宮引動)
    if (yBranch === daySixCombine) {
      score += 22;
      isTrueLoveTrigger = true;
      baziSigns.push(`地支六合【${dayBranch}${yBranch}合】：夫妻宮得合引動，婚眷安定成局`);
    } else if (dayThreeCombines.includes(yBranch)) {
      score += 15;
      isTrueLoveTrigger = true;
      baziSigns.push(`地支三合會局：夫妻宮氣運活絡，喜事結緣`);
    }

    // 3. 配偶星透出
    if (gender === '女') {
      if (['甲', '丙', '戊', '庚', '壬'].includes(yStem) && bazi.day.hiddenStems.some(h => h.shishen.includes('官'))) {
        score += 18;
        baziSigns.push(`流年透官星：正緣夫星入局，婚戀定數大增`);
      } else if (['乙', '丁', '己', '辛', '癸'].includes(yStem) && bazi.day.hiddenStems.some(h => h.shishen.includes('殺'))) {
        score += 12;
        isPeachBlossomTrigger = true;
        baziSigns.push(`流年透偏官：情緣激盪，浪漫心動邂逅`);
      }
    } else {
      if (bazi.day.hiddenStems.some(h => h.shishen.includes('正財'))) {
        score += 18;
        baziSigns.push(`流年透正財：正緣妻星入局，定親婚配良機`);
      } else if (bazi.day.hiddenStems.some(h => h.shishen.includes('偏財'))) {
        score += 12;
        isPeachBlossomTrigger = true;
        baziSigns.push(`流年透偏財：異性緣分大好，桃花活水進氣`);
      }
    }

    // 4. 地支逢沖刑 (感情波折)
    if (yBranch === dayClash) {
      score -= 25;
      isClashTrigger = true;
      baziSigns.push(`夫妻宮逢沖【${dayBranch}${yBranch}沖】：防口舌紛擾、情感理念摩擦`);
    }

    // --- 紫微斗數婚戀信號探測 ---
    // 1. 流年紅鸞 / 天喜星動
    if (yBranch === hongLuanBranch) {
      score += 20;
      isTrueLoveTrigger = true;
      ziweiSigns.push(`流年地支逢【紅鸞星動】：正統婚戀喜慶大吉曜，姻緣定鼎`);
    }
    if (yBranch === tianXiBranch) {
      score += 15;
      isTrueLoveTrigger = true;
      ziweiSigns.push(`流年地支逢【天喜星照】：喜事臨門，情意融洽歡樂`);
    }
    if (yBranch === xianChiBranch) {
      score += 12;
      isPeachBlossomTrigger = true;
      ziweiSigns.push(`流年逢【咸池桃花】：社交魅力大發，異性目光聚焦`);
    }

    // 2. 流年四化星曜化祿/化科
    const ySiHua = STEM_SI_HUA[yStem];
    if (ySiHua) {
      if (['貪狼', '廉貞', '天同', '太陰'].includes(ySiHua.lu)) {
        score += 15;
        isPeachBlossomTrigger = true;
        ziweiSigns.push(`流年【${ySiHua.lu}化祿】：感情桃花春風化雨，浪漫濃郁`);
      }
      if (['文昌', '文曲', '天機'].includes(ySiHua.ke)) {
        score += 10;
        ziweiSigns.push(`流年【${ySiHua.ke}化科】：名譽喜慶，情緣文雅定約`);
      }
      if (['廉貞', '巨門', '太陽', '太陰', '天同'].includes(ySiHua.ji)) {
        score -= 20;
        isClashTrigger = true;
        ziweiSigns.push(`流年【${ySiHua.ji}化忌】：情感防誤會猜疑、口角爭端`);
      }
    }

    // 限制分數 0 ~ 100
    score = Math.max(10, Math.min(99, score));

    // 類型與標籤判定
    let type: LoveYearType = 'peaceful';
    let badge = '🌱 靜好相守';
    let title = `${yGanZhi}年 · 情感平實溫和`;
    let summary = '';
    let advice = '';

    if (score >= 82 || (isTrueLoveTrigger && score >= 75)) {
      type = 'true_love';
      badge = '⭐⭐⭐⭐⭐ 宿命正緣';
      title = `${yGanZhi}年 · 天賜正緣良配 大婚定鼎吉期`;
      summary = '雙軌星曜與干支同頻引動婚宮，正緣磁場極其強盛，極易遇見攜手一生的關鍵伴侶，亦是步入婚姻、公開定親的最強黃金年。';
      advice = '打開心扉，主動參與各類優質社交或長輩牽線；已有伴侶者宜順水推舟敲定婚事，共築幸福家園。';
    } else if (score >= 68 || isPeachBlossomTrigger) {
      type = 'peach_blossom';
      badge = '⭐⭐⭐⭐ 心動桃花';
      title = `${yGanZhi}年 · 桃花綻放 心動浪漫邂逅`;
      summary = '流年桃花吉曜照拂，個人魅力神采飛揚，異性緣活躍，易有浪漫甜蜜的戀情展開，彼此吸引力強。';
      advice = '多展現真實才華與親和力，享受戀愛過程；但需注意理性篩選，尋找三觀相合的踏實對象。';
    } else if (isClashTrigger || score <= 40) {
      type = 'karmic_test';
      badge = '⚠️ 情感磨合';
      title = `${yGanZhi}年 · 磨合考驗 理性修持避險`;
      summary = '夫妻宮位逢歲運激盪，易因觀念分歧、外在環境壓力或爛桃花干擾導致情感波折，需防衝動決策。';
      advice = '凡事多換位思考，切忌意氣用事或翻舊帳；單身者慎防虛情假意，已有伴侶者多加包容與溝通。';
    } else {
      type = 'peaceful';
      badge = '🌱 靜好相守';
      title = `${yGanZhi}年 · 細水長流 踏實相守`;
      summary = '感情氣息平穩安祥，無大起大落之波動，適合在平淡日常中累積彼此信賴，厚植情感基石。';
      advice = '在平淡中增添溫馨驚喜，共同為共同目標努力，感情歷久彌堅。';
    }

    timeline.push({
      year,
      nominalAge,
      stemBranch: yGanZhi,
      score,
      type,
      badge,
      title,
      baziSigns,
      ziweiSigns,
      summary,
      advice
    });
  }

  // 篩選最優正緣年 (Top 2~3 年)
  const bestYears = [...timeline]
    .filter(t => t.type === 'true_love' || t.score >= 75)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const currentYearFortune = timeline.find(t => t.year === currentBaseYear) || timeline[0];

  const overallLoveSummary = `命主夫妻宮坐【${spouseArchetype.spouseStars.join('、')}】，八字日支配偶星為【${spouseArchetype.dayBranchTenGod}】。天命婚戀根基厚實，未來十年中，以【${bestYears.map(y => `${y.year}年(${y.stemBranch})`).join('、')}】之正緣共振能量最為充沛，此數年宜把握天時，大成美滿良緣。`;

  return {
    spouseArchetype,
    currentYearFortune,
    timeline,
    bestYears,
    overallLoveSummary
  };
}
