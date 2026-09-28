/**
 * 天樞星象 · 雙軌合參智能運算引擎 (Dual-Track Resonance Engine)
 * 融匯正統子平五行氣象與紫微斗數星曜垂象，體用一元，星神同頻。
 * （嚴格去除所有個人姓名，體系完全自有化、古典正統化）
 */

import type { 
  BaziData, 
  PalaceData, 
  HoroscopeState, 
  DualTrackEnergyData, 
  ElementEnergyDetail,
  StarGodResonanceItem,
  TimingResonanceItem
} from '../types';

// 五行映射與生剋表
const ELEMENT_MAP: Record<string, '木' | '火' | '土' | '金' | '水'> = {
  '甲': '木', '乙': '木', '寅': '木', '卯': '木',
  '丙': '火', '丁': '火', '巳': '火', '午': '火',
  '戊': '土', '己': '土', '辰': '土', '戌': '土', '丑': '土', '未': '土',
  '庚': '金', '辛': '金', '申': '金', '酉': '金',
  '壬': '水', '癸': '水', '亥': '水', '子': '水'
};

const ELEMENT_ATTRIBUTES: Record<'木' | '火' | '土' | '金' | '水', string> = {
  '木': '主仁慈、開拓生長、肝膽經絡、神經條達',
  '火': '主禮儀、熱烈上進、心神血液、洞察靈明',
  '土': '主信義、包容承載、脾胃消化、沉穩厚重',
  '金': '主義氣、決斷肅殺、肺氣大腸、魄力秩序',
  '水': '主智慧、涵養流動、腎精泌尿、深謀遠慮'
};

// 地支藏干精確比例 (本氣, 中氣, 餘氣)
const BRANCH_HIDDEN_WEIGHTS: Record<string, { stem: string; weight: number }[]> = {
  '子': [{ stem: '癸', weight: 1.0 }],
  '丑': [{ stem: '己', weight: 0.6 }, { stem: '癸', weight: 0.3 }, { stem: '辛', weight: 0.1 }],
  '寅': [{ stem: '甲', weight: 0.6 }, { stem: '丙', weight: 0.3 }, { stem: '戊', weight: 0.1 }],
  '卯': [{ stem: '乙', weight: 1.0 }],
  '辰': [{ stem: '戊', weight: 0.6 }, { stem: '乙', weight: 0.3 }, { stem: '癸', weight: 0.1 }],
  '巳': [{ stem: '丙', weight: 0.6 }, { stem: '庚', weight: 0.3 }, { stem: '戊', weight: 0.1 }],
  '午': [{ stem: '丁', weight: 0.7 }, { stem: '己', weight: 0.3 }],
  '未': [{ stem: '己', weight: 0.6 }, { stem: '丁', weight: 0.3 }, { stem: '乙', weight: 0.1 }],
  '申': [{ stem: '庚', weight: 0.6 }, { stem: '壬', weight: 0.3 }, { stem: '戊', weight: 0.1 }],
  '酉': [{ stem: '辛', weight: 1.0 }],
  '戌': [{ stem: '戊', weight: 0.6 }, { stem: '辛', weight: 0.3 }, { stem: '丁', weight: 0.1 }],
  '亥': [{ stem: '壬', weight: 0.7 }, { stem: '甲', weight: 0.3 }]
};

