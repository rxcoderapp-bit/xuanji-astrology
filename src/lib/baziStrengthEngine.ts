/**
 * 子平八字動態身強身弱（旺衰）與五行能量精密運算引擎
 * 
 * 核心原典依據：《滴天髓》、《子平真詮》、《窮通寶鑑》
 * 破除傳統機械算分只看月令與表面十神的盲點，
 * 納入四維度動態權重：
 * 1. 地支三會、三合、半合與六合的「動態變性優先處理」（Pre-processing）
 *    - 辰丑濕土（辰為水庫）遇水合局轉化為同黨比劫水庫
 *    - 辰酉合金、丑酉合金轉化為金
 *    - 未戌燥土遇木火局變性
 * 2. 得地（日支與時支貼身強根、專位帝旺/臨官 1.3x~1.5x 加成、長生源頭印生加成）
 * 3. 得令（月令四季進氣退氣與藏干動態分配）
 * 4. 天干通根與虛浮折減檢測（通根 1.15x，虛浮 0.8x）
 * 
 * 100 分制標準：
 * > 80 分：專旺／從強
 * > 55 分：身強／身旺 (56~62 為中和偏強／底氣充沛)
 * 45~55 分：中和 (50~55 中和偏強，45~49 中和偏弱)
 * 20~44 分：身弱／需印比生扶
 * < 20 分：從弱／極弱
 */

import type { BaziPillar } from '../types';

export interface BaziDynamicStrengthResult {
  score: number; // 0 ~ 100
  level: '極旺' | '偏旺' | '中和' | '偏弱' | '極弱';
  levelDetail: string; // 如 "中和偏強／底氣充沛", "身弱／需印比生扶"
  dmElem: '木' | '火' | '土' | '金' | '水';
  motherElem: '木' | '火' | '土' | '金' | '水';
  deLing: boolean;
  deDi: boolean;
  deSheng: boolean;
  normalizedElements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  combinationNotes: string[];
  description: string;
  detailDescription?: string;
}

export const STEM_TO_ELEM: Record<string, '木' | '火' | '土' | '金' | '水'> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

export const MOTHER_ELEM_MAP: Record<'木' | '火' | '土' | '金' | '水', '木' | '火' | '土' | '金' | '水'> = {
  '木': '水',
  '火': '木',
  '土': '火',
  '金': '土',
  '水': '金'
};

// 地支標準藏干與本氣/中氣/餘氣基準權重
export const ZHI_STANDARD_CANGGAN: Record<string, { stem: string; elem: '木' | '火' | '土' | '金' | '水'; weight: number }[]> = {
  '子': [{ stem: '癸', elem: '水', weight: 1.0 }],
  '丑': [{ stem: '己', elem: '土', weight: 0.60 }, { stem: '癸', elem: '水', weight: 0.25 }, { stem: '辛', elem: '金', weight: 0.15 }],
  '寅': [{ stem: '甲', elem: '木', weight: 0.60 }, { stem: '丙', elem: '火', weight: 0.25 }, { stem: '戊', elem: '土', weight: 0.15 }],
  '卯': [{ stem: '乙', elem: '木', weight: 1.0 }],
  '辰': [{ stem: '戊', elem: '土', weight: 0.60 }, { stem: '乙', elem: '木', weight: 0.20 }, { stem: '癸', elem: '水', weight: 0.20 }],
  '巳': [{ stem: '丙', elem: '火', weight: 0.60 }, { stem: '庚', elem: '金', weight: 0.25 }, { stem: '戊', elem: '土', weight: 0.15 }],
  '午': [{ stem: '丁', elem: '火', weight: 0.70 }, { stem: '己', elem: '土', weight: 0.30 }],
  '未': [{ stem: '己', elem: '土', weight: 0.60 }, { stem: '丁', elem: '火', weight: 0.20 }, { stem: '乙', elem: '木', weight: 0.20 }],
  '申': [{ stem: '庚', elem: '金', weight: 0.60 }, { stem: '壬', elem: '水', weight: 0.25 }, { stem: '戊', elem: '土', weight: 0.15 }],
  '酉': [{ stem: '辛', elem: '金', weight: 1.0 }],
  '戌': [{ stem: '戊', elem: '土', weight: 0.60 }, { stem: '辛', elem: '金', weight: 0.20 }, { stem: '丁', elem: '火', weight: 0.20 }],
  '亥': [{ stem: '壬', elem: '水', weight: 0.70 }, { stem: '甲', elem: '木', weight: 0.30 }],
};

