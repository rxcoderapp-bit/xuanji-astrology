import React, { useState } from 'react';
import { 
  FolderOpen, BookmarkPlus, 
  ChevronDown, ChevronUp, User
} from 'lucide-react';
import type { BirthInput, Gender, CalendarType } from '../types';

interface QuickBirthBarProps {
  birthInput: BirthInput;
  onChangeBirth: (updated: BirthInput) => void;
  onOpenDatabase: () => void;
  onSaveCurrentAsCase: () => void;
}

const CHINESE_HOURS = [
  { branch: '子', name: '子時', range: '23:00-00:59', hour: 23, minute: 30 },
  { branch: '丑', name: '丑時', range: '01:00-02:59', hour: 1, minute: 30 },
  { branch: '寅', name: '寅時', range: '03:00-04:59', hour: 3, minute: 30 },
  { branch: '卯', name: '卯時', range: '05:00-06:59', hour: 5, minute: 30 },
  { branch: '辰', name: '辰時', range: '07:00-08:59', hour: 7, minute: 30 },
  { branch: '巳', name: '巳時', range: '09:00-10:59', hour: 9, minute: 30 },
  { branch: '午', name: '午時', range: '11:00-12:59', hour: 11, minute: 30 },
  { branch: '未', name: '未時', range: '13:00-14:59', hour: 13, minute: 30 },
  { branch: '申', name: '申時', range: '15:00-16:59', hour: 15, minute: 30 },
  { branch: '酉', name: '酉時', range: '17:00-18:59', hour: 17, minute: 30 },
  { branch: '戌', name: '戌時', range: '19:00-20:59', hour: 19, minute: 30 },
  { branch: '亥', name: '亥時', range: '21:00-22:59', hour: 21, minute: 30 },
];

