/**
 * 紫微斗數十二神煞計算引擎 (Twelve Gods & Spirits System)
 * 包含：博士十二神、歲前十二神、將前十二神
 * （嚴格去除所有個人姓名，純粹正統斗數天星神煞法則）
 */

/** 將前十二神：自三合帝旺將星起順行 */
export const JIANG_QIAN_SHEN = [
  '將星', '攀鞍', '歲驛', '息神', '華蓋', '劫煞',
  '災煞', '天煞', '指背', '咸池', '月煞', '亡神',
] as const;

/** 歲前十二神：自歲建（流年支或生年支）起順行 */
export const SUI_QIAN_SHEN = [
  '歲建', '晦氣', '喪門', '貫索', '官符', '小耗',
  '歲破', '龍德', '白虎', '天德', '弔客', '病符',
] as const;

/** 博士十二神：自祿存所在宮起，陽男陰女順行、陰男陽女逆行 */
export const BOSHI_SHEN = [
  '博士', '力士', '青龍', '小耗', '將軍', '奏書',
  '飛廉', '喜神', '病符', '大耗', '伏兵', '官符',
] as const;

const STEM_INDEX_MAP: Record<string, number> = {
  '甲': 0, '乙': 1, '丙': 2, '丁': 3, '戊': 4,
  '己': 5, '庚': 6, '辛': 7, '壬': 8, '癸': 9
};

const BRANCH_INDEX_MAP: Record<string, number> = {
  '子': 0, '丑': 1, '寅': 2, '卯': 3, '辰': 4, '巳': 5,
  '午': 6, '未': 7, '申': 8, '酉': 9, '戌': 10, '亥': 11
};

// 十天干祿存地支位置 (甲祿在寅2, 乙祿在卯3, 丙戊在巳5, 丁己在午6, 庚在申8, 辛在酉9, 壬在亥11, 癸在子0)
const LUCUN_BRANCH_BY_STEM: number[] = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0];

/** 將星所在三合帝旺位 (0-11) */
export function getJiangXingBranch(branchIndex: number): number {
  const b = ((branchIndex % 12) + 12) % 12;
  // 申子辰(8,0,4) -> 子(0); 巳酉丑(5,9,1) -> 酉(9); 寅午戌(2,6,10) -> 午(6); 亥卯未(11,3,7) -> 卯(3)
  return [0, 9, 6, 3][b % 4];
}

/** 計算某宮位的將前十二神 */
export function getJiangQianShen(anchorBranchStr: string, palaceBranchStr: string): string {
  const anchor = BRANCH_INDEX_MAP[anchorBranchStr] ?? 0;
  const palace = BRANCH_INDEX_MAP[palaceBranchStr] ?? 0;
  const start = getJiangXingBranch(anchor);
  const diff = ((palace - start) % 12 + 12) % 12;
  return JIANG_QIAN_SHEN[diff];
}

/** 計算某宮位的歲前十二神 (歲建在太歲支，順行十二宮) */
export function getSuiQianShen(anchorBranchStr: string, palaceBranchStr: string): string {
  const anchor = BRANCH_INDEX_MAP[anchorBranchStr] ?? 0;
  const palace = BRANCH_INDEX_MAP[palaceBranchStr] ?? 0;
  const diff = ((palace - anchor) % 12 + 12) % 12;
  return SUI_QIAN_SHEN[diff];
}

/** 計算某宮位的博士十二神 */
export function getBoshiShen(yearStemStr: string, gender: '男' | '女', palaceBranchStr: string): string {
  const sIdx = STEM_INDEX_MAP[yearStemStr] ?? 0;
  const pIdx = BRANCH_INDEX_MAP[palaceBranchStr] ?? 0;
  const startBranch = LUCUN_BRANCH_BY_STEM[sIdx] ?? 2;
  
  // 陽年干 (甲丙戊庚壬 = 偶數索引 0,2,4,6,8)
  const isYangStem = sIdx % 2 === 0;
  // 陽男陰女順行 (clockwise +1)，陰男陽女逆行 (counter-clockwise -1)
  const isClockwise = (isYangStem && gender === '男') || (!isYangStem && gender === '女');

  const diff = isClockwise
    ? ((pIdx - startBranch) % 12 + 12) % 12
    : ((startBranch - pIdx) % 12 + 12) % 12;

  return BOSHI_SHEN[diff];
}
