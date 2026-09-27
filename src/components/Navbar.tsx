import React from 'react';
import { Moon, Sun, Calendar, FolderOpen, Compass, Sparkles, Cloud, ArrowUpCircle } from 'lucide-react';
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
  onOpenAISettings,
  onOpenCloudSync,
  currentUser,
  syncStatus = 'offline',
  isUpdateAvailable = false,
  onApplyUpdate,
  birthInput,
  fiveElementsClass
}) => {
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
    <header className="sticky top-0 z-30 w-full backdrop-blur-md border-b transition-colors duration-200
      bg-[#fbf9f5]/90 dark:bg-[#121316]/90 border-[#e3dccb] dark:border-[#262830]">
      
      {/* PWA Auto-Update Banner */}
      {isUpdateAvailable && (
        <div className="w-full bg-gradient-to-r from-amber-600 to-rose-600 text-white px-4 py-1.5 text-xs font-sans flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2 max-w-[1680px] mx-auto w-full justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <ArrowUpCircle className="w-4 h-4 animate-bounce" />
              發現新版本！系統已在背景下載完成最新更新。
            </span>
            <button
              onClick={onApplyUpdate}
              className="px-3 py-0.5 rounded-full bg-white text-rose-700 font-bold hover:bg-neutral-100 transition shadow-sm text-xs"
            >
              立即更新重載
            </button>
          </div>
        </div>
      )}

      <div className="max-w-[1680px] mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 overflow-hidden">
        
        {/* Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-serif text-base sm:text-xl font-bold shadow-sm transition shrink-0
            bg-[#9c2e22] text-[#f8f5ee] border border-[#7a2218] dark:bg-[#af3426] dark:text-white">
            玄
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-xl font-serif font-bold tracking-tight sm:tracking-wider whitespace-nowrap text-[#211f1d] dark:text-[#f2efe9]">
                玄璣紫微<span className="hidden sm:inline"> · 八字互動解盤</span>
              </h1>
              <span className="hidden lg:inline-flex items-center text-xs px-2 py-0.5 rounded-full font-serif border
                bg-[#f1ebe0] text-[#78261e] border-[#d9ceb9] dark:bg-[#201d1c] dark:text-[#df756b] dark:border-[#422d2a]">
                中州三合 · 欽天四化 · 命例庫
              </span>
              {/* Version & PWA Badge (Click to Bust Cache) */}
              <button
                onClick={handleVersionClick}
                className={`hidden md:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded border transition cursor-pointer ${
                  isUpdateAvailable
                    ? 'bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                    : 'bg-black/5 dark:bg-white/5 text-[#787166] dark:text-[#959187] border-transparent hover:border-[#9c2e22]'
                }`}
                title={isUpdateAvailable ? '有新版本可更新！點擊立即套用' : 'PWA v1.2.1 (點擊可強制清除快取並重整)'}
              >
                {isUpdateAvailable ? '✨ 新版本就緒' : 'v1.2.1 PWA'}
              </button>
            </div>
            <p className="hidden md:block text-xs text-[#706a62] dark:text-[#99948c] font-sans truncate">
              全維度星象解讀 · 六層流限時空疊盤
            </p>
          </div>
        </div>

        {/* User summary chip & controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
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
              <span className="hidden sm:inline">命例庫</span>
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
              <span className="hidden sm:inline">AI 設定</span>
            </button>
          )}

          {/* Change Birth Button for mobile */}
          <button
            onClick={onOpenBirthModal}
            className="xl:hidden p-1.5 sm:p-2 rounded-lg border text-[#3d3934] dark:text-[#d4cfc5]
              bg-[#ffffff] dark:bg-[#1a1b22] border-[#d8d0bf] dark:border-[#31333d] hover:bg-[#f6f2e9] dark:hover:bg-[#22242d]"
            title="輸入生辰"
          >
            <Calendar className="w-4 h-4 text-[#9c2e22] dark:text-[#df756b]" />
          </button>

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

      </div>
    </header>
  );
};
