export type Gender = '男' | '女';

export type CalendarType = 'solar' | 'lunar';

export type BrightnessGrade = '廟' | '旺' | '得' | '利' | '平' | '陷' | '不';

export type MutagenType = '祿' | '權' | '科' | '忌';

export type LayerType = 'natal' | 'decadal' | 'yearly' | 'age' | 'monthly' | 'daily' | 'hourly';

export interface BirthInput {
  name: string;
  gender: Gender;
  calendar: CalendarType;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  isLeapMonth?: boolean;
}

export interface CaseRecord extends BirthInput {
  id: string;
  category: string; // '自訂' | '客戶' | '親友' | '命理研究' | '經典命例'
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StarInfo {
  name: string;
  type: 'major' | 'soft' | 'hard' | 'adj';
  brightness?: BrightnessGrade | string;
  mutagen?: MutagenType | string;
  scope?: 'origin' | 'decadal' | 'yearly' | 'monthly' | 'daily' | 'hourly';
}

export interface PalaceData {
  index: number; // 0..11 (0=寅, 1=卯, ..., 11=丑)
  earthlyBranch: string; // 寅卯辰...
  heavenlyStem: string; // 甲乙丙...
  name: string; // 命宮, 兄弟, 夫妻...
  isBodyPalace: boolean; // 是否為身宮
  isOriginalPalace: boolean; // 是否為來因宮
  
  // Stars
  majorStars: StarInfo[];
  minorStars: StarInfo[];
  adjectiveStars: StarInfo[];
  
  // Transit / Overlapping Names
  decadalName?: string; // 大限命宮, 大限財帛...
  yearlyName?: string; // 流年命宮, 流年財帛...
  monthlyName?: string;
  dailyName?: string;
  hourlyName?: string;

  // Flow Stars (流曜)
  flowStars?: StarInfo[];

  // Age Ranges
  decadalRange: [number, number]; // e.g. [23, 32]
  ages: number[]; // 小限年齡清單 e.g. [11, 23, 35, 47, 59, 71]

  // Twelve Gods (神煞)
  changsheng12: string; // 長生十二神 (長生, 沐浴, 冠帶, 臨官, 帝旺, 衰, 病, 死, 墓, 絕, 胎, 養)
  boshi12: string; // 博士十二神 (博士, 力士, 青龍, 小耗...)
  jiangqian12: string; // 將前十二神
  suiqian12: string; // 歲前十二神

  // Palace Self Mutagen (宮干自化)
  selfMutagens: { star: string; mutagen: MutagenType }[];
}

export interface HoroscopeState {
  activeLayer: LayerType;
  targetDate: string; // 'YYYY-MM-DD'
  targetTimeIndex: number; // 0..11
  
  // Active units
  selectedDecadeIndex: number; // 0..9 (index in decadalList)
  selectedYear: number;
  selectedMonth: number; // lunar month 1..12
  selectedDay: number; // lunar day 1..30
  selectedHourIndex: number; // 0..11

