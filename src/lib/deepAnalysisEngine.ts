/**
 * 天樞星象 - 宗師級離線深度命理破譯引擎 (Deep Analysis Engine)
 * 深度融匯：
 * 1. 大耕老師現代紫微斗數體系（《紫微攻略．新手村》《改運之書_格局篇》《紫微攻略5_愛情篇》）
 *    - 14主星原廠設定心理動力學
 *    - 大耕老師獨家「祿隨忌走」心理閉環與解套心法
 *    - 大耕老師「六煞星是生命的加速前進引擎」實戰轉化
 *    - 對宮照妖鏡（夫官一體、命遷一體、財福一體等）
 * 2. 北派河洛欽天門四化秘儀（方外人手稿、墨塵講義）
 *    - 來因宮因果樞紐發動機
 *    - 生年四化先天定數與宮干自化（向心入庫 vs 離心出氣、自化法象生年）
 *    - 三層動態疊宮拓撲（本命 ✕ 大限 ✕ 流年 ✕ 流月）
 * 3. 專屬流年（Yearly）與流月（Monthly）千字級深度運勢精批引擎
 */

import type { PalaceData, HoroscopeState, BaziData, SanFangSiZheng } from '../types';
import { MAJOR_STAR_DESCRIPTIONS, DUAL_STAR_MAP, MUTAGEN_MEANINGS } from './interpreter';

// 十天干生年四化表
export const STEM_SI_HUA: Record<string, { lu: string; quan: string; ke: string; ji: string }> = {
  '甲': { lu: '廉貞', quan: '破軍', ke: '武曲', ji: '太陽' },
  '乙': { lu: '天機', quan: '天梁', ke: '紫微', ji: '太陰' },
  '丙': { lu: '天同', quan: '天機', ke: '文昌', ji: '廉貞' },
  '丁': { lu: '太陰', quan: '天同', ke: '天機', ji: '巨門' },
  '戊': { lu: '貪狼', quan: '太陰', ke: '右弼', ji: '天機' },
  '己': { lu: '武曲', quan: '貪狼', ke: '天梁', ji: '文曲' },
  '庚': { lu: '太陽', quan: '武曲', ke: '太陰', ji: '天同' },
  '辛': { lu: '巨門', quan: '太陽', ke: '文曲', ji: '文昌' },
  '壬': { lu: '天梁', quan: '紫微', ke: '左輔', ji: '武曲' },
  '癸': { lu: '破軍', quan: '巨門', ke: '太陰', ji: '貪狼' }
};

// 十二宮標準順序（逆時針排列：命宮=0, 兄弟=1, 夫妻=2...）
export const TWELVE_PALACE_ORDER = [
  '命宮', '兄弟', '夫妻', '子女', '財帛', '疾厄',
  '遷移', '僕役', '官祿', '田宅', '福德', '父母'
];

export interface DynamicPalaceDeepAnalysis {
  philosophy: string;
  modernManifestation: string;
  shadowAndLight: string;
  actionGuidance: string;
  totalWords: number;
}

// 五虎遁元：由流年天干求各農曆流月天干
export function getLunarMonthStem(yearStem: string, lunarMonth: number): string {
  const baseStemIndex: Record<string, number> = {
    '甲': 2, '己': 2, // 丙寅
    '乙': 4, '庚': 4, // 戊寅
    '丙': 6, '辛': 6, // 庚寅
    '丁': 8, '壬': 8, // 壬寅
    '戊': 0, '癸': 0  // 甲寅
  };
  const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const startIdx = baseStemIndex[yearStem] ?? 2;
  const monthIdx = (startIdx + (lunarMonth - 1)) % 10;
  return STEMS[monthIdx];
}

