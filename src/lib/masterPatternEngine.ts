/**
 * 大師級紫微斗數分層格局辨識與現代破局改運演算法 (Master Pattern & Breakthrough Engine)
 * 
 * 核心原典依據：《紫微斗數全書》、《紫微斗數全集》、《紫微斗數骨髓賦》
 * 導入全新四維分層條件機制：
 * 1. 必備條件 (required)：古書成格不可或缺之核心星曜與宮位拓撲
 * 2. 吉化加分項 (bonus)：再會吉曜、生年吉化、廟旺加乘
 * 3. 破格警示 (breaking)：空劫夾忌、坐煞星、落陷無光、化忌沖照
 * 4. 權威古籍出處 (source)：逐字考證之古典篇目出處
 * 
 * 同時融合現代心理學破局指南，杜絕消極宿命恐嚇，引導知命造運！
 * （嚴格去除所有個人姓名，純粹正統古典術數與現代認知心理學傳承）
 */

import type { PalaceData, HoroscopeState, StarInfo } from '../types';
import { analyzeDoubleMutagensAndSpecialJi, type DoubleMutagenPattern } from './doubleMutagenEngine';

export interface PatternConditions {
  required: string[];   // 必須滿足條件
  bonus?: string[];     // 吉化加分項
  breaking?: string[];  // 破格警示項
}

export interface DetectedPattern {
  id: string;
  name: string;
  category: 'auspicious' | 'challenging' | 'special';
  categoryLabel: string;
  palaceIndex: number;
  palaceName: string;
  classicalQuote: string;
  modernPsychology: string;
  breakthroughAdvice: string;
  actionGuidance: string[];
  conditions?: PatternConditions;
  source?: string;
}

export interface LuSuiJiZouDiagnosis {
  jiPalace: {
    index: number;
    name: string;
    branch: string;
    star: string;
    psychologicalVoid: string; // 心靈黑洞與焦慮源泉
  };
  luPalace: {
    index: number;
    name: string;
    branch: string;
    star: string;
    desireProjection: string; // 盲目試圖填補之慾望
  };
  interplaySummary: string; // 祿隨忌走內耗循環剖析
  keRationalBoundary: string; // 化科之理性認知解套策略
  quanExecutionPower: string; // 化權之邊界掌控行動心法
}

export interface MasterPatternAnalysisResult {
  detectedPatterns: DetectedPattern[];
  doubleMutagens: DoubleMutagenPattern[];
  luSuiJiZou: LuSuiJiZouDiagnosis | null;
  overallBreakthroughSummary: string;
}

// 輔助獲取宮位中所有星曜物件
function getAllStars(palace: PalaceData): StarInfo[] {
  if (!palace) return [];
  return [...palace.majorStars, ...palace.minorStars, ...palace.adjectiveStars];
}

// 輔助檢查星曜是否在宮位中
function hasStar(palace: PalaceData, starName: string): boolean {
  if (!palace) return false;
  return getAllStars(palace).some(s => s.name === starName);
}

// 獲取宮位中特定星曜物件
function findStar(palace: PalaceData, starName: string): StarInfo | undefined {
  if (!palace) return undefined;
  return getAllStars(palace).find(s => s.name === starName);
}

// 判斷星曜是否廟旺 (廟/旺/得/利)
function isBright(palace: PalaceData, starName: string): boolean {
  const s = findStar(palace, starName);
  if (!s || !s.brightness) return false;
  return ['廟', '旺', '得', '利'].includes(s.brightness);
}

// 判斷星曜是否落陷 (陷/不)
function isDim(palace: PalaceData, starName: string): boolean {
  const s = findStar(palace, starName);
  if (!s || !s.brightness) return false;
  return ['陷', '不'].includes(s.brightness);
}

// 輔助檢查四化
function getStarMutagen(palace: PalaceData, starName: string): '祿' | '權' | '科' | '忌' | undefined {
  const s = findStar(palace, starName);
  return (s?.mutagen as any) || undefined;
}

// 煞星集合
const SHA_HARD = ['擎羊', '陀羅', '火星', '鈴星'];
const SHA_KONG = ['地空', '地劫'];
const SHA_ALL = [...SHA_HARD, ...SHA_KONG];

function countSha(palace: PalaceData, shaList: string[] = SHA_HARD): number {
  if (!palace) return 0;
  return [...palace.majorStars, ...palace.minorStars].filter(s => shaList.includes(s.name)).length;
}

function hasSha(palace: PalaceData, shaList: string[] = SHA_ALL): boolean {
  return countSha(palace, shaList) > 0;
}

