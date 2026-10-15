/**
 * 子平八字動態五行精密量化與時空基因中醫健康演算法 (Modern Bazi Hologram Engine)
 * 知識底座源自：《子平八字時空全息論》、《命理健康與五運六氣通考》
 * （嚴格去除所有個人姓名，純粹現代客觀量化與正統子平學術傳承）
 */

import type { BaziData } from '../types';
import { calculateDynamicBaziStrength } from './baziStrengthEngine';

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

export interface FeynmanCompanyModel {
  founderRole: string; // 創始人角色 (CEO)
  coreBusinessModel: string; // 商業運營模型
  companyHierarchy: {
    boardAndCompliance: string; // 官殺：董事會監管與法規防火牆
    rAndDAndPatents: string; // 印星：專利研發智庫與品牌商譽
    capitalAndCashflow: string; // 財星：現金流與商業版圖擴張
    innovationAndMarketing: string; // 食傷：產品創新與公關爆款
    partnersAndDistribution: string; // 比劫：合夥同盟與渠道分銷
  };
  operationalAdvice: string; // 企業商業模式診斷與改進方針
}

export interface QiongTongComfortGuide {
  thermodynamicComfortScore: number; // 0..100 舒適度評分
  climateStatus: '極寒冰封' | '極炎燥熱' | '氣候溫潤' | '土燥濕滯';
  seasonThermodynamics: string; // 生物熱力學深度剖析
  classicalFormula: string; // 《窮通寶鑑》黃金調候救贖神
  lifeGuidance: {
    ambientTemperature: string; // 居住環境與溫濕度建議
    dietaryHarmony: string; // 五行飲食調和
    emotionalRelief: string; // 心理與壓力調候心法
  };
}

export interface BaziHologramAnalysisResult {
  elements: ElementQuantitativeMetric[];
  dayMasterStrength: DayMasterStrength;
  fourGods: FourGodsSystem;
  healthProfile: HolisticHealthProfile;
  companyModel: FeynmanCompanyModel;
  comfortGuide: QiongTongComfortGuide;
  synthesisText: string;
}

const STEM_TO_ELEM: Record<string, '金' | '木' | '水' | '火' | '土'> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
};

