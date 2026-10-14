import React from 'react';
import type { PalaceData, MutagenType } from '../types';

interface PalaceCellProps {
  palace: PalaceData;
  gridClass: string;
  isSelected: boolean;
  isOpposite: boolean;
  isTrine: boolean;
  isFlank: boolean;
  overlappingName?: string;
  onSelect: () => void;
}

const BRIGHTNESS_COLORS: Record<string, string> = {
  '廟': 'text-[#af3426] dark:text-[#f87171] font-bold',
  '旺': 'text-[#c2410c] dark:text-[#fb923c] font-bold',
  '得': 'text-[#15803d] dark:text-[#4ade80]',
  '利': 'text-[#0284c7] dark:text-[#38bdf8]',
  '平': 'text-[#64748b] dark:text-[#94a3b8]',
  '陷': 'text-[#6b7280] dark:text-[#64748b] opacity-80',
  '不': 'text-[#6b7280] dark:text-[#64748b] opacity-80',
};

export const MUTAGEN_BADGE_STYLE: Record<MutagenType, string> = {
  '祿': 'bg-[#15803d] text-white border-[#14532d] shadow-2xs font-extrabold', // 祿: 翠綠
  '權': 'bg-[#b91c1c] text-white border-[#7f1d1d] shadow-2xs font-extrabold', // 權: 烈紅
  '科': 'bg-[#0284c7] text-white border-[#0369a1] shadow-2xs font-extrabold ring-1 ring-sky-300/50', // 科: 亮藍醒目！
  '忌': 'bg-[#7e22ce] text-white border-[#581c87] shadow-2xs font-extrabold', // 忌: 曜紫
};

const SELF_MUTAGEN_STYLE: Record<string, string> = {
  '祿': 'text-[#15803d] dark:text-[#4ade80] bg-[#ecfdf5] dark:bg-[#064e3b]/30 border-[#a7f3d0] dark:border-[#065f46]',
  '權': 'text-[#b91c1c] dark:text-[#f87171] bg-[#fef2f2] dark:bg-[#7f1d1d]/30 border-[#fecaca] dark:border-[#991b1b]',
  '科': 'text-[#0284c7] dark:text-[#38bdf8] bg-[#f0f9ff] dark:bg-[#0c4a6e]/40 border-[#bae6fd] dark:border-[#0284c7] font-bold ring-1 ring-sky-300/30',
  '忌': 'text-[#7e22ce] dark:text-[#c084fc] bg-[#faf5ff] dark:bg-[#581c87]/30 border-[#e9d5ff] dark:border-[#6b21a8]',
};