// 獲取三方四正宮位陣列
function getSanFangPalaces(palaces: PalaceData[], mingIdx: number): PalaceData[] {
  const qianIdx = (mingIdx + 6) % 12;
  const caiIdx = (mingIdx + 8) % 12;
  const guanIdx = (mingIdx + 4) % 12;
  return [palaces[mingIdx], palaces[qianIdx], palaces[caiIdx], palaces[guanIdx]].filter(Boolean);
}

function sanFangAllStars(palaces: PalaceData[], mingIdx: number): Set<string> {
  const sf = getSanFangPalaces(palaces, mingIdx);
  const set = new Set<string>();
  sf.forEach(p => {
    [...p.majorStars, ...p.minorStars, ...p.adjectiveStars].forEach(s => set.add(s.name));
  });
  return set;
}

function sanFangShaCount(palaces: PalaceData[], mingIdx: number, list: string[] = SHA_HARD): number {
  return getSanFangPalaces(palaces, mingIdx).reduce((acc, p) => acc + countSha(p, list), 0);
}

// 獲取前後夾宮
function getJiaPalaces(palaces: PalaceData[], targetIdx: number): { prev: PalaceData; next: PalaceData } {
  const prevIdx = (targetIdx - 1 + 12) % 12;
  const nextIdx = (targetIdx + 1) % 12;
  return { prev: palaces[prevIdx], next: palaces[nextIdx] };
}