export function computeBaziHologram(bazi: BaziData): BaziHologramAnalysisResult {
  const monthBranch = bazi.month.branch;
  const dayStem = bazi.day.stem;
  const dmElem = STEM_TO_ELEM[dayStem] || '木';

  // 1. 動態精密量化計算五行能量與動態旺衰 (四維度合化演算法)
  const dynamicStrength = calculateDynamicBaziStrength({
    year: bazi.year,
    month: bazi.month,
    day: bazi.day,
    hour: bazi.hour
  });

  const colors = {
    '木': '#22c55e',
    '火': '#ef4444',
    '土': '#f59e0b',
    '金': '#94a3b8',
    '水': '#3b82f6'
  };

  const elemKeyMap: Record<'木' | '火' | '土' | '金' | '水', keyof typeof dynamicStrength.normalizedElements> = {
    '木': 'wood',
    '火': 'fire',
    '土': 'earth',
    '金': 'metal',
    '水': 'water'
  };

  const elements: ElementQuantitativeMetric[] = (['木', '火', '土', '金', '水'] as const).map(elem => {
    const pct = dynamicStrength.normalizedElements[elemKeyMap[elem]];
    let status: ElementQuantitativeMetric['status'] = '適中';
    if (pct >= 38) status = '極旺';
    else if (pct >= 26) status = '偏旺';
    else if (pct <= 8) status = '極弱';
    else if (pct <= 14) status = '偏弱';

    return {
      element: elem,
      percentage: pct,
      powerScore: pct,
      status,
      color: colors[elem]
    };
  });

  // 2. 日主強弱精密判定 (100 分制標準)
  const allyScore = dynamicStrength.score;
  let strengthLevel: DayMasterStrength['level'] = '身中和';
  if (allyScore >= 80) strengthLevel = '專旺/極旺';
  else if (allyScore > 55) strengthLevel = '身偏強';
  else if (allyScore >= 45) strengthLevel = '身中和';
  else if (allyScore >= 20) strengthLevel = '身偏弱';
  else strengthLevel = '從格/極弱';

  const dayMasterStrength: DayMasterStrength = {
    dayMaster: dayStem,
    element: dmElem,
    score: allyScore,
    level: strengthLevel,
    deLing: dynamicStrength.deLing,
    deDi: dynamicStrength.deDi,
    deSheng: dynamicStrength.deSheng,
    description: dynamicStrength.description
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
  const MEDICINE_MAP: Record<'金' | '木' | '水' | '火' | '土', string> = {
    '木': '金（官殺制木）或火（食傷洩秀）',
    '火': '水（官殺滅火）或土（食傷洩火）',
    '土': '木（官殺疏土）或金（食傷洩秀）',
    '金': '火（官殺煉金）或水（食傷洩秀）',
    '水': '土（官殺阻水）或木（食傷洩秀）'
  };
  const bingYao = {
    disease: `${maxElem.element}氣過盛（佔比達 ${maxElem.percentage}%）`,
    medicine: MEDICINE_MAP[maxElem.element] || '剋洩制化之五行',
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

  // 5. 子平十神現代心智模型：公司體制與商業架構 (Feynman Company Model)
  let coreBizModel = '資本運作與現金流分銷模型';
  let opAdvice = '';
  if (['寅', '卯', '巳', '午'].includes(monthBranch) && (shuiPct <= 15 || jinPct <= 15)) {
    coreBizModel = '技術產品創新與爆款研發模型 (食傷生財/智識變現)';
    opAdvice = '公司研發部（食傷）產能旺盛，但極度欠缺風控合規（印星）與長期現金儲備（水）。切忌擴張太快導致資金鏈緊繃，必須引入冷靜客觀的財務總監設立停損點。';
  } else if (['申', '酉', '亥', '子'].includes(monthBranch) && (huoPct <= 15 || muPct <= 15)) {
    coreBizModel = '合規體制深耕與品牌商譽模型 (官印相生/特許經營)';
    opAdvice = '公司擁有極高政策門檻或專利技術（印星），底層基礎穩固。但市場行銷與產品熱度（火木）較為保守，宜大膽開拓年輕化新渠道，避免因過度謹慎而錯失時代風口。';
  } else if (['辰', '戌', '丑', '未'].includes(monthBranch)) {
    coreBizModel = '資源整合與合夥平台裂變模型 (雜氣承載/生態協同)';
    opAdvice = '公司宛如大型孵化器或平台型企業，容納各方資源（土庫重疊）。核心在於股權激勵機制要透明清晰，切忌權責不明、多頭管理，以制度化流程代替人情羈絆。';
  } else {
    coreBizModel = '穩健價值投資與實業經營模型 (身財兩停/實幹興邦)';
    opAdvice = '商業模式健康平衡，具備穩健穿越經濟週期的能力。專注於本業護城河的精細化運營，避免跨界涉足自身看不懂的高槓桿金融投機。';
  }

  const companyModel: FeynmanCompanyModel = {
    founderRole: `身主【${dayStem}${dmElem}】· 創始人兼首席執行官 (CEO) - ${strengthLevel}`,
    coreBusinessModel: coreBizModel,
    companyHierarchy: {
      boardAndCompliance: `【官殺（${jinPct}% 權重）】：董事會法規合規與外部危機特種部隊。${jinPct > 25 ? '監管與法規壓力沈重，需注重合規合法。' : '外部束縛較少，自主探索空間大。'}`,
      rAndDAndPatents: `【印星（${shuiPct}% 權重）】：技術專利智庫與商譽防火牆。${shuiPct > 20 ? '專利儲備豐厚，後盾堅實。' : '欠缺體制庇護，需靠自身自力更生。'}`,
      capitalAndCashflow: `【財星（${huoPct}% 權重）】：企業日常現金流與商業版圖擴張。${huoPct > 25 ? '市場商機無限，資金週轉頻繁。' : '財源需深耕細作，重在細水長流。'}`,
      innovationAndMarketing: `【食傷（${muPct}% 權重）】：產品創新實驗室與公關傳播引擎。${muPct > 20 ? '創意爆發力強，能快速引爆市場。' : '行事求穩，偏好成熟商業模式。'}`,
      partnersAndDistribution: `【比劫（${elements.find(e => e.element === dmElem)?.percentage || 20}% 權重）】：聯合創始人與渠道裂變戰隊。${allyScore > 55 ? '個人號召力強，能統御大兵團作戰。' : '宜借助強勢合夥人，採用合縱連橫之策。'}`
    },
    operationalAdvice: opAdvice
  };

  // 6. 《窮通寶鑑》寒暖燥濕生態熱力學舒適度全鑑 (Qiong Tong Comfort Guide)
  let climateStatus: QiongTongComfortGuide['climateStatus'] = '氣候溫潤';
  let thermoScore = 80;
  let seasonThermo = '';
  let classicalFormula = '';
  let ambientTemp = '保持室內 22-25°C，定時開窗通風';
  let dietaryHarm = '飲食五行均衡，順應時節多食新鮮蔬果';
  let emotionalRelief = '維持規律運動與作息，每日定時靜思';

  if (['亥', '子', '丑'].includes(monthBranch)) {
    climateStatus = '極寒冰封';
    thermoScore = huoPct >= 15 ? 85 : 55;
    seasonThermo = '西伯利亞冰原生態：北半球太陽能量匱乏，水結成冰，木氣凝滯。日主身處極寒時空，生命第一救贖之神為「丙火太陽核聚變解凍」！若缺丙火，易陷入抑鬱體寒、勞碌而身心焦慮。';
    classicalFormula = '《窮通寶鑑》：冬月嚴寒，非丙火不解其凍。丙火有根高透，則解凍開春、富貴安泰；若缺火而格成，亦是冰雪原野上奔波受凍。';
    ambientTemp = '居所務必注重保暖防寒，冬季室溫維持 22°C 以上，避免長期處於陰冷潮濕地下室或背陽處。';
    dietaryHarm = '多食溫補甘溫之品（生薑、肉桂、紅棗、羊肉、桂圓），忌過食刺身冰鎮飲料與生冷瓜果。';
    emotionalRelief = '多曬清晨 8-10 點陽光以振奮胸陽氣魄，多參與熱烈溫馨之社群交流，以光明之火驅散內在孤寒。';
  } else if (['巳', '午', '未'].includes(monthBranch)) {
    climateStatus = '極炎燥熱';
    thermoScore = (shuiPct >= 15 && jinPct >= 12) ? 88 : 58;
    seasonThermo = '撒哈拉熱力學沙漠生態：地表達到沸點，草木焦枯。急需「壬癸水甘霖」滋潤，更需「庚辛金作為源頭活水」持續生發！缺金水則心浮氣躁、易有心腦血管隱患。';
    classicalFormula = '《窮通寶鑑》：夏令炎烈，非壬癸不潤其燥，非庚辛不發其源。水源不斷，方能身心舒暢、福祿綿長。';
    ambientTemp = '室內保持清涼通風與適度濕度（50%-60%），夏日冷氣配合加濕器，避免過度乾燥。';
    dietaryHarm = '多食綠豆百合蓮子、冬瓜湯、烏梅汁、酸梅湯生津止渴，切忌通宵暴飲辛辣燒烤或酗酒。';
    emotionalRelief = '每日靜坐冥想 15 分鐘以平息心火急躁，修習「泰山崩於前而色不變」之定力，心靜自然涼。';
  } else if (['辰', '戌', '丑', '未'].includes(monthBranch)) {
    climateStatus = '土燥濕滯';
    thermoScore = 75;
    seasonThermo = '四季雜氣土承載生態：土重濕滯或土燥生塵，水火轉換交替。需木氣疏通土壤以行生氣，金水火相互通融，方得舒適之境。';
    classicalFormula = '《窮通寶鑑》：雜氣月中藏萬象，土旺得木疏方能成林，水火互濟乃定安泰。';
    ambientTemp = '注重居家防潮除濕與空氣流通，避免梅雨潮濕季節室內發霉滋生細菌。';
    dietaryHarm = '宜食四神湯、山藥、茯苓、芡實、薏仁以健脾化濕，三餐定時不過飽。';
    emotionalRelief = '維持生活作息規律，避免長時間過度反芻焦慮，多親近大自然森林散步。';
  } else {
    climateStatus = '氣候溫潤';
    thermoScore = 88;
    seasonThermo = '天地陰陽交泰溫和生態：寒暖適中，萬物生長肅降得宜。熱力學生態自然暢達，重點在於五行生剋不至偏頗過度。';
    classicalFormula = '《窮通寶鑑》：春秋交替，氣候均和，順時應物，水火中正，最利身心調暢。';
    ambientTemp = '隨四季早晚溫差適時增減衣物，春防風邪、秋防涼燥，常保居處陽光通暢。';
    dietaryHarm = '順應時令進食當季蔬果，春食芽菜疏肝，秋食雪梨百合潤燥。';
    emotionalRelief = '多接觸自然山水與人文藝術，修持中庸之德，身心長保平和淡泊。';
  }

  const comfortGuide: QiongTongComfortGuide = {
    thermodynamicComfortScore: thermoScore,
    climateStatus,
    seasonThermodynamics: seasonThermo,
    classicalFormula,
    lifeGuidance: {
      ambientTemperature: ambientTemp,
      dietaryHarmony: dietaryHarm,
      emotionalRelief
    }
  };

  const synthesis = `本命子平全息模型採用現代動態量化演算法，月令提綱與地支藏干權重精密計算。日主【${dayStem}${dmElem}】綜合判定為【${strengthLevel}】。五行之中以【${maxElem.element}】力量最雄厚（佔比 ${maxElem.percentage}%）。四大用神中，扶抑最喜【${xiYong.join('、')}】，${tiaoHouNeed ? `調候急需【${tiaoHouGod}】，` : ''}${tongGuanNeed ? `通關喜【${mediator}】以化解對峙。` : ''}十神商業架構診斷為【${coreBizModel}】，《窮通寶鑑》氣候舒適度評分【${thermoScore}/100】，中醫時空基因提示首要固護【${organ}】，身心調泰則萬事興隆。`;

  return {
    elements,
    dayMasterStrength,
    fourGods,
    healthProfile,
    companyModel,
    comfortGuide,
    synthesisText: synthesis
  };
}
