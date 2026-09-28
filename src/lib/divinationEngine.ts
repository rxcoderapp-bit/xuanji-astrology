/**
 * 天樞星象 · 紫微斗數一事一占 · 神卦問事全息演算法引擎
 * 融合三大古典正統起卦體系：
 * 1. 【正時起卦 · 時空神課】（即時天地盤時辰動態交泰）
 * 2. 【大衍三金錢神筮 · 互動搖卦】（文王六爻三錢金筮，動靜卦變生剋）
 * 3. 【先天數理 · 靈動起卦】（河洛數理象數心法）
 * 
 * 核心升級：
 * - 易經六十四卦 ✕ 紫微斗數用神宮位「星卦合一」全息互參
 * - 六爻精準動爻（初至上爻變易之道）與本卦之卦吉凶演化
 * - 體宮 (事由主宮) ✕ 用宮 (對宮沖照) ✕ 輔宮 (三方拱照) ✕ 四化飛星動態引動
 * - 三階動態應期精推：【萌芽發端期】、【激化轉折期】、【定局結算期】
 * - 440萬字正統古籍 RAG 原典引證無縫注入
 * （嚴格去除所有個人姓名，純粹正統古典術數與自有體系）
 */

import type { 
  DivinationCategory, 
  DivinationMethod, 
  DivinationResult, 
  PalaceData,
  TrigramInfo,
  HexagramLineType,
  DivinationTimingPhases
} from '../types';
import { computeAstrolabe } from './iztroEngine';
import { searchClassicalCorpus } from './ragEngine';

// 八卦基本屬性 (先天與後天八卦象數)
export const EIGHT_TRIGRAMS: Record<number, TrigramInfo> = {
  1: { name: '乾', symbol: '☰', element: '金', nature: '天' },
  2: { name: '兌', symbol: '☱', element: '金', nature: '澤' },
  3: { name: '離', symbol: '☲', element: '火', nature: '火' },
  4: { name: '震', symbol: '☳', element: '木', nature: '雷' },
  5: { name: '巽', symbol: '☴', element: '木', nature: '風' },
  6: { name: '坎', symbol: '☵', element: '水', nature: '水' },
  7: { name: '艮', symbol: '☶', element: '土', nature: '山' },
  8: { name: '坤', symbol: '☷', element: '土', nature: '地' },
};

// 64 卦精確矩陣 [上卦編號 1..8][下卦編號 1..8]
interface HexagramDef {
  name: string;
  symbol: string;
  judgment: string;
  advice: string;
}

