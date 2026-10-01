import React, { useState, useRef, useEffect } from 'react';
import { 
  Moon, Sun, Calendar, FolderOpen, Compass, 
  Sparkles, Cloud, ArrowUpCircle, BookOpen, 
  Menu, X
} from 'lucide-react';
import type { BirthInput } from '../types';
import type { User } from 'firebase/auth';
import type { SyncStatus } from '../lib/cloudSync';
import { forceClearCacheAndReload } from '../lib/pwaService';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenBirthModal: () => void;
  onOpenDatabase?: () => void;
  onOpenDivination?: () => void;
  onOpenKnowledgeBase?: () => void;
  onOpenAISettings?: () => void;
  onOpenCloudSync?: () => void;
  currentUser?: User | null;
  syncStatus?: SyncStatus;
  isUpdateAvailable?: boolean;
  onApplyUpdate?: () => void;
  birthInput: BirthInput;
  fiveElementsClass: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenBirthModal,
  onOpenDatabase,
  onOpenDivination,
  onOpenKnowledgeBase,
  onOpenAISettings,
  onOpenCloudSync,
  currentUser,
  syncStatus = 'offline',
  isUpdateAvailable = false,
  onApplyUpdate,
  birthInput,
  fiveElementsClass
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const handleVersionClick = () => {
    if (isUpdateAvailable && onApplyUpdate) {
      onApplyUpdate();
    } else {
      if (window.confirm('是否立即清除離線快取並強制重載至最新版本？')) {
        forceClearCacheAndReload();
      }
    }
  };

  return (
    <header 
      className="sticky top-0 z-30 w-full backdrop-blur-md border-b transition-colors duration-200
        bg-[#fbf9f5]/90 dark:bg-[#121316]/90 border-[#e3dccb] dark:border-[#262830]"
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)' }}
    >
      
      {/* PWA Auto-Update Banner */}
      {isUpdateAvailable && (
        <div className="w-full bg-gradient-to-r from-amber-600 to-rose-600 text-white px-3 py-1.5 text-xs font-sans flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2 max-w-[1680px] mx-auto w-full justify-between">
            <span className="flex items-center gap-1.5 font-medium truncate">
              <ArrowUpCircle className="w-4 h-4 animate-bounce shrink-0" />
              <span className="truncate">發現新版本！系統已在背景下載就緒。</span>
            </span>
            <button
              onClick={onApplyUpdate}
              className="px-2.5 py-0.5 rounded-full bg-white text-rose-700 font-bold hover:bg-neutral-100 transition shadow-sm text-xs shrink-0"
            >
              更新
            </button>
          </div>
        </div>
      )}

      <div className="max-w-[1680px] mx-auto px-3 sm:px-6 h-13 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3">
        
        {/* Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-serif text-base sm:text-xl font-bold shadow-sm transition shrink-0
            bg-[#9c2e22] text-[#f8f5ee] border border-[#7a2218] dark:bg-[#af3426] dark:text-white">
            樞
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-xl font-serif font-bold tracking-tight sm:tracking-wider whitespace-nowrap text-[#211f1d] dark:text-[#f2efe9]">
                天樞星象<span className="hidden sm:inline"> · 紫微八字互動解盤</span>
              </h1>
              <span className="hidden lg:inline-flex items-center text-xs px-2 py-0.5 rounded-full font-serif border
                bg-[#f1ebe0] text-[#78261e] border-[#d9ceb9] dark:bg-[#201d1c] dark:text-[#df756b] dark:border-[#422d2a]">
                中州三合 · 欽天四化 · 命例庫
              </span>
              {/* Version & PWA Badge (Desktop) */}
              <button
                onClick={handleVersionClick}
                className={`hidden md:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded border transition cursor-pointer ${
                  isUpdateAvailable
                    ? 'bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                    : 'bg-black/5 dark:bg-white/5 text-[#787166] dark:text-[#959187] border-transparent hover:border-[#9c2e22]'
                }`}
                title={isUpdateAvailable ? '有新版本可更新！點擊立即套用' : 'PWA v1.3.2 (點擊可強制清除快取並重整)'}
              >
                {isUpdateAvailable ? '✨ 新版本就緒' : 'v1.3.2 PWA'}
              </button>
            </div>
            <p className="hidden md:block text-xs text-[#706a62] dark:text-[#99948c] font-sans truncate">
              全維度星象解讀 · 六層流限時空疊盤
            </p>
          </div>
        </div>

        {/* Desktop Controls (sm and up) */}
        <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Quick birth info badge */}
          <button
            onClick={onOpenBirthModal}
            className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-serif transition border
              bg-[#ffffff]/80 dark:bg-[#1a1b22] hover:bg-[#f6f2e9] dark:hover:bg-[#22242d]
              text-[#3d3934] dark:text-[#d4cfc5] border-[#d8d0bf] dark:border-[#31333d]"
            title="點擊自訂生辰八字"
          >
            <Calendar className="w-3.5 h-3.5 text-[#9c2e22] dark:text-[#df756b]" />
            <span className="font-semibold">{birthInput.name}</span>
            <span>({birthInput.gender})</span>
            <span className="text-[#877f74] dark:text-[#78756e]">|</span>
            <span>{birthInput.year}年{birthInput.month}月{birthInput.day}日</span>
            <span className="text-[#877f74] dark:text-[#78756e]">|</span>
            <span className="text-[#9c2e22] dark:text-[#e07b72] font-semibold">{fiveElementsClass}</span>
          </button>

          {/* Google Cloud Sync Button */}
          {onOpenCloudSync && (
            <button
              onClick={onOpenCloudSync}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-serif font-bold transition border shadow-xs flex items-center gap-1.5 ${
                currentUser
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                  : 'bg-white dark:bg-[#1a1c22] text-[#3d3934] dark:text-[#d4cfc5] border-[#d8d0bf] dark:border-[#31333d] hover:border-[#9c2e22]'
              }`}
              title={currentUser ? `Google 帳號已連結：${currentUser.email}` : '登入 Google 帳號跨裝置同步命盤'}
            >
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="User"
                  className="w-4 h-4 rounded-full border border-emerald-500"
                />
              ) : (
                <Cloud className={`w-3.5 h-3.5 ${currentUser ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-500'}`} />
              )}
              <span className="hidden md:inline">
                {currentUser ? '雲端同步' : 'Google 同步'}
              </span>
              {currentUser && (
                <span className={`w-1.5 h-1.5 rounded-full ${
                  syncStatus === 'syncing' ? 'bg-amber-500 animate-pulse' : syncStatus === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
                }`} />
              )}
            </button>
          )}

          {/* Ziwei Divination shortcut button */}
          {onOpenDivination && (
            <button
              onClick={onOpenDivination}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-serif font-bold transition border shadow-xs flex items-center gap-1.5
                bg-[#96551b] hover:bg-[#804715] text-[#fff7ed] border-[#7d4414]"
              title="開啟紫微斗數一事一占 · 神卦問事"
            >
              <Compass className="w-3.5 h-3.5 text-[#fed7aa]" />
              <span className="hidden md:inline">紫微占卜</span>
            </button>
          )}

          {/* Database shortcut button */}
          {onOpenDatabase && (
            <button
              onClick={onOpenDatabase}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-serif font-bold transition border flex items-center gap-1.5
                bg-[#8d271c] text-white hover:bg-[#782017] border-[#701e15]"
              title="開啟命例庫資料庫"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">命例庫</span>
            </button>
          )}

          {/* Classical Metaphysics Knowledge Base */}
          {onOpenKnowledgeBase && (
            <button
              onClick={onOpenKnowledgeBase}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-serif font-bold transition border shadow-xs flex items-center gap-1.5
                bg-[#234338] hover:bg-[#1a332a] text-[#ecfdf5] border-[#162e25]"
              title="開啟 440 萬字古籍 RAG 知識智庫與大師級 AI Studio"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#a7f3d0]" />
              <span className="hidden md:inline">典籍智庫</span>
            </button>
          )}

          {/* AI Settings shortcut button */}
          {onOpenAISettings && (
            <button
              onClick={onOpenAISettings}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-serif font-bold transition border shadow-xs flex items-center gap-1.5
                bg-[#24334a] hover:bg-[#1c293c] text-[#e0e7ff] border-[#1a2536] dark:bg-[#1e2a3c] dark:hover:bg-[#283850]"
              title="設定 Gemini / OpenRouter API Key 與模型"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#93c5fd]" />
              <span className="hidden lg:inline">AI 設定</span>
            </button>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 sm:p-2 rounded-lg border transition duration-200
              bg-[#ffffff] dark:bg-[#1a1b22] hover:bg-[#f6f2e9] dark:hover:bg-[#22242d]
              text-[#555048] dark:text-[#c4bfb5] border-[#d8d0bf] dark:border-[#31333d]"
            title={darkMode ? '切換至宣紙明朗模式' : '切換至曜石星幕模式'}
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-[#f0b429]" />
            ) : (
              <Moon className="w-4 h-4 text-[#2a5d7c]" />
            )}
          </button>
        </div>

        {/* Mobile Controls (< sm) - Sleek, compact & never overflows */}
        <div className="flex sm:hidden items-center gap-1 shrink-0 relative" ref={mobileMenuRef}>
          
          {/* 1. Cloud Sync (Mobile) */}
          {onOpenCloudSync && (
            <button
              onClick={onOpenCloudSync}
              className={`p-1.5 rounded-lg border transition ${
                currentUser
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60'
                  : 'bg-white dark:bg-[#1a1c22] text-[#3d3934] dark:text-[#d4cfc5] border-[#d8d0bf] dark:border-[#31333d]'
              }`}
              title={currentUser ? `Google 帳號已連結：${currentUser.email}` : 'Google 雲端同步'}
            >
              <Cloud className={`w-3.5 h-3.5 ${currentUser ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-500'}`} />
            </button>
          )}

          {/* 2. Ziwei Divination (Mobile) */}
          {onOpenDivination && (
            <button
              onClick={onOpenDivination}
              className="p-1.5 rounded-lg border transition bg-[#96551b] text-[#fff7ed] border-[#7d4414]"
              title="紫微占卜 · 神卦問事"
            >
              <Compass className="w-3.5 h-3.5 text-[#fed7aa]" />
            </button>
          )}

          {/* 3. AI Settings (Mobile) */}
          {onOpenAISettings && (
            <button
              onClick={onOpenAISettings}
              className="p-1.5 rounded-lg border transition bg-[#24334a] text-[#e0e7ff] border-[#1a2536] dark:bg-[#1e2a3c]"
              title="AI 模型設定"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#93c5fd]" />
            </button>
          )}

          {/* 4. Dark Mode (Mobile) */}
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 rounded-lg border transition
              bg-[#ffffff] dark:bg-[#1a1b22] text-[#555048] dark:text-[#c4bfb5] border-[#d8d0bf] dark:border-[#31333d]"
            title={darkMode ? '切換宣紙模式' : '切換暗黑模式'}
          >
            {darkMode ? (
              <Sun className="w-3.5 h-3.5 text-[#f0b429]" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[#2a5d7c]" />
            )}
          </button>

          {/* 5. Mobile More Tools Dropdown Trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-1.5 rounded-lg border transition ${
              isMobileMenuOpen
                ? 'bg-[#8d271c] text-white border-[#701e15]'
                : 'bg-white dark:bg-[#1a1c22] text-[#3d3934] dark:text-[#d4cfc5] border-[#d8d0bf] dark:border-[#31333d]'
            }`}
            title="更多功能選單"
            aria-label="更多功能選單"
          >
            {isMobileMenuOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
          </button>

          {/* Mobile Popover Menu */}
          {isMobileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl border p-2 z-50 font-serif
              bg-[#fdfbf7] dark:bg-[#161820] border-[#d8cfbe] dark:border-[#2f3242] text-[#2c2823] dark:text-[#e5e2da]
              animate-in fade-in zoom-in-95 duration-150">
              
              <div className="text-[11px] font-bold text-[#8d271c] dark:text-[#ef5350] px-2.5 py-1 mb-1 border-b border-[#ece5d6] dark:border-[#262834]">
                快捷功能導航
              </div>

              {/* 典籍智庫 */}
              {onOpenKnowledgeBase && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenKnowledgeBase();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs hover:bg-[#ede5d4] dark:hover:bg-[#222430] transition text-left"
                >
                  <BookOpen className="w-4 h-4 text-[#234338] dark:text-[#a7f3d0] shrink-0" />
                  <div className="min-w-0">
                    <div className="font-bold">典籍智庫</div>
                    <div className="text-[10px] text-[#787166] dark:text-[#959187]">440萬字古籍檢索 & AI Studio</div>
                  </div>
                </button>
              )}

              {/* 命例庫 */}
              {onOpenDatabase && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenDatabase();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs hover:bg-[#ede5d4] dark:hover:bg-[#222430] transition text-left"
                >
                  <FolderOpen className="w-4 h-4 text-[#8d271c] dark:text-[#ef5350] shrink-0" />
                  <div className="min-w-0">
                    <div className="font-bold">命例資料庫</div>
                    <div className="text-[10px] text-[#787166] dark:text-[#959187]">查閱與管理所有已存命盤</div>
                  </div>
                </button>
              )}

              {/* 自訂生辰八字 */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenBirthModal();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs hover:bg-[#ede5d4] dark:hover:bg-[#222430] transition text-left"
              >
                <Calendar className="w-4 h-4 text-[#2a5d7c] dark:text-[#64b5f6] shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold">自訂生辰八字</div>
                  <div className="text-[10px] text-[#787166] dark:text-[#959187]">詳細農陽曆 / 閏月設置</div>
                </div>
              </button>

              {/* 版本與快取重整 */}
              <div className="mt-1 pt-1 border-t border-[#ece5d6] dark:border-[#262834]">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleVersionClick();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] text-[#787166] dark:text-[#959187] hover:bg-[#ede5d4] dark:hover:bg-[#222430] transition"
                >
                  <span>系統版本</span>
                  <span className="font-mono text-[#8d271c] dark:text-[#ef5350] font-bold">
                    {isUpdateAvailable ? '點擊更新' : 'v1.3.2'}
                  </span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </header>
  );
};