export const PalaceCell: React.FC<PalaceCellProps> = ({
  palace,
  gridClass,
  isSelected,
  isOpposite,
  isTrine,
  isFlank,
  overlappingName,
  onSelect
}) => {
  // Border & Glow based on SanFangSiZheng relationship
  let relationBadge = null;
  let ringClasses = 'border-[#d8cfbe] dark:border-[#2d303d] hover:border-[#a89d88]';

  if (isSelected) {
    ringClasses = 'border-2 border-[#b83426] dark:border-[#e85040] shadow-md ring-2 ring-[#b83426]/20 bg-[#fdfaf4] dark:bg-[#20212b]';
    relationBadge = <span className="bg-[#b83426] text-white text-[9px] sm:text-[10px] px-1 py-0.5 rounded font-bold">本宮</span>;
  } else if (isOpposite) {
    ringClasses = 'border-2 border-[#275c8d] dark:border-[#4fa3e3] ring-1 ring-[#275c8d]/20 bg-[#f7f9fc] dark:bg-[#1a212b]';
    relationBadge = <span className="bg-[#275c8d] text-white text-[9px] sm:text-[10px] px-1 py-0.5 rounded font-bold">對宮沖照</span>;
  } else if (isTrine) {
    ringClasses = 'border-2 border-[#1b7a4f] dark:border-[#2ec484] ring-1 ring-[#1b7a4f]/20 bg-[#f6faf7] dark:bg-[#19261f]';
    relationBadge = <span className="bg-[#1b7a4f] text-white text-[9px] sm:text-[10px] px-1 py-0.5 rounded font-bold">三合會照</span>;
  } else if (isFlank) {
    ringClasses = 'border border-dashed border-[#8d7c68] dark:border-[#524b42]';
  }

  return (
    <div
      onClick={onSelect}
      className={`${gridClass} relative p-1 sm:p-2 rounded-lg cursor-pointer transition-all duration-150 flex flex-col justify-between overflow-hidden font-serif select-none
        bg-white dark:bg-[#171820] ${ringClasses}`}
    >
      {/* Top Banner: Relationship tag & Overlapping Layer Tag */}
      <div className="flex items-center justify-between mb-0.5 sm:mb-1 gap-0.5 sm:gap-1">
        <div className="flex items-center gap-0.5 sm:gap-1">
          {relationBadge}
          {overlappingName && (
            <span className="bg-[#efe7d8] dark:bg-[#2b2721] text-[#78261e] dark:text-[#df756b] border border-[#d6c7af] dark:border-[#42372f] text-[9px] sm:text-[10px] px-0.5 sm:px-1 py-0.2 rounded font-bold">
              {overlappingName}
            </span>
          )}
        </div>
        {palace.isBodyPalace && (
          <span className="bg-[#b83426] text-white text-[9px] sm:text-[10px] px-1 py-0.2 rounded font-bold shadow-xs">
            身宮
          </span>
        )}
      </div>

      {/* Main Stars Area (Top-Left aligned like WenMo TianJi) */}
      <div className="flex flex-wrap gap-x-1 sm:gap-x-2 gap-y-0.5 sm:gap-y-1 my-0.5 sm:my-1">
        {palace.majorStars.map((star, sIdx) => {
          const brightClass = star.brightness ? BRIGHTNESS_COLORS[star.brightness] || '' : '';
          return (
            <div key={sIdx} className="flex items-center gap-0.5">
              <span className="font-bold text-xs sm:text-sm text-[#2b2723] dark:text-[#f2efe9]">
                {star.name}
              </span>
              {star.brightness && (
                <span className={`text-[9px] sm:text-[10px] ${brightClass}`}>
                  {star.brightness}
                </span>
              )}
              {star.mutagen && (
                <span className={`text-[8px] sm:text-[9px] px-0.5 sm:px-1 py-0.2 rounded font-bold border ${MUTAGEN_BADGE_STYLE[star.mutagen as MutagenType] || ''}`}>
                  {star.mutagen}
                </span>
              )}
            </div>
          );
        })}
        {palace.majorStars.length === 0 && (
          <span className="text-[10px] sm:text-xs text-[#9c9588] dark:text-[#78736a] italic">
            空宮 (借對宮)
          </span>
        )}
      </div>

      {/* Minor & Lucky/Harmful Stars (Middle row) */}
      <div className="flex flex-wrap gap-x-1 sm:gap-x-1.5 gap-y-0.5 text-[9px] sm:text-[11px] my-0.5 sm:my-1 text-[#666055] dark:text-[#a8a296]">
        {palace.minorStars.map((star, mIdx) => {
          const isHarmful = ['擎羊', '陀羅', '火星', '鈴星', '地空', '地劫'].includes(star.name);
          const isLucky = ['天魁', '天鉞', '左輔', '右弼', '文昌', '文曲', '祿存', '天馬'].includes(star.name);
          
          let starColor = 'text-[#595349] dark:text-[#b4aea2]';
          if (isHarmful) starColor = 'text-[#9c2e22] dark:text-[#e07b72] font-semibold';
          if (isLucky) starColor = 'text-[#2a5d7c] dark:text-[#64b5f6] font-semibold';

          return (
            <span key={mIdx} className={`inline-flex items-center ${starColor}`}>
              <span>{star.name}</span>
              {star.brightness && <span className="text-[8px] sm:text-[9px] opacity-75 ml-0.5">{star.brightness}</span>}
              {star.mutagen && (
                <span className={`text-[8px] sm:text-[9px] px-0.5 sm:px-1 py-0.2 rounded font-bold border ml-0.5 ${MUTAGEN_BADGE_STYLE[star.mutagen as MutagenType] || 'bg-[#0284c7] text-white'}`}>
                  {star.mutagen}
                </span>
              )}
            </span>
          );
        })}

        {/* Adjective Stars */}
        {palace.adjectiveStars.slice(0, 4).map((star, aIdx) => (
          <span key={aIdx} className="text-[#8c8477] dark:text-[#78746c] text-[8px] sm:text-[10px]">
            {star.name}
          </span>
        ))}
      </div>

      {/* Self Mutagens (自化) */}
      {palace.selfMutagens.length > 0 && (
        <div className="my-0.5 flex flex-wrap gap-0.5 sm:gap-1">
          {palace.selfMutagens.map((sm, smIdx) => (
            <span
              key={smIdx}
              className={`text-[8px] sm:text-[10px] px-0.5 sm:px-1 rounded border font-semibold ${SELF_MUTAGEN_STYLE[sm.mutagen] || 'text-[#79287c] dark:text-[#ce7fe2] bg-[#f5eef7] dark:bg-[#251929] border-[#e2d0e6]'}`}
            >
              {sm.star}自化{sm.mutagen}
            </span>
          ))}
        </div>
      )}

      {/* Ages & Decade Ranges */}
      <div className="flex items-center justify-between text-[8px] sm:text-[10px] text-[#8c8477] dark:text-[#888379] pt-0.5 sm:pt-1 border-t border-[#eee7da] dark:border-[#252733] font-mono">
        <div>
          <span>大限: </span>
          <b className="text-[#2b2723] dark:text-[#ddd]">{palace.decadalRange[0]}~{palace.decadalRange[1]}</b>
        </div>
        <div className="truncate max-w-[50px] sm:max-w-[90px]" title={palace.ages.join(', ')}>
          <span>小限: </span>
          <span>{palace.ages.slice(0, 3).join(',')}...</span>
        </div>
      </div>

      {/* Bottom Footer: God stars, Heavenly Stem, Earthly Branch, Palace Name */}
      <div className="flex items-end justify-between pt-0.5 sm:pt-1 text-xs">
        {/* Twelve Gods */}
        <div className="flex flex-col text-[8px] sm:text-[10px] leading-tight text-[#8c8477] dark:text-[#7c776e]">
          <span>{palace.boshi12} · {palace.changsheng12}</span>
          <span>{palace.suiqian12 || palace.jiangqian12}</span>
        </div>

        {/* Stem Branch & Palace Name */}
        <div className="text-right">
          <div className="text-[10px] sm:text-[11px] text-[#6b6459] dark:text-[#a09a8f] font-mono">
            {palace.heavenlyStem}{palace.earthlyBranch}
          </div>
          <div className="text-xs sm:text-base font-bold text-[#9c2e22] dark:text-[#df756b]">
            {palace.name}
          </div>
        </div>
      </div>

    </div>
  );
};