const HEXAGRAM_DATABASE: Record<string, HexagramDef> = {
  '1-1': { name: '乾為天', symbol: '䷀', judgment: '元亨利貞。天行健，君子以自強不息。', advice: '剛健中正，如日中天，宜大展宏圖，唯戒驕滿亢龍。' },
  '1-2': { name: '天澤履', symbol: '䷉', judgment: '履虎尾，不咥人，亨。君子以辯上下，定民志。', advice: '如履薄冰，居安思危，依循禮法節制可化險為夷。' },
  '1-3': { name: '天火同人', symbol: '䷌', judgment: '同人于野，亨。利涉大川，君子以類族辨物。', advice: '志同道合，公開透明，宜集結團隊合夥共創大業。' },
  '1-4': { name: '天雷無妄', symbol: '䷘', judgment: '元亨利貞。其匪正有眚，不利有攸往。天下雷行，物與無妄。', advice: '順天應人，行事光明磊落，切忌投機妄求與非分之想。' },
  '1-5': { name: '天風姤', symbol: '䷫', judgment: '女壯，勿用取女。天下有風，姤；后以施命誥四方。', advice: '意外邂逅，風雲際會，防暗流伏兵，宜果斷把控節奏。' },
  '1-6': { name: '天水訟', symbol: '䷅', judgment: '有孚，窒惕，中吉，終凶。利見大人，不利涉大川。', advice: '意見分歧，官非爭端，宜得饒人處且饒人，及早和解。' },
  '1-7': { name: '天山遁', symbol: '䷠', judgment: '亨，小利貞。天下有山，遁；君子以遠小人，不惡而嚴。', advice: '急流勇退，明哲保身，收縮戰線以待天時反轉。' },
  '1-8': { name: '天地否', symbol: '䷋', judgment: '否之匪人，不利君子貞，大往小來。天地不交，否。', advice: '閉塞不通，暗流洶湧，此時宜修德固本，切莫強出頭。' },

  '2-1': { name: '澤天夬', symbol: '䷪', judgment: '揚于王庭，孚號有厲。告自邑，不利即戎，利有攸往。', advice: '決斷破局，除舊布新，宜剛柔並濟，切忌操之過急。' },
  '2-2': { name: '兌為澤', symbol: '䷹', judgment: '亨，利貞。麗澤，兌；君子以朋友講習。', advice: '喜悅和順，言談得體，善用溝通協商能化解一切干戈。' },
  '2-3': { name: '澤火革', symbol: '䷰', judgment: '已日乃孚，元亨利貞，悔亡。澤中有火，革。', advice: '變革更替，大刀闊斧，順應時勢轉型必獲新生。' },
  '2-4': { name: '澤雷隨', symbol: '䷐', judgment: '元亨利貞，無咎。澤中有雷，隨；君子以嚮晦入宴息。', advice: '順勢而行，從善如流，跟隨時代大勢與領袖指引。' },
  '2-5': { name: '澤風大過', symbol: '䷛', judgment: '棟橈，利有攸往，亨。澤滅木，大過。', advice: '重任在肩，壓力過荷，須及早排解風險，支撐根本。' },
  '2-6': { name: '澤水困', symbol: '䷮', judgment: '亨，貞，大人吉，無咎。有言不信。水在澤下，困。', advice: '考驗心志，困境求生，沉默沈澱蓄力，百折不撓方能出險。' },
  '2-7': { name: '澤山咸', symbol: '䷞', judgment: '亨，利貞，取女吉。山上有澤，咸；君子以虛受人。', advice: '心有靈犀，感應迅速，利於情緣交流與真誠合作。' },
  '2-8': { name: '澤地萃', symbol: '䷬', judgment: '亨。王假有廟，利見大人，亨，利貞。用大牲吉。', advice: '人才聚攏，資財匯集，宜嚴明紀律以防雜亂生非。' },

  '3-1': { name: '火天大有', symbol: '䷍', judgment: '元亨。火在天上，大有；君子以遏惡揚善，順天休命。', advice: '日正中天，豐盛富有，宜感恩利他，財散人聚方保長久。' },
  '3-2': { name: '火澤睽', symbol: '䷥', judgment: '小事吉。上火下澤，睽；君子以同而異。', advice: '求同存異，觀點衝突，重在溝通調解，切莫硬碰硬。' },
  '3-3': { name: '離為火', symbol: '䷝', judgment: '利貞，亨。畜牝牛，吉。明兩作，離；大人以繼明照于四方。', advice: '光明煥發，文采飛揚，依附正道良友，慎防焦躁虛榮。' },
  '3-4': { name: '火雷噬嗑', symbol: '䷔', judgment: '亨。利用獄。雷電，噬嗑；先王以明罰敕法。', advice: '掃除障礙，恩威並施，凡事依規章法度雷厲風行處理。' },
  '3-5': { name: '火風鼎', symbol: '䷱', judgment: '元吉，亨。木上有火，鼎；君子以正位凝命。', advice: '鼎新革故，安身立命，奠定深厚基業與崇高聲望。' },
  '3-6': { name: '火水未濟', symbol: '䷿', judgment: '亨，小狐汔濟，濡其尾，無攸利。火在水上，未濟。', advice: '黎明在前，尚未功成，臨門一腳需十二分謹慎收尾。' },
  '3-7': { name: '火山旅', symbol: '䷷', judgment: '小亨，旅貞吉。山上有火，旅；君子以明慎用刑，而不留獄。', advice: '客居他鄉，動態變換，宜行事謙遜謹慎，避免結仇樹敵。' },
  '3-8': { name: '火地晉', symbol: '䷢', judgment: '康侯用錫馬蕃庶，晝日三接。明出地上，晉。', advice: '步步高升，如日方升，得貴人破格拔擢，宜全力進取。' },

  '4-1': { name: '雷天大壯', symbol: '䷡', judgment: '利貞。雷在天上，大壯；君子以非禮弗履。', advice: '氣勢雄渾，實力強盛，切戒剛愎自用與盲目逞勇。' },
  '4-2': { name: '雷澤歸妹', symbol: '䷵', judgment: '征凶，無攸利。澤上有雷，歸妹；君子以永終知敝。', advice: '動靜失序，名實不符，切莫被眼前虛幻承諾所誘惑。' },
  '4-3': { name: '雷火豐', symbol: '䷶', judgment: '亨，王假之，勿憂，宜日中。雷電皆至，豐。', advice: '全盛頂峰，碩果纍纍，當居安思危，警惕盛極必衰。' },
  '4-4': { name: '震為雷', symbol: '䷲', judgment: '亨。震來虩虩，笑言啞啞。震驚百里，不喪匕鬯。', advice: '震撼驚險，當頭棒喝，保持泰山崩於前而色不變之沉著。' },
  '4-5': { name: '雷風恆', symbol: '䷟', judgment: '亨，無咎，利貞，利有攸往。雷風，恆。', advice: '持之以恆，始終如一，不輕易變更核心戰略必有大成。' },
  '4-6': { name: '雷水解', symbol: '䷧', judgment: '利西南，無所往，其來復吉。雷雨作，解。', advice: '解危脫困，春雷雨潤，及早寬容息事，切忌節外生枝。' },
  '4-7': { name: '雷山小過', symbol: '䷽', judgment: '亨，利貞，可小事，不可大事。飛鳥遺之音，不宜上宜下。', advice: '過猶不及，行事宜略微收斂，小事得利，大事守中。' },
  '4-8': { name: '雷地豫', symbol: '䷏', judgment: '利建侯行師。雷出地奮，豫；先王以作樂崇德。', advice: '歡愉振奮，機遇降臨，需提防樂極生悲，居安思危。' },

  '5-1': { name: '風天小畜', symbol: '䷈', judgment: '亨。密雲不雨，自我西郊。風行天上，小畜。', advice: '積蓄實力，養精蓄銳，暫時不宜大肆擴張，以小博大。' },
  '5-2': { name: '風澤中孚', symbol: '䷼', judgment: '豚魚吉，利涉大川，利貞。澤上有風，中孚。', advice: '信義為本，至誠感神，以真摯信用感動外部夥伴。' },
  '5-3': { name: '風火家人', symbol: '䷤', judgment: '利女貞。風自火出，家人；君子以言有物，而行有恆。', advice: '內修齊家，理順後方，家庭或內部團隊和睦則百事通順。' },
  '5-4': { name: '風雷益', symbol: '䷩', judgment: '利有攸往，利涉大川。風雷，益；君子以見善則遷，有過則改。', advice: '得道多助，損上益下，宜主動讓利分潤，利人即利己。' },
  '5-5': { name: '巽為風', symbol: '䷸', judgment: '小亨，利有攸往，利見大人。隨風，巽；君子以申命行事。', advice: '謙遜隨和，審時度勢，如春風拂面般浸潤式推動目標。' },
  '5-6': { name: '風水渙', symbol: '䷺', judgment: '亨。王假有廟，利涉大川，利貞。風行水上，渙。', advice: '渙然冰釋，驅散迷霧，宜以宏大願景凝聚渙散人心。' },
  '5-7': { name: '風山漸', symbol: '䷴', judgment: '女歸吉，利貞。山上有木，漸；君子以居賢德善俗。', advice: '循序漸進，順理成章，不可拔苗助長，穩紮穩打自見功。' },
  '5-8': { name: '風地觀', symbol: '䷓', judgment: '盥而不薦，有孚顒若。風行地上，觀。', advice: '觀察體悟，深思遠慮，以冷靜宏觀視角洞察全局。' },

  '6-1': { name: '水天需', symbol: '䷄', judgment: '有孚，光亨，貞吉。利涉大川。雲上於天，需。', advice: '耐心守候，待時而動，蓄積實力以迎最佳出擊窗口。' },
  '6-2': { name: '水澤節', symbol: '䷻', judgment: '亨。苦節不可貞。澤上有水，節；君子以制數度，議德行。', advice: '節制有度，規範法度，收縮不必要開支，留有餘裕。' },
  '6-3': { name: '水火既濟', symbol: '䷾', judgment: '亨，小利貞，初吉終亂。水在火上，既濟。', advice: '圓滿功成，水火調和，需居安思危，防範鬆懈後的倒退。' },
  '6-4': { name: '水雷屯', symbol: '䷂', judgment: '元亨利貞，勿用有攸往，利建侯。雲雷，屯。', advice: '萬物初萌，草創艱辛，切勿輕舉妄動，宜廣納賢才扎牢根基。' },
  '6-5': { name: '水風井', symbol: '䷯', judgment: '改邑不改井，無喪無得，往來井井。木上有水，井。', advice: '厚植源泉，修養根本，深挖自身不可替代之專業壁壘。' },
  '6-6': { name: '坎為水', symbol: '䷜', judgment: '習坎，有孚，維心亨，行有尚。水洊至，習坎。', advice: '重重險阻，考驗定力，恪守誠信正道，臨深履薄方能脫險。' },
  '6-7': { name: '水山蹇', symbol: '䷦', judgment: '利西南，不利東北；利見大人，貞吉。山上有水，蹇。', advice: '進退維谷，前路阻絕，宜反求諸己，尋求名師貴人指引。' },
  '6-8': { name: '水地比', symbol: '䷇', judgment: '吉。原筮元永貞，無咎。不寧方來，後夫凶。地上有水，比。', advice: '親密團結，良性依託，宜尋求強而有力之同盟相互扶持。' },

  '7-1': { name: '山天大畜', symbol: '䷙', judgment: '利貞，不家食吉，利涉大川。天在山中，大畜。', advice: '胸懷丘壑，大度包容，積蓄崇高才德以待建功立業。' },
  '7-2': { name: '山澤損', symbol: '䷨', judgment: '有孚，元吉，無咎，可貞，利有攸往。山下有澤，損。', advice: '損己利人，犧牲短期以換取長遠格局，節制私慾見大吉。' },
  '7-3': { name: '山火賁', symbol: '䷕', judgment: '亨。小利有攸往。山下有火，賁；君子以明庶政，無敢折獄。', advice: '文飾包裝，恰到好處，重質重文，返璞歸真方是上策。' },
  '7-4': { name: '山雷頤', symbol: '䷚', judgment: '貞吉。觀頤，自求口實。山下有雷，頤；君子以慎言語，節飲食。', advice: '頤養身心，慎言節食，正心誠意，修身養性以積福慧。' },
  '7-5': { name: '山風蠱', symbol: '䷑', judgment: '元亨，利涉大川。先甲三日，後甲三日。隨風，蠱。', advice: '撥亂反正，整治弊端，下定決心清理歷史遺留沉疴。' },
  '7-6': { name: '山水蒙', symbol: '䷃', judgment: '亨。匪我求童蒙，童蒙求我。初筮告，再三瀆，瀆則不告。利貞。', advice: '啟蒙解惑，虛心求教，放下成見接受大師指點。' },
  '7-7': { name: '艮為山', symbol: '䷳', judgment: '艮其背，不獲其身，行其庭，不見其人，無咎。兼山，艮。', advice: '動靜知止，如山峙立，當停則停，當止則止，守中不移。' },
  '7-8': { name: '山地剝', symbol: '䷖', judgment: '不利有攸往。山附地上，剝；上以厚下，安宅。', advice: '基礎動搖，群陰剝陽，守護核心元氣，善待下屬與合作者。' },

  '8-1': { name: '地天泰', symbol: '䷊', judgment: '小往大來，吉亨。天地交，泰；后以財成天地之道，輔相天地之宜。', advice: '天地交泰，君子道長，天時地利俱備，宜乘風破浪大有作為。' },
  '8-2': { name: '地澤臨', symbol: '䷒', judgment: '元亨利貞。至于八月有凶。地中有澤，臨。', advice: '敦厚督導，親臨現場，把握當下好運，並預籌轉變對策。' },
  '8-3': { name: '地火明夷', symbol: '䷣', judgment: '利艱貞。明入地中，明夷；君子以蒞眾，用晦而明。', advice: '晦暗受困，才華受抑，宜韜光養晦，掩藏鋒芒以求自保。' },
  '8-4': { name: '地雷復', symbol: '䷗', judgment: '亨。出入無疾，朋來無咎。七日來復，利有攸往。', advice: '冬盡春回，一陽初生，生機重現，順應本心重新出發。' },
  '8-5': { name: '地風升', symbol: '䷭', judgment: '元亨，用見大人，勿恤，南征吉。地中生木，升。', advice: '循序上升，步步登高，順應天時柔順積累，獲長官貴人信任。' },
  '8-6': { name: '地水師', symbol: '䷆', judgment: '貞，丈人吉，無咎。地中有水，師；君子以容民畜眾。', advice: '嚴明紀律，師出有名，以正義原則統帥團隊排除萬難。' },
  '8-7': { name: '地山謙', symbol: '䷎', judgment: '亨，君子有終。地中有山，謙；君子以裒多益寡，稱物平施。', advice: '謙謙君子，虛懷若谷，六爻皆吉，凡事越謙遜福報越綿長。' },
  '8-8': { name: '坤為地', symbol: '䷁', judgment: '元亨，利牝馬之貞。地勢坤，君子以厚德載物。', advice: '厚德載物，包容順隨，厚積薄發，順應主導者能成就偉業。' },
};

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

