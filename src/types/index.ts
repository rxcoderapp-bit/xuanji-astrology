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

export type DivinationMethod = 'horary' | 'numbers';

export interface DivinationResult {
  question: string;
  category: DivinationCategory;
  castTime: string;
  method: DivinationMethod;
  numbers?: [number, number, number];
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
