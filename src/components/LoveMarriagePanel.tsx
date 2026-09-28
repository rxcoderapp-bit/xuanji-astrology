import React, { useState } from 'react';
import { Heart, Sparkles, Calendar, ShieldCheck, UserCheck, Flame, Compass } from 'lucide-react';
import type { LoveMarriageAnalysis } from '../types';

interface LoveMarriagePanelProps {
  analysis: LoveMarriageAnalysis;
  selectedYear?: number;
  onSelectYear?: (year: number) => void;
}

export const LoveMarriagePanel: React.FC<LoveMarriagePanelProps> = ({
  analysis,
  selectedYear,
  onSelectYear
}) => {
  const { spouseArchetype, currentYearFortune, timeline, bestYears, overallLoveSummary } = analysis;
  const [expandedYear, setExpandedYear] = useState<number>(selectedYear || currentYearFortune.year);

  const activeYearData = timeline.find(t => t.year === expandedYear) || currentYearFortune;

  return (
    <div className="space-y-4 font-serif text-[#222] dark:text-[#eee]">
      {/* 1. 總覽標題與天命緣分綜述 */}
      <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-[#fff5f5] via-[#fdf8f4] to-[#fff8f6] dark:from-[#211617] dark:via-[#1c191c] dark:to-[#1f1618] border border-[#f3d2d2] dark:border-[#4d292c] shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-full bg-[#fce7e7] dark:bg-[#3d1f23] text-[#e11d48]">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#9f1239] dark:text-[#fb7185]">
              太微緣局 · 宿命正緣與桃花動態應期
            </h3>
            <p className="text-xs text-[#706466] dark:text-[#a89ea0]">
              雙軌合參「八字配偶星與夫妻宮引動」✕「紫微流年鸞喜化祿疊宮」
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-[#4c3f41] dark:text-[#d3c7c9] leading-relaxed pt-1 border-t border-[#f7dede] dark:border-[#382326]">
          {overallLoveSummary}
        </p>
        {bestYears && bestYears.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-2 mt-2 border-t border-[#f7dede] dark:border-[#382326]">
            <span className="text-[11px] font-bold text-[#9f1239] dark:text-[#fb7185] flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> 十年宿命正緣黃金窗口：
            </span>
            {bestYears.map((by, bIdx) => (
              <button
                key={bIdx}
                onClick={() => {
                  setExpandedYear(by.year);
                  if (onSelectYear) onSelectYear(by.year);
                }}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#fff1f2] dark:bg-[#311317] text-[#e11d48] dark:text-[#fb7185] border border-[#fecdd3] dark:border-[#881337] hover:bg-[#ffe4e6] transition cursor-pointer"
              >
                {by.year}年 ({by.stemBranch}) · {by.score}分
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. 伴侶全息畫像 (Spouse Archetype) */}
      <div className="rounded-xl border border-[#e8dfcf] dark:border-[#2f313e] bg-[#fcfaf6] dark:bg-[#16171f] p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#eee5d5] dark:border-[#252733]">
          <div className="flex items-center gap-1.5 text-sm sm:text-base font-bold text-[#8d271c] dark:text-[#df756b]">
            <UserCheck className="w-4 h-4 text-[#8d271c] dark:text-[#df756b]" />
            <span>命定伴侶全息畫像 (Spouse Archetype)</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-[#f3ede3] dark:bg-[#21232d] text-[#7c7161] dark:text-[#a69c8b]">
            配偶星：{spouseArchetype.dayBranchTenGod} · 主星：{spouseArchetype.spouseStars.join('、')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* 性格特質 */}
          <div className="p-2.5 rounded-lg bg-[#f8f5ee] dark:bg-[#1c1d27] border border-[#ece3d4] dark:border-[#2b2c3a]">
            <div className="font-bold text-[#9a3412] dark:text-[#fb923c] mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> 性格神采
            </div>
            <p className="text-[#444] dark:text-[#ccc] leading-relaxed">
              {spouseArchetype.personality}
            </p>
          </div>

          {/* 外貌氣場 */}
          <div className="p-2.5 rounded-lg bg-[#f8f5ee] dark:bg-[#1c1d27] border border-[#ece3d4] dark:border-[#2b2c3a]">
            <div className="font-bold text-[#0369a1] dark:text-[#38bdf8] mb-1 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> 容貌與儀態氣場
            </div>
            <p className="text-[#444] dark:text-[#ccc] leading-relaxed">
              {spouseArchetype.appearanceTraits}
            </p>
          </div>

          {/* 遇見良緣情境 */}
          <div className="p-2.5 rounded-lg bg-[#f8f5ee] dark:bg-[#1c1d27] border border-[#ece3d4] dark:border-[#2b2c3a]">
            <div className="font-bold text-[#15803d] dark:text-[#4ade80] mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> 宿命相遇機緣
            </div>
            <p className="text-[#444] dark:text-[#ccc] leading-relaxed">
              {spouseArchetype.meetingScenarios}
            </p>
          </div>

          {/* 相處長久心法 */}
          <div className="p-2.5 rounded-lg bg-[#f8f5ee] dark:bg-[#1c1d27] border border-[#ece3d4] dark:border-[#2b2c3a]">
            <div className="font-bold text-[#7c2d12] dark:text-[#ea580c] mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 和睦相處長久錦囊
            </div>
            <p className="text-[#444] dark:text-[#ccc] leading-relaxed">
              {spouseArchetype.harmonyTips}
            </p>
          </div>
        </div>
      </div>

      {/* 3. 未來十年正緣桃花黃金時空軸 */}
      <div className="rounded-xl border border-[#e8dfcf] dark:border-[#2f313e] bg-[#fcfaf6] dark:bg-[#16171f] p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#eee5d5] dark:border-[#252733]">
          <div className="flex items-center gap-1.5 text-sm sm:text-base font-bold text-[#8d271c] dark:text-[#df756b]">
            <Flame className="w-4 h-4 text-[#e11d48]" />
            <span>未來 10 年正緣與桃花黃金時空波形 (Love Timeline)</span>
          </div>
          <span className="text-[11px] text-[#7c7161] dark:text-[#a69c8b]">
            點選年份查閱雙軌引動詳解
          </span>
        </div>

        {/* 橫向滑動/網格年份卡片 */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
          {timeline.map(item => {
            const isSelected = item.year === expandedYear;
            const isTrueLove = item.type === 'true_love';
            const isPeach = item.type === 'peach_blossom';
            const isClash = item.type === 'karmic_test';

            let borderStyle = 'border-[#e4dac6] dark:border-[#2d2f3d] bg-white dark:bg-[#1a1b24]';
            if (isSelected) {
              borderStyle = 'ring-2 ring-[#e11d48] border-transparent bg-[#fff5f6] dark:bg-[#2b181c]';
            } else if (isTrueLove) {
              borderStyle = 'border-[#fda4af] dark:border-[#881337] bg-[#fff8f8] dark:bg-[#231518]';
            } else if (isPeach) {
              borderStyle = 'border-[#fed7aa] dark:border-[#7c2d12] bg-[#fffaf5] dark:bg-[#241a15]';
            }

            return (
              <button
                key={item.year}
                onClick={() => {
                  setExpandedYear(item.year);
                  if (onSelectYear) onSelectYear(item.year);
                }}
                className={`p-2 rounded-lg border text-left transition-all duration-200 cursor-pointer ${borderStyle}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs sm:text-sm text-[#333] dark:text-[#eee]">
                    {item.year}
                  </span>
                  <span className="text-[10px] font-mono text-[#777] dark:text-[#999]">
                    {item.stemBranch}
                  </span>
                </div>
                <div className="text-[10px] font-semibold truncate mb-1">
                  {isTrueLove && <span className="text-[#e11d48] dark:text-[#fb7185]">⭐⭐⭐⭐⭐ 正緣</span>}
                  {isPeach && <span className="text-[#ea580c] dark:text-[#fb923c]">⭐⭐⭐⭐ 桃花</span>}
                  {isClash && <span className="text-[#d97706] dark:text-[#f59e0b]">⚠️ 磨合防波</span>}
                  {!isTrueLove && !isPeach && !isClash && <span className="text-[#65a30d] dark:text-[#84cc16]">🌱 靜好</span>}
                </div>
                <div className="w-full bg-[#eee] dark:bg-[#2a2c3a] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isTrueLove ? 'bg-gradient-to-r from-[#f43f5e] to-[#e11d48]' :
                      isPeach ? 'bg-gradient-to-r from-[#fb923c] to-[#ea580c]' :
                      isClash ? 'bg-[#d97706]' : 'bg-[#84cc16]'
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* 選中年度深度破譯卡片 */}
        <div className="p-3 sm:p-4 rounded-xl border border-[#f0dfd8] dark:border-[#38262a] bg-[#fffbf9] dark:bg-[#1b171c]">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-[#f5eae5] dark:border-[#2d2226]">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-[#9f1239] dark:text-[#fb7185]">
                {activeYearData.year}年（{activeYearData.stemBranch}年）婚戀緣分精析
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#ffe4e6] dark:bg-[#4c0519] text-[#be123c] dark:text-[#fda4af]">
                {activeYearData.badge} · 緣分指數 {activeYearData.score} 分
              </span>
            </div>
            <div className="text-xs text-[#706466] dark:text-[#a89ea0]">
              命主虛歲：約 {activeYearData.nominalAge} 歲
            </div>
          </div>

          <h4 className="text-sm font-bold text-[#333] dark:text-[#eee] mb-1.5">
            {activeYearData.title}
          </h4>

          <p className="text-xs sm:text-sm text-[#4c3f41] dark:text-[#d3c7c9] leading-relaxed mb-3">
            {activeYearData.summary}
          </p>

          {/* 雙軌觸發標籤清單 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            <div className="p-2 rounded bg-white dark:bg-[#15161f] border border-[#f0e4df] dark:border-[#282936] text-[11px]">
              <div className="font-bold text-[#be123c] dark:text-[#fb7185] mb-1">
                ✦ 子平八字天元觸發徵兆
              </div>
              {activeYearData.baziSigns.length > 0 ? (
                <ul className="space-y-0.5 text-[#555] dark:text-[#bbb] list-disc list-inside">
                  {activeYearData.baziSigns.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-[#888]">本年八字歲運平穩，無強烈正偏配偶星引動。</div>
              )}
            </div>

            <div className="p-2 rounded bg-white dark:bg-[#15161f] border border-[#f0e4df] dark:border-[#282936] text-[11px]">
              <div className="font-bold text-[#0369a1] dark:text-[#38bdf8] mb-1">
                ✦ 紫微斗數流年宮曜觸發徵兆
              </div>
              {activeYearData.ziweiSigns.length > 0 ? (
                <ul className="space-y-0.5 text-[#555] dark:text-[#bbb] list-disc list-inside">
                  {activeYearData.ziweiSigns.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-[#888]">流年夫妻宮吉煞平衝，氣運循序漸進。</div>
              )}
            </div>
          </div>

          {/* 錦囊指引 */}
          <div className="p-2.5 rounded-lg bg-[#fff1f2] dark:bg-[#2b1219] border border-[#fecdd3] dark:border-[#521325] text-xs">
            <span className="font-bold text-[#9f1239] dark:text-[#fb7185]">💡 宗師通玄情緣錦囊：</span>
            <span className="text-[#4c3f41] dark:text-[#e7d7db] ml-1">{activeYearData.advice}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