// =========================================================================
// 1. 動態宮位千字深度解析 (大耕老師現代紫微 ✕ 欽天四化本命盤破譯)
// =========================================================================
export function generatePalaceDynamicDeepReading(
  selectedPalace: PalaceData,
  allPalaces: PalaceData[],
  sanFang: SanFangSiZheng,
  horoscope: HoroscopeState,
  bazi: BaziData,
  laiYinIndex: number
): DynamicPalaceDeepAnalysis {
  const pName = selectedPalace.name;
  const pStem = selectedPalace.heavenlyStem;
  const pBranch = selectedPalace.earthlyBranch;
  const majorStars = selectedPalace.majorStars;
  const minorStars = selectedPalace.minorStars;
  const selfMutagens = selectedPalace.selfMutagens;
  const isLaiYin = selectedPalace.index === laiYinIndex;
  const isBody = selectedPalace.isBodyPalace;

  const oppositePalace = allPalaces[sanFang.oppositeIndex] || selectedPalace;
  const trine1Palace = allPalaces[sanFang.trine1Index] || selectedPalace;
  const trine2Palace = allPalaces[sanFang.trine2Index] || selectedPalace;
  const flankPrev = allPalaces[sanFang.flankPrevIndex] || selectedPalace;
  const flankNext = allPalaces[sanFang.flankNextIndex] || selectedPalace;

  // 找全盤生年忌與生年祿所在宮位（用於大耕老師「祿隨忌走」心理閉環）
  let natalJiPalaceName = '未知宮位';
  let natalLuPalaceName = '未知宮位';
  allPalaces.forEach(p => {
    if (p.majorStars.some(s => s.mutagen === '忌')) natalJiPalaceName = p.name;
    if (p.majorStars.some(s => s.mutagen === '祿')) natalLuPalaceName = p.name;
  });

  // ---------------------------------------------------------
  // Part 1: 【宮位天道太極 ✕ 主星原廠設定深度精批】(~350字)
  // ---------------------------------------------------------
  let starArchetypeText = '';
  if (majorStars.length === 0) {
    const oppStars = oppositePalace.majorStars.map(s => `${s.name}${s.brightness ? `(${s.brightness})` : ''}`).join('、') || '亦無主星';
    starArchetypeText = `此宮在先天命盤中呈現【空宮 (無正曜坐守)】。大耕老師在《新手村》中特別叮嚀：空宮並非「空空如也」或命運不濟，而是代表命主在【${pName}】這個生命領域中，先天設定的邊界感較為模糊、框架極少，對外部環境與同儕情緒具備極度敏銳的「海綿吸水效應」。
正統斗數心法必須「借對宮【${oppositePalace.name}】之星曜（${oppStars}）」作為主要精神坐標與行事參照。命主在此處表現出高度的適應力與圓融彈性，能隨時配合環境轉換角色；但其潛在盲點在於容易缺乏定見、容易受周圍強勢者之牽引而隨波逐流。修為關鍵在於：對宮是你的鏡子，借外部鏡像照見自己，化被動為靈動。`;
  } else {
    const starNames = majorStars.map(s => s.name);
    // 檢查是否有雙星組合
    let dualDesc = '';
    for (const [pairKey, pairInfo] of Object.entries(DUAL_STAR_MAP)) {
      const parts = pairKey.split('');
      if (parts.length === 4) {
        const s1 = pairKey.slice(0, 2);
        const s2 = pairKey.slice(2, 4);
        if (starNames.includes(s1) && starNames.includes(s2)) {
          dualDesc = `【${pairInfo.title}】：${pairInfo.desc} `;
          break;
        }
      }
    }

    const starDetails = majorStars.map(s => {
      const desc = MAJOR_STAR_DESCRIPTIONS[s.name];
      const brightNote = s.brightness ? `，亮度居於【${s.brightness}】之位` : '';
      const mutNote = s.mutagen ? `，更受生年【化${s.mutagen}】之強力淬鍊` : '';
      if (!desc) return `星曜【${s.name}】${brightNote}${mutNote}。`;
      return `【${s.name}星（${desc.element} · ${desc.role}）${brightNote}${mutNote}】：
大耕老師原廠設定剖析：${desc.personality} 在世俗職場與行為中，展現出「${desc.career}」；在資產與金錢意識上，表現為「${desc.wealth}」；而在人際與親密對待時，則呈現「${desc.relationship}」。`;
    }).join('\n\n');

    starArchetypeText = `${dualDesc ? `${dualDesc}\n\n` : ''}坐宮星曜詳細原廠設定拆解：\n${starDetails}`;
  }

  const overlayNames = [selectedPalace.decadalName, selectedPalace.yearlyName, selectedPalace.monthlyName].filter(Boolean);
  const transitOverlayText = (horoscope && overlayNames.length > 0)
    ? `✦ 當前時運重疊共振：本宮在當前時運流轉中重疊【${overlayNames.join('、')}】之氣候，代表此領域現實事件將在相應運限中被高頻引動。\n`
    : '';

  const baziCrossText = bazi
    ? `✦ 八字日主五行合參：命造八字日主為【${bazi.dayMaster}】(${bazi.dayMasterStrength})，遇本宮【${pStem}${pBranch}】五行氣候，形成先天八字命元與後天紫微星曜之深層共振。\n`
    : '';

  const philosophy = `【${pStem}${pBranch} ${pName}】座落於地支【${pBranch}】位，受天干【${pStem}】之氣場引動，大限年歲跨度為 ${selectedPalace.decadalRange[0]}～${selectedPalace.decadalRange[1]} 歲。
${isLaiYin ? `✦ 本宮特別標註：此處為命造之【來因宮】！在欽天門秘儀中，來因宮乃今生生年四化發射總部與靈魂轉世之因果發動機，這意味著命主一生的成敗榮辱、最放不下的責任與宿命牽絆，核心皆聚焦於【${pName}】之上！\n` : ''}${isBody ? `✦ 本宮特別標註：此處為命造之【身宮】！古訣云「三十前看命宮，三十五後看身宮」，身宮象徵後天肉身之立足點與中晚年人生行事的執著依歸。\n` : ''}${transitOverlayText}${baziCrossText}
${starArchetypeText}`;

  // ---------------------------------------------------------
  // Part 2: 【四化動力學：大耕老師祿隨忌走 ✕ 欽天生年自化法象】(~350字)
  // ---------------------------------------------------------
  const natalMutagens = majorStars.filter(s => s.mutagen);
  let mutagenAnalysis = '';
  if (natalMutagens.length > 0) {
    mutagenAnalysis = natalMutagens.map(s => {
      const mInfo = (MUTAGEN_MEANINGS as Record<string, any>)[s.mutagen || ''];
      let roleDesc = '';
      if (s.mutagen === '祿') {
        roleDesc = `大耕老師指出：生年祿坐入【${pName}】，象徵命主在此領域先天帶有豐沛的機遇與緣分，善意滿滿、出手大方，對此處充滿熱情與憧憬。但需提防「祿多則怠」，容易因過度樂觀而缺乏風險防範。`;
      } else if (s.mutagen === '權') {
        roleDesc = `大耕老師指出：生年權坐入【${pName}】，象徵掌控欲與專業霸氣在此宮全面顯化。命主凡事渴望親自拍板主導、好勝心強、不甘居人下，具備極強的打硬仗魄力，惟需注意溝通時過於生硬霸道。`;
      } else if (s.mutagen === '科') {
        roleDesc = `大耕老師指出：生年科坐入【${pName}】，為清白聲譽、教養禮貌與貴人解厄之泉源。命主在此處愛惜羽毛、注重形象、處事有條理，遇到波折往往有貴人長輩暗中解危。`;
      } else if (s.mutagen === '忌') {
        roleDesc = `大耕老師核心心理動力學深度破譯：生年忌坐入【${pName}】，此處正是你靈魂最深處的「黑洞」與「核心不安全感所在」！你在此領域最感焦慮、最怕失去、最容易自責與完美主義苛求。但大耕老師鄭重強調：化忌不是宿命的懲罰，而是生命為了把你磨礪成該領域真正的大師而出的考題！你付出的所有心血與鑽研，終將在此處結出最沉甸甸的果實。`;
      }
      return `✦ 【${s.name} 化${s.mutagen}】：${roleDesc}（${mInfo ? `${mInfo.character}：${mInfo.effect} 戒律指引：${mInfo.warning}` : ''}）`;
    }).join('\n\n');
  } else {
    mutagenAnalysis = `本宮坐星並無生年四化直接座守，代表此領域的能量運作偏向潛移默化、遵循常規。然而，它隨時受到命盤整體氣運的牽制。`;
  }

  // 大耕老師「祿隨忌走」聯動剖析
  const luSuiJiText = `大耕老師獨家「祿隨忌走」心理閉環深度解析：
全盤生年忌坐落於【${natalJiPalaceName}】，而生年祿坐落於【${natalLuPalaceName}】。根據大耕老師的人性動力學法則，人在潛意識中為了填補【${natalJiPalaceName}】所感受到的欠債感與匱乏黑洞，會拼命將所有精力、熱情與追求傾注到【${natalLuPalaceName}】中，試圖以化祿的獲得感來麻醉化忌的焦慮。
然而「化祿永遠填不滿化忌」！若【${pName}】恰為化忌或化祿之宮位，這股拉扯感將更為劇烈。唯有正視並接納【${natalJiPalaceName}】的不完美，停止將其視為洪水猛獸，化祿才能轉化為純粹的熱情奉獻，全盤氣局方能真正活化。`;

  // 宮干自化剖析
  let selfMutagenText = '';
  if (selfMutagens.length > 0) {
    selfMutagenText = selfMutagens.map(sm => {
      let smDesc = '';
      if (sm.mutagen === '祿') smDesc = '【自化祿（祿出）】：在此宮位容易大方施捨、不計代價，對人事物隨緣相待，但也意味著資源與感情容易隨時間自然淡出流失。';
      if (sm.mutagen === '權') smDesc = '【自化權（權出）】：在此宮位容易突發爭執、任性好勝、想奪回主導權，但容易三分鐘熱度，缺乏持久耐性。';
      if (sm.mutagen === '科') smDesc = '【自化科（科出）】：在此宮位過度顧及面子形象、好人主義、得過且過，在關鍵抉擇時容易優柔寡斷。';
      if (sm.mutagen === '忌') smDesc = '【自化忌（忌出）】：大耕老師與欽天門嚴肅預警！自化忌為宮位離心洩氣，命主容易在此處自尋煩惱、自我懷疑、自暴自棄，甚至自己砸掉辛苦建立的成果。需刻意修煉「正念自我肯定」，守住心防！';
      return `✦ ${sm.star}自化${sm.mutagen} ➔ ${smDesc}`;
    }).join('\n');
    selfMutagenText = `\n\n宮干【${pStem}】引發之「自化現象（向心/離心能量洩露與交換）」：\n${selfMutagenText}\n欽天門古訣提醒：「自化必法象生年」，自化之發動，乃是後天環境促使你將先天生年星之能量向外釋放或向內消耗之轉折點。`;
  } else {
    selfMutagenText = `\n\n宮干【${pStem}】自化檢測：無自化現象，代表此宮之能量守恆度高、不易受外界挑釁而突發性情緒洩露，結構扎實穩固。`;
  }

  const modernManifestation = `${mutagenAnalysis}\n\n${luSuiJiText}${selfMutagenText}`;

  // ---------------------------------------------------------
  // Part 3: 【吉凶星配置：大耕老師「煞星是生命加速引擎」實戰剖析】(~300字)
  // ---------------------------------------------------------
  const luckyStars = minorStars.filter(s => ['天魁', '天鉞', '左輔', '右弼', '文昌', '文曲', '祿存', '天馬'].includes(s.name));
  const shaStars = minorStars.filter(s => ['擎羊', '陀羅', '火星', '鈴星', '地空', '地劫'].includes(s.name));

  let luckyText = luckyStars.length > 0 
    ? `坐宮吉曜輔弼：${luckyStars.map(s => `【${s.name}】`).join('、')}。
吉曜乃天地之助力。魁鉞主長輩提攜與公家制度之庇護；輔弼為同儕團隊之得力臂膀；昌曲賦予敏銳思維與契約文采；祿存天馬則為穩固資產與開拓求財之活水。`
    : '坐宮無六吉主曜直接同宮，代表在此領域中命主需靠個人自立開拓，不可過度依賴外界現成貴人之餽贈。';

  let shaText = '';
  if (shaStars.length > 0) {
    const shaDetails = shaStars.map(s => {
      if (s.name === '擎羊') return '【擎羊（正面刀鋒）】：大耕老師指出，擎羊不是血光之災，而是敢打硬仗的魄力！轉化為外科手術般的精準決斷、打破技術瓶頸與打破壟斷的強大攻擊力。';
      if (s.name === '陀羅') return '【陀羅（暗轉磨練）】：大耕老師指出，陀羅不是拖延阻礙，而是匠人精神的極致！轉化為耐得住枯燥寂寞的深耕研發、十年磨一劍的頑強毅力。';
      if (s.name === '火星') return '【火星（烈火爆發）】：大耕老師指出，火星不是暴躁衝動，而是危機處理的爆發力！轉化為短跑衝刺、在市場風口搶佔先機的神速執行力。';
      if (s.name === '鈴星') return '【鈴星（深沉陰火）】：大耕老師指出，鈴星不是陰險記仇，而是幕後佈局的深思熟慮！轉化為沉著冷靜的防禦體系與未雨綢繆的戰略智慧。';
      if (s.name === '地空') return '【地空（精神空靈）】：大耕老師指出，地空不是一無所有，而是跳脫世俗的哲學大智慧！轉化為天馬行空的藝術靈感與不拘常規的反向思維。';
      if (s.name === '地劫') return '【地劫（物質起伏）】：大耕老師指出，地劫不是破產敗家，而是千金散盡還復來的抗挫韌性！轉化為極強的危機應變與東山再起之非凡氣度。';
      return `【${s.name}】；`;
    }).join('\n');
    shaText = `大耕老師革命性「六煞星是前進引擎」深度轉化：\n${shaDetails}`;
  } else {
    shaText = `大耕老師煞星觀照：坐宮無六煞星侵擾，格局平和順遂。但大耕老師亦提醒「無煞不貴」，平穩之境需自我設定高標準目標，主動走出舒適圈，方能激發深層潛能。`;
  }

  const shadowAndLight = `${luckyText}\n\n${shaText}`;

  // ---------------------------------------------------------
  // Part 4: 【三方四正照會 ✕ 大耕老師現代落地破局與自我修為錦囊】(~300字)
  // ---------------------------------------------------------
  const oppositeStars = oppositePalace.majorStars.map(s => s.name).join('、') || '無主星';
  const trine1Stars = trine1Palace.majorStars.map(s => s.name).join('、') || '無主星';
  const trine2Stars = trine2Palace.majorStars.map(s => s.name).join('、') || '無主星';

  const sanFangText = `三方四正全息網絡共振：
1. 【對宮沖照（鏡像照妖鏡）】：對宮【${oppositePalace.name}】坐【${oppositeStars}】。大耕老師強調「對宮是照妖鏡，亦是外在環境的直接顯影」。例如官祿對宮為夫妻，說明事業節奏與婚姻親密感息息相關；命宮對宮為遷移，說明內心品格直接投射為公眾人設。
2. 【三合拱會（鼎立支撐架構）】：三合宮【${trine1Palace.name} (${trine1Stars})】與【${trine2Palace.name} (${trine2Stars})】共同構成鼎立支援之勢，源源不絕為本宮輸送資源與動能。
3. 【夾宮相扶】：相鄰前宮【${flankPrev.name}】與後宮【${flankNext.name}】構成夾宮氣候，揭示周圍人際與家族環境的隱形約束或庇蔭。`;

  const actionGuidanceText = `大耕老師現代落地破局與實踐修為錦囊：
一、【心智重塑】：不與煞星硬碰硬，接納化忌的不完美。明白當前宮位的焦慮正是生命給予的功課，學會放下病態控制欲，以化科的理性建立停損點與健康邊界。
二、【實戰攻防】：在現代職場與商業活動中，針對坐宮星曜特質精準卡位（剛星宜主導開創、柔星宜策劃幕僚）。涉及合約、借貸與合夥，務必白紙黑字先小人後君子，避開人情牽絆之暗礁。
三、【行運掌握】：知進退、避風芒。在逢大限流年吉化之時，大膽主動出擊捕捉風口；逢流年煞忌交侵之歲，收斂鋒芒、閉關充電、深耕技術，真正達成由「隨星流轉」昇華至「以心御星」的自主改運大境界！`;

  const actionGuidance = `${sanFangText}\n\n${actionGuidanceText}`;
  const totalWords = philosophy.length + modernManifestation.length + shadowAndLight.length + actionGuidance.length;

  return {
    philosophy,
    modernManifestation,
    shadowAndLight,
    actionGuidance,
    totalWords
  };
}

