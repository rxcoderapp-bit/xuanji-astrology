// @ts-ignore
import { Solar, Lunar, LunarUtil } from 'lunar-javascript';
import type { BaziData, BaziPillar, BirthInput } from '../types';

// Ten Gods calculation matrix
const STEM_ELEMENT: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

const STEM_YINYANG: Record<string, '陽' | '陰'> = {
  '甲': '陽', '乙': '陰',
  '丙': '陽', '丁': '陰',
  '戊': '陽', '己': '陰',
  '庚': '陽', '辛': '陰',
  '壬': '陽', '癸': '陰',
};

const ZHI_ELEMENT: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

const SHISHEN_MAP: Record<string, Record<string, string>> = {
  '同': { '同': '比肩', '異': '劫財' },
  '生我': { '同': '偏印', '異': '正印' },
  '我生': { '同': '食神', '異': '傷官' },
  '剋我': { '同': '七殺', '異': '正官' },
  '我剋': { '同': '偏財', '異': '正財' }
};

export function getShiShen(dayStem: string, targetStem: string): string {
  if (dayStem === targetStem) return '日主';
  const dayElem = STEM_ELEMENT[dayStem];
  const targetElem = STEM_ELEMENT[targetStem];
  if (!dayElem || !targetElem) return '';

  const dayYY = STEM_YINYANG[dayStem];
  const targetYY = STEM_YINYANG[targetStem];
  const yyRelation = dayYY === targetYY ? '同' : '異';

  let rel = '';
  if (dayElem === targetElem) {
    rel = '同';
  } else if (
    (dayElem === '木' && targetElem === '火') ||
    (dayElem === '火' && targetElem === '土') ||
    (dayElem === '土' && targetElem === '金') ||
    (dayElem === '金' && targetElem === '水') ||
    (dayElem === '水' && targetElem === '木')
  ) {
    rel = '我生';
  } else if (
    (targetElem === '木' && dayElem === '火') ||
    (targetElem === '火' && dayElem === '土') ||
    (targetElem === '土' && dayElem === '金') ||
    (targetElem === '金' && dayElem === '水') ||
    (targetElem === '水' && dayElem === '木')
  ) {
    rel = '生我';
  } else if (
    (dayElem === '木' && targetElem === '土') ||
    (dayElem === '土' && targetElem === '水') ||
    (dayElem === '水' && targetElem === '火') ||
    (dayElem === '火' && targetElem === '金') ||
    (dayElem === '金' && targetElem === '木')
  ) {
    rel = '我剋';
  } else {
    rel = '剋我';
  }

  return SHISHEN_MAP[rel]?.[yyRelation] || '';
}

// Convert Simplified Chinese characters to Traditional if needed
function toTrad(str: string): string {
  const map: Record<string, string> = {
    '伤官': '傷官', '偏财': '偏財', '正财': '正財', '七杀': '七殺',
    '比肩': '比肩', '劫财': '劫財', '食神': '食神', '正印': '正印', '偏印': '偏印',
    '海中金': '海中金', '炉中火': '爐中火', '大林木': '大林木', '路旁土': '路旁土',
    '剑锋金': '劍鋒金', '山头火': '山頭火', '涧下水': '澗下水', '城头土': '城頭土',
    '白蜡金': '白蠟金', '杨柳木': '楊柳木', '泉中水': '泉中水', '屋上土': '屋上土',
    '霹雳火': '霹靂火', '松柏木': '松柏木', '长流水': '長流水', '沙中金': '沙中金',
    '山下火': '山下火', '平地木': '平地木', '壁上土': '壁上土', '金箔金': '金箔金',
    '覆灯火': '覆燈火', '天河水': '天河水', '大驿土': '大驛土', '钗钏金': '釵釧金',
    '桑柘木': '桑柘木', '大溪水': '大溪水', '沙中土': '沙中土', '天上火': '天上火',
    '石榴木': '石榴木', '大海水': '大海水'
  };
  return map[str] || str;
}

