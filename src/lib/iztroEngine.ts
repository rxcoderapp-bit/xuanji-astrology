import { astro } from 'iztro';
import type { IFunctionalAstrolabe } from 'iztro/lib/astro/FunctionalAstrolabe';
import type { IFunctionalHoroscope } from 'iztro/lib/astro/FunctionalHoroscope';
import type {
  BirthInput,
  PalaceData,
  StarInfo,
  HoroscopeState,
  SanFangSiZheng,
  MutagenType
} from '../types';

// Standard WenMo TianJi configuration for iztro
astro.config({
  yearDivide: 'normal',
  horoscopeDivide: 'normal',
  ageDivide: 'normal',
  dayDivide: 'forward',
  algorithm: 'zhongzhou',
});

// Ten Heavenly Stems SiHua lookup table for self-mutagen (自化)
const SIHUA_TABLE: Record<string, [string, string, string, string]> = {
  '甲': ['廉貞', '破軍', '武曲', '太陽'],
  '乙': ['天機', '天梁', '紫微', '太陰'],
  '丙': ['天同', '天機', '文昌', '廉貞'],
  '丁': ['太陰', '天同', '天機', '巨門'],
  '戊': ['貪狼', '太陰', '右弼', '天機'],
  '己': ['武曲', '貪狼', '天梁', '文曲'],
  '庚': ['太陽', '武曲', '太陰', '天同'],
  '辛': ['巨門', '太陽', '文曲', '文昌'],
  '壬': ['天梁', '紫微', '左輔', '武曲'],
  '癸': ['破軍', '巨門', '太陰', '貪狼'],
};

const MUTAGEN_LABELS: MutagenType[] = ['祿', '權', '科', '忌'];

// Convert hour to iztro's timeIndex (0-11)
export function hourToTimeIndex(hour: number, minute: number = 0): number {
  const safeHour = isNaN(Number(hour)) ? 0 : Math.max(0, Math.min(23, Math.floor(Number(hour))));
  const safeMinute = isNaN(Number(minute)) ? 0 : Math.max(0, Math.min(59, Math.floor(Number(minute))));
  const adjustedHour = (safeHour + (safeMinute >= 60 ? 1 : 0)) % 24;
  return Math.floor(((adjustedHour + 1) % 24) / 2);
}

export function timeIndexToName(timeIndex: number): string {
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const safeIndex = isNaN(Number(timeIndex)) ? 0 : Math.max(0, Math.min(11, Math.floor(Number(timeIndex))));
  const startHour = ((safeIndex * 2 + 23) % 24);
  const endHour = (startHour + 2) % 24;
  return `${branches[safeIndex]}時 (${String(startHour).padStart(2, '0')}:00-${String(endHour).padStart(2, '0')}:00)`;
}

export interface ChartExecutionResult {
  astrolabe: IFunctionalAstrolabe;
  palaces: PalaceData[];
  solarDate: string;
  lunarDate: string;
  chineseDate: string;
  rawBazi: string[];
  soul: string; // 命主
  body: string; // 身主
  fiveElementsClass: string; // 五行局
  zodiac: string; // 生肖
  sign: string; // 星座
  mingGongIndex: number;
  shenGongIndex: number;
  laiYinIndex: number;
}

