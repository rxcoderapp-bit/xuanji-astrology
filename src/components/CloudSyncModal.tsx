import React, { useState, useEffect } from 'react';
import { X, Cloud, RefreshCw, LogOut, CheckCircle, AlertCircle, ShieldCheck, Database, Key } from 'lucide-react';
import { cloudSync, DEFAULT_FIREBASE_CONFIG, type SyncStatus, type FirebaseConfig } from '../lib/cloudSync';
import type { User } from 'firebase/auth';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  onSyncComplete
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(cloudSync.currentUser);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(cloudSync.syncStatus);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(cloudSync.lastSyncTime);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [configText, setConfigText] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const unsubAuth = cloudSync.onAuthChange((user) => {
      setCurrentUser(user);
    });
    const unsubSync = cloudSync.onSyncChange((status, time) => {
      setSyncStatus(status);
      setLastSyncTime(time);
    });
    return () => {
      unsubAuth();
      unsubSync();
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      const cfg = cloudSync.getConfig();
      setConfigText(JSON.stringify(cfg, null, 2));
      setFeedbackMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async () => {
    setIsLoading(true);
    setFeedbackMsg(null);
    try {
      const user = await cloudSync.loginWithGoogle();
      setFeedbackMsg({
        type: 'success',
        text: `歡迎回來！已成功登入 ${user.displayName || user.email}，雲端命例已自動雙向同步。`
      });
      if (onSyncComplete) onSyncComplete();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setFeedbackMsg({
          type: 'error',
          text: `Google 登入失敗：${err.message || '請確認網路連線或檢查 Firebase 金鑰設定。'}`
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('確定要登出 Google 帳號嗎？\n登出後命例資料仍完整保留在本機，但暫停跨裝置雲端同步。')) {
      await cloudSync.logout();
      setFeedbackMsg({ type: 'success', text: '已順利登出，系統已切換回純本機模式。' });
    }
  };

  const handleManualSync = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setFeedbackMsg(null);
    try {
      const res = await cloudSync.pullAndMerge();
      if (res && res.success) {
        setFeedbackMsg({
          type: 'success',
          text: `同步成功！本機與雲端命例已雙向合併至最新狀態（目前共 ${res.cases.length} 筆命例）。`
        });
        if (onSyncComplete) onSyncComplete();
      } else {
        setFeedbackMsg({ type: 'error', text: '同步未完成，請檢查網路連線或稍後再試。' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: `同步錯誤：${err.message || err}` });
    } finally {
      setIsLoading(false);
    }
  };

  const parseFirebaseInput = (input: string): FirebaseConfig => {
    const trimmed = input.trim();
    try {
      return JSON.parse(trimmed);
    } catch {}

    const fields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId', 'measurementId'];
    const result: any = {};
    for (const f of fields) {
      const regex = new RegExp(`['"]?${f}['"]?\\s*:\\s*['"]([^'"]+)['"]`);
      const match = trimmed.match(regex);
      if (match) {
        result[f] = match[1];
      }
    }

    if (result.apiKey && result.projectId) {
      return result as FirebaseConfig;
    }
    throw new Error('無法辨識金鑰配置，請確認包含 apiKey 與 projectId。');
  };

  const handleSaveConfig = () => {
    try {
      const parsed = parseFirebaseInput(configText);
      cloudSync.saveConfig(parsed);
      setFeedbackMsg({ type: 'success', text: `已成功儲存 Firebase 專案 [${parsed.projectId}] 金鑰設定！` });
      setShowConfig(false);
    } catch (e: any) {
      setFeedbackMsg({ type: 'error', text: e.message || '金鑰解析失敗' });
    }
  };

  const handleResetConfig = () => {
    cloudSync.resetConfig();
    setConfigText(JSON.stringify(DEFAULT_FIREBASE_CONFIG, null, 2));
    setFeedbackMsg({ type: 'success', text: '已還原為系統預設 Firebase 金鑰配置。' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-serif">
      <div className="w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden transition
        bg-[#fcfbf7] dark:bg-[#181920] border-[#d8d0be] dark:border-[#31333f] text-[#222]">
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b
          bg-[#f6f2e8] dark:bg-[#1e2028] border-[#e2dacb] dark:border-[#2d303c]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-[#9c2e22]/10 text-[#9c2e22] dark:text-[#ff7867]">
              <Cloud className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold tracking-wide text-[#2b2723] dark:text-[#f4f1ec]">
                Google 帳號與雲端同步中心
              </h2>
              <p className="text-xs text-[#787166] dark:text-[#959187] font-sans">
                多端跨裝置資料即時同步 · 離線本機安全防護
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#756f66] hover:text-[#222] dark:text-[#a19c92] dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Message */}
        {feedbackMsg && (
          <div className={`px-6 py-2.5 text-xs font-sans flex items-center gap-2 border-b ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/40'
          }`}>
            {feedbackMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span className="leading-snug">{feedbackMsg.text}</span>
          </div>
        )}

        <div className="p-6 space-y-5 text-sm font-sans max-h-[75vh] overflow-y-auto">

          {/* Account Status Card */}
          <div className="p-4 rounded-xl border bg-white dark:bg-[#121318] border-[#e4dcce] dark:border-[#2f3140] shadow-sm">
            {currentUser ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Google User'}
                      className="w-12 h-12 rounded-full border-2 border-[#9c2e22] shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#9c2e22] text-white flex items-center justify-center font-bold text-lg">
                      {(currentUser.displayName || currentUser.email || 'G')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#222] dark:text-[#eee] text-base">
                        {currentUser.displayName || 'Google 命理名家'}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        syncStatus === 'syncing'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : syncStatus === 'error'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          syncStatus === 'syncing' ? 'bg-amber-500 animate-spin' : syncStatus === 'error' ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'
                        }`} />
                        {syncStatus === 'syncing' ? '同步傳輸中...' : syncStatus === 'error' ? '連線異常' : '已連結雲端'}
                      </span>
                    </div>
                    <div className="text-xs text-[#787166] dark:text-[#959187]">
                      {currentUser.email}
                    </div>
                    <div className="text-[11px] text-[#9c2e22] dark:text-[#ff7867] mt-1 font-mono">
                      最後同步：{lastSyncTime || '剛剛'}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2">
                  <button
                    onClick={handleManualSync}
                    disabled={isLoading}
                    className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium rounded-lg bg-[#9c2e22] text-white hover:bg-[#83251a] disabled:opacity-50 transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    立即手動同步
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#d8d0be] dark:border-[#3a3d4f] text-[#6b645b] dark:text-[#b8b3a9] hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center justify-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    登出帳號
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#f4efe4] dark:bg-[#20222c] mx-auto flex items-center justify-center text-[#787166] dark:text-[#959187]">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[#222] dark:text-[#eee]">尚未登入 Google 帳號</h3>
                  <p className="text-xs text-[#787166] dark:text-[#959187] max-w-sm mx-auto mt-1">
                    目前處於【本機安全儲存模式】。登入 Google 帳號後，您建立的命盤案例與占卜紀錄將可於手機、平板與多部電腦間零時差自動同步！
                  </p>
                </div>
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl font-medium text-xs bg-white dark:bg-[#1a1c24] border border-[#d4cbba] dark:border-[#383a48] text-[#222] dark:text-[#eee] hover:border-[#9c2e22] hover:bg-neutral-50 dark:hover:bg-[#232530] shadow-sm transition inline-flex items-center gap-2 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  {isLoading ? '連線登入中...' : '使用 Google 帳號一鍵登入同步'}
                </button>
              </div>
            )}
          </div>

          {/* Features Highlights */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#f4efe4] dark:bg-[#1a1c24] border border-[#e4dcce] dark:border-[#2a2c3a] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#3a352f] dark:text-[#ddd]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                離線優先架構
              </div>
              <p className="text-[11px] text-[#787166] dark:text-[#959187] leading-relaxed">
                即使沒有網路或處於離線狀態，亦可 100% 正常排盤與記錄；一旦連上網路自動雙向合併。
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#f4efe4] dark:bg-[#1a1c24] border border-[#e4dcce] dark:border-[#2a2c3a] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#3a352f] dark:text-[#ddd]">
                <RefreshCw className="w-4 h-4 text-[#9c2e22] dark:text-[#ff7867]" />
                跨裝置零秒同步
              </div>
              <p className="text-[11px] text-[#787166] dark:text-[#959187] leading-relaxed">
                手機安裝 PWA App 或電腦瀏覽器登入相同帳號，即可同步命盤庫與占卜神諭。
              </p>
            </div>
          </div>

          {/* Firebase Custom Configuration Accordion */}
          <div className="pt-2 border-t border-[#ded6c5] dark:border-[#2c2f3d]">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="w-full flex items-center justify-between text-xs text-[#787166] dark:text-[#959187] hover:text-[#222] dark:hover:text-white transition py-1"
            >
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#9c2e22] dark:text-[#ff7867]" />
                進階：自訂 Firebase 雲端金鑰專案 (可選)
              </span>
              <span className="text-[10px] font-mono underline">
                {showConfig ? '收合' : '展開設定'}
              </span>
            </button>

            {showConfig && (
              <div className="mt-3 p-3.5 rounded-xl bg-white dark:bg-[#121318] border border-[#d8d0be] dark:border-[#383a48] space-y-3 animate-fade-in">
                <p className="text-[11px] text-[#787166] dark:text-[#959187] leading-relaxed">
                  系統預設已為您連線至 Google Firebase 專屬配置。若您希望將資料存放於您自己建立的 Firebase 專案，可直接貼入 Firebase Console 提供之 Web 配置物件：
                </p>
                <textarea
                  value={configText}
                  onChange={(e) => setConfigText(e.target.value)}
                  rows={6}
                  placeholder={`const firebaseConfig = {\n  apiKey: "...",\n  authDomain: "...",\n  projectId: "...",\n  appId: "..."\n};`}
                  className="w-full font-mono text-[11px] p-2.5 rounded-lg border outline-none bg-[#fbf9f4] dark:bg-[#1a1c24] border-[#d4cbba] dark:border-[#353846] text-[#222] dark:text-[#eee] focus:border-[#9c2e22]"
                />
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={handleResetConfig}
                    className="px-3 py-1 text-xs rounded border border-[#d4cbba] dark:border-[#383a48] text-[#787166] dark:text-[#959187] hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    還原系統預設配置
                  </button>
                  <button
                    onClick={handleSaveConfig}
                    className="px-3.5 py-1 text-xs rounded bg-[#9c2e22] text-white hover:bg-[#83251a] font-medium transition"
                  >
                    儲存金鑰設定
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t flex items-center justify-end
          bg-[#f6f2e8] dark:bg-[#1e2028] border-[#e2dacb] dark:border-[#2d303c]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium border border-[#d4cbba] dark:border-[#3a3d4f] text-[#4a443b] dark:text-[#c4bfb5] hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            關閉
          </button>
        </div>

      </div>
    </div>
  );
};