export function computeBazi(input: BirthInput): BaziData {
  const safeYear = isNaN(Number(input.year)) || Number(input.year) < 1900 || Number(input.year) > 2100 ? 2000 : Math.floor(Number(input.year));
  const safeMonth = isNaN(Number(input.month)) || Number(input.month) < 1 || Number(input.month) > 12 ? 1 : Math.floor(Number(input.month));
  const safeDay = isNaN(Number(input.day)) || Number(input.day) < 1 || Number(input.day) > 31 ? 1 : Math.floor(Number(input.day));
  const safeHour = isNaN(Number(input.hour)) ? 0 : Math.max(0, Math.min(23, Math.floor(Number(input.hour))));
  const safeMinute = isNaN(Number(input.minute)) ? 0 : Math.max(0, Math.min(59, Math.floor(Number(input.minute))));

  let lunar: any;
  try {
    if (input.calendar === 'solar') {
      const solar = Solar.fromYmdHms(safeYear, safeMonth, safeDay, safeHour, safeMinute, 0);
      lunar = solar.getLunar();
    } else {
      lunar = input.isLeapMonth
        ? Lunar.fromYmdHms(safeYear, -safeMonth, safeDay, safeHour, safeMinute, 0)
        : Lunar.fromYmdHms(safeYear, safeMonth, safeDay, safeHour, safeMinute, 0);
    }
  } catch (err) {
    console.warn('computeBazi fallback on date conversion exception:', err);
    const solar = Solar.fromYmdHms(2000, 1, 1, 0, 0, 0);
    lunar = solar.getLunar();
  }

  const eightChar = lunar.getEightChar();
  const dayMaster = lunar.getDayGan();

  const makePillar = (stem: string, branch: string, nayin: string): BaziPillar => {
    const hidden = (LunarUtil.ZHI_HIDE_GAN[branch] || []).map((hStem: string) => ({
      stem: hStem,
      shishen: toTrad(getShiShen(dayMaster, hStem))
    }));

    return {
      stem,
      branch,
      stemShiShen: toTrad(getShiShen(dayMaster, stem)),
      branchShiShen: hidden[0]?.shishen || '',
      nayin: toTrad(nayin),
      hiddenStems: hidden
    };
  };

  const yearPillar = makePillar(lunar.getYearGan(), lunar.getYearZhi(), eightChar.getYearNaYin());
  const monthPillar = makePillar(lunar.getMonthGan(), lunar.getMonthZhi(), eightChar.getMonthNaYin());
  const dayPillar = makePillar(lunar.getDayGan(), lunar.getDayZhi(), eightChar.getDayNaYin());
  const hourPillar = makePillar(lunar.getTimeGan(), lunar.getTimeZhi(), eightChar.getTimeNaYin());

  // Count Five Elements weights
  const counts: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  [yearPillar, monthPillar, dayPillar, hourPillar].forEach(p => {
    if (STEM_ELEMENT[p.stem]) counts[STEM_ELEMENT[p.stem]] += 1.0;
    if (ZHI_ELEMENT[p.branch]) counts[ZHI_ELEMENT[p.branch]] += 1.0;
    p.hiddenStems.forEach(h => {
      if (STEM_ELEMENT[h.stem]) counts[STEM_ELEMENT[h.stem]] += 0.3;
    });
  });

  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const fiveElements = {
    wood: Math.round((counts['木'] / total) * 100),
    fire: Math.round((counts['火'] / total) * 100),
    earth: Math.round((counts['土'] / total) * 100),
    metal: Math.round((counts['金'] / total) * 100),
    water: Math.round((counts['水'] / total) * 100),
  };

  // Day Master Strength Approximation
  const dmElem = STEM_ELEMENT[dayMaster];
  const sameElem = dmElem;
  const produceElem = (
    dmElem === '木' ? '水' :
    dmElem === '火' ? '木' :
    dmElem === '土' ? '火' :
    dmElem === '金' ? '土' : '金'
  );

  const supportPct = (fiveElements[sameElem as keyof typeof fiveElements] || 0) +
                     (fiveElements[produceElem as keyof typeof fiveElements] || 0);

  let dayMasterStrength: '極旺' | '偏旺' | '中和' | '偏弱' | '極弱' = '中和';
  if (supportPct >= 65) dayMasterStrength = '極旺';
  else if (supportPct >= 50) dayMasterStrength = '偏旺';
  else if (supportPct >= 35) dayMasterStrength = '中和';
  else if (supportPct >= 20) dayMasterStrength = '偏弱';
  else dayMasterStrength = '極弱';

  // DaYun
  const yun = eightChar.getYun(input.gender === '男' ? 1 : 0);
  const birthYear = lunar.getSolar().getYear();
  const dayunList = (yun.getDaYun() || []).map((dy: any, idx: number) => {
    const startYear = dy.getStartYear();
    const age = startYear - birthYear + 1;
    return {
      age: idx === 0 ? `${age}歲起運` : `${age}~${age + 9}歲`,
      ganZhi: dy.getGanZhi() || '—'
    };
  });

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    dayMaster,
    dayMasterStrength,
    fiveElements,
    taiYuan: eightChar.getTaiYuan(),
    mingGong: eightChar.getMingGong(),
    shenGong: eightChar.getShenGong(),
    dayunList
  };
}