export function computeAstrolabe(input: BirthInput): ChartExecutionResult {
  const safeYear = isNaN(Number(input.year)) || Number(input.year) < 1900 || Number(input.year) > 2100 ? 2000 : Math.floor(Number(input.year));
  const safeMonth = isNaN(Number(input.month)) || Number(input.month) < 1 || Number(input.month) > 12 ? 1 : Math.floor(Number(input.month));
  const safeDay = isNaN(Number(input.day)) || Number(input.day) < 1 || Number(input.day) > 31 ? 1 : Math.floor(Number(input.day));
  const safeHour = isNaN(Number(input.hour)) ? 0 : Math.max(0, Math.min(23, Math.floor(Number(input.hour))));
  const safeMinute = isNaN(Number(input.minute)) ? 0 : Math.max(0, Math.min(59, Math.floor(Number(input.minute))));

  const timeIndex = hourToTimeIndex(safeHour, safeMinute);
  const dateStr = `${safeYear}-${safeMonth}-${safeDay}`;
  
  let astrolabe: IFunctionalAstrolabe;
  try {
    if (input.calendar === 'solar') {
      astrolabe = astro.bySolar(dateStr, timeIndex, input.gender || '男', input.isLeapMonth ?? false, 'zh-TW');
    } else {
      astrolabe = astro.byLunar(dateStr, timeIndex, input.gender || '男', input.isLeapMonth ?? false, true, 'zh-TW');
    }
  } catch (err) {
    console.warn('computeAstrolabe fallback on date conversion exception:', err);
    astrolabe = astro.bySolar('2000-1-1', 0, input.gender || '男', false, 'zh-TW');
  }

  // Find Lai-Yin Palace (來因宮: Heavenly Stem matches Birth Year Stem)
  const birthYearStem = astrolabe.rawDates.chineseDate.yearly[0];
  let laiYinIndex = 0;

  let mingGongIdx = 0;
  let shenGongIdx = 0;

  const palaces: PalaceData[] = astrolabe.palaces.map((p, idx) => {
    if (p.name.includes('命')) mingGongIdx = idx;
    if (p.isBodyPalace) shenGongIdx = idx;
    if (p.heavenlyStem === birthYearStem) laiYinIndex = idx;

    // Major stars
    const majorStars: StarInfo[] = (p.majorStars || []).map(s => ({
      name: s.name,
      type: 'major',
      brightness: s.brightness,
      mutagen: s.mutagen as MutagenType,
      scope: 'origin'
    }));

    // Minor stars (六吉六煞 + 祿存天馬)
    const minorStars: StarInfo[] = (p.minorStars || []).map(s => ({
      name: s.name,
      type: (['擎羊', '陀羅', '火星', '鈴星', '地空', '地劫'].includes(s.name) ? 'hard' : 'soft'),
      brightness: s.brightness,
      mutagen: s.mutagen as MutagenType,
      scope: 'origin'
    }));

    // Adjective stars
    const adjectiveStars: StarInfo[] = (p.adjectiveStars || []).map(s => ({
      name: typeof s === 'string' ? s : s.name,
      type: 'adj',
      brightness: typeof s === 'object' ? s.brightness : undefined,
      scope: 'origin'
    }));

    // Calculate Palace Self Mutagen (宮干自化: 天干四化星與本宮內星曜比對)
    const stemMutagens = SIHUA_TABLE[p.heavenlyStem] || [];
    const allPalaceStarNames = [...majorStars, ...minorStars, ...adjectiveStars].map(s => s.name);
    const selfMutagens: { star: string; mutagen: MutagenType }[] = [];

    stemMutagens.forEach((starName, sIdx) => {
      if (allPalaceStarNames.includes(starName)) {
        selfMutagens.push({
          star: starName,
          mutagen: MUTAGEN_LABELS[sIdx]
        });
      }
    });

    return {
      index: idx,
      earthlyBranch: p.earthlyBranch,
      heavenlyStem: p.heavenlyStem,
      name: p.name.replace('宫', '宮'),
      isBodyPalace: p.isBodyPalace,
      isOriginalPalace: p.heavenlyStem === birthYearStem,
      majorStars,
      minorStars,
      adjectiveStars,
      decadalRange: p.decadal ? [p.decadal.range[0], p.decadal.range[1]] : [0, 0],
      ages: p.ages || [],
      changsheng12: p.changsheng12 || '',
      boshi12: p.boshi12 || '',
      jiangqian12: p.jiangqian12 || '',
      suiqian12: p.suiqian12 || '',
      selfMutagens
    };
  });

  return {
    astrolabe,
    palaces,
    solarDate: astrolabe.solarDate,
    lunarDate: astrolabe.lunarDate,
    chineseDate: astrolabe.chineseDate,
    rawBazi: [
      astrolabe.rawDates.chineseDate.yearly[0] + astrolabe.rawDates.chineseDate.yearly[1],
      astrolabe.rawDates.chineseDate.monthly[0] + astrolabe.rawDates.chineseDate.monthly[1],
      astrolabe.rawDates.chineseDate.daily[0] + astrolabe.rawDates.chineseDate.daily[1],
      astrolabe.rawDates.chineseDate.hourly[0] + astrolabe.rawDates.chineseDate.hourly[1],
    ],
    soul: astrolabe.soul,
    body: astrolabe.body,
    fiveElementsClass: astrolabe.fiveElementsClass,
    zodiac: astrolabe.zodiac,
    sign: astrolabe.sign,
    mingGongIndex: mingGongIdx,
    shenGongIndex: shenGongIdx,
    laiYinIndex
  };
}

// Compute SanFangSiZheng (三方四正) for any palace index (0..11)
export function getSanFangSiZheng(palaceIndex: number): SanFangSiZheng {
  // Opposite palace (對宮): 6 palaces away
  const oppositeIndex = (palaceIndex + 6) % 12;
  
  // Trines (三合宮): 4 palaces away on either side
  const trine1Index = (palaceIndex + 4) % 12;
  const trine2Index = (palaceIndex + 8) % 12;
  
  // Flanks (夾宮/相鄰): +/- 1 palace
  const flankPrevIndex = (palaceIndex + 11) % 12;
  const flankNextIndex = (palaceIndex + 1) % 12;

  return {
    selfIndex: palaceIndex,
    oppositeIndex,
    trine1Index,
    trine2Index,
    flankPrevIndex,
    flankNextIndex,
  };
}