export const QuickBirthBar: React.FC<QuickBirthBarProps> = ({
  birthInput,
  onChangeBirth,
  onOpenDatabase,
  onSaveCurrentAsCase
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Helper to determine active Chinese Hour branch
  const activeBranch = (() => {
    const h = birthInput.hour;
    if (h >= 23 || h < 1) return '子';
    if (h >= 1 && h < 3) return '丑';
    if (h >= 3 && h < 5) return '寅';
    if (h >= 5 && h < 7) return '卯';
    if (h >= 7 && h < 9) return '辰';
    if (h >= 9 && h < 11) return '巳';
    if (h >= 11 && h < 13) return '午';
    if (h >= 13 && h < 15) return '未';
    if (h >= 15 && h < 17) return '申';
    if (h >= 17 && h < 19) return '酉';
    if (h >= 19 && h < 21) return '戌';
    return '亥';
  })();

  const handleHourSelect = (h: number, m: number) => {
    onChangeBirth({
      ...birthInput,
      hour: h,
      minute: m
    });
  };

  const handleGenderToggle = (g: Gender) => {
    onChangeBirth({ ...birthInput, gender: g });
  };

  const handleCalendarToggle = (c: CalendarType) => {
    onChangeBirth({ ...birthInput, calendar: c });
  };

  return (
    <section className="w-full bg-[#fbf9f4] dark:bg-[#14151b] border-b border-[#e2d9c8] dark:border-[#262835] font-serif transition-colors">
      <div className="max-w-[1680px] mx-auto px-3 sm:px-6 py-2.5">
        
        {/* Top Control Bar: Name, Gender, Calendar, Date, Database buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Left: Basic inputs */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            
            {/* Name Input */}
            <div className="flex items-center gap-1 bg-white dark:bg-[#1b1c24] px-2 py-1 rounded-md border border-[#d6ccb8] dark:border-[#353746]">
              <User className="w-3.5 h-3.5 text-[#8d271c] dark:text-[#df756b]" />
              <input
                type="text"
                value={birthInput.name}
                onChange={e => onChangeBirth({ ...birthInput, name: e.target.value })}
                className="w-20 sm:w-24 bg-transparent outline-none font-bold text-[#222] dark:text-[#eee]"
                placeholder="命主姓名"
                title="輸入姓名"
              />
            </div>

            {/* Gender Toggle */}
            <div className="flex rounded-md border border-[#d6ccb8] dark:border-[#353746] overflow-hidden">
              <button
                type="button"
                onClick={() => handleGenderToggle('男')}
                className={`px-2.5 py-1 text-xs font-bold transition
                  ${birthInput.gender === '男'
                    ? 'bg-[#2a5d7c] text-white'
                    : 'bg-white dark:bg-[#1b1c24] text-[#666] dark:text-[#aaa]'}`}
              >
                乾 (男)
              </button>
              <button
                type="button"
                onClick={() => handleGenderToggle('女')}
                className={`px-2.5 py-1 text-xs font-bold transition
                  ${birthInput.gender === '女'
                    ? 'bg-[#a3375c] text-white'
                    : 'bg-white dark:bg-[#1b1c24] text-[#666] dark:text-[#aaa]'}`}
              >
                坤 (女)
              </button>
            </div>

            {/* Calendar Mode */}
            <div className="flex rounded-md border border-[#d6ccb8] dark:border-[#353746] overflow-hidden">
              <button
                type="button"
                onClick={() => handleCalendarToggle('solar')}
                className={`px-2.5 py-1 text-xs font-bold transition
                  ${birthInput.calendar === 'solar'
                    ? 'bg-[#8d271c] text-white'
                    : 'bg-white dark:bg-[#1b1c24] text-[#666] dark:text-[#aaa]'}`}
              >
                陽曆
              </button>
              <button
                type="button"
                onClick={() => handleCalendarToggle('lunar')}
                className={`px-2.5 py-1 text-xs font-bold transition
                  ${birthInput.calendar === 'lunar'
                    ? 'bg-[#8d271c] text-white'
                    : 'bg-white dark:bg-[#1b1c24] text-[#666] dark:text-[#aaa]'}`}
              >
                農曆
              </button>
            </div>

            {/* Leap Month checkbox if Lunar */}
            {birthInput.calendar === 'lunar' && (
              <label className="flex items-center gap-1 cursor-pointer text-xs text-[#8d271c] dark:text-[#df756b] font-bold">
                <input
                  type="checkbox"
                  checked={birthInput.isLeapMonth ?? false}
                  onChange={e => onChangeBirth({ ...birthInput, isLeapMonth: e.target.checked })}
                  className="accent-[#8d271c]"
                />
                閏月
              </label>
            )}

            {/* Date Quick Inputs */}
            <div className="flex items-center gap-1 bg-white dark:bg-[#1b1c24] px-2.5 py-1 rounded-md border border-[#d6ccb8] dark:border-[#353746] font-mono text-xs shadow-2xs">
              <input
                type="number"
                min="1900"
                max="2100"
                value={birthInput.year}
                onChange={e => onChangeBirth({ ...birthInput, year: Number(e.target.value) })}
                className="w-12 bg-transparent outline-none text-center text-[#222] dark:text-[#eee] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                title="年份"
              />
              <span className="text-[#777] font-serif text-[11px]">年</span>
              <input
                type="number"
                min="1"
                max="12"
                value={birthInput.month}
                onChange={e => onChangeBirth({ ...birthInput, month: Number(e.target.value) })}
                className="w-7 bg-transparent outline-none text-center text-[#222] dark:text-[#eee] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                title="月份"
              />
              <span className="text-[#777] font-serif text-[11px]">月</span>
              <input
                type="number"
                min="1"
                max="31"
                value={birthInput.day}
                onChange={e => onChangeBirth({ ...birthInput, day: Number(e.target.value) })}
                className="w-7 bg-transparent outline-none text-center text-[#222] dark:text-[#eee] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                title="日期"
              />
              <span className="text-[#777] font-serif text-[11px]">日</span>
            </div>

            {/* Exact minute/hour & Chinese Hour (時辰) Badge */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-[#1b1c24] px-2.5 py-1 rounded-md border border-[#d6ccb8] dark:border-[#353746] shadow-2xs">
              <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-[#8d271c] text-white tracking-wider shrink-0" title="當前對應出生時辰">
                {activeBranch}時
              </span>
              <div className="flex items-center font-mono text-xs font-semibold text-[#222] dark:text-[#eee]">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={birthInput.hour}
                  onChange={e => onChangeBirth({ ...birthInput, hour: Math.max(0, Math.min(23, Number(e.target.value) || 0)) })}
                  className="w-7 bg-transparent outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  title="時 (0~23)"
                />
                <span className="text-[#888] font-bold px-0.5">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={String(birthInput.minute).padStart(2, '0')}
                  onChange={e => onChangeBirth({ ...birthInput, minute: Math.max(0, Math.min(59, Number(e.target.value) || 0)) })}
                  className="w-7 bg-transparent outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  title="分 (0~59)"
                />
              </div>
            </div>

          </div>

          {/* Right: Database & Toggle Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Save Current Chart to Database Button */}
            <button
              type="button"
              onClick={onSaveCurrentAsCase}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition shadow-xs border
                bg-white dark:bg-[#1e2029] text-[#2a5d7c] dark:text-[#64b5f6] border-[#cbd8e2] dark:border-[#2f3f50] hover:bg-[#f0f6fa] dark:hover:bg-[#253342]"
              title="將當前排盤存入命例庫"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-[#2a5d7c] dark:text-[#64b5f6]" />
              <span className="hidden sm:inline">存為命例</span>
            </button>

            {/* Open Database Management Modal */}
            <button
              type="button"
              onClick={onOpenDatabase}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition shadow-xs border
                bg-[#8d271c] text-white border-[#701e15] hover:bg-[#782017]"
              title="開啟命例庫資料庫（查閱、增刪修）"
            >
              <FolderOpen className="w-3.5 h-3.5 text-white" />
              <span>命例庫</span>
            </button>

            {/* Collapse/Expand Toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 sm:p-1.5 rounded-lg border text-[#666] dark:text-[#aaa] border-[#d6ccb8] dark:border-[#353746] hover:bg-[#ede5d4] dark:hover:bg-[#252733]"
              title={isExpanded ? '收合時辰列' : '展開時辰列'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

          </div>

        </div>

        {/* Bottom: The 12 Chinese Hours (時辰) Selectors */}
        {isExpanded && (
          <div className="mt-2 sm:mt-2.5 pt-2 border-t border-[#ede3d1] dark:border-[#242633] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-[#8d271c] dark:text-[#df756b] whitespace-nowrap flex items-center gap-1 shrink-0">
              出生時辰排盤：
            </span>
            <div className="flex gap-1.5 flex-nowrap shrink-0">
              {CHINESE_HOURS.map(ch => {
                const isActive = activeBranch === ch.branch;
                return (
                  <button
                    key={ch.branch}
                    type="button"
                    onClick={() => handleHourSelect(ch.hour, ch.minute)}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs transition border flex flex-col items-center justify-center whitespace-nowrap min-w-[56px] sm:min-w-[62px] shadow-2xs
                      ${isActive
                        ? 'bg-[#8d271c] text-white border-[#691c13] font-bold shadow-sm ring-1 ring-[#8d271c]'
                        : 'bg-white dark:bg-[#1a1b22] text-[#443f38] dark:text-[#ccc] border-[#ded4c1] dark:border-[#313340] hover:bg-[#ede3d1] dark:hover:bg-[#282a36]'}`}
                    title={`${ch.name} (${ch.range})`}
                  >
                    <span className="text-xs font-bold tracking-wider">{ch.name}</span>
                    <span className={`text-[10px] font-mono mt-0.5 ${isActive ? 'text-[#ffd2cd]' : 'text-[#8c8477] dark:text-[#888]'}`}>
                      {ch.range.split('-')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
