import React, { useState, useMemo } from 'react';
import { 
  Layers, ShieldAlert, Sparkles, Compass, Zap
} from 'lucide-react';
import type { PalaceData, HoroscopeState } from '../types';
import { analyzeThreeLayers } from '../lib/threeLayerEngine';

interface ThreeLayerPanelProps {
  palaces: PalaceData[];
  horoscope: HoroscopeState;
  onSelectPalace?: (index: number) => void;
}

export const ThreeLayerPanel: React.FC<ThreeLayerPanelProps> = ({
  palaces,
  horoscope,
  onSelectPalace
}) => {
  const threeLayerResult = useMemo(() => {
    return analyzeThreeLayers(palaces, horoscope);
  }, [palaces, horoscope]);

  const {
    currentDecadeName,
    currentYearNumber,
    currentYearGanZhi,
    palaceOverlaps,
    collisionAlerts,
    threeLayerSynthesisText
  } = threeLayerResult;

  const [selectedBranch, setSelectedBranch] = useState<string>(
    palaceOverlaps[0]?.earthlyBranch || '子'
  );

  const activeOverlap = useMemo(() => {
    return palaceOverlaps.find(p => p.earthlyBranch === selectedBranch) || palaceOverlaps[0];
  }, [palaceOverlaps, selectedBranch]);

  return (
    <div className="space-y-6 animate-fade-in text-xs sm:text-sm">
      
      {/* 1. Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border bg-gradient-to-br from-[#faf6ed] to-[#f3ebd9] dark:from-[#1b1c26] dark:to-[#13141d] border-[#ded4c0] dark:border-[#2d3042] space-y-3 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#8d271c] text-white">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#2b2723] dark:text-[#f2efe9]">
                紫微三層疊宮時空穿梭器
              </h3>
              <p className="text-[11px] text-[#706456] dark:text-[#a09a8f]">
                原典依據：《紫微現代解盤邏輯全書》·【本命體 ✕ 大限勢 ✕ 流年用】時空全息同頻映射
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-0.5 rounded-md bg-[#8d271c]/10 text-[#8d271c] dark:text-[#ef5350] font-bold">
              {currentDecadeName}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#2a5d7c]/10 text-[#2a5d7c] dark:text-[#64b5f6] font-bold">
              {currentYearNumber} ({currentYearGanZhi}年)
            </span>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-[#554e44] dark:text-[#b4aea4] border-t pt-2.5 border-[#e8ded0] dark:border-[#252838]">
          {threeLayerSynthesisText}
        </p>
      </div>

      {/* 2. 飛星四化碰撞雷達 (Collision Radar Alerts) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs sm:text-sm text-[#333] dark:text-[#ddd] flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#e65100] dark:text-[#ff9800]" />
            <span>飛星四化動態碰撞雷達 ({collisionAlerts.length} 處警訊)</span>
          </h4>
          <span className="text-[10px] text-[#888]">
            三代四化（本命、大限、流年）交錯疊加效應
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {collisionAlerts.map((alert, idx) => {
            const isBlessing = alert.level === 'high_blessing';
            const isWarning = alert.level === 'high_warning';
            return (
              <div 
                key={idx}
                className={`p-3.5 rounded-xl border space-y-2 transition shadow-xs ${
                  isBlessing 
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40' 
                    : isWarning 
                      ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40' 
                      : 'bg-[#faf7ef] dark:bg-[#15161f] border-[#ded4c0] dark:border-[#282a3a]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-xs flex items-center gap-1.5 ${
                    isBlessing ? 'text-emerald-800 dark:text-emerald-300' :
                    isWarning ? 'text-rose-800 dark:text-rose-300' :
                    'text-[#2a5d7c] dark:text-[#64b5f6]'
                  }`}>
                    {isBlessing ? <Sparkles className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    <span>{alert.title}</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-black/5 dark:bg-white/10 font-bold">
                    {alert.affectedPalace}
                  </span>
                </div>

                <p className="text-[11px] text-[#555] dark:text-[#bbb] leading-relaxed">
                  {alert.description}
                </p>

                <div className="text-[11px] p-2 rounded bg-white/70 dark:bg-[#1a1b24] border border-[#e5dccb] dark:border-[#2b2d3d] text-[#444] dark:text-[#ccc]">
                  <span className="font-bold text-[#8d271c] dark:text-[#ef5350]">策略指令：</span>
                  {alert.strategicAdvice}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 十二宮位時空穿梭選擇器 (12 Earthly Branches Selector) */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs sm:text-sm text-[#333] dark:text-[#ddd] flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#8d271c]" />
            <span>三層宮位交會破譯 (點選切換地支宮位)</span>
          </h4>
          <span className="text-[10px] text-[#888]">
            當前焦點：【{activeOverlap.earthlyBranch}位】
          </span>
        </div>

        {/* 12 Branches Button Bar */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
          {palaceOverlaps.map(item => {
            const isSelected = item.earthlyBranch === selectedBranch;
            return (
              <button
                key={item.earthlyBranch}
                onClick={() => setSelectedBranch(item.earthlyBranch)}
                className={`py-1.5 px-1 rounded-lg border text-center transition flex flex-col items-center justify-center cursor-pointer ${
                  isSelected
                    ? 'bg-[#8d271c] text-white border-[#751d14] shadow-xs'
                    : 'bg-white dark:bg-[#171822] border-[#ded5c3] dark:border-[#272938] text-[#555] dark:text-[#aaa] hover:border-[#8d271c]/50'
                }`}
              >
                <span className="font-bold text-xs">{item.earthlyBranch}</span>
                <span className="text-[9px] opacity-80 scale-90">{item.natalLayer.palaceName.slice(0, 2)}</span>
              </button>
            );
          })}
        </div>

        {/* Active Overlapping Detail Card */}
        {activeOverlap && (
          <div className="p-4 sm:p-5 rounded-2xl border bg-white dark:bg-[#191a24] border-[#ded5c3] dark:border-[#2a2c3d] space-y-4 shadow-sm">
            
            {/* Header of Active Palace */}
            <div className="flex items-center justify-between border-b pb-3 border-[#eee6d6] dark:border-[#272938]">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#8d271c]/10 text-[#8d271c] dark:text-[#ef5350]">
                  地支【{activeOverlap.earthlyBranch}】
                </span>
                <h5 className="font-bold text-sm sm:text-base text-[#222] dark:text-[#eee]">
                  【{activeOverlap.natalLayer.palaceName}】✕【{activeOverlap.decadalLayer.palaceName}】✕【{activeOverlap.yearlyLayer.palaceName}】
                </h5>
              </div>

              {onSelectPalace && (
                <button
                  onClick={() => onSelectPalace(activeOverlap.palaceIndex)}
                  className="px-2.5 py-1 rounded-lg text-xs font-serif border text-[#8d271c] dark:text-[#ef5350] border-[#8d271c]/30 hover:bg-[#8d271c]/5"
                >
                  在主星盤鎖定此宮
                </button>
              )}
            </div>

            {/* 3-Tier Layer Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              
              {/* Layer 1: Natal */}
              <div className="p-3 rounded-xl bg-[#faf7ef] dark:bg-[#15161f] border border-[#e8dfcf] dark:border-[#282a3a] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#8d271c] dark:text-[#df756b] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#8d271c]" />
                    <span>本命層 (宿命基底)</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#777]">{activeOverlap.natalLayer.heavenlyStem}{activeOverlap.earthlyBranch}</span>
                </div>
                <div className="font-bold text-sm text-[#222] dark:text-[#eee]">
                  {activeOverlap.natalLayer.palaceName}
                </div>
                <div className="text-[11px] text-[#666] dark:text-[#aaa]">
                  星曜：{activeOverlap.natalLayer.majorStars.join('、') || '借對宮'}
                </div>
                {activeOverlap.natalLayer.mutagens.length > 0 && (
                  <div className="text-[10px] text-[#e65100] dark:text-[#ff9800]">
                    生年四化：{activeOverlap.natalLayer.mutagens.join(' ')}
                  </div>
                )}
                <p className="text-[11px] text-[#777] dark:text-[#999] pt-1 border-t border-[#eee4d4] dark:border-[#232532]">
                  {activeOverlap.natalLayer.roleDescription}
                </p>
              </div>

              {/* Layer 2: Decadal */}
              <div className="p-3 rounded-xl bg-[#f4f7fa] dark:bg-[#131922] border border-[#d6e3ee] dark:border-[#233145] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#2a5d7c] dark:text-[#64b5f6] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#2a5d7c]" />
                    <span>大限層 (十年大勢)</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#777]">{currentDecadeName}</span>
                </div>
                <div className="font-bold text-sm text-[#222] dark:text-[#eee]">
                  {activeOverlap.decadalLayer.palaceName}
                </div>
                <div className="text-[11px] text-[#666] dark:text-[#aaa]">
                  疊宮：大限【{activeOverlap.decadalLayer.palaceName}】重疊於本命【{activeOverlap.natalLayer.palaceName}】
                </div>
                {activeOverlap.decadalLayer.mutagens.length > 0 && (
                  <div className="text-[10px] text-[#e65100] dark:text-[#ff9800]">
                    大限四化：{activeOverlap.decadalLayer.mutagens.join(' ')}
                  </div>
                )}
                <p className="text-[11px] text-[#777] dark:text-[#999] pt-1 border-t border-[#d8e3ed] dark:border-[#1e2a3c]">
                  {activeOverlap.decadalLayer.roleDescription}
                </p>
              </div>

              {/* Layer 3: Yearly */}
              <div className="p-3 rounded-xl bg-[#faf5f8] dark:bg-[#1f151c] border border-[#eedce7] dark:border-[#382333] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#9d174d] dark:text-[#f472b6] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#9d174d]" />
                    <span>流年層 (歲運觸發)</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#777]">{currentYearNumber} {currentYearGanZhi}</span>
                </div>
                <div className="font-bold text-sm text-[#222] dark:text-[#eee]">
                  {activeOverlap.yearlyLayer.palaceName}
                </div>
                <div className="text-[11px] text-[#666] dark:text-[#aaa]">
                  疊宮：流年【{activeOverlap.yearlyLayer.palaceName}】重疊引動
                </div>
                {activeOverlap.yearlyLayer.mutagens.length > 0 && (
                  <div className="text-[10px] text-[#e65100] dark:text-[#ff9800]">
                    流年四化：{activeOverlap.yearlyLayer.mutagens.join(' ')}
                  </div>
                )}
                <p className="text-[11px] text-[#777] dark:text-[#999] pt-1 border-t border-[#ecd5e4] dark:border-[#341d2e]">
                  {activeOverlap.yearlyLayer.roleDescription}
                </p>
              </div>

            </div>

            {/* Combined Synthesis & Action Directive */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#fcf9f2] to-[#f7f0e1] dark:from-[#1b1c26] dark:to-[#171822] border border-[#ded4bf] dark:border-[#2f2c3d] space-y-2 text-xs">
              <div className="font-bold text-[#8d271c] dark:text-[#ef5350] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>三層交疊綜合效應與破局落點：</span>
              </div>
              <p className="text-[#443e35] dark:text-[#c7bfb1] leading-relaxed">
                {activeOverlap.combinedMeaning}
              </p>
              <div className="text-[11px] font-semibold text-[#2e7d32] dark:text-[#81c784] bg-white/60 dark:bg-[#13141b] p-2 rounded-lg border border-[#e4d9c4] dark:border-[#272937]">
                🎯 當前核心攻堅主題：{activeOverlap.coreLifeTheme}
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
