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

export interface ExteriorShaRemedy {
  id: string;
  name: string;
  shapeDescription: string;
  harmAndRisk: string;
  herbalFormula: string; // 獨門中藥化煞藥方
  herbalPharmacology: string; // 藥理氣場安鎮法原理
  deploymentMethod: string; // 安放與佈置方式
}

export interface NinePalaceMissingGua {
  gua: string;
  direction: string;
  memberAffected: string;
  organsVulnerable: string;
  diseaseSymptoms: string;
  remedyHerbAndCrystal: string;
}

export interface FengshuiAnalysisResult {
  sectors: FengshuiSector[];
  wealthSanctuarySector: FengshuiSector; // 核心財庫守護位（田宅宮）
  cashflowSector: FengshuiSector; // 現金流生旺位（財帛宮）
  careerVigorSector: FengshuiSector; // 文昌事業開展位（官祿宮）
  criticalWarningSectors: FengshuiSector[]; // 煞忌重點調理方位
  exteriorShaRemedies: ExteriorShaRemedy[];
  ninePalaceMissingGuas: NinePalaceMissingGua[];
  overallFengshuiSummary: string;
}

// 青嵐獨門中藥草本化煞藥方與外局形煞全鑑
export const EXTERIOR_SHA_REMEDIES: ExteriorShaRemedy[] = [
  {
    id: 'sha_jianjiao',
    name: '尖角煞（火形刀刃沖射）',
    shapeDescription: '住家正對周邊建築物的銳利外牆尖角、房簷屋脊或三角形構造，形如飛刀直戳而來。',
    harmAndRisk: '如刀刃切割氣場，主血光意外、神經衰弱、突發炎症、官非口舌與莫名破財。',
    herbalFormula: '牛黃、菖蒲、遠志、酸棗仁、柏子仁、全蝎各三錢，加少許天然朱砂。',
    herbalPharmacology: '牛黃性涼清熱解毒辟邪，菖蒲遠志棗仁柏子仁寧心開竅鎮靜以抗精神壓力，全蝎以毒攻毒震懾銳利煞氣，朱砂強化紅色磁場安鎮空間。',
    deploymentMethod: '將藥材研成細粉，裝入紅色刺繡布袋或葫蘆中，懸掛於面對尖角煞之窗戶或陽台內側。'
  },
  {
    id: 'sha_luchong',
    name: '路沖煞 / 槍煞（急疾直衝氣場）',
    shapeDescription: '住家大門或主要窗戶正對筆直的道路、幽長巷道或長走廊，氣流直來直去、疾衝而過。',
    harmAndRisk: '氣流急促不聚反散，主財庫難聚、突發車禍血光、家人心神不寧、脾氣暴躁衝動。',
    herbalFormula: '獨活、一見消、杜仲、鬼箭羽、赤芍各三錢，加少許天然朱砂。',
    herbalPharmacology: '獨活杜仲祛風固本強健宅基，一見消迅疾化解不良陰邪，鬼箭羽活血破煞，赤芍平心柔肝緩急，朱砂穩固氣場核心。',
    deploymentMethod: '將藥材裝袋置於正對路沖之窗台或玄關地墊下，外配凸面八卦鏡或闊葉厚重綠植緩衝氣流。'
  },
  {
    id: 'sha_tianzhan',
    name: '天斬煞（雙樓夾縫天刀割裂）',
    shapeDescription: '住家正前方緊對兩棟高聳大樓之間的狹窄風隙，形同天降神刀將虛空劈成兩半。',
    harmAndRisk: '風水最兇險之形煞之一！風切效應極強，主開刀手術、重大傷災、家庭骨肉分離或事業猝然大敗。',
    herbalFormula: '當歸、威靈仙、一見消、安息香、朱砂各三錢。',
    herbalPharmacology: '當歸補血凝氣以抵抗切割離散之力，威靈仙剛烈通絡破阻，安息香行氣辟穢淨化磁場，一見消與朱砂形成強韌能量屏障。',
    deploymentMethod: '研粉裝袋掛於迎風窗櫺，同時在窗前擺放厚重泰山石或銅麒麟一對，化解強勁風煞。'
  },
  {
    id: 'sha_fangong',
    name: '反弓水 / 反弓路（無情割腳割腰）',
    shapeDescription: '門前河流或道路呈圓弧外凸形狀，彎角頂端如拉開的弓弦正對著家宅，主無情離去。',
    harmAndRisk: '主桃花煞破財、親友背叛反目、家財外洩、子孫背井離鄉難以歸聚。',
    herbalFormula: '降真香、合歡皮、艾草、石菖蒲各三錢，沉香少許。',
    herbalPharmacology: '降真香通達神明固聚正氣，合歡皮安神解鬱促進家人和睦，艾草驅穢辟濁，石菖蒲聚攏生氣，抵禦外凸離心力。',
    deploymentMethod: '將藥草包安置於客廳面臨反弓方向，配合圓形魚缸或圓盆闊葉盆栽，以柔和弧度調和外弓之煞。'
  },
  {
    id: 'sha_chuantang',
    name: '穿堂煞（前通後通·穿心過堂）',
    shapeDescription: '大門一打開正對後門、客廳大落地窗或陽台，形成一條直線對穿，前後通透無阻。',
    harmAndRisk: '「前通後通，人財兩空」！生氣入宅即刻從後方逸散，主過路財神、積蓄困難、家人緣分淡薄。',
    herbalFormula: '沉香、降真香、老山檀香各二錢，配合石菖蒲、合歡皮。',
    herbalPharmacology: '頂級香木能迅速提升室內空氣質量與能量密度，使輕浮之氣沉降凝聚，形成「聚氣磁場」，固守家宅生氣。',
    deploymentMethod: '於進門處設置屏風或置物矮櫃遮擋，將香草袋置於玄關內，日常可點燃少許降真香薰香聚氣。'
  },
  {
    id: 'sha_huoxing',
    name: '高壓電塔 / 火形煞（強磁微波輻射）',
    shapeDescription: '窗外近距離可見高壓電塔、變壓箱、微波發射基站或尖銳鐵塔，帶有強烈電磁能量。',
    harmAndRisk: '火煞過重，主人體生物電紊亂、自律神經失調、失眠多夢、心腦血管隱患與慢性炎症。',
    herbalFormula: '磁石、玄武岩、黑碧璽碎片，配合黃芪、白朮、熟地黃各三錢。',
    herbalPharmacology: '磁石與天然黑碧璽具備屏蔽雜散電磁波之天然特性，黃芪白朮固表護元氣，補足人體抵禦外界微波之衛氣。',
    deploymentMethod: '將礦物與草本混合放置於窗台，配合多漿植物（仙人掌、虎尾蘭）吸附微波雜質。'
  }
];

