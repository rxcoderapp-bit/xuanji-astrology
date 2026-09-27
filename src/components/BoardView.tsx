import React from 'react';
import type { PalaceData, SanFangSiZheng, BaziData, HoroscopeState } from '../types';
import { PalaceCell } from './PalaceCell';
import { CenterTianpan } from './CenterTianpan';
import { getOverlappingNames } from '../lib/iztroEngine';

interface BoardViewProps {
  palaces: PalaceData[];
  selectedPalaceIndex: number;
  onSelectPalace: (index: number) => void;
  sanFang: SanFangSiZheng;
  horoscope: HoroscopeState;
  bazi: BaziData;
  soul: string;
  body: string;
  fiveElementsClass: string;
  zodiac: string;
  sign: string;
  solarDate: string;
  lunarDate: string;
  name: string;
  gender: string;
  laiYinIndex: number;
}

// 4x4 Grid Position Map by iztro Palace Index (0..11)
const GRID_POSITION_MAP: Record<number, string> = {
  3: 'row-start-1 col-start-1', // 巳
  4: 'row-start-1 col-start-2', // 午
  5: 'row-start-1 col-start-3', // 未
  6: 'row-start-1 col-start-4', // 申
  
  2: 'row-start-2 col-start-1', // 辰
  7: 'row-start-2 col-start-4', // 酉
  
  1: 'row-start-3 col-start-1', // 卯
  8: 'row-start-3 col-start-4', // 戌
  
  0: 'row-start-4 col-start-1', // 寅
  11: 'row-start-4 col-start-2', // 丑
  10: 'row-start-4 col-start-3', // 子
  9: 'row-start-4 col-start-4', // 亥
};

export const BoardView: React.FC<BoardViewProps> = ({
  palaces,
  selectedPalaceIndex,
  onSelectPalace,
  sanFang,
  horoscope,
  bazi,
  soul,
  body,
  fiveElementsClass,
  zodiac,
  sign,
  solarDate,
  lunarDate,
  name,
  gender,
  laiYinIndex
}) => {
  // Compute overlapping names for active transit layer
  let overlappingMap: Record<number, string> = {};
  if (horoscope.activeLayer === 'decadal' && horoscope.decadalInfo) {
    overlappingMap = getOverlappingNames(horoscope.decadalInfo.palaceIndex, '大');
  } else if (horoscope.activeLayer === 'yearly' && horoscope.yearlyInfo) {
    overlappingMap = getOverlappingNames(horoscope.yearlyInfo.palaceIndex, '流');
  } else if (horoscope.activeLayer === 'monthly' && horoscope.monthlyInfo) {
    overlappingMap = getOverlappingNames(horoscope.monthlyInfo.palaceIndex, '月');
  } else if (horoscope.activeLayer === 'daily' && horoscope.dailyInfo) {
    overlappingMap = getOverlappingNames(horoscope.dailyInfo.palaceIndex, '日');
  } else if (horoscope.activeLayer === 'hourly' && horoscope.hourlyInfo) {
    overlappingMap = getOverlappingNames(horoscope.hourlyInfo.palaceIndex, '時');
  }

  const laiYinPalace = palaces[laiYinIndex];

  return (
    <div id="chart-board" className="w-full flex-1 flex flex-col items-center overflow-x-auto pb-2 scrollbar-none">
      {/* 4x4 Grid Container */}
      <div className="w-full min-w-[340px] max-w-[1080px] grid grid-cols-4 grid-rows-4 gap-1 sm:gap-2.5 p-1 sm:p-3 rounded-xl sm:rounded-2xl border shadow-xl
        bg-[#f5f1e8]/90 dark:bg-[#111217]/90 border-[#dcd3bf] dark:border-[#272935]">
        
        {/* Center 2x2 Tianpan */}
        <CenterTianpan
          name={name}
          gender={gender}
          solarDate={solarDate}
          lunarDate={lunarDate}
          soul={soul}
          body={body}
          fiveElementsClass={fiveElementsClass}
          zodiac={zodiac}
          sign={sign}
          laiYinPalaceName={laiYinPalace ? `${laiYinPalace.name}(${laiYinPalace.heavenlyStem}${laiYinPalace.earthlyBranch})` : '—'}
          bazi={bazi}
        />

        {/* 12 Palaces */}
        {palaces.map(palace => {
          const isSelected = palace.index === selectedPalaceIndex;
          const isOpposite = palace.index === sanFang.oppositeIndex;
          const isTrine = palace.index === sanFang.trine1Index || palace.index === sanFang.trine2Index;
          const isFlank = palace.index === sanFang.flankPrevIndex || palace.index === sanFang.flankNextIndex;

          return (
            <PalaceCell
              key={palace.index}
              palace={palace}
              gridClass={GRID_POSITION_MAP[palace.index] || ''}
              isSelected={isSelected}
              isOpposite={isOpposite}
              isTrine={isTrine}
              isFlank={isFlank}
              overlappingName={overlappingMap[palace.index]}
              onSelect={() => onSelectPalace(palace.index)}
            />
          );
        })}

      </div>
    </div>
  );
};
