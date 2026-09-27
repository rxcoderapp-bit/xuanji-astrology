import { astro } from 'iztro';

// Initialize standard configuration
astro.config({
  yearDivide: 'normal',
  horoscopeDivide: 'normal',
  ageDivide: 'normal',
  dayDivide: 'forward',
  algorithm: 'zhongzhou',
});

export type Gender = '男' | '女';

export interface ChartInput {
  dateStr: string; // 'YYYY-M-D'
  timeIndex: number; // 0-11
  gender: Gender;
  fixLeap: boolean;
}

export function generateChart(input: ChartInput) {
  // Use zh-TW to get traditional chinese strings, as required by the spec.
  const chart = astro.bySolar(input.dateStr, input.timeIndex, input.gender, input.fixLeap, 'zh-TW');
  return chart;
}

// Convert "HH:mm" to iztro's timeIndex (0-11)
export function hourToTimeIndex(timeStr: string): number {
  const hour = parseInt(timeStr.split(':')[0], 10);
  return Math.floor(((hour + 1) % 24) / 2);
}
