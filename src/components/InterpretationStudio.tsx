import React, { useState } from 'react';
import { 
  Sparkles, Compass, Award, 
  Briefcase, DollarSign, 
  Layers, BookOpen, Clock,
  Bot, Copy, Check, RotateCw, Settings, AlertCircle
} from 'lucide-react';
import type { PalaceData, HoroscopeState, BaziData, SanFangSiZheng } from '../types';
import { 
  generatePalaceAnalysis, 
  MAJOR_STAR_DESCRIPTIONS, 
  MUTAGEN_MEANINGS 
} from '../lib/interpreter';
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
  onOpenAISettings
}) => {
  const [activeTab, setActiveTab] = useState<'palace' | 'horoscope' | 'natal' | 'bazi' | 'ai'>('palace');
  const [aiScope, setAiScope] = useState<'full' | 'palace'>('full');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const analysis = generatePalaceAnalysis(selectedPalace, allPalaces, sanFang, horoscope);

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
    <aside className="w-full lg:w-[480px] xl:w-[520px] shrink-0 flex flex-col font-serif rounded-2xl border shadow-lg overflow-hidden transition-all duration-200
      bg-[#fcfbf7] dark:bg-[#16171f] border-[#dcd3c1] dark:border-[#2b2d3b] text-[#222] dark:text-[#eee]">
      
      {/* Studio Header */}
      <div className="px-5 py-3.5 border-b flex items-center justify-between
        bg-[#f6f2e8] dark:bg-[#1b1c24] border-[#e2d9c8] dark:border-[#2a2c3a]">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#8d271c] dark:text-[#df756b]" />
          <h2 className="font-bold text-base tracking-wide text-[#2b2723] dark:text-[#f2efe9]">
            玄璣動態智能解盤室
          </h2>
        </div>
        <span className="text-xs px-2 py-0.5 rounded border text-[#8d271c] dark:text-[#df756b] font-semibold
          bg-[#f8edea] dark:bg-[#281c1b] border-[#e8cdc6] dark:border-[#422924]">
          當前聚焦：{selectedPalace.name} ({selectedPalace.heavenlyStem}{selectedPalace.earthlyBranch})
        </span>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b text-xs font-bold overflow-x-auto scrollbar-none
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
              className={`flex-1 py-2.5 px-2.5 whitespace-nowrap transition border-b-2
                ${isActive
                  ? isAI
                    ? 'border-[#8d271c] text-[#8d271c] dark:border-[#df756b] dark:text-[#df756b] bg-[#fcfbf7] dark:bg-[#16171f]'
                    : 'border-[#8d271c] text-[#8d271c] dark:border-[#df756b] dark:text-[#df756b] bg-[#fcfbf7] dark:bg-[#16171f]'
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
      <div className="flex-1 p-5 overflow-y-auto space-y-6 text-sm leading-relaxed max-h-[750px] scrollbar-thin">
        
        {/* ==================== TAB 1: 選宮精批 ==================== */}
        {activeTab === 'palace' && (
          <div className="space-y-5">
            
            {/* 1. Palace Secular Essence */}
            <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1b23] border-[#ded6c5] dark:border-[#2c2e3c]">
              <div className="flex items-center gap-2 mb-2">
                <Compass className="w-4 h-4 text-[#8d271c] dark:text-[#df756b]" />
                <h3 className="font-bold text-sm text-[#2b2723] dark:text-[#f2efe9]">
                  {selectedPalace.name}之世俗核心意涵
                </h3>
              </div>
              <p className="text-xs text-[#554e44] dark:text-[#b4aea4] mb-2 leading-relaxed">
                {analysis.secular.core}。{analysis.secular.scope}
              </p>
              <div className="p-2.5 rounded-lg bg-[#f7f4ec] dark:bg-[#20222d] border border-[#e8dfcf] dark:border-[#313444] text-xs">
                <span className="font-bold text-[#8d271c] dark:text-[#df756b]">現代人生叩問：</span>
                <span className="text-[#444] dark:text-[#ccc]">{analysis.secular.reflectionQuestion}</span>
              </div>
            </div>

            {/* 2. Major Stars & Dual Star Reactions */}
            <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1b23] border-[#ded6c5] dark:border-[#2c2e3c] space-y-3">
              <div className="flex items-center justify-between border-b pb-2 border-[#eee6d7] dark:border-[#262835]">
                <h3 className="font-bold text-sm text-[#8d271c] dark:text-[#df756b] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  主星組合與氣場化學反應
                </h3>
                <span className="text-xs text-[#8c8477] dark:text-[#888]">
                  {selectedPalace.majorStars.length > 0 ? `${selectedPalace.majorStars.length} 顆主星入宮` : '借對宮照臨'}
                </span>
              </div>

              {/* Dual Star Matching */}
              {analysis.dualMatch && (
                <div className="p-3 rounded-lg bg-[#fbf5eb] dark:bg-[#261f18] border border-[#ecdac0] dark:border-[#473420]">
                  <div className="font-bold text-xs text-[#b85d18] dark:text-[#e58a44] mb-1">
                    ✦ {analysis.dualMatch.title}
                  </div>
                  <p className="text-xs text-[#52493d] dark:text-[#cfc5b6]">
                    {analysis.dualMatch.desc}
                  </p>
                </div>
              )}

              {/* Individual Major Stars details */}
              {selectedPalace.majorStars.map((star, sIdx) => {
                const desc = MAJOR_STAR_DESCRIPTIONS[star.name];
                return (
                  <div key={sIdx} className="space-y-1.5 pt-1.5 border-t first:border-t-0 border-[#f0e8db] dark:border-[#242633]">
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
                      <div className="text-xs text-[#554e44] dark:text-[#b4aea4] space-y-1">
                        <p><b className="text-[#333] dark:text-[#ddd]">星情本質：</b>{desc.personality}</p>
                        <p><b className="text-[#333] dark:text-[#ddd]">職場事業：</b>{desc.career}</p>
                        <p><b className="text-[#333] dark:text-[#ddd]">財利物質：</b>{desc.wealth}</p>
                      </div>
                    )}
                  </div>
                );
              })}

              {selectedPalace.majorStars.length === 0 && (
                <div className="text-xs text-[#6e675b] dark:text-[#a8a195] space-y-2">
                  <p>
                    本宮為<b>空宮 (無主星)</b>，在紫微斗數中代表在此生活面向的自主性較弱、對外在環境極為敏感，容易隨周遭人事物而順應調整。
                  </p>
                  <p>
                    排盤規則須<b>「借對宮【{analysis.oppositePalace.name}】之主星 ({analysis.oppositePalace.stars.join('、') || '亦空'})」</b>作為主要的思考邏輯與能量參照。
                  </p>
                </div>
              )}
            </div>

            {/* 3. Mutagens & Self Mutagens */}
            <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1b23] border-[#ded6c5] dark:border-[#2c2e3c] space-y-2.5">
              <h3 className="font-bold text-sm text-[#275c8d] dark:text-[#4fa3e3] flex items-center gap-1.5 border-b pb-2 border-[#eee6d7] dark:border-[#262835]">
                <Layers className="w-4 h-4" />
                四化引動與宮干自化能量
              </h3>

              {/* Natal Mutagens in Palace */}
              {selectedPalace.majorStars.filter(s => s.mutagen).map((s, idx) => {
                const mutInfo = (MUTAGEN_MEANINGS as Record<string, any>)[s.mutagen || ''];
                return (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#edf4f9] dark:bg-[#17222c] border border-[#d2e3f0] dark:border-[#273d52] text-xs">
                    <span className="font-bold text-[#275c8d] dark:text-[#64b5f6]">
                      【生年化{s.mutagen} · {s.name}】
                    </span>
                    <p className="mt-1 text-[#334155] dark:text-[#94a3b8]">{mutInfo?.character}：{mutInfo?.effect}</p>
                    <p className="mt-0.5 text-[#991b1b] dark:text-[#f87171]">{mutInfo?.warning}</p>
                  </div>
                );
              })}

              {/* Self Mutagens */}
              <div className="text-xs text-[#554e44] dark:text-[#b4aea4]">
                <b className="text-[#79287c] dark:text-[#ce7fe2]">宮干自化現象：</b>
                <span>{analysis.selfMutagenText}</span>
                {selectedPalace.selfMutagens.length > 0 && (
                  <p className="mt-1 text-[11px] text-[#70685c] dark:text-[#888]">
                    自化代表該宮位對外釋放或自我消化的特殊動能，易有不穩定、轉折或大開大合之現象。
                  </p>
                )}
              </div>
            </div>

            {/* 4. SanFangSiZheng Cross Radiation */}
            <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1b23] border-[#ded6c5] dark:border-[#2c2e3c] space-y-2.5">
              <h3 className="font-bold text-sm text-[#1b7a4f] dark:text-[#4ade80] flex items-center gap-1.5 border-b pb-2 border-[#eee6d7] dark:border-[#262835]">
                <Compass className="w-4 h-4" />
                三方四正照會氣場連線
              </h3>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-[#f5f9f6] dark:bg-[#17241b] border border-[#d6ebd9] dark:border-[#25422d]">
                  <div className="font-bold text-[#1b7a4f] dark:text-[#4ade80] mb-0.5">
                    對宮沖照：【{analysis.oppositePalace.name}】
                  </div>
                  <div className="text-[#555] dark:text-[#bbb] truncate">
                    星曜：{analysis.oppositePalace.stars.join('、') || '無主星'}
                  </div>
                  <div className="text-[10px] text-[#777] dark:text-[#888] mt-1">
                    代表外在鏡像投射與外部直接環境之挑戰考驗。
                  </div>
                </div>

                <div className="p-2 rounded bg-[#f5f9f6] dark:bg-[#17241b] border border-[#d6ebd9] dark:border-[#25422d]">
                  <div className="font-bold text-[#1b7a4f] dark:text-[#4ade80] mb-0.5">
                    三合拱會：【{analysis.trines.map(t => t.name).join('、')}】
                  </div>
                  <div className="text-[#555] dark:text-[#bbb] truncate">
                    星曜：{analysis.trines.flatMap(t => t.stars).join('、') || '無主星'}
                  </div>
                  <div className="text-[10px] text-[#777] dark:text-[#888] mt-1">
                    代表同氣相求之內在資源與事業資金鏈之支撐。
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Modern Actionable Advice */}
            <div className="p-4 rounded-xl border bg-[#fcf8f0] dark:bg-[#1f1e18] border-[#ebdcc4] dark:border-[#383320] space-y-2">
              <h3 className="font-bold text-sm text-[#9c5914] dark:text-[#e59b3f] flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                現代世俗落地決策指南
              </h3>
              <ul className="text-xs text-[#524634] dark:text-[#c4b9a5] space-y-1.5 list-disc list-inside">
                <li>
                  <b>認知盲點防範：</b>切忌在{selectedPalace.name}所涉及之決策中感情用事，需建立客觀之量化檢視指標。
                </li>
                <li>
                  <b>能量轉化契機：</b>若逢煞星（羊陀火鈴空劫），宜主動將其衝撞力轉化為技術研發、破局開拓或獨立鑽研之驅動力。
                </li>
                <li>
                  <b>人際應對心法：</b>在與此宮位對應之人物（如伴侶、夥伴、部屬或長輩）相處時，多以傾聽代替主導，留白即是圓融。
                </li>
              </ul>
            </div>

          </div>
        )}

        {/* ==================== TAB 2: 時運走勢 ==================== */}
        {activeTab === 'horoscope' && (
          <div className="space-y-4">
            
            {/* Decade reading */}
            <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1b23] border-[#ded6c5] dark:border-[#2c2e3c] space-y-2.5">
              <div className="flex items-center justify-between border-b pb-2 border-[#eee6d7] dark:border-[#262835]">
                <h3 className="font-bold text-sm text-[#2a5d7c] dark:text-[#64b5f6] flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  大限十年人生主軸 ({horoscope.decadalInfo?.ageRange[0]}~{horoscope.decadalInfo?.ageRange[1]}歲)
                </h3>
                <span className="text-xs font-mono font-bold text-[#8d271c] dark:text-[#df756b]">
                  {horoscope.decadalInfo?.stem}{horoscope.decadalInfo?.branch}大限
                </span>
              </div>

              <p className="text-xs text-[#554e44] dark:text-[#b4aea4] leading-relaxed">
                當前大限命宮重疊本命<b>【{horoscope.decadalInfo?.name}】</b>。這十年的人生焦點將集中在該領域之拓展、價值重構與自我淬鍊。
              </p>

              {horoscope.decadalInfo?.mutagens && horoscope.decadalInfo.mutagens.length > 0 && (
                <div className="p-2.5 rounded-lg bg-[#f0f6fa] dark:bg-[#15222b] text-xs space-y-1">
                  <span className="font-bold text-[#2a5d7c] dark:text-[#64b5f6]">大限四化時空引動：</span>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {horoscope.decadalInfo.mutagens.map((m, idx) => (
                      <span key={idx} className="text-[#334155] dark:text-[#94a3b8]">
                        大限化{m.mutagen}：<b>{m.star}</b>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Yearly reading */}
            <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1b23] border-[#ded6c5] dark:border-[#2c2e3c] space-y-2.5">
              <div className="flex items-center justify-between border-b pb-2 border-[#eee6d7] dark:border-[#262835]">
                <h3 className="font-bold text-sm text-[#8d271c] dark:text-[#df756b] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  流年歲君重點引動 ({horoscope.selectedYear}年 · 虛歲 {horoscope.yearlyInfo?.nominalAge}歲)
                </h3>
                <span className="text-xs font-mono font-bold text-[#8d271c] dark:text-[#df756b]">
                  {horoscope.yearlyInfo?.stem}{horoscope.yearlyInfo?.branch}年
                </span>
              </div>

              <div className="text-xs text-[#554e44] dark:text-[#b4aea4] space-y-2 leading-relaxed">
                <p>
                  流年命宮疊入地支<b>【{horoscope.yearlyInfo?.branch}】</b>位。歲君如君臨天下，引發本年度具體的世俗事件與際遇。
                </p>
                
                {horoscope.yearlyInfo?.mutagens && horoscope.yearlyInfo.mutagens.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-[#fdf2f0] dark:bg-[#2b1715] border border-[#f5d0cc] dark:border-[#4d211c] space-y-1.5">
                    <span className="font-bold text-[#8d271c] dark:text-[#df756b]">歲君吉凶風向指標：</span>
                    {horoscope.yearlyInfo.mutagens.map((m, idx) => (
                      <div key={idx} className="flex items-start gap-1">
                        <span className="font-bold text-[#b83426] dark:text-[#f87171] min-w-[50px]">
                          流{m.mutagen}【{m.star}】：
                        </span>
                        <span className="text-[#444] dark:text-[#ccc]">
                          {m.mutagen === '祿' && '主今年求財與機遇之泉源，宜主動出擊抓取紅利。'}
                          {m.mutagen === '權' && '主今年在職權、專案主導與競爭中宜大膽決策。'}
                          {m.mutagen === '科' && '主今年適合考證、提昇聲譽、拓展貴人人脈。'}
                          {m.mutagen === '忌' && '主今年風險暗礁所在，凡事忌冒進、投機或盲目擔保。'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 3: 原局格局 ==================== */}
        {activeTab === 'natal' && (
          <div className="space-y-4">
            
            <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1b23] border-[#ded6c5] dark:border-[#2c2e3c] space-y-2.5">
              <h3 className="font-bold text-sm text-[#8d271c] dark:text-[#df756b] border-b pb-2 border-[#eee6d7] dark:border-[#262835]">
                命宮 · 身宮 · 來因宮 · 三位一體底層架構
              </h3>
              <div className="text-xs text-[#554e44] dark:text-[#b4aea4] space-y-2 leading-relaxed">
                <p>
                  <b>✦ 命主【{soul}】· 身主【{body}】：</b>
                  命主象徵先天之靈魂底色與行事風度；身主掌握後天之中晚年歸宿與身體力行之重心。
                </p>
                <p>
                  <b>✦ 五行局【{fiveElementsClass}】：</b>
                  水二局智巧多變、木三局仁德生發、金四局義薄剛烈、土五局敦厚含蓄、火六局明快熱烈。五行之局為星盤運限排佈之起點。
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border bg-[#fbf9f4] dark:bg-[#181921] border-[#ded4c1] dark:border-[#2f313f]">
                <div className="font-bold text-[#2a5d7c] dark:text-[#64b5f6] mb-1 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" /> 官祿與事業格局
                </div>
                <p className="text-[#555] dark:text-[#bbb] text-[11px] leading-relaxed">
                  命宮與官祿宮交互輝映，若得吉星朝照，具備卓越專業壁壘與統御之能。
                </p>
              </div>

              <div className="p-3 rounded-lg border bg-[#fbf9f4] dark:bg-[#181921] border-[#ded4c1] dark:border-[#2f313f]">
                <div className="font-bold text-[#b85d18] dark:text-[#e58a44] mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> 財帛與資產蓄積
                </div>
                <p className="text-[#555] dark:text-[#bbb] text-[11px] leading-relaxed">
                  財帛宮掌管現金流轉，田宅宮掌管資產沉澱，兩相呼應方能富貴雙全。
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 4: 八字印證 ==================== */}
        {activeTab === 'bazi' && (
          <div className="space-y-4">
            
            <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1b23] border-[#ded6c5] dark:border-[#2c2e3c] space-y-2.5">
              <h3 className="font-bold text-sm text-[#1b7a4f] dark:text-[#4ade80] border-b pb-2 border-[#eee6d7] dark:border-[#262835]">
                子平八字日主能量與喜忌印證
              </h3>
              
              <div className="text-xs text-[#554e44] dark:text-[#b4aea4] space-y-2 leading-relaxed">
                <p>
                  <b>日主天干：【{bazi.dayMaster}】</b>，在四柱八字中評定為<b>【{bazi.dayMasterStrength}】</b>之局。
                </p>
                <div className="p-2.5 rounded-lg bg-[#f4faf5] dark:bg-[#152419] border border-[#d6ebd9] dark:border-[#223d29] text-[11px]">
                  <span className="font-bold text-[#1b7a4f] dark:text-[#4ade80]">五行調候與中庸原則：</span>
                  <p className="mt-0.5 text-[#334155] dark:text-[#94a3b8]">
                    日主過旺者宜剋洩耗（食傷、財星、官殺），日主過弱者宜生扶（印星、比劫）。
                    紫微命盤中之星曜五行，恰與八字喜用神產生微觀共振，同氣相求者吉象更顯。
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1b23] border-[#ded6c5] dark:border-[#2c2e3c] space-y-2">
              <h3 className="font-bold text-xs text-[#70685c] dark:text-[#999285]">
                大運序列起運年限表
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-xs">
                {bazi.dayunList.slice(0, 8).map((dy, idx) => (
                  <div key={idx} className="p-1.5 rounded bg-[#f7f4ec] dark:bg-[#1d1f27] border border-[#e8dfcf] dark:border-[#2e313f]">
                    <div className="text-[10px] text-[#888]">{dy.age}</div>
                    <div className="font-bold text-[#8d271c] dark:text-[#df756b]">{dy.ganZhi}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 5: AI 大師精批 ==================== */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            
            {/* AI Provider & Settings Banner */}
            {(() => {
              const aiSettings = getStoredAISettings();
              const hasKey = aiSettings.provider === 'gemini' ? !!aiSettings.geminiApiKey : !!aiSettings.openrouterApiKey;
              const providerName = aiSettings.provider === 'gemini' ? 'Google Gemini' : 'OpenRouter';
              const modelName = aiSettings.provider === 'gemini' ? aiSettings.geminiModel : aiSettings.openrouterModel;

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

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleGenerateAIReading}
                disabled={isAiLoading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition border shadow-sm
                  bg-[#8d271c] hover:bg-[#782017] text-white border-[#701e15] disabled:opacity-50"
              >
                {isAiLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-white" />
                    <span>大師正在運算推衍中... 請稍候</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#fcd34d]" />
                    <span>召喚 AI 宗師深度解讀 ({aiScope === 'full' ? '全局批命' : selectedPalace.name})</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {aiError && (
              <div className="p-3 rounded-xl border text-xs flex items-start gap-2.5
                bg-[#fef2f2] dark:bg-[#261515] border-[#fecaca] dark:border-[#4d2424] text-[#991b1b] dark:text-[#f87171]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold mb-0.5">解盤請求異常</div>
                  <div>{aiError}</div>
                </div>
              </div>
            )}

            {/* AI Reading Output Display */}
            {aiResult && (
              <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1b23] border-[#ded6c5] dark:border-[#2c2e3c] space-y-3">
                <div className="flex items-center justify-between border-b pb-2.5 border-[#eee6d7] dark:border-[#262835]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#d97706]" />
                    <h3 className="font-bold text-sm text-[#8d271c] dark:text-[#df756b]">
                      AI 宗師精批解卦錄
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 px-2.5 py-1 rounded text-xs border transition
                        bg-[#f7f3e8] dark:bg-[#202330] hover:bg-[#eee7d5] dark:hover:bg-[#2a2e40]
                        text-[#554d42] dark:text-[#cbd2e1] border-[#d8cfbe] dark:border-[#383d52]"
                      title="複製解盤全文"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-green-600 font-bold">已複製</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>複製全文</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Formatted Text Content */}
                <div className="text-xs leading-relaxed font-sans space-y-3 text-[#332f2b] dark:text-[#dcd6cc] whitespace-pre-wrap">
                  {aiResult}
                </div>
              </div>
            )}

            {/* Empty placeholder guide */}
            {!aiResult && !isAiLoading && (
              <div className="p-5 rounded-xl border border-dashed text-center space-y-2
                bg-[#faf7f0]/60 dark:bg-[#15161c]/60 border-[#d8d0bf] dark:border-[#2d3040]">
                <Bot className="w-8 h-8 mx-auto text-[#8d271c]/60 dark:text-[#df756b]/60" />
                <div className="font-bold text-xs text-[#443e37] dark:text-[#d0cbbf]">
                  融合古法中州三合、欽天四化與子平八字
                </div>
                <p className="text-[11px] text-[#797268] dark:text-[#908b83] leading-relaxed max-w-sm mx-auto">
                  支援 Google Gemini 2.0 Flash 及 OpenRouter 旗艦模型（DeepSeek R1、Claude 3.5 Sonnet）。提供非制式、深刻通透的人生命運剖析與現代處世決策建議。
                </p>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Studio Footer Disclaimer */}
      <div className="px-5 py-2.5 border-t text-[11px] text-[#8c8477] dark:text-[#78746c] text-center
        bg-[#f6f2e8] dark:bg-[#1b1c24] border-[#e2d9c8] dark:border-[#2a2c3a]">
        傳統五術命理框架 · 著重現代心性引導與知命造運
      </div>

    </aside>
  );
};
