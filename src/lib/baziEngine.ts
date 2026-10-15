// @ts-ignore
import { Solar, Lunar, LunarUtil } from 'lunar-javascript';
import type { BaziData, BaziPillar, BirthInput } from '../types';
import { calculateDynamicBaziStrength } from './baziStrengthEngine';

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
  // 精密四維度子平動態旺衰與合局氣勢演算法
  const dynamicStrength = calculateDynamicBaziStrength({
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar
  });

  const dayMasterStrength = dynamicStrength.level;
  const dayMasterScore = dynamicStrength.score;
  const dayMasterDetail = dynamicStrength.levelDetail;
  const fiveElements = dynamicStrength.normalizedElements;

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
    dayMasterScore,
    dayMasterDetail,
    fiveElements,
    taiYuan: eightChar.getTaiYuan(),
    mingGong: eightChar.getMingGong(),
    shenGong: eightChar.getShenGong(),
    dayunList
  };
}
