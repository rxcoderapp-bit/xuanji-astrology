import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Compass, Dices, 
  Bot, HelpCircle, History,
  Trash2, Search, Coins,
  Clock, ShieldAlert, Award, Copy, Check,
  Layers, RefreshCw
} from 'lucide-react';
import type { 
  DivinationCategory, 
  DivinationMethod, 
  DivinationResult, 
  DivinationRecord,
  PalaceData,
  HexagramLineType
} from '../types';
import { castZiweiDivination } from '../lib/divinationEngine';
import { callAIModel, buildDivinationPrompt } from '../lib/aiService';
import { 
  getDivinationRecords, 
  saveDivinationRecord, 
  deleteDivinationRecord, 
  clearDivinationRecords, 
  updateDivinationAI 
} from '../lib/divinationStorage';

interface DivinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentChartPalaces: PalaceData[];
  onOpenAISettings: () => void;
}

const CATEGORIES: { id: DivinationCategory; desc: string; icon: string }[] = [
  { id: '事業工作', desc: '升遷、跳槽、創業、專案前景 (看官祿宮)', icon: '💼' },
  { id: '求財投資', desc: '盈虧、財運、合約資金、進財時機 (看財帛宮)', icon: '💰' },
  { id: '感情婚姻', desc: '脫單、戀情發展、婚姻波折、復合 (看夫妻宮)', icon: '❤️' },
  { id: '合作商機', desc: '合夥人、外部關係、團隊可靠度 (看僕役宮)', icon: '🤝' },
  { id: '健康平安', desc: '體質安危、隱患防範、情緒壓力 (看疾厄宮)', icon: '🌿' },
  { id: '置產買房', desc: '購屋、裝修、不動產增值、搬遷 (看田宅宮)', icon: '🏡' },
  { id: '考試升遷', desc: '公職考試、證照考取、長官考評 (看父母宮)', icon: '📜' },
  { id: '訴訟是非', desc: '官非爭議、合約法規、小人口舌 (看父母/官祿)', icon: '⚖️' },
  { id: '重大抉擇', desc: '二選一、人生十字路口轉折 (看命宮/遷移)', icon: '🧭' },
];