// Compute detailed Horoscope layers (大限、小限、流年、流月、流日、流時)
export function computeHoroscopeDetails(
  astrolabe: IFunctionalAstrolabe,
  targetDateStr?: string,
  targetTimeIndex?: number
): HoroscopeState {
  const today = targetDateStr ? new Date(targetDateStr) : new Date();
  const dateFormatted = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const timeIdx = targetTimeIndex ?? hourToTimeIndex(today.getHours(), today.getMinutes());

  const h: IFunctionalHoroscope = astrolabe.horoscope(dateFormatted, timeIdx);
  const decadalList = astrolabe.decadalList();

  // Find matching decade index
  const activeDecadeIndex = decadalList.findIndex(
    d => d.ageRange && h.age?.name && d.ageRange[0] <= (h.age as any).nominalAge && d.ageRange[1] >= (h.age as any).nominalAge
  );

  const decadalMutagens = (h.decadal?.mutagen || []).map((star, idx) => ({
    star,
    mutagen: MUTAGEN_LABELS[idx]
  }));

  const yearlyMutagens = (h.yearly?.mutagen || []).map((star, idx) => ({
    star,
    mutagen: MUTAGEN_LABELS[idx]
  }));

  const monthlyMutagens = (h.monthly?.mutagen || []).map((star, idx) => ({
    star,
    mutagen: MUTAGEN_LABELS[idx]
  }));

  return {
    activeLayer: 'yearly',
    targetDate: dateFormatted,
    targetTimeIndex: timeIdx,
    selectedDecadeIndex: activeDecadeIndex >= 0 ? activeDecadeIndex : 0,
    selectedYear: today.getFullYear(),
    selectedMonth: today.getMonth() + 1,
    selectedDay: today.getDate(),
    selectedHourIndex: timeIdx,

    decadalInfo: h.decadal ? {
      name: h.decadal.name,
      stem: h.decadal.heavenlyStem,
      branch: h.decadal.earthlyBranch,
      ageRange: [
        decadalList[activeDecadeIndex >= 0 ? activeDecadeIndex : 0]?.ageRange?.[0] || 0,
        decadalList[activeDecadeIndex >= 0 ? activeDecadeIndex : 0]?.ageRange?.[1] || 0
      ],
      palaceIndex: h.decadal.index,
      mutagens: decadalMutagens
    } : undefined,

    yearlyInfo: h.yearly ? {
      year: today.getFullYear(),
      nominalAge: (h.age as any)?.nominalAge || 0,
      stem: h.yearly.heavenlyStem,
      branch: h.yearly.earthlyBranch,
      palaceIndex: h.yearly.index,
      mutagens: yearlyMutagens
    } : undefined,

    monthlyInfo: h.monthly ? {
      month: today.getMonth() + 1,
      stem: h.monthly.heavenlyStem,
      branch: h.monthly.earthlyBranch,
      palaceIndex: h.monthly.index,
      mutagens: monthlyMutagens
    } : undefined,

    dailyInfo: h.daily ? {
      day: 1,
      stem: h.daily.heavenlyStem,
      branch: h.daily.earthlyBranch,
      palaceIndex: h.daily.index
    } : undefined,

    hourlyInfo: h.hourly ? {
      hourName: timeIndexToName(timeIdx),
      stem: h.hourly.heavenlyStem,
      branch: h.hourly.earthlyBranch,
      palaceIndex: h.hourly.index
    } : undefined,

    ageInfo: h.age ? {
      nominalAge: (h.age as any)?.nominalAge || 0,
      palaceIndex: h.age.index
    } : undefined
  };
}

// 12 Standard Palace Names in order for overlapping names calculation
export const TWELVE_PALACE_NAMES = [
  '命宮', '兄弟', '夫妻', '子女', '財帛', '疾厄',
  '遷移', '僕役', '官祿', '田宅', '福德', '父母'
];

// Calculate overlapping names for 12 palaces given a layer's Life Palace index
export function getOverlappingNames(lifePalaceIndex: number, prefix: string): Record<number, string> {
  const result: Record<number, string> = {};
  for (let i = 0; i < 12; i++) {
    const palaceNameIdx = (lifePalaceIndex - i + 12) % 12;
    result[i] = `${prefix}${TWELVE_PALACE_NAMES[palaceNameIdx]}`;
  }
  return result;
}
