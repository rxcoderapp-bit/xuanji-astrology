/**
 * 欽天門雙象平方與梁若瑜飛星特殊忌格計算引擎
 * 知識源泉：《欽天四化命理學》、《陳小飛欽天進階》、《梁若瑜飛星紫微斗數》
 * （遵循正統國學與心理動力學，嚴格去除個人導師姓名）
 */

import type { PalaceData, HoroscopeState } from '../types';

export interface DoubleMutagenPattern {
  id: string;
  type: 'double_natal' | 'ping_fang' | 'special_ji';
  name: string;
  category: 'auspicious' | 'challenging' | 'special';
  palaceIndex: number;
  palaceName: string;
  starsInvolved: string[];
  mutagensInvolved: string[];
  classicalQuote: string;
  energyDynamics: string;
  actionGuidance: string[];
}

// 四馬地（寅申巳亥）
export const FOUR_HORSE_BRANCHES = ['寅', '申', '巳', '亥'];
// 四庫地（辰戌丑未）
export const FOUR_VAULT_BRANCHES = ['辰', '戌', '丑', '未'];
// 四敗地（子午卯酉）
export const FOUR_PEACH_BRANCHES = ['子', '午', '卯', '酉'];

/**
 * 檢測命盤中所有欽天同宮雙象、平方象與飛星特殊忌格
 */