// =========================================================================
// 2. 流年歲君千字深度解析 (大耕老師疊宮法則 ✕ 流年天干四化 ✕ 年度攻守指南)
// =========================================================================
export function getYearlyDeepReading(horoscope: HoroscopeState, allPalaces?: PalaceData[]): string {
  const y = horoscope.yearlyInfo;
  if (!y) return '當前未選定流年，請於時運羅盤中選取欲觀測之具體流年年份。';

  const yearNum = y.year;
  const yearStem = y.stem;
  const yearBranch = y.branch;
  const nominalAge = y.nominalAge;
  const lifePalaceIdx = y.palaceIndex; // 流年命宮地支索引

  // 計算流年天干四化
  const sihua = STEM_SI_HUA[yearStem] || { lu: '天同', quan: '天機', ke: '文昌', ji: '廉貞' };

  // 12宮疊宮計算
  let overlaySummary = '';
  let siHuaLocations = '';
  let jiClashSummary = '';

  if (allPalaces && allPalaces.length === 12) {
    const yearlyLifePalace = allPalaces[lifePalaceIdx];
    const yearlyGuanLuPalace = allPalaces[(lifePalaceIdx - 8 + 12) % 12];
    const yearlyCaiBoPalace = allPalaces[(lifePalaceIdx - 4 + 12) % 12];
    const yearlyFuQiPalace = allPalaces[(lifePalaceIdx - 2 + 12) % 12];
    const yearlyTianZhaiPalace = allPalaces[(lifePalaceIdx - 9 + 12) % 12];
    const yearlyQianYiPalace = allPalaces[(lifePalaceIdx - 6 + 12) % 12];

    overlaySummary = `【流年十二宮重疊本命盤核心疊宮拓撲】：
- 【流年命宮】：太歲坐入地支【${yearBranch}】，重疊本命【${yearlyLifePalace?.name || '命宮'}】。大耕老師疊宮心法：流年命宮重疊本命某宮，代表今年你整年度的生活重心、注意力與主要考題，將全數圍繞著【${yearlyLifePalace?.name}】的人事物展開！
- 【流年官祿】：重疊本命【${yearlyGuanLuPalace?.name || '官祿'}】，主導今年職場專案推進、工作跳槽與升遷競爭之主要戰場。
- 【流年財帛】：重疊本命【${yearlyCaiBoPalace?.name || '財帛'}】，揭示今年金錢進出之主管道與投資盈虧之關鍵轉折。
- 【流年夫妻】：重疊本命【${yearlyFuQiPalace?.name || '夫妻'}】，主導今年感情桃花、夫妻關係或親密合作之互動品質。
- 【流年田宅】：重疊本命【${yearlyTianZhaiPalace?.name || '田宅'}】，主導居家環境、不動產購置、搬遷或家庭內庫之穩定度。
- 【流年遷移】：重疊本命【${yearlyQianYiPalace?.name || '遷移'}】，主導出外遠行、跨界開拓、出差旅行與外部大眾人設。`;

    // 尋找四化星落入本命何宮
    let luInPalace = '全盤';
    let quanInPalace = '全盤';
    let keInPalace = '全盤';
    let jiInPalace = '全盤';
    let jiPalaceIdx = 0;

    allPalaces.forEach((p, idx) => {
      const starNames = p.majorStars.map(s => s.name);
      if (starNames.includes(sihua.lu)) luInPalace = p.name;
      if (starNames.includes(sihua.quan)) quanInPalace = p.name;
      if (starNames.includes(sihua.ke)) keInPalace = p.name;
      if (starNames.includes(sihua.ji)) {
        jiInPalace = p.name;
        jiPalaceIdx = idx;
      }
    });

    const jiClashPalace = allPalaces[(jiPalaceIdx + 6) % 12];

    siHuaLocations = `【${yearNum}（${yearStem}${yearBranch}）年天干【${yearStem}】歲君四化飛星落點深入破譯】：
1. 【流年化祿 ➔ ${sihua.lu}星】入本命【${luInPalace}】：
   - 機遇風口所在！老天爺今年把最大的善緣、機會與吸金管道放在【${luInPalace}】。命主應在此領域主動進擊，大膽拓展合作與佈局，收穫年度天時紅利。
2. 【流年化權 ➔ ${sihua.quan}星】入本命【${quanInPalace}】：
   - 權威打拼所在！今年你必須在【${quanInPalace}】親自扛起責任、展現硬核技術與掌控魄力。此處競爭激烈但也是你樹立權威的大好良機。
3. 【流年化科 ➔ ${sihua.ke}星】入本命【${keInPalace}】：
   - 名聲貴人所在！今年在【${keInPalace}】宜多注重個人品牌、資格認證考試與公關形象，遇到挫折時向此處所屬之長輩或導師求助，必能化險為夷。
4. 【流年化忌 ➔ ${sihua.ji}星】入本命【${jiInPalace}】：
   - 年度核心黑洞與防守防線！化忌代表虧欠、是非、糾葛與過度焦慮。今年切莫在【${jiInPalace}】心存僥倖、盲目加槓桿或情緒用事！`;

    jiClashSummary = `✦ 大耕老師與欽天門特別警示【化忌沖宮】：
流年化忌【${sihua.ji}】坐落於【${jiInPalace}】，其正面沖破之對宮為【${jiClashPalace?.name}】！
大耕老師金句：「忌坐之宮主操心，忌沖之宮受重創！」今年【${jiClashPalace?.name}】才是真正要嚴防死守的風暴眼。例如沖財帛防重大破財，沖夫妻防劇烈爭端，沖官祿防職場人事傾軋，沖疾厄防突發健康透支！務必提前建立風險防火牆！`;
  } else {
    overlaySummary = `流年太歲坐入地支【${yearBranch}】，主管全年度之世俗氣象與人事變遷。`;
    siHuaLocations = `天干【${yearStem}】引動流年四化：${sihua.lu}化祿、${sihua.quan}化權、${sihua.ke}化科、${sihua.ji}化忌。`;
  }

  return `【流年歲君全面深批：${yearNum} ${yearStem}${yearBranch}年 · 虛歲 ${nominalAge}歲】

一、宏觀太歲巡遊與三層疊宮密碼：
歲君如同一年之皇帝巡行疆土，${yearNum}年太歲坐落於地支【${yearBranch}】宮位。外部社會大環境之政策脈動、經濟風口與人事潮流，將全面對命主施加強大的推進與考驗。命主在此年間將深刻感受到生活節奏之加速，許多過去懸而未決之事將被外部情勢倒逼著必須做出決斷。
${overlaySummary}

二、天干【${yearStem}】歲君四化飛星與吉凶座標：
${siHuaLocations}
${jiClashSummary}

三、大耕老師獨家：流年「祿隨忌走」心理與現實戰略破局：
大耕老師指出，流年之「祿隨忌走」是當年度命主心理壓力的縮影。
今年流年化忌在【${sihua.ji}】，你在潛意識中對該領域最缺乏安全感，因此會下意識地拼命抓取流年化祿【${sihua.lu}】來掩飾內心的匱乏。
破局心法：不要用忙碌來逃避核心問題！唯有運用流年化科【${sihua.ke}】的理性與秩序，冷靜劃清界線、審視制度漏洞，流年化權的魄力才能精準發揮，流年化祿的財富與善緣才能真正落袋為安。

四、流年四大專題實戰行動指南：
1. 【事業工作與升遷跳槽】：遇流年祿權相會之宮位，宜主動爭取帶領新專案、開拓新業務；若流年官祿宮逢化忌沖射，切忌衝動盲目裸辭或借貸創業，宜採「深挖洞、廣積糧」之守勢策略。
2. 【財務金流與投資風控】：流年財帛與田宅為年度錢財進出門戶，見流年祿存宜穩健置產或增加定存被動現金流；遇化忌沖照時，嚴格杜絕高風險槓桿投機，合同款項務必白紙黑字約定清楚。
3. 【感情桃花與婚姻相處】：流年夫妻宮若逢紅鸞天喜吉化，單身者正緣磁場強烈，宜多參與社交活動；已婚者若逢煞忌沖動，宜聚少離多、相互給予事業空間，以理性包容化解摩擦。
4. 【健康身心與行事節奏】：注意流年忌星所落臟腑經絡五行之調養，凡事給自己預留緩衝彈性，保持「不以物喜、不以己悲」之戰略定力，自能安度考驗、穩操勝券！`;
}

