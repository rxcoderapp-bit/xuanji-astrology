import React, { useState, useMemo } from 'react';
import { X, Check, User, Clock, MapPin, Settings2, AlertTriangle } from 'lucide-react';
import type { BirthInput, Gender, CalendarType } from '../types';
import { CITIES_DATA, findCityLongitude } from '../lib/citiesData';
import { calculateTrueSolarTime, formatSignedMinutes, formatTrueSolarClock } from '../lib/trueSolarTime';
import { isChinaDST, getChinaDSTRange } from '../lib/dstService';
import { 
  getStoredSchoolConfig, 
  saveStoredSchoolConfig, 
  type SchoolConfig,
  LEAP_MONTH_LABELS,
  LATE_ZISHI_LABELS,
  BRIGHTNESS_SCHOOL_LABELS
} from '../lib/schoolConfig';

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

  // 出生地點與真太陽時狀態
  const [cityName, setCityName] = useState<string>(initialValues.city || '台北市');
  const [longitude, setLongitude] = useState<number>(initialValues.longitude ?? findCityLongitude(initialValues.city || '台北市'));
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(getStoredSchoolConfig());

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
      const city = initialValues.city || '台北市';
      setCityName(city);
      setLongitude(initialValues.longitude ?? findCityLongitude(city));
      setSchoolConfig(getStoredSchoolConfig());
    }
  }, [isOpen, initialValues]);

  // 即時計算真太陽時數據
  const trueSolarInfo = useMemo(() => {
    const numHour = Number(hour) || 0;
    const numMinute = Number(minute) || 0;
    if (calendar !== 'solar') return null;

    const res = calculateTrueSolarTime({
      year: Number(year) || 2000,
      month: Number(month) || 1,
      day: Number(day) || 1,
      clockHour: numHour,
      clockMinute: numMinute,
      longitude: longitude
    });
    return res;
  }, [year, month, day, hour, minute, longitude, calendar]);

  // 檢測是否處於中國大陸歷史夏令時
  const dstNotice = useMemo(() => {
    if (calendar !== 'solar') return null;
    const y = Number(year) || 2000;
    const m = Number(month) || 1;
    const d = Number(day) || 1;
    if (isChinaDST(y, m, d)) {
      return getChinaDSTRange(y);
    }
    return null;
  }, [year, month, day, calendar]);

  if (!isOpen) return null;

  const handleCityChange = (newCity: string) => {
    setCityName(newCity);
    const lng = findCityLongitude(newCity);
    setLongitude(lng);
  };

  const handleApplyDSTMinus1Hour = () => {
    const currentH = Number(hour) || 0;
    const newH = (currentH - 1 + 24) % 24;
    setHour(newH);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanYear = Math.max(1900, Math.min(2100, Number(year) || 2000));
    const cleanMonth = Math.max(1, Math.min(12, Number(month) || 1));
    const cleanDay = Math.max(1, Math.min(31, Number(day) || 1));
    const cleanHour = Math.max(0, Math.min(23, Number(hour) || 0));
    const cleanMinute = Math.max(0, Math.min(59, Number(minute) || 0));

    // 保存流派設定
    saveStoredSchoolConfig(schoolConfig);

    onSubmit({
      name: name.trim() || '即時命盤',
      gender,
      calendar,
      year: cleanYear,
      month: cleanMonth,
      day: cleanDay,
      hour: cleanHour,
      minute: cleanMinute,
      isLeapMonth: calendar === 'lunar' ? isLeapMonth : false,
      city: cityName,
      longitude: longitude,
      trueSolarMinutesCorrection: trueSolarInfo ? Math.round(trueSolarInfo.totalCorrectionMinutes) : 0
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg my-auto rounded-2xl shadow-2xl border overflow-hidden font-serif transition
        bg-[#fcfbf7] dark:bg-[#181920] border-[#d8d0be] dark:border-[#31333f] text-[#222]">
        
        {/* Header */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b
          bg-[#f6f2e8] dark:bg-[#1e2028] border-[#e2dacb] dark:border-[#2d303c]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9c2e22]" />
            <h2 className="text-base sm:text-lg font-bold tracking-wide text-[#2b2723] dark:text-[#f4f1ec]">
              生辰排盤 ✕ 真太陽時天文校正
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
          className="p-5 sm:p-6 space-y-4 text-sm max-h-[82vh] overflow-y-auto"
        >
          {/* Quick Realtime button */}
          <div className="flex items-center justify-between text-xs bg-[#efeae0] dark:bg-[#232530] p-2.5 rounded-xl border border-[#ded5c4] dark:border-[#373949]">
            <span className="text-[#6b645b] dark:text-[#9e998f] flex items-center gap-1.5 text-[11px] sm:text-xs">
              <Clock className="w-3.5 h-3.5 text-[#9c2e22] dark:text-[#e05646]" />
              快速載入此時此刻即時盤：
            </span>
            <button
              type="button"
              onClick={handleLoadCurrentTime}
              className="px-2.5 py-1 rounded-lg bg-[#9c2e22] hover:bg-[#83251a] text-white font-medium text-xs transition flex items-center gap-1 shadow-xs"
            >
              載入當下時辰
            </button>
          </div>

          {/* Name & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#5a544b] dark:text-[#b8b3a9] mb-1">
                姓名 / 命盤標記
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="請輸入姓名"
                  className="w-full px-3 py-2 rounded-lg border outline-none font-sans text-xs sm:text-sm
                    bg-white dark:bg-[#121318] border-[#d4cbba] dark:border-[#383a48]
                    text-[#222] dark:text-[#eee] focus:border-[#9c2e22]"
                />
                <User className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5a544b] dark:text-[#b8b3a9] mb-1">
                生理性別
              </label>
              <div className="grid grid-cols-2 gap-2 h-[38px]">
                <button
                  type="button"
                  onClick={() => setGender('男')}
                  className={`rounded-lg border font-bold transition flex items-center justify-center text-xs
                    ${gender === '男'
                      ? 'bg-[#2a5d7c] text-white border-[#224b64]'
                      : 'bg-white dark:bg-[#121318] text-[#555] dark:text-[#bbb] border-[#d4cbba] dark:border-[#383a48]'}`}
                >
                  乾造 (男)
                </button>
                <button
                  type="button"
                  onClick={() => setGender('女')}
                  className={`rounded-lg border font-bold transition flex items-center justify-center text-xs
                    ${gender === '女'
                      ? 'bg-[#a3375c] text-white border-[#872a4a]'
                      : 'bg-white dark:bg-[#121318] text-[#555] dark:text-[#bbb] border-[#d4cbba] dark:border-[#383a48]'}`}
                >
                  坤造 (女)
                </button>
              </div>
            </div>
          </div>

          {/* 出生地選擇與經度 (真太陽時必備) */}
          <div className="p-3 rounded-xl bg-white dark:bg-[#14151b] border border-[#ded5c5] dark:border-[#2f3242] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#5a544b] dark:text-[#b8b3a9]">
              <span className="flex items-center gap-1.5 text-[#8d271c] dark:text-[#ef5350]">
                <MapPin className="w-3.5 h-3.5" />
                出生地城市 (真太陽時經度校正)
              </span>
              <span className="text-[10px] text-[#888] font-mono">
                {cityName} · 東經 {longitude}°
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={cityName}
                onChange={e => handleCityChange(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border text-xs bg-white dark:bg-[#1c1d25] border-[#d4cbba] dark:border-[#383a48] text-[#222] dark:text-[#eee] outline-none"
              >
                {CITIES_DATA.map(group => (
                  <optgroup key={group.region} label={`【${group.region}】`}>
                    {group.cities.map(c => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.longitude >= 0 ? `東經${c.longitude}°` : `西經${Math.abs(c.longitude)}°`})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#777] shrink-0">自訂經度:</span>
                <input
                  type="number"
                  step="0.1"
                  min="-180"
                  max="180"
                  value={longitude}
                  onChange={e => setLongitude(parseFloat(e.target.value) || 120)}
                  className="w-full px-2 py-1 rounded border text-xs font-mono bg-white dark:bg-[#1c1d25] border-[#d4cbba] dark:border-[#383a48] text-[#222] dark:text-[#eee]"
                />
              </div>
            </div>

            {/* 真太陽時天文時差實時計算預覽 */}
            {trueSolarInfo && (
              <div className="p-2 rounded-lg bg-[#f9f6ef] dark:bg-[#1e202a] border border-[#e8ded0] dark:border-[#2e3142] text-[11px] text-[#554e44] dark:text-[#bbb] space-y-1">
                <div className="flex items-center justify-between font-bold text-[#8d271c] dark:text-[#ef5350]">
                  <span>地方真太陽時：{formatTrueSolarClock(trueSolarInfo)} ({trueSolarInfo.branchName}時)</span>
                  <span className="text-[10px] font-mono bg-[#8d271c]/10 px-1.5 py-0.5 rounded">
                    天文總時差: {formatSignedMinutes(trueSolarInfo.totalCorrectionMinutes)}
                  </span>
                </div>
                <div className="text-[10px] text-[#777] dark:text-[#999] flex items-center justify-between">
                  <span>經度差: {formatSignedMinutes(trueSolarInfo.longitudeCorrectionMinutes)}</span>
                  <span>均時差 (NOAA EOT): {formatSignedMinutes(trueSolarInfo.equationOfTimeMinutes)}</span>
                </div>
              </div>
            )}
          </div>

          {/* 歷史夏令時警示浮層 */}
          {dstNotice && (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2 shadow-2xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold">歷史夏令時期間提醒 ({dstNotice.start} ~ {dstNotice.end})</div>
                <p className="text-[11px] leading-relaxed">
                  該公曆日期處於夏令時實施期間（鐘錶撥快 1 小時）。若您的出生時間記錄為當時的夏令時讀數，可點擊下方按鈕扣除 1 小時換算為平太陽時：
                </p>
                <button
                  type="button"
                  onClick={handleApplyDSTMinus1Hour}
                  className="px-2.5 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] transition shadow-2xs"
                >
                  一鍵扣除 1 小時 (改為 {(Number(hour) - 1 + 24) % 24}:30)
                </button>
              </div>
            </div>
          )}

          {/* Calendar Picker */}
          <div>
            <label className="block text-xs font-semibold text-[#5a544b] dark:text-[#b8b3a9] mb-1">
              曆法模式
            </label>
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-1.5 cursor-pointer text-[#333] dark:text-[#ddd] text-xs">
                <input
                  type="radio"
                  checked={calendar === 'solar'}
                  onChange={() => setCalendar('solar')}
                  className="accent-[#9c2e22]"
                />
                國曆 / 陽曆 (公曆)
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-[#333] dark:text-[#ddd] text-xs">
                <input
                  type="radio"
                  checked={calendar === 'lunar'}
                  onChange={() => setCalendar('lunar')}
                  className="accent-[#9c2e22]"
                />
                農曆 / 陰曆 (夏曆)
              </label>
              {calendar === 'lunar' && (
                <label className="flex items-center gap-1 cursor-pointer text-xs ml-auto text-[#9c2e22] dark:text-[#df756b] font-bold">
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
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs text-[#6e675c] dark:text-[#9e998f] mb-1">出生年</label>
              <input
                type="number"
                min="1900"
                max="2100"
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border font-mono text-xs sm:text-sm bg-white dark:bg-[#121318] border-[#d4cbba] dark:border-[#383a48] text-[#222] dark:text-[#eee]"
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
                className="w-full px-3 py-2 rounded-lg border font-mono text-xs sm:text-sm bg-white dark:bg-[#121318] border-[#d4cbba] dark:border-[#383a48] text-[#222] dark:text-[#eee]"
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
                className="w-full px-3 py-2 rounded-lg border font-mono text-xs sm:text-sm bg-white dark:bg-[#121318] border-[#d4cbba] dark:border-[#383a48] text-[#222] dark:text-[#eee]"
              />
            </div>
          </div>

          {/* Time Picker */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-[#5a544b] dark:text-[#b8b3a9]">
                鐘錶出生時間 (24小時制)
              </label>
              <span className="text-[11px] text-[#877f72] dark:text-[#888]">
                23:00 起進入子時
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 mb-2">
              <div>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hour === '' ? '' : hour}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '') setHour('' as any);
                    else {
                      const n = parseInt(val, 10);
                      if (!isNaN(n)) setHour(Math.max(0, Math.min(23, n)));
                    }
                  }}
                  onBlur={() => {
                    if (hour === '' || isNaN(Number(hour))) setHour(0);
                  }}
                  placeholder="時 (0-23)"
                  className="w-full px-3 py-2 rounded-lg border font-mono text-xs sm:text-sm bg-white dark:bg-[#121318] border-[#d4cbba] dark:border-[#383a48] text-[#222] dark:text-[#eee]"
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
                    if (val === '') setMinute('' as any);
                    else {
                      const n = parseInt(val, 10);
                      if (!isNaN(n)) setMinute(Math.max(0, Math.min(59, n)));
                    }
                  }}
                  onBlur={() => {
                    if (minute === '' || isNaN(Number(minute))) setMinute(0);
                  }}
                  placeholder="分 (0-59)"
                  className="w-full px-3 py-2 rounded-lg border font-mono text-xs sm:text-sm bg-white dark:bg-[#121318] border-[#d4cbba] dark:border-[#383a48] text-[#222] dark:text-[#eee]"
                />
              </div>
            </div>

            {/* Quick 12 Chinese Hours */}
            <div className="mt-2">
              <span className="text-[11px] text-[#736c61] dark:text-[#9c968b] block mb-1">
                快速點選十二地支時辰：
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 text-xs">
                {CHINESE_HOURS.map(ch => (
                  <button
                    key={ch.name}
                    type="button"
                    onClick={() => handleSelectChineseHour(ch.hour, ch.minute)}
                    className="p-1 rounded text-center border font-sans text-xs transition
                      bg-white/70 dark:bg-[#121318]/70 hover:bg-[#ede6d8] dark:hover:bg-[#282a36]
                      border-[#ded5c5] dark:border-[#353746] text-[#444] dark:text-[#ccc]"
                  >
                    {ch.name.substring(0, 2)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 進階排盤流派口徑開關 Accordion */}
          <div className="pt-2 border-t border-[#e2dacb] dark:border-[#2d303c]">
            <button
              type="button"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="w-full flex items-center justify-between text-xs text-[#706456] dark:text-[#a09a8f] font-bold hover:text-[#9c2e22]"
            >
              <span className="flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5" />
                排盤流派口徑自訂設置 (閏月/晚子時/亮度)
              </span>
              <span>{showAdvancedSettings ? '▲ 收合' : '▼ 展開'}</span>
            </button>

            {showAdvancedSettings && (
              <div className="mt-2.5 p-3 rounded-xl bg-[#f5ede2] dark:bg-[#15161f] border border-[#e2d6c0] dark:border-[#2b2d3d] space-y-2.5 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#554e44] dark:text-[#ccc] mb-1">
                    閏月處理口徑：
                  </label>
                  <select
                    value={schoolConfig.leapMonthRule}
                    onChange={e => setSchoolConfig({ ...schoolConfig, leapMonthRule: e.target.value as any })}
                    className="w-full p-1.5 rounded border text-xs bg-white dark:bg-[#1c1d25] border-[#d4cbba] dark:border-[#383a48] text-[#222] dark:text-[#eee]"
                  >
                    {Object.entries(LEAP_MONTH_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#554e44] dark:text-[#ccc] mb-1">
                    晚子時 (23:00~23:59) 換日口徑：
                  </label>
                  <select
                    value={schoolConfig.lateZishiRule}
                    onChange={e => setSchoolConfig({ ...schoolConfig, lateZishiRule: e.target.value as any })}
                    className="w-full p-1.5 rounded border text-xs bg-white dark:bg-[#1c1d25] border-[#d4cbba] dark:border-[#383a48] text-[#222] dark:text-[#eee]"
                  >
                    {Object.entries(LATE_ZISHI_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#554e44] dark:text-[#ccc] mb-1">
                    星曜廟旺利陷標準：
                  </label>
                  <select
                    value={schoolConfig.brightnessSchool}
                    onChange={e => setSchoolConfig({ ...schoolConfig, brightnessSchool: e.target.value as any })}
                    className="w-full p-1.5 rounded border text-xs bg-white dark:bg-[#1c1d25] border-[#d4cbba] dark:border-[#383a48] text-[#222] dark:text-[#eee]"
                  >
                    {Object.entries(BRIGHTNESS_SCHOOL_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Submit buttons */}
          <div className="pt-2 flex justify-end gap-3 border-t border-[#e2dacb] dark:border-[#2d303c]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#cfc6b4] dark:border-[#3a3d4c] text-[#555] dark:text-[#bbb] hover:bg-gray-100 dark:hover:bg-[#252733] text-xs"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg font-bold shadow-md transition flex items-center gap-1.5 text-xs sm:text-sm
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