// 地支對應月份與生肖日
const BRANCH_CALENDAR_MAP: Record<string, { season: string; month: string; animal: string }> = {
  '寅': { season: '孟春', month: '農曆正月', animal: '虎' },
  '卯': { season: '仲春', month: '農曆二月', animal: '兔' },
  '辰': { season: '季春', month: '農曆三月', animal: '龍' },
  '巳': { season: '孟夏', month: '農曆四月', animal: '蛇' },
  '午': { season: '仲夏', month: '農曆五月', animal: '馬' },
  '未': { season: '季夏', month: '農曆六月', animal: '羊' },
  '申': { season: '孟秋', month: '農曆七月', animal: '猴' },
  '酉': { season: '仲秋', month: '農曆八月', animal: '雞' },
  '戌': { season: '季秋', month: '農曆九月', animal: '狗' },
  '亥': { season: '孟冬', month: '農曆十月', animal: '豬' },
  '子': { season: '仲冬', month: '農曆十一月', animal: '鼠' },
  '丑': { season: '季冬', month: '農曆十二月', animal: '牛' },
};

// 爻辭斷語指引庫
const MOVING_LINE_GUIDES: Record<number, string> = {
  0: '【純粹靜卦 · 局勢沉澱】：無明顯動爻引發急劇突變，事態受本卦核心卦德主導，重在持之以恆守中。',
  1: '【初爻發動 · 慎微動機】：事態尚處萌芽階段，凡事切忌操之過急，宜潛沉根基，慎防始亂終棄。',
  2: '【二爻發動 · 貴人相呼】：處於內部承上啟下之位，柔順中正，易得賢良貴人或得力助手同心策應。',
  3: '【三爻發動 · 凶險轉折】：位居下卦之頂，進退多疑，矛盾激化之關鍵分水嶺，尤宜戒驕戒躁，慎防口舌。',
  4: '【四爻發動 · 近貴近險】：進入外卦初位，近君伴虎，宜恪遵職守，順應時勢與上層決策，不可妄動。',
  5: '【五爻發動 · 九五至尊】：核心決策樞紐，威權在手，事態迎來決定性突破窗口，光明坦蕩可獲全勝。',
  6: '【上爻發動 · 盛極窮變】：已至事物末流極致，防亢龍有悔、物極必反，宜見好就收，籌備退路轉型。'
};

