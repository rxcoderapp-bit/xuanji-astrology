import { useState, useMemo, useEffect } from 'react';
import type { BirthInput, LayerType } from './types';
import { 
  computeAstrolabe, 
  computeHoroscopeDetails, 
  getSanFangSiZheng 
} from './lib/iztroEngine';
import { computeBazi } from './lib/baziEngine';
import { computeDualTrackEnergy, computeTimingResonance } from './lib/dualTrackEngine';
import { computeLoveMarriageTimeline } from './lib/loveMarriageEngine';
import { Navbar } from './components/Navbar';
import { QuickBirthBar } from './components/QuickBirthBar';
import { HoroscopeTimeWheel } from './components/HoroscopeTimeWheel';
import { BoardView } from './components/BoardView';
import { InterpretationStudio } from './components/InterpretationStudio';
import { BirthModal } from './components/BirthModal';
import { CaseDatabaseModal } from './components/CaseDatabaseModal';
import { DivinationModal } from './components/DivinationModal';
import { AISettingsModal } from './components/AISettingsModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { KnowledgeBaseModal } from './components/KnowledgeBaseModal';
import { Footer } from './components/Footer';
import { saveCaseRecord } from './lib/caseStorage';
import { registerPWA, subscribeToUpdate, applyUpdate } from './lib/pwaService';
import { cloudSync, type SyncStatus } from './lib/cloudSync';
import type { User } from 'firebase/auth';

