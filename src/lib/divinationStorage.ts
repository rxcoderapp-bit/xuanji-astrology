import type { DivinationRecord } from '../types';

const STORAGE_KEY = 'xuanji_divination_history_v1';

// Initial preloaded sample divination records
const DEFAULT_PRESET_DIVINATIONS: DivinationRecord[] = [
  {
    id: 'div_sample_1',
    createdAt: '2026-09-26 14:30:00',
    question: '合夥投資科技新創專案，後續獲利與風險如何？',
    category: '合作商機',
    castTime: '2026-09-26 14:30 (未時)',
    method: 'horary',
    targetPalaceIndex: 7,
    targetPalaceName: '僕役',
    oppositePalaceName: '兄弟',
    majorStars: [
      { name: '天府', type: 'major', brightness: '廟' },
      { name: '天相', type: 'major', brightness: '得', mutagen: '祿' }
    ],
    minorStars: [
      { name: '天魁', type: 'soft' },
      { name: '文昌', type: 'soft' }
    ],
    sihuaImpact: ['用神逢化祿，合作利益豐厚', '魁鉞貴人入照，得有力長官支援'],
    outcomeGrade: '大吉',
    score: 82,
    verdict: '【天火同人 · 亨通吉兆】此局得府相朝垣之吉，外部合作夥伴具備高度信用與專業壁壘。',
    detailedAnalysis: '用神僕役宮得天府廟旺鎮守，化祿生發財氣，天相主誠信契約。三方魁鉞相拱，代表此次合作並非普通小商務，而是具備長期格局之專案。',
    actionPlan: '1. 合約白紙黑字規範股權結構與退場機制。\n2. 充分借重對方之渠道優勢，自身專注技術研發。\n3. 進展宜快不宜遲，立冬前夕完成簽署最為妥貼。',
    timingWindow: '應期在農曆十月至十二月（亥子之月）見分曉。',
    hexagramName: '天火同人',
    hexagramSymbol: '䷌',
    upperTrigram: { name: '乾', symbol: '☰', element: '金', nature: '天' },
    lowerTrigram: { name: '離', symbol: '☲', element: '火', nature: '火' },
    hexagramLines: ['yang', 'yin', 'yang', 'yang', 'yang', 'moving_yang'],
    movingLineIndex: 6,
    hexagramJudgment: '同人于野，亨。利涉大川，利君子貞。天與火，同人；君子以類族辨物。',
    movingLineText: '【上九：同人于郊，無悔】：合作意向廣泛，志在長遠，雖在邊緣亦無過咎。',
    starHexagramResonance: '【星卦合一】：僕役宮天府天相祿會，逢天火同人卦，象徵與志同道合者共謀大業，上下同心無往不利。',
    timingPhases: {
      germination: '【萌芽發端期】近期 7 至 14 天內，雙方初步意向書簽署。',
      climax: '【激化轉折期】秋末深秋之際，股權與出資條款細節交鋒落定。',
      resolution: '【定局結算期】鎖定【農曆十月亥月】，正式敲定簽約合作！'
    },
    classicalAphorisms: [
      '《易經·大象傳》：天與火，同人；君子以類族辨物。',
      '《太微紫微賦》：府相朝垣，食祿萬鍾；貴人相助，百事亨通。'
    ],
    aiAnalysis: `【AI 宗師斷卦錦囊報告】
一、乾坤定調：
所問之合夥投資，卦象呈「天火同人、府相生財」之大吉格局。合作方具備雄厚資金與資源背景，誠信度高。

二、星象玄機剖析：
用神僕役坐天府化祿，為聚庫之象；對宮兄弟宮氣脈相通，意味著合夥人能為你帶來實質的現金流與市場突破。唯獨需留意文書細節，切忌口頭承諾。

三、時機應期推斷：
卦象動爻應在冬季水旺之時（陽曆 11~12 月），此時合約落地效益最佳。

四、避凶實戰錦囊：
1. 【親兄弟明算帳】：雖然關係融洽，財務審計與分紅權益務必於章程載明。
2. 【分工互補】：讓天府之守成與天相之協調各司其職，你方專注核心優勢輸出。
3. 【乘勢而上】：秋末冬初為關鍵推進期，應把握此一波勢能。`
  }
];

export function getDivinationRecords(): DivinationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRESET_DIVINATIONS));
      return DEFAULT_PRESET_DIVINATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_PRESET_DIVINATIONS;
  }
}

export function saveDivinationRecord(record: DivinationRecord): void {
  const records = getDivinationRecords();
  const existingIdx = records.findIndex(r => r.id === record.id);
  if (existingIdx >= 0) {
    records[existingIdx] = record;
  } else {
    records.unshift(record); // Prepend so newest is first
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function deleteDivinationRecord(id: string): void {
  const records = getDivinationRecords().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function clearDivinationRecords(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}

export function updateDivinationAI(id: string, aiAnalysis: string): void {
  const records = getDivinationRecords();
  const target = records.find(r => r.id === id);
  if (target) {
    target.aiAnalysis = aiAnalysis;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }
}