// =========================================================================
// 1. 五行全息動態能量計算
// =========================================================================
export function computeDualTrackEnergy(
  bazi: BaziData,
  decadeGanZhi?: string,
  yearlyGanZhi?: string
): DualTrackEnergyData {
  const scores: Record<'木' | '火' | '土' | '金' | '水', number> = {
    '木': 0, '火': 0, '土': 0, '金': 0, '水': 0
  };

  // 1. 天干基礎分 (年干 12, 月干 18, 日主 20, 時干 12)
  const stems = [
    { stem: bazi.year.stem, weight: 12 },
    { stem: bazi.month.stem, weight: 18 },
    { stem: bazi.day.stem, weight: 20 },
    { stem: bazi.hour.stem, weight: 12 },
  ];
  stems.forEach(item => {
    const elem = ELEMENT_MAP[item.stem];
    if (elem) scores[elem] += item.weight;
  });

  // 2. 地支藏干分 (月令最重 45 分, 日支 25 分, 年支 15 分, 時支 15 分)
  const branches = [
    { branch: bazi.month.branch, totalWeight: 45 },
    { branch: bazi.day.branch, totalWeight: 25 },
    { branch: bazi.year.branch, totalWeight: 15 },
    { branch: bazi.hour.branch, totalWeight: 15 },
  ];
  branches.forEach(item => {
    const hiddens = BRANCH_HIDDEN_WEIGHTS[item.branch] || [];
    hiddens.forEach(h => {
      const elem = ELEMENT_MAP[h.stem];
      if (elem) scores[elem] += item.totalWeight * h.weight;
    });
  });

  // 3. 大運與流年動態進氣加權 (大運 15 分, 流年 15 分)
  if (decadeGanZhi && decadeGanZhi.length >= 2) {
    const dStemElem = ELEMENT_MAP[decadeGanZhi[0]];
    const dBranchElem = ELEMENT_MAP[decadeGanZhi[1]];
    if (dStemElem) scores[dStemElem] += 8;
    if (dBranchElem) scores[dBranchElem] += 7;
  }
  if (yearlyGanZhi && yearlyGanZhi.length >= 2) {
    const yStemElem = ELEMENT_MAP[yearlyGanZhi[0]];
    const yBranchElem = ELEMENT_MAP[yearlyGanZhi[1]];
    if (yStemElem) scores[yStemElem] += 8;
    if (yBranchElem) scores[yBranchElem] += 7;
  }

  // 計算總分與百分比
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const rawElements: Record<'wood' | 'fire' | 'earth' | 'metal' | 'water', ElementEnergyDetail> = {
    wood: { element: '木', score: Math.round(scores['木']), percentage: Math.round((scores['木'] / totalScore) * 100), status: '平和', characteristics: ELEMENT_ATTRIBUTES['木'] },
    fire: { element: '火', score: Math.round(scores['火']), percentage: Math.round((scores['火'] / totalScore) * 100), status: '平和', characteristics: ELEMENT_ATTRIBUTES['火'] },
    earth: { element: '土', score: Math.round(scores['土']), percentage: Math.round((scores['土'] / totalScore) * 100), status: '平和', characteristics: ELEMENT_ATTRIBUTES['土'] },
    metal: { element: '金', score: Math.round(scores['金']), percentage: Math.round((scores['金'] / totalScore) * 100), status: '平和', characteristics: ELEMENT_ATTRIBUTES['金'] },
    water: { element: '水', score: Math.round(scores['水']), percentage: Math.round((scores['水'] / totalScore) * 100), status: '平和', characteristics: ELEMENT_ATTRIBUTES['水'] },
  };

  // 評定狀態
  Object.values(rawElements).forEach(item => {
    if (item.percentage >= 38) item.status = '極旺';
    else if (item.percentage >= 26) item.status = '旺';
    else if (item.percentage >= 15) item.status = '平和';
    else if (item.percentage >= 7) item.status = '休囚';
    else item.status = '極弱';
  });

  // 日主五行與強弱判定
  const dayMaster = bazi.dayMaster;
  const dmElem = ELEMENT_MAP[dayMaster] || '木';

  // 同黨 (比劫 + 印梟) vs 異黨 (食傷 + 財星 + 官殺)
  const SUPPORT_MAP: Record<'木' | '火' | '土' | '金' | '水', ('木' | '火' | '土' | '金' | '水')[]> = {
    '木': ['木', '水'],
    '火': ['火', '木'],
    '土': ['土', '火'],
    '金': ['金', '土'],
    '水': ['水', '金']
  };

  const allies = SUPPORT_MAP[dmElem];
  const allyScore = scores[allies[0]] + scores[allies[1]];
  const allyRatio = allyScore / totalScore;

  let dmStrength: '極旺' | '偏旺' | '中和' | '偏弱' | '極弱' = '中和';
  if (allyRatio >= 0.65) dmStrength = '極旺';
  else if (allyRatio >= 0.52) dmStrength = '偏旺';
  else if (allyRatio >= 0.44) dmStrength = '中和';
  else if (allyRatio >= 0.32) dmStrength = '偏弱';
  else dmStrength = '極弱';

  // 判定喜忌神
  let favorable: string[] = [];
  let unfavorable: string[] = [];

  const ALL_ELEMS: ('木' | '火' | '土' | '金' | '水')[] = ['木', '火', '土', '金', '水'];
  if (dmStrength === '極旺' || dmStrength === '偏旺') {
    // 身旺：喜剋洩耗 (異黨為喜，同黨為忌)
    favorable = ALL_ELEMS.filter(e => !allies.includes(e));
    unfavorable = allies;
  } else if (dmStrength === '偏弱' || dmStrength === '極弱') {
    // 身弱：喜生扶 (同黨為喜，異黨為忌)
    favorable = allies;
    unfavorable = ALL_ELEMS.filter(e => !allies.includes(e));
  } else {
    // 中和：平衡為貴，取最弱者生扶，過旺者制化
    const sorted = [...ALL_ELEMS].sort((a, b) => scores[a] - scores[b]);
    favorable = [sorted[0], sorted[1]];
    unfavorable = [sorted[4]];
  }

  // 格局判定 (以月支藏干透出為準)
  const monthBranch = bazi.month.branch;
  const monthHiddens = BRANCH_HIDDEN_WEIGHTS[monthBranch] || [];
  let pattern = '正格氣候格局';
  for (const h of monthHiddens) {
    if ([bazi.year.stem, bazi.month.stem, bazi.hour.stem].includes(h.stem)) {
      const ts = bazi.month.hiddenStems.find(x => x.stem === h.stem)?.shishen;
      if (ts) {
        pattern = `${ts}透出成格`;
        break;
      }
    }
  }
  if (pattern === '正格氣候格局') {
    const mainStem = monthHiddens[0]?.stem;
    const mainShiShen = bazi.month.hiddenStems.find(x => x.stem === mainStem)?.shishen || '得令';
    pattern = `${mainShiShen}司令得局`;
  }

  // 四季氣候綜評
  const seasonMap: Record<string, string> = {
    '寅': '孟春得氣，木火向榮', '卯': '仲春司令，乙木青翠', '辰': '季春溫土，水庫藏滋',
    '巳': '孟夏火進，炎陽宣化', '午': '仲夏真火，萬物繁華', '未': '季夏燥土，木庫餘溫',
    '申': '孟秋金旺，水生天涼', '酉': '仲秋白虎，精金肅殺', '戌': '季秋火庫，燥土收斂',
    '亥': '孟冬水旺，甲木長生', '子': '仲冬嚴寒，玄水至陰', '丑': '季冬濕土，冰封待春'
  };
  const climateDesc = seasonMap[monthBranch] || '氣候調和';

  return {
    elements: rawElements,
    dayMaster,
    dayMasterElement: dmElem,
    dayMasterStrength: dmStrength,
    favorableElements: favorable,
    unfavorableElements: unfavorable,
    patternName: pattern,
    climateDescription: climateDesc
  };
}