// 八宅九宮缺角與家庭成員臟腑病變對照表
export const NINE_PALACE_MISSING_GUAS: NinePalaceMissingGua[] = [
  {
    gua: '乾卦',
    direction: '西北方',
    memberAffected: '父親、男主人、最高主管',
    organsVulnerable: '頭部、胸部、大腦、肺部、骨骼',
    diseaseSymptoms: '偏頭痛、腦血管脆弱、失眠健忘、事業威權受損',
    remedyHerbAndCrystal: '西北方安放天然白水晶球或乾坤八卦盤，輔以天麻、黃芪草本氣場包固護金氣。'
  },
  {
    gua: '坤卦',
    direction: '西南方',
    memberAffected: '母親、女主人、年長女性',
    organsVulnerable: '脾胃、消化運化、腹部、婦科系統',
    diseaseSymptoms: '慢性胃炎、消化不良、腹脹腹痛、婦科氣血虛弱',
    remedyHerbAndCrystal: '西南方安放黃玉石元寶或泰山石，輔以山藥、茯苓、白朮草本包以健脾培土。'
  },
  {
    gua: '震卦',
    direction: '正東方',
    memberAffected: '長子、青年男子',
    organsVulnerable: '肝臟、膽囊、足部筋脈、自律神經',
    diseaseSymptoms: '肝氣鬱結、急躁易怒、足部抽筋麻木、長子運勢阻滯',
    remedyHerbAndCrystal: '正東方擺放綠色闊葉富貴竹或綠幽靈水晶，輔以枸杞、白芍草本包舒肝理氣。'
  },
  {
    gua: '巽卦',
    direction: '東南方',
    memberAffected: '長女、女性主管',
    organsVulnerable: '膽囊、股部骨關節、呼吸氣管、神經網絡',
    diseaseSymptoms: '神經衰弱、坐骨神經痛、皮膚過敏、思慮過重難以決斷',
    remedyHerbAndCrystal: '東南方擺放四支文昌竹或木質文昌塔，輔以石菖蒲、遠志草本包醒神益智。'
  },
  {
    gua: '坎卦',
    direction: '正北方',
    memberAffected: '中男、二兒子',
    organsVulnerable: '腎臟、膀胱、泌尿系統、生殖器官、耳疾',
    diseaseSymptoms: '腎氣不足、腰痠乏力、耳鳴畏寒、泌尿代謝遲滯',
    remedyHerbAndCrystal: '正北方安放黑碧璽或流動小水景，輔以熟地黃、黑芝麻、杜仲草本包滋補腎水。'
  },
  {
    gua: '離卦',
    direction: '正南方',
    memberAffected: '中女、二女兒',
    organsVulnerable: '心臟、眼睛視力、小腸、血液循環',
    diseaseSymptoms: '心悸失眠、視力退化、血壓波動、心火亢盛',
    remedyHerbAndCrystal: '正南方點暖色檯燈或紅色朱砂擺件，輔以酸棗仁、百合、紅棗草本包清心安神。'
  },
  {
    gua: '艮卦',
    direction: '東北方',
    memberAffected: '少男、小兒子',
    organsVulnerable: '脾胃、手指骨關節、鼻子呼吸道',
    diseaseSymptoms: '鼻炎過敏、胃寒厭食、手關節痛、學業阻滯不前',
    remedyHerbAndCrystal: '東北方擺放天然紫晶洞或泰山石敢當，輔以黨參、白朮、陳皮草本包溫中健胃。'
  },
  {
    gua: '兌卦',
    direction: '正西方',
    memberAffected: '少女、小女兒',
    organsVulnerable: '肺部、口舌喉嚨、牙齒、呼吸道',
    diseaseSymptoms: '咽喉疼痛、乾咳氣喘、牙痛、口舌是非紛爭',
    remedyHerbAndCrystal: '正西方擺放純銅葫蘆或白水晶簇，輔以百合、麥冬、桔梗草本包潤肺清音。'
  }
];

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
    exteriorShaRemedies: EXTERIOR_SHA_REMEDIES,
    ninePalaceMissingGuas: NINE_PALACE_MISSING_GUAS,
    overallFengshuiSummary: summary
  };
}
