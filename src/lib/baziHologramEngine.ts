/**
 * 子平八字動態五行精密量化與時空基因中醫健康演算法 (Modern Bazi Hologram Engine)
 * 知識底座源自：《子平八字時空全息論》、《命理健康與五運六氣通考》
 * （嚴格去除所有個人姓名，純粹現代客觀量化與正統子平學術傳承）
 */

import type { BaziData } from '../types';

export interface ElementQuantitativeMetric {
  element: '金' | '木' | '水' | '火' | '土';
  percentage: number; // 0..100
  powerScore: number;
  status: '極旺' | '偏旺' | '適中' | '偏弱' | '極弱';
  color: string;
}

export interface DayMasterStrength {
  dayMaster: string; // 甲、乙...
  element: string; // 木...
  score: number; // 0..100
  level: '從格/極弱' | '身偏弱' | '身中和' | '身偏強' | '專旺/極旺';
  deLing: boolean; // 是否得令（月令生助）
  deDi: boolean; // 是否得地（地支通根）
  deSheng: boolean; // 是否得生得助（天干印比）
  description: string;
}

export interface FourGodsSystem {
  fuYiGod: {
    xiYong: string[]; // 喜用神五行
    jiShen: string[]; // 忌神五行
    explanation: string;
  };
  tiaoHouGod: {
    needed: boolean;
    mainGod: string; // 調候之神
    seasonClimate: string;
    explanation: string;
  };
  tongGuanGod: {
    needed: boolean;
    conflictPair?: string;
    mediator?: string;
    explanation: string;
  };
  bingYaoGod: {
    disease: string; // 命局之病
    medicine: string; // 歲運之藥
    explanation: string;
  };
}

export interface HolisticHealthProfile {
  vulnerableOrgan: string;
  meridianRisk: string;
  fiveZangWarning: string;
  dietaryRemedy: string;
  lifestyleGuidance: string;
}

export interface BaziHologramAnalysisResult {
  elements: ElementQuantitativeMetric[];
  dayMasterStrength: DayMasterStrength;
  fourGods: FourGodsSystem;
  healthProfile: HolisticHealthProfile;
  synthesisText: string;
}

// 地支藏干與力量權重表 (本氣: 1.0, 中氣: 0.5, 餘氣: 0.25)
const BRANCH_CANGGAN_WEIGHTS: Record<string, Array<{ stem: string; weight: number; elem: '金' | '木' | '水' | '火' | '土' }>> = {
  '子': [{ stem: '癸', weight: 1.0, elem: '水' }],
  '丑': [{ stem: '己', weight: 0.6, elem: '土' }, { stem: '癸', weight: 0.3, elem: '水' }, { stem: '辛', weight: 0.2, elem: '金' }],
  '寅': [{ stem: '甲', weight: 0.7, elem: '木' }, { stem: '丙', weight: 0.3, elem: '火' }, { stem: '戊', weight: 0.1, elem: '土' }],
  '卯': [{ stem: '乙', weight: 1.0, elem: '木' }],
  '辰': [{ stem: '戊', weight: 0.6, elem: '土' }, { stem: '乙', weight: 0.3, elem: '木' }, { stem: '癸', weight: 0.2, elem: '水' }],
  '巳': [{ stem: '丙', weight: 0.7, elem: '火' }, { stem: '戊', weight: 0.2, elem: '土' }, { stem: '庚', weight: 0.2, elem: '金' }],
  '午': [{ stem: '丁', weight: 0.7, elem: '火' }, { stem: '己', weight: 0.3, elem: '土' }],
  '未': [{ stem: '己', weight: 0.6, elem: '土' }, { stem: '丁', weight: 0.3, elem: '火' }, { stem: '乙', weight: 0.2, elem: '木' }],
  '申': [{ stem: '庚', weight: 0.7, elem: '金' }, { stem: '壬', weight: 0.3, elem: '水' }, { stem: '戊', weight: 0.1, elem: '土' }],
  '酉': [{ stem: '辛', weight: 1.0, elem: '金' }],
  '戌': [{ stem: '戊', weight: 0.6, elem: '土' }, { stem: '辛', weight: 0.3, elem: '金' }, { stem: '丁', weight: 0.2, elem: '火' }],
  '亥': [{ stem: '壬', weight: 0.7, elem: '水' }, { stem: '甲', weight: 0.3, elem: '木' }]
};

const STEM_TO_ELEM: Record<string, '金' | '木' | '水' | '火' | '土'> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
};