// =========================================================================
// 2. 星神同氣共鳴矩陣 (古典合參模型)
// =========================================================================
export function computeStarGodSynastry(
  allPalaces: PalaceData[],
  bazi: BaziData
): StarGodResonanceItem[] {
  const results: StarGodResonanceItem[] = [];

  // 重點合參宮位：命宮、官祿宮、財帛宮、夫妻宮、福德宮、遷移宮
  const keyPalaces = ['命宮', '官祿', '財帛', '夫妻', '福德', '遷移'];

  keyPalaces.forEach(pName => {
    const palace = allPalaces.find(p => p.name === pName);
    if (!palace) return;

    const starNames = palace.majorStars.map(s => s.name);
    const tenGodsSet = new Set<string>();

    // 收集該宮位干支在八字中呼應的十神
    [bazi.year, bazi.month, bazi.day, bazi.hour].forEach(pillar => {
      if (pillar.branch === palace.earthlyBranch) {
        tenGodsSet.add(pillar.branchShiShen);
        pillar.hiddenStems.forEach(h => tenGodsSet.add(h.shishen));
      }
    });

    const tenGods = Array.from(tenGodsSet);
    let score = 75;
    let level: StarGodResonanceItem['resonanceLevel'] = '相輔相成';
    let title = `${pName}星神相應`;
    let verdict = '';

    const hasZiweiOrTianfu = starNames.some(s => ['紫微', '天府'].includes(s));
    const hasQiShaOrPoJun = starNames.some(s => ['七殺', '破軍'].includes(s));
    const hasWuQuOrTaiYin = starNames.some(s => ['武曲', '太陰'].includes(s));
    const hasGuanSha = tenGods.some(t => ['正官', '七殺'].includes(t));
    const hasCaiXing = tenGods.some(t => ['正財', '偏財'].includes(t));
    const hasYinXing = tenGods.some(t => ['正印', '偏印'].includes(t));

    if (pName === '命宮') {
      if (hasZiweiOrTianfu && hasGuanSha) {
        score = 95;
        level = '天作之合';
        title = '北極帝曜逢官印，貴徵自顯';
        verdict = '紫府坐命而八字官煞清透，氣象崇高雍容，行事穩健具威望，擅籌謀與統御全域。';
      } else if (hasQiShaOrPoJun && tenGods.some(t => ['傷官', '七殺'].includes(t))) {
        score = 88;
        level = '剛柔並濟';
        title = '開路先鋒逢將星，魄力絕倫';
        verdict = '殺破狼坐命逢八字傷官七殺，開拓開創力極強，不墨守成規，能在變局中開創基業。';
      } else if (hasWuQuOrTaiYin && hasCaiXing) {
        score = 92;
        level = '天作之合';
        title = '財帛吉曜逢真財，富裕厚積';
        verdict = '武曲太陰逢正偏財同頻，天生對商業現金流與資產佈局極具嗅覺，理財有方。';
      } else {
        score = 80;
        level = '相輔相成';
        title = '形神兼備，內外呼應';
        verdict = `命宮坐${starNames.join('、') || '吉星'}，八字見${tenGods.slice(0, 2).join('、')}，秉賦剛柔相濟，得天地之化育。`;
      }
    } else if (pName === '官祿') {
      if (hasGuanSha || hasYinXing) {
        score = 90;
        level = '天作之合';
        title = '事功得祿，官貴亨通';
        verdict = '官祿宮星宿與八字官印同步發動，事業路徑清晰，擅長組織管理與專業深耕。';
      } else {
        score = 78;
        level = '相輔相成';
        title = '立業有基，順遂可成';
        verdict = '事功宮位吉凶互濟，宜依個人技藝與口碑為依託，行穩致遠。';
      }
    } else if (pName === '財帛') {
      if (hasCaiXing || starNames.some(s => s.includes('祿'))) {
        score = 92;
        level = '天作之合';
        title = '庫盈金玉，祿馬照會';
        verdict = '財帛宮會合八字財星，財源活絡多元，正偏兼得，善抓商機。';
      } else {
        score = 76;
        level = '相輔相成';
        title = '積微成著，聚沙成塔';
        verdict = '財氣平穩守正，宜長線價值投資與穩健累積，避免高風險冒進。';
      }
    } else {
      score = 82;
      level = '相輔相成';
      title = `${pName}氣象調和`;
      verdict = `${pName}臨${starNames.join('、') || '本氣'}，與八字五行生化循環通達，彼此相得益彰。`;
    }

    results.push({
      palaceName: pName,
      starNames,
      tenGods,
      resonanceLevel: level,
      resonanceScore: score,
      title,
      verdict
    });
  });

  return results;
}