export function analyzeDoubleMutagensAndSpecialJi(
  palaces: PalaceData[],
  _horoscope?: HoroscopeState
): DoubleMutagenPattern[] {
  const results: DoubleMutagenPattern[] = [];

  // =========================================================================
  // 1. 欽天同宮生年雙象組合 (Double Natal Mutagens in Single Palace)
  // =========================================================================
  palaces.forEach((palace, idx) => {
    const mutagensInPalace: { mutagen: string; star: string }[] = [];
    [...palace.majorStars, ...palace.minorStars].forEach(s => {
      if (s.mutagen) {
        mutagensInPalace.push({ mutagen: s.mutagen, star: s.name });
      }
    });

    // 檢查是否有兩個（或以上）生年四化在同一宮
    if (mutagensInPalace.length >= 2) {
      const mutSet = new Set(mutagensInPalace.map(m => m.mutagen));
      const starNames = mutagensInPalace.map(m => `${m.star}(化${m.mutagen})`);

      // 1.1 祿權同宮 (富貴雙全、開疆拓土)
      if (mutSet.has('祿') && mutSet.has('權')) {
        results.push({
          id: `dm_lu_quan_${idx}`,
          type: 'double_natal',
          name: '祿權同宮格（開疆拓土·名利雙收）',
          category: 'auspicious',
          palaceIndex: idx,
          palaceName: palace.name,
          starsInvolved: starNames,
          mutagensInvolved: ['祿', '權'],
          classicalQuote: '祿權同宮，主巨富多權，才華橫溢，能自我開拓新局面。',
          energyDynamics: '「化祿」為機遇與願景，「化權」為實施力與霸氣。祿權交匯於此宮，代表命主在此領域既有敏銳的商機嗅覺，又有鐵腕般的執行與組織駕馭力，極具領袖風範。',
          actionGuidance: [
            '放手在該宮位主導的領域自主開創，建立個人或團隊之不可替代優勢',
            '注意祿遇權容易變得過於自負或霸道，宜輔以包容心廣結善緣',
            '善用政策與市場風口，將遠大夢想迅速轉化為具體落地之成果'
          ]
        });
      }

      // 1.2 祿科同宮 (儒雅清流、名利兼具)
      if (mutSet.has('祿') && mutSet.has('科')) {
        results.push({
          id: `dm_lu_ke_${idx}`,
          type: 'double_natal',
          name: '祿科同宮格（儒雅才華·名望兼美）',
          category: 'auspicious',
          palaceIndex: idx,
          palaceName: palace.name,
          starsInvolved: starNames,
          mutagensInvolved: ['祿', '科'],
          classicalQuote: '祿科齊會，名利雙收，儒商之風，清貴而得財。',
          energyDynamics: '「化祿」帶來豐沛的資源與人緣，「化科」賦予文雅的氣質與社會信譽。祿科同宮展現溫文爾雅的智慧，凡事以柔克剛，走知識變現、文化傳播或專業聲譽之路最易大獲成功。',
          actionGuidance: [
            '深耕知識產權、文化品牌、學術諮詢或高信譽專業賽道',
            '以誠信與口碑為第一立身之本，不參與粗糙的殺價競爭',
            '保持謙和文質的待人處世態度，自然引來貴人與資源相聚'
          ]
        });
      }

      // 1.3 祿忌同宮 (成中帶破·雙重代償)
      if (mutSet.has('祿') && mutSet.has('忌')) {
        results.push({
          id: `dm_lu_ji_${idx}`,
          type: 'double_natal',
          name: '祿忌同宮格（成中帶破·心理代償）',
          category: 'challenging',
          palaceIndex: idx,
          palaceName: palace.name,
          starsInvolved: starNames,
          mutagensInvolved: ['祿', '忌'],
          classicalQuote: '祿忌同宮，吉凶相半。祿隨忌走，得而復失，先成後敗。',
          energyDynamics: '化祿是熱情與渴望，化忌是執著與黑洞。二者交纏於一宮，形成了極端的「能量拉扯」：極其熱愛又極其焦慮，往往在即將大成之際突生變卦。若無良好心態，容易陷入得失心過重之內耗循環。',
          actionGuidance: [
            '在此宮位之事必須奉行「落袋為安、分段結算」，見好就收切忌孤注一擲',
            '建立法律防火牆與冷靜期機制，嚴禁因一時貪心將所有利潤全額覆盤回投',
            '學會接納不完美與遺憾，將得失視為磨練心性之日常修持'
          ]
        });
      }

      // 1.4 權科同宮 (金榜題名·專業權威)
      if (mutSet.has('權') && mutSet.has('科')) {
        results.push({
          id: `dm_quan_ke_${idx}`,
          type: 'double_natal',
          name: '權科同宮格（專業權威·名實相符）',
          category: 'auspicious',
          palaceIndex: idx,
          palaceName: palace.name,
          starsInvolved: starNames,
          mutagensInvolved: ['權', '科'],
          classicalQuote: '權科同宮，名實兼具，金榜題名，專業稱雄。',
          energyDynamics: '「化權」主權柄、技術硬實力；「化科」主人望、證照與公信力。二者同宮象徵命主在此領域是「靠真本事吃飯」的頂級專家，言出法隨，深得同儕與業界敬仰。',
          actionGuidance: [
            '積極考取國家級最高專業資格證照，或爭取行業標準制定話語權',
            '兼顧專業硬實力與大眾傳播力，建立兼具權威感與親和力的個人IP',
            '嚴謹治學，言行合一，打造歷久彌堅的長期主義專業基石'
          ]
        });
      }

      // 1.5 權忌同宮 (剛強頑固·操戈起伏)
      if (mutSet.has('權') && mutSet.has('忌')) {
        results.push({
          id: `dm_quan_ji_${idx}`,
          type: 'double_natal',
          name: '權忌同宮格（剛烈交鋒·大起大落）',
          category: 'challenging',
          palaceIndex: idx,
          palaceName: palace.name,
          starsInvolved: starNames,
          mutagensInvolved: ['權', '忌'],
          classicalQuote: '權忌相爭，如持刀相向。剛愎自用，易生爭端，勞碌波折。',
          energyDynamics: '化權之掌控慾遇上化忌之執著危機，形成「不服輸、硬碰硬」的頑烈張力。在此宮位命主容易背負沈重壓力，行事過於剛猛不妥協，常有劇烈起伏或重大博弈之經歷。',
          actionGuidance: [
            '戒除獨斷專行與死不認錯的傲慢，凡事留有三分退路',
            '將剛猛好鬥之精力轉化於攻克卡脖子難關或高強度體能運動中',
            '學會「以柔克剛、借力打力」，化被動防守為體制化防禦'
          ]
        });
      }

      // 1.6 科忌同宮 (藕斷絲連·思慮糾葛)
      if (mutSet.has('科') && mutSet.has('忌')) {
        results.push({
          id: `dm_ke_ji_${idx}`,
          type: 'double_natal',
          name: '科忌同宮格（思慮深沉·藕斷絲連）',
          category: 'challenging',
          palaceIndex: idx,
          palaceName: palace.name,
          starsInvolved: starNames,
          mutagensInvolved: ['科', '忌'],
          classicalQuote: '科忌同宮，多思多慮，文書糾葛，情絲纏繞難斷。',
          energyDynamics: '化科本為斯文理性，化忌則為牽絆糾結。二者同宮往往呈現出「理智上明白，情感上放不下」之糾葛心態，在合約、文書、人際界限上容易拖泥帶水、反覆波折。',
          actionGuidance: [
            '凡涉及合同協議、簽約與承諾，務必請客觀律師第三方白紙黑字審核',
            '對過去之遺憾或糾纏關係實施「果斷物理切割」，切勿幻想和平共處',
            '多親近哲學、心理學或靜坐冥想，以超然理性驅散腦中反芻思維'
          ]
        });
      }
    }
  });

  // =========================================================================
  // 2. 欽天門「平方象」（生年與宮干自化同象：自化法象生年）
  // =========================================================================
  palaces.forEach((palace, idx) => {
    // 檢查生年四化與宮干自化是否同象
    palace.selfMutagens.forEach(sm => {
      const matchNatal = palace.majorStars.find(ms => ms.name === sm.star && ms.mutagen === sm.mutagen);
      if (matchNatal) {
        const pingFangMap: Record<string, { name: string; quote: string; desc: string; advice: string[] }> = {
          '祿': {
            name: '祿自化祿（平方象·發散虛花）',
            quote: '生年祿又自化祿，同象平方，緣起緣滅，財來財去。',
            desc: '此宮本有生年祿之福厚，卻又宮干自化祿出氣。猶如開水龍頭灌水同時底部開孔洩漏，命主在此宮往往慷慨大方、不拘小節，但也容易隨性揮霍、難以沉澱為永續底產。',
            advice: ['建立強制儲蓄或定期投資不動產機制，不留過量閒置現金', '對外布施應量力而行，避免因好面子而過度承諾']
          },
          '權': {
            name: '權自化權（平方象·剛愎任性）',
            quote: '生年權又自化權，主觀極強，易起摩擦，過剛易折。',
            desc: '生年權賦予天生才幹，自化權則使自尊心膨脹至極限。在該宮位易聽不進建言，行事雷厲風行但缺乏轉圜餘地，常與合作方或親人發生無謂之權力抗衡。',
            advice: ['主動退居二線做戰略規劃，將前線指揮權交由互補夥伴', '遇重大分歧時強制冷靜24小時再行決策']
          },
          '科': {
            name: '科自化科（平方象·文雅自賞）',
            quote: '生年科又自化科，孤芳自賞，優柔寡斷，名過於實。',
            desc: '此宮具備良好文化天賦與體面名聲，但自化科往往使命主過於在乎羽毛與面子，遇關鍵抉擇瞻前顧後、患得患失，錯失雷霆行動之良機。',
            advice: ['重視實質產出大於表面名聲，以商業結果驗證專業價值', '鍛鍊果斷止損之勇氣，莫為維持體面而吞下暗虧']
          },
          '忌': {
            name: '忌自化忌（平方象·自消自滅）',
            quote: '生年忌又自化忌，雙忌平方，煩惱自尋，但亦主自消。',
            desc: '生年忌代表先天虧欠與執念，自化忌則是執念的釋放與消散。命主在此宮位常有強烈的精神自虐或過度擔憂，但幸好自化忌往往能自行消化，不至長期牽連他人。',
            advice: ['凡遇煩惱不必強求向外索求安慰，專注於呼吸與當下事務', '理解「所有困局皆由心造」，放下偏執即可立地解脫']
          }
        };

        const pfInfo = pingFangMap[sm.mutagen];
        if (pfInfo) {
          results.push({
            id: `pf_${sm.mutagen}_${idx}`,
            type: 'ping_fang',
            name: pfInfo.name,
            category: 'special',
            palaceIndex: idx,
            palaceName: palace.name,
            starsInvolved: [`${sm.star}(生年${sm.mutagen}✕自化${sm.mutagen})`],
            mutagensInvolved: [sm.mutagen],
            classicalQuote: pfInfo.quote,
            energyDynamics: pfInfo.desc,
            actionGuidance: pfInfo.advice
          });
        }
      }
    });
  });

  // =========================================================================
  // 3. 梁若瑜飛星派特殊忌格 (Special Flying Star Ji Patterns)
  // =========================================================================

  // 3.1 入庫忌：生年忌入辰戌丑未（四庫地）之田宅或財帛宮
  palaces.forEach((p, idx) => {
    const isVault = FOUR_VAULT_BRANCHES.includes(p.earthlyBranch);
    const isWealthOrProperty = p.name === '田宅宮' || p.name === '財帛宮';
    const hasNatalJi = p.majorStars.some(s => s.mutagen === '忌');

    if (isVault && isWealthOrProperty && hasNatalJi) {
      results.push({
        id: `sj_ruku_${idx}`,
        type: 'special_ji',
        name: '入庫忌格（巨庫守藏·萬物歸宗）',
        category: 'auspicious',
        palaceIndex: idx,
        palaceName: p.name,
        starsInvolved: p.majorStars.filter(s => s.mutagen === '忌').map(s => `${s.name}(化忌)`),
        mutagensInvolved: ['忌'],
        classicalQuote: '化忌入庫，萬物歸藏。入田宅或財帛於四墓之地，主巨富守聚，不動產萬貫。',
        energyDynamics: '辰戌丑未為天地之四金庫。化忌本為收藏、執著、緊鎖之能量，忌入金庫如同將金銀鎖入重型保險庫，只進不出！命主生性節儉聚財，善於購置實體不動產，晚年資產極其雄厚。',
        actionGuidance: [
          '奉行長期價值投資與穩健不動產配置，遠離高槓桿短線炒作',
          '妥善做好家族財富傳承架構，讓庫存資本持續產生複利效益',
          '在守財同時，適度參與公益慈善布施，通暢財氣經絡'
        ]
      });
    }
  });

  // 3.2 拆馬忌：生年忌坐於四馬地（寅申巳亥）
  palaces.forEach((p, idx) => {
    const isHorse = FOUR_HORSE_BRANCHES.includes(p.earthlyBranch);
    const hasNatalJi = p.majorStars.some(s => s.mutagen === '忌');

    if (isHorse && hasNatalJi) {
      results.push({
        id: `sj_chaima_${idx}`,
        type: 'special_ji',
        name: '拆馬忌格（天馬折足·奔波驛動）',
        category: 'challenging',
        palaceIndex: idx,
        palaceName: p.name,
        starsInvolved: p.majorStars.filter(s => s.mutagen === '忌').map(s => `${s.name}(化忌)`),
        mutagensInvolved: ['忌'],
        classicalQuote: '化忌坐四馬地，名為拆馬忌。天馬折足，出外奔波，身心勞碌，居無定所。',
        energyDynamics: '寅申巳亥乃天馬驛馬之鄉，象徵遠行、流動與拓展。化忌坐入四馬地，形成「欲動難動、動輒生困」之阻滯張力。在此宮位命主容易背井離鄉、頻繁差旅出差或承受勞頓奔波之苦。',
        actionGuidance: [
          '外出差旅、出國公幹或開車出行時，嚴格遵守交通規章，遠離危險水域',
          '主動選擇遠端工作、跨境貿易或跨國跨區業務，順應驛動氣場反而能轉危為機',
          '在住家玄關安放沉香或降真香淨化氣場，平復出門奔波之浮躁心神'
        ]
      });
    }
  });

  // 3.3 逆水忌：生年忌在遷移宮或四馬地，本命宮化忌入對宮無自化
  const mingGong = palaces.find(p => p.name === '命宮') || palaces[0];
  const qianYiGong = palaces.find(p => p.name === '遷移宮') || palaces[(mingGong.index + 6) % 12];
  const qianYiHasJi = qianYiGong.majorStars.some(s => s.mutagen === '忌');
  const qianYiHasSelfJi = qianYiGong.selfMutagens.some(sm => sm.mutagen === '忌');

  if (qianYiHasJi && !qianYiHasSelfJi) {
    results.push({
      id: `sj_nishui_qianyi`,
      type: 'special_ji',
      name: '逆水忌格（海納百川·巨流回衝）',
      category: 'auspicious',
      palaceIndex: qianYiGong.index,
      palaceName: '遷移宮照命宮',
      starsInvolved: qianYiGong.majorStars.filter(s => s.mutagen === '忌').map(s => `${s.name}(生年忌)`),
      mutagensInvolved: ['忌'],
      classicalQuote: '遷移坐生年忌且不自化，命宮無忌，名為逆水忌。如築壩攔江，波瀾壯闊，主在外橫發暴富。',
      energyDynamics: '逆水忌是飛星紫微中最震撼的大發格局！對宮（遷移）之生年忌如同一座無比堅固的高山水壩，命主向外付出之所有精力與善緣非但不洩漏，反而全數激盪回流，形成巨大的財富與聲勢洪流。',
      actionGuidance: [
        '大膽走向更大舞台或海外異鄉發展，外部阻力越強烈，反彈力道越驚人',
        '堅持長遠口碑與誠實經營，不為眼前微小利益折腰',
        '回流之財富務必轉移部分於實業資產與回饋社會，固鎖江河之氣'
      ]
    });
  }

  return results;
}