// =========================================================================
// 3. 流月節律千字深度解析 (斗君月建 ✕ 流月疊宮 ✕ 月度氣運攻守錦囊)
// =========================================================================
export function getMonthlyDeepReading(horoscope: HoroscopeState, allPalaces?: PalaceData[]): string {
  const m = horoscope.monthlyInfo;
  const y = horoscope.yearlyInfo;
  if (!m || !y) return '當前未選定流月，請於時運羅盤中選取欲觀測之具體流月月份。';

  const monthNum = horoscope.selectedMonth || m.month || 1;
  const mStem = m.stem;
  const mBranch = m.branch;
  const mPalaceIdx = m.palaceIndex; // 流月命宮地支索引

  const LUNAR_MONTH_NAMES = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '臘月'];
  const monthName = LUNAR_MONTH_NAMES[(monthNum - 1) % 12] || `農曆${monthNum}月`;

  // 流月四化
  const mSihua = STEM_SI_HUA[mStem] || { lu: '廉貞', quan: '破軍', ke: '武曲', ji: '太陽' };

  let monthlyOverlayText = '';
  let monthlySiHuaText = '';

  if (allPalaces && allPalaces.length === 12) {
    const monthlyLifePalace = allPalaces[mPalaceIdx];
    const yearlyLifePalaceIdx = y.palaceIndex;
    const diffToYear = (yearlyLifePalaceIdx - mPalaceIdx + 12) % 12;
    const yearlyPalaceName = `流年${TWELVE_PALACE_ORDER[diffToYear]}`;

    // 流月官祿與財帛
    const monthlyGuanLuPalace = allPalaces[(mPalaceIdx - 8 + 12) % 12];
    const monthlyCaiBoPalace = allPalaces[(mPalaceIdx - 4 + 12) % 12];

    monthlyOverlayText = `【流月三層疊宮拓撲（本命 ✕ 流年 ✕ 流月）】：
- 【流月命宮】：落於地支【${mBranch}】位，精準重疊【${yearlyPalaceName}】，底層對應本命【${monthlyLifePalace?.name || '命宮'}】！
  大耕老師疊宮精解：本月你的全部注意力、情緒起伏與具體事件爆發點，正是這三層宮位的交集！當流月命宮踩入【${yearlyPalaceName}】時，今年在該領域所埋下的種子，將在【${monthName}】迎來實質性的開花結果或嚴峻檢驗！
- 【流月官祿】：重疊本命【${monthlyGuanLuPalace?.name || '官祿'}】，主導本月份之具體工作任務推進、主管指示、業績考核與職場互動。
- 【流月財帛】：重疊本命【${monthlyCaiBoPalace?.name || '財帛'}】，揭示本月份日常現金周轉、帳單支出、回款進度與消費慾望。`;

    // 尋找月四化落入本命何宮
    let mLuPalace = '全盤';
    let mJiPalace = '全盤';
    let mJiPalaceIdx = 0;

    allPalaces.forEach((p, idx) => {
      const starNames = p.majorStars.map(s => s.name);
      if (starNames.includes(mSihua.lu)) mLuPalace = p.name;
      if (starNames.includes(mSihua.ji)) {
        mJiPalace = p.name;
        mJiPalaceIdx = idx;
      }
    });

    const mJiClashPalace = allPalaces[(mJiPalaceIdx + 6) % 12];

    monthlySiHuaText = `【${monthName}（${mStem}${mBranch}月）流月天干【${mStem}】四化動態密碼】：
1. 【流月化祿 ➔ ${mSihua.lu}星】入本命【${mLuPalace}】：
   - 本月份最大的小確幸與機會之窗！此處利於洽談商務、增進人際和睦、獲取獎金補貼或靈感爆發，是本月的主攻突破口。
2. 【流月化權 ➔ ${mSihua.quan}星】與【流月化科 ➔ ${mSihua.ke}星】：
   - 化權賦予你本月雷厲風行的執行力與專業說服力；化科則為本月解決麻煩糾紛的解藥，遇阻多請教懂行的平輩或專業人士。
3. 【流月化忌 ➔ ${mSihua.ji}星】入本命【${mJiPalace}】，正面沖射對宮【${mJiClashPalace?.name}】：
   - 本月份最需戒慎恐懼之暗礁雷區！大耕老師提醒：流月忌星往往引動突發性口角是非、合約款項延宕、電腦檔案故障或身體疲憊。本月份在【${mJiPalace}】與【${mJiClashPalace?.name}】所屬之人事物上，切記「三思而後行，少說話多做事」。`;
  } else {
    monthlyOverlayText = `流月命宮坐地支【${mBranch}】，月令建極，引動當月之微觀運勢。`;
    monthlySiHuaText = `流月天干【${mStem}】引動月四化：${mSihua.lu}化祿、${mSihua.quan}化權、${mSihua.ke}化科、${mSihua.ji}化忌。`;
  }

  return `【流月節律全面深批：${monthName} (${mStem}${mBranch}月) · 斗君氣候顯微鏡】

一、斗君定軸與微觀三層時空疊合：
紫微斗數流年看宏觀大勢，流月則看具體事件之「應期節奏」。
${monthName}天干為【${mStem}】，地支坐落於【${mBranch}】位。斗君為流年氣運之月度運轉軸心，引動本月之天地氣流。
${monthlyOverlayText}

二、流月天干【${mStem}】四化飛星與微觀吉凶應期：
${monthlySiHuaText}

三、本月氣運三階段推進節律：
1. 【上旬（初一至初十 · 氣運立定）】：月令初交，心緒容易因換月氣場而產生短暫波折。此時宜盤點月度目標，確立行事清單，重要合約建議複查條款，切忌心浮氣躁。
2. 【中旬（十一至二十 · 攻堅發力）】：流月祿權動能全面釋放，為全月工作推進、商務洽談、人際拜訪與業績開展之黃金期。宜全力以赴、乘勝追擊。
3. 【下旬（廿一至三十 · 收官防禦）】：氣數逐漸向下一流月過渡，容易在瑣碎事務上出現疏漏或疲態。此處宜結算帳目、維護客戶關係、早睡早起儲備體力，平安交接。

四、大耕老師流月行事攻守錦囊與避雷指引：
1. 【職場與商務】：本月若需推動重大決策或簽署法律文件，宜選在流月祿科引動之吉利流日進行；遇長官挑剔或客戶刁難時，修持「閉嘴禪」，切忌正面情緒對撞。
2. 【財務與開銷】：注意防範衝動消費或非必要之人情借貸，尤其在流月忌星沖動之日子，外出防遺失財物，網購防退換貨麻煩。
3. 【心靈調護】：流月是靈魂在一年中的微觀呼吸。明白順逆有時，月缺月圓皆是常態。在順流中謙遜感恩，在逆流中沉潛修心，自能一個月比一個月更加沉穩自如！`;
}