/**
 * 核心演算法：生成卦象與爻變
 */
function resolveHexagramAndLines(
  method: DivinationMethod,
  now: Date,
  numbers?: [number, number, number],
  coinsTosses?: number[][]
): {
  upperTrigramNum: number;
  lowerTrigramNum: number;
  movingLine: number;
  hexLines: HexagramLineType[];
  resolvedTosses?: number[][];
} {
  let upper = 1;
  let lower = 1;
  let moving = 0;
  let hexLines: HexagramLineType[] = ['yang', 'yang', 'yang', 'yang', 'yang', 'yang'];
  let resolvedTosses = coinsTosses;

  if (method === 'coins') {
    // 傳統文王神課 3 枚銅錢 6 次擲卦
    // 2=字(陰), 3=背(陽)
    let tosses = coinsTosses;
    if (!tosses || tosses.length !== 6) {
      tosses = [];
      for (let i = 0; i < 6; i++) {
        tosses.push([
          Math.random() > 0.5 ? 3 : 2,
          Math.random() > 0.5 ? 3 : 2,
          Math.random() > 0.5 ? 3 : 2
        ]);
      }
      resolvedTosses = tosses;
    }

    const calculatedLines: HexagramLineType[] = [];
    const movingCandidates: number[] = [];

    tosses.forEach((t, idx) => {
      const sum = t[0] + t[1] + t[2];
      if (sum === 6) {
        calculatedLines.push('moving_yin');
        movingCandidates.push(idx + 1);
      } else if (sum === 7) {
        calculatedLines.push('yang');
      } else if (sum === 8) {
        calculatedLines.push('yin');
      } else {
        // sum === 9
        calculatedLines.push('moving_yang');
        movingCandidates.push(idx + 1);
      }
    });

    hexLines = calculatedLines;
    moving = movingCandidates.length > 0 ? movingCandidates[0] : 0;

    // 將初至三爻轉為下卦，四至六爻轉為上卦
    const toTrigramNum = (l1: HexagramLineType, l2: HexagramLineType, l3: HexagramLineType): number => {
      const isYang = (l: HexagramLineType) => l === 'yang' || l === 'moving_yang';
      const b1 = isYang(l1) ? 1 : 0;
      const b2 = isYang(l2) ? 1 : 0;
      const b3 = isYang(l3) ? 1 : 0;
      const val = `${b3}${b2}${b1}`; // 上中下
      if (val === '111') return 1; // 乾
      if (val === '011') return 2; // 兌
      if (val === '101') return 3; // 離
      if (val === '001') return 4; // 震
      if (val === '110') return 5; // 巽
      if (val === '010') return 6; // 坎
      if (val === '100') return 7; // 艮
      return 8; // 坤 000
    };

    lower = toTrigramNum(hexLines[0], hexLines[1], hexLines[2]);
    upper = toTrigramNum(hexLines[3], hexLines[4], hexLines[5]);

  } else if (method === 'numbers' && numbers && numbers.length === 3) {
    // 靈動數理起卦
    upper = (numbers[0] % 8) || 8;
    lower = (numbers[1] % 8) || 8;
    moving = (numbers[2] % 6) || 6;

    // 根據上下卦推導六爻線條
    hexLines = generateLinesFromTrigrams(upper, lower, moving);
  } else {
    // 正時起卦 (年+月+日 為上卦，年+月+日+時 為下卦，年+月+日+時+分 為動爻)
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const h = now.getHours();
    const min = now.getMinutes();

    const sumUpper = y + m + d;
    const sumLower = y + m + d + h;
    const sumMove = y + m + d + h + min;

    upper = (sumUpper % 8) || 8;
    lower = (sumLower % 8) || 8;
    moving = (sumMove % 6) || 6;

    hexLines = generateLinesFromTrigrams(upper, lower, moving);
  }

  return {
    upperTrigramNum: upper,
    lowerTrigramNum: lower,
    movingLine: moving,
    hexLines,
    resolvedTosses
  };
}