export function computeBaziHologram(bazi: BaziData): BaziHologramAnalysisResult {
  const fourPillars = [bazi.year, bazi.month, bazi.day, bazi.hour];
  const monthBranch = bazi.month.branch;
  const dayStem = bazi.day.stem;
  const dmElem = STEM_TO_ELEM[dayStem] || '木';

  // 1. 動態精密量化計算五行能量
  const rawScores: Record<'金' | '木' | '水' | '火' | '土', number> = {
    '金': 0, '木': 0, '水': 0, '火': 0, '土': 0
  };

  // 天干分數 (透干各給 10 分)
  fourPillars.forEach(p => {
    const elem = STEM_TO_ELEM[p.stem];
    if (elem) rawScores[elem] += 10;
  });

  // 月令提綱加權 (月令權重高達 45 分)
  const monthCangGan = BRANCH_CANGGAN_WEIGHTS[monthBranch] || [];
  monthCangGan.forEach(cg => {
    rawScores[cg.elem] += cg.weight * 45;
  });

  // 年日時支通根加權 (年支20分、日支25分、時支20分)
  const branchWeights = [
    { b: bazi.year.branch, w: 20 },
    { b: bazi.day.branch, w: 25 },
    { b: bazi.hour.branch, w: 20 }
  ];

  branchWeights.forEach(item => {
    const cgs = BRANCH_CANGGAN_WEIGHTS[item.b] || [];
    cgs.forEach(cg => {
      rawScores[cg.elem] += cg.weight * item.w;
    });
  });

  const totalRaw = Object.values(rawScores).reduce((a, b) => a + b, 0);
  const elements: ElementQuantitativeMetric[] = (['木', '火', '土', '金', '水'] as const).map(elem => {
    const score = rawScores[elem];
    const pct = totalRaw > 0 ? Math.round((score / totalRaw) * 100) : 20;
    let status: ElementQuantitativeMetric['status'] = '適中';
    if (pct >= 38) status = '極旺';
    else if (pct >= 26) status = '偏旺';
    else if (pct <= 8) status = '極弱';
    else if (pct <= 14) status = '偏弱';

    const colors = {
      '木': '#22c55e',
      '火': '#ef4444',
      '土': '#f59e0b',
      '金': '#94a3b8',
      '水': '#3b82f6'
    };

    return {
      element: elem,
      percentage: pct,
      powerScore: Math.round(score),
      status,
      color: colors[elem]
    };
  });

  // 2. 日主強弱精密判定
  // 同黨（比劫＋印星）
  const shengDmElem: Record<'金' | '木' | '水' | '火' | '土', '金' | '木' | '水' | '火' | '土'> = {
    '木': '水', '火': '木', '土': '火', '金': '土', '水': '金'
  };
  const friendElem = dmElem;
  const motherElem = shengDmElem[dmElem];

  const friendPct = elements.find(e => e.element === friendElem)?.percentage || 0;
  const motherPct = elements.find(e => e.element === motherElem)?.percentage || 0;
  const allyScore = friendPct + motherPct; // 同黨總百分比

  const deLing = (BRANCH_CANGGAN_WEIGHTS[monthBranch] || []).some(cg => cg.elem === dmElem || cg.elem === motherElem);
  const deDi = (BRANCH_CANGGAN_WEIGHTS[bazi.day.branch] || []).some(cg => cg.elem === dmElem);
  const deSheng = fourPillars.some((p, i) => i !== 2 && (STEM_TO_ELEM[p.stem] === dmElem || STEM_TO_ELEM[p.stem] === motherElem));

  let strengthLevel: DayMasterStrength['level'] = '身中和';
  if (allyScore >= 75) strengthLevel = '專旺/極旺';
  else if (allyScore >= 52) strengthLevel = '身偏強';
  else if (allyScore <= 15) strengthLevel = '從格/極弱';
  else if (allyScore <= 38) strengthLevel = '身偏弱';

  const dayMasterStrength: DayMasterStrength = {
    dayMaster: dayStem,
    element: dmElem,
    score: allyScore,
    level: strengthLevel,
    deLing,
    deDi,
    deSheng,
    description: `日主【${dayStem}${dmElem}】在八字動態模型中綜合得分 ${allyScore} 分。判定為【${strengthLevel}】。${deLing ? '得月令提綱之生助，' : '失月令生扶，'}${deDi ? '坐支通根穩固，' : '坐支無強根，'}${deSheng ? '天干透印比相助。' : '天干少幫扶。'}`
  };

  // 3. 四大用神判定
  // 扶抑用神
  let xiYong: string[] = [];
  let jiShen: string[] = [];
  let fuYiExp = '';
  if (strengthLevel === '身偏強' || strengthLevel === '專旺/極旺') {
    xiYong = ['食傷洩秀', '財星耗身', '官殺制身'];
    jiShen = ['印綬生身', '比劫助旺'];
    fuYiExp = `日主偏強，局中比印力量充足，最喜食傷洩秀以發揮才智、財星以成巨富、官殺以建功名；忌再逢印比重疊助長過度剛強。`;
  } else {
    xiYong = ['印綬生身', '比劫幫扶'];
    jiShen = ['官殺剋伐', '財星重壓', '食傷過耗'];
    fuYiExp = `日主偏弱，先天精力消耗較快，首喜正偏印以滋潤生扶（讀書學習、貴人相助）、比肩劫財以結集同儕資源；忌官殺重剋與過度操勞破耗。`;
  }

  // 調候用神
  let tiaoHouNeed = false;
  let tiaoHouGod = '';
  let seasonClimate = '';
  let tiaoHouExp = '';
  const winterBranches = ['亥', '子', '丑'];
  const summerBranches = ['巳', '午', '未'];

  if (winterBranches.includes(monthBranch)) {
    tiaoHouNeed = true;
    tiaoHouGod = '丙丁巳午火（解凍暖局）';
    seasonClimate = '隆冬寒水結冰';
    tiaoHouExp = `生於寒冬之際，局中金寒水凍，萬物生機閉鎖。調候急於扶抑！命局首重火神（丙丁火或東南方）以解凍暖局，見火則萬物欣欣向榮。`;
  } else if (summerBranches.includes(monthBranch)) {
    tiaoHouNeed = true;
    tiaoHouGod = '壬癸亥子水（降溫潤土）';
    seasonClimate = '盛夏火炎土燥';
    tiaoHouExp = `生於盛夏炎暑，天地烈火蒸騰、燥土脆金。首取壬癸水以涵養生機，得水潤澤則水火相濟、神清氣爽。`;
  } else {
    tiaoHouExp = `生於春秋溫和之月，氣候中正，調候需求不迫，專注於扶抑平衡與行運流通即可。`;
  }

  // 通關用神
  let tongGuanNeed = false;
  let conflictPair = '';
  let mediator = '';
  let tongGuanExp = '';
  const jinPct = elements.find(e => e.element === '金')?.percentage || 0;
  const muPct = elements.find(e => e.element === '木')?.percentage || 0;
  const shuiPct = elements.find(e => e.element === '水')?.percentage || 0;
  const huoPct = elements.find(e => e.element === '火')?.percentage || 0;

  if (jinPct >= 28 && muPct >= 28) {
    tongGuanNeed = true;
    conflictPair = '金木相戰（刀砍林木）';
    mediator = '水（金生水，水生木）';
    tongGuanExp = `局中金木兩強對峙，主神經緊繃或骨骼四肢挫傷，喜見水神引化金氣以滋潤木性。`;
  } else if (shuiPct >= 28 && huoPct >= 28) {
    tongGuanNeed = true;
    conflictPair = '水火相剋（未濟交戰）';
    mediator = '木（水生木，木生火）';
    tongGuanExp = `局中水火勢均力敵，主心腎不交或情緒忽冷忽熱，喜見木神作為綠色通關橋樑。`;
  } else {
    tongGuanExp = `原局五行對峙張力尚在可控範圍，未現極端兩神交戰之凶象。`;
  }

  // 病藥用神
  const maxElem = [...elements].sort((a, b) => b.percentage - a.percentage)[0];
  const bingYao = {
    disease: `${maxElem.element}氣過盛（佔比達 ${maxElem.percentage}%）`,
    medicine: `${shengDmElem[maxElem.element]}或剋制${maxElem.element}之五行`,
    explanation: `命局中五行最偏枯過旺之處即為「病」。歲運逢抑制此病之五行即為「良藥」，得藥之年必迎來事業突破。`
  };

  const fourGods: FourGodsSystem = {
    fuYiGod: {
      xiYong,
      jiShen,
      explanation: fuYiExp
    },
    tiaoHouGod: {
      needed: tiaoHouNeed,
      mainGod: tiaoHouGod || '氣候平和無特殊調候',
      seasonClimate: seasonClimate || '溫和氣候',
      explanation: tiaoHouExp
    },
    tongGuanGod: {
      needed: tongGuanNeed,
      conflictPair,
      mediator,
      explanation: tongGuanExp
    },
    bingYaoGod: bingYao
  };

  // 4. 時空基因五運六氣中醫體質健康卡
  let organ = '';
  let meridian = '';
  let zangWarning = '';
  let dietary = '';
  let lifestyle = '';

  if (maxElem.element === '木' || muPct <= 10) {
    organ = '肝膽系統與自律神經';
    meridian = '足厥陰肝經、足少陽膽經';
    zangWarning = '木主疏泄與筋脈。木氣過旺易肝氣鬱結橫逆、頭部眩暈、眼睛乾澀；過弱則膽氣虛怯、易驚恐多慮。';
    dietary = '宜多食深綠色蔬菜、菊花茶、枸杞、白芍。少飲濃烈白酒。';
    lifestyle = '夜間 23:00 前入睡以養肝血，每日進行柔和拉筋伸展運動。';
  } else if (maxElem.element === '火' || huoPct <= 10) {
    organ = '心血管與小腸系統';
    meridian = '手少陰心經、手太陽小腸經';
    zangWarning = '火主神明與血脈。火炎易心悸失眠、血壓偏高、口腔生瘡；火熄則陽氣不足、四肢冰冷心悸。';
    dietary = '宜食苦瓜、蓮子芯、紅豆、酸棗仁以清心安神，夏日切忌暴飲冰飲。';
    lifestyle = '中午閉目小憩 20 分鐘以養心氣，培養靜坐冥想習慣以平息心浮氣躁。';
  } else if (maxElem.element === '土' || elements.find(e => e.element === '土')!.percentage <= 10) {
    organ = '脾胃與消化運化系統';
    meridian = '足太陰脾經、足陽明胃經';
    zangWarning = '土主肌肉與運化。土盛濕滯易腹脹納呆、痰濕過重；土虛則脾胃虛弱、運化不良消瘦。';
    dietary = '宜食山藥、茯苓、芡實、四神湯等甘淡健脾之品，忌生冷寒涼與過量甜食。';
    lifestyle = '三餐定時定量，細嚼慢嚥，飯後散步百步以助脾氣運化。';
  } else if (maxElem.element === '金' || jinPct <= 10) {
    organ = '肺部呼吸系統與大腸皮毛';
    meridian = '手太陰肺經、手陽明大腸經';
    zangWarning = '金主肅降與衛氣。金氣過燥易咽喉乾咳、皮膚敏弱；金虛則肺衛不固、容易感冒畏寒。';
    dietary = '宜食百合、銀耳、白蘿蔔、杏仁以潤肺生津，秋冬宜防燥熱飲食。';
    lifestyle = '常做深層腹式呼吸，保持室內濕度適宜，早晚防風保暖以固護衛表。';
  } else {
    organ = '腎臟、泌尿與生殖骨髓系統';
    meridian = '足少陰腎經、足太陽膀胱經';
    zangWarning = '水主藏精與骨髓。水涸易腰膝酸軟、脫髮健忘、耳鳴；水氾則水腫體寒、陽氣萎頓。';
    dietary = '宜食黑芝麻、黑豆、核桃、桑椹以滋水涵木，日常飲水適量不暴飲。';
    lifestyle = '睡前以溫熱水泡腳引火歸元，戒除熬夜耗傷腎陰，冬日注重腰部防寒保暖。';
  }

  const healthProfile: HolisticHealthProfile = {
    vulnerableOrgan: organ,
    meridianRisk: meridian,
    fiveZangWarning: zangWarning,
    dietaryRemedy: dietary,
    lifestyleGuidance: lifestyle
  };

  const synthesis = `本命子平全息模型採用現代動態量化演算法，月令提綱與地支藏干權重精密計算。日主【${dayStem}${dmElem}】綜合判定為【${strengthLevel}】。五行之中以【${maxElem.element}】力量最雄厚（佔比 ${maxElem.percentage}%）。四大用神中，扶抑最喜【${xiYong.join('、')}】，${tiaoHouNeed ? `調候急需【${tiaoHouGod}】，` : ''}${tongGuanNeed ? `通關喜【${mediator}】以化解對峙。` : ''}中醫時空基因提示首要固護【${organ}】，順應天地運化，則福壽綿長。`;

  return {
    elements,
    dayMasterStrength,
    fourGods,
    healthProfile,
    synthesisText: synthesis
  };
}