  // Transit Data from iztro
  decadalInfo?: {
    name: string;
    stem: string;
    branch: string;
    ageRange: [number, number];
    palaceIndex: number; // where decadal life palace lands
    mutagens: { star: string; mutagen: MutagenType }[];
  };
  yearlyInfo?: {
    year: number;
    nominalAge: number;
    stem: string;
    branch: string;
    palaceIndex: number;
    mutagens: { star: string; mutagen: MutagenType }[];
  };
  monthlyInfo?: {
    month: number;
    stem: string;
    branch: string;
    palaceIndex: number;
    mutagens?: { star: string; mutagen: MutagenType }[];
  };
  dailyInfo?: {
    day: number;
    stem: string;
    branch: string;
    palaceIndex: number;
  };
  hourlyInfo?: {
    hourName: string;
    stem: string;
    branch: string;
    palaceIndex: number;
  };
  ageInfo?: {
    nominalAge: number;
    palaceIndex: number;
  };
}

export interface BaziPillar {
  stem: string;
  branch: string;
  stemShiShen: string;
  branchShiShen: string;
  nayin: string;
  hiddenStems: { stem: string; shishen: string }[];
}

export interface BaziData {
  year: BaziPillar;
  month: BaziPillar;
  day: BaziPillar;
  hour: BaziPillar;
  dayMaster: string;
  dayMasterStrength: '極旺' | '偏旺' | '中和' | '偏弱' | '極弱';
  fiveElements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  taiYuan: string;
  mingGong: string;
  shenGong: string;
  dayunList: { age: string; ganZhi: string }[];
}

export interface SanFangSiZheng {
  selfIndex: number;
  oppositeIndex: number; // 對宮 (沖)
  trine1Index: number; // 三合一 (照)
  trine2Index: number; // 三合二 (照)
  flankPrevIndex: number; // 夾宮前 (夾)
  flankNextIndex: number; // 夾宮後 (夾)
}

// ================== 紫微斗數占卜 (Divination) 類型 ==================

export type DivinationCategory = 
  | '事業工作' 
  | '求財投資' 
  | '感情婚姻' 
  | '合作商機' 
  | '健康平安' 
  | '置產買房' 
  | '考試升遷' 
  | '訴訟是非' 
  | '重大抉擇';

export type DivinationMethod = 'horary' | 'numbers' | 'coins';

export interface TrigramInfo {
  name: string;      // 乾、坤、震、巽、坎、離、艮、兌
  symbol: string;    // ☰, ☷, ☳, ☴, ☵, ☲, ☶, ☱
  element: string;   // 金、木、水、火、土
  nature: string;    // 天、地、雷、風、水、火、山、澤
}

export type HexagramLineType = 'yang' | 'yin' | 'moving_yang' | 'moving_yin';

export interface DivinationTimingPhases {
  germination: string; // 萌芽發端期 (近期徵兆與初現動向)
  climax: string;      // 激化轉折期 (衝突高潮與關鍵變數)
  resolution: string;  // 定局結算期 (終局水落石出之農曆月日)
}

export interface DivinationResult {
  question: string;
  category: DivinationCategory;
  castTime: string;
  method: DivinationMethod;
  numbers?: [number, number, number];
  coinsTosses?: number[][]; // 6 rounds of 3 coin values [2,3,2...]
  targetPalaceIndex: number;
  targetPalaceName: string;
  oppositePalaceName: string;
  majorStars: StarInfo[];
  minorStars: StarInfo[];
  sihuaImpact: string[];
  outcomeGrade: '大吉' | '吉' | '小吉' | '平' | '小凶' | '凶' | '大凶';
  score: number; // -100 ~ +100
  verdict: string; // 斷語結論
  detailedAnalysis: string; // 詳析
  actionPlan: string; // 錦囊妙計
  timingWindow: string; // 應期預測
  // ===== 易經 64 卦 ✕ 紫微星卦合參 (升級屬性) =====
  hexagramName: string;            // 卦名 (如: 地天泰、火天大有、水火既濟)
  hexagramSymbol: string;          // 卦畫符號 (如: ䷊, ䷍)
  upperTrigram: TrigramInfo;       // 上卦 (外卦)
  lowerTrigram: TrigramInfo;       // 下卦 (內卦)
  hexagramLines: HexagramLineType[]; // 六爻由初至上 (index 0 ~ 5)
  movingLineIndex: number;         // 動爻數 (1 ~ 6，0 為無動爻靜卦)
  hexagramJudgment: string;        // 卦辭與象傳
  movingLineText: string;          // 動爻爻辭斷語
  starHexagramResonance: string;   // 星卦合參深批
  timingPhases: DivinationTimingPhases; // 三階動態應期
  classicalAphorisms: string[];    // 古籍神課原典引證
}

export interface DivinationRecord extends DivinationResult {
  id: string;
  createdAt: string;
  aiAnalysis?: string;
}

// ================== AI 全局解盤設定類型 ==================

export type AIProvider = 'gemini' | 'openrouter';

export interface AISettings {
  provider: AIProvider;
  geminiApiKey: string;
  geminiModel: string;
  openrouterApiKey: string;
  openrouterModel: string;
  customBaseUrl?: string;
  temperature: number;
}

// ================== 雙軌合參 (Dual-Track Resonance) 類型 ==================

export interface ElementEnergyDetail {
  element: '木' | '火' | '土' | '金' | '水';
  score: number;       // 絕對分值 (0 ~ 100)
  percentage: number;  // 佔比百分比
  status: '極旺' | '旺' | '平和' | '休囚' | '極弱';
  characteristics: string; // 性情與臟腑對應
}

export interface DualTrackEnergyData {
  elements: Record<'wood' | 'fire' | 'earth' | 'metal' | 'water', ElementEnergyDetail>;
  dayMaster: string;
  dayMasterElement: string;
  dayMasterStrength: '極旺' | '偏旺' | '中和' | '偏弱' | '極弱';
  favorableElements: string[];   // 喜用神 (如: 木、火)
  unfavorableElements: string[]; // 忌仇神 (如: 金、水)
  patternName: string;           // 先天格局 (如: 正印格、食神生財格、從旺格)
  climateDescription: string;    // 四季氣候調候綜評
}

export interface StarGodResonanceItem {
  palaceName: string;
  starNames: string[];
  tenGods: string[];
  resonanceLevel: '天作之合' | '相輔相成' | '剛柔並濟' | '同氣互耗' | '刑剋相抗';
  resonanceScore: number; // 0 ~ 100
  title: string;
  verdict: string;
}

export interface TimingResonanceItem {
  year: number;
  decadeStemBranch: string;
  yearlyStemBranch: string;
  score: number; // -100 ~ +100
  grade: '雙軌大吉' | '順風借勢' | '外吉內虛' | '暗生機兆' | '沉潛蓄力' | '雙軌重危';
  keyStars: string[];
  baziTriggers: string[];
  verdict: string;
  strategicAdvice: string;
}

// ================== 太微緣局·正緣桃花應期 (Love & Marriage) 類型 ==================

export type LoveYearType = 'true_love' | 'peach_blossom' | 'karmic_test' | 'peaceful';

export interface LoveFortuneYear {
  year: number;
  nominalAge: number;
  stemBranch: string;
  score: number; // 0 ~ 100
  type: LoveYearType;
  badge: string; // e.g. '⭐⭐⭐⭐⭐ 宿命正緣' | '⭐⭐⭐⭐ 心動桃花' | '⚠️ 情感磨合' | '🌱 靜好相守'
  title: string;
  baziSigns: string[];    // e.g. ['天干逢五合 (甲己合)', '夫宮逢六合 (辰酉合)']
  ziweiSigns: string[];   // e.g. ['流年夫妻宮天喜入度', '大限流年雙祿朝照']
  summary: string;
  advice: string;
}

export interface SpouseArchetype {
  spouseStars: string[];       // 斗數夫妻宮與日支十神
  dayBranch: string;           // 八字夫妻宮地支
  dayBranchTenGod: string;     // 日支十神
  personality: string;         // 性格氣質畫像
  appearanceTraits: string;    // 外貌特徵氣場
  careerDirection: string;     // 事業能力特點
  meetingScenarios: string;    // 遇見正緣情境機緣
  harmonyTips: string;         // 相處長久心法
}

export interface LoveMarriageAnalysis {
  spouseArchetype: SpouseArchetype;
  currentYearFortune: LoveFortuneYear;
  timeline: LoveFortuneYear[];
  bestYears: LoveFortuneYear[];
  overallLoveSummary: string;
}

// ================== 古籍 RAG 知識檢索與 AI Studio 類型 ==================

export type ClassicalCategory = 'ziwei' | 'bazi' | 'dualTrack' | 'love' | 'health' | 'iching';

export interface ClassicalCorpusItem {
  id: string;
  title: string;
  category: ClassicalCategory;
  categoryName: string;        // e.g. '紫微斗數' | '子平八字' | '雙軌合參' | '太微婚戀' | '五運中醫' | '易經術數'
  sourceBook: string;          // e.g. 《太微紫微賦全箋》, 《滴天髓體用精解》
  dynastyEra?: string;         // e.g. '古典正統傳承'
  keywords: string[];          // e.g. ['武曲', '財帛宮', '化祿']
  originalText: string;        // 古籍原文
  vernacularMeaning: string;   // 白話深解
  practicalGuidance: string;   // 現代落地應用錦囊
}

export interface RAGSearchResult {
  item: ClassicalCorpusItem;
  score: number;
  matchedKeywords: string[];
}