// 根據上下卦與動爻生成六爻線條
function generateLinesFromTrigrams(upperNum: number, lowerNum: number, movingLine: number): HexagramLineType[] {
  const TRIGRAM_BINARY: Record<number, [boolean, boolean, boolean]> = {
    1: [true, true, true],       // 乾
    2: [true, true, false],      // 兌 (下陽、中陽、上陰)
    3: [true, false, true],      // 離 (下陽、中陰、上陽)
    4: [true, false, false],     // 震 (下陽、中陰、上陰)
    5: [false, true, true],      // 巽 (下陰、中陽、上陽)
    6: [false, true, false],     // 坎 (下陰、中陽、上陰)
    7: [false, false, true],     // 艮 (下陰、中陰、上陽)
    8: [false, false, false],    // 坤
  };

  const lowerB = TRIGRAM_BINARY[lowerNum] || [true, true, true];
  const upperB = TRIGRAM_BINARY[upperNum] || [true, true, true];
  const allB = [...lowerB, ...upperB]; // 6 lines

  return allB.map((isYang, idx) => {
    const lineNum = idx + 1;
    if (lineNum === movingLine) {
      return isYang ? 'moving_yang' : 'moving_yin';
    }
    return isYang ? 'yang' : 'yin';
  });
}

/**
 * 主執行函數：castZiweiDivination
 */
