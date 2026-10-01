import React, { useState } from 'react';
import { X, Check, User, Clock } from 'lucide-react';
import type { BirthInput, Gender, CalendarType } from '../types';

interface BirthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: BirthInput) => void;
  initialValues: BirthInput;
}

const CHINESE_HOURS = [
  { name: '子時 (23:00 - 00:59)', hour: 23, minute: 30 },
  { name: '丑時 (01:00 - 02:59)', hour: 1, minute: 30 },
  { name: '寅時 (03:00 - 04:59)', hour: 3, minute: 30 },
  { name: '卯時 (05:00 - 06:59)', hour: 5, minute: 30 },
  { name: '辰時 (07:00 - 08:59)', hour: 7, minute: 30 },
  { name: '巳時 (09:00 - 10:59)', hour: 9, minute: 30 },
  { name: '午時 (11:00 - 12:59)', hour: 11, minute: 30 },
  { name: '未時 (13:00 - 14:59)', hour: 13, minute: 30 },
  { name: '申時 (15:00 - 16:59)', hour: 15, minute: 30 },
  { name: '酉時 (17:00 - 18:59)', hour: 17, minute: 30 },
  { name: '戌時 (19:00 - 20:59)', hour: 19, minute: 30 },
  { name: '亥時 (21:00 - 22:59)', hour: 21, minute: 30 },
];

