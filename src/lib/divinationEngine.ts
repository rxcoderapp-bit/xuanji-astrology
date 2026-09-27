import type { 
  DivinationCategory, 
  DivinationMethod, 
  DivinationResult, 
  PalaceData 
} from '../types';
import { computeAstrolabe } from './iztroEngine';

// Category to primary Palace Name
const CATEGORY_PALACE_MAP: Record<DivinationCategory, string> = {
  '事業工作': '官祿',
  '求財投資': '財帛',
  '感情婚姻': '夫妻',
  '合作商機': '僕役',
  '健康平安': '疾厄',
  '置產買房': '田宅',
  '考試升遷': '父母',
  '訴訟是非': '父母',
  '重大抉擇': '命宮',
};

// Branch to Chinese Zodiac & Lunar Season
const BRANCH_TIMING: Record<string, string> = {
  '寅': '農曆正月 (立春時節，初顯端倪)',
  '卯': '農曆二月 (仲春時節，事態擴大)',
  '辰': '農曆三月 (季春時節，塵埃落定)',
  '巳': '農曆四月 (立夏時節，加速進展)',
  '午': '農曆五月 (仲夏時節，如日中天或矛盾爆發)',
  '未': '農曆六月 (季夏時節，關鍵轉折點)',
  '申': '農曆七月 (立秋時節，成果驗收或面臨考驗)',
  '酉': '農曆八月 (仲秋時節，秋水長天見分曉)',
  '戌': '農曆九月 (季秋時節，收尾或庫存盤整)',
  '亥': '農曆十月 (立冬時節，暗流湧動或蓄力)',
  '子': '農曆十一月 (仲冬時節，冰凍三尺需耐心)',
  '丑': '農曆十二月 (季冬時節，冬盡春來見終局)',
};

