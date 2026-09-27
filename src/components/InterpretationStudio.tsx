import React, { useState } from 'react';
import { 
  Sparkles, Compass, 
  Briefcase, DollarSign, 
  Layers, BookOpen, Clock,
  Bot, Copy, Check, Settings, AlertCircle,
  Flame, Globe
} from 'lucide-react';
import type { PalaceData, HoroscopeState, BaziData, SanFangSiZheng } from '../types';
import { 
  generatePalaceAnalysis, 
  MAJOR_STAR_DESCRIPTIONS, 
  MUTAGEN_MEANINGS 
} from '../lib/interpreter';
import { 
  PALACE_DEEP_ESSENCE, 
  getDecadalDeepReading, 
  getYearlyDeepReading, 
  getNatalPatternDeepReading, 
  getBaziCrossDeepReading 
} from '../lib/deepAnalysisEngine';
import { getStoredAISettings, callAIModel, buildFullChartPrompt } from '../lib/aiService';

interface InterpretationStudioProps {
  selectedPalace: PalaceData;
  allPalaces: PalaceData[];
  sanFang: SanFangSiZheng;
  horoscope: HoroscopeState;
  bazi: BaziData;
  soul: string;
  body: string;
  fiveElementsClass: string;
  name?: string;
  gender?: string;
  solarDate?: string;
  lunarDate?: string;
  laiYinIndex?: number;
  onOpenAISettings?: () => void;
}

