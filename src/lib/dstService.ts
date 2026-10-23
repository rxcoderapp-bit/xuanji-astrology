/**
 * 歷史夏令時（日光節約時間）檢測服務
 * 
 * 依據中國大陸歷史夏令時實施紀要（1986–1991 年等），
 * 當使用者出生日期落在夏令時期間時，系統將自動提醒並提供「手動扣除 1 小時」選項，
 * 確保不因撥快 1 小時而誤入下一個時辰。
 * （嚴格去除所有個人姓名，純粹客觀天文紀年數據）
 */

// [年份, 起始月, 起始日, 結束月, 結束日] (起止日皆包含)
const CHINA_DST_RECORDS: readonly (readonly [number, number, number, number, number])[] = [
  [1935, 5, 1, 9, 30], [1936, 5, 1, 9, 30], [1937, 5, 1, 9, 30], [1938, 5, 1, 9, 30],
  [1939, 5, 1, 9, 30], [1940, 5, 1, 9, 30], [1941, 5, 1, 9, 30], [1942, 5, 1, 9, 30],
  [1943, 5, 1, 9, 30], [1944, 5, 1, 9, 30], [1945, 5, 1, 9, 30], [1946, 5, 1, 9, 30],
  [1947, 5, 1, 9, 30], [1948, 5, 1, 9, 30], [1949, 5, 1, 9, 30], [1950, 5, 1, 9, 30],
  [1951, 5, 1, 9, 30], [1952, 3, 1, 10, 31], [1953, 4, 1, 10, 31], [1954, 4, 1, 10, 31],
  [1955, 5, 1, 9, 30], [1956, 5, 1, 9, 30], [1957, 4, 1, 9, 30], [1958, 4, 1, 9, 30],
  [1959, 4, 1, 9, 30], [1960, 6, 1, 9, 30], [1961, 6, 1, 9, 30], [1974, 4, 1, 10, 31],
  [1975, 4, 1, 10, 31], [1979, 7, 1, 9, 30], [1986, 5, 4, 9, 14], [1987, 4, 12, 9, 13],
  [1988, 4, 10, 9, 11], [1989, 4, 16, 9, 17], [1990, 4, 15, 9, 16], [1991, 4, 14, 9, 15],
] as const;

/** 判斷特定公曆日期是否處於歷史夏令時實施期間 */
export function isChinaDST(year: number, month: number, day: number): boolean {
  for (const [y, m1, d1, m2, d2] of CHINA_DST_RECORDS) {
    if (year !== y) continue;
    if (month > m1 && month < m2) return true;
    if (month === m1) {
      if (day >= d1) return true;
    } else if (month === m2) {
      if (day <= d2) return true;
    }
  }
  return false;
}

/** 獲取該年份的夏令時區間描述文字 */
export function getChinaDSTRange(year: number): { start: string; end: string } | null {
  const hit = CHINA_DST_RECORDS.find(([y]) => y === year);
  if (!hit) return null;
  const [, m1, d1, m2, d2] = hit;
  return { start: `${m1} 月 ${d1} 日`, end: `${m2} 月 ${d2} 日` };
}

/** 判斷該年份是否曾實施過夏令時 */
export function isChinaDSTYear(year: number): boolean {
  return CHINA_DST_RECORDS.some(([y]) => y === year);
}