// =========================================================================
// 4. 大限十年時空主軸千字深度解析 (十年大局 ✕ 本命疊宮 ✕ 攻守節奏)
// =========================================================================
export function getDecadalDeepReading(horoscope: HoroscopeState, allPalaces?: PalaceData[]): string {
  const dec = horoscope.decadalInfo;
  if (!dec) return '當前未選定大限年歲段，請於時運羅盤中選取欲觀測之十年大限。';

  const stem = dec.stem;
  const branch = dec.branch;
  const ageStart = dec.ageRange[0];
  const ageEnd = dec.ageRange[1];
  const palName = dec.name;
  const lifePalaceIdx = dec.palaceIndex;

  const decSihua = STEM_SI_HUA[stem] || { lu: '廉貞', quan: '破軍', ke: '武曲', ji: '太陽' };

  let decadalOverlayText = '';
  if (allPalaces && allPalaces.length === 12) {
    const decLifePalace = allPalaces[lifePalaceIdx];
    const decGuanLuPalace = allPalaces[(lifePalaceIdx - 8 + 12) % 12];
    const decCaiBoPalace = allPalaces[(lifePalaceIdx - 4 + 12) % 12];
    const decTianZhaiPalace = allPalaces[(lifePalaceIdx - 9 + 12) % 12];

    decadalOverlayText = `【大限十年重疊本命盤架構】：
- 【大限命宮】：重疊本命【${decLifePalace?.name || palName}】，宣告這黃金十年的人生大舞台將在此全面拉開！
- 【大限官祿】：重疊本命【${decGuanLuPalace?.name || '官祿'}】，為十年職涯發展、專業立足點與事業天花板之關鍵所在。
- 【大限財帛】：重疊本命【${decCaiBoPalace?.name || '財帛'}】，決定這十年階級躍遷、資產翻倍或財富考驗之主要通道。
- 【大限田宅】：重疊本命【${decTianZhaiPalace?.name || '田宅'}】，掌管這十年的不動產置產運、家宅安寧與家庭庫存底蘊。`;
  }

  return `【大限十年時空主軸：${stem}${branch}大限 (${ageStart}～${ageEnd}歲 · 聚焦【${palName}】)】

一、大限重疊本命之核心命題與命運轉折：
行運至此十年，大限命宮精準重疊本命【${palName}】。在紫微斗數「天人合一、體用疊加」的原理下，這意味著本命盤中該領域所隱藏的一切潛能、欠債與課題，將在這黃金十年內被全面喚醒與激化。這十年的生活重心、資源調配與主要心力，將無可避免地圍繞著「${palName}」展開激戰。若該宮位本命吉星多，這十年將是順風順水、大展宏圖的黃金擴張期；若本命該宮位藏有煞忌暗礁，則這十年將是生命淬鍊心志、浴火重生的試金石大考驗。
${decadalOverlayText}

二、大限天干【${stem}】化星飛布引動之微觀時空密碼：
大限天干「${stem}」如同十年間的天時大氣候，化出大限專屬之【${decSihua.lu}化祿、${decSihua.quan}化權、${decSihua.ke}化科、${decSihua.ji}化忌】：
1. 【大限化祿之方（${decSihua.lu}星所在）】：為這十年財利、機遇與善緣的主攻方向。命主應在此領域主動進擊，不設限地拓展人際網絡與商業模式，享受天時帶來的超額紅利。
2. 【大限化權之方（${decSihua.quan}星所在）】：為這十年確立權威、扛起責任與專案主導的鐵腕戰場。此處宜大膽決策、敢打硬仗，建立個人的專業壁壘與組織領導地位。
3. 【大限化科之方（${decSihua.ke}星所在）】：為這十年求名求聲譽、學術考證與貴人相助的清泉所在。遇到阻滯時，向此宮位所指涉之領域尋求智慧指引，必能逢凶化吉。
4. 【大限化忌之方（${decSihua.ji}星所在 · 核心雷區）】：為這十年最大的考驗與暗礁所在！大耕老師指出：大限化忌代表這十年的命運緊箍咒。命主切忌在此領域心存僥倖、盲目借貸擴張或投機取巧。此處最宜「修心、專精技術、築牢防火牆」，將忌星的壓迫感轉化為十年磨一劍的深沉定力！

三、十年之人生戰略規劃與節奏掌控：
十年大限猶如一場長途拉鋸戰，大耕老師建議依「起、承、轉、合」四階段嚴格調控節奏：
- 【前三年（築基積累）】：審時度勢，盤點本命盤與大限盤交疊之優勢資源，切忌盲動，以調試系統與建立人脈護城河為重；
- 【中四年（破局發力）】：天時地利漸趨成熟，大膽聚焦於核心事業推進，借力使力，將化祿與化權之動能發揮至淋漓盡致；
- 【後三年（收官守成）】：運限交接之際氣數易生波動，切忌盲目擴大戰線，宜進行資產沉澱、人才梯隊傳承，並開始為下一個十年的宮位躍遷預作佈局。`;
}