export const InterpretationStudio: React.FC<InterpretationStudioProps> = ({
  selectedPalace,
  allPalaces,
  sanFang,
  horoscope,
  bazi,
  soul,
  body,
  fiveElementsClass,
  name,
  gender,
  solarDate,
  lunarDate,
  laiYinIndex = 0,
  onOpenAISettings
}) => {
  const [activeTab, setActiveTab] = useState<'palace' | 'horoscope' | 'natal' | 'bazi' | 'ai'>('palace');
  const [aiScope, setAiScope] = useState<'full' | 'palace'>('full');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Standard Palace Analysis Object
  const analysis = generatePalaceAnalysis(selectedPalace, allPalaces, sanFang, horoscope);
  
  // 1000-word Deep Essence for selected palace
  const deepEssence = PALACE_DEEP_ESSENCE[selectedPalace.name] || PALACE_DEEP_ESSENCE['命宮'];

  // AI Prompt & Call Handlers
  const handleGenerateAIReading = async () => {
    const aiConfig = getStoredAISettings();
    const hasKey = aiConfig.provider === 'gemini' ? !!aiConfig.geminiApiKey : !!aiConfig.openrouterApiKey;
    if (!hasKey) {
      if (onOpenAISettings) {
        onOpenAISettings();
      } else {
        alert('請先點擊上方「AI 設定」填入 API Key！');
      }
      return;
    }

    setIsAiLoading(true);
    setAiError(null);
    try {
      let promptText = '';
      if (aiScope === 'full') {
        promptText = buildFullChartPrompt(
          name || '命主',
          gender || '男',
          solarDate || '',
          lunarDate || '',
          fiveElementsClass,
          soul,
          body,
          bazi,
          allPalaces,
          horoscope
        );
      } else {
        const pStars = selectedPalace.majorStars.map(s => `${s.name}${s.brightness ? `(${s.brightness})` : ''}${s.mutagen ? `[化${s.mutagen}]` : ''}`).join('、') || '借對宮星曜';
        const pMinors = selectedPalace.minorStars.map(s => s.name).join(' ');
        const pMutagens = selectedPalace.selfMutagens.map(sm => `${sm.star}自化${sm.mutagen}`).join(' ');

        promptText = `請身為紫微斗數大宗師，針對命盤中【${selectedPalace.name} (${selectedPalace.heavenlyStem}${selectedPalace.earthlyBranch})】進行深度破譯：
命造基本資訊：
- 姓名：${name || '命主'} (${gender || '男'})
- 五行局：${fiveElementsClass} | 命主：${soul} | 身主：${body}
- 八字日主：${bazi.dayMaster} (${bazi.dayMasterStrength})

宮位星曜配置：
- 宮位名稱：${selectedPalace.name}
- 坐落天干地支：${selectedPalace.heavenlyStem}${selectedPalace.earthlyBranch}
- 主星明細：${pStars}
- 輔煞吉凶星：${pMinors}
${pMutagens ? `- 宮干自化：${pMutagens}` : ''}
- 大限年歲段：${selectedPalace.decadalRange[0]}~${selectedPalace.decadalRange[1]}歲
- 當前流限重疊：${[selectedPalace.decadalName, selectedPalace.yearlyName, selectedPalace.monthlyName].filter(Boolean).join('、') || '本命宮位'}

請按以下要求輸出深度精解：
1. 【星宮交疊玄機】：此宮星曜性質與宮位世俗意涵之化學反應。
2. 【吉凶實戰破譯】：煞星或化忌如何引動？吉星與祿權如何發揮？
3. 【時運流限聯動】：在此宮位主導之大限或流年，命主將面臨何種考驗與突破？
4. 【具體處世錦囊】：針對現代生活（職場、財務、情緒或關係）給予 3 條立竿見影的落地建議。`;
      }

      const res = await callAIModel(promptText);
      setAiResult(res);
    } catch (err: any) {
      setAiError(err?.message || 'AI 解盤請求失敗，請檢查網路連線或 API Key。');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopy = () => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="w-full lg:w-[500px] xl:w-[540px] shrink-0 flex flex-col font-serif rounded-2xl border shadow-lg overflow-hidden transition-all duration-200
      bg-[#fcfbf7] dark:bg-[#16171f] border-[#dcd3c1] dark:border-[#2b2d3b] text-[#222] dark:text-[#eee]">
      
      {/* Studio Header */}
      <div className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-b flex items-center justify-between
        bg-[#f6f2e8] dark:bg-[#1b1c24] border-[#e2d9c8] dark:border-[#2a2c3a]">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <BookOpen className="w-4 h-4 text-[#8d271c] dark:text-[#df756b]" />
          <h2 className="font-bold text-sm sm:text-base tracking-wide text-[#2b2723] dark:text-[#f2efe9]">
            玄璣動態智能解盤室
          </h2>
        </div>
        <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded border text-[#8d271c] dark:text-[#df756b] font-semibold
          bg-[#f8edea] dark:bg-[#281c1b] border-[#e8cdc6] dark:border-[#422924]">
          當前聚焦：{selectedPalace.name} ({selectedPalace.heavenlyStem}{selectedPalace.earthlyBranch})
        </span>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b text-xs font-bold overflow-x-auto scrollbar-none overscroll-x-contain touch-pan-x
        bg-[#ede7da] dark:bg-[#13141a] border-[#ded5c3] dark:border-[#252733]">
        {[
          { id: 'palace', label: '【選宮精批】' },
          { id: 'horoscope', label: '【時運走勢】' },
          { id: 'natal', label: '【原局格局】' },
          { id: 'bazi', label: '【八字印證】' },
          { id: 'ai', label: '✦ AI大師精批' },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const isAI = tab.id === 'ai';
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-2.5 whitespace-nowrap transition border-b-2
                ${isActive
                  ? 'border-[#8d271c] text-[#8d271c] dark:border-[#df756b] dark:text-[#df756b] bg-[#fcfbf7] dark:bg-[#16171f]'
                  : isAI
                    ? 'border-transparent text-[#96551b] dark:text-[#f59e0b] hover:text-[#8d271c] font-bold'
                    : 'border-transparent text-[#666055] dark:text-[#a09b91] hover:text-[#222] dark:hover:text-white'}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Scrollable Content Workspace */}
      <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-4 sm:space-y-6 text-xs sm:text-sm leading-relaxed max-h-[600px] sm:max-h-[750px] scrollbar-thin">
        
        {/* ==================== TAB 1: 選宮精批 (深度離線內容) ==================== */}
        {activeTab === 'palace' && (
          <div className="space-y-6">
            
            {/* 1. Palace Deep Philosophy & Modern Manifestation (~1000 字) */}
            <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1b23] border-[#ded6c5] dark:border-[#2c2e3c] space-y-3.5">
              <div className="flex items-center justify-between border-b pb-2 border-[#eee6d7] dark:border-[#262835]">
                <h3 className="font-bold text-sm text-[#8d271c] dark:text-[#df756b] flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  【{selectedPalace.name}】之世俗哲學與深度意涵 (千字精解)
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#f4efe4] dark:bg-[#252835] text-[#706456] dark:text-[#a0a8be]">
                  大限 {selectedPalace.decadalRange[0]}~{selectedPalace.decadalRange[1]} 歲
                </span>
              </div>

              {/* Sub-block A: 哲學本質 */}
              <div className="space-y-1">
                <div className="font-bold text-xs text-[#2a5d7c] dark:text-[#64b5f6] flex items-center gap-1">
                  <span>✦ 命理天道與太極定位：</span>
                </div>
                <p className="text-xs text-[#443e37] dark:text-[#c4beb4] leading-relaxed whitespace-pre-line text-justify">
                  {deepEssence.philosophy}
                </p>
              </div>

              {/* Sub-block B: 現代社會場景投影 */}
              <div className="space-y-1 pt-2 border-t border-[#f2ece1] dark:border-[#252735]">
                <div className="font-bold text-xs text-[#b85d18] dark:text-[#e58a44] flex items-center gap-1">
                  <span>✦ 現代世俗場景顯化與現實考驗：</span>
                </div>
                <p className="text-xs text-[#443e37] dark:text-[#c4beb4] leading-relaxed whitespace-pre-line text-justify">
                  {deepEssence.modernManifestation}
                </p>
              </div>

              {/* Sub-block C: 陰影與盲點剖析 */}
              <div className="space-y-1 pt-2 border-t border-[#f2ece1] dark:border-[#252735]">
                <div className="font-bold text-xs text-[#991b1b] dark:text-[#f87171] flex items-center gap-1">
                  <span>✦ 陰影陷阱與潛意識盲點：</span>
                </div>
                <p className="text-xs text-[#443e37] dark:text-[#c4beb4] leading-relaxed whitespace-pre-line text-justify">
                  {deepEssence.shadowAndLight}
                </p>
              </div>

              {/* Sub-block D: 現代實戰指南 */}
              <div className="p-3 rounded-lg bg-[#f7f4ec] dark:bg-[#20222d] border border-[#e8dfcf] dark:border-[#313444] text-xs space-y-1.5">
                <span className="font-bold text-[#8d271c] dark:text-[#df756b] block">
                  ✦ 落地行道指南與自我修煉：
                </span>
                <p className="text-[#443e37] dark:text-[#c4beb4] leading-relaxed whitespace-pre-line">
                  {deepEssence.actionGuidance}
                </p>
              </div>
            </div>

            {/* 2. Major Stars & Dual Star Reactions */}
            <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1b23] border-[#ded6c5] dark:border-[#2c2e3c] space-y-3.5">
              <div className="flex items-center justify-between border-b pb-2 border-[#eee6d7] dark:border-[#262835]">
                <h3 className="font-bold text-sm text-[#8d271c] dark:text-[#df756b] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  坐宮主星氣場與化學反應破譯
                </h3>
                <span className="text-xs text-[#8c8477] dark:text-[#888]">
                  {selectedPalace.majorStars.length > 0 ? `${selectedPalace.majorStars.length} 顆主星坐守` : '借對宮照臨'}
                </span>
              </div>

              {/* Dual Star Matching */}
              {analysis.dualMatch && (
                <div className="p-3 rounded-lg bg-[#fbf5eb] dark:bg-[#261f18] border border-[#ecdac0] dark:border-[#473420] space-y-1">
                  <div className="font-bold text-xs text-[#b85d18] dark:text-[#e58a44]">
                    ✦ 雙星交會大格局：{analysis.dualMatch.title}
                  </div>
                  <p className="text-xs text-[#52493d] dark:text-[#cfc5b6] leading-relaxed text-justify">
                    {analysis.dualMatch.desc}
                  </p>
                </div>
              )}

              {/* Individual Major Stars details */}
              {selectedPalace.majorStars.map((star, sIdx) => {
                const desc = MAJOR_STAR_DESCRIPTIONS[star.name];
                return (
                  <div key={sIdx} className="space-y-2 pt-2 border-t first:border-t-0 border-[#f0e8db] dark:border-[#242633]">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-bold text-xs bg-[#8d271c] text-white">
                        {star.name}
                      </span>
                      {star.brightness && (
                        <span className="text-xs text-[#b85d18] dark:text-[#e58a44] font-bold">
                          廟旺利陷：[{star.brightness}]
                        </span>
                      )}
                      {star.mutagen && (
                        <span className="text-xs px-1.5 py-0.2 rounded font-bold bg-[#9c2e22] text-white">
                          化{star.mutagen}
                        </span>
                      )}
                    </div>
                    {desc && (
                      <div className="text-xs text-[#554e44] dark:text-[#b4aea4] space-y-1.5 text-justify">
                        <p><b className="text-[#2b2723] dark:text-[#e2ded6]">【星曜本質與性情密碼】：</b>{desc.personality}</p>
                        <p><b className="text-[#2b2723] dark:text-[#e2ded6]">【職場競爭與開創天賦】：</b>{desc.career}</p>
                        <p><b className="text-[#2b2723] dark:text-[#e2ded6]">【金錢造化與資產配置】：</b>{desc.wealth}</p>
                        <p><b className="text-[#2b2723] dark:text-[#e2ded6]">【情感相處與親密關係】：</b>{desc.relationship}</p>
                      </div>
                    )}
                  </div>
                );
              })}

              {selectedPalace.majorStars.length === 0 && (
                <div className="text-xs text-[#6e675b] dark:text-[#a8a195] space-y-2 text-justify">
                  <p>
                    本宮為<b>空宮 (無正曜坐守)</b>。在紫微斗數玄奧之理中，空宮並非「一無所有」，而是代表在此生活領域中，命主的「先天預設框架極少、自我邊界模糊、對外在環境之變遷極為敏感」。空宮之人如同乾淨的海綿，能以極高之同理心適應外界衝擊，但也極易隨波逐流、受周遭人事物之牽引而迷失自我主見。
                  </p>
                  <p>
                    依斗數正統法門，必須<b>「借對宮【${analysis.oppositePalace.name}】之主星 (${analysis.oppositePalace.stars.join('、') || '亦空'})」</b>為主要精神參照與能量支柱。命主在面對此宮課題時，宜主動「借外力以修內在、借鏡像以照本心」，善用無招勝有招之空靈智慧，將空宮的被動轉化為高度靈活之跨界整合天賦。
                  </p>
                </div>
              )}
            </div>

            {/* 3. Mutagens & Self Mutagens */}
            <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1b23] border-[#ded6c5] dark:border-[#2c2e3c] space-y-3">
              <h3 className="font-bold text-sm text-[#275c8d] dark:text-[#4fa3e3] flex items-center gap-1.5 border-b pb-2 border-[#eee6d7] dark:border-[#262835]">
                <Layers className="w-4 h-4" />
                四化飛星動態與宮干自化破譯
              </h3>

              {/* Natal Mutagens in Palace */}
              {selectedPalace.majorStars.filter(s => s.mutagen).map((s, idx) => {
                const mutInfo = (MUTAGEN_MEANINGS as Record<string, any>)[s.mutagen || ''];
                return (
                  <div key={idx} className="p-3 rounded-lg bg-[#edf4f9] dark:bg-[#17222c] border border-[#d2e3f0] dark:border-[#273d52] text-xs space-y-1">
                    <span className="font-bold text-[#275c8d] dark:text-[#64b5f6]">
                      【生年化{s.mutagen} · {s.name}】宿命定點顯化：
                    </span>
                    <p className="text-[#334155] dark:text-[#94a3b8]">{mutInfo?.character}：{mutInfo?.effect}</p>
                    <p className="text-[#991b1b] dark:text-[#f87171]">{mutInfo?.warning}</p>
                  </div>
                );
              })}

              {/* Self Mutagens */}
              <div className="text-xs text-[#554e44] dark:text-[#b4aea4] space-y-1.5">
                <div>
                  <b className="text-[#79287c] dark:text-[#ce7fe2]">宮干自化現象：</b>
                  <span className="font-medium text-[#222] dark:text-[#eee]">{analysis.selfMutagenText}</span>
                </div>
                {selectedPalace.selfMutagens.length > 0 && (
                  <p className="text-[11px] text-[#70685c] dark:text-[#9c958b] leading-relaxed text-justify">
                    自化乃宮干與星曜交互作用產生的自發性散發或吸收。自化祿主在此宮位大方付出、不計成本；自化權主此處容易固執任性、爭奪主導；自化科主重視表面體面、得過且過；自化忌則代表在此處易自尋煩惱、自我懷疑或自耗資源。自化是生命能量的大開大合，明曉自化之機，方能順流引導其能量不致氾濫。
                  </p>
                )}
              </div>
            </div>

            {/* 4. SanFangSiZheng Cross Radiation */}
            <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1b23] border-[#ded6c5] dark:border-[#2c2e3c] space-y-3">
              <h3 className="font-bold text-sm text-[#1b7a4f] dark:text-[#4ade80] flex items-center gap-1.5 border-b pb-2 border-[#eee6d7] dark:border-[#262835]">
                <Compass className="w-4 h-4" />
                三方四正照會氣場連線 (全息共振)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#f5f9f6] dark:bg-[#17241b] border border-[#d6ebd9] dark:border-[#25422d] space-y-1">
                  <div className="font-bold text-[#1b7a4f] dark:text-[#4ade80]">
                    對宮沖照：【{analysis.oppositePalace.name}】
                  </div>
                  <div className="text-[#333] dark:text-[#ccc]">
                    星曜照臨：{analysis.oppositePalace.stars.join('、') || '無主星'}
                  </div>
                  <p className="text-[11px] text-[#55695c] dark:text-[#8ea394] leading-relaxed text-justify">
                    對宮為外部環境的直接鏡像反光鏡，對宮若吉則出外機遇豐厚，對宮若凶則外部挑戰頻發。
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#f5f9f6] dark:bg-[#17241b] border border-[#d6ebd9] dark:border-[#25422d] space-y-1">
                  <div className="font-bold text-[#1b7a4f] dark:text-[#4ade80]">
                    三合拱會：【{analysis.trines.map(t => t.name).join('、')}】
                  </div>
                  <div className="text-[#333] dark:text-[#ccc]">
                    星曜會聚：{analysis.trines.flatMap(t => t.stars).join('、') || '無主星'}
                  </div>
                  <p className="text-[11px] text-[#55695c] dark:text-[#8ea394] leading-relaxed text-justify">
                    三合宮代表命造同氣相求的內在支撐網絡，如同鼎之三足，共同維繫此宮位世俗成就的高度與穩定度。
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 2: 時運走勢 (深度千字解析) ==================== */}
        {activeTab === 'horoscope' && (
          <div className="space-y-6">
            
            {/* Decade 10-Year Master Reading */}
            <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1b23] border-[#ded6c5] dark:border-[#2c2e3c] space-y-3.5">
              <div className="flex items-center justify-between border-b pb-2 border-[#eee6d7] dark:border-[#262835]">
                <h3 className="font-bold text-sm text-[#2a5d7c] dark:text-[#64b5f6] flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  大限十年人生主軸破譯 (千字精解)
                </h3>
                <span className="text-xs font-mono font-bold text-[#8d271c] dark:text-[#df756b]">
                  {horoscope.decadalInfo?.stem}{horoscope.decadalInfo?.branch}大限
                </span>
              </div>

              <div className="text-xs text-[#443e37] dark:text-[#c4beb4] leading-relaxed whitespace-pre-line text-justify space-y-2">
                {getDecadalDeepReading(horoscope)}
              </div>
            </div>

            {/* Yearly Master Reading */}
            <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1b23] border-[#ded6c5] dark:border-[#2c2e3c] space-y-3.5">
              <div className="flex items-center justify-between border-b pb-2 border-[#eee6d7] dark:border-[#262835]">
                <h3 className="font-bold text-sm text-[#8d271c] dark:text-[#df756b] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  流年歲君重點引動破譯 (千字精解)
                </h3>
                <span className="text-xs font-mono font-bold text-[#8d271c] dark:text-[#df756b]">
                  {horoscope.yearlyInfo?.stem}{horoscope.yearlyInfo?.branch}年 (虛歲 {horoscope.yearlyInfo?.nominalAge}歲)
                </span>
              </div>

              <div className="text-xs text-[#443e37] dark:text-[#c4beb4] leading-relaxed whitespace-pre-line text-justify space-y-2">
                {getYearlyDeepReading(horoscope)}
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 3: 原局格局 (深度千字解析) ==================== */}
        {activeTab === 'natal' && (
          <div className="space-y-6">
            
            {/* Core Constitution Reading */}
            <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1b23] border-[#ded6c5] dark:border-[#2c2e3c] space-y-3.5">
              <div className="flex items-center justify-between border-b pb-2 border-[#eee6d7] dark:border-[#262835]">
                <h3 className="font-bold text-sm text-[#8d271c] dark:text-[#df756b] flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  原局命身·來因宮·五行局架構 (千字精解)
                </h3>
                <span className="text-xs font-mono font-bold text-[#8d271c] dark:text-[#df756b]">
                  {fiveElementsClass}
                </span>
              </div>

              <div className="text-xs text-[#443e37] dark:text-[#c4beb4] leading-relaxed whitespace-pre-line text-justify space-y-2">
                {getNatalPatternDeepReading(soul, body, fiveElementsClass, laiYinIndex, allPalaces)}
              </div>
            </div>

            {/* Career & Wealth Dual Axis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border bg-white dark:bg-[#1a1b23] border-[#ded6c5] dark:border-[#2c2e3c] space-y-1.5">
                <div className="font-bold text-[#2a5d7c] dark:text-[#64b5f6] flex items-center gap-1">
                  <Briefcase className="w-4 h-4" /> 官祿與事業專業護城河
                </div>
                <p className="text-[#555] dark:text-[#bbb] text-[11px] leading-relaxed text-justify">
                  命宮為精神定盤，官祿宮為社會實踐。官祿宮吉曜照會者，適合深耕專業壁壘，在組織中掌實權或獨立開創實業；逢煞曜者宜以精湛技術立足，避開官僚內耗。
                </p>
              </div>

              <div className="p-3.5 rounded-xl border bg-white dark:bg-[#1a1b23] border-[#ded6c5] dark:border-[#2c2e3c] space-y-1.5">
                <div className="font-bold text-[#b85d18] dark:text-[#e58a44] flex items-center gap-1">
                  <DollarSign className="w-4 h-4" /> 財帛流通與田宅資產沉澱
                </div>
                <p className="text-[#555] dark:text-[#bbb] text-[11px] leading-relaxed text-justify">
                  財帛宮掌管現金流轉之速度與途徑，田宅宮掌管資產之蓄積與保值。兩宮相輔相成，方能將波動之世俗利潤轉化為家族長遠之不朽基業。
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 4: 八字印證 (深度千字解析) ==================== */}
        {activeTab === 'bazi' && (
          <div className="space-y-6">
            
            {/* Bazi & Ziwei Cross Reading */}
            <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1b23] border-[#ded6c5] dark:border-[#2c2e3c] space-y-3.5">
              <div className="flex items-center justify-between border-b pb-2 border-[#eee6d7] dark:border-[#262835]">
                <h3 className="font-bold text-sm text-[#1b7a4f] dark:text-[#4ade80] flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  子平八字日主五行與喜用神調候 (千字精解)
                </h3>
                <span className="text-xs font-mono font-bold text-[#8d271c] dark:text-[#df756b]">
                  日主【{bazi.dayMaster}】({bazi.dayMasterStrength})
                </span>
              </div>

              <div className="text-xs text-[#443e37] dark:text-[#c4beb4] leading-relaxed whitespace-pre-line text-justify space-y-2">
                {getBaziCrossDeepReading(bazi, fiveElementsClass)}
              </div>
            </div>

            {/* Dayun Sequence */}
            <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1b23] border-[#ded6c5] dark:border-[#2c2e3c] space-y-2">
              <h3 className="font-bold text-xs text-[#70685c] dark:text-[#999285]">
                子平八字十年大運起運干支序列
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-xs">
                {bazi.dayunList.slice(0, 8).map((dy, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-[#f7f4ec] dark:bg-[#1d1f27] border border-[#e8dfcf] dark:border-[#2e313f]">
                    <div className="text-[10px] text-[#888]">{dy.age}歲起運</div>
                    <div className="font-bold text-[#8d271c] dark:text-[#df756b] text-sm mt-0.5">{dy.ganZhi}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 5: AI 大師精批 (雲端即時模型) ==================== */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            
            {/* AI Provider & Settings Banner */}
            {(() => {
              const aiSettings = getStoredAISettings();
              const hasKey = aiSettings.provider === 'gemini' ? !!aiConfiguredKey(aiSettings) : !!aiSettings.openrouterApiKey;
              const providerName = aiSettings.provider === 'gemini' ? 'Google Gemini' : 'OpenRouter';
              const modelName = aiSettings.provider === 'gemini' ? aiSettings.geminiModel : aiSettings.openrouterModel;

              function aiConfiguredKey(cfg: any) {
                return cfg.geminiApiKey;
              }

              return (
                <div className="p-3.5 rounded-xl border bg-white dark:bg-[#1a1b23] border-[#ded6c5] dark:border-[#2c2e3c] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-[#24334a] text-[#93c5fd]">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#2b2723] dark:text-[#f4f1ec] flex items-center gap-1.5">
                          <span>{providerName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-[#f0ebd9] dark:bg-[#252836] text-[#706456] dark:text-[#a0a8be]">
                            {modelName}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#787268] dark:text-[#9c978e]">
                          {hasKey ? '✓ API 密鑰已就緒' : '⚠ 尚未設定 API Key'}
                        </div>
                      </div>
                    </div>

                    {onOpenAISettings && (
                      <button
                        onClick={onOpenAISettings}
                        className="px-2.5 py-1 rounded-md text-xs font-serif border transition flex items-center gap-1
                          bg-[#f7f3e8] dark:bg-[#202330] hover:bg-[#eee7d5] dark:hover:bg-[#2a2e40]
                          text-[#554d42] dark:text-[#cbd2e1] border-[#d8cfbe] dark:border-[#383d52]"
                      >
                        <Settings className="w-3 h-3 text-[#8d271c] dark:text-[#df756b]" />
                        <span>設定 API</span>
                      </button>
                    )}
                  </div>

                  {!hasKey && (
                    <div className="p-2.5 rounded-lg border text-xs flex items-start gap-2
                      bg-[#fffbeb] dark:bg-[#241e12] border-[#fde68a] dark:border-[#4d3c1b] text-[#92400e] dark:text-[#fcd34d]">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        請先點選右上角「設定 API」，填入您的 Gemini API Key 或 OpenRouter Key，即可無限制開啟宗師級深度解讀。
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Scope Selection */}
            <div className="p-3 rounded-xl border bg-white dark:bg-[#1a1b23] border-[#ded6c5] dark:border-[#2c2e3c] space-y-2">
              <label className="block text-xs font-bold text-[#554e44] dark:text-[#b4aea4]">
                精批範疇選擇：
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setAiScope('full')}
                  className={`p-2.5 rounded-lg border text-center transition font-bold
                    ${aiScope === 'full'
                      ? 'bg-[#8d271c] text-white border-[#701e15] shadow-xs'
                      : 'bg-[#faf7f0] dark:bg-[#14151b] border-[#ded4c1] dark:border-[#2b2d3a] text-[#555] dark:text-[#aaa]'}`}
                >
                  <div>全盤大師深度詳批</div>
                  <div className="text-[10px] font-normal opacity-85 mt-0.5">原局 + 運限 + 八字綜述</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAiScope('palace')}
                  className={`p-2.5 rounded-lg border text-center transition font-bold
                    ${aiScope === 'palace'
                      ? 'bg-[#8d271c] text-white border-[#701e15] shadow-xs'
                      : 'bg-[#faf7f0] dark:bg-[#14151b] border-[#ded4c1] dark:border-[#2b2d3a] text-[#555] dark:text-[#aaa]'}`}
                >
                  <div>當前【{selectedPalace.name}】精解</div>
                  <div className="text-[10px] font-normal opacity-85 mt-0.5">星煞交疊與現代對策</div>
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateAIReading}
              disabled={isAiLoading}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white transition flex items-center justify-center gap-2 shadow-md
                bg-gradient-to-r from-[#8d271c] to-[#a83224] hover:from-[#782017] hover:to-[#912b1f] disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isAiLoading ? 'animate-spin' : ''}`} />
              <span>{isAiLoading ? '大師靈感推演中，請稍候...' : '召喚宗師級 AI 即時解讀'}</span>
            </button>

            {/* Error Message */}
            {aiError && (
              <div className="p-3 rounded-lg border text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900/60">
                {aiError}
              </div>
            )}

            {/* AI Reading Result Display */}
            {aiResult && (
              <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1b23] border-[#ded6c5] dark:border-[#2c2e3c] space-y-3">
                <div className="flex items-center justify-between border-b pb-2 border-[#eee6d7] dark:border-[#262835]">
                  <span className="font-bold text-xs text-[#8d271c] dark:text-[#df756b]">
                    ✦ 宗師解盤批命全文
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1 rounded text-[#777] hover:text-[#222] dark:hover:text-white transition flex items-center gap-1 text-[11px]"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '已複製' : '複製'}</span>
                  </button>
                </div>
                <div className="text-xs text-[#333] dark:text-[#ddd] leading-relaxed whitespace-pre-wrap font-sans">
                  {aiResult}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </aside>
  );
};