export function analyzeMasterPatterns(
  palaces: PalaceData[],
  _horoscope?: HoroscopeState
): MasterPatternAnalysisResult {
  const detected: DetectedPattern[] = [];
  const mingGong = palaces.find(p => p.name === '命宮') || palaces[0];
  const mingIdx = mingGong.index;
  const sfStars = sanFangAllStars(palaces, mingIdx);
  const sfPalaces = getSanFangPalaces(palaces, mingIdx);

  // 1. 君臣慶會格：紫微入命，左輔右弼同會
  if (hasStar(mingGong, '紫微') && sfStars.has('左輔') && sfStars.has('右弼')) {
    const required = ['紫微星坐守命宮', '左輔、右弼齊會命宮三方四正'];
    const bonus: string[] = [];
    const breaking: string[] = [];
    if (sfStars.has('文昌') || sfStars.has('文曲')) bonus.push('同會文昌或文曲，文采風流');
    if (sfStars.has('天魁') || sfStars.has('天鉞')) bonus.push('天乙貴人加照，求名得利');
    if (getStarMutagen(mingGong, '紫微') === '權') bonus.push('紫微化權，掌控力極強');
    if (sanFangShaCount(palaces, mingIdx, SHA_KONG) >= 2) breaking.push('地空地劫雙會（帝星忌空劫，主內心虛耗）');

    detected.push({
      id: 'p_junchen',
      name: '君臣慶會格',
      category: 'auspicious',
      categoryLabel: '極品貴顯名格',
      palaceIndex: mingIdx,
      palaceName: '命宮',
      classicalQuote: '「君臣慶會，才德咸備。紫微得輔弼之助，威震山河。」——《紫微斗數全書》',
      modernPsychology: '象徵天生具備跨界統御格局與群體號召力，身邊極易吸引能人志士共謀大業。',
      breakthroughAdvice: '切忌剛愎自用與在野孤君之傲慢，善用群體協同力量方能成就事業巔峰。',
      actionGuidance: [
        '主動組建互補型事業合夥團隊，發揮各自專長',
        '建立扁平透明的決策與分潤機制，廣納良言',
        '在職場中勇於掛帥擔任大專案負責人或領導者'
      ],
      conditions: { required, bonus, breaking },
      source: '《紫微斗數全書·君臣慶會格》'
    });
  }

  // 2. 紫府同宮格：紫微天府同坐命宮（寅申位）
  if (hasStar(mingGong, '紫微') && hasStar(mingGong, '天府')) {
    const required = ['紫微、天府同宮坐守命宮（寅位或申位）'];
    const bonus: string[] = [];
    const breaking: string[] = [];
    if (sfStars.has('左輔') && sfStars.has('右弼')) bonus.push('左輔右弼齊會三方');
    if (sfStars.has('化祿') || sfStars.has('祿存')) bonus.push('見祿存或化祿，富貴雙全');
    if (hasSha(mingGong, SHA_KONG)) breaking.push('紫府宮坐地空地劫（孤君落空，聚財不易）');
    if (countSha(mingGong, SHA_HARD) >= 2) breaking.push('命宮見雙煞同坐（威勢受挫）');

    detected.push({
      id: 'p_zifu',
      name: '紫府同宮格',
      category: 'auspicious',
      categoryLabel: '帝相並臨格局',
      palaceIndex: mingIdx,
      palaceName: '命宮',
      classicalQuote: '「紫微天府同宮，終身福厚。安居寅申，文武全才。」——《紫微斗數全書》',
      modernPsychology: '紫微之尊貴開創與天府之持重沉穩在體內交織，兼具大局觀與風險防範意識。',
      breakthroughAdvice: '防範因追求完美而猶豫不決，或過度在意顏面導致錯失市場轉型先機。',
      actionGuidance: [
        '宜任職大型組織高階管理層或實業投資',
        '定期檢視資產負債表，攻守平衡兼顧',
        '平衡理想與務實執行，避免過度端架子'
      ],
      conditions: { required, bonus, breaking },
      source: '《紫微斗數全書·紫府同宮格》'
    });
  }

  // 3. 府相朝垣格：天府、天相分守命宮三方四正
  const hasTianFu = sfStars.has('天府');
  const hasTianXiang = sfStars.has('天相');
  if (hasTianFu && hasTianXiang && !(hasStar(mingGong, '天府') && hasStar(mingGong, '天相'))) {
    const required = ['天府坐命三方', '天相坐命三方', '兩星不同宮分職拱照'];
    const bonus: string[] = [];
    const breaking: string[] = [];
    if (hasStar(mingGong, '祿存') || sfStars.has('化祿')) bonus.push('命宮見祿，財源昌隆');
    if (sfStars.has('左輔') || sfStars.has('右弼')) bonus.push('輔弼會照，聲望崇高');
    if (hasSha(mingGong, SHA_HARD)) breaking.push('命宮坐煞星（美中不足）');

    detected.push({
      id: 'p_fuxiang',
      name: '府相朝垣格',
      category: 'auspicious',
      categoryLabel: '食祿千鍾名格',
      palaceIndex: mingIdx,
      palaceName: '命宮三方',
      classicalQuote: '「府相朝垣千鍾食祿，文武承平，一生無匱。」——《紫微斗數全書》',
      modernPsychology: '天相為印綬公信力，天府為國庫資產底蘊，雙星拱照主信譽卓著、做事四平八穩。',
      breakthroughAdvice: '適合在成熟大體制中擔任執行長、財務長或專業合夥人，重視商譽勝於投機暴利。',
      actionGuidance: [
        '深耕公信力與專業合約，建立不可替代之品牌口碑',
        '佈局多元穩健現金流投資組合',
        '善用協調天賦，成為跨部門不可或缺之樞紐'
      ],
      conditions: { required, bonus, breaking },
      source: '《紫微斗數全書·府相朝垣格》'
    });
  }

  // 4. 陽梁昌祿格：太陽、天梁、文昌、祿存四星會照命宮三方
  if (sfStars.has('太陽') && sfStars.has('天梁') && sfStars.has('文昌') && sfStars.has('祿存')) {
    const required = ['太陽、天梁、文昌、祿存四星齊會命宮三方四正'];
    const bonus: string[] = [];
    const breaking: string[] = [];
    const sunPalace = palaces.find(p => hasStar(p, '太陽'));
    if (sunPalace && isBright(sunPalace, '太陽')) bonus.push('太陽廟旺，光明盛大');
    if (sfStars.has('化科')) bonus.push('再會化科，考運極品');
    if (sunPalace && isDim(sunPalace, '太陽')) breaking.push('太陽落陷（陽梁失輝，功名多磨）');

    detected.push({
      id: 'p_yangliang',
      name: '陽梁昌祿格',
      category: 'auspicious',
      categoryLabel: '金榜題名貴格',
      palaceIndex: mingIdx,
      palaceName: '命宮三方',
      classicalQuote: '「陽梁昌祿傳臚第一，臚唱高第，名顯四海。」——《紫微斗數骨髓賦》',
      modernPsychology: '天生具備深度邏輯思維與學術專精稟賦，考試運、考證運與評審答辯運極佳。',
      breakthroughAdvice: '最宜走「知識變現、國際認證、技術專利與高端諮詢」之專業權威路線。',
      actionGuidance: [
        '持續考取行業頂級專業執照與國際級資格',
        '將核心專業知識體系化，撰寫專書或發表原創研發',
        '爭取學術、法律或行業標準制定委員會席位'
      ],
      conditions: { required, bonus, breaking },
      source: '《紫微斗數骨髓賦·陽梁昌祿格》'
    });
  }

  // 5. 三奇嘉會格：化祿、化權、化科齊會三方四正
  const hasLu = sfPalaces.some(p => getAllStars(p).some(s => s.mutagen === '祿'));
  const hasQuan = sfPalaces.some(p => getAllStars(p).some(s => s.mutagen === '權'));
  const hasKe = sfPalaces.some(p => getAllStars(p).some(s => s.mutagen === '科'));
  if (hasLu && hasQuan && hasKe) {
    const required = ['化祿、化權、化科三吉化齊會命宮三方四正'];
    const breaking: string[] = [];
    if (sfPalaces.some(p => getAllStars(p).some(s => s.mutagen === '忌'))) breaking.push('三方同見化忌沖破（吉處藏凶）');

    detected.push({
      id: 'p_sanqi',
      name: '三奇嘉會格',
      category: 'auspicious',
      categoryLabel: '極品富貴大格',
      palaceIndex: mingIdx,
      palaceName: '命宮三方',
      classicalQuote: '「三奇嘉會，名譽昭彰。祿權科會，富貴雙全。」——《紫微斗數全書》',
      modernPsychology: '財源機遇（祿）、開拓掌控力（權）與社會聲譽（科）形成完美良性閉環。',
      breakthroughAdvice: '機遇豐沛時最宜居安思危，將事業版圖制度化，防範突發流年忌星沖破。',
      actionGuidance: [
        '把握每十年大限機遇，果斷啟動人生關鍵躍遷',
        '兼顧財富累積、專業話語權與社會聲譽',
        '建立強大合規法務與資金防火牆'
      ],
      conditions: { required, breaking },
      source: '《紫微斗數全書·三奇嘉會格》'
    });
  }

  // 6. 火貪格 / 鈴貪格：貪狼遇火星或鈴星
  const tanPalace = palaces.find(p => hasStar(p, '貪狼'));
  const huoPalace = palaces.find(p => hasStar(p, '火星'));
  const lingPalace = palaces.find(p => hasStar(p, '鈴星'));
  if (tanPalace) {
    const isHuoTan = huoPalace && (tanPalace.index === huoPalace.index || sfPalaces.some(p => p.index === tanPalace.index) && sfPalaces.some(p => p.index === huoPalace.index));
    const isLingTan = lingPalace && (tanPalace.index === lingPalace.index || sfPalaces.some(p => p.index === tanPalace.index) && sfPalaces.some(p => p.index === lingPalace.index));
    if (isHuoTan || isLingTan) {
      const pName = isHuoTan ? '火貪格' : '鈴貪格';
      const required = [`貪狼星與${isHuoTan ? '火星' : '鈴星'}同宮或在三方會照`];
      const bonus: string[] = [];
      const breaking: string[] = [];
      if (getStarMutagen(tanPalace, '貪狼') === '祿') bonus.push('貪狼化祿，橫發機遇最旺');
      if (hasSha(tanPalace, ['擎羊', '陀羅'])) breaking.push('貪狼逢羊陀沖破（暴發後防暴敗）');
      if (hasSha(tanPalace, SHA_KONG)) breaking.push('遇地空地劫（財來財去不聚）');

      detected.push({
        id: isHuoTan ? 'p_huotan' : 'p_lingtan',
        name: pName,
        category: 'auspicious',
        categoryLabel: '橫發爆款格局',
        palaceIndex: tanPalace.index,
        palaceName: tanPalace.name,
        classicalQuote: '「貪狼火星居廟旺，名振諸邦。貪鈴並照，英雄拓土。」——《紫微斗數骨髓賦》',
        modernPsychology: '思維敏銳、善抓市場突發紅利，具備極強的爆發力與破圈營銷本能。',
        breakthroughAdvice: '發財之後務必將高風險獲利快速沉澱為低槓桿實體資產，杜絕盲目加槓桿博弈。',
        actionGuidance: [
          '抓住新創風口與爆款紅利迅速獲利',
          '賺取第一桶金後設立資本止盈線，轉入信託或房產',
          '戒絕賭博、投機合約與灰色地帶交易'
        ],
        conditions: { required, bonus, breaking },
        source: '《紫微斗數骨髓賦·火貪鈴貪》'
      });
    }
  }

  // 7. 機月同梁格：天機、太陰、天同、天梁齊會三方四正
  if (sfStars.has('天機') && sfStars.has('太陰') && sfStars.has('天同') && sfStars.has('天梁')) {
    const required = ['天機、太陰、天同、天梁四星齊入命遷財官三方四正'];
    const bonus: string[] = [];
    const breaking: string[] = [];
    if (sfStars.has('文昌') || sfStars.has('文曲')) bonus.push('昌曲相會，儒雅非凡');
    if (sanFangShaCount(palaces, mingIdx, SHA_HARD) >= 3) breaking.push('煞星過多（機月同梁最忌煞曜侵蝕）');

    detected.push({
      id: 'p_jiyue',
      name: '機月同梁格',
      category: 'auspicious',
      categoryLabel: '文職能臣格局',
      palaceIndex: mingIdx,
      palaceName: '命宮三方',
      classicalQuote: '「機月同梁作吏人，文職安泰，一生溫厚。」——《紫微斗數全書》',
      modernPsychology: '細緻周全、謀定而後動，最適合在專業技術體系中憑藉智慧與長期主義深耕。',
      breakthroughAdvice: '切忌過度保守安逸而錯失時代躍升良機，宜在大平台上爭取核心專案主導權。',
      actionGuidance: [
        '選擇公職、大型跨國集團、高階科研或醫療健康領域',
        '建立精細化之工作流程與標準化運作手冊',
        '多涉獵宏觀戰略規劃，補足開創魄力'
      ],
      conditions: { required, bonus, breaking },
      source: '《紫微斗數全書·機月同梁格》'
    });
  }

  // 8. 殺破狼格：七殺、破軍、貪狼齊會三方四正
  if (sfStars.has('七殺') && sfStars.has('破軍') && sfStars.has('貪狼')) {
    const required = ['七殺、破軍、貪狼三星齊入命宮三方四正'];
    const bonus: string[] = [];
    const breaking: string[] = [];
    if (sfStars.has('化祿') || sfStars.has('化權')) bonus.push('逢生年祿權引動，開創得力');
    if (hasSha(mingGong, SHA_HARD)) breaking.push('命宮坐煞曜（波折多起伏）');

    detected.push({
      id: 'p_shapolang',
      name: '殺破狼格',
      category: 'special',
      categoryLabel: '開拓變革星系',
      palaceIndex: mingIdx,
      palaceName: '命宮三方',
      classicalQuote: '「七殺破軍貪狼，動蕩開闢之局。不入平凡，志在四方。」——《紫微斗數全書》',
      modernPsychology: '生命充滿革命開創動能，敢破敢立，在動態環境與不確定性中反而如魚得水。',
      breakthroughAdvice: '年輕時需戒驕戒躁、避免意氣用事，隨年齡增長逐步學會妥協與守成智慧。',
      actionGuidance: [
        '投身新興賽道、創業拓荒或高挑戰性業務崗位',
        '大動盪時保持清醒，設立止損安全邊界',
        '學會傾聽團隊回饋，避免獨斷專行'
      ],
      conditions: { required, bonus, breaking },
      source: '《紫微斗數全書·殺破狼》'
    });
  }

  // 9. 石中隱玉格：巨門坐命子宮或午宮
  if (hasStar(mingGong, '巨門') && (mingGong.earthlyBranch === '子' || mingGong.earthlyBranch === '午')) {
    const required = [`巨門星入命於${mingGong.earthlyBranch}宮`];
    const bonus: string[] = [];
    const breaking: string[] = [];
    if (getStarMutagen(mingGong, '巨門') === '祿' || getStarMutagen(mingGong, '巨門') === '權') {
      bonus.push('巨門化祿或化權，口才生財、權威得立');
    }
    if (getStarMutagen(mingGong, '巨門') === '忌') breaking.push('巨門化忌（玉藏泥沼，是非叢生）');

    detected.push({
      id: 'p_shizhong',
      name: '石中隱玉格',
      category: 'auspicious',
      categoryLabel: '韜光養晦格局',
      palaceIndex: mingIdx,
      palaceName: '命宮',
      classicalQuote: '「石中隱玉，早年沉潛，晚成大器。巨門在子午，才華內蘊。」——《紫微斗數骨髓賦》',
      modernPsychology: '早年多遭誤解或懷才不遇，歷經磨練後方顯深邃智慧與一語中的之口才威力。',
      breakthroughAdvice: '早期宜低調蓄積能量，切勿爭一時口舌之快；中年後以專業洞察一戰成名。',
      actionGuidance: [
        '從事諮詢顧問、涉外談判、法務研發或深度傳播',
        '說話三思後行，將批判本能轉為建設性洞見',
        '堅持長期主義，靜待三十歲後厚積薄發'
      ],
      conditions: { required, bonus, breaking },
      source: '《紫微斗數骨髓賦·石中隱玉》'
    });
  }

  // 10. 明珠出海格：命在未宮無主星，對宮丑宮太陽太陰同度朝照
  if (mingGong.earthlyBranch === '未' && mingGong.majorStars.length === 0) {
    const chouPalace = palaces.find(p => p.earthlyBranch === '丑');
    if (chouPalace && hasStar(chouPalace, '太陽') && hasStar(chouPalace, '太陰')) {
      detected.push({
        id: 'p_mingzhu',
        name: '明珠出海格',
        category: 'auspicious',
        categoryLabel: '白手起家名格',
        palaceIndex: mingIdx,
        palaceName: '命宮',
        classicalQuote: '「命坐未宮無正曜，丑宮日月同臨照。號曰明珠出海，前程似錦。」——《紫微斗數全集》',
        modernPsychology: '善於虛懷若谷借力使力，吸收各方資源為己所用，中晚年遠赴外鄉開創新天地。',
        breakthroughAdvice: '宜大膽跨出舒適圈，至沿海或國際大都市發展，事業版圖將豁然開朗。',
        actionGuidance: [
          '主動尋求跨國出差、外派或跨地域業務拓展',
          '善用對象思維，保持靈活機動的合作身段',
          '強化自媒體或公眾傳播影響力'
        ],
        conditions: { required: ['命宮在未為空宮', '對宮丑宮太陽太陰同宮拱照'] },
        source: '《紫微斗數全集·明珠出海》'
      });
    }
  }

  // 11. 輔弼夾命格 / 昌曲夾命格 / 魁鉞夾命格 / 日月夾命格
  const { prev: prevPalace, next: nextPalace } = getJiaPalaces(palaces, mingIdx);
  if (prevPalace && nextPalace) {
    // 輔弼夾命
    if ((hasStar(prevPalace, '左輔') && hasStar(nextPalace, '右弼')) || (hasStar(prevPalace, '右弼') && hasStar(nextPalace, '左輔'))) {
      detected.push({
        id: 'p_fubi_jia',
        name: '輔弼夾命格',
        category: 'auspicious',
        categoryLabel: '終身福厚貴格',
        palaceIndex: mingIdx,
        palaceName: '命宮兩夾',
        classicalQuote: '「左輔右弼夾命宮，終身福厚貴人逢。逢難有救，一生安泰。」——《紫微斗數全書》',
        modernPsychology: '人際信任資產極高，行事常能左右逢源，身旁總有得力摯友與長輩默默護航。',
        breakthroughAdvice: '廣結善緣、重視團隊利益分潤，善用強大人脈護城河實現穩健擴張。',
        actionGuidance: [
          '建立日常人脈感謝與價值互通機制',
          '多主導協調溝通型專案，居中整合資源',
          '在組織中以德服人，構建堅實信賴同盟'
        ],
        conditions: { required: ['左輔、右弼分居命宮前後兩宮夾照'] },
        source: '《紫微斗數全書·輔弼夾命》'
      });
    }

    // 昌曲夾命
    if ((hasStar(prevPalace, '文昌') && hasStar(nextPalace, '文曲')) || (hasStar(prevPalace, '文曲') && hasStar(nextPalace, '文昌'))) {
      detected.push({
        id: 'p_changqu_jia',
        name: '昌曲夾命格',
        category: 'auspicious',
        categoryLabel: '才華橫溢貴格',
        palaceIndex: mingIdx,
        palaceName: '命宮兩夾',
        classicalQuote: '「文昌文曲夾命宮，才名高顯翰墨通。科甲連登，文華四海。」——《紫微斗數全書》',
        modernPsychology: '文思泉湧、感知力超群，具備卓越之文化審美、文案策劃與文字表達天賦。',
        breakthroughAdvice: '將才華轉化為商業專利或版權資產，避免沉溺於空想文人情懷。',
        actionGuidance: [
          '重視智慧財產權與原創著作商標保護',
          '將專業內容透過數位媒體高效傳播',
          '培養理性商業變現與定價思維'
        ],
        conditions: { required: ['文昌、文曲分居命宮前後兩宮夾照'] },
        source: '《紫微斗數全書·昌曲夾命》'
      });
    }

    // 日月夾命
    if ((hasStar(prevPalace, '太陽') && hasStar(nextPalace, '太陰')) || (hasStar(prevPalace, '太陰') && hasStar(nextPalace, '太陽'))) {
      detected.push({
        id: 'p_riyue_jia',
        name: '日月夾命格',
        category: 'auspicious',
        categoryLabel: '光輝照耀名格',
        palaceIndex: mingIdx,
        palaceName: '命宮兩夾',
        classicalQuote: '「日月夾命，不貴即富。光明相照，前程萬里。」——《紫微斗數全書》',
        modernPsychology: '父母雙親或男女貴人庇蔭深厚，眼界格局開闊，行事光明磊落。',
        breakthroughAdvice: '珍惜先天資源優勢，在正道上開疆拓土，切忌因優渥環境而懈怠奮鬥。',
        actionGuidance: [
          '爭取社會公眾度高或主流產業之標竿專案',
          '行事坦蕩公正，建立正向公信力形象',
          '傳承家庭優良門風與資本經驗'
        ],
        conditions: { required: ['太陽、太陰分居命宮前後兩宮夾照'] },
        source: '《紫微斗數全書·日月夾命》'
      });
    }
  }

  // 12. 惡格/破格深度識別（附現代改運破局指南）
  // 羊陀夾忌格
  const hasJiInMing = getAllStars(mingGong).some(s => s.mutagen === '忌');
  if (hasJiInMing && prevPalace && nextPalace) {
    const isYangTuo = (hasStar(prevPalace, '擎羊') && hasStar(nextPalace, '陀羅')) || (hasStar(prevPalace, '陀羅') && hasStar(nextPalace, '擎羊'));
    if (isYangTuo) {
      detected.push({
        id: 'p_yangtuo_jiaji',
        name: '羊陀夾忌格',
        category: 'challenging',
        categoryLabel: '身心重壓破局格',
        palaceIndex: mingIdx,
        palaceName: '命宮',
        classicalQuote: '「羊陀夾忌為敗局，勞碌奔波，內外交困。」——《紫微斗數骨髓賦》',
        modernPsychology: '主觀焦慮與客觀現實阻力（左右為難、小人掣肘）雙重夾擊，易陷入精神內耗。',
        breakthroughAdvice: '古法視為凶格，現代認知實為「倒逼深度修為之淬鍊機遇」。最宜斷捨離，收斂戰線專注單點突破。',
        actionGuidance: [
          '大幅簡化人際關係圈，遠離消耗型社交',
          '建立客觀風險防火牆，杜絕借貸與高槓桿投機',
          '修煉心理抗壓定力，凡事給自己預留緩衝彈性'
        ],
        conditions: { required: ['化忌星坐命宮', '擎羊、陀羅分居命宮前後兩宮夾照'] },
        source: '《紫微斗數骨髓賦·羊陀夾忌》'
      });
    }
  }

  // 鈴昌陀武格
  if (sfStars.has('鈴星') && sfStars.has('文昌') && sfStars.has('陀羅') && sfStars.has('武曲')) {
    detected.push({
      id: 'p_lingchangtuowu',
      name: '鈴昌陀武格',
      category: 'challenging',
      categoryLabel: '重大決策防線格',
      palaceIndex: mingIdx,
      palaceName: '命宮三方',
      classicalQuote: '「鈴昌陀武，限至投河。戒在衝動，慎守定力。」——《紫微斗數骨髓賦》',
      modernPsychology: '在極端壓力或合同文書交界之際，容易因情緒壓抑過度而產生非理性決策衝動。',
      breakthroughAdvice: '古文「投河」為古典警示語，現代意指「財務流動性或合約重大違約斷裂」。嚴格遵守契約審查與情緒冷靜期。',
      actionGuidance: [
        '凡遇重大法律、投資或財務契約，必請專業律師審閱',
        '重大決策設定「48小時強制冷靜思考期」',
        '重視水上安全與交通行車安全管理'
      ],
      conditions: { required: ['鈴星、文昌、陀羅、武曲四星齊會三方四正'] },
      source: '《紫微斗數骨髓賦·鈴昌陀武》'
    });
  }

  // 巨火羊格
  if (sfStars.has('巨門') && sfStars.has('火星') && sfStars.has('擎羊')) {
    detected.push({
      id: 'p_juhuoyang',
      name: '巨火羊格',
      category: 'challenging',
      categoryLabel: '情緒口舌防破格',
      palaceIndex: mingIdx,
      palaceName: '命宮三方',
      classicalQuote: '「巨火羊星同度會，終身口舌，戒怒防禍。」——《紫微斗數骨髓賦》',
      modernPsychology: '個性剛直激烈、言辭銳利如刀，易在無意間得罪小人或引發公關對立危機。',
      breakthroughAdvice: '修口德即是修財富，將銳利的辨識力轉為客觀學術研究或產品除錯，私下待人以溫厚為本。',
      actionGuidance: [
        '生氣時嚴禁即時發送郵件、訊息或公開發文',
        '學習非暴力溝通，多肯定他人努力',
        '將敏銳的批判力投入至精密代碼、審計或品管領域'
      ],
      conditions: { required: ['巨門、火星、擎羊三星齊會三方四正'] },
      source: '《紫微斗數骨髓賦·巨火羊》'
    });
  }

  // 馬頭帶箭格
  if (mingGong.earthlyBranch === '午' && hasStar(mingGong, '擎羊')) {
    const hasLucky = sfStars.has('七殺') || sfStars.has('天魁') || sfStars.has('天鉞');
    detected.push({
      id: 'p_matou',
      name: '馬頭帶箭格',
      category: hasLucky ? 'special' : 'challenging',
      categoryLabel: '鎮守邊關將星格',
      palaceIndex: mingIdx,
      palaceName: '命宮',
      classicalQuote: '「馬頭帶箭，鎮守邊疆。擎羊在午，武職崢嶸。」——《紫微斗數骨髓賦》',
      modernPsychology: '魄力雷厲風行、敢打硬仗，能在極度艱困或充滿敵意的競爭環境中殺出一條血路。',
      breakthroughAdvice: '殺氣太重易折，需培養慈悲溫和之心，大成之時多行社會善舉以化解血光之氣。',
      actionGuidance: [
        '適合高風險高回報開創、救難醫療、法官檢察或重工領域',
        '定期主動捐血、從事慈善醫療救助以轉化金煞',
        '學會急流勇退，不可窮兵黷武過度消耗身體'
      ],
      conditions: { 
        required: ['擎羊星於午宮坐命'],
        bonus: hasLucky ? ['再會七殺或天魁天鉞，威震邊界'] : undefined
      },
      source: '《紫微斗數骨髓賦·馬頭帶箭》'
    });
  }

  // 雙星同宮與自化深入剖析
  const doubleMutagens = analyzeDoubleMutagensAndSpecialJi(palaces);

  // 診斷祿隨忌走循環
  let luSuiJiZou: LuSuiJiZouDiagnosis | null = null;
  const jiPalace = palaces.find(p => getAllStars(p).some(s => s.mutagen === '忌'));
  const luPalace = palaces.find(p => getAllStars(p).some(s => s.mutagen === '祿'));

  if (jiPalace && luPalace && jiPalace.index !== luPalace.index) {
    const jiStar = getAllStars(jiPalace).find(s => s.mutagen === '忌')?.name || '主星';
    const luStar = getAllStars(luPalace).find(s => s.mutagen === '祿')?.name || '主星';

    luSuiJiZou = {
      jiPalace: {
        index: jiPalace.index,
        name: jiPalace.name,
        branch: jiPalace.earthlyBranch,
        star: jiStar,
        psychologicalVoid: `在【${jiPalace.name}】宮位容易感到不安全感、匱乏焦慮或難以滿足之執念。`
      },
      luPalace: {
        index: luPalace.index,
        name: luPalace.name,
        branch: luPalace.earthlyBranch,
        star: luStar,
        desireProjection: `試圖藉由在【${luPalace.name}】宮位大量投注熱情、金錢或關係來填補心靈黑洞。`
      },
      interplaySummary: `生年化祿入【${luPalace.name}】，化忌落【${jiPalace.name}】。正統欽天四化指出：「祿為起因，忌為歸宿；祿隨忌走，吉凶同源。」當你在【${luPalace.name}】過度擴張欲望時，最終能量全數流向【${jiPalace.name}】承擔壓力考驗。`,
      keRationalBoundary: '啟動命盤化科之理性智慧：在欲望起心動念時，設立清晰界線，客觀評估代價，不盲目填補黑洞。',
      quanExecutionPower: '運用化權之邊界掌控力：親自定立規則與風控防線，把化忌的執念昇華為精專技術之深沉底力。'
    };
  }

  const overallSummary = detected.length > 0
    ? `命盤共識別出 ${detected.length} 大核心古典格局（含 ${detected.filter(d => d.category === 'auspicious').length} 吉格、${detected.filter(d => d.category === 'challenging').length} 警示格）。古賦格局乃先天氣候器量之映照，配合後天現代知命修為，自能趨吉避凶、造命圓滿。`
    : '命盤星曜配置平和流通，無極端偏枯之重格，一生穩健自主，最利依大運流年之引導順勢而為。';

  return {
    detectedPatterns: detected,
    doubleMutagens,
    luSuiJiZou,
    overallBreakthroughSummary: overallSummary
  };
}