export function castZiweiDivination(
  question: string,
  category: DivinationCategory,
  method: DivinationMethod,
  numbers?: [number, number, number],
  currentChartPalaces?: PalaceData[]
): DivinationResult {
  const now = new Date();
  const castTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  let targetPalaces: PalaceData[] = [];

  if (method === 'horary' || !currentChartPalaces) {
    // Cast a standalone horary chart for the exact current moment
    const horaryInput = {
      name: `占問：${question.slice(0, 8)}`,
      gender: '男' as const,
      calendar: 'solar' as const,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      isLeapMonth: false
    };
    const horaryChart = computeAstrolabe(horaryInput);
    targetPalaces = horaryChart.palaces;
  } else {
    targetPalaces = currentChartPalaces;
  }

  // Find target palace based on category
  const targetName = CATEGORY_PALACE_MAP[category] || '命宮';
  let targetPalace = targetPalaces.find(p => p.name.includes(targetName)) || targetPalaces[0];

  // If using number casting method, apply offset
  if (method === 'numbers' && numbers && numbers.length === 3) {
    const offset = (numbers[0] - 1 + 12) % 12;
    targetPalace = targetPalaces[offset];
  }

  // Opposite palace
  const oppositeIndex = (targetPalace.index + 6) % 12;
  const oppositePalace = targetPalaces[oppositeIndex];

  // Evaluate lucky vs harmful stars
  let score = 0;
  const majorStars = targetPalace.majorStars;
  const minorStars = targetPalace.minorStars;
  const allPalaceStars = [...majorStars, ...minorStars];

  const sihuaImpact: string[] = [];

  // Major stars evaluation
  majorStars.forEach(s => {
    if (['廟', '旺'].includes(s.brightness || '')) score += 15;
    else if (['陷', '不'].includes(s.brightness || '')) score -= 15;
    else score += 5;

    if (s.mutagen === '祿') {
      score += 35;
      sihuaImpact.push(`【${s.name}化祿】：大吉大利，得天獨厚，必有豐厚回報或圓滿機遇。`);
    } else if (s.mutagen === '權') {
      score += 25;
      sihuaImpact.push(`【${s.name}化權】：強勢主導，競爭得勝，但須防剛愎自用招怨。`);
    } else if (s.mutagen === '科') {
      score += 20;
      sihuaImpact.push(`【${s.name}化科】：名譽貴人，大事化小，得輿論長輩鼎力相助。`);
    } else if (s.mutagen === '忌') {
      score -= 40;
      sihuaImpact.push(`【${s.name}化忌】：大凶阻滯，易生是非糾紛或期望落空，切忌冒進。`);
    }
  });

  // Minor lucky vs harmful
  minorStars.forEach(s => {
    if (['左輔', '右弼', '天魁', '天鉞', '祿存', '天馬'].includes(s.name)) {
      score += 15;
    } else if (['文昌', '文曲'].includes(s.name)) {
      score += 10;
    } else if (['擎羊', '陀羅', '火星', '鈴星', '地空', '地劫'].includes(s.name)) {
      score -= 18;
    }
  });

  // Opposite palace influence (40% weight)
  oppositePalace.majorStars.forEach(s => {
    if (s.mutagen === '忌') {
      score -= 25;
      sihuaImpact.push(`【對宮${s.name}化忌沖照】：外在環境暗藏巨大阻力與變數，防背後冷箭。`);
    } else if (s.mutagen === '祿') {
      score += 15;
      sihuaImpact.push(`【對宮${s.name}化祿照入】：外出逢貴，外在市場或外人能給予意外助力。`);
    }
  });

  // Self Mutagen
  targetPalace.selfMutagens.forEach(sm => {
    if (sm.mutagen === '忌') {
      score -= 20;
      sihuaImpact.push(`【宮位自化忌】：內部容易自我消耗或中途生變，心態需沉著。`);
    } else if (sm.mutagen === '祿') {
      score += 15;
      sihuaImpact.push(`【宮位自化祿】：樂觀釋放，好聚好散，凡事留有餘地。`);
    }
  });

  // Clamp score
  score = Math.max(-100, Math.min(100, score));

  // Determine outcome grade
  let outcomeGrade: DivinationResult['outcomeGrade'] = '平';
  if (score >= 60) outcomeGrade = '大吉';
  else if (score >= 30) outcomeGrade = '吉';
  else if (score >= 10) outcomeGrade = '小吉';
  else if (score >= -10) outcomeGrade = '平';
  else if (score >= -30) outcomeGrade = '小凶';
  else if (score >= -60) outcomeGrade = '凶';
  else outcomeGrade = '大凶';

  // Construct Verdict & Detailed Analysis
  const starNames = allPalaceStars.map(s => s.name).join('、') || '無明顯主星(借對宮)';
  
  let verdict = '';
  let detailedAnalysis = '';
  let actionPlan = '';

  if (outcomeGrade === '大吉' || outcomeGrade === '吉') {
    verdict = `【萬事俱備 · 水到渠成】事態發展極為順遂，天時地利皆備，所求之事終有圓滿回報。`;
    detailedAnalysis = `占問【${question}】，所落用神宮位為【${targetPalace.name} (${targetPalace.heavenlyStem}${targetPalace.earthlyBranch})】。宮內星曜匯聚【${starNames}】，吉星高照，格局清正。對宮【${oppositePalace.name}】互為拱照，主客相宜。若有四化吉曜引動，更主短期內將有突破性契機降臨。`;
    actionPlan = `1. 乘勝追擊：切莫瞻前顧後，宜在最佳時機主動出擊落實契約。\n2. 廣結善緣：借助長輩或外部合作夥伴之力，擴大成果規模。\n3. 慎防自滿：吉中防微杜漸，保留部分備用資金或備用方案。`;
  } else if (outcomeGrade === '小吉' || outcomeGrade === '平') {
    verdict = `【漸入佳境 · 需下苦功】目前形勢尚屬平穩，無大風大浪，然亦不可坐享其成，需步步為營。`;
    detailedAnalysis = `占問【${question}】，用神落在【${targetPalace.name}】。宮內星曜呈現吉凶交雜之象，雖無滅頂之凶，但亦缺乏雷霆萬鈞之助力。對宮【${oppositePalace.name}】沖照平和，顯示外在環境並未形成實質阻礙，成敗全繫於自身之執行力與細節把控。`;
    actionPlan = `1. 穩紮穩打：切忌急功近利或借貸冒險，以現有資源穩步推進。\n2. 釐清合約細節：凡事白紙黑字，防範溝通落差引發誤解。\n3. 借力使力：尋求專業顧問或信任之長輩複核關鍵決策。`;
  } else {
    verdict = `【暗礁四伏 · 宜守不宜動】當前磁場阻力甚劇，易生波折、口舌或資金斷流，暫勿強行突破。`;
    detailedAnalysis = `占問【${question}】，用神落在【${targetPalace.name}】。宮內逢凶煞星曜（如羊陀火鈴空劫化忌），氣場受挫。對宮或本宮引動之化忌力量主「虧欠、執念與阻滯」，極易因盲目樂觀或受他人牽連而蒙受損失。`;
    actionPlan = `1. 止損為先：暫緩重大資金投入或擴張計畫，以守成避險為最高原則。\n2. 避免正面衝突：若涉爭端訴訟，宜尋求第三方居中調停，大事化小。\n3. 修心沉澱：此乃考驗耐力之關鍵期，正好利用時間優化內部流程。`;
  }

  // Timing window prediction
  const branchTiming = BRANCH_TIMING[targetPalace.earthlyBranch] || '數月之內必有反饋';
  const timingWindow = `此卦應期緊扣地支【${targetPalace.earthlyBranch}】位，重點應驗時窗在【${branchTiming}】。屆時宮位磁場觸發，事態將迎來實質性轉折或最終答覆。`;

  return {
    question,
    category,
    castTime,
    method,
    numbers,
    targetPalaceIndex: targetPalace.index,
    targetPalaceName: targetPalace.name,
    oppositePalaceName: oppositePalace.name,
    majorStars,
    minorStars,
    sihuaImpact,
    outcomeGrade,
    score,
    verdict,
    detailedAnalysis,
    actionPlan,
    timingWindow
  };
}
