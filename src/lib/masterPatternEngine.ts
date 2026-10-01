/**
 * 大師級紫微格局破局與現代改運演算法 (Master Ziwei Breakthrough & Modern Remedy Engine)
 * 知識底座源自：《紫微格局改運心法》、《紫微現代心理學全鑑》
 * （嚴格去除所有個人姓名，純粹正統現代心理學派與玄微心法體系）
 */

import type { PalaceData, HoroscopeState } from '../types';

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
  luSuiJiZou: LuSuiJiZouDiagnosis | null;
  overallBreakthroughSummary: string;
}

// 輔助檢查星曜是否在宮位中
function hasStar(palace: PalaceData, starName: string): boolean {
  return [...palace.majorStars, ...palace.minorStars, ...palace.adjectiveStars].some(
    s => s.name === starName
  );
}

// 輔助檢查三方四正是否包含特定星曜
function hasStarInSanFang(palaces: PalaceData[], sanFangIndices: number[], starName: string): boolean {
  return sanFangIndices.some(idx => {
    const p = palaces[idx];
    return p && hasStar(p, starName);
  });
}

// 輔助檢查四化
function hasMutagen(palace: PalaceData, mutagenType: '祿' | '權' | '科' | '忌'): { has: boolean; star: string } {
  for (const s of [...palace.majorStars, ...palace.minorStars]) {
    if (s.mutagen === mutagenType) {
      return { has: true, star: s.name };
    }
  }
  return { has: false, star: '' };
}

