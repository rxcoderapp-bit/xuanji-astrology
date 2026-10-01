import React, { useState, useEffect } from 'react';
import { 
  X, Search, Plus, Trash2, Edit3, Download, 
  Upload, Check, Calendar, ArrowRight, FolderOpen,
  Cloud, RefreshCw
} from 'lucide-react';
import type { CaseRecord, BirthInput, Gender, CalendarType } from '../types';
import { 
  getStoredCases, 
  saveCaseRecord, 
  updateCaseRecord, 
  deleteCaseRecord, 
  exportCasesToJson, 
  importCasesFromJson 
} from '../lib/caseStorage';
import { cloudSync } from '../lib/cloudSync';

interface CaseDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCase: (record: BirthInput) => void;
  currentChartInput?: BirthInput;
  onOpenCloudSync?: () => void;
}

const CATEGORIES = ['全部', '自訂', '客戶', '親友', '命理研究'];

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

export const CaseDatabaseModal: React.FC<CaseDatabaseModalProps> = ({
  isOpen,
  onClose,
  onLoadCase,
  currentChartInput,
  onOpenCloudSync
}) => {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [currentUser, setCurrentUser] = useState(cloudSync.currentUser);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form Dialog state (Add or Edit)
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState<Gender>('男');
  const [formCalendar, setFormCalendar] = useState<CalendarType>('solar');
  const [formYear, setFormYear] = useState(1990);
  const [formMonth, setFormMonth] = useState(1);
  const [formDay, setFormDay] = useState(1);
  const [formHour, setFormHour] = useState<number | string>(12);
  const [formMinute, setFormMinute] = useState<number | string>(0);
  const [formIsLeapMonth, setFormIsLeapMonth] = useState(false);
  const [formCategory, setFormCategory] = useState('自訂');
  const [formNotes, setFormNotes] = useState('');

  // Refresh cases on mount or open
  useEffect(() => {
    if (isOpen) {
      setCases(getStoredCases());
    }
  }, [isOpen]);

  useEffect(() => {
    const unsubAuth = cloudSync.onAuthChange((u) => setCurrentUser(u));
    return () => {
      unsubAuth();
    };
  }, []);

  const handleTriggerSync = async () => {
    if (!currentUser) {
      if (onOpenCloudSync) onOpenCloudSync();
      return;
    }
    setIsSyncing(true);
    try {
      const res = await cloudSync.pullAndMerge();
      if (res) {
        setCases(getStoredCases());
      }
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  // Open editor for creating new case
  const handleOpenCreate = () => {
    setEditingId(null);
    if (currentChartInput) {
      setFormName(currentChartInput.name);
      setFormGender(currentChartInput.gender);
      setFormCalendar(currentChartInput.calendar);
      setFormYear(currentChartInput.year);
      setFormMonth(currentChartInput.month);
      setFormDay(currentChartInput.day);
      setFormHour(currentChartInput.hour);
      setFormMinute(currentChartInput.minute);
      setFormIsLeapMonth(currentChartInput.isLeapMonth ?? false);
    } else {
      setFormName('新命例');
      setFormGender('男');
      setFormCalendar('solar');
      setFormYear(1990);
      setFormMonth(1);
      setFormDay(1);
      setFormHour(12);
      setFormMinute(0);
      setFormIsLeapMonth(false);
    }
    setFormCategory('自訂');
    setFormNotes('');
    setIsEditorOpen(true);
  };

  // Open editor for modifying existing case
  const handleOpenEdit = (c: CaseRecord) => {
    setEditingId(c.id);
    setFormName(c.name);
    setFormGender(c.gender);
    setFormCalendar(c.calendar);
    setFormYear(c.year);
    setFormMonth(c.month);
    setFormDay(c.day);
    setFormHour(c.hour);
    setFormMinute(c.minute);
    setFormIsLeapMonth(c.isLeapMonth ?? false);
    setFormCategory(c.category || '自訂');
    setFormNotes(c.notes || '');
    setIsEditorOpen(true);
  };

  // Save or Update handler
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('請填入命例名稱');
      return;
    }

    if (editingId) {
      updateCaseRecord({
        id: editingId,
        name: formName.trim(),
        gender: formGender,
        calendar: formCalendar,
        year: Number(formYear),
        month: Number(formMonth),
        day: Number(formDay),
        hour: Number(formHour),
        minute: Number(formMinute),
        isLeapMonth: formCalendar === 'lunar' ? formIsLeapMonth : false,
        category: formCategory,
        notes: formNotes.trim(),
        createdAt: cases.find(c => c.id === editingId)?.createdAt || ''
      });
    } else {
      saveCaseRecord({
        name: formName.trim(),
        gender: formGender,
        calendar: formCalendar,
        year: Number(formYear),
        month: Number(formMonth),
        day: Number(formDay),
        hour: Number(formHour),
        minute: Number(formMinute),
        isLeapMonth: formCalendar === 'lunar' ? formIsLeapMonth : false,
        category: formCategory,
        notes: formNotes.trim()
      });
    }

    setCases(getStoredCases());
    setIsEditorOpen(false);
  };

  // Delete handler
  const handleDeleteCase = (id: string, name: string) => {
    if (confirm(`確定要刪除命例【${name}】嗎？此操作不可逆。`)) {
      deleteCaseRecord(id);
      setCases(getStoredCases());
    }
  };

  // Export JSON
  const handleExport = () => {
    const jsonStr = exportCasesToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `天樞命例庫備份_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const count = importCasesFromJson(content);
        alert(`成功匯入 ${count} 筆命例！`);
        setCases(getStoredCases());
      } catch (err) {
        alert('匯入失敗，請確認 JSON 檔案格式正確');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filtered cases
  const filteredCases = cases.filter(c => {
    const matchCat = selectedCategory === '全部' || c.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchQuery = !query || 
      c.name.toLowerCase().includes(query) ||
      (c.notes && c.notes.toLowerCase().includes(query)) ||
      String(c.year).includes(query);
    return matchCat && matchQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in font-serif">
      <div className="w-full max-w-4xl h-[90vh] max-h-[820px] rounded-2xl shadow-2xl border flex flex-col overflow-hidden transition
        bg-[#fbf9f4] dark:bg-[#161720] border-[#d8d0be] dark:border-[#31333f] text-[#222] dark:text-[#eee]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b
          bg-[#f6f2e8] dark:bg-[#1c1e27] border-[#e2d9c8] dark:border-[#2b2d3b]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#8d271c] text-white">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2b2723] dark:text-[#f4f1ec]">
                命例資料庫管理中心
              </h2>
              <p className="text-xs text-[#706a62] dark:text-[#9c958b]">
                全功能增刪修 · 本地持久保存 · 一鍵載入星盤
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Google Cloud Sync Button */}
            <button
              onClick={handleTriggerSync}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition shadow-sm ${
                currentUser
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                  : 'bg-white dark:bg-[#20222b] text-[#555] dark:text-[#ccc] border-[#d8d0bf] dark:border-[#333543] hover:border-[#9c2e22]'
              }`}
              title={currentUser ? `已連結 ${currentUser.email} (點擊手動同步)` : '登入 Google 帳號啟用多裝置雲端同步'}
            >
              <Cloud className={`w-3.5 h-3.5 ${currentUser ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-500'}`} />
              {currentUser ? (
                <span className="hidden sm:inline flex items-center gap-1">
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? '同步中...' : '雲端同步'}
                </span>
              ) : (
                <span className="hidden sm:inline">Google 同步</span>
              )}
            </button>

            {/* Import / Export */}
            <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition
              bg-white dark:bg-[#20222b] text-[#555] dark:text-[#ccc] border-[#d8d0bf] dark:border-[#333543] hover:bg-gray-100 dark:hover:bg-[#282a36]">
              <Upload className="w-3.5 h-3.5 text-[#2a5d7c] dark:text-[#64b5f6]" />
              <span className="hidden sm:inline">匯入</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>

            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition
                bg-white dark:bg-[#20222b] text-[#555] dark:text-[#ccc] border-[#d8d0bf] dark:border-[#333543] hover:bg-gray-100 dark:hover:bg-[#282a36]"
              title="匯出備份 JSON"
            >
              <Download className="w-3.5 h-3.5 text-[#1b7a4f] dark:text-[#4ade80]" />
              <span className="hidden sm:inline">匯出</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#756f66] hover:text-[#222] dark:text-[#a19c92] dark:hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search, Category Filters, Add Button */}
        <div className="p-4 border-b space-y-3 bg-[#f3ede1]/60 dark:bg-[#14151b] border-[#e4dccf] dark:border-[#262835]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜尋姓名、生年、關鍵備註..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border font-sans outline-none
                  bg-white dark:bg-[#1b1c24] border-[#d6ccb8] dark:border-[#333544] text-[#222] dark:text-[#eee] focus:border-[#8d271c]"
              />
            </div>

            {/* Create New Case Button */}
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition
                bg-[#8d271c] text-white hover:bg-[#782017]"
            >
              <Plus className="w-4 h-4" />
              新增命例
            </button>

          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[#736c61] dark:text-[#999] font-bold mr-1">分類：</span>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full transition whitespace-nowrap border
                  ${selectedCategory === cat
                    ? 'bg-[#8d271c] text-white border-[#701e15] font-bold'
                    : 'bg-white dark:bg-[#1b1c24] text-[#554e44] dark:text-[#aaa] border-[#ded5c5] dark:border-[#313340] hover:bg-[#eae2d1]'}`}
              >
                {cat}
              </button>
            ))}
            <span className="text-[11px] text-[#888] ml-auto">
              共 {filteredCases.length} 筆命例
            </span>
          </div>
        </div>

        {/* Case Cards List (Scrollable) */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin">
          {filteredCases.map(item => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border transition-all duration-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3
                bg-white dark:bg-[#1a1b24] border-[#ded5c3] dark:border-[#2c2e3c] hover:border-[#8d271c] dark:hover:border-[#df756b] shadow-xs"
            >
              {/* Left Details */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-[#8d271c] dark:text-[#df756b]">
                    {item.name}
                  </span>
                  <span className={`text-[10px] px-2 py-0.2 rounded font-bold
                    ${item.gender === '男' ? 'bg-[#e6f0f7] text-[#1b5073]' : 'bg-[#faedf2] text-[#872a4a]'}`}>
                    {item.gender === '男' ? '乾造 · 男' : '坤造 · 女'}
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded border bg-[#f5f1e8] dark:bg-[#242633] text-[#6e675b] dark:text-[#bbb] border-[#ded5c5] dark:border-[#383a4c]">
                    {item.category || '自訂'}
                  </span>
                </div>

                <div className="text-xs text-[#554e44] dark:text-[#aaa] flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    {item.calendar === 'solar' ? '國曆' : '農曆'}{item.isLeapMonth ? '(閏)' : ''}:
                    {item.year}年{item.month}月{item.day}日 {String(item.hour).padStart(2, '0')}:{String(item.minute).padStart(2, '0')}
                  </span>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-[#787166] dark:text-[#888] line-clamp-1 italic">
                    {item.notes}
                  </p>
                )}
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 rounded-lg border text-[#666] dark:text-[#aaa] hover:bg-gray-100 dark:hover:bg-[#252733] border-[#ded5c5] dark:border-[#333543]"
                  title="編輯命例"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDeleteCase(item.id, item.name)}
                  className="p-1.5 rounded-lg border text-[#b83426] hover:bg-red-50 dark:hover:bg-[#331818] border-[#ebd4d2] dark:border-[#4d2424]"
                  title="刪除命例"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    onLoadCase(item);
                    onClose();
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs shadow-xs transition
                    bg-[#2a5d7c] text-white hover:bg-[#224b64]"
                >
                  <span>載入排盤</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}

          {filteredCases.length === 0 && (
            <div className="text-center py-20 px-4 rounded-2xl border border-dashed border-[#d8d0be] dark:border-[#333544] bg-white/40 dark:bg-[#161720]/40 space-y-3">
              <FolderOpen className="w-10 h-10 text-[#8d271c]/50 dark:text-[#df756b]/50 mx-auto" />
              <div className="font-bold text-sm text-[#444] dark:text-[#ccc]">
                {searchQuery ? '沒有找到符合搜尋條件的命例' : '命例資料庫目前無任何命例'}
              </div>
              <p className="text-xs text-[#888] max-w-sm mx-auto">
                資料庫乾淨純淨，無任何預設個案。您可隨時點擊下方或上方「新增命例」手動建立，或使用「匯入」載入歷史備份。
              </p>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#8d271c] text-white hover:bg-[#782017] transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>立即建立第一筆命例</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t flex justify-between items-center text-xs text-[#777]
          bg-[#f6f2e8] dark:bg-[#1c1e27] border-[#e2d9c8] dark:border-[#2b2d3b]">
          <span>命例皆存於本機瀏覽器中，永久有效。</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[#cfc6b4] dark:border-[#3a3d4c] text-[#555] dark:text-[#bbb] hover:bg-gray-100 dark:hover:bg-[#252733]"
          >
            關閉
          </button>
        </div>

      </div>

      {/* Nested Add / Edit Case Form Dialog */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in font-serif">
          <div className="w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden
            bg-[#fcfbf7] dark:bg-[#181922] border-[#d8d0be] dark:border-[#31333f] text-[#222]">
            
            <div className="px-5 py-3.5 border-b flex items-center justify-between
              bg-[#f6f2e8] dark:bg-[#1e2029] border-[#e2dacb] dark:border-[#2d303c]">
              <h3 className="font-bold text-sm text-[#2b2723] dark:text-[#f4f1ec]">
                {editingId ? '編輯命例' : '新增儲存命例'}
              </h3>
              <button onClick={() => setIsEditorOpen(false)} className="text-gray-400 hover:text-black dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSaveForm}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              className="p-5 space-y-4 text-xs"
            >
              
              {/* Name & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#666] dark:text-[#aaa] mb-1 font-bold">姓名 / 命盤標記</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-lg border bg-white dark:bg-[#121318] border-[#d4cbba] dark:border-[#383a48] text-[#222] dark:text-[#eee]"
                  />
                </div>
                <div>
                  <label className="block text-[#666] dark:text-[#aaa] mb-1 font-bold">性別</label>
                  <div className="grid grid-cols-2 gap-1.5 h-[33px]">
                    <button
                      type="button"
                      onClick={() => setFormGender('男')}
                      className={`rounded-lg border font-bold transition
                        ${formGender === '男' ? 'bg-[#2a5d7c] text-white' : 'bg-white dark:bg-[#121318] text-[#555]'}`}
                    >
                      男
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormGender('女')}
                      className={`rounded-lg border font-bold transition
                        ${formGender === '女' ? 'bg-[#a3375c] text-white' : 'bg-white dark:bg-[#121318] text-[#555]'}`}
                    >
                      女
                    </button>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[#666] dark:text-[#aaa] mb-1 font-bold">命例分類標籤</label>
                <div className="flex flex-wrap gap-1.5">
                  {['自訂', '客戶', '親友', '命理研究', '經典命例', '典範案例'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormCategory(cat)}
                      className={`px-2.5 py-0.5 rounded-full border text-[11px] transition
                        ${formCategory === cat ? 'bg-[#8d271c] text-white border-[#701e15]' : 'bg-white dark:bg-[#121318] text-[#555]'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calendar & Leap */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={formCalendar === 'solar'}
                    onChange={() => setFormCalendar('solar')}
                    className="accent-[#8d271c]"
                  />
                  國曆 (陽曆)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={formCalendar === 'lunar'}
                    onChange={() => setFormCalendar('lunar')}
                    className="accent-[#8d271c]"
                  />
                  農曆 (陰曆)
                </label>
                {formCalendar === 'lunar' && (
                  <label className="flex items-center gap-1 cursor-pointer text-[#8d271c] font-bold">
                    <input
                      type="checkbox"
                      checked={formIsLeapMonth}
                      onChange={e => setFormIsLeapMonth(e.target.checked)}
                      className="accent-[#8d271c]"
                    />
                    閏月
                  </label>
                )}
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[#888] mb-0.5">年</label>
                  <input
                    type="number"
                    min="1900"
                    max="2100"
                    value={formYear}
                    onChange={e => setFormYear(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border bg-white dark:bg-[#121318] border-[#d4cbba] dark:border-[#383a48] text-center"
                  />
                </div>
                <div>
                  <label className="block text-[#888] mb-0.5">月</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formMonth}
                    onChange={e => setFormMonth(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border bg-white dark:bg-[#121318] border-[#d4cbba] dark:border-[#383a48] text-center"
                  />
                </div>
                <div>
                  <label className="block text-[#888] mb-0.5">日</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formDay}
                    onChange={e => setFormDay(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border bg-white dark:bg-[#121318] border-[#d4cbba] dark:border-[#383a48] text-center"
                  />
                </div>
              </div>

              {/* Chinese Hour selection buttons */}
              <div>
                <label className="block text-[#666] dark:text-[#aaa] mb-1 font-bold">
                  出生時辰
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {CHINESE_HOURS.map(ch => (
                    <button
                      key={ch.name}
                      type="button"
                      onClick={() => {
                        setFormHour(ch.hour);
                        setFormMinute(ch.minute);
                      }}
                      className="p-1 rounded text-center border text-[11px] transition
                        bg-white dark:bg-[#121318] hover:bg-[#ede5d4] border-[#ded5c5] dark:border-[#353746]"
                    >
                      {ch.name.substring(0, 2)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exact Hour / Minute */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#888] mb-0.5">小時 (0-23)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={formHour}
                    onChange={e => {
                      const v = e.target.value;
                      if (v === '') setFormHour('' as any);
                      else {
                        const n = parseInt(v, 10);
                        if (!isNaN(n)) setFormHour(Math.max(0, Math.min(23, n)));
                      }
                    }}
                    onBlur={() => {
                      if (formHour === '' || isNaN(Number(formHour))) setFormHour(0);
                    }}
                    className="w-full px-2 py-1.5 rounded-lg border bg-white dark:bg-[#121318] border-[#d4cbba] dark:border-[#383a48] text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#888] mb-0.5">分鐘 (0-59)</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={formMinute}
                    onChange={e => {
                      const v = e.target.value;
                      if (v === '') setFormMinute('' as any);
                      else {
                        const n = parseInt(v, 10);
                        if (!isNaN(n)) setFormMinute(Math.max(0, Math.min(59, n)));
                      }
                    }}
                    onBlur={() => {
                      if (formMinute === '' || isNaN(Number(formMinute))) setFormMinute(0);
                    }}
                    className="w-full px-2 py-1.5 rounded-lg border bg-white dark:bg-[#121318] border-[#d4cbba] dark:border-[#383a48] text-center font-mono"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[#666] dark:text-[#aaa] mb-1 font-bold">命局備註 / 背景摘要</label>
                <textarea
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="可記錄職業、格局特色、大事件年份或諮詢問題..."
                  rows={2}
                  className="w-full px-3 py-1.5 rounded-lg border bg-white dark:bg-[#121318] border-[#d4cbba] dark:border-[#383a48] text-[#222] dark:text-[#eee] outline-none"
                />
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-[#e2dacb] dark:border-[#2d303c]">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-1.5 rounded-lg border border-[#cfc6b4] text-[#666]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg font-bold bg-[#8d271c] text-white hover:bg-[#782017]"
                >
                  <Check className="w-3.5 h-3.5 inline mr-1" />
                  確定儲存
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