export const BirthModal: React.FC<BirthModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues
}) => {
  const [name, setName] = useState(initialValues.name);
  const [gender, setGender] = useState<Gender>(initialValues.gender);
  const [calendar, setCalendar] = useState<CalendarType>(initialValues.calendar);
  const [year, setYear] = useState(initialValues.year);
  const [month, setMonth] = useState(initialValues.month);
  const [day, setDay] = useState(initialValues.day);
  const [hour, setHour] = useState<number | string>(initialValues.hour);
  const [minute, setMinute] = useState<number | string>(initialValues.minute);
  const [isLeapMonth, setIsLeapMonth] = useState(initialValues.isLeapMonth ?? false);

  // Synchronize when modal is opened or initialValues change
  React.useEffect(() => {
    if (isOpen) {
      setName(initialValues.name);
      setGender(initialValues.gender);
      setCalendar(initialValues.calendar);
      setYear(initialValues.year);
      setMonth(initialValues.month);
      setDay(initialValues.day);
      setHour(initialValues.hour);
      setMinute(initialValues.minute);
      setIsLeapMonth(initialValues.isLeapMonth ?? false);
    }
  }, [isOpen, initialValues]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanYear = Math.max(1900, Math.min(2100, Number(year) || 2000));
    const cleanMonth = Math.max(1, Math.min(12, Number(month) || 1));
    const cleanDay = Math.max(1, Math.min(31, Number(day) || 1));
    const cleanHour = Math.max(0, Math.min(23, Number(hour) || 0));
    const cleanMinute = Math.max(0, Math.min(59, Number(minute) || 0));

    onSubmit({
      name: name.trim() || '即時命盤',
      gender,
      calendar,
      year: cleanYear,
      month: cleanMonth,
      day: cleanDay,
      hour: cleanHour,
      minute: cleanMinute,
      isLeapMonth: calendar === 'lunar' ? isLeapMonth : false
    });
    onClose();
  };

  const handleSelectChineseHour = (h: number, m: number) => {
    setHour(h);
    setMinute(m);
  };

  const handleLoadCurrentTime = () => {
    const now = new Date();
    setName('即時命盤');
    setGender('男');
    setCalendar('solar');
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    setDay(now.getDate());
    setHour(now.getHours());
    setMinute(now.getMinutes());
    setIsLeapMonth(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden font-serif transition
        bg-[#fcfbf7] dark:bg-[#181920] border-[#d8d0be] dark:border-[#31333f] text-[#222]">
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b
          bg-[#f6f2e8] dark:bg-[#1e2028] border-[#e2dacb] dark:border-[#2d303c]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9c2e22]" />
            <h2 className="text-lg font-bold tracking-wide text-[#2b2723] dark:text-[#f4f1ec]">
              生辰排盤八字輸入
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#756f66] hover:text-[#222] dark:text-[#a19c92] dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          className="p-6 space-y-5 text-sm"
        >
          
          {/* Quick Realtime button */}
          <div className="flex items-center justify-between text-xs bg-[#efeae0] dark:bg-[#232530] p-2.5 rounded-lg border border-[#ded5c4] dark:border-[#373949]">
            <span className="text-[#6b645b] dark:text-[#9e998f] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#9c2e22] dark:text-[#e05646]" />
              快速設定當下即時時辰：
            </span>
            <button
              type="button"
              onClick={handleLoadCurrentTime}
              className="px-2.5 py-1 rounded bg-[#9c2e22] hover:bg-[#83251a] text-white font-medium transition flex items-center gap-1 shadow-sm"
            >
              載入當下此時此刻 (即時排盤)
            </button>
          </div>

          {/* Name & Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5a544b] dark:text-[#b8b3a9] mb-1.5">
                姓名 / 命盤標記
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="請輸入姓名"
                  className="w-full px-3 py-2 rounded-lg border outline-none font-sans
                    bg-white dark:bg-[#121318] border-[#d4cbba] dark:border-[#383a48]
                    text-[#222] dark:text-[#eee] focus:border-[#9c2e22]"
                />
                <User className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5a544b] dark:text-[#b8b3a9] mb-1.5">
                生理性別
              </label>
              <div className="grid grid-cols-2 gap-2 h-[38px]">
                <button
                  type="button"
                  onClick={() => setGender('男')}
                  className={`rounded-lg border font-bold transition flex items-center justify-center gap-1
                    ${gender === '男'
                      ? 'bg-[#2a5d7c] text-white border-[#224b64]'
                      : 'bg-white dark:bg-[#121318] text-[#555] dark:text-[#bbb] border-[#d4cbba] dark:border-[#383a48]'}`}
                >
                  乾造 (男)
                </button>
                <button
                  type="button"
                  onClick={() => setGender('女')}
                  className={`rounded-lg border font-bold transition flex items-center justify-center gap-1
                    ${gender === '女'
                      ? 'bg-[#a3375c] text-white border-[#872a4a]'
                      : 'bg-white dark:bg-[#121318] text-[#555] dark:text-[#bbb] border-[#d4cbba] dark:border-[#383a48]'}`}
                >
                  坤造 (女)
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Picker */}
          <div>
            <label className="block text-xs font-semibold text-[#5a544b] dark:text-[#b8b3a9] mb-1.5">
              曆法模式
            </label>
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2 cursor-pointer text-[#333] dark:text-[#ddd]">
                <input
                  type="radio"
                  checked={calendar === 'solar'}
                  onChange={() => setCalendar('solar')}
                  className="accent-[#9c2e22]"
                />
                國曆 / 陽曆 (公曆)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-[#333] dark:text-[#ddd]">
                <input
                  type="radio"
                  checked={calendar === 'lunar'}
                  onChange={() => setCalendar('lunar')}
                  className="accent-[#9c2e22]"
                />
                農曆 / 陰曆 (夏曆)
              </label>
              {calendar === 'lunar' && (
                <label className="flex items-center gap-1.5 cursor-pointer text-xs ml-auto text-[#9c2e22] dark:text-[#df756b] font-bold">
                  <input
                    type="checkbox"
                    checked={isLeapMonth}
                    onChange={e => setIsLeapMonth(e.target.checked)}
                    className="accent-[#9c2e22]"
                  />
                  當月為閏月
                </label>
              )}
            </div>
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-[#6e675c] dark:text-[#9e998f] mb-1">出生年</label>
              <input
                type="number"
                min="1900"
                max="2100"
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border font-mono bg-white dark:bg-[#121318] border-[#d4cbba] dark:border-[#383a48] text-[#222] dark:text-[#eee]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6e675c] dark:text-[#9e998f] mb-1">出生月</label>
              <input
                type="number"
                min="1"
                max="12"
                value={month}
                onChange={e => setMonth(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border font-mono bg-white dark:bg-[#121318] border-[#d4cbba] dark:border-[#383a48] text-[#222] dark:text-[#eee]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6e675c] dark:text-[#9e998f] mb-1">出生日</label>
              <input
                type="number"
                min="1"
                max="31"
                value={day}
                onChange={e => setDay(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border font-mono bg-white dark:bg-[#121318] border-[#d4cbba] dark:border-[#383a48] text-[#222] dark:text-[#eee]"
              />
            </div>
          </div>

          {/* Time Picker */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-[#5a544b] dark:text-[#b8b3a9]">
                出生時間 (時與分)
              </label>
              <span className="text-xs text-[#877f72] dark:text-[#888]">
                23:00 起即進入隔日子時
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hour === '' ? '' : hour}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '') {
                      setHour('' as any);
                    } else {
                      const n = parseInt(val, 10);
                      if (!isNaN(n)) setHour(Math.max(0, Math.min(23, n)));
                    }
                  }}
                  onBlur={() => {
                    if (hour === '' || isNaN(Number(hour))) setHour(0);
                  }}
                  placeholder="時 (0-23)"
                  className="w-full px-3 py-2 rounded-lg border font-mono bg-white dark:bg-[#121318] border-[#d4cbba] dark:border-[#383a48] text-[#222] dark:text-[#eee]"
                />
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minute === '' ? '' : minute}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '') {
                      setMinute('' as any);
                    } else {
                      const n = parseInt(val, 10);
                      if (!isNaN(n)) setMinute(Math.max(0, Math.min(59, n)));
                    }
                  }}
                  onBlur={() => {
                    if (minute === '' || isNaN(Number(minute))) setMinute(0);
                  }}
                  placeholder="分 (0-59)"
                  className="w-full px-3 py-2 rounded-lg border font-mono bg-white dark:bg-[#121318] border-[#d4cbba] dark:border-[#383a48] text-[#222] dark:text-[#eee]"
                />
              </div>
            </div>

            {/* Quick 12 Chinese Hours */}
            <div className="mt-2">
              <span className="text-xs text-[#736c61] dark:text-[#9c968b] block mb-1">
                或快速點選十二時辰：
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 text-xs">
                {CHINESE_HOURS.map(ch => (
                  <button
                    key={ch.name}
                    type="button"
                    onClick={() => handleSelectChineseHour(ch.hour, ch.minute)}
                    className="p-1.5 rounded text-center border font-sans text-xs transition
                      bg-white/60 dark:bg-[#121318]/60 hover:bg-[#ede6d8] dark:hover:bg-[#282a36]
                      border-[#ded5c5] dark:border-[#353746] text-[#444] dark:text-[#ccc]"
                  >
                    {ch.name.substring(0, 2)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="pt-2 flex justify-end gap-3 border-t border-[#e2dacb] dark:border-[#2d303c]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#cfc6b4] dark:border-[#3a3d4c] text-[#555] dark:text-[#bbb] hover:bg-gray-100 dark:hover:bg-[#252733]"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg font-bold shadow-md transition flex items-center gap-1.5
                bg-[#9c2e22] text-white hover:bg-[#83251a] dark:bg-[#af3426] dark:hover:bg-[#962a1e]"
            >
              <Check className="w-4 h-4" />
              開始排盤解讀
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
