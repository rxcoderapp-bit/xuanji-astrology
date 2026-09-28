import React, { useState, useMemo } from 'react';
import { 
  X, BookOpen, Search, Sparkles, Copy, Check, 
  Bot, Bookmark 
} from 'lucide-react';
import type { 
  PalaceData, 
  BaziData, 
  HoroscopeState, 
  ClassicalCategory, 
  ClassicalCorpusItem 
} from '../types';
import { 
  searchClassicalCorpus, 
  callRAGMetaphysicsStudio 
} from '../lib/ragEngine';
import { getStoredAISettings } from '../lib/aiService';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPalace?: PalaceData;
  bazi?: BaziData;
  horoscope?: HoroscopeState;
  name?: string;
  gender?: string;
  onOpenAISettings?: () => void;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
  selectedPalace,
  bazi,
  horoscope,
  name = '命主',
  gender = '男',
  onOpenAISettings
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'studio'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ClassicalCategory | 'all'>('all');
  
  // AI Studio state
  const [question, setQuestion] = useState('');
  const [includeChart, setIncludeChart] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiCitations, setAiCitations] = useState<ClassicalCorpusItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Search Results
  const searchResults = useMemo(() => {
    return searchClassicalCorpus(searchQuery, selectedCategory, 20);
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  const handleCopyCitation = (item: ClassicalCorpusItem) => {
    const text = `【典籍引證】${item.sourceBook}《${item.title}》\n原典：「${item.originalText}」\n義理：${item.vernacularMeaning}\n指南：${item.practicalGuidance}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendToStudio = (item: ClassicalCorpusItem) => {
    setQuestion(`請身為命理大宗師，依據《${item.sourceBook}》之「${item.originalText}」，深度剖析其在現代生活中的實戰應用與知命心法。`);
    setActiveTab('studio');
  };

  const handleAskAIStudio = async (customQ?: string) => {
    const queryText = (customQ || question).trim();
    if (!queryText) return;

    const aiConfig = getStoredAISettings();
    const hasKey = aiConfig.provider === 'gemini' ? !!aiConfig.geminiApiKey : !!aiConfig.openrouterApiKey;
    if (!hasKey) {
      if (onOpenAISettings) {
        onOpenAISettings();
      } else {
        alert('請先設定 Gemini 或 OpenRouter API Key！');
      }
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const chartContext = (includeChart && bazi && selectedPalace) ? {
        palace: selectedPalace,
        bazi,
        horoscope,
        name,
        gender
      } : undefined;

      const res = await callRAGMetaphysicsStudio(queryText, chartContext);
      setAiAnswer(res.answer);
      setAiCitations(res.citations);
    } catch (err: any) {
      setErrorMessage(err?.message || 'AI Studio 請求失敗，請檢查網路連線或 API Key。');
    } finally {
      setIsLoading(false);
    }
  };

  const QUICK_PROMPTS = [
    '✦ 雙軌合參如何斷流年大吉與暗礁？',
    '✦ 夫妻宮逢煞忌如何在親密關係中化解？',
    '✦ 丙火生於冬令之調候與身心安頓',
    '✦ 殺破狼在現代社會的開拓破局指南',
    '✦ 五行木盛剋土在黃帝內經中如何調養？',
    '✦ 傷官見官在現代職場之化煞為用'
  ];

  const CATEGORIES: { id: ClassicalCategory | 'all'; label: string }[] = [
    { id: 'all', label: '全部典籍' },
    { id: 'ziwei', label: '紫微斗數' },
    { id: 'bazi', label: '子平八字' },
    { id: 'dualTrack', label: '雙軌合參' },
    { id: 'love', label: '太微婚戀' },
    { id: 'health', label: '五運中醫' },
    { id: 'iching', label: '易經術數' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs font-serif animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden
          bg-[#fcfbf8] dark:bg-[#15161c] border-[#d8cfbe] dark:border-[#2f313e] text-[#222] dark:text-[#eee]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b flex items-center justify-between
          bg-[#f7f2e7] dark:bg-[#1a1b24] border-[#e4dccb] dark:border-[#282a38]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#8d271c] text-white shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#25221e] dark:text-[#f4f1ea]">
                  天樞古籍智庫 · 大師級 AI Studio
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-[#efe7d8] dark:bg-[#27293a] text-[#8d271c] dark:text-[#df756b]">
                  440萬字語料 RAG 檢索
                </span>
              </div>
              <p className="text-xs text-[#706456] dark:text-[#a0a8be]">
                正統天星子平 ✕ 滴天髓 ✕ 窮通寶鑑 ✕ 太微賦 ✕ 黃帝內經 ✕ 易經象數
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#777] hover:text-[#222] dark:hover:text-white transition hover:bg-[#ede5d6] dark:hover:bg-[#252837]"
            title="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Sub-Navigation Tabs */}
        <div className="grid grid-cols-2 border-b text-xs sm:text-sm font-bold bg-[#ede7da] dark:bg-[#121319] border-[#ded5c3] dark:border-[#262835] select-none">
          <button
            onClick={() => setActiveTab('browse')}
            className={`py-2.5 transition flex items-center justify-center gap-2 border-b-2
              ${activeTab === 'browse'
                ? 'border-[#8d271c] text-[#8d271c] dark:border-[#df756b] dark:text-[#df756b] bg-[#fcfbf8] dark:bg-[#15161c]'
                : 'border-transparent text-[#666055] dark:text-[#a09b91] hover:text-[#222] dark:hover:text-white'}`}
          >
            <Bookmark className="w-4 h-4" />
            <span>📜 典籍原典檢索 (RAG Knowledge Browser)</span>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`py-2.5 transition flex items-center justify-center gap-2 border-b-2
              ${activeTab === 'studio'
                ? 'border-[#8d271c] text-[#8d271c] dark:border-[#df756b] dark:text-[#df756b] bg-[#fcfbf8] dark:bg-[#15161c]'
                : 'border-transparent text-[#96551b] dark:text-[#f59e0b] hover:text-[#8d271c]'}`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>✦ 大師級 AI Studio (靈魂問答與專題研討)</span>
          </button>
        </div>

        {/* Modal Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-5 scrollbar-thin">
          
          {/* ==================== TAB 1: 典籍原典檢索 ==================== */}
          {activeTab === 'browse' && (
            <div className="space-y-4">
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#888]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="輸入關鍵字檢索古籍（如：紫微天府、武曲七殺、丙火子月、食神生財、傷官見官、五行木旺、地天泰）..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm font-sans transition
                    bg-white dark:bg-[#1c1d27] border-[#ded4c1] dark:border-[#2e3040] focus:border-[#8d271c] dark:focus:border-[#df756b] outline-none"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map(cat => {
                  const isCatActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer
                        ${isCatActive
                          ? 'bg-[#8d271c] text-white shadow-2xs'
                          : 'bg-[#f3ede1] dark:bg-[#1f202b] text-[#605547] dark:text-[#a09a8f] hover:bg-[#eae1d0] dark:hover:bg-[#282a38]'}`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Search Results Count */}
              <div className="flex items-center justify-between text-xs text-[#706456] dark:text-[#9e978d] px-1">
                <span>共檢索出 <b>{searchResults.length}</b> 條典籍金句條目</span>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-[#8d271c] dark:text-[#df756b] hover:underline"
                  >
                    清除搜尋
                  </button>
                )}
              </div>

              {/* Cards List */}
              <div className="space-y-3.5">
                {searchResults.map(({ item, score, matchedKeywords }) => (
                  <div 
                    key={item.id}
                    className="p-4 rounded-xl border transition-all duration-150 hover:shadow-md
                      bg-white dark:bg-[#1a1b24] border-[#ded4c1] dark:border-[#2c2e3f] space-y-2.5"
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between gap-2 border-b pb-2 border-[#f0e8dc] dark:border-[#262837]">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          item.category === 'ziwei'
                            ? 'bg-[#f5f3ff] text-[#7c3aed] border-[#ddd6fe] dark:bg-[#231535] dark:border-[#4c1d95]'
                            : item.category === 'bazi'
                            ? 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0] dark:bg-[#132d21] dark:border-[#065f46]'
                            : item.category === 'dualTrack'
                            ? 'bg-[#fffbeb] text-[#d97706] border-[#fde68a] dark:bg-[#2d2113] dark:border-[#78350f]'
                            : item.category === 'love'
                            ? 'bg-[#fff1f2] text-[#e11d48] border-[#fecdd3] dark:bg-[#311317] dark:border-[#881337]'
                            : item.category === 'health'
                            ? 'bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe] dark:bg-[#132035] dark:border-[#1e3a8a]'
                            : 'bg-[#faf5ff] text-[#9333ea] border-[#e9d5ff] dark:bg-[#281438] dark:border-[#581c87]'
                        }`}>
                          {item.categoryName}
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-[#8d271c] dark:text-[#df756b]">
                          {item.sourceBook}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-[#222] dark:text-[#eee]">
                          {item.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {score > 0 && searchQuery && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                            契合度 {score}
                          </span>
                        )}
                        {matchedKeywords.length > 0 && (
                          <div className="hidden sm:flex items-center gap-1">
                            {matchedKeywords.slice(0, 3).map((kw, kIdx) => (
                              <span key={kIdx} className="text-[10px] px-1.5 py-0.2 rounded bg-[#f3ede3] dark:bg-[#232535] text-[#706456] dark:text-[#a0a8be]">
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Original Quote Callout */}
                    <div className="p-3 rounded-lg bg-[#fbf8f0] dark:bg-[#161720] border-l-4 border-[#8d271c] dark:border-[#df756b] text-xs sm:text-sm text-[#3a342d] dark:text-[#ded8ce] leading-relaxed italic">
                      「{item.originalText}」
                    </div>

                    {/* Vernacular Interpretation */}
                    <div className="text-xs text-[#52493d] dark:text-[#c4beb4] leading-relaxed text-justify">
                      <b className="text-[#8d271c] dark:text-[#df756b]">【白話深解】：</b>{item.vernacularMeaning}
                    </div>

                    {/* Practical Guidance */}
                    <div className="p-2.5 rounded-lg bg-[#f7f4ec] dark:bg-[#1f202b] text-[11px] text-[#443e37] dark:text-[#b4aea4] space-y-0.5">
                      <b className="text-[#2a5d7c] dark:text-[#64b5f6]">✦ 現代落地實戰指引：</b>
                      <span>{item.practicalGuidance}</span>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#f4ede3] dark:border-[#252735]">
                      <button
                        onClick={() => handleCopyCitation(item)}
                        className="px-2.5 py-1 rounded-md text-xs font-serif border transition flex items-center gap-1
                          bg-[#faf7f0] dark:bg-[#1d1f2a] hover:bg-[#eee6d7] dark:hover:bg-[#282a39] text-[#666055] dark:text-[#a09b91] border-[#ded4c1] dark:border-[#313446]"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === item.id ? '已複製' : '複製引證'}</span>
                      </button>

                      <button
                        onClick={() => handleSendToStudio(item)}
                        className="px-2.5 py-1 rounded-md text-xs font-serif font-bold transition flex items-center gap-1
                          bg-[#8d271c] text-white hover:bg-[#782017] shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>送入 AI 問答</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ==================== TAB 2: 大師級 AI Studio ==================== */}
          {activeTab === 'studio' && (
            <div className="space-y-4">
              
              {/* Question Input Card */}
              <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1b24] border-[#ded4c1] dark:border-[#2c2e3f] space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-[#8d271c] dark:text-[#df756b] flex items-center gap-1.5">
                    <Bot className="w-4 h-4" />
                    <span>宗師級命理專題研討室</span>
                  </span>
                  
                  {bazi && (
                    <label className="flex items-center gap-1.5 text-xs text-[#554e44] dark:text-[#b4aea4] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeChart}
                        onChange={e => setIncludeChart(e.target.checked)}
                        className="rounded border-[#ccc] text-[#8d271c] focus:ring-0"
                      />
                      <span>附帶當前命盤背景 ({name} · 日主【{bazi.dayMaster}】)</span>
                    </label>
                  )}
                </div>

                <textarea
                  rows={3}
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="請在此輸入任何命理、五行、八字、紫微、婚戀或身心健康問題（例如：如何從子平八字與紫微斗數合參看一個人是否適合創業？或者夫妻宮見七殺如何化解？）..."
                  className="w-full p-3 rounded-xl border text-xs sm:text-sm font-sans transition resize-none
                    bg-[#faf8f4] dark:bg-[#15161e] border-[#ded4c1] dark:border-[#2e3040] focus:border-[#8d271c] dark:focus:border-[#df756b] outline-none"
                />

                {/* Quick Prompts */}
                <div className="space-y-1.5">
                  <div className="text-[11px] text-[#706456] dark:text-[#9e978d]">
                    ✦ 經典問答範例（點選立即載入）：
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {QUICK_PROMPTS.map((qp, qIdx) => (
                      <button
                        key={qIdx}
                        onClick={() => {
                          setQuestion(qp.replace('✦ ', ''));
                        }}
                        className="px-2 py-0.5 rounded text-[11px] bg-[#f3ede1] dark:bg-[#20222f] text-[#605547] dark:text-[#b4aea4] hover:bg-[#eae0ce] dark:hover:bg-[#292b3d] transition cursor-pointer"
                      >
                        {qp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={() => handleAskAIStudio()}
                  disabled={isLoading || !question.trim()}
                  className="w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white transition flex items-center justify-center gap-2 shadow-md
                    bg-gradient-to-r from-[#8d271c] via-[#a83224] to-[#8d271c] hover:opacity-95 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? '正檢索 440 萬字智庫並推演中...' : '召喚大宗師進行 RAG 深度解盤'}</span>
                </button>
              </div>

              {/* Error Box */}
              {errorMessage && (
                <div className="p-3 rounded-lg border text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900/60">
                  {errorMessage}
                </div>
              )}

              {/* Citations Preview Box */}
              {aiCitations.length > 0 && (
                <div className="p-3.5 rounded-xl border bg-[#fbf9f2] dark:bg-[#1a1b24] border-[#e8dfcf] dark:border-[#2f3142] space-y-2">
                  <div className="text-xs font-bold text-[#8d271c] dark:text-[#df756b] flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>本題檢索召回之古籍原典引證 ({aiCitations.length} 條)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {aiCitations.map((c, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-white dark:bg-[#15161e] border border-[#eee4d4] dark:border-[#282a3a] space-y-1">
                        <div className="font-bold text-[#b85d18] dark:text-[#e58a44]">
                          {c.sourceBook}《{c.title}》
                        </div>
                        <p className="text-[11px] text-[#554e44] dark:text-[#a8a195] line-clamp-2 italic">
                          「{c.originalText}」
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Answer Display */}
              {aiAnswer && (
                <div className="p-4 rounded-xl border bg-white dark:bg-[#1a1b24] border-[#ded4c1] dark:border-[#2c2e3f] space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b pb-2 border-[#eee5d5] dark:border-[#282a3a]">
                    <span className="font-bold text-xs sm:text-sm text-[#8d271c] dark:text-[#df756b] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>宗師解答全文</span>
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiAnswer);
                        setCopiedId('aiAnswer');
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className="px-2 py-0.5 rounded text-xs text-[#777] hover:text-[#222] dark:hover:text-white transition flex items-center gap-1"
                    >
                      {copiedId === 'aiAnswer' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === 'aiAnswer' ? '已複製' : '複製'}</span>
                    </button>
                  </div>

                  <div className="text-xs sm:text-sm text-[#333] dark:text-[#ddd] leading-relaxed whitespace-pre-wrap font-sans text-justify">
                    {aiAnswer}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
