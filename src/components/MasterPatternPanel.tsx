import React, { useMemo } from 'react';
import { 
  Compass, CheckCircle2, Flame, Award, Brain
} from 'lucide-react';
import type { PalaceData, HoroscopeState } from '../types';
import { analyzeMasterPatterns } from '../lib/masterPatternEngine';

interface MasterPatternPanelProps {
  palaces: PalaceData[];
  horoscope?: HoroscopeState;
  onSelectPalace?: (index: number) => void;
}

export const MasterPatternPanel: React.FC<MasterPatternPanelProps> = ({
  palaces,
  horoscope,
  onSelectPalace
}) => {
  const patternResult = useMemo(() => {
    return analyzeMasterPatterns(palaces, horoscope);
  }, [palaces, horoscope]);

  const { detectedPatterns, luSuiJiZou, overallBreakthroughSummary } = patternResult;

  const auspiciousPatterns = detectedPatterns.filter(p => p.category === 'auspicious');
  const challengingPatterns = detectedPatterns.filter(p => p.category === 'challenging');
  const specialPatterns = detectedPatterns.filter(p => p.category === 'special');

  return (
    <div className="space-y-6 animate-fade-in text-xs sm:text-sm">
      
      {/* 1. Header Banner & Summary */}
      <div className="p-4 sm:p-5 rounded-2xl border bg-gradient-to-br from-[#faf6ed] to-[#f4ece0] dark:from-[#1b1c26] dark:to-[#14151e] border-[#ded4c0] dark:border-[#2d3042] space-y-3 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#8d271c] text-white">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#2b2723] dark:text-[#f2efe9]">
                紫微 38 格局破局與吉化改運全鑑
              </h3>
              <p className="text-[11px] text-[#706456] dark:text-[#a09a8f]">
                原典依據：《紫微格局改運心法》· 破除宿命觀，以現代心理動力學解構人生棋局
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
              吉格 {auspiciousPatterns.length}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/40">
              破局考驗格 {challengingPatterns.length}
            </span>
            {specialPatterns.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300/40">
                特殊格 {specialPatterns.length}
              </span>
            )}
          </div>
        </div>

        <p className="text-xs leading-relaxed text-[#554e44] dark:text-[#b4aea4] border-t pt-2.5 border-[#e8ded0] dark:border-[#252838]">
          {overallBreakthroughSummary}
        </p>
      </div>

      {/* 2. 祿隨忌走心理動力學專題診斷卡 */}
      {luSuiJiZou && (
        <div className="p-4 sm:p-5 rounded-2xl border bg-gradient-to-br from-[#fdfbf7] via-[#f7f2e7] to-[#efe7d8] dark:from-[#191b26] dark:via-[#161722] dark:to-[#13141b] border-[#ded3be] dark:border-[#2f3246] space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between border-b pb-2.5 border-[#e5dcce] dark:border-[#282a39]">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#8d271c] dark:text-[#ef5350]" />
              <h4 className="font-bold text-xs sm:text-sm text-[#8d271c] dark:text-[#ef5350]">
                【祿隨忌走】現代心理動力學深層解構
              </h4>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-[#8d271c]/10 text-[#8d271c] dark:text-[#ef5350] font-bold">
              核心心理代償機制
            </span>
          </div>

          {/* Dual Core Cards: Ji (Void) vs Lu (Projection) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Left: 化忌黑洞 */}
            <div className="p-3 rounded-xl bg-white dark:bg-[#1a1b24] border border-[#e6dcce] dark:border-[#2c2f40] space-y-1.5">
              <div className="flex items-center justify-between font-bold text-rose-700 dark:text-rose-400">
                <span className="flex items-center gap-1">
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300">
                    化忌黑洞
                  </span>
                  <span>【{luSuiJiZou.jiPalace.name}】({luSuiJiZou.jiPalace.star}化忌)</span>
                </span>
                {onSelectPalace && (
                  <button 
                    onClick={() => onSelectPalace(luSuiJiZou.jiPalace.index)}
                    className="text-[10px] text-[#777] hover:text-[#8d271c] underline"
                  >
                    定位此宮
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#666] dark:text-[#aaa] leading-relaxed">
                <span className="font-bold text-[#444] dark:text-[#ddd]">核心焦慮盲區：</span>
                {luSuiJiZou.jiPalace.psychologicalVoid}
              </p>
            </div>

            {/* Right: 化祿代償 */}
            <div className="p-3 rounded-xl bg-white dark:bg-[#1a1b24] border border-[#e6dcce] dark:border-[#2c2f40] space-y-1.5">
              <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-400">
                <span className="flex items-center gap-1">
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                    過度代償
                  </span>
                  <span>【{luSuiJiZou.luPalace.name}】({luSuiJiZou.luPalace.star}化祿)</span>
                </span>
                {onSelectPalace && (
                  <button 
                    onClick={() => onSelectPalace(luSuiJiZou.luPalace.index)}
                    className="text-[10px] text-[#777] hover:text-[#8d271c] underline"
                  >
                    定位此宮
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#666] dark:text-[#aaa] leading-relaxed">
                <span className="font-bold text-[#444] dark:text-[#ddd]">向外索求慾望：</span>
                {luSuiJiZou.luPalace.desireProjection}
              </p>
            </div>
          </div>

          {/* Interplay Explanation */}
          <div className="p-3 rounded-xl bg-white/70 dark:bg-[#181922] border border-[#ded5c3] dark:border-[#292c3c] text-xs leading-relaxed text-[#554e44] dark:text-[#b4aea4]">
            {luSuiJiZou.interplaySummary}
          </div>

          {/* Dual Remedies: Ke (Cognition) & Quan (Action) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-900/40 text-sky-900 dark:text-sky-200 leading-relaxed text-[11px]">
              {luSuiJiZou.keRationalBoundary}
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 leading-relaxed text-[11px]">
              {luSuiJiZou.quanExecutionPower}
            </div>
          </div>
        </div>
      )}

      {/* 3. Detailed Pattern Cards List */}
      <div className="space-y-4">
        <h4 className="font-bold text-xs sm:text-sm text-[#333] dark:text-[#ddd] flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-[#8d271c]" />
          <span>所入格局詳析與破局指南 ({detectedPatterns.length})</span>
        </h4>

        {detectedPatterns.length === 0 ? (
          <div className="p-6 rounded-xl border text-center text-xs text-[#777] bg-white dark:bg-[#1a1b24] border-[#ded4c1] dark:border-[#282a3a]">
            當前盤面星曜結構平順均衡，未出現極端偏枯之重凶格或重吉大格，行事順應流年大限即可穩步向前。
          </div>
        ) : (
          <div className="space-y-4">
            {detectedPatterns.map(pattern => (
              <div 
                key={pattern.id}
                className="p-4 sm:p-5 rounded-2xl border bg-white dark:bg-[#191a24] border-[#ded5c3] dark:border-[#2a2c3d] space-y-3 shadow-xs hover:border-[#8d271c]/40 transition"
              >
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-2 border-b pb-2.5 border-[#eee6d6] dark:border-[#262837]">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      pattern.category === 'auspicious' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300' 
                        : pattern.category === 'challenging'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300'
                    }`}>
                      {pattern.categoryLabel}
                    </span>
                    <h5 className="font-bold text-sm sm:text-base text-[#222] dark:text-[#eee]">
                      【{pattern.name}】
                    </h5>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#777] dark:text-[#aaa]">
                      坐落：{pattern.palaceName}
                    </span>
                    {onSelectPalace && (
                      <button 
                        onClick={() => onSelectPalace(pattern.palaceIndex)}
                        className="px-2 py-0.5 rounded border text-[10px] text-[#8d271c] dark:text-[#ef5350] border-[#8d271c]/30 hover:bg-[#8d271c]/5"
                      >
                        檢視此宮
                      </button>
                    )}
                  </div>
                </div>

                {/* Classical Quote */}
                <div className="text-[11px] italic text-[#8d271c] dark:text-[#ef5350] bg-[#faf6ee] dark:bg-[#14151b] p-2 rounded-lg border border-[#eee4d4] dark:border-[#232532]">
                  {pattern.classicalQuote}
                </div>

                {/* Modern Psychology Analysis */}
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-[#443e37] dark:text-[#cfc8bd]">
                    ✦ 現代心理機制與行為特質：
                  </div>
                  <p className="text-[#555] dark:text-[#bbb] leading-relaxed">
                    {pattern.modernPsychology}
                  </p>
                </div>

                {/* Breakthrough Strategy */}
                <div className="p-3 rounded-xl bg-[#fdf8f0] dark:bg-[#1a1b26] border border-[#e8dfcb] dark:border-[#2b2d3e] space-y-1 text-xs">
                  <div className="font-bold text-[#b45309] dark:text-[#f59e0b] flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>大師級破局立業與吉化改運方針：</span>
                  </div>
                  <p className="text-[#554e44] dark:text-[#aba498] leading-relaxed">
                    {pattern.breakthroughAdvice}
                  </p>
                </div>

                {/* Action Checklist */}
                {pattern.actionGuidance.length > 0 && (
                  <div className="space-y-1.5 text-xs pt-1">
                    <div className="font-bold text-[#2e7d32] dark:text-[#81c784] text-[11px]">
                      具體落地行動清單 (Action Checklist)：
                    </div>
                    <div className="space-y-1">
                      {pattern.actionGuidance.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-[#555] dark:text-[#aaa]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2e7d32] dark:text-[#81c784] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
