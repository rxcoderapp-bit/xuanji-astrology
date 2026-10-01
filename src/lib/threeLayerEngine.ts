/**
 * 紫微斗數三層疊宮時空穿梭演算法 (Three-Layer Overlapping Astrolabe Engine)
 * 知識底座源自：《紫微現代解盤邏輯全書》、《紫微星曜三層疊宮法》
 * （嚴格去除所有個人姓名，純粹正統現代紫微解盤架構）
 */

import type { PalaceData, HoroscopeState } from '../types';

export interface LayerPalaceInfo {
  layer: 'natal' | 'decadal' | 'yearly';
  layerTitle: string;
  palaceName: string;
  earthlyBranch: string;
  heavenlyStem: string;
  majorStars: string[];
  mutagens: string[];
  roleDescription: string;
}

export interface MutagenCollisionAlert {
  type: 'double_lu' | 'double_ji' | 'lu_ji_clash' | 'triple_auspicious' | 'ji_chong_lu' | 'safe';
  level: 'high_blessing' | 'high_warning' | 'medium_caution' | 'neutral';
  title: string;
  affectedPalace: string;
  description: string;
  strategicAdvice: string;
}

export interface ThreeLayerPalaceAnalysis {
  palaceIndex: number;
  earthlyBranch: string;
  natalLayer: LayerPalaceInfo;
  decadalLayer: LayerPalaceInfo;
  yearlyLayer: LayerPalaceInfo;
  combinedMeaning: string;
  coreLifeTheme: string;
}

export interface ThreeLayerAnalysisResult {
  currentDecadeName: string;
  currentYearNumber: number;
  currentYearGanZhi: string;
  palaceOverlaps: ThreeLayerPalaceAnalysis[];
  collisionAlerts: MutagenCollisionAlert[];
  threeLayerSynthesisText: string;
}

// 根據天干獲取四化字典
const MUTAGEN_MAP: Record<string, Record<'祿' | '權' | '科' | '忌', string>> = {
  '甲': { '祿': '廉貞', '權': '破軍', '科': '武曲', '忌': '太陽' },
  '乙': { '祿': '天機', '權': '天梁', '科': '紫微', '忌': '太陰' },
  '丙': { '祿': '天同', '權': '天機', '科': '文昌', '忌': '廉貞' },
  '丁': { '祿': '太陰', '權': '天同', '科': '天機', '忌': '巨門' },
  '戊': { '祿': '貪狼', '權': '太陰', '科': '右弼', '忌': '天機' },
  '己': { '祿': '武曲', '權': '貪狼', '科': '天梁', '忌': '文曲' },
  '庚': { '祿': '太陽', '權': '武曲', '科': '太陰', '忌': '天同' },
  '辛': { '祿': '巨門', '權': '太陽', '科': '文曲', '忌': '文昌' },
  '壬': { '祿': '天梁', '權': '紫微', '科': '左輔', '忌': '武曲' },
  '癸': { '祿': '破軍', '權': '巨門', '科': '太陰', '忌': '貪狼' },
};