export function castZiweiDivination(
  question: string,
  category: DivinationCategory,
  method: DivinationMethod,
  numbers?: [number, number, number],
  currentChartPalaces?: PalaceData[],
  coinsTosses?: number[][]
): DivinationResult {
  const now = new Date();
  const castTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  let targetPalaces: PalaceData[] = [];

  if (method === 'horary' || !currentChartPalaces || currentChartPalaces.length < 12) {
    // 獨立正時盤起局
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

  // 1. 定位用神宮位 (Target Palace)
  const targetName = CATEGORY_PALACE_MAP[category] || '命宮';
  let targetPalace = targetPalaces.find(p => p.name.includes(targetName)) || targetPalaces[0];

  // 數理起卦時，若指定了偏移，調整用神宮
  if (method === 'numbers' && numbers && numbers.length === 3) {
    const offset = (numbers[0] - 1 + 12) % 12;
    targetPalace = targetPalaces[offset];
  }

  // 對宮 (沖照宮)
  const oppositeIndex = (targetPalace.index + 6) % 12;
  const oppositePalace = targetPalaces[oppositeIndex] || targetPalaces[0];

  // 2. 演繹易經 64 卦與六爻動態
  const { 
    upperTrigramNum, 
    lowerTrigramNum, 
    movingLine, 
    hexLines,
    resolvedTosses 
  } = resolveHexagramAndLines(method, now, numbers, coinsTosses);

  const upperTrigram = EIGHT_TRIGRAMS[upperTrigramNum] || EIGHT_TRIGRAMS[1];
  const lowerTrigram = EIGHT_TRIGRAMS[lowerTrigramNum] || EIGHT_TRIGRAMS[1];

  const hexKey = `${upperTrigramNum}-${lowerTrigramNum}`;
  const hexDef = HEXAGRAM_DATABASE[hexKey] || {
    name: `${upperTrigram.nature}${lowerTrigram.nature}卦`,
    symbol: '䷀',
    judgment: '順天應人，吉凶相生，守正則亨。',
    advice: '以中正之道應對變局，切忌偏激。'
  };

  // 3. 星曜廟旺與四化能量全息量化評分 (-100 ~ +100)
  let score = 0;
  const majorStars = targetPalace.majorStars;
  const minorStars = targetPalace.minorStars;
  const allPalaceStars = [...majorStars, ...minorStars];
  const sihuaImpact: string[] = [];

  // 主星廟旺與化曜
  majorStars.forEach(s => {
    if (['廟', '旺'].includes(s.brightness || '')) score += 16;
    else if (['陷', '不'].includes(s.brightness || '')) score -= 14;
    else score += 6;

    if (s.mutagen === '祿') {
      score += 36;
      sihuaImpact.push(`【${s.name}化祿】：生機豐沛，財祿天賜，所謀之事必得圓融收穫。`);
    } else if (s.mutagen === '權') {
      score += 26;
      sihuaImpact.push(`【${s.name}化權】：威權掌控，競逐獲勝，宜雷厲風行主導大局。`);
    } else if (s.mutagen === '科') {
      score += 20;
      sihuaImpact.push(`【${s.name}化科】：聲名播越，長輩貴人提攜，大事化小小事化無。`);
    } else if (s.mutagen === '忌') {
      score -= 38;
      sihuaImpact.push(`【${s.name}化忌】：暗礁阻礙，多有執念波折，切忌盲目擴張或意氣用事。`);
    }
  });

  // 六吉六煞星
  minorStars.forEach(s => {
    if (['左輔', '右弼', '天魁', '天鉞', '祿存', '天馬'].includes(s.name)) {
      score += 15;
    } else if (['文昌', '文曲'].includes(s.name)) {
      score += 10;
    } else if (['擎羊', '陀羅', '火星', '鈴星', '地空', '地劫'].includes(s.name)) {
      score -= 16;
    }
  });

  // 對宮沖照 (35% 權重)
  oppositePalace.majorStars.forEach(s => {
    if (s.mutagen === '忌') {
      score -= 24;
      sihuaImpact.push(`【對宮${s.name}化忌沖照】：外在環境有突發波折或小人口舌暗箭。`);
    } else if (s.mutagen === '祿') {
      score += 16;
      sihuaImpact.push(`【對宮${s.name}化祿照入】：外出逢貴，外來市場能帶來意想不到之驚喜助益。`);
    }
  });

  // 宮位自化
  targetPalace.selfMutagens.forEach(sm => {
    if (sm.mutagen === '忌') {
      score -= 18;
      sihuaImpact.push(`【本宮自化忌】：內部自我消耗或意志猶豫，切忌臨陣動搖。`);
    } else if (sm.mutagen === '祿') {
      score += 14;
      sihuaImpact.push(`【本宮自化祿】：樂善好施，凡事以和為貴，善緣自來。`);
    }
  });

  // 易經卦象調候加權
  if (['地天泰', '火天大有', '水火既濟', '風雷益', '地山謙', '天火同人'].includes(hexDef.name)) {
    score += 15;
  } else if (['天地否', '坎為水', '水山蹇', '澤水困', '山地剝', '地火明夷'].includes(hexDef.name)) {
    score -= 15;
  }

  score = Math.max(-100, Math.min(100, score));

  // 吉凶等級定奪
  let outcomeGrade: DivinationResult['outcomeGrade'] = '平';
  if (score >= 60) outcomeGrade = '大吉';
  else if (score >= 30) outcomeGrade = '吉';
  else if (score >= 10) outcomeGrade = '小吉';
  else if (score >= -10) outcomeGrade = '平';
  else if (score >= -30) outcomeGrade = '小凶';
  else if (score >= -60) outcomeGrade = '凶';
  else outcomeGrade = '大凶';

  // 4. 星卦互參全息解讀
  const starNames = allPalaceStars.map(s => s.name).join('、') || '借對宮星曜照會';
  const movingLineText = MOVING_LINE_GUIDES[movingLine] || MOVING_LINE_GUIDES[0];

  const starHexagramResonance = `【星象與易象共振】：紫微斗數用神宮【${targetPalace.name}】匯聚【${starNames}】，適逢易經感應【${hexDef.name}】（上${upperTrigram.name}下${lowerTrigram.name}）。紫微宮垣主客體勢與易經卦德相輔相成——卦象提示「${hexDef.advice}」，結合星曜廟旺氣場，示現當前事態之關鍵樞紐在於「知進知退，順時借力」。`;

  // 5. 三階動態應期 (Timing Phases)
  const branchInfo = BRANCH_CALENDAR_MAP[targetPalace.earthlyBranch] || { season: '當令時節', month: '近期數月', animal: '吉日' };
  
  const timingPhases: DivinationTimingPhases = {
    germination: `【萌芽發端期】近期 7 至 14 天內，事態初現端倪，將有初步徵兆或外部訊息釋出。`,
    climax: `【激化轉折期】${branchInfo.season}交替之際，各方意向明朗，競爭與交涉進入最白熱化階段。`,
    resolution: `【定局結算期】鎖定【${branchInfo.month}】(${branchInfo.animal}日/吉時)，用神宮位磁場全面引動，終局水落石出！`
  };

  const timingWindow = `此占應期緊扣地支【${targetPalace.earthlyBranch}】位，全盤關鍵結算在【${branchInfo.month}】。自發端至定局循序漸進，順應時節自能掌握主動。`;

  // 6. 斷語結論、詳析與錦囊妙計
  let verdict = '';
  let detailedAnalysis = '';
  let actionPlan = '';

  if (outcomeGrade === '大吉' || outcomeGrade === '吉') {
    verdict = `【${hexDef.name} · 水到渠成】事態發展得天獨厚，星卦同照，天時地利俱備，所求終成美局。`;
    detailedAnalysis = `占問【${question}】，用神落在【${targetPalace.name} (${targetPalace.heavenlyStem}${targetPalace.earthlyBranch})】。宮內星曜匯聚【${starNames}】，吉星坐鎮且易逢【${hexDef.name}】。對宮【${oppositePalace.name}】良性拱照，四化引動生機。無論商貿謀職或親和洽談，皆屬主動進取之黃金期。`;
    actionPlan = `1. 【果斷拍板】：機不可失，宜在關鍵洽談窗口迅速落實條款協議。\n2. 【廣結良朋】：藉助長輩與跨界夥伴之威信，乘勢做大格局。\n3. 【厚德載物】：大成之際多行利益分享，吉神庇護方能基業長青。`;
  } else if (outcomeGrade === '小吉' || outcomeGrade === '平') {
    verdict = `【${hexDef.name} · 循序漸進】當前局勢平和有度，機遇與考驗並存，戒急用忍，步步為營自見功。`;
    detailedAnalysis = `占問【${question}】，用神在【${targetPalace.name}】。宮內吉凶星曜交會，呈現平衡拉鋸態勢。易卦【${hexDef.name}】提示外在環境並無滅頂阻礙，然亦無唾手可得之橫財奇蹟，成敗端看自身之細節掌控力與抗壓耐性。`;
    actionPlan = `1. 【深耕細節】：合同文書與收支預算務必逐項核對，防範認知盲區。\n2. 【順勢蓄力】：不盲目借貸或急劇擴張，守住核心現金流與基本盤。\n3. 【請益智囊】：關鍵節點主動諮詢客觀師友，多方驗證避開暗礁。`;
  } else {
    verdict = `【${hexDef.name} · 宜守不宜動】當前磁場阻力甚劇，暗礁洶湧，切莫意氣用事強行突破，退避蓄力為上。`;
    detailedAnalysis = `占問【${question}】，用神宮位【${targetPalace.name}】逢煞忌星曜侵擾，氣機受挫。卦逢【${hexDef.name}】，預示外力阻隔或內部觀念分歧嚴重。若盲目投入資金或強行對抗，極易深陷泥淖蒙受損失。`;
    actionPlan = `1. 【止損避險】：暫緩重大資金簽約或高風險動作，以保全本金為第一原則。\n2. 【化解干戈】：遇糾紛宜以和為貴，尋求公信第三方居中調解，切忌對簿公堂。\n3. 【沉潛修持】：逆境即磨刀石，正好修訂策略、補強內部漏洞，靜待下波天時。`;
  }

  // 7. 古籍 RAG 知識庫智庫檢索（自動召回正統賦文）
  const corpusHits = searchClassicalCorpus(`${targetName} ${hexDef.name}`, 'all', 2);
  const classicalAphorisms: string[] = [
    `《易經·大象傳》：${hexDef.judgment}`,
    `《神卦心訣》：「事有體用，卦顯幾先。主星坐吉宮逢化曜，吉凶已定七分；輔以動爻之變，萬事無遁形。」`
  ];
  corpusHits.forEach(h => {
    if (h.item.originalText) {
      classicalAphorisms.push(`${h.item.sourceBook}：${h.item.originalText.slice(0, 75)}...`);
    }
  });

  return {
    question,
    category,
    castTime,
    method,
    numbers,
    coinsTosses: resolvedTosses,
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
    timingWindow,
    // 升級屬性
    hexagramName: hexDef.name,
    hexagramSymbol: hexDef.symbol,
    upperTrigram,
    lowerTrigram,
    hexagramLines: hexLines,
    movingLineIndex: movingLine,
    hexagramJudgment: hexDef.judgment,
    movingLineText,
    starHexagramResonance,
    timingPhases,
    classicalAphorisms
  };
}
