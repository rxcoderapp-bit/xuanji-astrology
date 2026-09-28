import React, { useState, useMemo } from 'react';
import type { BaziData } from '../types';
import { DualTrackRadar } from './DualTrackRadar';
import { computeDualTrackEnergy } from '../lib/dualTrackEngine';

interface CenterTianpanProps {
  name: string;
  gender: string;
  solarDate: string;
  lunarDate: string;
  soul: string;
  body: string;
  fiveElementsClass: string;
  zodiac: string;
  sign: string;
  laiYinPalaceName: string;
  bazi: BaziData;
}

export const CenterTianpan: React.FC<CenterTianpanProps> = ({
  name,
  gender,
  solarDate,
  lunarDate,
  soul,
  body,
  fiveElementsClass,
  zodiac,
  sign,
  laiYinPalaceName,
  bazi
}) => {
  const [centerTab, setCenterTab] = useState<'bazi' | 'elements'>('bazi');

  // 計算五行全息動態能量
  const energyData = useMemo(() => {
    return computeDualTrackEnergy(bazi);
  }, [bazi]);

  return (
    <div className="col-start-2 col-end-4 row-start-2 row-end-4 rounded-lg sm:rounded-xl p-2 sm:p-3 flex flex-col justify-between font-serif
      bg-[#fcfaf6] dark:bg-[#15161c] border-2 border-[#d5cbb4] dark:border-[#2f313e] shadow-inner text-[#222] dark:text-[#eee] overflow-hidden">
      
      {/* 1. Header Archetype Banner */}
      <div className="flex items-center justify-between pb-1 sm:pb-1.5 border-b border-[#e8dfcf] dark:border-[#272935]">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-sm sm:text-base font-bold text-[#8d271c] dark:text-[#df756b]">
            {name}
          </span>
          <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded border font-semibold
            bg-[#efe9de] dark:bg-[#21232d] text-[#4f483e] dark:text-[#b4aca0] border-[#d8cdb8] dark:border-[#383a48]">
            {gender === '男' ? '乾造 · 陽男' : '坤造 · 陰女'}
          </span>
          <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded border font-semibold text-[#8d271c] dark:text-[#df756b]
            bg-[#f8edea] dark:bg-[#291b19] border-[#e8cdc6] dark:border-[#4f2923]">
            {fiveElementsClass}
          </span>
        </div>
        <div className="text-[11px] text-[#706a5f] dark:text-[#9c9588] hidden sm:block">
          {zodiac} · {sign}
        </div>
      </div>

      {/* 2. Calendar & Core Masters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] sm:text-[11px] py-1 border-b border-[#eee6d7] dark:border-[#252733]">
        <div className="space-y-0.5 text-[#554e44] dark:text-[#aaa498]">
          <div>國曆：<b className="font-mono text-[#222] dark:text-[#eee]">{solarDate}</b></div>
          <div>農曆：<b className="text-[#222] dark:text-[#eee]">{lunarDate}</b></div>
        </div>
        <div className="space-y-0.5 text-[#554e44] dark:text-[#aaa498] sm:text-right">
          <div>命主：<b className="text-[#8d271c] dark:text-[#df756b] font-bold">{soul}</b> · 身主：<b className="text-[#2a5d7c] dark:text-[#64b5f6] font-bold">{body}</b></div>
          <div>來因：<b className="text-[#1b7a4f] dark:text-[#4ade80] font-bold">{laiYinPalaceName}</b></div>
        </div>
      </div>

      {/* 3. Sub-Tab Switcher (子平四柱 vs 五行全息) */}
      <div className="flex items-center justify-between my-1">
        <div className="flex items-center gap-1 bg-[#ede4d4] dark:bg-[#232530] p-0.5 rounded text-[10px]">
          <button
            onClick={() => setCenterTab('bazi')}
            className={`px-2 py-0.5 rounded font-bold transition-all ${
              centerTab === 'bazi'
                ? 'bg-white dark:bg-[#15161c] text-[#8d271c] dark:text-[#df756b] shadow-xs'
                : 'text-[#665e52] dark:text-[#948c7e] hover:text-[#222] dark:hover:text-[#eee]'
            }`}
          >
            子平八字四柱
          </button>
          <button
            onClick={() => setCenterTab('elements')}
            className={`px-2 py-0.5 rounded font-bold transition-all flex items-center gap-0.5 ${
              centerTab === 'elements'
                ? 'bg-white dark:bg-[#15161c] text-[#8d271c] dark:text-[#df756b] shadow-xs'
                : 'text-[#665e52] dark:text-[#948c7e] hover:text-[#222] dark:hover:text-[#eee]'
            }`}
          >
            <span>★ 五行全息雷達</span>
          </button>
        </div>
        <span className="text-[10px] text-[#8c8477] dark:text-[#777] hidden sm:inline">
          日主：<b className="text-[#8d271c] dark:text-[#df756b]">{bazi.dayMaster} ({bazi.dayMasterStrength})</b>
        </span>
      </div>

      {/* 4. Tab Content: Bazi vs Dual-Track Elements Radar */}
      {centerTab === 'bazi' ? (
        <div className="space-y-1.5">
          <div className="grid grid-cols-4 gap-1 sm:gap-1.5 text-center font-mono text-[10px] sm:text-xs">
            {[
              { label: '時柱', data: bazi.hour },
              { label: '日柱', data: bazi.day },
              { label: '月柱', data: bazi.month },
              { label: '年柱', data: bazi.year },
            ].map((item, idx) => (
              <div key={idx} className="rounded p-0.5 sm:p-1 border bg-white dark:bg-[#1a1b22] border-[#ded5c5] dark:border-[#2f313e]">
                <div className="text-[9px] sm:text-[10px] text-[#8c8477] dark:text-[#777] mb-0.5">{item.label}</div>
                <div className="text-[9px] sm:text-[10px] text-[#2a5d7c] dark:text-[#64b5f6] font-serif font-bold">
                  {item.data.stemShiShen}
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#8d271c] dark:text-[#df756b]">
                  {item.data.stem}{item.data.branch}
                </div>
                <div className="text-[8px] sm:text-[9px] text-[#736c61] dark:text-[#888] truncate" title={item.data.nayin}>
                  {item.data.nayin}
                </div>
              </div>
            ))}
          </div>

          {/* Five Elements Distribution Bar */}
          <div className="pt-1 border-t border-[#eee6d7] dark:border-[#252733]">
            <div className="flex items-center justify-between text-[9px] text-[#70685c] dark:text-[#999285] mb-0.5">
              <span>五行氣象分佈比重</span>
              <span className="font-mono">木{bazi.fiveElements.wood}% · 火{bazi.fiveElements.fire}% · 土{bazi.fiveElements.earth}% · 金{bazi.fiveElements.metal}% · 水{bazi.fiveElements.water}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full overflow-hidden flex bg-gray-200 dark:bg-gray-800">
              <div style={{ width: `${bazi.fiveElements.wood}%` }} className="bg-[#1b7a4f]" title={`木 ${bazi.fiveElements.wood}%`} />
              <div style={{ width: `${bazi.fiveElements.fire}%` }} className="bg-[#c2410c]" title={`火 ${bazi.fiveElements.fire}%`} />
              <div style={{ width: `${bazi.fiveElements.earth}%` }} className="bg-[#8c6b38]" title={`土 ${bazi.fiveElements.earth}%`} />
              <div style={{ width: `${bazi.fiveElements.metal}%` }} className="bg-[#475569]" title={`金 ${bazi.fiveElements.metal}%`} />
              <div style={{ width: `${bazi.fiveElements.water}%` }} className="bg-[#2a5d7c]" title={`水 ${bazi.fiveElements.water}%`} />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col justify-center">
          <DualTrackRadar data={energyData} />
        </div>
      )}

      {/* 5. Bottom Interactive Prompt */}
      <div className="text-center text-[9px] sm:text-[10px] text-[#8c8477] dark:text-[#78746c] pt-0.5 border-t border-[#eee6d7] dark:border-[#252733]">
        ✦ 點選十二宮位啟動三方四正照會 · 切換時間輪看歲運共振 ✦
      </div>

    </div>
  );
};