// 專位帝旺、臨官強根柱 (日柱坐支強根)
export const ZHUAN_WANG_PILLARS = [
  '丙午', '丁巳', '壬子', '癸亥', '戊午', '己巳', '甲寅', '乙卯', '庚申', '辛酉'
];

/**
 * 核心動態旺衰演算法
 */
export function calculateDynamicBaziStrength(chart: {
  year: BaziPillar;
  month: BaziPillar;
  day: BaziPillar;
  hour: BaziPillar;
}): BaziDynamicStrengthResult {
  const { year, month, day, hour } = chart;
  const dm = day.stem;
  const dmElem = STEM_TO_ELEM[dm] || '水';
  const motherElem = MOTHER_ELEM_MAP[dmElem] || '金';

  const allBranches = [year.branch, month.branch, day.branch, hour.branch];
  const allStems = [year.stem, month.stem, day.stem, hour.stem];
  const combinationNotes: string[] = [];

  // -------------------------------------------------------------
  // 第一維度：地支三合、三會、半合與六合的「動態變性優先處理」
  // -------------------------------------------------------------
  const hasShen = allBranches.includes('申');
  const hasZi = allBranches.includes('子');
  const hasChen = allBranches.includes('辰');
  const hasChou = allBranches.includes('丑');
  const hasYou = allBranches.includes('酉');
  const hasSi = allBranches.includes('巳');
  const hasYin = allBranches.includes('寅');
  const hasWu = allBranches.includes('午');
  const hasXu = allBranches.includes('戌');
  const hasHai = allBranches.includes('亥');
  const hasMao = allBranches.includes('卯');
  const hasWei = allBranches.includes('未');

  // 三合局
  const sanHeWater = hasShen && hasZi && hasChen;
  const sanHeFire = hasYin && hasWu && hasXu;
  const sanHeMetal = hasSi && hasYou && hasChou;
  const sanHeWood = hasHai && hasMao && hasWei;

  // 半合局 (需帶旺支 子、午、卯、酉)
  const banHeWater = (hasShen && hasZi) || (hasZi && hasChen);
  const banHeFire = (hasYin && hasWu) || (hasWu && hasXu);
  const banHeMetal = (hasSi && hasYou) || (hasYou && hasChou);
  const banHeWood = (hasHai && hasMao) || (hasMao && hasWei);

  // 六合局
  const liuHeChenYou = hasChen && hasYou;
  const liuHeZiChou = hasZi && hasChou;
  const liuHeYinHai = hasYin && hasHai;
  const liuHeMaoXu = hasMao && hasXu;
  const liuHeSiShen = hasSi && hasShen;
  const liuHeWuWei = hasWu && hasWei;

  if (sanHeWater) combinationNotes.push('地支申子辰三合水局成化');
  else if (banHeWater) combinationNotes.push('地支得子辰/申子半合水局助勢');

  if (sanHeMetal) combinationNotes.push('地支巳酉丑三合金局成化');
  else if (banHeMetal) combinationNotes.push('地支酉丑/巳酉半合金局');

  if (sanHeWood) combinationNotes.push('地支亥卯未三合木局成化');
  else if (banHeWood) combinationNotes.push('地支亥卯/卯未半合木局');

  if (sanHeFire) combinationNotes.push('地支寅午戌三合火局成化');
  else if (banHeFire) combinationNotes.push('地支寅午/午戌半合火局');

  if (liuHeChenYou) combinationNotes.push('辰酉六合化金局');
  if (liuHeZiChou) combinationNotes.push('子丑六合水土相滋');
  if (liuHeYinHai) combinationNotes.push('寅亥六合木氣生發');
  if (liuHeMaoXu) combinationNotes.push('卯戌六合火氣潛藏');
  if (liuHeSiShen) combinationNotes.push('巳申六合水金相濟');
  if (liuHeWuWei) combinationNotes.push('午未六合日月同輝');

  // 基準四柱權重分配 (總分 100 分)
  const branchWeights = {
    month: 36, // 月令提綱 (司權重器)
    day: 22,   // 日支坐基 (日主近身氣場)
    hour: 12,  // 時支歸宿 (晚景長生基業)
    year: 8    // 年支祖基 (遠方根源)
  };

  const stemWeights = {
    month: 10, // 月干貼身
    hour: 7,   // 時干貼身
    year: 5    // 年干客位
  };

  const scores: Record<'木' | '火' | '土' | '金' | '水', number> = {
    '木': 0, '火': 0, '土': 0, '金': 0, '水': 0
  };

  // 動態獲取地支藏干五行比例
  function getDynamicBranchDistribution(branch: string) {
    let dist = JSON.parse(JSON.stringify(ZHI_STANDARD_CANGGAN[branch] || [{ stem: '戊', elem: '土', weight: 1.0 }]));

    // 辰 (Chen) 濕土與水庫變性邏輯
    if (branch === '辰') {
      if (dmElem === '水' && sanHeWater) {
        // 申子辰三合水局：辰土化為水庫比劫同黨！大幅減輕剋伐，化為強水庫
        dist = [
          { stem: '癸', elem: '水', weight: 0.65 },
          { stem: '乙', elem: '木', weight: 0.20 },
          { stem: '戊', elem: '土', weight: 0.15 }
        ];
      } else if (dmElem === '水' && banHeWater) {
        dist = [
          { stem: '癸', elem: '水', weight: 0.50 },
          { stem: '戊', elem: '土', weight: 0.30 },
          { stem: '乙', elem: '木', weight: 0.20 }
        ];
      } else if (liuHeChenYou || sanHeMetal || banHeMetal) {
        // 辰酉六合金：辰土從金化，保留辰月暮春餘氣乙木 12%
        dist = [
          { stem: '辛', elem: '金', weight: 0.52 },
          { stem: '戊', elem: '土', weight: 0.26 },
          { stem: '乙', elem: '木', weight: 0.12 },
          { stem: '癸', elem: '水', weight: 0.10 }
        ];
      }
    }

    // 丑 (Chou) 濕土金庫變性邏輯
    if (branch === '丑') {
      if (liuHeChenYou || sanHeMetal || banHeMetal || hasYou) {
        // 丑酉半合金
        dist = [
          { stem: '辛', elem: '金', weight: 0.55 },
          { stem: '己', elem: '土', weight: 0.30 },
          { stem: '癸', elem: '水', weight: 0.15 }
        ];
      }
    }

    // 申 (Shen) 在水局中的化育
    if (branch === '申' && sanHeWater) {
      dist = [
        { stem: '庚', elem: '金', weight: 0.50 },
        { stem: '壬', elem: '水', weight: 0.40 },
        { stem: '戊', elem: '土', weight: 0.10 }
      ];
    }

    // 未 (Wei) 在木局中的化育
    if (branch === '未' && (sanHeWood || banHeWood)) {
      dist = [
        { stem: '乙', elem: '木', weight: 0.55 },
        { stem: '己', elem: '土', weight: 0.30 },
        { stem: '丁', elem: '火', weight: 0.15 }
      ];
    }

    // 戌 (Xu) 在火局中的化育
    if (branch === '戌' && (sanHeFire || banHeFire)) {
      dist = [
        { stem: '丁', elem: '火', weight: 0.55 },
        { stem: '戊', elem: '土', weight: 0.30 },
        { stem: '辛', elem: '金', weight: 0.15 }
      ];
    }

    return dist;
  }

  // 計算地支能量
  const bList = [
    { branch: month.branch, w: branchWeights.month },
    { branch: day.branch, w: branchWeights.day },
    { branch: hour.branch, w: branchWeights.hour },
    { branch: year.branch, w: branchWeights.year }
  ];

  bList.forEach(item => {
    const dist = getDynamicBranchDistribution(item.branch);
    dist.forEach((d: any) => {
      scores[d.elem as '木' | '火' | '土' | '金' | '水'] += item.w * d.weight;
    });
  });

  // -------------------------------------------------------------
  // 第四維度：天干通關、阻隔與通根檢測 (Stem Rooting)
  // -------------------------------------------------------------
  function checkStemRooted(stem: string) {
    const sElem = STEM_TO_ELEM[stem];
    return allBranches.some(b => {
      const h = ZHI_STANDARD_CANGGAN[b] || [];
      return h.some(cg => cg.elem === sElem && cg.weight >= 0.12);
    });
  }

  const sList = [
    { stem: month.stem, w: stemWeights.month },
    { stem: hour.stem, w: stemWeights.hour },
    { stem: year.stem, w: stemWeights.year }
  ];

  sList.forEach(item => {
    const sElem = STEM_TO_ELEM[item.stem];
    let weight = item.w;
    if (checkStemRooted(item.stem)) {
      weight *= 1.15; // 通根加成 1.15x
    } else {
      weight *= 0.85; // 虛浮折減 0.85x
    }
    scores[sElem] += weight;
  });

  // -------------------------------------------------------------
  // 第二維度：得地（日支貼身專位帝旺/臨官與長生源流加成）
  // -------------------------------------------------------------
  const dayPillarStr = `${day.stem}${day.branch}`;
  let specialBonus = 0;
  if (ZHUAN_WANG_PILLARS.includes(dayPillarStr)) {
    // 專位帝旺/臨官: 壬子、丁巳、丙午、癸亥等，日支為專位強根，給予 +7 分專位氣勢
    specialBonus += 7;
    combinationNotes.push(`日柱【${dayPillarStr}】日坐專位強根帝旺／臨官，底氣充盈抗壓性極強`);
  }

  // 長生源頭印生加成 (如壬水見申金長生、丙火見寅木長生)
  if (dmElem === '水' && (hour.branch === '申' || month.branch === '申')) {
    specialBonus += 3;
    combinationNotes.push('逢申金長生水源不斷，得印星長生加持');
  }
  if (dmElem === '火' && (hour.branch === '寅' || month.branch === '寅')) {
    specialBonus += 3;
    combinationNotes.push('逢寅木長生火源源流，得印星生扶加持');
  }
  if (dmElem === '木' && (hour.branch === '亥' || month.branch === '亥')) {
    specialBonus += 3;
    combinationNotes.push('逢亥水長生木氣舒展');
  }
  if (dmElem === '金' && (hour.branch === '巳' || month.branch === '辰')) {
    specialBonus += 3;
    combinationNotes.push('逢濕土金旺生身加持');
  }

  scores[dmElem] += specialBonus;

  // -------------------------------------------------------------
  // 第三維度：得令檢測（四季進氣退氣）
  // -------------------------------------------------------------
  const monthDist = getDynamicBranchDistribution(month.branch);
  const deLing = monthDist.some((cg: any) => (cg.elem === dmElem || cg.elem === motherElem) && cg.weight >= 0.25);
  const deDi = (ZHI_STANDARD_CANGGAN[day.branch] || []).some(cg => cg.elem === dmElem || cg.elem === motherElem);
  const deSheng = allStems.slice(0, 3).some((s, i) => i !== 2 && (STEM_TO_ELEM[s] === dmElem || STEM_TO_ELEM[s] === motherElem));

  // 總分歸一化 (100 分制)
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const normalizedScores: Record<'木' | '火' | '土' | '金' | '水', number> = {
    '木': Math.round((scores['木'] / total) * 100),
    '火': Math.round((scores['火'] / total) * 100),
    '土': Math.round((scores['土'] / total) * 100),
    '金': Math.round((scores['金'] / total) * 100),
    '水': Math.round((scores['水'] / total) * 100),
  };

  // 同黨總分 (日主五行 + 印星五行)
  const allyScore = normalizedScores[dmElem] + normalizedScores[motherElem];

  // 評定等級（嚴格符合使用者 100 分制標準）
  // 45~55 分為中和，>55 為身強，<45 為身弱，>80 為從強/專旺，<20 為從弱
  let level: '極旺' | '偏旺' | '中和' | '偏弱' | '極弱' = '中和';
  let levelDetail = '中和平衡';

  if (allyScore >= 80) {
    level = '極旺';
    levelDetail = '專旺／從強';
  } else if (allyScore > 55) {
    level = '偏旺';
    levelDetail = allyScore <= 62 ? '中和偏強／底氣充沛' : '身強／氣勢充沛';
  } else if (allyScore >= 45) {
    level = '中和';
    levelDetail = allyScore >= 50 ? '中和偏強／氣候平和' : '中和偏弱／進退有度';
  } else if (allyScore >= 20) {
    level = '偏弱';
    levelDetail = '身弱／需印比生扶';
  } else {
    level = '極弱';
    levelDetail = '從弱／極弱';
  }

  const description = `日主【${dm}${dmElem}】在動態合化與氣勢修正模型中得分 ${allyScore} 分。判定為【${levelDetail}】。${
    deLing ? '得月令提綱之生助，' : '失月令生扶（雖失令然需考量地支合局），'
  }${
    deDi ? '坐支通根穩固，' : '坐支無專位根，'
  }${
    combinationNotes.length > 0 ? combinationNotes.join('、') + '。' : ''
  }`;

  return {
    score: allyScore,
    level,
    levelDetail,
    dmElem,
    motherElem,
    deLing,
    deDi,
    deSheng,
    normalizedElements: {
      wood: normalizedScores['木'],
      fire: normalizedScores['火'],
      earth: normalizedScores['土'],
      metal: normalizedScores['金'],
      water: normalizedScores['水']
    },
    combinationNotes,
    description,
    detailDescription: description
  };
}
