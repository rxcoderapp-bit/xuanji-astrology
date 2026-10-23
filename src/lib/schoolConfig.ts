/**
 * 紫微斗數流派與排盤口徑配置模組 (School Configuration Engine)
 * 
 * 支援各大主流派系之排盤口徑切換，滿足專業研究者與使用者之偏好：
 * 1. 閏月口徑：按日切分 (15日前算前月，16日後算下月)、歸前月、歸後月、按本月。
 * 2. 晚子時口徑：23:00 ~ 23:59 換日排盤 (算次日) vs 當日不換日。
 * 3. 星曜亮度體系：《紫微斗數全書》正統古籍口徑 vs 現代修正版口徑。
 * （嚴格去除所有個人姓名，純粹學術與流派配置）
 */

export type LeapMonthRule = 'split-by-day' | 'prev-month' | 'next-month' | 'current-month';
export type LateZishiRule = 'next-day' | 'current-day';
export type BrightnessSchool = 'quanshu-classic' | 'modern-revised';

export interface SchoolConfig {
  leapMonthRule: LeapMonthRule;
  lateZishiRule: LateZishiRule;
  brightnessSchool: BrightnessSchool;
  useTrueSolarTime: boolean; // 是否啟用真太陽時校正
}

const STORAGE_KEY = 'xuanji_school_config_v1';

export const DEFAULT_SCHOOL_CONFIG: SchoolConfig = {
  leapMonthRule: 'split-by-day',
  lateZishiRule: 'next-day',
  brightnessSchool: 'quanshu-classic',
  useTrueSolarTime: true,
};

export function getStoredSchoolConfig(): SchoolConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SCHOOL_CONFIG;
    return { ...DEFAULT_SCHOOL_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SCHOOL_CONFIG;
  }
}

export function saveStoredSchoolConfig(config: SchoolConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('儲存排盤流派設定失敗:', e);
  }
}

export const LEAP_MONTH_LABELS: Record<LeapMonthRule, string> = {
  'split-by-day': '按日切分（15日前算前月，16日後算後月 · 推薦標準）',
  'prev-month': '歸前月（閏月全月歸屬本月前半）',
  'next-month': '歸後月（閏月全月歸屬次月後半）',
  'current-month': '按本月（不分前後，按當月天數排）',
};

export const LATE_ZISHI_LABELS: Record<LateZishiRule, string> = {
  'next-day': '晚子時換日（23:00~23:59 依翌日日干排盤 · 古法三合統一口徑）',
  'current-day': '晚子時不換日（23:00~23:59 仍依當日日干排盤）',
};

export const BRIGHTNESS_SCHOOL_LABELS: Record<BrightnessSchool, string> = {
  'quanshu-classic': '《紫微斗數全書》正統古本廟旺利陷',
  'modern-revised': '現代三合派實務修正版廟旺利陷',
};
