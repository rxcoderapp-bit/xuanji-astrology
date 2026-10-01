/**
 * 紫微陽宅居家風水羅盤演算法 (Ziwei Home Fengshui Compass Engine)
 * 知識底座源自：《陽宅宮位八卦通考》、《紫微居家磁場調理心法》
 * （嚴格去除所有個人姓名，純粹正統八卦方位與星曜五行磁場調理體系）
 */

import type { PalaceData } from '../types';

export interface FengshuiSector {
  directionName: string; // e.g. '西北 (乾卦)'
  guaName: string; // 乾、坤、坎、離、震、巽、艮、兌
  element: string; // 金、木、水、火、土
  palaceIndex: number;
  palaceName: string; // e.g. '田宅宮'
  earthlyBranch: string; // '亥'
  majorStars: string[];
  mutagens: string[];
  hasShaStars: boolean;
  shaStars: string[];
  sectorStatus: 'optimal' | 'good' | 'caution' | 'critical';
  statusLabel: string;
  energyDescription: string;
  practicalHomeGuidance: string; // 居家擺設與磁場調理錦囊
  avoidances: string; // 禁忌警示
}

export interface FengshuiAnalysisResult {
  sectors: FengshuiSector[];
  wealthSanctuarySector: FengshuiSector; // 核心財庫守護位（田宅宮）
  cashflowSector: FengshuiSector; // 現金流生旺位（財帛宮）
  careerVigorSector: FengshuiSector; // 文昌事業開展位（官祿宮）
  criticalWarningSectors: FengshuiSector[]; // 煞忌重點調理方位
  overallFengshuiSummary: string;
}

// 十二地支對應八卦方位表
const BRANCH_TO_GUA: Record<string, { dir: string; gua: string; elem: string }> = {
  '子': { dir: '正北', gua: '坎卦', elem: '水' },
  '丑': { dir: '東北偏北', gua: '艮卦', elem: '土' },
  '寅': { dir: '東北偏東', gua: '艮卦', elem: '土' },
  '卯': { dir: '正東', gua: '震卦', elem: '木' },
  '辰': { dir: '東南偏東', gua: '巽卦', elem: '木' },
  '巳': { dir: '東南偏南', gua: '巽卦', elem: '木' },
  '午': { dir: '正南', gua: '離卦', elem: '火' },
  '未': { dir: '西南偏南', gua: '坤卦', elem: '土' },
  '申': { dir: '西南偏西', gua: '坤卦', elem: '土' },
  '酉': { dir: '正西', gua: '兌卦', elem: '金' },
  '戌': { dir: '西北偏西', gua: '乾卦', elem: '金' },
  '亥': { dir: '西北偏北', gua: '乾卦', elem: '金' }
};

