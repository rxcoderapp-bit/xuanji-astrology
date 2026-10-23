import React, { useState, useMemo } from 'react';
import { 
  X, Heart, Sparkles, ArrowRightLeft, Calendar, 
  CheckCircle2, Compass, RotateCcw, Flame
} from 'lucide-react';
import type { BirthInput } from '../types';
import { computeAstrolabe } from '../lib/iztroEngine';
import { computeBazi } from '../lib/baziEngine';
import { computeHemingAnalysis, type PersonChartInfo, type HemingAnalysisResult } from '../lib/hemingEngine';
import { CITIES_DATA } from '../lib/citiesData';

interface HemingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentChartInput: BirthInput;
}

export const HemingModal: React.FC<HemingModalProps> = ({
  isOpen,
  onClose,
  currentChartInput
}) => {
  // Person A defaults to current active chart
  const [personAInput, setPersonAInput] = useState<BirthInput>(() => ({
    ...currentChartInput,
    name: currentChartInput.name || '甲方'
  }));

  // Person B default template
  const [personBInput, setPersonBInput] = useState<BirthInput>(() => ({
    name: '乙方',
    gender: currentChartInput.gender === '男' ? '女' : '男',
    calendar: 'solar',
    year: currentChartInput.year,
    month: Math.max(1, (currentChartInput.month + 4) % 12 || 12),
    day: 15,
    hour: 14,
    minute: 30,
    city: '台北市',
    longitude: 121.5,
    isLeapMonth: false
  }));

  const [activeTab, setActiveTab] = useState<'overview' | 'palaces' | 'stars' | 'sihua' | 'bazi' | 'timing'>('overview');

  // Compute charts for A and B
  const personAChart = useMemo<PersonChartInfo>(() => {
    const astrolabe = computeAstrolabe(personAInput);
    const bazi = computeBazi(personAInput);
    return {
      name: personAInput.name || '甲方',
      gender: personAInput.gender,
      birthDateStr: `${personAInput.year}年${personAInput.month}月${personAInput.day}日 ${personAInput.hour}:${String(personAInput.minute).padStart(2, '0')}`,
      bazi,
      palaces: astrolabe.palaces
    };
  }, [personAInput]);

  const personBChart = useMemo<PersonChartInfo>(() => {
    const astrolabe = computeAstrolabe(personBInput);
    const bazi = computeBazi(personBInput);
    return {
      name: personBInput.name || '乙方',
      gender: personBInput.gender,
      birthDateStr: `${personBInput.year}年${personBInput.month}月${personBInput.day}日 ${personBInput.hour}:${String(personBInput.minute).padStart(2, '0')}`,
      bazi,
      palaces: astrolabe.palaces
    };
  }, [personBInput]);

  // Compute synastry
  const hemingResult = useMemo<HemingAnalysisResult>(() => {
    return computeHemingAnalysis(personAChart, personBChart);
  }, [personAChart, personBChart]);

  // Sync Person A with current active chart
  const handleSyncPersonAWithCurrent = () => {
    setPersonAInput({
      ...currentChartInput,
      name: currentChartInput.name || '甲方'
    });
  };

  // Swap A and B
  const handleSwap = () => {
    const temp = { ...personAInput };
    setPersonAInput({ ...personBInput });
    setPersonBInput(temp);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-5xl rounded-2xl shadow-2xl border flex flex-col max-h-[92vh] overflow-hidden
          bg-[#fbf9f5] dark:bg-[#14161d] border-[#d8d0bf] dark:border-[#2f3240] text-[#2c2823] dark:text-[#e5e2da]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#e5decb] dark:border-[#262833] bg-[#f5ede0]/70 dark:bg-[#1a1c24]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-600 text-white shadow-md">
              <Heart className="w-5 h-5 fill-rose-200 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#8d271c] dark:text-[#ef5350]">
                  雙人合盤 · 天命體用互看
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-serif border bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60">
                  正統古典五階合參
                </span>
              </div>
              <p className="text-xs text-[#787166] dark:text-[#959187] hidden sm:block">
                夫妻宮✕福德宮雙宮聯參 · 主星同頻對應 · 雙向生年四化飛渡 · 八字日主相生 · 婚期三階推導
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#787166] hover:bg-[#e8dec8] dark:hover:bg-[#252834] transition"
            title="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-5">

          {/* Dual Inputs Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
            
            {/* Swap Button in Center */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <button
                onClick={handleSwap}
                className="w-10 h-10 rounded-full border shadow-lg flex items-center justify-center transition active:scale-95
                  bg-[#ffffff] dark:bg-[#1e202a] border-[#d8d0bf] dark:border-[#383b4b] hover:border-rose-500 text-[#8d271c] dark:text-rose-400"
                title="交換雙方資料"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Person A Card */}
            <div className="p-3.5 sm:p-4 rounded-xl border bg-white dark:bg-[#1a1c24] border-[#e0d6c3] dark:border-[#2a2d39] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#ece4d2] dark:border-[#2a2d39]">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                    甲
                  </span>
                  <span className="font-serif font-bold text-sm">甲方（命主 A）</span>
                </div>
                <button
                  onClick={handleSyncPersonAWithCurrent}
                  className="text-xs text-[#8d271c] dark:text-rose-400 hover:underline flex items-center gap-1 font-serif"
                  title="將目前主畫面的命盤資料帶入甲方"
                >
                  <RotateCcw className="w-3 h-3" />
                  同步當前盤
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-[#787166] dark:text-[#959187] block mb-1">姓名/代稱</label>
                  <input
                    type="text"
                    value={personAInput.name}
                    onChange={(e) => setPersonAInput({ ...personAInput, name: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs bg-[#fdfbf7] dark:bg-[#14161d] border-[#d8d0bf] dark:border-[#333644]"
                    placeholder="姓名"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#787166] dark:text-[#959187] block mb-1">性別</label>
                  <select
                    value={personAInput.gender}
                    onChange={(e) => setPersonAInput({ ...personAInput, gender: e.target.value as '男' | '女' })}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs bg-[#fdfbf7] dark:bg-[#14161d] border-[#d8d0bf] dark:border-[#333644]"
                  >
                    <option value="男">乾造 (男)</option>
                    <option value="女">坤造 (女)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-[#787166] dark:text-[#959187] block mb-1">曆法</label>
                  <select
                    value={personAInput.calendar}
                    onChange={(e) => setPersonAInput({ ...personAInput, calendar: e.target.value as 'solar' | 'lunar' })}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs bg-[#fdfbf7] dark:bg-[#14161d] border-[#d8d0bf] dark:border-[#333644]"
                  >
                    <option value="solar">國曆 (公曆)</option>
                    <option value="lunar">農曆 (陰曆)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-[#787166] dark:text-[#959187] block mb-1">年</label>
                  <input
                    type="number"
                    value={personAInput.year}
                    onChange={(e) => setPersonAInput({ ...personAInput, year: parseInt(e.target.value) || 1990 })}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs bg-[#fdfbf7] dark:bg-[#14161d] border-[#d8d0bf] dark:border-[#333644]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#787166] dark:text-[#959187] block mb-1">月</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={personAInput.month}
                    onChange={(e) => setPersonAInput({ ...personAInput, month: parseInt(e.target.value) || 1 })}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs bg-[#fdfbf7] dark:bg-[#14161d] border-[#d8d0bf] dark:border-[#333644]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#787166] dark:text-[#959187] block mb-1">日</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={personAInput.day}
                    onChange={(e) => setPersonAInput({ ...personAInput, day: parseInt(e.target.value) || 1 })}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs bg-[#fdfbf7] dark:bg-[#14161d] border-[#d8d0bf] dark:border-[#333644]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-[#787166] dark:text-[#959187] block mb-1">時 (0-23)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={personAInput.hour}
                    onChange={(e) => setPersonAInput({ ...personAInput, hour: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs bg-[#fdfbf7] dark:bg-[#14161d] border-[#d8d0bf] dark:border-[#333644]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#787166] dark:text-[#959187] block mb-1">分 (0-59)</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={personAInput.minute}
                    onChange={(e) => setPersonAInput({ ...personAInput, minute: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs bg-[#fdfbf7] dark:bg-[#14161d] border-[#d8d0bf] dark:border-[#333644]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#787166] dark:text-[#959187] block mb-1">出生地</label>
                  <select
                    value={personAInput.city || '台北市'}
                    onChange={(e) => {
                      const cityName = e.target.value;
                      let lon = 120.0;
                      for (const group of CITIES_DATA) {
                        const found = group.cities.find(c => c.name === cityName);
                        if (found) { lon = found.longitude; break; }
                      }
                      setPersonAInput({ ...personAInput, city: cityName, longitude: lon });
                    }}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs bg-[#fdfbf7] dark:bg-[#14161d] border-[#d8d0bf] dark:border-[#333644]"
                  >
                    {CITIES_DATA.map((group) => (
                      <optgroup key={group.region} label={group.region}>
                        {group.cities.map((c) => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Info Bar for A */}
              <div className="pt-1.5 text-[11px] text-[#6d665a] dark:text-[#9d978a] flex items-center justify-between font-serif">
                <span>八字：{personAChart.bazi.year.stem}{personAChart.bazi.year.branch} · {personAChart.bazi.month.stem}{personAChart.bazi.month.branch} · {personAChart.bazi.day.stem}{personAChart.bazi.day.branch} · {personAChart.bazi.hour.stem}{personAChart.bazi.hour.branch}</span>
                <span className="font-bold text-[#8d271c] dark:text-rose-400">日元【{personAChart.bazi.dayMaster}】</span>
              </div>
            </div>

            {/* Person B Card */}
            <div className="p-3.5 sm:p-4 rounded-xl border bg-white dark:bg-[#1a1c24] border-[#e0d6c3] dark:border-[#2a2d39] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#ece4d2] dark:border-[#2a2d39]">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center">
                    乙
                  </span>
                  <span className="font-serif font-bold text-sm">乙方（命主 B）</span>
                </div>
                <button
                  onClick={handleSwap}
                  className="md:hidden text-xs text-[#8d271c] dark:text-rose-400 hover:underline flex items-center gap-1 font-serif"
                >
                  <ArrowRightLeft className="w-3 h-3" />
                  交換雙方
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-[#787166] dark:text-[#959187] block mb-1">姓名/代稱</label>
                  <input
                    type="text"
                    value={personBInput.name}
                    onChange={(e) => setPersonBInput({ ...personBInput, name: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs bg-[#fdfbf7] dark:bg-[#14161d] border-[#d8d0bf] dark:border-[#333644]"
                    placeholder="姓名"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#787166] dark:text-[#959187] block mb-1">性別</label>
                  <select
                    value={personBInput.gender}
                    onChange={(e) => setPersonBInput({ ...personBInput, gender: e.target.value as '男' | '女' })}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs bg-[#fdfbf7] dark:bg-[#14161d] border-[#d8d0bf] dark:border-[#333644]"
                  >
                    <option value="男">乾造 (男)</option>
                    <option value="女">坤造 (女)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-[#787166] dark:text-[#959187] block mb-1">曆法</label>
                  <select
                    value={personBInput.calendar}
                    onChange={(e) => setPersonBInput({ ...personBInput, calendar: e.target.value as 'solar' | 'lunar' })}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs bg-[#fdfbf7] dark:bg-[#14161d] border-[#d8d0bf] dark:border-[#333644]"
                  >
                    <option value="solar">國曆 (公曆)</option>
                    <option value="lunar">農曆 (陰曆)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-[#787166] dark:text-[#959187] block mb-1">年</label>
                  <input
                    type="number"
                    value={personBInput.year}
                    onChange={(e) => setPersonBInput({ ...personBInput, year: parseInt(e.target.value) || 1992 })}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs bg-[#fdfbf7] dark:bg-[#14161d] border-[#d8d0bf] dark:border-[#333644]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#787166] dark:text-[#959187] block mb-1">月</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={personBInput.month}
                    onChange={(e) => setPersonBInput({ ...personBInput, month: parseInt(e.target.value) || 1 })}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs bg-[#fdfbf7] dark:bg-[#14161d] border-[#d8d0bf] dark:border-[#333644]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#787166] dark:text-[#959187] block mb-1">日</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={personBInput.day}
                    onChange={(e) => setPersonBInput({ ...personBInput, day: parseInt(e.target.value) || 1 })}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs bg-[#fdfbf7] dark:bg-[#14161d] border-[#d8d0bf] dark:border-[#333644]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-[#787166] dark:text-[#959187] block mb-1">時 (0-23)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={personBInput.hour}
                    onChange={(e) => setPersonBInput({ ...personBInput, hour: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs bg-[#fdfbf7] dark:bg-[#14161d] border-[#d8d0bf] dark:border-[#333644]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#787166] dark:text-[#959187] block mb-1">分 (0-59)</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={personBInput.minute}
                    onChange={(e) => setPersonBInput({ ...personBInput, minute: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs bg-[#fdfbf7] dark:bg-[#14161d] border-[#d8d0bf] dark:border-[#333644]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#787166] dark:text-[#959187] block mb-1">出生地</label>
                  <select
                    value={personBInput.city || '台北市'}
                    onChange={(e) => {
                      const cityName = e.target.value;
                      let lon = 120.0;
                      for (const group of CITIES_DATA) {
                        const found = group.cities.find(c => c.name === cityName);
                        if (found) { lon = found.longitude; break; }
                      }
                      setPersonBInput({ ...personBInput, city: cityName, longitude: lon });
                    }}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs bg-[#fdfbf7] dark:bg-[#14161d] border-[#d8d0bf] dark:border-[#333644]"
                  >
                    {CITIES_DATA.map((group) => (
                      <optgroup key={group.region} label={group.region}>
                        {group.cities.map((c) => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Info Bar for B */}
              <div className="pt-1.5 text-[11px] text-[#6d665a] dark:text-[#9d978a] flex items-center justify-between font-serif">
                <span>八字：{personBChart.bazi.year.stem}{personBChart.bazi.year.branch} · {personBChart.bazi.month.stem}{personBChart.bazi.month.branch} · {personBChart.bazi.day.stem}{personBChart.bazi.day.branch} · {personBChart.bazi.hour.stem}{personBChart.bazi.hour.branch}</span>
                <span className="font-bold text-[#8d271c] dark:text-rose-400">日元【{personBChart.bazi.dayMaster}】</span>
              </div>
            </div>

          </div>

          {/* Overall Compatibility Banner */}
          <div className="p-4 sm:p-5 rounded-2xl border shadow-sm relative overflow-hidden bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 dark:from-rose-950/30 dark:via-amber-950/20 dark:to-orange-950/20 border-rose-200 dark:border-rose-900/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center shrink-0">
                  <div className="w-20 h-20 rounded-full border-4 border-rose-400/30 dark:border-rose-500/30 flex flex-col items-center justify-center bg-white dark:bg-[#1e1c24] shadow-inner">
                    <span className="text-2xl font-serif font-black text-rose-600 dark:text-rose-400">
                      {hemingResult.compatibilityScore}
                    </span>
                    <span className="text-[10px] text-[#787166] dark:text-[#959187]">合盤分</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base sm:text-lg font-serif font-bold text-[#8d271c] dark:text-rose-300">
                      天命合盤契合度
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-serif font-bold bg-rose-600 text-white shadow-sm">
                      {hemingResult.affinityTier}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#4b453e] dark:text-[#d3cebe] font-serif leading-relaxed">
                    {hemingResult.summaryVerdict}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#e5decb] dark:border-[#282b37] text-xs font-serif">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-[#8d271c] text-white shadow-xs'
                  : 'text-[#6f675c] dark:text-[#a09a8f] hover:bg-[#ece4d2] dark:hover:bg-[#20232e]'
              }`}
            >
              總綱與五階精要
            </button>
            <button
              onClick={() => setActiveTab('palaces')}
              className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 ${
                activeTab === 'palaces'
                  ? 'bg-[#8d271c] text-white shadow-xs'
                  : 'text-[#6f675c] dark:text-[#a09a8f] hover:bg-[#ece4d2] dark:hover:bg-[#20232e]'
              }`}
            >
              一階・雙宮聯參 (夫妻✕福德)
            </button>
            <button
              onClick={() => setActiveTab('stars')}
              className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 ${
                activeTab === 'stars'
                  ? 'bg-[#8d271c] text-white shadow-xs'
                  : 'text-[#6f675c] dark:text-[#a09a8f] hover:bg-[#ece4d2] dark:hover:bg-[#20232e]'
              }`}
            >
              二階・主星同頻對應
            </button>
            <button
              onClick={() => setActiveTab('sihua')}
              className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 ${
                activeTab === 'sihua'
                  ? 'bg-[#8d271c] text-white shadow-xs'
                  : 'text-[#6f675c] dark:text-[#a09a8f] hover:bg-[#ece4d2] dark:hover:bg-[#20232e]'
              }`}
            >
              三階・雙向四化飛渡
            </button>
            <button
              onClick={() => setActiveTab('bazi')}
              className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 ${
                activeTab === 'bazi'
                  ? 'bg-[#8d271c] text-white shadow-xs'
                  : 'text-[#6f675c] dark:text-[#a09a8f] hover:bg-[#ece4d2] dark:hover:bg-[#20232e]'
              }`}
            >
              四階・八字五行體用
            </button>
            <button
              onClick={() => setActiveTab('timing')}
              className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 ${
                activeTab === 'timing'
                  ? 'bg-[#8d271c] text-white shadow-xs'
                  : 'text-[#6f675c] dark:text-[#a09a8f] hover:bg-[#ece4d2] dark:hover:bg-[#20232e]'
              }`}
            >
              五階・婚期與相處錦囊
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Quick Card 1: 雙宮聯參 */}
                <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1c24] border-[#e0d6c3] dark:border-[#2a2d39] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#8d271c] dark:text-rose-400">
                    <Compass className="w-4 h-4" />
                    <span>雙宮聯參（外顯相處 ✕ 靈魂因果）</span>
                  </div>
                  <p className="text-xs text-[#524a40] dark:text-[#cfc9bc] leading-relaxed">
                    {hemingResult.doublePalaceCorrelation.fuqiPalaceAnalysis}
                  </p>
                  <p className="text-xs text-[#524a40] dark:text-[#cfc9bc] leading-relaxed">
                    {hemingResult.doublePalaceCorrelation.fudePalaceAnalysis}
                  </p>
                </div>

                {/* Quick Card 2: 八字五行相生 */}
                <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1c24] border-[#e0d6c3] dark:border-[#2a2d39] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-serif font-bold text-emerald-700 dark:text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                    <span>八字日元合參（{hemingResult.baziElementalHarmony.dmA} vs {hemingResult.baziElementalHarmony.dmB}）</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {hemingResult.baziElementalHarmony.relation}
                    </span>
                  </div>
                  <p className="text-xs text-[#524a40] dark:text-[#cfc9bc] leading-relaxed">
                    {hemingResult.baziElementalHarmony.analysis}
                  </p>
                </div>
              </div>

              {/* Actionable Remedies Card */}
              <div className="p-4 rounded-xl border bg-[#fdfbf7] dark:bg-[#171922] border-[#e0d6c3] dark:border-[#2a2d39] space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#8d271c] dark:text-rose-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>正統古典大師相處錦囊（體用合參）</span>
                </div>
                <div className="space-y-1.5">
                  {hemingResult.actionableRemedies.map((remedy, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#524a40] dark:text-[#cfc9bc] leading-relaxed">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>{remedy}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: 雙宮聯參 */}
          {activeTab === 'palaces' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1c24] border-[#e0d6c3] dark:border-[#2a2d39] space-y-3">
                <div className="flex items-center gap-2 font-serif font-bold text-sm text-[#8d271c] dark:text-rose-400 pb-2 border-b border-[#ece4d2] dark:border-[#2a2d39]">
                  <Compass className="w-4 h-4" />
                  <span>第一階：夫妻宮（體）✕ 福德宮（用）雙宮聯參法理</span>
                </div>
                <div className="text-xs text-[#554e44] dark:text-[#cfc9bc] leading-relaxed space-y-2">
                  <p>
                    《紫微斗數全書》云：「夫妻乃人生之定綱，福德乃造化之源流。」
                    夫妻宮象徵命主在意識層面、世俗眼光中所嚮往的擇偶條件與外在互動火花；
                    而福德宮則反映命主潛意識的靈魂寄託、心理耐受度與三十歲之後的相濡以沫深層因果。
                  </p>
                  <p className="p-3 rounded-lg bg-[#f8f5ee] dark:bg-[#14161f] border border-[#e5decb] dark:border-[#242735]">
                    {hemingResult.doublePalaceCorrelation.fuqiPalaceAnalysis}
                  </p>
                  <p className="p-3 rounded-lg bg-[#f8f5ee] dark:bg-[#14161f] border border-[#e5decb] dark:border-[#242735]">
                    {hemingResult.doublePalaceCorrelation.fudePalaceAnalysis}
                  </p>
                  <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200 font-bold">
                    💡 合參斷語：{hemingResult.doublePalaceCorrelation.synergyConclusion}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: 主星同頻對應 */}
          {activeTab === 'stars' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* A to B */}
                <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1c24] border-[#e0d6c3] dark:border-[#2a2d39] space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#ece4d2] dark:border-[#2a2d39]">
                    <span className="font-serif font-bold text-xs">
                      {personAChart.name}夫妻宮 ➔ {personBChart.name}命宮
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                      {hemingResult.starMatchAtoB.matchLevel}
                    </span>
                  </div>
                  <div className="text-xs text-[#524a40] dark:text-[#cfc9bc] space-y-1.5">
                    <div>
                      <span className="text-[#877f74] dark:text-[#88837a]">【{personAChart.name}】夫妻宮星曜：</span>
                      <span className="font-bold text-[#8d271c] dark:text-rose-400">
                        {hemingResult.starMatchAtoB.spouseStars.join('、') || '空宮借星'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#877f74] dark:text-[#88837a]">【{personBChart.name}】命宮主星：</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {hemingResult.starMatchAtoB.partnerMingStars.join('、') || '命無正曜'}
                      </span>
                    </div>
                    <p className="pt-2 leading-relaxed border-t border-[#f0ebd9] dark:border-[#232633]">
                      {hemingResult.starMatchAtoB.detail}
                    </p>
                  </div>
                </div>

                {/* B to A */}
                <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1c24] border-[#e0d6c3] dark:border-[#2a2d39] space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#ece4d2] dark:border-[#2a2d39]">
                    <span className="font-serif font-bold text-xs">
                      {personBChart.name}夫妻宮 ➔ {personAChart.name}命宮
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                      {hemingResult.starMatchBtoA.matchLevel}
                    </span>
                  </div>
                  <div className="text-xs text-[#524a40] dark:text-[#cfc9bc] space-y-1.5">
                    <div>
                      <span className="text-[#877f74] dark:text-[#88837a]">【{personBChart.name}】夫妻宮星曜：</span>
                      <span className="font-bold text-[#8d271c] dark:text-rose-400">
                        {hemingResult.starMatchBtoA.spouseStars.join('、') || '空宮借星'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#877f74] dark:text-[#88837a]">【{personAChart.name}】命宮主星：</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {hemingResult.starMatchBtoA.partnerMingStars.join('、') || '命無正曜'}
                      </span>
                    </div>
                    <p className="pt-2 leading-relaxed border-t border-[#f0ebd9] dark:border-[#232633]">
                      {hemingResult.starMatchBtoA.detail}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab 4: 雙向四化飛渡 */}
          {activeTab === 'sihua' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1c24] border-[#e0d6c3] dark:border-[#2a2d39] space-y-3">
                <div className="flex items-center gap-2 font-serif font-bold text-sm text-[#8d271c] dark:text-rose-400 pb-2 border-b border-[#ece4d2] dark:border-[#2a2d39]">
                  <Sparkles className="w-4 h-4" />
                  <span>第三階：生年天干四化飛渡矩陣（雙向飛星互涉）</span>
                </div>
                <p className="text-xs text-[#787166] dark:text-[#959187]">
                  天干四化是命盤中最活躍的能量流轉。當甲方的生年天干化祿或化忌飛入乙方的特定宮位時，會對乙方的人生領域產生強烈的吉化或考驗。
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {hemingResult.flyMutagens.map((fly, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                        fly.mutagen === '祿'
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200'
                          : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                            fly.mutagen === '祿' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                          }`}>
                            化{fly.mutagen}
                          </span>
                          <span>{fly.fromPerson}【{fly.stem}】➔ {fly.toPerson}【{fly.targetPalaceName}宮】</span>
                        </span>
                        <span className="text-[10px] opacity-80">{fly.grade}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-90">
                        {fly.meaning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: 八字五行體用 */}
          {activeTab === 'bazi' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1c24] border-[#e0d6c3] dark:border-[#2a2d39] space-y-3">
                <div className="flex items-center gap-2 font-serif font-bold text-sm text-[#8d271c] dark:text-rose-400 pb-2 border-b border-[#ece4d2] dark:border-[#2a2d39]">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>第四階：八字日元五行生剋體用合參</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-[#f8f5ee] dark:bg-[#14161f] border border-[#e5decb] dark:border-[#242735] text-xs space-y-1">
                    <span className="text-[#787166] dark:text-[#959187]">【{personAChart.name}】日元</span>
                    <div className="text-sm font-bold font-serif text-[#8d271c] dark:text-rose-400">
                      {hemingResult.baziElementalHarmony.dmA}（{hemingResult.baziElementalHarmony.elementA}）
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#f8f5ee] dark:bg-[#14161f] border border-[#e5decb] dark:border-[#242735] text-xs space-y-1">
                    <span className="text-[#787166] dark:text-[#959187]">【{personBChart.name}】日元</span>
                    <div className="text-sm font-bold font-serif text-blue-600 dark:text-blue-400">
                      {hemingResult.baziElementalHarmony.dmB}（{hemingResult.baziElementalHarmony.elementB}）
                    </div>
                  </div>
                </div>
                <div className="p-3.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs leading-relaxed space-y-1.5">
                  <div className="font-bold text-amber-900 dark:text-amber-300">
                    體用相生格局：{hemingResult.baziElementalHarmony.relation}
                  </div>
                  <p className="text-[#554e44] dark:text-[#cfc9bc]">
                    {hemingResult.baziElementalHarmony.analysis}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: 婚期與相處錦囊 */}
          {activeTab === 'timing' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1c24] border-[#e0d6c3] dark:border-[#2a2d39] space-y-3">
                <div className="flex items-center gap-2 font-serif font-bold text-sm text-[#8d271c] dark:text-rose-400 pb-2 border-b border-[#ece4d2] dark:border-[#2a2d39]">
                  <Calendar className="w-4 h-4" />
                  <span>第五階：三階婚期推導（本命 ✕ 大限 ✕ 流年紅鸞天喜）</span>
                </div>
                <div className="text-xs text-[#524a40] dark:text-[#cfc9bc] leading-relaxed space-y-2">
                  <p className="font-bold text-[#8d271c] dark:text-rose-400">
                    {hemingResult.timingSynergy.marriageWindow}
                  </p>
                  <div className="space-y-1.5 pt-1">
                    {hemingResult.timingSynergy.keyYearsAdvice.map((advice, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-[#f8f5ee] dark:bg-[#14161f] border border-[#e5decb] dark:border-[#242735]">
                        <span className="text-rose-600 font-bold shrink-0">{i + 1}.</span>
                        <span>{advice}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border bg-[#fdfbf7] dark:bg-[#171922] border-[#e0d6c3] dark:border-[#2a2d39] space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#8d271c] dark:text-rose-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>大師化解與修行心法</span>
                </div>
                <div className="space-y-1.5 text-xs text-[#524a40] dark:text-[#cfc9bc]">
                  {hemingResult.actionableRemedies.map((remedy, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-white dark:bg-[#1a1c24] border border-[#e8dfcb] dark:border-[#2a2d39]">
                      {remedy}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-[#e5decb] dark:border-[#262833] bg-[#f5ede0]/60 dark:bg-[#1a1c24]/80 flex items-center justify-between">
          <div className="text-xs text-[#787166] dark:text-[#959187] font-serif hidden sm:block">
            正統命理合盤重在知命惜緣 · 趨吉避凶
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-serif font-bold transition shadow-sm
              bg-[#8d271c] text-white hover:bg-[#782017]"
          >
            關閉視窗
          </button>
        </div>

      </div>
    </div>
  );
};
