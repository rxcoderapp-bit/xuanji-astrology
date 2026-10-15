import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  Coins, Briefcase, Heart, Activity, Scale,
  Layers, ArrowRight, BookOpen, Target
} from 'lucide-react';
import type { 
  PalaceData, 
  HoroscopeState, 
  BaziData, 
  DualTrackEnergyData, 
  TimingResonanceItem 
} from '../types';

interface TrinityMasterPanelProps {
  bazi: BaziData;
  allPalaces: PalaceData[];
  horoscope: HoroscopeState;
  activeEnergy: DualTrackEnergyData;
  activeResonance: TimingResonanceItem;
  onSelectPalace?: (index: number) => void;
}

export const TrinityMasterPanel: React.FC<TrinityMasterPanelProps> = ({
  bazi: _bazi,
  allPalaces,
  horoscope: _horoscope,
  activeEnergy,
  activeResonance,
  onSelectPalace
}) => {
  // Navigation tabs within Trinity Panel
  const [activeTrinityTab, setActiveTrinityTab] = useState<
    'framework' | 'sop' | 'arbitration' | 'scenarios' | 'diagnostic' | 'creed'
  >('diagnostic');

  // Scenario active tab
  const [activeScenario, setActiveScenario] = useState<'wealth' | 'career' | 'love' | 'health'>('wealth');

  // Selected arbitration card
  const [selectedArbitrationIndex, setSelectedArbitrationIndex] = useState<number>(0);

  // Helper to check mutagen on palace stars
  const hasPalaceMutagen = (p: PalaceData, mut: string) => {
    return [...p.majorStars, ...p.minorStars].some(s => s.mutagen === mut);
  };

  // ==================== 1. 當前命造專屬即時三才動態診斷計算 ====================
  const diagnosticResult = useMemo(() => {
    // 天時得分 (Heaven Index): 八字喜忌 + 紫微命宮吉星四化
    let heavenScore = 50;
    const dayMasterStrength = activeEnergy.dayMasterStrength || '中和';
    if (dayMasterStrength === '偏旺' || dayMasterStrength === '中和') {
      heavenScore += 15;
    } else if (dayMasterStrength === '極旺' || dayMasterStrength === '極弱') {
      heavenScore -= 10;
    }

    // 檢查紫微命宮、財帛宮、官祿宮四化
    const mingPalace = allPalaces.find(p => p.name === '命宮') || allPalaces[0];
    const caiPalace = allPalaces.find(p => p.name === '財帛宮') || allPalaces[4];
    const guanPalace = allPalaces.find(p => p.name === '官祿宮') || allPalaces[8];

    const hasLu = [mingPalace, caiPalace, guanPalace].some(p => hasPalaceMutagen(p, '祿'));
    const hasQuan = [mingPalace, caiPalace, guanPalace].some(p => hasPalaceMutagen(p, '權'));
    const hasKe = [mingPalace, caiPalace, guanPalace].some(p => hasPalaceMutagen(p, '科'));
    const hasJi = [mingPalace, caiPalace, guanPalace].some(p => hasPalaceMutagen(p, '忌'));

    if (hasLu) heavenScore += 15;
    if (hasQuan) heavenScore += 10;
    if (hasKe) heavenScore += 8;
    if (hasJi) heavenScore -= 20;

    heavenScore = Math.min(98, Math.max(25, heavenScore));

    // 地利得分 (Earth Index): 田宅宮吉凶 + 居所氣場聚氣度
    let earthScore = 60;
    const tianZhaiPalace = allPalaces.find(p => p.name === '田宅宮') || allPalaces[9];
    if (hasPalaceMutagen(tianZhaiPalace, '祿')) earthScore += 20;
    if (hasPalaceMutagen(tianZhaiPalace, '權')) earthScore += 15;
    if (hasPalaceMutagen(tianZhaiPalace, '科')) earthScore += 10;
    if (hasPalaceMutagen(tianZhaiPalace, '忌')) earthScore -= 25;
    
    // 田宅吉凶星
    const tianZhaiAuspicious = tianZhaiPalace.minorStars?.filter(s => ['文昌', '文曲', '左輔', '右弼', '天魁', '天鉞', '祿存'].includes(s.name)).length || 0;
    const tianZhaiInauspicious = tianZhaiPalace.minorStars?.filter(s => ['擎羊', '陀羅', '火星', '鈴星', '地空', '地劫'].includes(s.name)).length || 0;
    earthScore += tianZhaiAuspicious * 5 - tianZhaiInauspicious * 8;
    earthScore = Math.min(95, Math.max(30, earthScore));

    // 人謀得分 (Human Index): 當前流年歲運引動 + 理性策略停損係數
    let humanScore = 55 + (activeResonance.score > 0 ? Math.min(30, activeResonance.score) : Math.max(-25, activeResonance.score));
    humanScore = Math.min(96, Math.max(28, humanScore));

    // 判斷天吉/天凶、地吉/地凶、人吉/人凶
    const isHeavenGood = heavenScore >= 60;
    const isEarthGood = earthScore >= 60;
    const isHumanGood = humanScore >= 60;

    // 匹配大師仲裁情境
    let matchedScenarioIndex = 0;
    let verdictTitle = '';
    let verdictAction = '';
    let verdictDetail = '';

    if (!isHeavenGood && !isHumanGood && isEarthGood) {
      // 天凶 ✕ 卦凶 ✕ 地吉
      matchedScenarioIndex = 0;
      verdictTitle = '【天凶 ✕ 卦凶 ✕ 地吉】絕對防守 · 嚴禁強攻 · 借地利休養生息';
      verdictAction = '全面收攏防線，切勿開展新投資或衝動離職，固守現有宅邸與根基。';
      verdictDetail = '天命正處蓄力蟄伏期，當下機先多陷阱是非；所幸居所氣場尚能護佑。地利為保命盾牌，不可作為冒進的武器。宜在家讀書修身，守成待時。';
    } else if (!isHeavenGood && isHumanGood && isEarthGood) {
      // 天凶 ✕ 卦吉 ✕ 地吉
      matchedScenarioIndex = 1;
      verdictTitle = '【天凶 ✕ 卦吉 ✕ 地吉】見好就收 · 快進快出 · 嚴設停損線';
      verdictAction = '只可參與確定性高、週期極短的局部良機；賺取薄利即刻離場，嚴禁長線重倉。';
      verdictDetail = '大運大局雖在逆勢，但眼前有一波短暫反彈行情。借地利安泰之氣速戰速決，一旦嗅到風吹草動立刻退場，防止天命大局的週期性反噬。';
    } else if (isHeavenGood && !isHumanGood && !isEarthGood) {
      // 天吉 ✕ 卦凶 ✕ 地凶
      matchedScenarioIndex = 2;
      verdictTitle = '【天吉 ✕ 卦凶 ✕ 地凶】速除環境病灶 · 暫避一時鋒芒 · 整頓後方';
      verdictAction = '立即排查居家門窗形煞與合同條款漏洞，暫緩簽約推動，先安後方再出擊。';
      verdictDetail = '命中雖有宏大潛能與大運天助，但當下身邊小人是非暗湧，居家氣場又遭形煞衝射耗損。必須先清理後院火源、修復風水與法務漏洞，方能全力發揮天命優勢。';
    } else if (isHeavenGood && isHumanGood && isEarthGood) {
      // 天吉 ✕ 卦吉 ✕ 地吉
      matchedScenarioIndex = 3;
      verdictTitle = '【天吉 ✕ 卦吉 ✕ 地吉】天人合一 · 順天乘風 · 全力開展大格局';
      verdictAction = '大膽擴充事業版圖，把握當前貴人與項目，乘勝追擊，直取高位。';
      verdictDetail = '天時大運生旺、當下機先吉星拱照、居處地氣充沛聚財。三才合一，千載難逢。當秉持正心誠意，勇於承擔重任，開創一生之輝煌基業！';
    } else {
      // 複合均衡情境
      matchedScenarioIndex = isHeavenGood ? 2 : 1;
      verdictTitle = isHeavenGood 
        ? '【天吉地順 · 謹防人疏】穩紮穩打 · 強化細節合約防禦' 
        : '【逆風揚帆 · 步步為營】以靜制動 · 依托居所穩定心性';
      verdictAction = '維持中庸之道，依循五行喜忌調整作息與居家生氣，切勿極端投機。';
      verdictDetail = '當前三才處於動態調衡狀態，天時或地利各有所長。應優先按照日主喜用神調補氣場，遇重大決策再起卦辨清機先。';
    }

    return {
      heavenScore,
      earthScore,
      humanScore,
      isHeavenGood,
      isEarthGood,
      isHumanGood,
      matchedScenarioIndex,
      verdictTitle,
      verdictAction,
      verdictDetail,
      mingPalace,
      caiPalace,
      tianZhaiPalace
    };
  }, [allPalaces, activeEnergy, activeResonance]);

  return (
    <div className="space-y-5 animate-fade-in text-xs sm:text-sm">
      
      {/* 1. Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border bg-gradient-to-br from-[#faf6ee] via-[#f5ede0] to-[#f0e3ce] dark:from-[#1c1d29] dark:via-[#171822] dark:to-[#12131b] border-[#ded3be] dark:border-[#2f3246] space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#8d271c] text-white shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-[#2b2723] dark:text-[#f4f1eb] tracking-wide">
                  天地人三才宗師預測心法手冊
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8d271c]/10 text-[#8d271c] dark:text-[#ef5350] border border-[#8d271c]/20">
                  三位一體合參
                </span>
              </div>
              <p className="text-[11px] text-[#6d6152] dark:text-[#a59e91] mt-0.5">
                原典依據：《易經·繫辭》·《滴天髓》·《太微賦》·《陽宅十書》· 正統古典三才易學宗師傳承
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-1 rounded-lg font-mono font-bold bg-white/80 dark:bg-[#202230] border border-[#d8cdb8] dark:border-[#34384d] text-[#8d271c] dark:text-[#ef5350]">
              定命 ✕ 斷事 ✕ 改運
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/70 dark:bg-[#181924] border border-[#e5dccb] dark:border-[#2b2d3d] text-xs text-[#524a41] dark:text-[#b4aea3] leading-relaxed">
          <p>
            <b>【大師序引】</b>：夫天地不言，四時行焉。單一術數猶如管中窺豹——單看八字易陷於宿命消極；單看六爻易迷於眼前枝節；單看風水易誤於改運神話。唯有<b>「八字紫微知天命之常與變、易經六爻探時空之微與機、陽宅形巒固身心之場與氣」</b>，三位一體立體合參，方能真正參透吉凶成敗之玄機，達致「知命而不認命，盡人事而順天意」之最高境界。
          </p>
        </div>

        {/* Navigation Tabs within Trinity Panel (Spacious 2x3 Grid on sm, 3x2 on mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 pt-1 text-xs font-bold">
          {[
            { id: 'diagnostic', icon: '🧭', label: '當前三才診斷', desc: '即時動態評估' },
            { id: 'sop', icon: '🔄', label: '五步閉環 SOP', desc: '實戰推演流程' },
            { id: 'arbitration', icon: '⚖️', label: '吉凶仲裁矩陣', desc: '衝突大師裁決' },
            { id: 'scenarios', icon: '🎯', label: '四大實戰主題', desc: '財職情病指南' },
            { id: 'framework', icon: '🌌', label: '三才立體架構', desc: '時間空間機先' },
            { id: 'creed', icon: '📜', label: '宗師修行箴言', desc: '學易六大戒律' },
          ].map(tab => {
            const isActive = activeTrinityTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTrinityTab(tab.id as any)}
                className={`py-2.5 px-3 rounded-xl border text-center transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs
                  ${isActive
                    ? 'bg-[#8d271c] text-white border-[#701e15] font-black shadow-sm ring-1 ring-black/10'
                    : 'bg-white/90 dark:bg-[#1c1d27] border-[#dcd3bf] dark:border-[#2b2d3c] text-[#554e44] dark:text-[#b4aea4] hover:bg-white dark:hover:bg-[#252734]'}`}
              >
                <span className="text-sm shrink-0">{tab.icon}</span>
                <span className="font-bold tracking-wide whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================== 1. 當前命造專屬即時三才動態診斷器 ==================== */}
      {activeTrinityTab === 'diagnostic' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl border bg-white dark:bg-[#1a1b24] border-[#ded4bf] dark:border-[#2c2f42] space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b pb-3 border-[#eee4d2] dark:border-[#262838]">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#8d271c] dark:text-[#ef5350]" />
                <h4 className="font-bold text-sm text-[#2b2723] dark:text-[#f4f1eb]">
                  當前命造 · 天地人三才即時動態診斷表
                </h4>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[#8d271c]/10 text-[#8d271c] dark:text-[#ef5350]">
                即時演算法全息連動
              </span>
            </div>

            {/* 三才指數進度卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 天時指數 */}
              <div className="p-3.5 rounded-xl bg-[#faf7f0] dark:bg-[#1f202c] border border-[#e8dfcf] dark:border-[#2f3246] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#8d271c] dark:text-[#ef5350] flex items-center gap-1.5 text-xs sm:text-sm">
                    <span>① 天時氣運指數 (Heaven)</span>
                  </span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                    diagnosticResult.isHeavenGood
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                  }`}>
                    {diagnosticResult.heavenScore} 分 · {diagnosticResult.isHeavenGood ? '生旺大吉' : '蓄力蟄伏'}
                  </span>
                </div>
                <div className="w-full bg-[#e8ded0] dark:bg-[#2b2d3d] h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-[#8d271c] rounded-full transition-all duration-500" 
                    style={{ width: `${diagnosticResult.heavenScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#635a4f] dark:text-[#a8a194] leading-relaxed">
                  <b>診斷指針</b>：日主【{activeEnergy.dayMaster}】({activeEnergy.dayMasterStrength})，命宮【{diagnosticResult.mingPalace.name}】吉曜四化引動。天命格局決定當前宏觀生命週期的進退順逆。
                </p>
              </div>

              {/* 地利指數 */}
              <div className="p-3.5 rounded-xl bg-[#faf7f0] dark:bg-[#1f202c] border border-[#e8dfcf] dark:border-[#2f3246] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#15803d] dark:text-[#4ade80] flex items-center gap-1.5 text-xs sm:text-sm">
                    <span>② 地利場域指數 (Earth)</span>
                  </span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                    diagnosticResult.isEarthGood
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                  }`}>
                    {diagnosticResult.earthScore} 分 · {diagnosticResult.isEarthGood ? '安泰聚氣' : '氣場受擾'}
                  </span>
                </div>
                <div className="w-full bg-[#e8ded0] dark:bg-[#2b2d3d] h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-[#15803d] rounded-full transition-all duration-500" 
                    style={{ width: `${diagnosticResult.earthScore}%` }}
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-[#635a4f] dark:text-[#a8a194] leading-relaxed">
                    <b>診斷指針</b>：田宅宮【{diagnosticResult.tianZhaiPalace.heavenlyStem}{diagnosticResult.tianZhaiPalace.earthlyBranch}】，居處為人體氣場蓄水池。
                  </p>
                  {onSelectPalace && (
                    <button
                      onClick={() => onSelectPalace(diagnosticResult.tianZhaiPalace.index)}
                      className="text-[10px] text-[#15803d] dark:text-[#4ade80] underline font-bold cursor-pointer shrink-0 ml-1"
                    >
                      跳轉田宅宮
                    </button>
                  )}
                </div>
              </div>

              {/* 人謀指數 */}
              <div className="p-3.5 rounded-xl bg-[#faf7f0] dark:bg-[#1f202c] border border-[#e8dfcf] dark:border-[#2f3246] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0284c7] dark:text-[#38bdf8] flex items-center gap-1.5 text-xs sm:text-sm">
                    <span>③ 人謀機先指數 (Human)</span>
                  </span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                    diagnosticResult.isHumanGood
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                  }`}>
                    {diagnosticResult.humanScore} 分 · {diagnosticResult.isHumanGood ? '機先在握' : '宜設停損'}
                  </span>
                </div>
                <div className="w-full bg-[#e8ded0] dark:bg-[#2b2d3d] h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-500 to-[#0284c7] rounded-full transition-all duration-500" 
                    style={{ width: `${diagnosticResult.humanScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#635a4f] dark:text-[#a8a194] leading-relaxed">
                  <b>診斷指針</b>：歲運共振【{activeResonance.grade}】({activeResonance.score}分)。六爻機先與當下微觀決策之防守度，決定具體事務執行之成敗安危。
                </p>
              </div>
            </div>

            {/* 大師裁決令卡片 */}
            <div className="p-4 rounded-xl border bg-gradient-to-br from-[#fcf7ea] to-[#f4ebe1] dark:from-[#211e28] dark:to-[#171822] border-[#e2d5c0] dark:border-[#383a4f] space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#8d271c] dark:text-[#ef5350]" />
                  <span className="font-bold text-xs sm:text-sm text-[#8d271c] dark:text-[#ef5350]">
                    【宗師三才合參動態仲裁令】
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-[#8d271c] text-white">
                  自動對應仲裁法則
                </span>
              </div>

              <div className="font-bold text-sm sm:text-base text-[#2b2723] dark:text-[#f4f1eb]">
                {diagnosticResult.verdictTitle}
              </div>

              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-[#1a1b24] border border-[#e5dcce] dark:border-[#2d3042] text-xs text-[#473f36] dark:text-[#ccc6bc] space-y-1">
                <div>
                  <b className="text-[#8d271c] dark:text-[#ef5350]">✦ 具體行動戰略：</b>
                  <span>{diagnosticResult.verdictAction}</span>
                </div>
                <div>
                  <b className="text-[#15803d] dark:text-[#4ade80]">✦ 深度底層機理：</b>
                  <span>{diagnosticResult.verdictDetail}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#786c5e] dark:text-[#9e978c]">
                  想查看此情境在大師仲裁矩陣中的完整判決依據？
                </span>
                <button
                  onClick={() => {
                    setSelectedArbitrationIndex(diagnosticResult.matchedScenarioIndex);
                    setActiveTrinityTab('arbitration');
                  }}
                  className="px-2.5 py-1 rounded text-xs font-bold text-[#8d271c] dark:text-[#ef5350] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>查閱仲裁矩陣詳解</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 2. 實戰推演 SOP 五步閉環流程 ==================== */}
      {activeTrinityTab === 'sop' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl border bg-white dark:bg-[#1a1b24] border-[#ded4bf] dark:border-[#2c2f42] space-y-4 shadow-xs">
            <div className="border-b pb-3 border-[#eee4d2] dark:border-[#262838]">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#8d271c] dark:text-[#ef5350]" />
                <h4 className="font-bold text-sm sm:text-base text-[#2b2723] dark:text-[#f4f1eb]">
                  天地人三才實戰推演 · 大師五步閉環 SOP 流程
                </h4>
              </div>
              <p className="text-[11px] text-[#706456] dark:text-[#a09a8f] mt-1">
                宗師親授之標準作業程序：從宏觀八字定局、星盤鎖定病灶、六爻易卦探路，到陽宅形煞排查與本草理性攻防，環環相扣無懈可擊。
              </p>
            </div>

            <div className="space-y-3.5">
              {/* Step 1 */}
              <div className="p-3.5 rounded-xl bg-[#faf7f0] dark:bg-[#1f202c] border border-[#e8dfcf] dark:border-[#2f3246] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#8d271c] text-white font-bold flex items-center justify-center text-xs">
                      1
                    </span>
                    <span className="font-bold text-sm text-[#8d271c] dark:text-[#ef5350]">
                      【第一步：天命定大局】八字排盤審視五行衰旺與十年大運
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-white dark:bg-[#282a3a] border border-[#ded5c5] dark:border-[#383b4e] text-[#6d6152] dark:text-[#a0a8be]">
                    時間之命 · 定盤星
                  </span>
                </div>
                <div className="text-xs text-[#524a41] dark:text-[#b4aea3] space-y-1 pl-8">
                  <p>
                    • <b>識別日主與喜忌用神</b>：分析日主之得令、得地、得氣，判斷格局（身旺、身弱、從格），明辨喜用五行（木火土金水）。
                  </p>
                  <p>
                    • <b>排查大運流年破耗指標</b>：
                    <span className="text-[#8d271c] dark:text-[#ef5350] font-semibold">比劫重重奪財</span>（主合夥受騙、親友拖累破財）；
                    <span className="text-[#8d271c] dark:text-[#ef5350] font-semibold">財星入墓庫或空亡</span>（主資金鏈斷裂、有進無出）；
                    <span className="text-[#8d271c] dark:text-[#ef5350] font-semibold">用神受克刑沖害</span>（主身體抱恙、決策失控）。
                  </p>
                  <p>
                    • <b>大師心法</b>：八字為「象」，觀其宏觀大勢。若正處財運低谷，猶如船行逆流，當下戰略必為「謹慎防守，絕不放大槓桿」。
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-xl bg-[#faf7f0] dark:bg-[#1f202c] border border-[#e8dfcf] dark:border-[#2f3246] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#b45309] text-white font-bold flex items-center justify-center text-xs">
                      2
                    </span>
                    <span className="font-bold text-sm text-[#b45309] dark:text-[#f59e0b]">
                      【第二步：星盤鎖病灶】紫微斗數欽天自化與六大要宮穿透
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-white dark:bg-[#282a3a] border border-[#ded5c5] dark:border-[#383b4e] text-[#6d6152] dark:text-[#a0a8be]">
                    空間因果 · 鎖病源
                  </span>
                </div>
                <div className="text-xs text-[#524a41] dark:text-[#b4aea3] space-y-1 pl-8">
                  <p>
                    • <b>鎖定生年四化與自化忌</b>：審查化忌與自化忌落在何宮。若在財帛宮自化忌沖福德，主投資失智肉包子打狗；若官祿宮化忌入遷移，主跳槽失利背負官非；若僕役宮化忌入命宮，主摯友背信棄義。
                  </p>
                  <p>
                    • <b>追蹤來因宮因果源頭</b>：尋找人生病灶的根本起因（父母、田宅、福德），明白「為何會陷入當前泥淖」，避免盲目怪罪外緣。
                  </p>
                  <p>
                    • <b>大師心法</b>：紫微如現代精密斷層掃描儀，精準標記問題具體發生在哪個人事宮位，為後續決策提供定點打擊目標。
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-xl bg-[#faf7f0] dark:bg-[#1f202c] border border-[#e8dfcf] dark:border-[#2f3246] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0284c7] text-white font-bold flex items-center justify-center text-xs">
                      3
                    </span>
                    <span className="font-bold text-sm text-[#0284c7] dark:text-[#38bdf8]">
                      【第三步：易卦斷機先】文王六爻隨事而占捕捉當下成敗
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-white dark:bg-[#282a3a] border border-[#ded5c5] dark:border-[#383b4e] text-[#6d6152] dark:text-[#a0a8be]">
                    時空之機 · 指南針
                  </span>
                </div>
                <div className="text-xs text-[#524a41] dark:text-[#b4aea3] space-y-1 pl-8">
                  <p>
                    • <b>精準設定用神</b>：測投資求財取「妻財爻」；測事業升遷取「官鬼爻」；測合約買房取「父母爻」；測疾病平安取「子孫爻」。
                  </p>
                  <p>
                    • <b>辨析月建日辰動靜生剋</b>：
                    <span className="font-semibold text-rose-700 dark:text-rose-400">官鬼旺動化進神</span>（如卯化寅進神，主憂患加劇、官司纏身）；
                    <span className="font-semibold text-amber-700 dark:text-amber-400">財爻伏藏於兄弟爻下</span>（財被暗中吞食瓜分，帳面虛幻有去無回）；
                    <span className="font-semibold text-purple-700 dark:text-purple-400">本卦《火澤睽》變《火雷噬嗑》</span>（卦象明示意見乖離、口舌是非、刑罰相見）。
                  </p>
                  <p>
                    • <b>大師心法</b>：六爻為「機」，微觀探查當下具體事態的虛實真偽。當八字提示風險，六爻便是照妖鏡，明察眼前誘惑是金礦還是深淵。
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-3.5 rounded-xl bg-[#faf7f0] dark:bg-[#1f202c] border border-[#e8dfcf] dark:border-[#2f3246] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#15803d] text-white font-bold flex items-center justify-center text-xs">
                      4
                    </span>
                    <span className="font-bold text-sm text-[#15803d] dark:text-[#4ade80]">
                      【第四步：陽宅查形煞】勘察居所外局巒頭形煞與內局氣口
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-white dark:bg-[#282a3a] border border-[#ded5c5] dark:border-[#383b4e] text-[#6d6152] dark:text-[#a0a8be]">
                    空間之氣 · 避風港
                  </span>
                </div>
                <div className="text-xs text-[#524a41] dark:text-[#b4aea3] space-y-1 pl-8">
                  <p>
                    • <b>外局形煞排查</b>：門窗前方是否有壁刀煞、天斬煞、路沖、尖角衝射或高壓電塔煞？此類形煞會引發居住者神經焦躁、誤判形勢。
                  </p>
                  <p>
                    • <b>內局理氣佈局</b>：找出陽宅正財位（宜靜不宜動、忌有廁所水池污染）；檢視臥室床頭（忌靠窗背空、忌橫樑壓頂）；檢視廚房（司命之灶，忌水火相沖破財）。
                  </p>
                  <p>
                    • <b>大師心法</b>：風水為「場」，人是環境的產物。八字是先天體質，六爻是突發症狀，風水則是居處之藥物與營養，能穩固磁場、增強抗壓底蘊。
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-3.5 rounded-xl bg-[#faf7f0] dark:bg-[#1f202c] border border-[#e8dfcf] dark:border-[#2f3246] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#7c3aed] text-white font-bold flex items-center justify-center text-xs">
                      5
                    </span>
                    <span className="font-bold text-sm text-[#7c3aed] dark:text-[#a78bfa]">
                      【第五步：三才調和止損】草本氣場安鎮 ✕ 理性攻防停損SOP
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-white dark:bg-[#282a3a] border border-[#ded5c5] dark:border-[#383b4e] text-[#6d6152] dark:text-[#a0a8be]">
                    知行合一 · 盡人事
                  </span>
                </div>
                <div className="text-xs text-[#524a41] dark:text-[#b4aea3] space-y-1 pl-8">
                  <p>
                    • <b>空間本草安鎮</b>：針對受沖方位，配置中藥草本香囊（石菖蒲/艾草/雄黃辟穢化煞，降真香/檀香固氣養神），以天然五行之氣中和負能量。
                  </p>
                  <p>
                    • <b>人事硬性止損</b>：若八字比劫奪財且六爻官鬼旺動，大師指令：<b>立即中止合作，絕不抱僥倖心理</b>；若已投入資金，啟動法律止損協議，保住核心資產。
                  </p>
                  <p>
                    • <b>大師心法</b>：五步閉環合一，化被動受制為主動掌舵，達成真正意義上的「趨吉避凶」。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 3. 三才衝突大師仲裁法則矩陣 ==================== */}
      {activeTrinityTab === 'arbitration' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl border bg-white dark:bg-[#1a1b24] border-[#ded4bf] dark:border-[#2c2f42] space-y-4 shadow-xs">
            <div className="border-b pb-3 border-[#eee4d2] dark:border-[#262838]">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#8d271c] dark:text-[#ef5350]" />
                <h4 className="font-bold text-sm sm:text-base text-[#2b2723] dark:text-[#f4f1eb]">
                  三才衝突大師仲裁法則矩陣 (The Master Arbitration Matrix)
                </h4>
              </div>
              <p className="text-[11px] text-[#706456] dark:text-[#a09a8f] mt-1">
                當八字大運、六爻機先、陽宅風水出現吉凶不一致時，大師如何權衡裁決？四大經典衝突情境法規全鑑。
              </p>
            </div>

            {/* 4 Arbitration Scenarios Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {[
                {
                  id: 0,
                  tag: '情境一',
                  badge: '天凶 ✕ 卦凶 ✕ 地吉',
                  title: '【絕對防守】嚴禁強攻 · 借地利休養生息',
                  heavenState: '八字行大運破耗、比劫奪財低谷 (凶)',
                  hexagramState: '六爻用神伏藏、官鬼動化進神 (凶)',
                  earthState: '陽宅格局方正、財位聚氣無煞 (吉)',
                  masterVerdict: '【大師仲裁】：地利只能護身保命（宛如避風港），但無法抗逆天命風暴與人事陷阱。風水再好，此時貿然投資亦必受官非陷害。宜守成蟄伏，借風水休養生息，等待運轉。',
                  sopRule: '處方：徹底拒絕任何新項目投資；居家多在生氣財位打坐讀書；堅決不借錢與人合夥。',
                  themeColor: 'border-rose-300 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300'
                },
                {
                  id: 1,
                  tag: '情境二',
                  badge: '天凶 ✕ 卦吉 ✕ 地吉',
                  title: '【見好就收】快進快出 · 嚴設停損紅線',
                  heavenState: '八字歲運處於低潮逆勢、財星入墓 (凶)',
                  hexagramState: '六爻得生旺財爻上卦、動化回頭生 (吉)',
                  earthState: '居所氣場安泰、避煞良好 (吉)',
                  masterVerdict: '【大師仲裁】：此乃逆境中的「微觀反彈波（死貓跳或特定短線機會）」。六爻指示短線可行，可賺取薄利或解決燃眉之急；但切忌追高、切忌放大槓桿或轉為長期持股，一旦見好必須立刻退場，防備大運宿命反撲。',
                  sopRule: '處方：單筆利潤達到預期立刻落袋為安；設置硬性15%停損點；嚴禁動用養老教育核心本金。',
                  themeColor: 'border-amber-300 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300'
                },
                {
                  id: 2,
                  tag: '情境三',
                  badge: '天吉 ✕ 卦凶 ✕ 地凶',
                  title: '【速除病灶】暫避一時鋒芒 · 整頓後方防線',
                  heavenState: '八字行財官大運、用神生旺有氣 (吉)',
                  hexagramState: '六爻兄弟官鬼交重、是非口舌纏身 (凶)',
                  earthState: '居所外局犯壁刀路沖、財位漏水破財 (凶)',
                  masterVerdict: '【大師仲裁】：命局潛力巨大，但眼前「時不我與且後方失火」。六爻之凶提示當下合作方或合約有瑕疵，地凶導致氣場耗散。應先化解居所煞氣、審查合約細節，避開本月本季之凶期，再行全力出擊。',
                  sopRule: '處方：立即整修漏水受沖煞位；重啟合同法律審核；暫停本季重大簽約，待次月吉神臨宮。',
                  themeColor: 'border-sky-300 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/20 text-sky-800 dark:text-sky-300'
                },
                {
                  id: 3,
                  tag: '情境四',
                  badge: '天吉 ✕ 卦吉 ✕ 地吉',
                  title: '【順天乘風】天人合一 · 全力開展大格局',
                  heavenState: '八字喜用齊聚、三方四正吉星拱照 (吉)',
                  hexagramState: '六爻用神旺相持世、化進化生百事遂 (吉)',
                  earthState: '陽宅藏風聚氣、八方生旺得令 (吉)',
                  masterVerdict: '【大師仲裁】：三才共振，天命賜福，人事順遂，環境護佑。此時當順應天命全力開展大格局，擴大事業規模，廣納賢才，乘勝追擊，直達頂峰！',
                  sopRule: '處方：大膽佈局戰略新版圖；保持正心誠意廣行善事以厚德載物；避免驕奢自滿即可大成。',
                  themeColor: 'border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                }
              ].map(item => (
                <div 
                  key={item.id} 
                  className={`p-4 rounded-xl border space-y-2.5 transition shadow-xs ${
                    selectedArbitrationIndex === item.id ? 'ring-2 ring-[#8d271c]' : ''
                  } ${item.themeColor}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/10 dark:bg-white/10">
                      {item.tag} · {item.badge}
                    </span>
                    <span className="text-xs font-black">
                      {item.title}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs opacity-90">
                    <div className="flex items-start gap-1">
                      <span className="font-bold">✦ 天命八字：</span>
                      <span>{item.heavenState}</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="font-bold">✦ 當下易卦：</span>
                      <span>{item.hexagramState}</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="font-bold">✦ 陽宅環境：</span>
                      <span>{item.earthState}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white/90 dark:bg-[#1a1b24] border border-black/10 dark:border-white/10 text-xs text-[#333] dark:text-[#ddd] space-y-1.5 leading-relaxed">
                    <p className="font-semibold">{item.masterVerdict}</p>
                    <p className="text-[11px] font-mono opacity-80 pt-1 border-t border-black/5 dark:border-white/5">
                      {item.sopRule}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== 4. 四大現代實戰主題推演指南 ==================== */}
      {activeTrinityTab === 'scenarios' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl border bg-white dark:bg-[#1a1b24] border-[#ded4bf] dark:border-[#2c2f42] space-y-4 shadow-xs">
            <div className="border-b pb-3 border-[#eee4d2] dark:border-[#262838]">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#8d271c] dark:text-[#ef5350]" />
                <h4 className="font-bold text-sm sm:text-base text-[#2b2723] dark:text-[#f4f1eb]">
                  四大現代人生戰場 · 三才合參實戰手冊全解
                </h4>
              </div>
              <p className="text-[11px] text-[#706456] dark:text-[#a09a8f] mt-1">
                針對當代人最關切的四大核心議題，提供明確、可操作的「八字病灶 + 六爻斷機 + 風水方藥 + 行動SOP」四聯診治全案。
              </p>
            </div>

            {/* Scenario Navigation Tabs (2 columns on mobile/tablet, 4 columns on desktop) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5">
              {[
                { id: 'wealth', label: '💰 財富投資 ✕ 債務危機' },
                { id: 'career', label: '💼 職場晉升 ✕ 合約糾紛' },
                { id: 'love', label: '💖 親密關係 ✕ 婚戀危機' },
                { id: 'health', label: '🌿 身心體質 ✕ 頑疾調養' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveScenario(s.id as any)}
                  className={`py-2.5 px-2.5 sm:px-3 rounded-xl border text-xs font-bold transition text-center cursor-pointer shadow-xs ${
                    activeScenario === s.id
                      ? 'bg-[#8d271c] text-white border-[#701e15] shadow-sm font-black'
                      : 'bg-[#faf7f0] dark:bg-[#1f202c] border-[#e5dccb] dark:border-[#2f3246] text-[#635a4f] dark:text-[#b0a99c] hover:bg-white dark:hover:bg-[#252838]'
                  }`}
                >
                  <span className="whitespace-nowrap">{s.label}</span>
                </button>
              ))}
            </div>

            {/* Scenario Details */}
            {activeScenario === 'wealth' && (
              <div className="p-4 rounded-xl bg-[#faf7f0] dark:bg-[#1f202c] border border-[#e8dfcf] dark:border-[#2f3246] space-y-3">
                <div className="flex items-center justify-between border-b pb-2 border-[#eee6d7] dark:border-[#2c2f42]">
                  <h5 className="font-bold text-sm text-[#8d271c] dark:text-[#ef5350] flex items-center gap-1.5">
                    <Coins className="w-4 h-4" />
                    【主題一：財富投資與債務危機】三才立體診治手冊
                  </h5>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold">
                    防破耗守富典範
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white dark:bg-[#171822] border border-[#e5dcce] dark:border-[#2b2d3d] space-y-1">
                    <span className="font-bold text-[#8d271c] dark:text-[#ef5350] block">① 天命八字診斷：</span>
                    <p className="text-[11px] text-[#554e44] dark:text-[#b4aea4] leading-relaxed">
                      • 命中比肩劫財成群克奪財星，流年偏財入墓庫空亡。<br/>
                      • 財星弱且無食傷生扶，逢印綬過旺奪食。<br/>
                      • <b>判定</b>：宏觀週期正逢破耗期，切忌盲目擴張。
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-[#171822] border border-[#e5dcce] dark:border-[#2b2d3d] space-y-1">
                    <span className="font-bold text-[#0284c7] dark:text-[#38bdf8] block">② 六爻機先斷法：</span>
                    <p className="text-[11px] text-[#554e44] dark:text-[#b4aea4] leading-relaxed">
                      • 妻財爻伏藏於兄弟爻下，動爻五爻官鬼化進神。<br/>
                      • 本卦《火澤睽》意見相左，變卦《火雷噬嗑》是非爭端。<br/>
                      • <b>判定</b>：項目暗藏法律合約糾紛，對方必設套侵吞。
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-[#171822] border border-[#e5dcce] dark:border-[#2b2d3d] space-y-1">
                    <span className="font-bold text-[#15803d] dark:text-[#4ade80] block">③ 陽宅空間方藥：</span>
                    <p className="text-[11px] text-[#554e44] dark:text-[#b4aea4] leading-relaxed">
                      • 排查正財位：保持整潔明亮，忌堆積雜物穢氣。<br/>
                      • 廚房灶位勿對大門，水龍頭勿正對爐火。<br/>
                      • <b>方藥</b>：財位安放天然闊葉綠植，焚降真檀香凝聚正氣。
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white/90 dark:bg-[#171822] border border-[#e5dcce] dark:border-[#2b2d3d] text-xs space-y-1">
                  <b className="text-[#8d271c] dark:text-[#ef5350]">✦ 大師實操止損 SOP：</b>
                  <p className="text-[11px] text-[#443e37] dark:text-[#c4beb4] leading-relaxed">
                    1. 堅決拒絕任何高息借貸或合夥擔保；2. 將流動資產轉移至國債、保單等保本低風險標的；3. 設立 15% 投資絕對止損線，破線即斬，絕不補倉！
                  </p>
                </div>
              </div>
            )}

            {activeScenario === 'career' && (
              <div className="p-4 rounded-xl bg-[#faf7f0] dark:bg-[#1f202c] border border-[#e8dfcf] dark:border-[#2f3246] space-y-3">
                <div className="flex items-center justify-between border-b pb-2 border-[#eee6d7] dark:border-[#2c2f42]">
                  <h5 className="font-bold text-sm text-[#0284c7] dark:text-[#38bdf8] flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    【主題二：職場晉升與合約糾紛】三才立體診治手冊
                  </h5>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 font-bold">
                    防官非立功名
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white dark:bg-[#171822] border border-[#e5dcce] dark:border-[#2b2d3d] space-y-1">
                    <span className="font-bold text-[#8d271c] dark:text-[#ef5350] block">① 天命八字診斷：</span>
                    <p className="text-[11px] text-[#554e44] dark:text-[#b4aea4] leading-relaxed">
                      • 命局官殺混雜，或傷官見官為禍百端。<br/>
                      • 歲運逢天羅地網、三刑逢沖，小人讒言構陷。<br/>
                      • <b>判定</b>：職場處於高壓受制期，多做多錯，宜低調自律。
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-[#171822] border border-[#e5dcce] dark:border-[#2b2d3d] space-y-1">
                    <span className="font-bold text-[#0284c7] dark:text-[#38bdf8] block">② 六爻機先斷法：</span>
                    <p className="text-[11px] text-[#554e44] dark:text-[#b4aea4] leading-relaxed">
                      • 父母爻（代表合約、批文、長官）受月破日克。<br/>
                      • 朱雀騰蛇發動，主是非官司與欺瞞暗算。<br/>
                      • <b>判定</b>：合約細節必有嚴重陷阱，長官口頭承諾不可信。
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-[#171822] border border-[#e5dcce] dark:border-[#2b2d3d] space-y-1">
                    <span className="font-bold text-[#15803d] dark:text-[#4ade80] block">③ 陽宅空間方藥：</span>
                    <p className="text-[11px] text-[#554e44] dark:text-[#b4aea4] leading-relaxed">
                      • 書房辦公椅背後務必靠實牆（靠山穩固），前明堂開闊。<br/>
                      • 桌面左青龍方高於右白虎方，避開頭頂橫樑壓頂。<br/>
                      • <b>方藥</b>：案頭放置黑曜石或紫水晶，辟除小人流言。
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white/90 dark:bg-[#171822] border border-[#e5dcce] dark:border-[#2b2d3d] text-xs space-y-1">
                  <b className="text-[#0284c7] dark:text-[#38bdf8]">✦ 大師職場防禦 SOP：</b>
                  <p className="text-[11px] text-[#443e37] dark:text-[#c4beb4] leading-relaxed">
                    1. 所有重要公務與業務承諾，一律保留 Email/文字白紙黑字歸檔；2. 遇長官情緒施壓，絕不衝動提辭職；3. 簽署重大合約務必聘請專業律師逐條審核。
                  </p>
                </div>
              </div>
            )}

            {activeScenario === 'love' && (
              <div className="p-4 rounded-xl bg-[#faf7f0] dark:bg-[#1f202c] border border-[#e8dfcf] dark:border-[#2f3246] space-y-3">
                <div className="flex items-center justify-between border-b pb-2 border-[#eee6d7] dark:border-[#2c2f42]">
                  <h5 className="font-bold text-sm text-[#e11d48] dark:text-[#fb7185] flex items-center gap-1.5">
                    <Heart className="w-4 h-4" />
                    【主題三：親密關係與婚戀危機】三才立體診治手冊
                  </h5>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-bold">
                    和合融冰化煞
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white dark:bg-[#171822] border border-[#e5dcce] dark:border-[#2b2d3d] space-y-1">
                    <span className="font-bold text-[#8d271c] dark:text-[#ef5350] block">① 天命八字診斷：</span>
                    <p className="text-[11px] text-[#554e44] dark:text-[#b4aea4] leading-relaxed">
                      • 日支夫妻宮逢歲運天剋地沖、刑害破敗。<br/>
                      • 配偶星（男正偏財、女正偏官）被爭合或落入絕地。<br/>
                      • <b>判定</b>：情感處於信任瓦解期，雙方情緒極度敏感。
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-[#171822] border border-[#e5dcce] dark:border-[#2b2d3d] space-y-1">
                    <span className="font-bold text-[#0284c7] dark:text-[#38bdf8] block">② 六爻機先斷法：</span>
                    <p className="text-[11px] text-[#554e44] dark:text-[#b4aea4] leading-relaxed">
                      • 世爻與應爻相剋相害，應爻化出玄武咸池之星。<br/>
                      • 卦逢《澤火革》變革之象，溝通頻道嚴重錯位。<br/>
                      • <b>判定</b>：存在第三者干擾或深層價值觀嚴重撕裂。
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-[#171822] border border-[#e5dcce] dark:border-[#2b2d3d] space-y-1">
                    <span className="font-bold text-[#15803d] dark:text-[#4ade80] block">③ 陽宅空間方藥：</span>
                    <p className="text-[11px] text-[#554e44] dark:text-[#b4aea4] leading-relaxed">
                      • 主臥室鏡子切忌正對床頭（易生神經衰弱與多疑）。<br/>
                      • 清理家中正東/正西/正南/正北桃花位的枯萎花草與空花瓶。<br/>
                      • <b>方藥</b>：使用天然沉香或玫瑰精油安撫神經，溫潤氣場。
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white/90 dark:bg-[#171822] border border-[#e5dcce] dark:border-[#2b2d3d] text-xs space-y-1">
                  <b className="text-[#e11d48] dark:text-[#fb7185]">✦ 大師情感和合 SOP：</b>
                  <p className="text-[11px] text-[#443e37] dark:text-[#c4beb4] leading-relaxed">
                    1. 遇爭執主動設立「冷靜48小時」機制，絕不在憤怒中做離婚決策；2. 主動以短暫出差或聚少離多應對夫妻宮刑沖；3. 傾聽大於辯駁，重塑底層信任。
                  </p>
                </div>
              </div>
            )}

            {activeScenario === 'health' && (
              <div className="p-4 rounded-xl bg-[#faf7f0] dark:bg-[#1f202c] border border-[#e8dfcf] dark:border-[#2f3246] space-y-3">
                <div className="flex items-center justify-between border-b pb-2 border-[#eee6d7] dark:border-[#2c2f42]">
                  <h5 className="font-bold text-sm text-[#15803d] dark:text-[#4ade80] flex items-center gap-1.5">
                    <Activity className="w-4 h-4" />
                    【主題四：身心體質與頑疾調養】三才立體診治手冊
                  </h5>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold">
                    本草避穢固元氣
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white dark:bg-[#171822] border border-[#e5dcce] dark:border-[#2b2d3d] space-y-1">
                    <span className="font-bold text-[#8d271c] dark:text-[#ef5350] block">① 天命八字診斷：</span>
                    <p className="text-[11px] text-[#554e44] dark:text-[#b4aea4] leading-relaxed">
                      • 八字五行嚴重偏枯（如燥土過旺脆金傷肺氣，旺水蕩木傷肝膽）。<br/>
                      • 歲運疾厄宮星曜化忌，逢白虎吊客加會。<br/>
                      • <b>判定</b>：免疫力與自律神經系統處於透支脆弱期。
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-[#171822] border border-[#e5dcce] dark:border-[#2b2d3d] space-y-1">
                    <span className="font-bold text-[#0284c7] dark:text-[#38bdf8] block">② 六爻機先斷法：</span>
                    <p className="text-[11px] text-[#554e44] dark:text-[#b4aea4] leading-relaxed">
                      • 官鬼爻（代表病魔）持世旺相，子孫爻（醫藥福神）休囚入墓。<br/>
                      • 卦臨白虎動變，病勢來得急猛。<br/>
                      • <b>判定</b>：切忌拖延或自作聰明亂服藥，應速就正規醫治。
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-[#171822] border border-[#e5dcce] dark:border-[#2b2d3d] space-y-1">
                    <span className="font-bold text-[#15803d] dark:text-[#4ade80] block">③ 陽宅空間方藥：</span>
                    <p className="text-[11px] text-[#554e44] dark:text-[#b4aea4] leading-relaxed">
                      • 臥室保持空氣流通與柔和採光，嚴防穿堂陰風直吹。<br/>
                      • 衛浴排水保持乾燥除濕，防止黴菌穢氣侵入寢室。<br/>
                      • <b>方藥</b>：懸掛艾草、石菖蒲香包辟穢化濁，助安眠凝神。
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white/90 dark:bg-[#171822] border border-[#e5dcce] dark:border-[#2b2d3d] text-xs space-y-1">
                  <b className="text-[#15803d] dark:text-[#4ade80]">✦ 大師身心調和 SOP：</b>
                  <p className="text-[11px] text-[#443e37] dark:text-[#c4beb4] leading-relaxed">
                    1. 恪遵現代正規醫療醫囑，命理風水作為環境心性輔助；2. 嚴格執行晚上 11 點子時前入睡以養膽經；3. 配合日主五行喜忌食用對應天然食材以調和氣血。
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== 5. 三才立體架構與哲學底蘊 ==================== */}
      {activeTrinityTab === 'framework' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl border bg-white dark:bg-[#1a1b24] border-[#ded4bf] dark:border-[#2c2f42] space-y-4 shadow-xs">
            <div className="border-b pb-3 border-[#eee4d2] dark:border-[#262838]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#8d271c] dark:text-[#ef5350]" />
                <h4 className="font-bold text-sm sm:text-base text-[#2b2723] dark:text-[#f4f1eb]">
                  三才合參之宏觀架構與大師本質 (Macro Trinity Framework)
                </h4>
              </div>
              <p className="text-[11px] text-[#706456] dark:text-[#a09a8f] mt-1">
                《易經》云：「天垂象，見吉凶，聖人象之。」知天命之常與變，順天時、據地利、盡人謀。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-xl bg-gradient-to-b from-[#faf6ee] to-[#f4ebe0] dark:from-[#1b1c28] dark:to-[#141520] border border-[#ded3be] dark:border-[#2c2e3f] space-y-2">
                <div className="flex items-center gap-2 text-[#8d271c] dark:text-[#ef5350] font-bold text-sm">
                  <span className="p-1 rounded bg-[#8d271c]/10">🌌</span>
                  <span>天：時間之命 · 定盤星</span>
                </div>
                <p className="text-xs text-[#524a41] dark:text-[#b4aea3] leading-relaxed">
                  <b>八字 ✕ 紫微斗數</b>：推演先天稟賦、基因性情、骨骼格局天花板與十年大運起伏。揭示人生劇本的情節發展與吉凶應期。它解決的核心問題是：<b>「你有沒有那個命？宏觀趨勢何時是順境何時是逆境？」</b>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-b from-[#faf6ee] to-[#f4ebe0] dark:from-[#1b1c28] dark:to-[#141520] border border-[#ded3be] dark:border-[#2c2e3f] space-y-2">
                <div className="flex items-center gap-2 text-[#15803d] dark:text-[#4ade80] font-bold text-sm">
                  <span className="p-1 rounded bg-[#15803d]/10">🧭</span>
                  <span>地：空間之氣 · 避風港</span>
                </div>
                <p className="text-xs text-[#524a41] dark:text-[#b4aea3] leading-relaxed">
                  <b>陽宅形巒 ✕ 本草氣場</b>：勘察外部山川巒頭形煞與內部藏風聚氣格局。居處乃人體能量的培養皿。它為先天命運提供後天補救與增益場域。解決的核心問題是：<b>「如何為先天命格營造庇護與生旺場域？」</b>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-b from-[#faf6ee] to-[#f4ebe0] dark:from-[#1b1c28] dark:to-[#141520] border border-[#ded3be] dark:border-[#2c2e3f] space-y-2">
                <div className="flex items-center gap-2 text-[#0284c7] dark:text-[#38bdf8] font-bold text-sm">
                  <span className="p-1 rounded bg-[#0284c7]/10">⚡</span>
                  <span>人：時空之機 · 指南針</span>
                </div>
                <p className="text-xs text-[#524a41] dark:text-[#b4aea3] leading-relaxed">
                  <b>文王六爻 ✕ 理性攻防</b>：隨事而占，納甲裝卦，抓旺衰動靜化進化退，捕捉瞬時之機先。解決「現在該怎麼辦？眼前具體項目結果如何？」解決的核心問題是：<b>「當下這件事能不能做？合作方有何隱患？何時當斷然停損？」</b>
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#faf7f0] dark:bg-[#1d1f2a] border border-[#e8dfce] dark:border-[#2e3142] text-xs text-[#443e37] dark:text-[#c4beb4] space-y-1.5 leading-relaxed">
              <div className="font-bold text-[#8d271c] dark:text-[#ef5350]">
                ✦ 宗師三位一體立體合參黃金公式：
              </div>
              <p>
                <b>八字定人生大局</b>（知何時順逆） ✕ <b>六爻斷當下機先</b>（知何事可為） ✕ <b>風水調居所氣場</b>（增可為之機、護順逆之身）。唯有融通此三道，方能破除命運迷思，成為真正的智者。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 6. 宗師修行箴言與易道精神 ==================== */}
      {activeTrinityTab === 'creed' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl border bg-white dark:bg-[#1a1b24] border-[#ded4bf] dark:border-[#2c2f42] space-y-4 shadow-xs">
            <div className="border-b pb-3 border-[#eee4d2] dark:border-[#262838]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#8d271c] dark:text-[#ef5350]" />
                <h4 className="font-bold text-sm sm:text-base text-[#2b2723] dark:text-[#f4f1eb]">
                  古典易理宗師修煉箴言與終極心法
                </h4>
              </div>
              <p className="text-[11px] text-[#706456] dark:text-[#a09a8f] mt-1">
                以正道求正法，德術兼修，以實戰驗證真理，為君子謀而不為小人圖利。
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#faf7f0] dark:bg-[#1f202c] border border-[#e8dfcf] dark:border-[#2f3246] space-y-1.5">
                <div className="font-bold text-[#8d271c] dark:text-[#ef5350] flex items-center gap-1.5">
                  <span>一、正心誠意 · 德術兼修</span>
                </div>
                <p className="text-[11px] text-[#554e44] dark:text-[#b4aea4] leading-relaxed">
                  「能得真諦者不自詡，懷揣玄機者定自謙。」學易者當以「正」為先，修德養性。易為君子謀，非迷信妄言；勿以所學謀不義之財，勿圖蠅頭小利。
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf7f0] dark:bg-[#1f202c] border border-[#e8dfcf] dark:border-[#2f3246] space-y-1.5">
                <div className="font-bold text-[#b45309] dark:text-[#f59e0b] flex items-center gap-1.5">
                  <span>二、重視基礎 · 循序漸進</span>
                </div>
                <p className="text-[11px] text-[#554e44] dark:text-[#b4aea4] leading-relaxed">
                  萬丈高樓平地起。務必將陰陽兩儀、五行生剋制化、納甲裝卦、用神辨旺衰等基礎融會貫通，學透學精，切莫好高騖遠搞花架子。
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf7f0] dark:bg-[#1f202c] border border-[#e8dfcf] dark:border-[#2f3246] space-y-1.5">
                <div className="font-bold text-[#0284c7] dark:text-[#38bdf8] flex items-center gap-1.5">
                  <span>三、大量實戰 · 唯真理從</span>
                </div>
                <p className="text-[11px] text-[#554e44] dark:text-[#b4aea4] leading-relaxed">
                  一切理論皆須經受大量實戰檢驗：驗者吸收留存，不驗者修正捨棄。在真實命例與卦象中反覆印證，方能磨礪出真正的如炬慧眼。
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf7f0] dark:bg-[#1f202c] border border-[#e8dfcf] dark:border-[#2f3246] space-y-1.5">
                <div className="font-bold text-[#15803d] dark:text-[#4ade80] flex items-center gap-1.5">
                  <span>四、心如鐵石 · 渡劫修性</span>
                </div>
                <p className="text-[11px] text-[#554e44] dark:text-[#b4aea4] leading-relaxed">
                  學易之路漫漫，必歷經迷茫、困頓與瓶頸考驗。學易實為渡心劫，唯有心如鐵石、堅持不懈，方能破繭成蝶，悟得陰陽中和之妙。
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf7f0] dark:bg-[#1f202c] border border-[#e8dfcf] dark:border-[#2f3246] space-y-1.5">
                <div className="font-bold text-[#7c3aed] dark:text-[#a78bfa] flex items-center gap-1.5">
                  <span>五、融會貫通 · 天地合參</span>
                </div>
                <p className="text-[11px] text-[#554e44] dark:text-[#b4aea4] leading-relaxed">
                  不畫地自限，不宗派自固。跳脫單一術數之局限，將天時八字、人謀易卦、地理風水三位一體融合印證，方為易學大成之坦途。
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf7f0] dark:bg-[#1f202c] border border-[#e8dfcf] dark:border-[#2f3246] space-y-1.5">
                <div className="font-bold text-[#be123c] dark:text-[#fb7185] flex items-center gap-1.5">
                  <span>六、回歸本源 · 濟世救人</span>
                </div>
                <p className="text-[11px] text-[#554e44] dark:text-[#b4aea4] leading-relaxed">
                  易學之終極宗旨，在於「趨吉避凶，為他人排憂解難」。明易理，識天命，助迷茫者掌舵人生航向，造福世間，德莫大焉。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