// =========================================================================
// 5. 原局經典格局大觀與命格高度 (千字精解)
// =========================================================================
export function getNatalPatternDeepReading(
  soul: string,
  body: string,
  fiveElementsClass: string,
  laiYinIndex: number,
  allPalaces: PalaceData[]
): string {
  const laiYinPalace = allPalaces[laiYinIndex] || allPalaces[0];

  return `【原局格局深度總析：命身底層架構 · 來因宿命因果 · 五行局氣運全貌】

一、命主【${soul}】與身主【${body}】之靈魂雙重密碼：
紫微斗數體系中，「命主」代表先天秉賦、靈魂最初投胎之純粹本真與核心世界觀；而「身主」則主管後天肉身實踐、中晚年之行事作風與生命最終落地的歸宿。
命主為【${soul}】，賦予命主在精神追求上的獨特美學與不可妥協的精神底線。其思維模式往往受此曜之牽引，展現出獨具一格的感知力與天賦優勢。
身主為【${body}】，則深刻影響了命主三十五歲後面對世俗現實的具體手段與身體力行的重心。中晚年後，命主的行為習慣、物質追求乃至容貌體態，將愈發向身主星曜之特質靠攏。命身雙星之相生相剋，正是一個人「內心理想」與「現實作為」能否達成和解的終極密碼。

二、來因宮【${laiYinPalace.name} (${laiYinPalace.heavenlyStem}${laiYinPalace.earthlyBranch})】之因果發動機：
在欽天門紫微斗數絕學中，來因宮乃整張星盤「四化飛星之源頭」，被譽為「前世因果之寄託、今生修行之主戰場」。
命造出生年之天干，恰恰落入本命盤之【${laiYinPalace.name}】！此玄奧配置向命主揭示了一個不可逃避的宿命真相：
命主這輩子所享受的最高榮耀、面臨的最深牽絆，以及引動生年祿權科忌四化的根本動力，全數源自於【${laiYinPalace.name}】所指涉的人事物領域。
若來因在命宮，主一生自主自立、全憑自身打拼創業；若來因在官祿，則為事業天命狂熱者；若來因在夫妻，則一生愛恨糾葛與親密關係深度捆綁；若來因在財帛或田宅，則資產累積與家族傳承為今生必修之核心功課。此宮之得失成敗，直接牽動整張星盤之因果閉環。

三、五行局【${fiveElementsClass}】之時空起運與性情底色：
五行局是紫微斗數排定十二宮大限起運年齡（二局起運至六局起運）與星曜能量盛衰的底層基石：
當前命格隸屬【${fiveElementsClass}】：
- 水二局者：機智多變，如水之隨圓就方，長於以柔克剛，早年思維早熟，起運最早；
- 木三局者：仁德生發，如春木之向陽舒展，重視人情操守，一生具有極強之再生與成長韌性；
- 金四局者：剛毅肅穆，如秋金之斬釘截鐵，重情重義但易顯剛硬，擅長在規則與框架中取得突破；
- 土五局者：厚重包容，如厚土之載育萬物，性格沉穩內斂，大器晚成，具有極強之包容力與抗壓性；
- 火六局者：明快熱烈，如烈火之光華四射，直來直往富有開創激情，然需防熱度難以持久。
五行之局與命盤星曜相互交融，構成了命主獨特之生命能量波形。`;
}