// Default initial birth input: Current real-time moment (開啟網頁當下時辰即時排盤)
function getNowBirthInput(): BirthInput {
  const now = new Date();
  return {
    name: '即時排盤',
    gender: '男',
    calendar: 'solar',
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    isLeapMonth: false
  };
}

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('xuanji_theme_mode');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });
  const [birthInput, setBirthInput] = useState<BirthInput>(getNowBirthInput);
  const [isBirthModalOpen, setIsBirthModalOpen] = useState(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [isDivinationModalOpen, setIsDivinationModalOpen] = useState(false);
  const [isAISettingsModalOpen, setIsAISettingsModalOpen] = useState(false);
  const [isCloudSyncModalOpen, setIsCloudSyncModalOpen] = useState(false);
  const [isKnowledgeBaseModalOpen, setIsKnowledgeBaseModalOpen] = useState(false);

  // Cloud Sync & Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(cloudSync.currentUser);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(cloudSync.syncStatus);

  // PWA Auto-Update state
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  // Mobile fast-jump state
  const [isScrolledToStudio, setIsScrolledToStudio] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolledToStudio(window.scrollY > 380);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize PWA and Firebase Cloud Sync on mount
  useEffect(() => {
    // 1. Register PWA Service Worker
    registerPWA();
    const unsubUpdate = subscribeToUpdate(() => {
      setIsUpdateAvailable(true);
    });

    // 2. Initialize Firebase Cloud Sync
    cloudSync.init();
    const unsubAuth = cloudSync.onAuthChange((user) => {
      setCurrentUser(user);
    });
    const unsubSync = cloudSync.onSyncChange((status) => {
      setSyncStatus(status);
    });

    return () => {
      unsubUpdate();
      unsubAuth();
      unsubSync();
    };
  }, []);

  // Sync dark mode with document.documentElement & localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('xuanji_theme_mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('xuanji_theme_mode', 'light');
    }
  }, [darkMode]);

  // Compute Astrolabe & Bazi
  const chartResult = useMemo(() => {
    return computeAstrolabe(birthInput);
  }, [birthInput]);

  const baziData = useMemo(() => {
    return computeBazi(birthInput);
  }, [birthInput]);

  // Selected Palace state (defaults to Ming Gong / 命宮)
  const [selectedPalaceIndex, setSelectedPalaceIndex] = useState<number>(chartResult.mingGongIndex);

  // When chart changes, reset selected palace to Life Palace
  useEffect(() => {
    setSelectedPalaceIndex(chartResult.mingGongIndex);
  }, [chartResult]);

  // Horoscope Time State
  const [horoscope, setHoroscope] = useState(() => {
    return computeHoroscopeDetails(chartResult.astrolabe);
  });

  // Recompute horoscope when chart changes
  useEffect(() => {
    setHoroscope(computeHoroscopeDetails(chartResult.astrolabe));
  }, [chartResult]);

  // Decadal list
  const decadalList = useMemo(() => {
    return chartResult.astrolabe.decadalList();
  }, [chartResult]);

  // SanFangSiZheng (三方四正) for the currently selected palace
  const sanFang = useMemo(() => {
    return getSanFangSiZheng(selectedPalaceIndex);
  }, [selectedPalaceIndex]);

  // 雙軌合參五行全息動態能量
  const dualTrackEnergy = useMemo(() => {
    const dStemBranch = horoscope.decadalInfo ? `${horoscope.decadalInfo.stem}${horoscope.decadalInfo.branch}` : undefined;
    const yStemBranch = horoscope.yearlyInfo ? `${horoscope.yearlyInfo.stem}${horoscope.yearlyInfo.branch}` : undefined;
    return computeDualTrackEnergy(baziData, dStemBranch, yStemBranch);
  }, [baziData, horoscope]);

  // 歲運雙軌吉凶共振探測
  const timingResonance = useMemo(() => {
    return computeTimingResonance(horoscope, baziData, chartResult.palaces);
  }, [horoscope, baziData, chartResult.palaces]);

  // 太微緣局婚戀時間軸與伴侶全息畫像
  const loveMarriageAnalysis = useMemo(() => {
    return computeLoveMarriageTimeline(baziData, chartResult.palaces, horoscope);
  }, [baziData, chartResult.palaces, horoscope]);

  // Horoscope Actions
  const handleSelectLayer = (layer: LayerType) => {
    setHoroscope(prev => ({ ...prev, activeLayer: layer }));
  };

  const handleSelectDecade = (idx: number) => {
    const decade = decadalList[idx];
    if (!decade) return;
    const midYear = decade.yearRange ? Math.floor((decade.yearRange[0] + decade.yearRange[1]) / 2) : horoscope.selectedYear;
    
    const updated = computeHoroscopeDetails(
      chartResult.astrolabe,
      `${midYear}-06-15`,
      horoscope.targetTimeIndex
    );
    setHoroscope({
      ...updated,
      activeLayer: 'decadal',
      selectedDecadeIndex: idx,
      selectedYear: midYear
    });
  };

  const handleSelectYear = (year: number) => {
    const updated = computeHoroscopeDetails(
      chartResult.astrolabe,
      `${year}-${String(horoscope.selectedMonth).padStart(2, '0')}-${String(horoscope.selectedDay).padStart(2, '0')}`,
      horoscope.targetTimeIndex
    );
    setHoroscope({
      ...updated,
      activeLayer: 'yearly',
      selectedYear: year
    });
  };

  const handleSelectMonth = (month: number) => {
    const updated = computeHoroscopeDetails(
      chartResult.astrolabe,
      `${horoscope.selectedYear}-${String(month).padStart(2, '0')}-${String(horoscope.selectedDay).padStart(2, '0')}`,
      horoscope.targetTimeIndex
    );
    setHoroscope({
      ...updated,
      activeLayer: 'monthly',
      selectedMonth: month
    });
  };

  const handleSelectDay = (day: number) => {
    const updated = computeHoroscopeDetails(
      chartResult.astrolabe,
      `${horoscope.selectedYear}-${String(horoscope.selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      horoscope.targetTimeIndex
    );
    setHoroscope({
      ...updated,
      activeLayer: 'daily',
      selectedDay: day
    });
  };

  const handleSelectHour = (hourIndex: number) => {
    const updated = computeHoroscopeDetails(
      chartResult.astrolabe,
      `${horoscope.selectedYear}-${String(horoscope.selectedMonth).padStart(2, '0')}-${String(horoscope.selectedDay).padStart(2, '0')}`,
      hourIndex
    );
    setHoroscope({
      ...updated,
      activeLayer: 'hourly',
      targetTimeIndex: hourIndex
    });
  };

  const handleResetToNow = () => {
    const updated = computeHoroscopeDetails(chartResult.astrolabe);
    setHoroscope(updated);
  };

  // Save current chart to database
  const handleSaveCurrentAsCase = () => {
    const defaultTag = '自訂';
    const note = prompt(`請輸入命盤【${birthInput.name}】的備註說明（可留空）：`, '當前排盤案例');
    if (note === null) return;
    
    saveCaseRecord({
      name: birthInput.name,
      gender: birthInput.gender,
      calendar: birthInput.calendar,
      year: birthInput.year,
      month: birthInput.month,
      day: birthInput.day,
      hour: birthInput.hour,
      minute: birthInput.minute,
      isLeapMonth: birthInput.isLeapMonth,
      category: defaultTag,
      notes: note
    });
    alert(`成功將【${birthInput.name}】存入命例庫！點選上方「命例資料庫」隨時查閱管理。`);
  };

  // Load case from database
  const handleLoadCase = (record: BirthInput) => {
    setBirthInput({
      name: record.name,
      gender: record.gender,
      calendar: record.calendar,
      year: record.year,
      month: record.month,
      day: record.day,
      hour: record.hour,
      minute: record.minute,
      isLeapMonth: record.isLeapMonth
    });
  };

  const selectedPalace = chartResult.palaces[selectedPalaceIndex] || chartResult.palaces[0];

  return (
    <div className="min-h-screen flex flex-col font-serif transition-colors duration-200
      bg-[#f7f4ed] dark:bg-[#0f1015] text-[#221f1d] dark:text-[#f2efe9]">
      
      {/* 1. Header Navigation Bar */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenBirthModal={() => setIsBirthModalOpen(true)}
        onOpenDatabase={() => setIsDatabaseModalOpen(true)}
        onOpenDivination={() => setIsDivinationModalOpen(true)}
        onOpenKnowledgeBase={() => setIsKnowledgeBaseModalOpen(true)}
        onOpenAISettings={() => setIsAISettingsModalOpen(true)}
        onOpenCloudSync={() => setIsCloudSyncModalOpen(true)}
        currentUser={currentUser}
        syncStatus={syncStatus}
        isUpdateAvailable={isUpdateAvailable}
        onApplyUpdate={applyUpdate}
        birthInput={birthInput}
        fiveElementsClass={chartResult.fiveElementsClass}
      />

      {/* 2. Quick Birth Input & Chinese Hour (時辰) Selector Bar */}
      <QuickBirthBar
        birthInput={birthInput}
        onChangeBirth={setBirthInput}
        onOpenDatabase={() => setIsDatabaseModalOpen(true)}
        onSaveCurrentAsCase={handleSaveCurrentAsCase}
      />

      {/* 3. Six-Layer Horoscope Time Wheel (大限、流年、小限、流月、流日、流時) */}
      <HoroscopeTimeWheel
        horoscope={horoscope}
        decadalList={decadalList}
        onSelectLayer={handleSelectLayer}
        onSelectDecade={handleSelectDecade}
        onSelectYear={handleSelectYear}
        onSelectMonth={handleSelectMonth}
        onSelectDay={handleSelectDay}
        onSelectHour={handleSelectHour}
        onResetToNow={handleResetToNow}
        timingResonance={timingResonance}
        loveFortune={loveMarriageAnalysis.currentYearFortune}
      />

      {/* 4. Main Workspace: 4x4 Grid Chart + Deep Interpretation Studio */}
      <main className="flex-1 w-full max-w-[1680px] mx-auto p-2 sm:p-5 lg:p-6 flex flex-col lg:flex-row gap-3.5 sm:gap-5 items-start justify-center">
        
        {/* Left / Center: Traditional 4x4 Chart Board */}
        <BoardView
          palaces={chartResult.palaces}
          selectedPalaceIndex={selectedPalaceIndex}
          onSelectPalace={setSelectedPalaceIndex}
          sanFang={sanFang}
          horoscope={horoscope}
          bazi={baziData}
          soul={chartResult.soul}
          body={chartResult.body}
          fiveElementsClass={chartResult.fiveElementsClass}
          zodiac={chartResult.zodiac}
          sign={chartResult.sign}
          solarDate={chartResult.solarDate}
          lunarDate={chartResult.lunarDate}
          name={birthInput.name}
          gender={birthInput.gender}
          laiYinIndex={chartResult.laiYinIndex}
        />

        {/* Right Side: Deep Interactive Interpretation Studio */}
        <InterpretationStudio
          selectedPalace={selectedPalace}
          allPalaces={chartResult.palaces}
          sanFang={sanFang}
          horoscope={horoscope}
          bazi={baziData}
          soul={chartResult.soul}
          body={chartResult.body}
          fiveElementsClass={chartResult.fiveElementsClass}
          name={birthInput.name}
          gender={birthInput.gender}
          solarDate={chartResult.solarDate}
          lunarDate={chartResult.lunarDate}
          laiYinIndex={chartResult.laiYinIndex}
          onOpenAISettings={() => setIsAISettingsModalOpen(true)}
          timingResonance={timingResonance}
          loveMarriageAnalysis={loveMarriageAnalysis}
          dualTrackEnergy={dualTrackEnergy}
          onSelectYear={handleSelectYear}
        />

      </main>

      {/* 5. Classical Metaphysics Footer with Real-Time Visitor Stats */}
      <Footer
        onOpenKnowledgeBase={() => setIsKnowledgeBaseModalOpen(true)}
        onOpenDatabase={() => setIsDatabaseModalOpen(true)}
        onOpenDivination={() => setIsDivinationModalOpen(true)}
      />

      {/* 6. Detailed Birth Input Modal Dialog */}
      <BirthModal
        isOpen={isBirthModalOpen}
        onClose={() => setIsBirthModalOpen(false)}
        onSubmit={setBirthInput}
        initialValues={birthInput}
      />

      {/* 6. Case Management Database Modal Dialog (增刪修查) */}
      <CaseDatabaseModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
        onLoadCase={handleLoadCase}
        currentChartInput={birthInput}
        onOpenCloudSync={() => setIsCloudSyncModalOpen(true)}
      />

      {/* 7. Ziwei Divination (一事一占 · 神卦問事) Modal */}
      <DivinationModal
        isOpen={isDivinationModalOpen}
        onClose={() => setIsDivinationModalOpen(false)}
        currentChartPalaces={chartResult.palaces}
        onOpenAISettings={() => setIsAISettingsModalOpen(true)}
      />

      {/* 8. Global AI API Settings (Gemini & OpenRouter) Modal */}
      <AISettingsModal
        isOpen={isAISettingsModalOpen}
        onClose={() => setIsAISettingsModalOpen(false)}
      />

      {/* 9. Google Account & Cloud Sync Modal */}
      <CloudSyncModal
        isOpen={isCloudSyncModalOpen}
        onClose={() => setIsCloudSyncModalOpen(false)}
      />

      {/* 10. Classical Metaphysics Knowledge Base & AI Studio Modal */}
      <KnowledgeBaseModal
        isOpen={isKnowledgeBaseModalOpen}
        onClose={() => setIsKnowledgeBaseModalOpen(false)}
        selectedPalace={selectedPalace}
        bazi={baziData}
        horoscope={horoscope}
        name={birthInput.name}
        gender={birthInput.gender}
        onOpenAISettings={() => setIsAISettingsModalOpen(true)}
      />

      {/* 10. Mobile Floating Fast-Jump between Chart Board and Interpretation Studio */}
      <div className="lg:hidden fixed bottom-5 right-4 z-40">
        <button
          onClick={() => {
            if (isScrolledToStudio) {
              const board = document.getElementById('chart-board');
              if (board) board.scrollIntoView({ behavior: 'smooth', block: 'start' });
              else window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              const studio = document.getElementById('interpretation-studio');
              if (studio) studio.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full shadow-xl border text-xs font-bold font-serif transition active:scale-95
            bg-[#8d271c] dark:bg-[#c0392b] text-white border-[#691c13] dark:border-[#8f281e] hover:bg-[#782017]"
          title={isScrolledToStudio ? '一鍵滑動回到命盤' : '一鍵滑動前往解盤室'}
        >
          {isScrolledToStudio ? (
            <span>↑ 回到命盤</span>
          ) : (
            <span>看解盤 ↓</span>
          )}
        </button>
      </div>

    </div>
  );
}