export function analyzeHomeFengshui(palaces: PalaceData[]): FengshuiAnalysisResult {
  const sectors: FengshuiSector[] = [];
  const shaStarNames = ['擎羊', '陀羅', '火星', '鈴星', '地空', '地劫'];

  for (const p of palaces) {
    const guaInfo = BRANCH_TO_GUA[p.earthlyBranch] || { dir: '正北', gua: '坎卦', elem: '水' };
    const majorNames = p.majorStars.map(s => s.name);
    const muts = p.majorStars.filter(s => s.mutagen).map(s => `${s.name}化${s.mutagen}`);
    
    // 煞星檢測
    const foundSha = [
      ...p.majorStars.filter(s => shaStarNames.includes(s.name)),
      ...p.minorStars.filter(s => shaStarNames.includes(s.name))
    ].map(s => s.name);

    const hasJi = muts.some(m => m.includes('化忌'));
    const hasLu = muts.some(m => m.includes('化祿'));
    const hasQuan = muts.some(m => m.includes('化權'));

    let status: FengshuiSector['sectorStatus'] = 'good';
    let statusLabel = '吉順平穩';

    if (hasLu || hasQuan) {
      status = 'optimal';
      statusLabel = '生機聚氣位';
    }
    if (foundSha.length > 0 && hasJi) {
      status = 'critical';
      statusLabel = '重度化煞位';
    } else if (foundSha.length > 0 || hasJi) {
      status = 'caution';
      statusLabel = '注意調理位';
    }

    // 依據宮位與星曜產出具體家居指南
    let energyDesc = `對應本命【${p.name}】，八卦屬${guaInfo.elem}（${guaInfo.gua}）。此方位磁場深刻投射您在日常生活中「${p.name}」事務之心態與運氣流動。`;
    let guidance = '';
    let avoidance = '';

    if (p.name === '田宅宮') {
      guidance = `【核心聚財庫位】：保持此方位極度整潔、空氣流通、採光溫暖。可在此處擺放保險箱、天然黃水晶聚寶盆或大葉厚重之綠色植物（如發財樹、龜背芋），鎖住家庭資產。`;
      avoidance = `嚴禁堆放破損家電、換季舊鞋靴或污穢垃圾桶；切忌光線昏暗陰濕，防家財暗中流失。`;
    } else if (p.name === '官祿宮') {
      guidance = `【事業功名生旺位】：適宜作為書房、辦公桌所在方位。桌面擺放乾淨筆筒、文昌竹或明亮檯燈，能大幅催動專業思維靈感與晉升權威。`;
      avoidance = `切忌將此方位作為雜物間或寵物便器處，防職場遇小人牽絆或專案停滯不前。`;
    } else if (p.name === '財帛宮') {
      guidance = `【現金流源泉位】：宜擺設流動活水滾球、天然白水晶柱或乾淨金屬鐘錶，借金水相生生旺日常商務現金周轉與交易進賬。`;
      avoidance = `嚴禁擺放漏水水龍頭、枯萎植物或尖銳刀剪利刃，防破耗無度與意外開銷。`;
    } else if (p.name === '夫妻宮') {
      guidance = `【親密和諧鸞鳳位】：宜擺放成雙成對之圓潤裝飾品、溫馨暖色調燈飾或伴侶幸福合照，促進情感溝通與相處包容。`;
      avoidance = `切忌擺設帶刺仙人掌、孤鳥猛獸畫作或破損鏡面，防夫妻言語摩擦或感情冷淡。`;
    } else {
      if (status === 'critical' || status === 'caution') {
        guidance = `【煞忌化解策略】：此方位見煞星（${foundSha.join('、') || '化忌'}），磁場容易燥熱或凝滯。建議徹底清掃死角，掛置一盞暖色鹽燈（藉由熱能散發負離子），並點燃純天然艾草或檀香淨化空間。`;
        avoidance = `避免長期在此方位昏睡或堆積未拆封之快遞紙箱，減少電器雜亂延長線之磁場干擾。`;
      } else {
        guidance = `【和諧守中】：維持日常乾淨清爽即可。可根據五行（${guaInfo.elem}）放置相應溫和軟裝飾品，營造舒心氛圍。`;
        avoidance = `避免過度大興土木或在此敲敲打打，保持氣場恆定。`;
      }
    }

    sectors.push({
      directionName: `${guaInfo.dir} (${guaInfo.gua})`,
      guaName: guaInfo.gua,
      element: guaInfo.elem,
      palaceIndex: p.index,
      palaceName: p.name,
      earthlyBranch: p.earthlyBranch,
      majorStars: majorNames,
      mutagens: muts,
      hasShaStars: foundSha.length > 0,
      shaStars: foundSha,
      sectorStatus: status,
      statusLabel,
      energyDescription: energyDesc,
      practicalHomeGuidance: guidance,
      avoidances: avoidance
    });
  }

  const wealth = sectors.find(s => s.palaceName === '田宅宮') || sectors[0];
  const cashflow = sectors.find(s => s.palaceName === '財帛宮') || sectors[1];
  const career = sectors.find(s => s.palaceName === '官祿宮') || sectors[2];
  const critical = sectors.filter(s => s.sectorStatus === 'critical' || s.sectorStatus === 'caution');

  const summary = `本陽宅風水羅盤將您命盤中十二宮位全息映射至住宅八個物理方位。住宅是生命的物理硬體外殼，磁場調理不在於大興土木迷信擺陣，而在於「引吉化生旺氣，清理死角化解煞忌」。您府上最重要的【核心財庫位】坐落於【${wealth.directionName}】，【文昌事業位】坐落於【${career.directionName}】。只要將這兩大核心方位與需要調理的 ${critical.length} 處方位按錦囊修持，便能營造天人相應之安居旺運福邸。`;

  return {
    sectors,
    wealthSanctuarySector: wealth,
    cashflowSector: cashflow,
    careerVigorSector: career,
    criticalWarningSectors: critical,
    overallFengshuiSummary: summary
  };
}
