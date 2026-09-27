import React, { useState, useEffect } from 'react';
import { X, Sparkles, Key, Check, AlertCircle, ExternalLink, Bot, RefreshCw, Edit3 } from 'lucide-react';
import type { AISettings } from '../types';
import { 
  getStoredAISettings, 
  saveStoredAISettings, 
  callAIModel,
  fetchAvailableGeminiModels,
  fetchAvailableOpenRouterModels 
} from '../lib/aiService';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_GEMINI_MODELS = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (極速新一代 · 官方推薦)' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite (輕量極速)' },
  { id: 'gemini-2.0-pro-exp-02-05', name: 'Gemini 2.0 Pro 實驗版 (最強推理)' },
  { id: 'gemini-2.0-flash-thinking-exp-01-21', name: 'Gemini 2.0 Flash 思考版 (深度推理)' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (長文本旗艦 · 穩定)' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (高性價比 · 穩定)' },
  { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B (超輕量)' },
  { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro Latest' },
  { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash Latest' },
];

const DEFAULT_OPENROUTER_MODELS = [
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 (開源推理神作 · 推薦)' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (文風典雅細膩)' },
  { id: 'openai/gpt-4o', name: 'GPT-4o (全能旗艦大模型)' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash Free (免費版)' },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B (超強開源)' },
];

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AISettings>(getStoredAISettings());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  
  // Dynamic models state
  const [geminiModels, setGeminiModels] = useState<{ id: string; name: string }[]>(DEFAULT_GEMINI_MODELS);
  const [openrouterModels, setOpenrouterModels] = useState<{ id: string; name: string }[]>(DEFAULT_OPENROUTER_MODELS);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [fetchMessage, setFetchMessage] = useState<string | null>(null);
  const [customModelMode, setCustomModelMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredAISettings();
      setSettings(stored);
      setTestStatus('idle');
      setTestMessage('');
      setFetchMessage(null);
      // If current stored model is not in default list, enable custom mode
      if (stored.provider === 'gemini') {
        const inPreset = DEFAULT_GEMINI_MODELS.some(m => m.id === stored.geminiModel);
        if (!inPreset && stored.geminiModel) setCustomModelMode(true);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredAISettings(settings);
    alert('AI API 設定已成功儲存！');
    onClose();
  };

  const handleFetchGeminiModels = async () => {
    if (!settings.geminiApiKey?.trim()) {
      alert('請先填入 Gemini API Key 後再點擊獲取！');
      return;
    }
    setIsFetchingModels(true);
    setFetchMessage('正在自 Google API 獲取您帳號可用的所有模型清單...');
    try {
      const fetched = await fetchAvailableGeminiModels(settings.geminiApiKey, settings.customBaseUrl);
      if (fetched.length > 0) {
        setGeminiModels(fetched);
        setFetchMessage(`成功獲取 ${fetched.length} 個可用模型！`);
        // If current model not in list, set to the first one
        if (!fetched.some(m => m.id === settings.geminiModel)) {
          setSettings(prev => ({ ...prev, geminiModel: fetched[0].id }));
        }
      } else {
        setFetchMessage('Google API 未回傳任何 generateContent 模型，已保留預設清單。');
      }
    } catch (e: any) {
      setFetchMessage(`獲取失敗: ${e?.message || '未知錯誤，請確認 Key 是否正確。'}`);
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleFetchOpenRouterModels = async () => {
    setIsFetchingModels(true);
    setFetchMessage('正在自 OpenRouter 獲取模型清單...');
    try {
      const fetched = await fetchAvailableOpenRouterModels(settings.openrouterApiKey, settings.customBaseUrl);
      if (fetched.length > 0) {
        setOpenrouterModels(fetched);
        setFetchMessage(`成功獲取 ${fetched.length} 個 OpenRouter 模型！`);
      }
    } catch (e: any) {
      setFetchMessage(`獲取失敗: ${e?.message}`);
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('連線測試中...');
    try {
      saveStoredAISettings(settings);
      const reply = await callAIModel('請以易經占卜大師身份回覆一句話：【天地交泰，吉無不利】。');
      setTestStatus('success');
      setTestMessage(`測試成功！API 回應：${reply.slice(0, 80)}...`);
    } catch (e: any) {
      setTestStatus('error');
      setTestMessage(e?.message || '連線測試失敗，請檢查 API Key 或網路環境。');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-serif">
      <div className="w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden
        bg-[#fcfbf7] dark:bg-[#181922] border-[#d8d0be] dark:border-[#31333f] text-[#222] dark:text-[#eee]">
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b
          bg-[#f6f2e8] dark:bg-[#1e2029] border-[#e2dacb] dark:border-[#2d303c]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#8d271c] text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2b2723] dark:text-[#f4f1ec]">
                全局 AI 大師 API 設定
              </h2>
              <p className="text-[11px] text-[#706a62] dark:text-[#9c958b]">
                支援 Google Gemini 與 OpenRouter · 串接大模型深度精批
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          
          {/* Provider Toggle Tabs */}
          <div>
            <label className="block font-bold text-[#554e44] dark:text-[#aaa] mb-1.5">
              選擇 AI 服務供應商
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, provider: 'gemini' })}
                className={`p-2.5 rounded-xl border font-bold transition flex items-center justify-center gap-2
                  ${settings.provider === 'gemini'
                    ? 'bg-[#8d271c] text-white border-[#701e15] shadow-xs'
                    : 'bg-white dark:bg-[#13141a] text-[#555] dark:text-[#ccc] border-[#dcd3bf] dark:border-[#353746]'}`}
              >
                <Sparkles className="w-4 h-4" />
                Google Gemini API
              </button>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, provider: 'openrouter' })}
                className={`p-2.5 rounded-xl border font-bold transition flex items-center justify-center gap-2
                  ${settings.provider === 'openrouter'
                    ? 'bg-[#2a5d7c] text-white border-[#1c456b] shadow-xs'
                    : 'bg-white dark:bg-[#13141a] text-[#555] dark:text-[#ccc] border-[#dcd3bf] dark:border-[#353746]'}`}
              >
                <Bot className="w-4 h-4" />
                OpenRouter API
              </button>
            </div>
          </div>

          {/* Provider Specific Configs */}
          {settings.provider === 'gemini' ? (
            <div className="space-y-3 p-3.5 rounded-xl bg-[#f7f4eb] dark:bg-[#1f212b] border border-[#e2d8c5] dark:border-[#2f3140]">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-[#554e44] dark:text-[#aaa]">
                    Gemini API Key
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#8d271c] dark:text-[#df756b] hover:underline flex items-center gap-0.5"
                  >
                    <span>免費取得 Gemini Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={settings.geminiApiKey}
                    onChange={e => setSettings({ ...settings, geminiApiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 rounded-lg border font-mono bg-white dark:bg-[#14151c] border-[#d6ccb8] dark:border-[#373a4b] text-[#222] dark:text-[#eee]"
                  />
                  <Key className="absolute right-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#554e44] dark:text-[#aaa]">
                    Gemini 模型選用
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomModelMode(!customModelMode)}
                      className="text-[11px] text-[#8d271c] dark:text-[#df756b] hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{customModelMode ? '選擇選單' : '手動自訂 ID'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleFetchGeminiModels}
                      disabled={isFetchingModels || !settings.geminiApiKey}
                      className="text-[11px] px-2 py-0.5 rounded border border-[#d6ccb8] dark:border-[#373a4b] bg-white dark:bg-[#14151c] text-[#8d271c] dark:text-[#df756b] hover:bg-[#eee7d5] dark:hover:bg-[#252835] disabled:opacity-40 flex items-center gap-1"
                      title="從 Google API 獲取您帳號支援的所有可用模型清單"
                    >
                      <RefreshCw className={`w-3 h-3 ${isFetchingModels ? 'animate-spin' : ''}`} />
                      <span>{isFetchingModels ? '抓取中...' : '抓取可用模型'}</span>
                    </button>
                  </div>
                </div>

                {customModelMode ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={settings.geminiModel}
                      onChange={e => setSettings({ ...settings, geminiModel: e.target.value })}
                      placeholder="例如: gemini-2.0-flash 或 gemini-1.5-pro-latest"
                      className="w-full px-3 py-2 rounded-lg border font-mono bg-white dark:bg-[#14151c] border-[#d6ccb8] dark:border-[#373a4b] text-[#222] dark:text-[#eee]"
                    />
                    <p className="text-[10px] text-[#888]">可直接填入官方或預覽版模型名稱（系統會自動修復前綴與參數）</p>
                  </div>
                ) : (
                  <select
                    value={settings.geminiModel}
                    onChange={e => setSettings({ ...settings, geminiModel: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-[#14151c] border-[#d6ccb8] dark:border-[#373a4b] text-[#222] dark:text-[#eee]"
                  >
                    {geminiModels.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                )}

                {fetchMessage && (
                  <div className="mt-1.5 text-[11px] p-2 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                    {fetchMessage}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-3.5 rounded-xl bg-[#eef4f8] dark:bg-[#182129] border border-[#d2e2ec] dark:border-[#263745]">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-[#2a5d7c] dark:text-[#64b5f6]">
                    OpenRouter API Key
                  </label>
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#2a5d7c] dark:text-[#64b5f6] hover:underline flex items-center gap-0.5"
                  >
                    <span>前往 OpenRouter 獲取 Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={settings.openrouterApiKey}
                    onChange={e => setSettings({ ...settings, openrouterApiKey: e.target.value })}
                    placeholder="sk-or-v1-..."
                    className="w-full px-3 py-2 rounded-lg border font-mono bg-white dark:bg-[#14151c] border-[#d6ccb8] dark:border-[#373a4b] text-[#222] dark:text-[#eee]"
                  />
                  <Key className="absolute right-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#2a5d7c] dark:text-[#64b5f6]">
                    模型選用 (支援 DeepSeek, Claude, GPT, Llama)
                  </label>
                  <button
                    type="button"
                    onClick={handleFetchOpenRouterModels}
                    disabled={isFetchingModels}
                    className="text-[11px] px-2 py-0.5 rounded border border-[#c5d7e5] dark:border-[#2f4354] bg-white dark:bg-[#14151c] text-[#2a5d7c] dark:text-[#64b5f6] hover:bg-[#e4eff6] dark:hover:bg-[#1f2d3a] flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isFetchingModels ? 'animate-spin' : ''}`} />
                    <span>刷新</span>
                  </button>
                </div>
                <select
                  value={settings.openrouterModel}
                  onChange={e => setSettings({ ...settings, openrouterModel: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-[#14151c] border-[#d6ccb8] dark:border-[#373a4b] text-[#222] dark:text-[#eee]"
                >
                  {openrouterModels.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Advanced / Optional */}
          <div>
            <label className="block text-[#666] dark:text-[#aaa] mb-1">自訂 Base URL (選填，方便代理跳轉)</label>
            <input
              type="text"
              value={settings.customBaseUrl || ''}
              onChange={e => setSettings({ ...settings, customBaseUrl: e.target.value })}
              placeholder="預設留空即可"
              className="w-full px-3 py-1.5 rounded-lg border bg-white dark:bg-[#14151c] border-[#d6ccb8] dark:border-[#373a4b] text-[#222] dark:text-[#eee]"
            />
          </div>

          {/* Test Status feedback */}
          {testStatus !== 'idle' && (
            <div className={`p-2.5 rounded-lg text-xs flex items-start gap-1.5
              ${testStatus === 'success' ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-300' : ''}
              ${testStatus === 'error' ? 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-300' : ''}
              ${testStatus === 'testing' ? 'bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300' : ''}`}
            >
              {testStatus === 'success' && <Check className="w-4 h-4 shrink-0 mt-0.5" />}
              {testStatus === 'error' && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span>{testMessage}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#e2dacb] dark:border-[#2d303c]">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="px-3 py-1.5 rounded-lg border text-xs font-bold transition
                bg-white dark:bg-[#20222b] text-[#555] dark:text-[#ccc] border-[#d8d0bf] dark:border-[#333543] hover:bg-gray-100"
            >
              {testStatus === 'testing' ? '測試中...' : '測試連線'}
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg border border-[#cfc6b4] text-[#666]"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-lg font-bold bg-[#8d271c] text-white hover:bg-[#782017]"
              >
                儲存設定
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
