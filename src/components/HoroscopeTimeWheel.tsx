import React from 'react';
import { RotateCcw, Sparkles, Compass } from 'lucide-react';
import type { HoroscopeState, LayerType } from '../types';
import type { DecadalHoroscope } from 'iztro/lib/data/types';

interface HoroscopeTimeWheelProps {
  horoscope: HoroscopeState;
  decadalList: DecadalHoroscope[];
  onSelectLayer: (layer: LayerType) => void;
  onSelectDecade: (index: number) => void;
  onSelectYear: (year: number) => void;
  onSelectMonth: (month: number) => void;
  onSelectDay: (day: number) => void;
  onSelectHour: (hourIndex: number) => void;
  onResetToNow: () => void;
}

const LUNAR_MONTHS = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '臘月'];
const DOUBLE_HOURS = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export const HoroscopeTimeWheel: React.FC<HoroscopeTimeWheelProps> = ({
  horoscope,
  decadalList,
  onSelectLayer,
  onSelectDecade,
  onSelectYear,
  onSelectMonth,
  onSelectDay,
  onSelectHour,
  onResetToNow
}) => {
  const currentDecade = decadalList[horoscope.selectedDecadeIndex];
  const startYear = currentDecade?.yearRange?.[0] || horoscope.selectedYear - 5;
  const yearsInDecade = Array.from({ length: 10 }, (_, i) => startYear + i);

  return (
    <section className="w-full bg-[#f8f5ee] dark:bg-[#16171d] border-y border-[#e2d9c7] dark:border-[#2a2c37] py-3 px-4 sm:px-6 transition-colors font-serif">
      <div className="max-w-[1600px] mx-auto space-y-3">
        
        {/* Layer Tabs & Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Layer Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-[#80251c] dark:text-[#df756b] flex items-center gap-1 mr-1">
              <Compass className="w-3.5 h-3.5" />
              流運視角：
            </span>

            {[
              { id: 'natal', label: '本命原局' },
              { id: 'decadal', label: '大限 (10年)' },
              { id: 'yearly', label: '流年 (歲君)' },
              { id: 'age', label: '小限' },
              { id: 'monthly', label: '流月' },
              { id: 'daily', label: '流日' },
              { id: 'hourly', label: '流時' }
            ].map(tab => {
              const isActive = horoscope.activeLayer === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectLayer(tab.id as LayerType)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition whitespace-nowrap border
                    ${isActive
                      ? 'bg-[#9c2e22] text-white border-[#7a2218] shadow-sm'
                      : 'bg-[#ffffff] dark:bg-[#1f2029] text-[#554e44] dark:text-[#b4aea4] border-[#ded4c2] dark:border-[#353746] hover:bg-[#ede5d4] dark:hover:bg-[#2b2d3a]'}`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Quick "Now" and status button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onResetToNow}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition border
                bg-white dark:bg-[#20222b] text-[#2a5d7c] dark:text-[#64b5f6] border-[#cfdbe3] dark:border-[#2f4050] hover:bg-[#f0f6fa] dark:hover:bg-[#253240]"
              title="一鍵定位至當前真實年月日時"
            >
              <RotateCcw className="w-3 h-3" />
              回到此時此刻 (Now)
            </button>
          </div>

        </div>

        {/* Dynamic Context Control Row based on Layer */}
        {horoscope.activeLayer !== 'natal' && (
          <div className="pt-2 border-t border-[#e8dfcf] dark:border-[#262833] space-y-2.5">
            
            {/* 1. Decadal Selector Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
              <span className="font-bold text-[#6b6255] dark:text-[#a8a195] whitespace-nowrap min-w-[50px]">
                大限軌道:
              </span>
              <div className="flex gap-1.5">
                {decadalList.map((dec, idx) => {
                  const isSelected = horoscope.selectedDecadeIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => onSelectDecade(idx)}
                      className={`px-2.5 py-1 rounded text-xs transition whitespace-nowrap border flex items-center gap-1 font-mono
                        ${isSelected
                          ? 'bg-[#2a5d7c] text-white border-[#1d4359] font-bold shadow-sm'
                          : 'bg-white dark:bg-[#1a1b22] text-[#444] dark:text-[#ccc] border-[#ded5c5] dark:border-[#333543] hover:bg-[#eae2d1]'}`}
                    >
                      <span>{dec.ageRange ? `${dec.ageRange[0]}~${dec.ageRange[1]}` : ''}歲</span>
                      <span className="font-serif font-bold text-[#9c2e22] dark:text-[#ff9288]">{dec.heavenlyStem}{dec.earthlyBranch}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Yearly Selector Row */}
            {['yearly', 'monthly', 'daily', 'hourly'].includes(horoscope.activeLayer) && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
                <span className="font-bold text-[#6b6255] dark:text-[#a8a195] whitespace-nowrap min-w-[50px]">
                  流年歲次:
                </span>
                <div className="flex gap-1.5">
                  {yearsInDecade.map(y => {
                    const isSelected = horoscope.selectedYear === y;
                    return (
                      <button
                        key={y}
                        onClick={() => onSelectYear(y)}
                        className={`px-2.5 py-0.5 rounded text-xs transition whitespace-nowrap border font-mono
                          ${isSelected
                            ? 'bg-[#9c2e22] text-white border-[#7b2218] font-bold'
                            : 'bg-white dark:bg-[#1a1b22] text-[#444] dark:text-[#ccc] border-[#ded5c5] dark:border-[#333543] hover:bg-[#eae2d1]'}`}
                      >
                        {y}年
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Monthly Selector Row */}
            {['monthly', 'daily', 'hourly'].includes(horoscope.activeLayer) && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
                <span className="font-bold text-[#6b6255] dark:text-[#a8a195] whitespace-nowrap min-w-[50px]">
                  流月節律:
                </span>
                <div className="flex gap-1">
                  {LUNAR_MONTHS.map((mName, mIdx) => {
                    const mNum = mIdx + 1;
                    const isSelected = horoscope.selectedMonth === mNum;
                    return (
                      <button
                        key={mNum}
                        onClick={() => onSelectMonth(mNum)}
                        className={`px-2 py-0.5 rounded text-xs transition border
                          ${isSelected
                            ? 'bg-[#1b7a4f] text-white border-[#135939] font-bold'
                            : 'bg-white dark:bg-[#1a1b22] text-[#444] dark:text-[#ccc] border-[#ded5c5] dark:border-[#333543] hover:bg-[#eae2d1]'}`}
                      >
                        {mName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Daily Selector Row */}
            {['daily', 'hourly'].includes(horoscope.activeLayer) && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
                <span className="font-bold text-[#6b6255] dark:text-[#a8a195] whitespace-nowrap min-w-[50px]">
                  流日輪值:
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: 15 }, (_, i) => i + 1).map(d => {
                    const isSelected = horoscope.selectedDay === d;
                    return (
                      <button
                        key={d}
                        onClick={() => onSelectDay(d)}
                        className={`w-7 py-0.5 rounded text-xs transition border text-center font-mono
                          ${isSelected
                            ? 'bg-[#2a5d7c] text-white border-[#1c456b] font-bold'
                            : 'bg-white dark:bg-[#1a1b22] text-[#444] dark:text-[#ccc] border-[#ded5c5] dark:border-[#333543] hover:bg-[#eae2d1]'}`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. Hourly Selector Row */}
            {horoscope.activeLayer === 'hourly' && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
                <span className="font-bold text-[#6b6255] dark:text-[#a8a195] whitespace-nowrap min-w-[50px]">
                  時辰輪轉:
                </span>
                <div className="flex gap-1">
                  {DOUBLE_HOURS.map((hName, hIdx) => {
                    const isSelected = horoscope.selectedHourIndex === hIdx;
                    return (
                      <button
                        key={hName}
                        onClick={() => onSelectHour(hIdx)}
                        className={`w-7 py-0.5 rounded text-xs transition border text-center font-bold
                          ${isSelected
                            ? 'bg-[#79287c] text-white border-[#591b5c]'
                            : 'bg-white dark:bg-[#1a1b22] text-[#444] dark:text-[#ccc] border-[#ded5c5] dark:border-[#333543] hover:bg-[#eae2d1]'}`}
                      >
                        {hName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active layer summary chip */}
            <div className="text-xs flex flex-wrap items-center gap-2 text-[#5e574c] dark:text-[#b4aea4] bg-white/70 dark:bg-[#1c1d25] p-2 rounded-lg border border-[#e2d8c7] dark:border-[#2f313e]">
              <Sparkles className="w-3.5 h-3.5 text-[#9c2e22] dark:text-[#e07b72]" />
              <span>
                {horoscope.activeLayer === 'decadal' && (
                  <>
                    當前大限：<b className="text-[#2a5d7c] dark:text-[#64b5f6]">{currentDecade?.ageRange?.[0]}~{currentDecade?.ageRange?.[1]}歲 ({currentDecade?.heavenlyStem}{currentDecade?.earthlyBranch})</b>
                    {horoscope.decadalInfo?.mutagens && horoscope.decadalInfo.mutagens.length > 0 && (
                      <span className="ml-2">
                        大限四化：{horoscope.decadalInfo.mutagens.map(m => `${m.star}${m.mutagen}`).join('、')}
                      </span>
                    )}
                  </>
                )}
                {horoscope.activeLayer === 'yearly' && (
                  <>
                    當前流年：<b className="text-[#9c2e22] dark:text-[#e07b72]">{horoscope.selectedYear}年 ({horoscope.yearlyInfo?.stem}{horoscope.yearlyInfo?.branch}) · 虛歲 {horoscope.yearlyInfo?.nominalAge}歲</b>
                    {horoscope.yearlyInfo?.mutagens && horoscope.yearlyInfo.mutagens.length > 0 && (
                      <span className="ml-2">
                        流年四化：{horoscope.yearlyInfo.mutagens.map(m => `${m.star}${m.mutagen}`).join('、')}
                      </span>
                    )}
                  </>
                )}
                {horoscope.activeLayer === 'age' && (
                  <>
                    小限運勢：<b className="text-[#1b7a4f] dark:text-[#4fc38f]">{horoscope.ageInfo?.nominalAge} 歲小限</b>
                  </>
                )}
                {horoscope.activeLayer === 'monthly' && (
                  <>
                    流月運勢：<b className="text-[#1b7a4f] dark:text-[#4fc38f]">農曆 {horoscope.selectedMonth} 月</b>
                  </>
                )}
                {['daily', 'hourly'].includes(horoscope.activeLayer) && (
                  <>
                    細部時運：<b className="text-[#79287c] dark:text-[#ce7fe2]">{DOUBLE_HOURS[horoscope.selectedHourIndex]}時</b>
                  </>
                )}
              </span>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