export function analyzeMasterPatterns(
  palaces: PalaceData[],
  _horoscope?: HoroscopeState
): MasterPatternAnalysisResult {
  const detected: DetectedPattern[] = [];
  const mingGong = palaces.find(p => p.name === '命宮') || palaces[0];
  const mingIdx = mingGong.index;

  // 三方四正索引（命、財、官、遷）
  const qianIdx = (mingIdx + 6) % 12;
  const caiIdx = (mingIdx + 8) % 12;
  const guanIdx = (mingIdx + 4) % 12;
  const mingSanFang = [mingIdx, qianIdx, caiIdx, guanIdx];

  // 1. 三奇嘉會格 (祿、權、科會於命三方四正)
  const hasLu = mingSanFang.some(idx => hasMutagen(palaces[idx], '祿').has);
  const hasQuan = mingSanFang.some(idx => hasMutagen(palaces[idx], '權').has);
  const hasKe = mingSanFang.some(idx => hasMutagen(palaces[idx], '科').has);
  if (hasLu && hasQuan && hasKe) {
    detected.push({
      id: 'p_sanqi',
      name: '三奇嘉會格',
      category: 'auspicious',
      categoryLabel: '極品富貴吉格',
      palaceIndex: mingIdx,
      palaceName: '命宮三方四正',
      classicalQuote: '三奇照命，富貴超倫，文武兼全，位極人臣。',
      modernPsychology: '兼具「賺錢商機敏銳度（化祿）」、「掌控組織執行力（化權）」與「社會口碑公信力（化科）」的複合型超級精英，極具領袖魅力。',
      breakthroughAdvice: '三奇最忌分散戰線或眼高手低導致資金鏈斷裂。應集中優勢兵力打造單一核心旗艦業務或個人標誌性品牌，切忌被多元繁雜誘惑分心。',
      actionGuidance: [
        '確立旗艦主業，嚴格拒絕不相關的邊緣投機項目',
        '重視公眾信譽與法律合規，以化科之口碑庇護化權之擴張',
        '獲利後提撥 30% 以上轉入穩健被動資產，防止過度樂觀開槓桿'
      ]
    });
  }

  // 2. 火貪格 / 鈴貪格
  for (const idx of [mingIdx, caiIdx, guanIdx]) {
    const p = palaces[idx];
    if (hasStar(p, '貪狼') && hasStar(p, '火星')) {
      detected.push({
        id: `p_huotan_${idx}`,
        name: '火貪格（爆發富貴格）',
        category: 'auspicious',
        categoryLabel: '橫發爆富吉格',
        palaceIndex: idx,
        palaceName: p.name,
        classicalQuote: '火貪同度，威鎮邊疆；火貪照命，富貴橫來。',
        modernPsychology: '新興風口敏感捕捉者，具備極強的商業賭性、冒險氣魄與瞬間整合突擊能力，往往在產業變革時一躍而起。',
        breakthroughAdvice: '火貪主暴發，然而暴發背後必定潛藏「暴敗」之黑天鵝！貪心不知止、把運氣當實力是致命弱點。暴發之後必須立即轉攻為守。',
        actionGuidance: [
          '風口獲利後立即啟動「落袋為安」機制，鎖定 50% 利潤',
          '將短期爆發財富轉移至不動產（田宅宮）或實業基金守成',
          '切莫在同一牌桌上無節制加倍下注，見好即收方能長治久安'
        ]
      });
    }
    if (hasStar(p, '貪狼') && hasStar(p, '鈴星')) {
      detected.push({
        id: `p_lingtan_${idx}`,
        name: '鈴貪格（暗發深謀格）',
        category: 'auspicious',
        categoryLabel: '暗中累積巨富格',
        palaceIndex: idx,
        palaceName: p.name,
        classicalQuote: '鈴貪並照，名利雙收；多主暗中暴發，聲名不顯而家財萬貫。',
        modernPsychology: '深謀遠慮、低調沈穩之獵手。善於幕後策劃、專利技術佈局或私密資本運作，不喜張揚卻收穫極其豐厚。',
        breakthroughAdvice: '保持「低調悶聲發大財」之原始優勢，最忌被虛名或聚光燈誘惑。行事防範親友借貸與法律合同暗坑。',
        actionGuidance: [
          '維持隱密與低調作風，避免公開炫耀資產引發嫉妒與是非',
          '簽署一切合約必須由兩名以上資深律師獨立審查',
          '適合佈局長線複利專案與隱形冠軍型企業'
        ]
      });
    }
  }

  // 3. 機月同梁格
  if (
    hasStarInSanFang(palaces, mingSanFang, '天機') &&
    hasStarInSanFang(palaces, mingSanFang, '太陰') &&
    hasStarInSanFang(palaces, mingSanFang, '天同') &&
    hasStarInSanFang(palaces, mingSanFang, '天梁')
  ) {
    detected.push({
      id: 'p_jiyuetongliang',
      name: '機月同梁格',
      category: 'auspicious',
      categoryLabel: '上佳幕僚體制格',
      palaceIndex: mingIdx,
      palaceName: '命宮三方',
      classicalQuote: '機月同梁作吏人，一生衣食自然豐，處事體面，善於運籌。',
      modernPsychology: '頂級戰略幕僚、體制高管、法規合規官與專業技術大師。思維縝密客觀，善於在既定體系中精準運籌帷幄。',
      breakthroughAdvice: '切莫衝動放棄成熟平台去全職孤注一擲創業！最佳成功模式為「依託體系 ＋ 本業精進 ＋ 被動資產佈局」之穩定雙軌。',
      actionGuidance: [
        '在現有大機構中尋求專業升遷，爭取資源最大化調配權',
        '利用工餘時間建立被動版稅、股權或專利收益',
        '切忌孤狼式冒險，善用團隊流程化解個人風險'
      ]
    });
  }

  // 4. 日月並明格（太陽在巳、太陰在酉）
  const siPalace = palaces[3]; // 巳宮
  const youPalace = palaces[7]; // 酉宮
  if (siPalace && hasStar(siPalace, '太陽') && youPalace && hasStar(youPalace, '太陰')) {
    detected.push({
      id: 'p_riyuebingming',
      name: '日月並明格（丹墀墀桂）',
      category: 'auspicious',
      categoryLabel: '光彩照人名揚格',
      palaceIndex: mingIdx,
      palaceName: '命身宮位',
      classicalQuote: '日月並明，名曰丹墀墀桂，早歲科名，生平磊落，萬方折服。',
      modernPsychology: '天生自帶公信力光環與群眾號召力，行事心胸開闊、坦蕩光明，極易獲得社會名望與大眾追隨。',
      breakthroughAdvice: '行事必須恪守「完全透明合規」之準則。越是公開透明，名望氣場越強；凡一切灰色暗盤與投機私慾均為命格大忌。',
      actionGuidance: [
        '投身公共品牌、公眾傳播、教育出版或行業標竿領域',
        '遇到是非爭議時以公開透明的真相直面公眾，不搞私下公關遮掩',
        '注重心理界限，防止因好心幫助他人過度消耗自身健康'
      ]
    });
  }

  // 5. 羊陀夾忌格（凶格破局核心）
  for (let i = 0; i < 12; i++) {
    const cur = palaces[i];
    const prev = palaces[(i + 11) % 12];
    const next = palaces[(i + 1) % 12];
    const curJi = hasMutagen(cur, '忌');
    const prevYangTuo = hasStar(prev, '擎羊') || hasStar(prev, '陀羅');
    const nextYangTuo = hasStar(next, '擎羊') || hasStar(next, '陀羅');

    if (curJi.has && prevYangTuo && nextYangTuo) {
      detected.push({
        id: `p_yangtuojiaji_${i}`,
        name: '羊陀夾忌格（重重困局）',
        category: 'challenging',
        categoryLabel: '重點破局挑戰格',
        palaceIndex: i,
        palaceName: cur.name,
        classicalQuote: '羊陀夾忌，為禍最烈，進退維谷，孤立無援。',
        modernPsychology: '在該宮位所代表的人生領域容易陷入四面楚歌的窒息感，內心充滿焦慮與自我懷疑，越是掙扎越容易被泥淖困死。',
        breakthroughAdvice: '《紫微格局改運心法》破局方針：【絕對不要在此宮位硬碰硬加碼！】暫時冷凍該領域，將注意力徹底轉向化祿宮位，並引入第三方客觀專業力量（如法律顧問、心理專家）打破封閉僵局。',
        actionGuidance: [
          '立即停止在該宮位相關項目盲目砸錢或加大情感投入',
          '主動尋求客觀中立之外部專家介入，切斷內部互相消耗之情緒死結',
          '將精力轉向本命化祿所照之宮位，以新賽道的利他成果換取轉身空間'
        ]
      });
    }
  }

  // 6. 鈴昌陀武格
  for (let i = 0; i < 12; i++) {
    const p = palaces[i];
    if (hasStar(p, '武曲') && (hasStar(p, '文昌') || hasStar(p, '陀羅') || hasStar(p, '鈴星'))) {
      const sanFangIdxs = [i, (i + 4) % 12, (i + 6) % 12, (i + 8) % 12];
      const hasLing = hasStarInSanFang(palaces, sanFangIdxs, '鈴星');
      const hasChang = hasStarInSanFang(palaces, sanFangIdxs, '文昌');
      const hasTuo = hasStarInSanFang(palaces, sanFangIdxs, '陀羅');
      const hasWu = hasStarInSanFang(palaces, sanFangIdxs, '武曲');
      if (hasLing && hasChang && hasTuo && hasWu) {
        detected.push({
          id: `p_lingchangtuowu_${i}`,
          name: '鈴昌陀武格（合約危機）',
          category: 'challenging',
          categoryLabel: '合約資金警訊格',
          palaceIndex: i,
          palaceName: p.name,
          classicalQuote: '鈴昌陀武，限至投河。主文書破敗、資金斷裂、重大官非。',
          modernPsychology: '在財務合約、對賭協議或法務條款上容易因疏忽或急於求成而埋下巨大定時炸彈，引發資金鏈劇烈震盪。',
          breakthroughAdvice: '嚴禁為任何人作保、借貸！凡遇重大投資與合約簽署，必須強制留出 72 小時冷靜期，並設立底線停損機制，寧可少賺絕不冒穿倉風險。',
          actionGuidance: [
            '本命或大限遇此格，徹底拒絕任何作保、共同簽字或灰色對賭協議',
            '對現有所有合同、債務、借據進行全面合規清查與及時解套',
            '若已遭遇重大虧損，果斷「割肉停損認賠」，嚴禁借高利轉貸試圖翻本'
          ]
        });
        break;
      }
    }
  }

  // 7. 巨火羊格
  for (let i = 0; i < 12; i++) {
    const p = palaces[i];
    if (hasStar(p, '巨門') && (hasStar(p, '火星') || hasStar(p, '擎羊'))) {
      detected.push({
        id: `p_juhuoyang_${i}`,
        name: '巨火羊格（口舌官非刃）',
        category: 'challenging',
        categoryLabel: '言辭交鋒挑戰格',
        palaceIndex: i,
        palaceName: p.name,
        classicalQuote: '巨火羊，多主口舌是非、橫發橫破、言多必失。',
        modernPsychology: '言辭犀利如刀，洞察力極其毒辣，能在短時間內戳中他人致命痛處；然而在未經修煉時極易因口無遮攔樹敵無數。',
        breakthroughAdvice: '《紫微現代解盤邏輯》改運法門：將尖銳的批判能量投射於專業領域（如法務審計、專利訴訟、公關質檢、醫療外科），私生活中修持「閉嘴禪」，只說建言不吐是非。',
        actionGuidance: [
          '嚴格將犀利言辭限縮於客觀工作業務中，不對身邊親友施加批判性審判',
          '生氣或焦慮時奉行「十秒深呼吸不發言」原則，避免在情緒頂點發送訊息',
          '多修持讚美他人微小優點的習慣，以柔和之聲化解火羊煞氣'
        ]
      });
      break;
    }
  }

  // 8. 祿隨忌走心理動力學診斷 (生年化忌 vs 生年化祿)
  let jiPalaceInfo: LuSuiJiZouDiagnosis['jiPalace'] | null = null;
  let luPalaceInfo: LuSuiJiZouDiagnosis['luPalace'] | null = null;

  for (let i = 0; i < 12; i++) {
    const p = palaces[i];
    const mJi = hasMutagen(p, '忌');
    if (mJi.has) {
      const voidDesc: Record<string, string> = {
        '命宮': '對自身價值感懷疑，缺乏天生安全感，總覺得自己不夠好，有強烈的自我苛求與自卑陰影。',
        '兄弟宮': '總覺得手足或緊密夥伴不可靠，容易因資源分配或情感不均產生被孤立感。',
        '夫妻宮': '對親密關係既渴望又恐懼，總害怕被伴侶辜負或拋棄，容易產生窒息式猜疑與控制。',
        '子女宮': '對晚輩、下屬或創作成果感到極度焦慮，操心過度，容易在親子教育中陷入緊繃。',
        '財帛宮': '天生對金錢極度匱乏與不安，無論戶頭有多少積蓄總覺得隨時會破產，生活難以真正放鬆享受。',
        '疾厄宮': '對身體健康或潛意識精神狀態感到脆弱，容易受自律神經與情緒壓力內耗困擾。',
        '遷移宮': '在公眾場合或陌生環境中容易感到格格不入、缺乏庇護，出門在外常常神經緊繃。',
        '交友宮': '對大眾人際或社交圈充滿防禦戒心，害怕被背叛或利用，難以向外人完全敞開心扉。',
        '官祿宮': '對職場地位與事業成就充滿巨大危機感，害怕落後於同儕，往往把自己逼至工作狂極限。',
        '田宅宮': '對家的穩定與實體資產極度渴望，常有「無家可歸」的心靈流浪感，執著於購置不動產。',
        '福德宮': '精神世界容易陷入悲觀反芻與無端焦慮，難以體會純粹當下的快樂，思慮極為深重。',
        '父母宮': '對長輩或權威機構的認可感到自卑或沈重壓力，背負著必須證明自己的心理重擔。'
      };
      jiPalaceInfo = {
        index: i,
        name: p.name,
        branch: p.earthlyBranch,
        star: mJi.star,
        psychologicalVoid: voidDesc[p.name] || '對該宮位領域充滿深層匱乏感與不安全感。'
      };
    }

    const mLu = hasMutagen(p, '祿');
    if (mLu.has) {
      const desireDesc: Record<string, string> = {
        '命宮': '極度渴望展現自我風采，追求生活品質與自由自在，試圖用個人光芒證明自身存在感。',
        '兄弟宮': '將大量熱情與金錢投入兄弟同儕或合作夥伴身上，試圖用江湖義氣換取歸屬感。',
        '夫妻宮': '把人生的救贖全盤寄託於浪漫愛情，試圖以伴侶的極致寵愛來療癒內在匱乏。',
        '子女宮': '熱衷於投資後代或開拓新專案，試圖用培育新生命的繁茂來感受自我價值。',
        '財帛宮': '瘋狂渴望賺取財富與現金流，認為錢能擺平一切問題，把所有精力投入搞錢。',
        '疾厄宮': '追求身心極致的感官享受與生活舒適，試圖用美食休閒麻醉內心的精神焦慮。',
        '遷移宮': '渴望遠走高飛、環遊世界或在異鄉開拓新天地，試圖在遠方尋找人生的自由解答。',
        '交友宮': '狂熱結交各路朋友與人脈社群，試圖以賓客盈門的熱鬧驅散內心深處的孤獨。',
        '官祿宮': '無休止追求更高的事業頭銜與企業規模，試圖用世俗功名換取眾人的景仰。',
        '田宅宮': '狂熱收藏實體房產或營造奢華溫馨家園，試圖以實體圍牆築造心靈堡壘。',
        '福德宮': '追求精神哲學、玄學或藝術享受，渴望在心靈世界獲得純粹的福分與超脫。',
        '父母宮': '渴望獲得名校文憑、體制背書或長輩讚賞，試圖用體面的社會身份包裝自己。'
      };
      luPalaceInfo = {
        index: i,
        name: p.name,
        branch: p.earthlyBranch,
        star: mLu.star,
        desireProjection: desireDesc[p.name] || '在該領域充滿強烈熱情與過度付出的追求。'
      };
    }
  }

  let luSuiJiZouResult: LuSuiJiZouDiagnosis | null = null;
  if (jiPalaceInfo && luPalaceInfo) {
    const interplay = `命盤中化忌落在【${jiPalaceInfo.name}】（以${jiPalaceInfo.star}引動），化祿落在【${luPalaceInfo.name}】（以${luPalaceInfo.star}引動）。在現代心理動力學上，這形成了典型的「祿隨忌走」心理代償死循環：命主內心深處最焦慮自卑的黑洞在【${jiPalaceInfo.name}】，卻潛意識瘋狂試圖透過在【${luPalaceInfo.name}】的大量投入與成功來「填補」這個缺口。然而，外在的化祿永遠無法填滿內在化忌的黑洞，反而容易導致精力過度傾斜、心力交瘁。`;
    const keRational = `【化科解套策略】：化忌不需要消滅，也不可能消滅！接納【${jiPalaceInfo.name}】的不完美與脆弱，將其定位為「劃清心理邊界與打磨專業深度」的磨刀石。停止利用【${luPalaceInfo.name}】過度代償，學會向自己妥協，接納「人生有些領域本就無需十全十美」。`;
    const quanExecution = `【化權掌控行動】：在【${luPalaceInfo.name}】建立不可替代的專業技術壁壘，而非情緒性無節制擴張；在【${jiPalaceInfo.name}】設立制度化防火牆，凡遇恐懼之事以流程化、法律化、理性化方式應對，切忌意氣用事。`;

    luSuiJiZouResult = {
      jiPalace: jiPalaceInfo,
      luPalace: luPalaceInfo,
      interplaySummary: interplay,
      keRationalBoundary: keRational,
      quanExecutionPower: quanExecution
    };
  }

  const overall = detected.length > 0
    ? `命盤共成功偵測到 ${detected.length} 大核心格局（涵蓋 ${detected.filter(d => d.category === 'auspicious').length} 吉格、${detected.filter(d => d.category === 'challenging').length} 破局挑戰格）。命運不是宿命判決，而是原廠設定與行為棋局。善用吉格之風口，將煞忌之張力轉化為攻堅引擎，方為大師級改運之真諦。`
    : `本命盤星曜配置趨於平衡隨和，無極端偏枯之重煞大格，亦無過度冒險之橫發暴跌。此乃「平淡是真、細水長流」之福氣命格，重在順應時運大限、穩中求進。`;

  return {
    detectedPatterns: detected,
    luSuiJiZou: luSuiJiZouResult,
    overallBreakthroughSummary: overall
  };
}
