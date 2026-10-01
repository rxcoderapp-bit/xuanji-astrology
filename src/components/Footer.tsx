import React, { useState } from 'react';
import { 
  ShieldCheck, Cloud, Compass, 
  ArrowUp, CheckCircle2, Info, BookOpen, Layers
} from 'lucide-react';

interface FooterProps {
  onOpenKnowledgeBase?: () => void;
  onOpenDatabase?: () => void;
  onOpenDivination?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenKnowledgeBase,
  onOpenDatabase,
  onOpenDivination
}) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full mt-12 border-t font-serif transition-colors duration-200
      bg-[#f0ece1]/90 dark:bg-[#0c0d12]/95 border-[#dfd7c5] dark:border-[#222430] text-[#3c3732] dark:text-[#c5c1b8]">
      
      {/* 頂部裝飾金線 */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#8d271c] dark:via-[#c0392b] to-transparent opacity-60" />

      <div className="max-w-[1600px] mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 左側：品牌理念與系統特色 (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md
                bg-gradient-to-br from-[#8d271c] to-[#59140c] text-[#f7f4ed]">
                <span className="font-serif font-black text-lg">樞</span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold tracking-wider text-[#1e1c1a] dark:text-[#f2efe9]">
                  天樞星象 · 紫微八字互動解盤系統
                </h3>
                <p className="text-xs text-[#7e7467] dark:text-[#8f8a80]">
                  正統術數傳承 ✕ 全息動態星盤 ✕ 雙軌五行合參
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-[#595247] dark:text-[#a6a094]">
              「天道無親，常與善人；格物致知，明心見性。」
              本系統融合明清紫微斗數古賦精義與三命通會、滴天髓子平八字調候，以現代全息演算法重現天地人三才玄機。
            </p>

            {/* 四大安全與正統承諾標籤 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="flex items-center gap-1.5 text-[#595247] dark:text-[#a6a094]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2e7d32] dark:text-[#4caf50] shrink-0" />
                <span>純本地運算 · 零洩漏</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#595247] dark:text-[#a6a094]">
                <Cloud className="w-3.5 h-3.5 text-[#1565c0] dark:text-[#42a5f5] shrink-0" />
                <span>Google 雲端自選備份</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#595247] dark:text-[#a6a094]">
                <Layers className="w-3.5 h-3.5 text-[#e65100] dark:text-[#ff9800] shrink-0" />
                <span>六重時空流運穿透</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#595247] dark:text-[#a6a094]">
                <BookOpen className="w-3.5 h-3.5 text-[#8d271c] dark:text-[#ef5350] shrink-0" />
                <span>440萬字古籍智庫</span>
              </div>
            </div>

            <div className="pt-1">
              <button 
                onClick={() => setShowPrivacyModal(true)}
                className="text-xs text-[#7e7467] dark:text-[#8f8a80] hover:text-[#8d271c] dark:hover:text-[#ef5350] inline-flex items-center gap-1.5 underline underline-offset-4 transition"
              >
                <Info className="w-3.5 h-3.5" />
                <span>檢視隱私保護原則與系統承諾</span>
              </button>
            </div>
          </div>

          {/* 右側：快速捷徑與回頂部 (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1e1c1a] dark:text-[#f2efe9]">
              術數常用導航
            </h4>
            
            <div className="space-y-1.5 text-xs">
              {onOpenKnowledgeBase && (
                <button
                  onClick={onOpenKnowledgeBase}
                  className="w-full text-left px-3 py-2 rounded-lg bg-[#fbf9f4]/60 dark:bg-[#13141a]/60 hover:bg-[#eae3d2] dark:hover:bg-[#1a1b24] border border-[#e2dac9]/60 dark:border-[#262835]/60 flex items-center justify-between transition text-[#4a443a] dark:text-[#b5b0a4]"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-[#8d271c] dark:text-[#ef5350]" />
                    <span>古籍智庫 (RAG 經典檢索與 AI Studio)</span>
                  </span>
                  <span className="text-[10px] opacity-60">440萬字</span>
                </button>
              )}

              {onOpenDivination && (
                <button
                  onClick={onOpenDivination}
                  className="w-full text-left px-3 py-2 rounded-lg bg-[#fbf9f4]/60 dark:bg-[#13141a]/60 hover:bg-[#eae3d2] dark:hover:bg-[#1a1b24] border border-[#e2dac9]/60 dark:border-[#262835]/60 flex items-center justify-between transition text-[#4a443a] dark:text-[#b5b0a4]"
                >
                  <span className="flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-[#8d271c] dark:text-[#ef5350]" />
                    <span>神卦問事 (一事一占 · 大衍筮法)</span>
                  </span>
                  <span className="text-[10px] opacity-60">六爻星卦</span>
                </button>
              )}

              {onOpenDatabase && (
                <button
                  onClick={onOpenDatabase}
                  className="w-full text-left px-3 py-2 rounded-lg bg-[#fbf9f4]/60 dark:bg-[#13141a]/60 hover:bg-[#eae3d2] dark:hover:bg-[#1a1b24] border border-[#e2dac9]/60 dark:border-[#262835]/60 flex items-center justify-between transition text-[#4a443a] dark:text-[#b5b0a4]"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#8d271c] dark:text-[#ef5350]" />
                    <span>命例檔案庫 (本機 / 雲端案例管理)</span>
                  </span>
                  <span className="text-[10px] opacity-60">永久保全</span>
                </button>
              )}
            </div>

            {/* 回到頂部按鈕 */}
            <div className="pt-1">
              <button
                onClick={scrollToTop}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-bold transition
                  bg-[#eae4d5] dark:bg-[#181922] hover:bg-[#dfd7c5] dark:hover:bg-[#20222e] border-[#d5ccb9] dark:border-[#2e3142] text-[#2c2823] dark:text-[#e2ded6]"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>返回命盤頂部</span>
              </button>
            </div>
          </div>

        </div>

        {/* 底部版權聲明與聲明線 */}
        <div className="mt-8 pt-6 border-t border-[#dfd7c5] dark:border-[#222430] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7e7467] dark:text-[#8f8a80]">
          <div>
            <span>© 2026 天樞星象 · 遵循正統古典術數傳承 · 系統運轉正常</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>本機離線優先架構</span>
            </span>
            <span>純本地演算法 · 隱私安心守護</span>
          </div>
        </div>

      </div>

      {/* 隱私與系統承諾說明彈窗 */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl p-6 shadow-2xl border
            bg-[#fdfbf7] dark:bg-[#151720] border-[#d8cfbe] dark:border-[#2e3142] text-[#2c2823] dark:text-[#e5e2da]">
            <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-[#8d271c] dark:text-[#ef5350]">
              <ShieldCheck className="w-5 h-5" />
              <span>天樞星象 · 隱私保護與運作原則</span>
            </h3>
            <div className="text-xs leading-relaxed space-y-2.5 text-[#5a5246] dark:text-[#a7a195]">
              <p>
                1. <strong>隱私零妥協</strong>：您的生辰八字、姓名、命盤資料與所有自訂筆記，均於您的設備本地進行演算法推算，絕不上傳任何伺服器。
              </p>
              <p>
                2. <strong>純淨無擾</strong>：本系統為純粹的學術研習與命理探索工具，不設任何訪客追蹤、廣告統計或個人行為紀錄，保護您寧靜專注的研習空間。
              </p>
              <p>
                3. <strong>跨端同步</strong>：若啟用 Google 雲端同步，資料將由 Google Firebase 進行端到端傳輸加密保存，僅供您本人已登入之 Google 帳戶存取。
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#e2dac9] dark:border-[#2a2c3a] flex items-center justify-end">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[#8d271c] text-white font-bold text-xs hover:bg-[#721f16] transition"
              >
                明瞭並關閉
              </button>
            </div>
          </div>
        </div>
      )}

    </footer>
  );
};