export function analyzeThreeLayers(
  palaces: PalaceData[],
  horoscope: HoroscopeState
): ThreeLayerAnalysisResult {
  const currentYear = horoscope.selectedYear;
  const yearlyInfo = horoscope.yearlyInfo;
  const decadalInfo = horoscope.decadalInfo;

  const currentYearGanZhi = yearlyInfo ? `${yearlyInfo.stem}${yearlyInfo.branch}` : '當前歲次';
  const currentDecadeName = decadalInfo ? `第 ${horoscope.selectedDecadeIndex + 1} 大限 (${decadalInfo.stem}${decadalInfo.branch}運)` : '當前大限';

  // 大限命宮所在的本命地支索引
  // 在 iztro 中，palace.decadalName 會標記大限宮位
  // 若無直接標記，可從 horoscope 提取
  const overlaps: ThreeLayerPalaceAnalysis[] = [];
  const collisionAlerts: MutagenCollisionAlert[] = [];

  // 大限干與流年干
  const decadalStem = decadalInfo?.stem || '';
  const yearlyStem = yearlyInfo?.stem || '';

  const decadalMutagens = MUTAGEN_MAP[decadalStem];
  const yearlyMutagens = MUTAGEN_MAP[yearlyStem];

  // 遍歷十二宮進行三層重疊比對
  for (let idx = 0; idx < 12; idx++) {
    const p = palaces[idx];
    const majorStarNames = p.majorStars.map(s => s.name);
    
    // 生年四化
    const natalMuts = p.majorStars
      .filter(s => s.mutagen)
      .map(s => `${s.name}化${s.mutagen}`);

    // 大限四化落點判定
    const decadalMutsInPalace: string[] = [];
    if (decadalMutagens) {
      (['祿', '權', '科', '忌'] as const).forEach(mType => {
        const star = decadalMutagens[mType];
        if (majorStarNames.includes(star) || p.minorStars.some(s => s.name === star)) {
          decadalMutsInPalace.push(`${star}大限化${mType}`);
        }
      });
    }

    // 流年四化落點判定
    const yearlyMutsInPalace: string[] = [];
    if (yearlyMutagens) {
      (['祿', '權', '科', '忌'] as const).forEach(mType => {
        const star = yearlyMutagens[mType];
        if (majorStarNames.includes(star) || p.minorStars.some(s => s.name === star)) {
          yearlyMutsInPalace.push(`${star}流年化${mType}`);
        }
      });
    }

    const natalPalaceName = p.name;
    const decadalPalaceName = p.decadalName || '大限宮位';
    const yearlyPalaceName = p.yearlyName || '流年宮位';

    // 組合三層意涵
    const combined = `本命【${natalPalaceName}】重疊大限【${decadalPalaceName}】、流年【${yearlyPalaceName}】。代表先天${natalPalaceName}的原廠基因，在這十年遭遇${decadalPalaceName}的外在環境命題，並在 ${currentYear} 年以${yearlyPalaceName}的具體生活情境爆發顯化。`;

    let coreTheme = '';
    if (yearlyPalaceName.includes('命宮')) {
      coreTheme = `當年度核心主角宮位，個人意志、體力與重大人生抉擇集中於此。`;
    } else if (yearlyPalaceName.includes('財帛') || natalPalaceName.includes('財帛')) {
      coreTheme = `當年度實質現金流、資金周轉與商業投資決策之關鍵焦點。`;
    } else if (yearlyPalaceName.includes('官祿') || natalPalaceName.includes('官祿')) {
      coreTheme = `職場升遷、事業轉型、專案業務與社會競爭力展現之主戰場。`;
    } else if (yearlyPalaceName.includes('夫妻') || natalPalaceName.includes('夫妻')) {
      coreTheme = `感情關係、婚姻相處、合夥契約與親密互動之考驗與磨合點。`;
    } else {
      coreTheme = `涉及周邊環境資源、人際網絡或特定生活領域之相應共振。`;
    }

    overlaps.push({
      palaceIndex: idx,
      earthlyBranch: p.earthlyBranch,
      natalLayer: {
        layer: 'natal',
        layerTitle: '先天本命層',
        palaceName: natalPalaceName,
        earthlyBranch: p.earthlyBranch,
        heavenlyStem: p.heavenlyStem,
        majorStars: majorStarNames,
        mutagens: natalMuts,
        roleDescription: '一生命格上限與原始性格基因'
      },
      decadalLayer: {
        layer: 'decadal',
        layerTitle: '十年大限層',
        palaceName: decadalPalaceName,
        earthlyBranch: p.earthlyBranch,
        heavenlyStem: decadalStem,
        majorStars: majorStarNames,
        mutagens: decadalMutsInPalace,
        roleDescription: '十年外部環境大風口與主修課題'
      },
      yearlyLayer: {
        layer: 'yearly',
        layerTitle: '流年太歲層',
        palaceName: yearlyPalaceName,
        earthlyBranch: p.earthlyBranch,
        heavenlyStem: yearlyStem,
        majorStars: majorStarNames,
        mutagens: yearlyMutsInPalace,
        roleDescription: '當年度事件爆發引動點與精確應期'
      },
      combinedMeaning: combined,
      coreLifeTheme: coreTheme
    });

    // 碰撞警訊雷達分析
    const allMutsHere = [...natalMuts, ...decadalMutsInPalace, ...yearlyMutsInPalace];
    const luCount = allMutsHere.filter(m => m.includes('化祿')).length;
    const jiCount = allMutsHere.filter(m => m.includes('化忌')).length;

    if (luCount >= 2) {
      collisionAlerts.push({
        type: 'double_lu',
        level: 'high_blessing',
        title: `雙祿交會（本命${natalPalaceName} / 流年${yearlyPalaceName}）`,
        affectedPalace: `${p.earthlyBranch}宮（${natalPalaceName}）`,
        description: `宮位迎來雙重化祿吉化重疊，財氣機遇奔湧而至，商業投資與人際資源將呈現乘數效應之爆發！`,
        strategicAdvice: '把握難得天時，主動出擊落實商業想法或拓展業務版圖；同時謹記順勢而為，留存充裕儲備。'
      });
    }

    if (jiCount >= 2) {
      collisionAlerts.push({
        type: 'double_ji',
        level: 'high_warning',
        title: `雙忌交疊（本命${natalPalaceName} / 流年${yearlyPalaceName}）`,
        affectedPalace: `${p.earthlyBranch}宮（${natalPalaceName}）`,
        description: `生年或大限化忌與流年化忌在此宮交匯，能量產生重度自省與外在阻滯，為全年度最需高度戒備之「風暴眼」。`,
        strategicAdvice: '切忌在該領域衝動擴張或意氣用事；嚴守合規底線，延遲重大決策，將心態轉為修煉內功與補足短板。'
      });
    }

    if (luCount >= 1 && jiCount >= 1) {
      collisionAlerts.push({
        type: 'lu_ji_clash',
        level: 'medium_caution',
        title: `祿忌同宮衝突（本命${natalPalaceName}）`,
        affectedPalace: `${p.earthlyBranch}宮（${natalPalaceName}）`,
        description: `化祿之機遇與化忌之阻力交織同存，看似機會極多但暗藏陷阱，容易陷入「剛有收穫隨即支出」之大起大落。`,
        strategicAdvice: '凡涉及此宮位之利益分配必須白紙黑字簽訂嚴謹條款，切莫憑口頭承諾行事，做好隨時停損之預案。'
      });
    }
  }

  // 總結撰寫
  const synthesis = `在 ${currentYear}（${currentYearGanZhi}）年度的時空星陣中，命盤正式進入三層立體疊合狀態。解盤之精要，在於「本命定格局，大限看吉凶，流年斷應期」。本年度共有 ${collisionAlerts.length} 處重大四化碰撞信號（包含 ${collisionAlerts.filter(c => c.level === 'high_blessing').length} 處爆發吉化與 ${collisionAlerts.filter(c => c.level === 'high_warning').length} 處重點風暴警訊）。順天應人者昌，知進退之節奏，方能在時空浪潮中立於不敗之地。`;

  return {
    currentDecadeName,
    currentYearNumber: currentYear,
    currentYearGanZhi,
    palaceOverlaps: overlaps,
    collisionAlerts,
    threeLayerSynthesisText: synthesis
  };
}
