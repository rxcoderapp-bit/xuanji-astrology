import React from 'react';
import type { BaziData } from '../types';

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
  return (
    <div className="col-start-2 col-end-4 row-start-2 row-end-4 rounded-lg sm:rounded-xl p-2 sm:p-4 flex flex-col justify-between font-serif
      bg-[#fcfaf6] dark:bg-[#15161c] border-2 border-[#d5cbb4] dark:border-[#2f313e] shadow-inner text-[#222] dark:text-[#eee]">
      
      {/* 1. Header Archetype Banner */}
      <div className="flex items-center justify-between pb-1 sm:pb-2 border-b border-[#e8dfcf] dark:border-[#272935]">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-sm sm:text-lg font-bold text-[#8d271c] dark:text-[#df756b]">
            {name}
          </span>
          <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded border font-semibold
            bg-[#efe9de] dark:bg-[#21232d] text-[#4f483e] dark:text-[#b4aca0] border-[#d8cdb8] dark:border-[#383a48]">
            {gender === '男' ? '乾造 · 陽男' : '坤造 · 陰女'}
          </span>
          <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded border font-semibold text-[#8d271c] dark:text-[#df756b]
            bg-[#f8edea] dark:bg-[#291b19] border-[#e8cdc6] dark:border-[#4f2923]">
            {fiveElementsClass}
          </span>
        </div>
        <div className="text-xs text-[#706a5f] dark:text-[#9c9588] hidden sm:block">
          {zodiac} · {sign}
        </div>
      </div>

      {/* 2. Calendar & Core Masters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-[10px] sm:text-xs py-1 sm:py-1.5 border-b border-[#eee6d7] dark:border-[#252733]">
        <div className="space-y-0.5 text-[#554e44] dark:text-[#aaa498]">
          <div>國曆：<b className="font-mono text-[#222] dark:text-[#eee]">{solarDate}</b></div>
          <div>農曆：<b className="text-[#222] dark:text-[#eee]">{lunarDate}</b></div>
        </div>
        <div className="space-y-0.5 text-[#554e44] dark:text-[#aaa498] sm:text-right">
          <div>命主：<b className="text-[#8d271c] dark:text-[#df756b] font-bold">{soul}</b> · 身主：<b className="text-[#2a5d7c] dark:text-[#64b5f6] font-bold">{body}</b></div>
          <div>來因：<b className="text-[#1b7a4f] dark:text-[#4ade80] font-bold">{laiYinPalaceName}</b></div>
        </div>
      </div>

      {/* 3. Bazi Four Pillars Grid */}
      <div className="my-1 sm:my-1.5">
        <div className="text-[10px] sm:text-[11px] font-bold text-[#70685c] dark:text-[#999285] mb-0.5 sm:mb-1 flex items-center justify-between">
          <span>子平八字四柱對照</span>
          <span className="font-normal text-[9px] sm:text-[10px] text-[#8c8477] dark:text-[#777]">
            日主：<b className="text-[#8d271c] dark:text-[#df756b]">{bazi.dayMaster} ({bazi.dayMasterStrength})</b>
          </span>
        </div>

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
      </div>

      {/* 4. Five Elements Distribution Bar */}
      <div className="pt-1 sm:pt-1.5 border-t border-[#eee6d7] dark:border-[#252733]">
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-[#70685c] dark:text-[#999285] mb-0.5 sm:mb-1">
          <span>五行氣場分佈比重</span>
          <span className="font-mono">木{bazi.fiveElements.wood}% · 火{bazi.fiveElements.fire}% · 土{bazi.fiveElements.earth}% · 金{bazi.fiveElements.metal}% · 水{bazi.fiveElements.water}%</span>
        </div>
        <div className="h-1.5 sm:h-2 w-full rounded-full overflow-hidden flex bg-gray-200 dark:bg-gray-800">
          <div style={{ width: `${bazi.fiveElements.wood}%` }} className="bg-[#1b7a4f]" title={`木 ${bazi.fiveElements.wood}%`} />
          <div style={{ width: `${bazi.fiveElements.fire}%` }} className="bg-[#c2410c]" title={`火 ${bazi.fiveElements.fire}%`} />
          <div style={{ width: `${bazi.fiveElements.earth}%` }} className="bg-[#8c6b38]" title={`土 ${bazi.fiveElements.earth}%`} />
          <div style={{ width: `${bazi.fiveElements.metal}%` }} className="bg-[#475569]" title={`金 ${bazi.fiveElements.metal}%`} />
          <div style={{ width: `${bazi.fiveElements.water}%` }} className="bg-[#2a5d7c]" title={`水 ${bazi.fiveElements.water}%`} />
        </div>
      </div>

      {/* 5. Interactive Prompt */}
      <div className="text-center text-[9px] sm:text-[11px] text-[#8c8477] dark:text-[#78746c] pt-0.5 sm:pt-1">
        ✦ 點選周圍十二宮位，即刻啟動三方四正照會與深層白話解盤 ✦
      </div>

    </div>
  );
};