// =========================================================================
// 6. 八字與斗數雙軌印證深度解析 (千字精解)
// =========================================================================
export function getBaziCrossDeepReading(bazi: BaziData, fiveElementsClass: string): string {
  const dm = bazi.dayMaster;
  const strength = bazi.dayMasterStrength;

  return `【子平八字與紫微斗數雙軌宏觀印證：日主天干 · 喜用調候 · 運限共振】

一、子平八字四柱日主【${dm}】之核心五行品格：
日主天干「${dm}」為整座八字大廈之核心，代表命主之神識精神與命理元神。
在四柱八字微觀評定中，日元判定為【${strength}】之格局，而紫微納音五行局為【${fiveElementsClass}】：
- 若日主偏旺：代表先天元神充足、自主意識極強、自信進取、抗壓耐勞，然亦需提防主觀頑固、剛愎自用與比劫奪財之弊端；其命局最喜「食傷吐秀以展才華、財星流通以顯富貴、官殺修剪以立威儀」；
- 若日主偏弱：代表心思細膩敏感、擅長察言觀色、適應力強且善於借力，然亦需提防意志不堅、容易疲勞與精神內耗之傾向；其命局最喜「印星生扶以長智慧底氣、比劫幫身以得同儕援助」。
日主【${dm}】與五行局【${fiveElementsClass}】之生剋關係，深刻反映了「先天八字根基」與「後天紫微星盤時空能量」的融合度，若兩者同氣相求或相生相旺，一生逢難必有貴人化解。

二、紫微星曜與八字喜用神之五行共振調候法：
華夏命理學博大精深，八字重「五行氣候與十神結構」，紫微重「星情化象與人事碰撞」，兩者實為同源異流。
當八字之喜用神在紫微斗數命宮或三方四正中顯化為相應五行之吉曜時，命主之天賦才能將能得到最大程度之爆發：
1. 【喜木者】：在紫微中對應天機星（陰木）之謀略機變與貪狼星（陽木）之蓬勃生機。得木氣滋養，命主宜多從事策劃、文化、綠色科技、新創孵化之賽道；
2. 【喜火者】：在紫微中對應太陽星（陽火）之博愛光明與廉貞星（陰火）之敏銳公關。得火氣升騰，宜投身傳媒傳播、自媒體、能源高科技與公眾演說領域；
3. 【喜土者】：在紫微中對應紫微星（己土）、天府星（戊土）、天梁星（戊土）之厚重尊榮。得土氣沉澱，最利不動產、實體產業、高階組織管理與信託資產；
4. 【喜金者】：在紫微中對應武曲星（陰金）之剛毅金融與七殺星（陽金）之開拓先鋒。得金氣收斂肅穆，最利金融投資、精密技術研發、重工硬體與法務決策；
5. 【喜水者】：在紫微中對應太陰星（陰水）之細膩蓄積、天同星（陽水）之福澤享樂、巨門星（陰水）之深研口才與破軍星（陰水）之顛覆創新。得水氣潤下，極利國際貿易、流動性商業、智慧諮詢與心靈藝術。

三、大運干支與斗數大限歲君之時空交涉法則：
八字之「十年一大運」與紫微斗數之「十年一大限」，在歲月長河中互為印證：
當八字大運干支行至用神旺鄉，而紫微大限宮位同時會合祿權吉星時，即為人生「十年一遇之巨浪騰飛期」，此時宜當機立斷、借力乘風破浪；
反之，當八字大運逢刑衝破害，而紫微大限歲君又遭羊陀空劫化忌夾攻時，即為人生「潛伏修煉之寒冬期」，此時應以防守、健康調養、深造進修為第一要務。
合參八字與紫微，方能窮究天人之際，通曉變通之道，真正達成「知天命而盡人事」之超然境界。`;
}

// 保持向下相容的靜態本體庫（若需要）
export const PALACE_DEEP_ESSENCE: Record<string, {
  philosophy: string;
  modernManifestation: string;
  shadowAndLight: string;
  actionGuidance: string;
}> = {
  '預設': {
    philosophy: '宮位乃命盤空間之投影。',
    modernManifestation: '世俗課題之反映。',
    shadowAndLight: '吉凶互參，陰陽並行。',
    actionGuidance: '順天應人，以心御星。'
  }
};
