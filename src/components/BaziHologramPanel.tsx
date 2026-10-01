import React, { useMemo } from 'react';
import { 
  Activity, Heart, Apple, Moon,
  Zap, Compass, AlertCircle
} from 'lucide-react';
import type { BaziData } from '../types';
import { 
  computeBaziHologram, 
  type ElementQuantitativeMetric 
} from '../lib/baziHologramEngine';

interface BaziHologramPanelProps {
  bazi: BaziData;
}

export const BaziHologramPanel: React.FC<BaziHologramPanelProps> = ({ bazi }) => {
  const hologramResult = useMemo(() => {
    return computeBaziHologram(bazi);
  }, [bazi]);

  const {
    elements,
    dayMasterStrength,
    fourGods,
    healthProfile,
    synthesisText
  } = hologramResult;

  return (
    <div className="space-y-6 animate-fade-in text-xs sm:text-sm">
      
      {/* 1. Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border bg-gradient-to-br from-[#faf6ed] to-[#f4ebe0] dark:from-[#1b1c26] dark:to-[#14151e] border-[#ded4c0] dark:border-[#2d3042] space-y-3 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#8d271c] text-white">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#2b2723] dark:text-[#f2efe9]">
                子平八字動態五行量化 ✕ 四大用神 ✕ 中醫全息健康
              </h3>
              <p className="text-[11px] text-[#706456] dark:text-[#a09a8f]">
                原典依據：《子平八字時空全息論》· 月令45%權重 ✕ 地支通根演算法 ✕ 五運六氣時空基因
              </p>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-[#8d271c]/10 text-[#8d271c] dark:text-[#ef5350]">
            日元【{dayMasterStrength.dayMaster} ({dayMasterStrength.element})】· {dayMasterStrength.level}
          </span>
        </div>

        <p className="text-xs leading-relaxed text-[#554e44] dark:text-[#b4aea4] border-t pt-2.5 border-[#e8ded0] dark:border-[#252838]">
          {synthesisText}
        </p>
      </div>

      {/* 2. 動態五行精密量化儀表板 (Quantitative Elements Dashboard) */}
      <div className="p-4 sm:p-5 rounded-2xl border bg-white dark:bg-[#191a24] border-[#ded5c3] dark:border-[#2a2c3d] space-y-4 shadow-sm">
        
        <div className="flex items-center justify-between flex-wrap gap-2 border-b pb-2.5 border-[#eee6d6] dark:border-[#272938]">
          <div className="font-bold text-xs sm:text-sm text-[#333] dark:text-[#ddd] flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#e65100] dark:text-[#ff9800]" />
            <span>動態五行精密量化儀表板 (月令45%＋通根權重)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <span className={`px-1.5 py-0.5 rounded ${dayMasterStrength.deLing ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
              {dayMasterStrength.deLing ? '✓ 得令' : '✗ 失令'}
            </span>
            <span className={`px-1.5 py-0.5 rounded ${dayMasterStrength.deDi ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
              {dayMasterStrength.deDi ? '✓ 得地通根' : '✗ 地支無根'}
            </span>
            <span className={`px-1.5 py-0.5 rounded ${dayMasterStrength.deSheng ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
              {dayMasterStrength.deSheng ? '✓ 得生助' : '✗ 剋洩過重'}
            </span>
          </div>
        </div>

        {/* Day Master Strength Score Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#554e44] dark:text-[#c4bdb2]">
              日主絕對身強能量指數：
            </span>
            <span className="font-mono font-bold text-[#8d271c] dark:text-[#ef5350]">
              {dayMasterStrength.score} / 100 ({dayMasterStrength.level})
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-[#eee7d8] dark:bg-[#252838] overflow-hidden p-0.5">
            <div 
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#2a5d7c] via-[#e65100] to-[#8d271c]"
              style={{ width: `${dayMasterStrength.score}%` }}
            />
          </div>
          <p className="text-[11px] text-[#666] dark:text-[#aaa] leading-relaxed pt-0.5">
            {dayMasterStrength.description}
          </p>
        </div>

        {/* 5 Elements Percentage Progress Bars */}
        <div className="space-y-2.5 pt-2">
          <div className="text-[11px] font-bold text-[#666] dark:text-[#aaa]">
            全盤五行能量動態百分比分佈：
          </div>
          <div className="space-y-2">
            {elements.map((el: ElementQuantitativeMetric) => (
              <div key={el.element} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1.5" style={{ color: el.color }}>
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: el.color }} />
                    <span>{el.element}行</span>
                    <span className="text-[10px] px-1 py-0.2 rounded font-normal bg-black/5 dark:bg-white/10">
                      {el.status}
                    </span>
                  </span>
                  <span className="font-mono text-xs font-bold text-[#555] dark:text-[#bbb]">
                    {el.percentage}% ({el.powerScore}分)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#f0ebd9] dark:bg-[#222432] overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${el.percentage}%`, backgroundColor: el.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. 子平四大用神全息判定 (Four Gods System) */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs sm:text-sm text-[#333] dark:text-[#ddd] flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-[#8d271c]" />
          <span>子平四大用神定奪 (扶抑 · 調候 · 通關 · 病藥)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          
          {/* FuYi God (扶抑用神) */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#191a24] border border-[#ded5c3] dark:border-[#2a2c3d] space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#2e7d32] dark:text-[#81c784] flex items-center gap-1">
                <span>⚖️ 扶抑用神</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 font-bold">
                強抑弱補
              </span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div>
                <span className="font-bold text-[#8d271c] dark:text-[#ef5350]">喜用神五行：</span>
                <span className="font-bold text-[#222] dark:text-[#eee]">{fourGods.fuYiGod.xiYong.join('、')}</span>
              </div>
              <div>
                <span className="font-bold text-[#777]">忌仇神五行：</span>
                <span className="text-[#666] dark:text-[#aaa]">{fourGods.fuYiGod.jiShen.join('、')}</span>
              </div>
            </div>
            <p className="text-[11px] text-[#666] dark:text-[#aaa] leading-relaxed pt-1 border-t border-[#eee4d4] dark:border-[#252838]">
              {fourGods.fuYiGod.explanation}
            </p>
          </div>

          {/* TiaoHou God (調候用神) */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#191a24] border border-[#ded5c3] dark:border-[#2a2c3d] space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#e65100] dark:text-[#ff9800] flex items-center gap-1">
                <span>🌡️ 調候用神</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 font-bold">
                {fourGods.tiaoHouGod.seasonClimate}
              </span>
            </div>
            <div className="text-[11px]">
              <span className="font-bold text-[#e65100] dark:text-[#ff9800]">四季調候之神：</span>
              <span className="font-bold text-[#222] dark:text-[#eee]">{fourGods.tiaoHouGod.mainGod}</span>
            </div>
            <p className="text-[11px] text-[#666] dark:text-[#aaa] leading-relaxed pt-1 border-t border-[#eee4d4] dark:border-[#252838]">
              {fourGods.tiaoHouGod.explanation}
            </p>
          </div>

          {/* TongGuan God (通關用神) */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#191a24] border border-[#ded5c3] dark:border-[#2a2c3d] space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#2a5d7c] dark:text-[#64b5f6] flex items-center gap-1">
                <span>🌊 通關用神</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-950/70 text-sky-900 dark:text-sky-200 font-bold">
                五行交戰解套
              </span>
            </div>
            {fourGods.tongGuanGod.needed ? (
              <div className="text-[11px]">
                <span className="font-bold text-[#2a5d7c] dark:text-[#64b5f6]">交戰化解中介：</span>
                <span className="font-bold text-[#222] dark:text-[#eee]">{fourGods.tongGuanGod.mediator}</span>
                <span className="text-[10px] text-[#777] ml-1">({fourGods.tongGuanGod.conflictPair})</span>
              </div>
            ) : (
              <div className="text-[11px] text-[#666] dark:text-[#aaa]">
                局中五行流轉順暢，無激烈刑衝交戰之險。
              </div>
            )}
            <p className="text-[11px] text-[#666] dark:text-[#aaa] leading-relaxed pt-1 border-t border-[#eee4d4] dark:border-[#252838]">
              {fourGods.tongGuanGod.explanation}
            </p>
          </div>

          {/* BingYao God (病藥用神) */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#191a24] border border-[#ded5c3] dark:border-[#2a2c3d] space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#7c3aed] dark:text-[#c084fc] flex items-center gap-1">
                <span>💊 病藥用神</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950/70 text-purple-900 dark:text-purple-200 font-bold">
                得病有藥見大貴
              </span>
            </div>
            <div className="space-y-0.5 text-[11px]">
              <div>
                <span className="font-bold text-rose-700 dark:text-rose-400">命局之病：</span>
                <span className="text-[#333] dark:text-[#ddd]">{fourGods.bingYaoGod.disease}</span>
              </div>
              <div>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">歲運之藥：</span>
                <span className="text-[#333] dark:text-[#ddd]">{fourGods.bingYaoGod.medicine}</span>
              </div>
            </div>
            <p className="text-[11px] text-[#666] dark:text-[#aaa] leading-relaxed pt-1 border-t border-[#eee4d4] dark:border-[#252838]">
              {fourGods.bingYaoGod.explanation}
            </p>
          </div>

        </div>
      </div>

      {/* 4. 時空基因中醫健康預警卡 (Holistic Health Profile) */}
      <div className="p-4 sm:p-5 rounded-2xl border bg-gradient-to-br from-[#fbf8f0] to-[#f4ebe0] dark:from-[#1b1c26] dark:to-[#15161f] border-[#ded4bf] dark:border-[#2e3143] space-y-3.5 shadow-sm">
        
        <div className="flex items-center justify-between border-b pb-2.5 border-[#e8ded0] dark:border-[#272938]">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400 fill-current" />
            <h4 className="font-bold text-xs sm:text-sm text-[#8d271c] dark:text-[#ef5350]">
              時空基因中醫健康全息預警卡
            </h4>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold">
            五運六氣未病先防
          </span>
        </div>

        {/* Vulnerable Organ & Meridian Risk */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white dark:bg-[#191a24] border border-[#e5dccb] dark:border-[#282a39] space-y-1">
            <div className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>最脆弱五臟六腑部位：</span>
            </div>
            <p className="text-[11px] text-[#555] dark:text-[#bbb] leading-relaxed">
              {healthProfile.vulnerableOrgan}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-[#191a24] border border-[#e5dccb] dark:border-[#282a39] space-y-1">
            <div className="font-bold text-[#b45309] dark:text-[#f59e0b] flex items-center gap-1 text-[11px]">
              <Activity className="w-3.5 h-3.5" />
              <span>經絡循環與慢性隱患：</span>
            </div>
            <p className="text-[11px] text-[#555] dark:text-[#bbb] leading-relaxed">
              {healthProfile.meridianRisk}
            </p>
          </div>
        </div>

        {/* Five Zang Warning */}
        <div className="p-3 rounded-xl bg-white/70 dark:bg-[#171822] border border-[#e4d9c7] dark:border-[#282b3c] text-xs text-[#554e44] dark:text-[#b4aea4] leading-relaxed">
          <span className="font-bold text-[#8d271c] dark:text-[#ef5350]">中醫病理剖析：</span>
          {healthProfile.fiveZangWarning}
        </div>

        {/* Remedies: Diet & Lifestyle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
            <div className="font-bold text-[#2e7d32] dark:text-[#81c784] flex items-center gap-1 text-[11px]">
              <Apple className="w-3.5 h-3.5" />
              <span>本命五行食療養生方：</span>
            </div>
            <p className="text-[11px] text-emerald-950 dark:text-emerald-200 leading-relaxed">
              {healthProfile.dietaryRemedy}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-900/40 space-y-1">
            <div className="font-bold text-[#2a5d7c] dark:text-[#64b5f6] flex items-center gap-1 text-[11px]">
              <Moon className="w-3.5 h-3.5" />
              <span>起居作息與情志心態修持：</span>
            </div>
            <p className="text-[11px] text-sky-950 dark:text-sky-200 leading-relaxed">
              {healthProfile.lifestyleGuidance}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