// =========================================================================
// 3. 歲運雙軌吉凶共振探測器
// =========================================================================
export function computeTimingResonance(
  horoscope: HoroscopeState,
  bazi: BaziData,
  allPalaces: PalaceData[]
): TimingResonanceItem {
  const currentYear = horoscope.selectedYear;
  const decadeInfo = horoscope.decadalInfo;
  const yearlyInfo = horoscope.yearlyInfo;

  const dStemBranch = decadeInfo ? `${decadeInfo.stem}${decadeInfo.branch}` : (bazi.dayunList[0]?.ganZhi || '現運');
  const yStemBranch = yearlyInfo ? `${yearlyInfo.stem}${yearlyInfo.branch}` : '甲子';

  // 八字觸發檢驗
  const baziTriggers: string[] = [];
  const keyStars: string[] = [];

  let score = 20; // 基礎分 (中和偏吉)
  
  // 檢查八字用神進氣
  const energy = computeDualTrackEnergy(bazi, dStemBranch, yStemBranch);
  const yStemElem = ELEMENT_MAP[yStemBranch[0]];
  const isFavorableYear = yStemElem && energy.favorableElements.includes(yStemElem);
  const isUnfavorableYear = yStemElem && energy.unfavorableElements.includes(yStemElem);

  if (isFavorableYear) {
    score += 35;
    baziTriggers.push(`流年干支天元【${yStemElem}】為命中喜用進氣`);
  } else if (isUnfavorableYear) {
    score -= 30;
    baziTriggers.push(`流年干支【${yStemElem}】屬命中忌仇伏藏`);
  }

  // 檢查紫微流年四化
  const mutagens = yearlyInfo?.mutagens || [];
  let hasLu = false;
  let hasJi = false;

  mutagens.forEach(m => {
    keyStars.push(`${m.star}化${m.mutagen}`);
    if (m.mutagen === '祿') {
      score += 25;
      hasLu = true;
    } else if (m.mutagen === '權') {
      score += 15;
    } else if (m.mutagen === '科') {
      score += 10;
    } else if (m.mutagen === '忌') {
      score -= 30;
      hasJi = true;
    }
  });

  // 疊宮與對沖
  if (yearlyInfo) {
    const yearlyLifePalace = allPalaces[yearlyInfo.palaceIndex];
    if (yearlyLifePalace) {
      if (yearlyLifePalace.majorStars.some(s => ['紫微', '天府', '太陽', '太陰', '武曲'].includes(s.name))) {
        score += 15;
      }
    }
  }

  // 限制分數在 -100 ~ +100
  score = Math.max(-100, Math.min(100, score));

  // 判定評級
  let grade: TimingResonanceItem['grade'] = '順風借勢';
  let verdict = '';
  let advice = '';

  if (score >= 65) {
    grade = '雙軌大吉';
    verdict = '八字喜神生扶乘勢，紫微流年吉化齊照。天時、地利、人和兼得之爆發年。';
    advice = '宜大膽推展重要事業計劃、求財開拓、晉升考試或重大置產，成效將倍數放大。';
  } else if (score >= 30) {
    grade = '順風借勢';
    verdict = '歲運整體氣機向榮，人事助力明顯，順勢而為即可收穫扎實成果。';
    advice = '保持專注與持續力，主動尋求良師益友合作，穩步擴大既有戰果。';
  } else if (hasLu && isUnfavorableYear) {
    grade = '外吉內虛';
    verdict = '斗數流祿浮於表面，而八字歲運暗中見制。易有外表風光但開銷浩大、暗中承壓之象。';
    advice = '慎防面子工程與超額借貸，簽約合約需逐字審查，重實質收益而非虛名。';
  } else if (hasJi && isFavorableYear) {
    grade = '暗生機兆';
    verdict = '紫微化忌雖見波折紛擾與人事考驗，但八字真用神在暗中紮根蓄勢。';
    advice = '過程雖有壓力阻滯，切勿氣餒；此乃淬鍊核心實力之轉捩年，堅持至下半年必見柳暗花明。';
  } else if (score <= -50) {
    grade = '雙軌重危';
    verdict = '八字歲運逢沖制，紫微流煞化忌引動。防是非、合約波折、健康波動或意外破耗。';
    advice = '凡事宜守不宜燥，切忌大筆投機、替人作保或衝動轉職；行事低調，注重身心修養。';
  } else {
    grade = '沉潛蓄力';
    verdict = '歲運平實無大風浪，氣息沉靜，宜修心練功，累積資源。';
    advice = '深耕專業技能，優化內部流程與財務結構，為下一輪歲運躍升奠基。';
  }

  return {
    year: currentYear,
    decadeStemBranch: dStemBranch,
    yearlyStemBranch: yStemBranch,
    score,
    grade,
    keyStars,
    baziTriggers,
    verdict,
    strategicAdvice: advice
  };
}
