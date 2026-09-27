import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Compass, Dices, Clock, 
  Bot, HelpCircle, Award, History,
  Trash2, Search, Eye
} from 'lucide-react';
import type { 
  DivinationCategory, 
  DivinationMethod, 
  DivinationResult, 
  DivinationRecord,
  PalaceData 
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

const CATEGORIES: { id: DivinationCategory; desc: string }[] = [
  { id: '事業工作', desc: '升遷、跳槽、創業、專案前景 (看官祿宮)' },
  { id: '求財投資', desc: '盈虧、財運、合約資金、進財時機 (看財帛宮)' },
  { id: '感情婚姻', desc: '脫單、戀情發展、婚姻波折、復合 (看夫妻宮)' },
  { id: '合作商機', desc: '合夥人、外部關係、團隊可靠度 (看僕役宮)' },
  { id: '健康平安', desc: '體質安危、隱患防範、情緒壓力 (看疾厄宮)' },
  { id: '置產買房', desc: '購屋、裝修、不動產增值、搬遷 (看田宅宮)' },
  { id: '考試升遷', desc: '公職考試、證照考取、長官考評 (看父母宮)' },
  { id: '訴訟是非', desc: '官非爭議、合約法規、小人口舌 (看父母/官祿)' },
  { id: '重大抉擇', desc: '二選一、人生十字路口轉折 (看命宮/遷移)' },
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

  useEffect(() => {
    if (isOpen) {
      setHistoryRecords(getDivinationRecords());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRandomizeNumbers = () => {
    setNum1(Math.floor(Math.random() * 12) + 1);
    setNum2(Math.floor(Math.random() * 12) + 1);
    setNum3(Math.floor(Math.random() * 12) + 1);
  };

  const handleCast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      alert('請先輸入您想占問的具體問題！');
      return;
    }

    const numbers: [number, number, number] | undefined = method === 'numbers' ? [num1, num2, num3] : undefined;
    const res = castZiweiDivination(question.trim(), category, method, numbers, currentChartPalaces);
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

  const handleSelectHistoryRecord = (rec: DivinationRecord) => {
    setResult(rec);
    setCurrentRecordId(rec.id);
    setAiAnalysis(rec.aiAnalysis || null);
    setQuestion(rec.question);
    setCategory(rec.category);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-sm animate-fade-in font-serif">
      <div className="w-full max-w-4xl h-[92vh] max-h-[850px] rounded-2xl shadow-2xl border flex flex-col overflow-hidden transition
        bg-[#fcfbf7] dark:bg-[#161720] border-[#d8d0be] dark:border-[#31333f] text-[#222] dark:text-[#eee]">
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b
          bg-[#f6f2e8] dark:bg-[#1c1e27] border-[#e2d9c8] dark:border-[#2b2d3b]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#8d271c] text-white">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#2b2723] dark:text-[#f4f1ec]">
                紫微斗數一事一占 · 神卦問事
              </h2>
              <p className="text-xs text-[#706a62] dark:text-[#9c958b]">
                時空正時起卦 · 類神用神定吉凶 · 雙重 AI 宗師斷卦
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs: Cast vs History */}
        <div className="flex border-b text-xs font-bold bg-[#ede7da] dark:bg-[#13141a] border-[#ded5c3] dark:border-[#252733]">
          <button
            type="button"
            onClick={() => setActiveTab('cast')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition
              ${activeTab === 'cast'
                ? 'border-[#8d271c] text-[#8d271c] dark:border-[#df756b] dark:text-[#df756b] bg-[#fcfbf7] dark:bg-[#161720]'
                : 'border-transparent text-[#666] dark:text-[#aaa] hover:text-[#222] dark:hover:text-white'}`}
          >
            <Compass className="w-4 h-4" />
            <span>【起卦問事】</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setHistoryRecords(getDivinationRecords());
              setActiveTab('history');
            }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition
              ${activeTab === 'history'
                ? 'border-[#8d271c] text-[#8d271c] dark:border-[#df756b] dark:text-[#df756b] bg-[#fcfbf7] dark:bg-[#161720]'
                : 'border-transparent text-[#666] dark:text-[#aaa] hover:text-[#222] dark:hover:text-white'}`}
          >
            <History className="w-4 h-4" />
            <span>【歷史占卜紀錄庫】</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#8d271c] text-white">
              {historyRecords.length}
            </span>
          </button>
        </div>

        {/* Modal Main Layout */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 scrollbar-thin">
          
          {/* TAB 1: 起卦問事 */}
          {activeTab === 'cast' && (
            <div className="space-y-6">
              
              {/* Question Input Section */}
              <form onSubmit={handleCast} className="p-4 sm:p-5 rounded-2xl border bg-white dark:bg-[#1a1b24] border-[#ded5c3] dark:border-[#2c2e3c] space-y-4 shadow-xs">
                
                {/* Question Text */}
                <div>
                  <label className="block text-xs font-bold text-[#554e44] dark:text-[#b4aea4] mb-1.5 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-[#8d271c] dark:text-[#df756b]" />
                    請填入心念聚焦的具體問題 (越精確，卦象越靈驗)
                  </label>
                  <input
                    type="text"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder="例如：今年該不該答應某公司的合夥邀請？/ 某筆投資何時能回款？"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-sans outline-none
                      bg-[#faf8f4] dark:bg-[#13141a] border-[#d8d0bf] dark:border-[#383a48] text-[#222] dark:text-[#eee] focus:border-[#8d271c]"
                  />
                </div>

                {/* Category Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#554e44] dark:text-[#b4aea4] mb-1.5">
                    選擇問事類別 (決定事由類神宮位)
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
                            : 'bg-white dark:bg-[#15161c] text-[#444] dark:text-[#ccc] border-[#ded5c5] dark:border-[#2f313e] hover:bg-[#ede5d4] dark:hover:bg-[#20222b]'}`}
                      >
                        <span className="text-xs font-bold">{cat.id}</span>
                        <span className={`text-[10px] truncate ${category === cat.id ? 'text-[#ffcfca]' : 'text-[#888]'}`}>
                          {cat.desc.split('(')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Method Selector: Horary vs Number */}
                <div className="pt-2 border-t border-[#eee6d7] dark:border-[#262835] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="font-bold text-[#666] dark:text-[#aaa]">起卦模式：</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={method === 'horary'}
                        onChange={() => setMethod('horary')}
                        className="accent-[#8d271c]"
                      />
                      <span>動態時空正時卦 (精確至當下分秒)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={method === 'numbers'}
                        onChange={() => setMethod('numbers')}
                        className="accent-[#8d271c]"
                      />
                      <span>心念報數起卦 (報三數)</span>
                    </label>
                  </div>

                  {method === 'numbers' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#888]">靈動數(1~12):</span>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={num1}
                        onChange={e => setNum1(Number(e.target.value))}
                        className="w-10 p-1 border rounded text-center font-mono text-xs"
                      />
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={num2}
                        onChange={e => setNum2(Number(e.target.value))}
                        className="w-10 p-1 border rounded text-center font-mono text-xs"
                      />
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={num3}
                        onChange={e => setNum3(Number(e.target.value))}
                        className="w-10 p-1 border rounded text-center font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleRandomizeNumbers}
                        className="p-1 px-2 rounded border text-xs font-sans text-[#666] hover:bg-gray-100 flex items-center gap-1"
                      >
                        <Dices className="w-3.5 h-3.5" /> 搖數
                      </button>
                    </div>
                  )}

                  {/* Cast Action Button */}
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2
                      bg-[#8d271c] text-white hover:bg-[#782017]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>立即啟卦排演</span>
                  </button>
                </div>

              </form>

              {/* Divination Result Section */}
              {result && (
                <div className="space-y-5 animate-fade-in">
                  
                  {/* Verdict Banner Card */}
                  <div className="p-5 rounded-2xl border shadow-sm space-y-3
                    bg-white dark:bg-[#1a1b24] border-[#ded5c3] dark:border-[#2c2e3c]">
                    
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 border-[#eee6d7] dark:border-[#262835]">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold shadow-xs
                          ${['大吉', '吉'].includes(result.outcomeGrade) ? 'bg-[#1b7a4f] text-white' : ''}
                          ${['小吉', '平'].includes(result.outcomeGrade) ? 'bg-[#2a5d7c] text-white' : ''}
                          ${['小凶', '凶', '大凶'].includes(result.outcomeGrade) ? 'bg-[#8d271c] text-white' : ''}`}>
                          {result.outcomeGrade}
                        </span>
                        <div>
                          <h3 className="font-bold text-base text-[#222] dark:text-[#eee]">
                            {result.verdict}
                          </h3>
                          <p className="text-xs text-[#777] font-mono mt-0.5">
                            起卦時間：{result.castTime} · 用神宮位：【{result.targetPalaceName}】· 氣場評分：{result.score}分
                          </p>
                        </div>
                      </div>

                      {/* AI Astrologer Call Button */}
                      <button
                        onClick={handleCallAIDivination}
                        disabled={isAiLoading}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm transition
                          bg-gradient-to-r from-[#2a5d7c] to-[#1c456b] text-white hover:opacity-90 disabled:opacity-50"
                      >
                        <Bot className="w-4 h-4" />
                        <span>{isAiLoading ? 'AI 宗師推演中...' : '呼叫 AI 宗師深入斷卦'}</span>
                      </button>
                    </div>

                    {/* Grid 2-col details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed pt-1">
                      
                      {/* Left: Star & Palaces Analysis */}
                      <div className="space-y-2.5 p-3.5 rounded-xl bg-[#faf7ef] dark:bg-[#14151b] border border-[#e8dfcf] dark:border-[#272935]">
                        <div className="font-bold text-[#8d271c] dark:text-[#df756b] flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5" /> 用神星曜象意深入剖析
                        </div>
                        <p className="text-[#555] dark:text-[#bbb]">
                          {result.detailedAnalysis}
                        </p>
                        {result.sihuaImpact.length > 0 && (
                          <div className="pt-2 border-t border-[#ede4d4] dark:border-[#252733] space-y-1">
                            <span className="font-bold text-[#2a5d7c] dark:text-[#64b5f6]">四化氣機引動：</span>
                            {result.sihuaImpact.map((s, idx) => (
                              <div key={idx} className="text-[#444] dark:text-[#ccc]">✦ {s}</div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Action & Timing Window */}
                      <div className="space-y-3 p-3.5 rounded-xl bg-[#faf7ef] dark:bg-[#14151b] border border-[#e8dfcf] dark:border-[#272935]">
                        <div>
                          <div className="font-bold text-[#1b7a4f] dark:text-[#4ade80] flex items-center gap-1 mb-1">
                            <Clock className="w-3.5 h-3.5" /> 關鍵應驗時窗 (應期)
                          </div>
                          <p className="text-[#555] dark:text-[#bbb]">
                            {result.timingWindow}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[#ede4d4] dark:border-[#252733]">
                          <div className="font-bold text-[#9c5914] dark:text-[#e59b3f] flex items-center gap-1 mb-1">
                            <Award className="w-3.5 h-3.5" /> 現代行動避凶錦囊
                          </div>
                          <div className="text-[#444] dark:text-[#ccc] whitespace-pre-line">
                            {result.actionPlan}
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* AI Master Interpretation Box */}
                  {isAiLoading && (
                    <div className="p-8 rounded-2xl border text-center space-y-3 bg-white dark:bg-[#1a1b24] border-[#ded5c3] dark:border-[#2c2e3c]">
                      <Sparkles className="w-8 h-8 text-[#8d271c] dark:text-[#df756b] animate-spin mx-auto" />
                      <p className="font-bold text-sm text-[#222] dark:text-[#eee]">
                        AI 命理大師正依據您所求問之卦象與紫微星盤進行深層推演...
                      </p>
                      <p className="text-xs text-[#888]">
                        透過 Gemini / OpenRouter 進行高維度易經心法對照
                      </p>
                    </div>
                  )}

                  {aiError && (
                    <div className="p-4 rounded-xl border bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 text-xs flex items-center justify-between">
                      <span>{aiError}</span>
                      <button
                        onClick={onOpenAISettings}
                        className="underline font-bold text-xs"
                      >
                        前往檢查 AI 設定
                      </button>
                    </div>
                  )}

                  {aiAnalysis && (
                    <div className="p-5 rounded-2xl border shadow-md space-y-3 bg-gradient-to-b from-[#fdfbf7] to-white dark:from-[#1b1d28] dark:to-[#15161f] border-[#d8cdb8] dark:border-[#383a4c]">
                      <div className="flex items-center justify-between border-b pb-2 border-[#e8dfcf] dark:border-[#2b2d3c]">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-[#8d271c] dark:text-[#df756b]" />
                          <h3 className="font-bold text-sm text-[#8d271c] dark:text-[#df756b]">
                            AI 易經宗師 · 神課詳批錦囊報告
                          </h3>
                        </div>
                        <span className="text-[10px] text-[#888] font-mono">
                          Powered by LLM API
                        </span>
                      </div>
                      <div className="text-xs text-[#332f2b] dark:text-[#ddd] whitespace-pre-wrap leading-relaxed font-sans">
                        {aiAnalysis}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* TAB 2: 歷史占卜紀錄 */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              
              {/* Search & Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-[#1a1b24] border border-[#ded5c3] dark:border-[#2c2e3c]">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-[#888]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="搜尋問題關鍵字、類別或結論..."
                    className="w-full text-xs outline-none bg-transparent text-[#222] dark:text-[#eee]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#777]">共 {historyRecords.length} 筆占卜</span>
                  {historyRecords.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllHistory}
                      className="px-2.5 py-1 text-xs rounded border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>清空全部</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Records List */}
              {(() => {
                const filtered = historyRecords.filter(r => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    r.question.toLowerCase().includes(q) ||
                    r.category.toLowerCase().includes(q) ||
                    r.verdict.toLowerCase().includes(q)
                  );
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-12 text-center border rounded-2xl border-dashed border-[#d8d0be] dark:border-[#333544] bg-white/50 dark:bg-[#161720]/50 space-y-2">
                      <History className="w-8 h-8 text-[#8d271c]/50 dark:text-[#df756b]/50 mx-auto" />
                      <div className="font-bold text-sm text-[#444] dark:text-[#ccc]">
                        {searchQuery ? '查無符合條件的占卜紀錄' : '尚無歷史占卜紀錄'}
                      </div>
                      <p className="text-xs text-[#888]">
                        在「起卦問事」分頁提出問題並排演後，系統將自動永久保存所有卦象、應期及 AI 宗師報告。
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {filtered.map(rec => (
                      <div
                        key={rec.id}
                        className="p-4 rounded-xl border bg-white dark:bg-[#1a1b24] border-[#ded5c3] dark:border-[#2c2e3c] hover:border-[#8d271c] dark:hover:border-[#df756b] transition shadow-2xs space-y-2.5"
                      >
                        {/* Top row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#8d271c] text-white">
                              {rec.category}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold
                              ${['大吉', '吉'].includes(rec.outcomeGrade) ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : ''}
                              ${['小吉', '平'].includes(rec.outcomeGrade) ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : ''}
                              ${['小凶', '凶', '大凶'].includes(rec.outcomeGrade) ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : ''}`}
                            >
                              {rec.outcomeGrade} ({rec.score}分)
                            </span>
                            <span className="text-[11px] text-[#888] font-mono">
                              {rec.createdAt || rec.castTime}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSelectHistoryRecord(rec)}
                              className="px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1
                                bg-[#f6f2e8] dark:bg-[#202330] hover:bg-[#ede3d1] dark:hover:bg-[#2a2e40] text-[#8d271c] dark:text-[#df756b]"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>檢視卦象與斷語</span>
                            </button>
                            <button
                              type="button"
                              onClick={e => handleDeleteRecord(rec.id, e)}
                              className="p-1 rounded text-gray-400 hover:text-red-600 transition"
                              title="刪除此筆占卜紀錄"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Question title */}
                        <div className="text-sm font-bold text-[#222] dark:text-[#eee]">
                          問：{rec.question}
                        </div>

                        {/* Summary info */}
                        <div className="text-xs text-[#666] dark:text-[#aaa] flex flex-wrap items-center gap-3">
                          <div>用神宮位：<b className="text-[#8d271c] dark:text-[#df756b]">{rec.targetPalaceName}宮</b></div>
                          <div>沖照對宮：<b>{rec.oppositePalaceName}宮</b></div>
                          <div>星曜：{rec.majorStars.map(s => s.name).join('、') || '空宮借照'}</div>
                          {rec.aiAnalysis && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              ✦ 已含 AI 宗師詳批
                            </span>
                          )}
                        </div>

                        {/* Brief Verdict preview */}
                        <div className="text-xs p-2 rounded bg-[#faf7ef] dark:bg-[#14151b] border border-[#e8dfcf] dark:border-[#272935] text-[#444] dark:text-[#ccc]">
                          {rec.verdict}
                        </div>

                      </div>
                    ))}
                  </div>
                );
              })()}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t flex justify-between items-center text-xs text-[#777]
          bg-[#f6f2e8] dark:bg-[#1c1e27] border-[#e2d9c8] dark:border-[#2b2d3b]">
          <span>紫微一事一占：心誠則靈，以正心正念化解煞忌。</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[#cfc6b4] text-[#666]"
          >
            關閉
          </button>
        </div>

      </div>
    </div>
  );
};