export const DivinationModal: React.FC<DivinationModalProps> = ({
  isOpen,
  onClose,
  currentChartPalaces,
  onOpenAISettings
}) => {
  const [activeTab, setActiveTab] = useState<'cast' | 'history'>('cast');
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState<DivinationCategory>('事業工作');
  const [method, setMethod] = useState<DivinationMethod>('horary');
  
  // Numbers for number casting
  const [num1, setNum1] = useState(7);
  const [num2, setNum2] = useState(3);
  const [num3, setNum3] = useState(9);

  // Coins casting state
  const [coinsTosses, setCoinsTosses] = useState<number[][]>([]);
  const [isTossingAnimation, setIsTossingAnimation] = useState(false);
  const [currentTossCoins, setCurrentTossCoins] = useState<[number, number, number]>([3, 2, 3]);

  // Result state & active record ID
  const [result, setResult] = useState<DivinationResult | null>(null);
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);

  // History state
  const [historyRecords, setHistoryRecords] = useState<DivinationRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // AI Divination state
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copiedAi, setCopiedAi] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHistoryRecords(getDivinationRecords());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 隨機靈動數
  const handleRandomizeNumbers = () => {
    setNum1(Math.floor(Math.random() * 12) + 1);
    setNum2(Math.floor(Math.random() * 12) + 1);
    setNum3(Math.floor(Math.random() * 12) + 1);
  };

  // 擲一次銅錢 (第 1 到 6 爻)
  const handleTossOneRound = () => {
    if (coinsTosses.length >= 6) {
      setCoinsTosses([]);
    }

    setIsTossingAnimation(true);
    setTimeout(() => {
      const c1 = Math.random() > 0.5 ? 3 : 2;
      const c2 = Math.random() > 0.5 ? 3 : 2;
      const c3 = Math.random() > 0.5 ? 3 : 2;
      const newToss: [number, number, number] = [c1, c2, c3];
      
      setCurrentTossCoins(newToss);
      setCoinsTosses(prev => {
        const next = [...prev, newToss];
        return next.length > 6 ? [newToss] : next;
      });
      setIsTossingAnimation(false);
    }, 450);
  };

  // 一鍵擲出六爻
  const handleTossAllSixRounds = () => {
    setIsTossingAnimation(true);
    setTimeout(() => {
      const all: number[][] = [];
      for (let i = 0; i < 6; i++) {
        all.push([
          Math.random() > 0.5 ? 3 : 2,
          Math.random() > 0.5 ? 3 : 2,
          Math.random() > 0.5 ? 3 : 2
        ]);
      }
      setCoinsTosses(all);
      setCurrentTossCoins(all[5] as [number, number, number]);
      setIsTossingAnimation(false);
    }, 500);
  };

  // 執行占卜起卦
  const handleCast = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim()) {
      alert('請先輸入您想占問的具體問題！');
      return;
    }

    if (method === 'coins' && coinsTosses.length < 6) {
      if (confirm('銅錢尚未擲滿六爻，是否為您一鍵補齊六爻起卦？')) {
        const all: number[][] = [...coinsTosses];
        while (all.length < 6) {
          all.push([
            Math.random() > 0.5 ? 3 : 2,
            Math.random() > 0.5 ? 3 : 2,
            Math.random() > 0.5 ? 3 : 2
          ]);
        }
        setCoinsTosses(all);
        executeFinalCast(all);
        return;
      }
      return;
    }

    executeFinalCast(coinsTosses);
  };

  const executeFinalCast = (tossesToUse: number[][]) => {
    const numbers: [number, number, number] | undefined = method === 'numbers' ? [num1, num2, num3] : undefined;
    const finalTosses = method === 'coins' ? tossesToUse : undefined;

    const res = castZiweiDivination(question.trim(), category, method, numbers, currentChartPalaces, finalTosses);
    const newId = `div_${Date.now()}`;
    
    setResult(res);
    setCurrentRecordId(newId);
    setAiAnalysis(null);
    setAiError(null);

    // Save record to local storage
    const newRecord: DivinationRecord = {
      ...res,
      id: newId,
      createdAt: new Date().toLocaleString('zh-TW', { hour12: false })
    };
    saveDivinationRecord(newRecord);
    setHistoryRecords(getDivinationRecords());
  };

  // 呼叫 AI 宗師問卜
  const handleCallAIDivination = async () => {
    if (!result) return;
    setIsAiLoading(true);
    setAiError(null);
    try {
      const prompt = buildDivinationPrompt(result);
      const reply = await callAIModel(prompt);
      setAiAnalysis(reply);
      // Persist AI reading to storage
      if (currentRecordId) {
        updateDivinationAI(currentRecordId, reply);
        setHistoryRecords(getDivinationRecords());
      }
    } catch (e: any) {
      setAiError(e?.message || 'AI 占卜請求失敗，請至「AI 設定」確認 API Key 是否填妥。');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopyAiAnalysis = () => {
    if (!aiAnalysis) return;
    navigator.clipboard.writeText(aiAnalysis);
    setCopiedAi(true);
    setTimeout(() => setCopiedAi(false), 2000);
  };

  const handleSelectHistoryRecord = (rec: DivinationRecord) => {
    setResult(rec);
    setCurrentRecordId(rec.id);
    setAiAnalysis(rec.aiAnalysis || null);
    setQuestion(rec.question);
    setCategory(rec.category);
    setMethod(rec.method);
    setActiveTab('cast');
  };

  const handleDeleteRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('確定要刪除這筆占卜紀錄嗎？')) {
      deleteDivinationRecord(id);
      setHistoryRecords(getDivinationRecords());
      if (currentRecordId === id) {
        setCurrentRecordId(null);
        setResult(null);
        setAiAnalysis(null);
      }
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm('確定要清空所有的歷史占卜紀錄嗎？此動作無法復原。')) {
      clearDivinationRecords();
      setHistoryRecords([]);
      setCurrentRecordId(null);
      setResult(null);
      setAiAnalysis(null);
    }
  };

  // 渲染爻線 (⚊ ⚋)
  const renderHexagramLine = (lineType: HexagramLineType, index: number, isMoving: boolean) => {
    const isYang = lineType === 'yang' || lineType === 'moving_yang';
    const isLineMoving = lineType === 'moving_yang' || lineType === 'moving_yin' || isMoving;

    return (
      <div key={index} className="flex items-center gap-2 text-xs">
        <span className="w-12 text-[11px] font-mono text-[#7a7267] dark:text-[#8e897e] text-right">
          第 {index + 1} 爻
        </span>
        <div className="flex-1 flex items-center justify-center">
          {isYang ? (
            <div className={`h-3.5 w-full rounded-sm transition ${
              isLineMoving 
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 shadow-md ring-2 ring-rose-400' 
                : 'bg-[#8d271c] dark:bg-[#c0392b]'
            }`} />
          ) : (
            <div className="flex items-center justify-between w-full gap-2.5">
              <div className={`h-3.5 w-full rounded-sm ${
                isLineMoving 
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 shadow-md ring-2 ring-rose-400' 
                  : 'bg-[#4a4238] dark:bg-[#686259]'
              }`} />
              <div className={`h-3.5 w-full rounded-sm ${
                isLineMoving 
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 shadow-md ring-2 ring-rose-400' 
                  : 'bg-[#4a4238] dark:bg-[#686259]'
              }`} />
            </div>
          )}
        </div>
        <div className="w-14 text-center">
          {isLineMoving ? (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse">
              動爻
            </span>
          ) : (
            <span className="text-[10px] text-[#888] font-mono">
              {isYang ? '少陽' : '少陰'}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-black/70 backdrop-blur-sm animate-fade-in font-serif">
      <div className="w-full max-w-5xl h-[94vh] max-h-[900px] rounded-2xl shadow-2xl border flex flex-col overflow-hidden transition
        bg-[#fcfbf7] dark:bg-[#14151c] border-[#d8d0be] dark:border-[#2a2c3a] text-[#222] dark:text-[#eee]">
        
        {/* Header */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b
          bg-[#f6f2e8] dark:bg-[#191b24] border-[#e2d9c8] dark:border-[#262835]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md bg-gradient-to-br from-[#8d271c] to-[#59140c] text-white">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#2b2723] dark:text-[#f4f1ec]">
                  一事一占 · 神卦星象全息問事
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-sans font-bold bg-[#8d271c]/10 text-[#8d271c] dark:bg-[#c0392b]/20 dark:text-[#ef5350]">
                  易經64卦 ✕ 紫微星曜合參
                </span>
              </div>
              <p className="text-xs text-[#706a62] dark:text-[#9c958b]">
                時空正時起卦 · 大衍文王三銅錢神筮 · 先天數理 · 三階動態應期
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 hover:text-black dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs: Cast vs History */}
        <div className="flex border-b text-xs font-bold bg-[#ede7da] dark:bg-[#111218] border-[#ded5c3] dark:border-[#222430]">
          <button
            type="button"
            onClick={() => setActiveTab('cast')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition
              ${activeTab === 'cast'
                ? 'border-[#8d271c] text-[#8d271c] dark:border-[#ef5350] dark:text-[#ef5350] bg-[#fcfbf7] dark:bg-[#14151c]'
                : 'border-transparent text-[#666] dark:text-[#aaa] hover:text-[#222] dark:hover:text-white'}`}
          >
            <Compass className="w-4 h-4" />
            <span>【神卦起卦 · 星易互參】</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setHistoryRecords(getDivinationRecords());
              setActiveTab('history');
            }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition
              ${activeTab === 'history'
                ? 'border-[#8d271c] text-[#8d271c] dark:border-[#ef5350] dark:text-[#ef5350] bg-[#fcfbf7] dark:bg-[#14151c]'
                : 'border-transparent text-[#666] dark:text-[#aaa] hover:text-[#222] dark:hover:text-white'}`}
          >
            <History className="w-4 h-4" />
            <span>【歷史占卜問事簿】</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#8d271c] text-white">
              {historyRecords.length}
            </span>
          </button>
        </div>

        {/* Modal Main Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
          
          {/* TAB 1: 起卦問事 */}
          {activeTab === 'cast' && (
            <div className="space-y-6">
              
              {/* Question & Category Input Section */}
              <div className="p-4 sm:p-5 rounded-2xl border bg-white dark:bg-[#191a22] border-[#ded5c3] dark:border-[#282a38] space-y-4 shadow-xs">
                
                {/* Question Text */}
                <div>
                  <label className="block text-xs font-bold text-[#554e44] dark:text-[#b4aea4] mb-1.5 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-[#8d271c] dark:text-[#ef5350]" />
                    心念聚焦點（請具體陳述事件焦點，不宜含糊模稜）
                  </label>
                  <input
                    type="text"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder="例如：本次與某外商團隊的併購合約前景如何？/ 下半年是否適合轉換跑道跳槽？"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-sans outline-none transition
                      bg-[#faf8f4] dark:bg-[#111218] border-[#d8d0bf] dark:border-[#353746] text-[#222] dark:text-[#eee] focus:border-[#8d271c]"
                  />
                </div>

                {/* Category Grid */}
                <div>
                  <label className="block text-xs font-bold text-[#554e44] dark:text-[#b4aea4] mb-1.5">
                    問事類別（決定紫微斗數事由類神用神宮垣）
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-2.5 rounded-xl text-xs font-serif transition border text-left flex flex-col justify-between
                          ${category === cat.id
                            ? 'bg-[#8d271c] text-white border-[#701e15] font-bold shadow-xs'
                            : 'bg-white dark:bg-[#14151c] text-[#444] dark:text-[#ccc] border-[#ded5c5] dark:border-[#272936] hover:bg-[#ede5d4] dark:hover:bg-[#1e202b]'}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{cat.icon}</span>
                          <span className="text-xs font-bold">{cat.id}</span>
                        </div>
                        <span className={`text-[10px] mt-1 truncate ${category === cat.id ? 'text-[#ffcfca]' : 'text-[#888]'}`}>
                          {cat.desc.split('(')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divination Method Selection Tabs */}
                <div className="pt-3 border-t border-[#eee6d7] dark:border-[#262835] space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-[#554e44] dark:text-[#b4aea4]">
                      起卦秘法：
                    </span>
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#eee8dc] dark:bg-[#111218] border border-[#dcd3c0] dark:border-[#252733]">
                      <button
                        type="button"
                        onClick={() => setMethod('horary')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition flex items-center gap-1.5
                          ${method === 'horary'
                            ? 'bg-[#8d271c] text-white shadow-xs'
                            : 'text-[#555] dark:text-[#aaa] hover:text-black dark:hover:text-white'}`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>正時起卦 · 時空神課</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMethod('coins')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition flex items-center gap-1.5
                          ${method === 'coins'
                            ? 'bg-[#8d271c] text-white shadow-xs'
                            : 'text-[#555] dark:text-[#aaa] hover:text-black dark:hover:text-white'}`}
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>大衍銅錢 · 互動搖卦</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMethod('numbers')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition flex items-center gap-1.5
                          ${method === 'numbers'
                            ? 'bg-[#8d271c] text-white shadow-xs'
                            : 'text-[#555] dark:text-[#aaa] hover:text-black dark:hover:text-white'}`}
                      >
                        <Dices className="w-3.5 h-3.5" />
                        <span>先天數理 · 靈動數</span>
                      </button>
                    </div>
                  </div>

                  {/* Mode 1: Horary Description */}
                  {method === 'horary' && (
                    <div className="p-3 rounded-xl bg-[#f8f5ee] dark:bg-[#121319] border border-[#e4dcce] dark:border-[#242633] text-xs text-[#665e52] dark:text-[#9e978b] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#8d271c] dark:text-[#ef5350]" />
                        <span>以動念當下年月日時分秒之天地陰陽氣數，同步排演正時天盤與易經時空卦。</span>
                      </div>
                      <span className="font-mono text-[11px] opacity-75">
                        即時感應
                      </span>
                    </div>
                  )}

                  {/* Mode 2: Coins Interactive Casting */}
                  {method === 'coins' && (
                    <div className="p-4 rounded-xl bg-[#f8f5ee] dark:bg-[#121319] border border-[#e4dcce] dark:border-[#242633] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#8d271c] dark:text-[#ef5350] flex items-center gap-1.5">
                          <Coins className="w-4 h-4" />
                          <span>文王三枚大衍神錢筮法（已擲 {coinsTosses.length} / 6 爻）</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleTossOneRound}
                            disabled={isTossingAnimation}
                            className="px-3 py-1 rounded-lg text-xs font-bold transition border shadow-xs flex items-center gap-1
                              bg-[#96551b] hover:bg-[#804715] text-[#fff7ed] border-[#7d4414] disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 ${isTossingAnimation ? 'animate-spin' : ''}`} />
                            <span>{coinsTosses.length >= 6 ? '重新擲第1爻' : `擲第 ${coinsTosses.length + 1} 爻`}</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleTossAllSixRounds}
                            disabled={isTossingAnimation}
                            className="px-3 py-1 rounded-lg text-xs font-bold transition border shadow-xs flex items-center gap-1
                              bg-[#8d271c] hover:bg-[#721f16] text-white border-[#661c14] disabled:opacity-50"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>一鍵搖出六爻</span>
                          </button>
                        </div>
                      </div>

                      {/* 3 Coins Visual Area */}
                      <div className="flex items-center justify-center gap-6 py-3">
                        {currentTossCoins.map((val, idx) => (
                          <div 
                            key={idx}
                            className={`w-14 h-14 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-md transition-transform duration-300
                              ${isTossingAnimation ? 'rotate-180 scale-110' : ''}
                              ${val === 3 
                                ? 'bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 text-amber-950 border-amber-500 ring-2 ring-amber-300/40' 
                                : 'bg-gradient-to-br from-stone-300 via-stone-400 to-stone-600 text-stone-900 border-stone-400 ring-2 ring-stone-300/30'}`}
                          >
                            <div className="w-8 h-8 rounded-full border border-black/30 flex items-center justify-center">
                              <span className="font-serif font-black text-sm">
                                {val === 3 ? '背' : '字'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-center text-[11px] text-[#797165] dark:text-[#979185]">
                        說明：背為陽(3)，字為陰(2)。三背為老陽(9，動爻)，三字為老陰(6，動爻)，兩背一字為少陰(8)，兩字一背為少陽(7)。
                      </div>
                    </div>
                  )}

                  {/* Mode 3: Numbers Input */}
                  {method === 'numbers' && (
                    <div className="p-3.5 rounded-xl bg-[#f8f5ee] dark:bg-[#121319] border border-[#e4dcce] dark:border-[#242633] flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#655e52] dark:text-[#9e978b]">心念報三數 (1 ~ 12)：</span>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={num1}
                          onChange={e => setNum1(Number(e.target.value))}
                          className="w-11 p-1.5 border rounded-lg text-center font-mono text-xs bg-white dark:bg-[#1c1d26] border-[#d8d0be] dark:border-[#333544]"
                        />
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={num2}
                          onChange={e => setNum2(Number(e.target.value))}
                          className="w-11 p-1.5 border rounded-lg text-center font-mono text-xs bg-white dark:bg-[#1c1d26] border-[#d8d0be] dark:border-[#333544]"
                        />
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={num3}
                          onChange={e => setNum3(Number(e.target.value))}
                          className="w-11 p-1.5 border rounded-lg text-center font-mono text-xs bg-white dark:bg-[#1c1d26] border-[#d8d0be] dark:border-[#333544]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleRandomizeNumbers}
                        className="p-1.5 px-3 rounded-lg border text-xs font-sans text-[#666] hover:bg-white dark:hover:bg-[#20222d] flex items-center gap-1 transition"
                      >
                        <Dices className="w-3.5 h-3.5 text-[#8d271c]" /> 靈機隨機搖數
                      </button>
                    </div>
                  )}

                  {/* Main Cast Submit Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleCast()}
                      className="px-8 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition flex items-center gap-2
                        bg-gradient-to-r from-[#8d271c] to-[#63140b] text-white hover:opacity-95 active:scale-95"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>立 刻 啟 卦 排 演</span>
                    </button>
                  </div>

                </div>

              </div>

              {/* Divination Result Section */}
              {result && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Hero Verdict Banner Card */}
                  <div className="p-5 sm:p-6 rounded-2xl border shadow-md space-y-4
                    bg-white dark:bg-[#191a24] border-[#ded5c3] dark:border-[#2a2c3c]">
                    
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 border-[#eee6d7] dark:border-[#262835]">
                      <div className="flex items-center gap-3">
                        <span className={`px-3.5 py-1.5 rounded-xl text-base font-bold shadow-sm
                          ${['大吉', '吉'].includes(result.outcomeGrade) ? 'bg-[#1b7a4f] text-white' : ''}
                          ${['小吉', '平'].includes(result.outcomeGrade) ? 'bg-[#2a5d7c] text-white' : ''}
                          ${['小凶', '凶', '大凶'].includes(result.outcomeGrade) ? 'bg-[#8d271c] text-white' : ''}`}>
                          {result.outcomeGrade}
                        </span>
                        <div>
                          <h3 className="font-bold text-lg sm:text-xl text-[#222] dark:text-[#eee]">
                            {result.verdict}
                          </h3>
                          <p className="text-xs text-[#777] dark:text-[#999] font-mono mt-0.5">
                            起卦時間：{result.castTime} · 用神宮位：【{result.targetPalaceName}】· 卦象評分：{result.score}分
                          </p>
                        </div>
                      </div>

                      {/* AI Astrologer Call Button */}
                      <button
                        onClick={handleCallAIDivination}
                        disabled={isAiLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs shadow-md transition
                          bg-gradient-to-r from-[#2a5d7c] to-[#1c456b] text-white hover:opacity-90 disabled:opacity-50 active:scale-95"
                      >
                        <Bot className="w-4 h-4" />
                        <span>{isAiLoading ? 'AI 宗師推演中...' : '呼叫 AI 宗師深入斷卦'}</span>
                      </button>
                    </div>

                    {/* Dual Cards: Left = Hexagram Card, Right = Ziwei Palace Card */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
                      
                      {/* Left: 易經 64 卦全息卡 (5 cols) */}
                      <div className="lg:col-span-5 p-4 rounded-xl border bg-[#faf7ee] dark:bg-[#13141a] border-[#e8dfcf] dark:border-[#252735] space-y-3">
                        <div className="flex items-center justify-between border-b pb-2 border-[#e6dcce] dark:border-[#20222d]">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{result.hexagramSymbol}</span>
                            <div>
                              <span className="font-bold text-sm text-[#8d271c] dark:text-[#ef5350]">
                                易經感應【{result.hexagramName}】
                              </span>
                              <span className="text-[10px] ml-2 text-[#777] dark:text-[#999]">
                                上{result.upperTrigram.name}({result.upperTrigram.nature}) 下{result.lowerTrigram.name}({result.lowerTrigram.nature})
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-[#8d271c]/10 text-[#8d271c] dark:text-[#ef5350]">
                            {result.movingLineIndex === 0 ? '純靜卦' : `動爻: 第${result.movingLineIndex}爻`}
                          </span>
                        </div>

                        {/* Visual Hexagram Lines */}
                        <div className="py-2 px-1 space-y-2 bg-white/70 dark:bg-[#1a1b24] rounded-lg border border-[#e8ded0] dark:border-[#252838]">
                          {result.hexagramLines.map((lineType, idx) => 
                            renderHexagramLine(lineType, idx, idx + 1 === result.movingLineIndex)
                          )}
                        </div>

                        {/* Judgment & Moving line advice */}
                        <div className="space-y-1.5 text-xs text-[#554e44] dark:text-[#b0aaa0] pt-1">
                          <div>
                            <span className="font-bold text-[#8d271c] dark:text-[#ef5350]">《大象傳》：</span>
                            <span>{result.hexagramJudgment}</span>
                          </div>
                          <div className="text-[11px] p-2 rounded bg-[#f2ecdd] dark:bg-[#1c1d27] border border-[#e4dac9] dark:border-[#2c2e3e]">
                            <span className="font-bold text-[#2a5d7c] dark:text-[#64b5f6]">動爻變易機竅：</span>
                            <span>{result.movingLineText}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: 紫微斗數用神宮位與三方星象 (7 cols) */}
                      <div className="lg:col-span-7 p-4 rounded-xl border bg-[#faf7ee] dark:bg-[#13141a] border-[#e8dfcf] dark:border-[#252735] space-y-3">
                        <div className="flex items-center justify-between border-b pb-2 border-[#e6dcce] dark:border-[#20222d]">
                          <div className="flex items-center gap-1.5 font-bold text-sm text-[#8d271c] dark:text-[#ef5350]">
                            <Compass className="w-4 h-4" />
                            <span>用神宮位【{result.targetPalaceName}】✕ 對宮【{result.oppositePalaceName}】</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#2a5d7c] dark:text-[#64b5f6]">
                            能量值: {result.score}
                          </span>
                        </div>

                        {/* Detailed Star Analysis */}
                        <p className="text-xs leading-relaxed text-[#555] dark:text-[#bbb]">
                          {result.detailedAnalysis}
                        </p>

                        {/* Sihua Impacts */}
                        {result.sihuaImpact.length > 0 && (
                          <div className="p-2.5 rounded-lg bg-white/70 dark:bg-[#1a1b24] border border-[#e8ded0] dark:border-[#252838] space-y-1 text-xs">
                            <span className="font-bold text-[#2a5d7c] dark:text-[#64b5f6]">四化氣機動態引動：</span>
                            {result.sihuaImpact.map((s, idx) => (
                              <div key={idx} className="text-[#444] dark:text-[#ccc]">✦ {s}</div>
                            ))}
                          </div>
                        )}

                        {/* Star Hexagram Resonance */}
                        <div className="p-2.5 rounded-lg bg-[#f0ebd9] dark:bg-[#1b1c26] border border-[#ded4bf] dark:border-[#292c3c] text-xs text-[#524b40] dark:text-[#aba496] leading-relaxed">
                          {result.starHexagramResonance}
                        </div>
                      </div>

                    </div>

                    {/* Three-Phase Timing Bar (三階動態應期) */}
                    <div className="p-4 rounded-xl border bg-[#fbf9f4] dark:bg-[#15161e] border-[#e2d9c7] dark:border-[#262836] space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-[#8d271c] dark:text-[#ef5350]">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>三階動態時空應期精推</span>
                        </span>
                        <span className="text-[11px] font-normal text-[#777] dark:text-[#999]">
                          {result.timingWindow}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-lg bg-white dark:bg-[#1b1c26] border border-[#e2d9c8] dark:border-[#292b3a]">
                          <div className="font-bold text-[#2e7d32] dark:text-[#4caf50] mb-1">
                            🌱 第一階：萌芽發端期
                          </div>
                          <div className="text-[11px] text-[#666] dark:text-[#aaa] leading-relaxed">
                            {result.timingPhases?.germination}
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-white dark:bg-[#1b1c26] border border-[#e2d9c8] dark:border-[#292b3a]">
                          <div className="font-bold text-[#e65100] dark:text-[#ff9800] mb-1">
                            ⚡ 第二階：激化轉折期
                          </div>
                          <div className="text-[11px] text-[#666] dark:text-[#aaa] leading-relaxed">
                            {result.timingPhases?.climax}
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-white dark:bg-[#1b1c26] border border-[#e2d9c8] dark:border-[#292b3a]">
                          <div className="font-bold text-[#8d271c] dark:text-[#ef5350] mb-1">
                            🎯 第三階：定局結算期
                          </div>
                          <div className="text-[11px] text-[#666] dark:text-[#aaa] leading-relaxed">
                            {result.timingPhases?.resolution}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Qimen Dual-Palace & Four Harms Remedy Section (奇門時家雙宮推運 ✕ 四害化解 ✕ 六次元改運) */}
                    {result.qimenRemedy && (
                      <div className="p-4 sm:p-5 rounded-xl border bg-[#fbf8f0] dark:bg-[#161720] border-[#e4dac6] dark:border-[#2b2d3d] space-y-4">
                        <div className="flex items-center justify-between border-b pb-2.5 border-[#e8dfce] dark:border-[#272938]">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded-md bg-[#8d271c]/10 text-[#8d271c] dark:text-[#ef5350]">
                              🧭
                            </span>
                            <div>
                              <h4 className="font-bold text-xs sm:text-sm text-[#8d271c] dark:text-[#ef5350]">
                                奇門時家主客雙宮斷 ✕ 四害化解 ✕ 六次元改運指南
                              </h4>
                              <p className="text-[10px] text-[#706456] dark:text-[#a09a8f]">
                                依據《奇門時家流年推運賦》與《奇門六次元造命秘訣》，破除磁場阻隔化逆為順
                              </p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold
                            ${result.qimenRemedy.dualPalace.relationGrade === '大吉' || result.qimenRemedy.dualPalace.relationGrade === '吉'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : result.qimenRemedy.dualPalace.relationGrade === '平'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'}`}>
                            態勢：{result.qimenRemedy.dualPalace.relationGrade}
                          </span>
                        </div>

                        {/* 1. Dual Palace Host-Guest Relationship */}
                        <div className="p-3 rounded-lg bg-white dark:bg-[#1b1c26] border border-[#e5dccb] dark:border-[#2a2c3a] space-y-2 text-xs">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="font-bold text-[#2a5d7c] dark:text-[#64b5f6] flex items-center gap-1.5">
                              <span>【主客動態】</span>
                              <span className="text-[#8d271c] dark:text-[#ef5350]">{result.qimenRemedy.dualPalace.guestHostRelation}</span>
                            </div>
                            <div className="text-[11px] font-mono text-[#777] dark:text-[#aaa]">
                              我方：{result.qimenRemedy.dualPalace.myPalaceName} ✕ 客方：{result.qimenRemedy.dualPalace.targetPalaceName}
                            </div>
                          </div>
                          <p className="text-[#555] dark:text-[#bbb] leading-relaxed">
                            {result.qimenRemedy.dualPalace.summary}
                          </p>
                          <div className="p-2 rounded bg-[#f5f1e4] dark:bg-[#13141a] text-[11px] text-[#4d4437] dark:text-[#c4bdb2]">
                            <span className="font-bold text-[#8d271c] dark:text-[#ef5350]">大師戰略方針：</span>
                            {result.qimenRemedy.dualPalace.strategicAdvice}
                          </div>
                        </div>

                        {/* 2. Four Harms Diagnosis & Spatial Remedies */}
                        {result.qimenRemedy.fourHarms.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs font-bold text-[#b45309] dark:text-[#f59e0b] flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>奇門四害檢測（入墓 · 擊刑 · 門迫 · 空亡）調理對策</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                              {result.qimenRemedy.fourHarms.map((harm, hIdx) => (
                                <div key={hIdx} className="p-3 rounded-lg bg-white dark:bg-[#1b1c26] border border-[#e4dac8] dark:border-[#2c2f3f] space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-[#8d271c] dark:text-[#ef5350] flex items-center gap-1">
                                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300">
                                        {harm.type}
                                      </span>
                                      <span>{harm.location}</span>
                                    </span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                                      harm.severity === '高危' ? 'bg-rose-200 text-rose-900 dark:bg-rose-900/60 dark:text-rose-200' :
                                      harm.severity === '中度' ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200' :
                                      'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200'
                                    }`}>
                                      {harm.severity}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#666] dark:text-[#aaa]">
                                    {harm.description}
                                  </p>
                                  <div className="text-[11px] text-[#2e7d32] dark:text-[#81c784] bg-emerald-50/60 dark:bg-emerald-950/20 p-1.5 rounded">
                                    <span className="font-bold">空間調理：</span>{harm.spatialRemedy}
                                  </div>
                                  <div className="text-[11px] text-[#2a5d7c] dark:text-[#64b5f6] bg-sky-50/60 dark:bg-sky-950/20 p-1.5 rounded">
                                    <span className="font-bold">行為心法：</span>{harm.behavioralRemedy}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 3. Six-Dimension Actionable Breakthrough Guides */}
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-[#2e7d32] dark:text-[#81c784] flex items-center gap-1.5">
                            <span>✨ 奇門六次元造命改運具體落地指南</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                            <div className="p-2.5 rounded-lg bg-white dark:bg-[#1b1c26] border border-[#e4dac8] dark:border-[#292b3a] space-y-1">
                              <div className="font-bold text-[#8d271c] dark:text-[#ef5350] text-[11px]">1. 空間方位借力</div>
                              <p className="text-[11px] text-[#666] dark:text-[#aaa] leading-relaxed">
                                {result.qimenRemedy.sixDimensionRemedies.spaceDirection}
                              </p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white dark:bg-[#1b1c26] border border-[#e4dac8] dark:border-[#292b3a] space-y-1">
                              <div className="font-bold text-[#b45309] dark:text-[#f59e0b] text-[11px]">2. 時間吉時引動</div>
                              <p className="text-[11px] text-[#666] dark:text-[#aaa] leading-relaxed">
                                {result.qimenRemedy.sixDimensionRemedies.timeTrigger}
                              </p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white dark:bg-[#1b1c26] border border-[#e4dac8] dark:border-[#292b3a] space-y-1">
                              <div className="font-bold text-[#2a5d7c] dark:text-[#64b5f6] text-[11px]">3. 心態轉念修持</div>
                              <p className="text-[11px] text-[#666] dark:text-[#aaa] leading-relaxed">
                                {result.qimenRemedy.sixDimensionRemedies.mindset}
                              </p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white dark:bg-[#1b1c26] border border-[#e4dac8] dark:border-[#292b3a] space-y-1">
                              <div className="font-bold text-[#7c3aed] dark:text-[#c084fc] text-[11px]">4. 色彩物象能量</div>
                              <p className="text-[11px] text-[#666] dark:text-[#aaa] leading-relaxed">
                                {result.qimenRemedy.sixDimensionRemedies.colorArtifacts}
                              </p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white dark:bg-[#1b1c26] border border-[#e4dac8] dark:border-[#292b3a] space-y-1">
                              <div className="font-bold text-[#059669] dark:text-[#34d399] text-[11px]">5. 能量場調理</div>
                              <p className="text-[11px] text-[#666] dark:text-[#aaa] leading-relaxed">
                                {result.qimenRemedy.sixDimensionRemedies.energyRegulation}
                              </p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white dark:bg-[#1b1c26] border border-[#e4dac8] dark:border-[#292b3a] space-y-1">
                              <div className="font-bold text-[#dc2626] dark:text-[#f87171] text-[11px]">6. 行為破局指令</div>
                              <p className="text-[11px] text-[#666] dark:text-[#aaa] leading-relaxed">
                                {result.qimenRemedy.sixDimensionRemedies.actionBreakthrough}
                              </p>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* Action Plan (錦囊妙計) & Classical Citations (古籍引證) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      
                      {/* JinNang Action Plan */}
                      <div className="p-3.5 rounded-xl bg-[#faf7ef] dark:bg-[#14151b] border border-[#e8dfcf] dark:border-[#272935] space-y-2">
                        <div className="font-bold text-[#2e7d32] dark:text-[#81c784] flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5" /> 避凶趨吉錦囊策論
                        </div>
                        <div className="text-[#555] dark:text-[#bbb] whitespace-pre-line leading-relaxed">
                          {result.actionPlan}
                        </div>
                      </div>

                      {/* Classical Citations */}
                      <div className="p-3.5 rounded-xl bg-[#faf7ef] dark:bg-[#14151b] border border-[#e8dfcf] dark:border-[#272935] space-y-2">
                        <div className="font-bold text-[#8d271c] dark:text-[#ef5350] flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" /> 正統古籍神課引證 (RAG 智庫)
                        </div>
                        <div className="space-y-1.5 text-[11px] text-[#665e52] dark:text-[#9e978b] leading-relaxed">
                          {result.classicalAphorisms?.map((item, idx) => (
                            <div key={idx} className="p-1.5 rounded bg-white/60 dark:bg-[#1a1b24] border border-[#e8ded0] dark:border-[#252838]">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* AI Analysis Result Section */}
                  {aiAnalysis && (
                    <div className="p-5 sm:p-6 rounded-2xl border bg-gradient-to-br from-[#fdfbf7] to-[#f4f0e6] dark:from-[#171822] dark:to-[#12131a] border-[#ded5c3] dark:border-[#2e3142] space-y-3 shadow-md animate-fade-in">
                      <div className="flex items-center justify-between border-b pb-3 border-[#e8dfcf] dark:border-[#272a3a]">
                        <div className="flex items-center gap-2 text-sm font-bold text-[#2a5d7c] dark:text-[#64b5f6]">
                          <Bot className="w-4 h-4" />
                          <span>AI 宗師大師級深度解卦錦囊</span>
                        </div>
                        <button
                          onClick={handleCopyAiAnalysis}
                          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border bg-white dark:bg-[#1e202c] border-[#d8d0bf] dark:border-[#35384a] text-[#555] dark:text-[#ccc] hover:border-[#8d271c] transition"
                        >
                          {copiedAi ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedAi ? '已複製' : '複製斷語'}</span>
                        </button>
                      </div>

                      <div className="text-xs sm:text-sm leading-relaxed text-[#3c3732] dark:text-[#d5d0c5] whitespace-pre-line font-serif space-y-2">
                        {aiAnalysis}
                      </div>
                    </div>
                  )}

                  {/* AI Error Alert */}
                  {aiError && (
                    <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>{aiError}</span>
                      </div>
                      <button
                        onClick={onOpenAISettings}
                        className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold hover:bg-rose-700 transition"
                      >
                        前往 AI 設定
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* TAB 2: 歷史占卜問事簿 */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="搜尋歷史占卜問事關鍵字或分類..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border text-xs outline-none
                      bg-white dark:bg-[#1a1b24] border-[#d8d0bf] dark:border-[#2f3140] text-[#222] dark:text-[#eee]"
                  />
                </div>
                {historyRecords.length > 0 && (
                  <button
                    onClick={handleClearAllHistory}
                    className="px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>清空歷史</span>
                  </button>
                )}
              </div>

              {historyRecords.length === 0 ? (
                <div className="py-16 text-center text-xs text-[#888] space-y-2">
                  <Compass className="w-8 h-8 mx-auto opacity-30" />
                  <p>尚無任何占卜紀錄。前往【起卦問事】立即體驗大衍神卦！</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {historyRecords
                    .filter(r => !searchQuery.trim() || r.question.includes(searchQuery) || r.category.includes(searchQuery) || r.hexagramName?.includes(searchQuery))
                    .map(rec => (
                      <div
                        key={rec.id}
                        onClick={() => handleSelectHistoryRecord(rec)}
                        className="p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3
                          bg-white dark:bg-[#1a1b24] hover:bg-[#faf7ee] dark:hover:bg-[#20222f] border-[#ded5c5] dark:border-[#2c2e3c]"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold
                              ${['大吉', '吉'].includes(rec.outcomeGrade) ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : ''}
                              ${['小吉', '平'].includes(rec.outcomeGrade) ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : ''}
                              ${['小凶', '凶', '大凶'].includes(rec.outcomeGrade) ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : ''}`}>
                              {rec.outcomeGrade}
                            </span>
                            <span className="text-xs font-bold text-[#8d271c] dark:text-[#ef5350]">
                              【{rec.category}】
                            </span>
                            {rec.hexagramName && (
                              <span className="text-xs font-serif font-bold text-[#2a5d7c] dark:text-[#64b5f6]">
                                {rec.hexagramSymbol} {rec.hexagramName}
                              </span>
                            )}
                            <span className="text-xs text-[#777] font-mono">
                              {rec.createdAt}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-[#222] dark:text-[#eee] truncate">
                            {rec.question}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={(e) => handleDeleteRecord(rec.id, e)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="刪除此紀錄"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
