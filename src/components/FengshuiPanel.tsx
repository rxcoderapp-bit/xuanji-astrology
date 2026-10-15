import React, { useState, useMemo } from 'react';
import { 
  Compass, Home, ShieldAlert, Sparkles, 
  AlertTriangle, CheckCircle2, DollarSign,
  Briefcase
} from 'lucide-react';
import type { PalaceData } from '../types';
import { analyzeHomeFengshui } from '../lib/fengshuiEngine';

interface FengshuiPanelProps {
  palaces: PalaceData[];
  onSelectPalace?: (index: number) => void;
}

export const FengshuiPanel: React.FC<FengshuiPanelProps> = ({
  palaces,
  onSelectPalace
}) => {
  const fengshuiResult = useMemo(() => {
    return analyzeHomeFengshui(palaces);
  }, [palaces]);

  const {
    sectors,
    wealthSanctuarySector,
    cashflowSector,
    careerVigorSector,
    criticalWarningSectors,
    overallFengshuiSummary
  } = fengshuiResult;

  const [activeSectorGua, setActiveSectorGua] = useState<string>(
    wealthSanctuarySector.guaName
  );

  const activeSector = useMemo(() => {
    return sectors.find(s => s.guaName === activeSectorGua) || sectors[0];
  }, [sectors, activeSectorGua]);

  return (
    <div className="space-y-6 animate-fade-in text-xs sm:text-sm">
      
      {/* 1. Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border bg-gradient-to-br from-[#faf6ed] to-[#f2e9d7] dark:from-[#1b1c26] dark:to-[#14151e] border-[#ded4c0] dark:border-[#2d3042] space-y-3 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#8d271c] text-white">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#2b2723] dark:text-[#f2efe9]">
                紫微陽宅居家風水羅盤
              </h3>
              <p className="text-[11px] text-[#706456] dark:text-[#a09a8f]">
                原典依據：《陽宅宮位八卦通考》· 十二宮垣 ✕ 後天八卦住宅方位立體磁場調理
              </p>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#8d271c]/10 text-[#8d271c] dark:text-[#ef5350]">
            空間能量科學
          </span>
        </div>

        <p className="text-xs leading-relaxed text-[#554e44] dark:text-[#b4aea4] border-t pt-2.5 border-[#e8ded0] dark:border-[#252838]">
          {overallFengshuiSummary}
        </p>
      </div>

      {/* 2. 三大核心吉祥空間方位 (Top 3 Golden Sectors) */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs sm:text-sm text-[#333] dark:text-[#ddd] flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#e65100] dark:text-[#ff9800]" />
          <span>三大天賦命定空間方位 (重點佈局)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Wealth Sanctuary (田宅宮) */}
          <div 
            onClick={() => setActiveSectorGua(wealthSanctuarySector.guaName)}
            className="p-3.5 rounded-xl border bg-gradient-to-br from-[#faf7ef] to-[#f4eee0] dark:from-[#181923] dark:to-[#13141b] border-[#ded4c0] dark:border-[#2a2c3d] space-y-2 cursor-pointer hover:border-[#8d271c] transition"
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#b45309] dark:text-[#f59e0b]">
              <span className="flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                <span>田宅財庫聚氣位</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200">
                {wealthSanctuarySector.directionName}
              </span>
            </div>
            <div className="font-bold text-[#222] dark:text-[#eee]">
              {wealthSanctuarySector.palaceName} · {wealthSanctuarySector.majorStars.join('、') || '借星'}
            </div>
            <p className="text-[11px] text-[#666] dark:text-[#aaa] line-clamp-2">
              {wealthSanctuarySector.practicalHomeGuidance}
            </p>
          </div>

          {/* Cashflow (財帛宮) */}
          <div 
            onClick={() => setActiveSectorGua(cashflowSector.guaName)}
            className="p-3.5 rounded-xl border bg-gradient-to-br from-[#faf7ef] to-[#f4eee0] dark:from-[#181923] dark:to-[#13141b] border-[#ded4c0] dark:border-[#2a2c3d] space-y-2 cursor-pointer hover:border-[#8d271c] transition"
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#2e7d32] dark:text-[#81c784]">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                <span>現金流催旺位</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200">
                {cashflowSector.directionName}
              </span>
            </div>
            <div className="font-bold text-[#222] dark:text-[#eee]">
              {cashflowSector.palaceName} · {cashflowSector.majorStars.join('、') || '借星'}
            </div>
            <p className="text-[11px] text-[#666] dark:text-[#aaa] line-clamp-2">
              {cashflowSector.practicalHomeGuidance}
            </p>
          </div>

          {/* Career Vigor (官祿宮) */}
          <div 
            onClick={() => setActiveSectorGua(careerVigorSector.guaName)}
            className="p-3.5 rounded-xl border bg-gradient-to-br from-[#faf7ef] to-[#f4eee0] dark:from-[#181923] dark:to-[#13141b] border-[#ded4c0] dark:border-[#2a2c3d] space-y-2 cursor-pointer hover:border-[#8d271c] transition"
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#2a5d7c] dark:text-[#64b5f6]">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                <span>文昌事業利祿位</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-950/70 text-sky-900 dark:text-sky-200">
                {careerVigorSector.directionName}
              </span>
            </div>
            <div className="font-bold text-[#222] dark:text-[#eee]">
              {careerVigorSector.palaceName} · {careerVigorSector.majorStars.join('、') || '借星'}
            </div>
            <p className="text-[11px] text-[#666] dark:text-[#aaa] line-clamp-2">
              {careerVigorSector.practicalHomeGuidance}
            </p>
          </div>

        </div>
      </div>

      {/* 3. 煞忌警訊重點化解提示 (Warning Sectors) */}
      {criticalWarningSectors.length > 0 && (
        <div className="p-3.5 rounded-xl border bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 space-y-2 text-xs">
          <div className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>居家風水磁場警訊區 ({criticalWarningSectors.length} 處需重點化煞)</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-rose-950 dark:text-rose-200">
            {criticalWarningSectors.map((sec, idx) => (
              <div key={idx} className="flex items-start justify-between gap-2 p-1.5 rounded bg-white/60 dark:bg-[#1a1318]">
                <span>
                  【{sec.directionName}】({sec.palaceName}逢{sec.shaStars.join('、') || '煞忌'})：{sec.avoidances}
                </span>
                <button
                  onClick={() => setActiveSectorGua(sec.guaName)}
                  className="shrink-0 text-[#8d271c] dark:text-[#ef5350] underline font-bold"
                >
                  看化解法
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. 八卦方位八方互動羅盤 (Interactive 8-Direction Bagua Grid) */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs sm:text-sm text-[#333] dark:text-[#ddd] flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#8d271c]" />
            <span>八卦方位全息空間羅盤 (點擊切換方位檢視)</span>
          </h4>
          <span className="text-[10px] text-[#888]">
            當前選定：{activeSector.directionName}
          </span>
        </div>

        {/* 8 Directions Tabs */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {sectors.map(sec => {
            const isSelected = sec.guaName === activeSectorGua;
            return (
              <button
                key={sec.palaceIndex}
                onClick={() => setActiveSectorGua(sec.guaName)}
                className={`py-2 px-1 rounded-lg border text-center transition flex flex-col items-center justify-center cursor-pointer ${
                  isSelected
                    ? 'bg-[#8d271c] text-white border-[#751d14] shadow-xs'
                    : 'bg-white dark:bg-[#171822] border-[#ded5c3] dark:border-[#272938] text-[#555] dark:text-[#aaa] hover:border-[#8d271c]/50'
                }`}
              >
                <span className="font-bold text-xs">{sec.guaName}</span>
                <span className="text-[10px] opacity-85 scale-90">{sec.directionName.split(' ')[0]}</span>
                <span className="text-[9px] opacity-70 scale-75">{sec.palaceName.slice(0, 2)}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Sector Deep Inspection Card */}
        {activeSector && (
          <div className="p-4 sm:p-5 rounded-2xl border bg-white dark:bg-[#191a24] border-[#ded5c3] dark:border-[#2a2c3d] space-y-4 shadow-sm">
            
            <div className="flex items-center justify-between border-b pb-3 border-[#eee6d6] dark:border-[#272938]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#8d271c]/10 text-[#8d271c] dark:text-[#ef5350]">
                  {activeSector.directionName} · 五行屬{activeSector.element}
                </span>
                <h5 className="font-bold text-sm sm:text-base text-[#222] dark:text-[#eee]">
                  【{activeSector.palaceName}】({activeSector.earthlyBranch}位)
                </h5>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  activeSector.sectorStatus === 'optimal' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300' :
                  activeSector.sectorStatus === 'good' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300' :
                  activeSector.sectorStatus === 'caution' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300' :
                  'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                }`}>
                  {activeSector.statusLabel}
                </span>
                {onSelectPalace && (
                  <button
                    onClick={() => onSelectPalace(activeSector.palaceIndex)}
                    className="px-2 py-0.5 rounded border text-[10px] text-[#8d271c] dark:text-[#ef5350] border-[#8d271c]/30 hover:bg-[#8d271c]/5"
                  >
                    定位此宮
                  </button>
                )}
              </div>
            </div>

            {/* Stars & Energy Description */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-[#443e37] dark:text-[#cfc8bd] font-bold">
                <span>坐落星曜：</span>
                <span className="font-normal text-[#666] dark:text-[#bbb]">
                  {activeSector.majorStars.join('、') || '借對宮星曜'}
                  {activeSector.mutagens.length > 0 && ` (${activeSector.mutagens.join(' ')})`}
                  {activeSector.hasShaStars && ` · 煞星：${activeSector.shaStars.join('、')}`}
                </span>
              </div>
              <p className="text-[#555] dark:text-[#bbb] leading-relaxed">
                {activeSector.energyDescription}
              </p>
            </div>

            {/* Practical Home Guidance Box */}
            <div className="p-3.5 rounded-xl bg-[#fdf9f2] dark:bg-[#1a1b26] border border-[#e8dfcb] dark:border-[#2b2d3e] space-y-1.5 text-xs">
              <div className="font-bold text-[#2e7d32] dark:text-[#81c784] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>現代居家空間佈局與物理調理錦囊：</span>
              </div>
              <p className="text-[#443e35] dark:text-[#c7bfb1] leading-relaxed">
                {activeSector.practicalHomeGuidance}
              </p>
            </div>

            {/* Avoidances Alert Box */}
            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-1 text-xs text-amber-900 dark:text-amber-200">
              <div className="font-bold flex items-center gap-1 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>空間磁場禁忌警示：</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {activeSector.avoidances}
              </p>
            </div>

          </div>
        )}
      </div>

      {/* 4. 玄微秘傳中藥草本氣場安鎮全鑑 */}
      <div className="p-4 sm:p-5 rounded-2xl border bg-white dark:bg-[#191a24] border-[#ded5c3] dark:border-[#2a2c3d] space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b pb-2.5 border-[#eee6d6] dark:border-[#272938] flex-wrap gap-2">
          <div className="font-bold text-xs sm:text-sm text-[#333] dark:text-[#ddd] flex items-center gap-1.5">
            <span className="p-1 rounded bg-emerald-600 text-white text-[11px]">🌿</span>
            <span>形巒風水堪輿天機 · 外局形煞 ✕ 中藥草本氣場安鎮全鑑</span>
          </div>
          <span className="text-[10px] text-[#706456] dark:text-[#a09a8f]">
            中藥性味歸經 · 氣場能量物理防護
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          {fengshuiResult.exteriorShaRemedies?.map((sha) => (
            <div
              key={sha.id}
              className="p-3.5 rounded-xl border bg-[#fbf9f4] dark:bg-[#161722] border-[#e5dcce] dark:border-[#2c2e3f] space-y-2 shadow-2xs"
            >
              <div className="flex items-center justify-between font-bold text-rose-800 dark:text-rose-400">
                <span className="text-xs sm:text-sm">{sha.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300">
                  外局重煞
                </span>
              </div>

              <p className="text-[11px] text-[#555] dark:text-[#aaa] leading-relaxed">
                <span className="font-bold text-[#443e37] dark:text-[#cfc8bd]">形貌危害：</span>
                {sha.shapeDescription} {sha.harmAndRisk}
              </p>

              <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 space-y-1">
                <div className="font-bold text-[#2e7d32] dark:text-[#81c784] text-[11px] flex items-center gap-1">
                  <span>💊 獨門中藥化煞藥方：</span>
                </div>
                <div className="font-mono text-emerald-900 dark:text-emerald-200 text-[11px] font-bold">
                  {sha.herbalFormula}
                </div>
                <p className="text-[10px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  <span className="font-bold">藥理原理：</span>{sha.herbalPharmacology}
                </p>
              </div>

              <div className="text-[10px] text-[#666] dark:text-[#999] leading-relaxed pt-0.5">
                <span className="font-bold text-[#444] dark:text-[#ccc]">佈設指南：</span>{sha.deploymentMethod}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. 八宅九宮缺角與家庭成員臟腑病變對照表 */}
      <div className="p-4 sm:p-5 rounded-2xl border bg-white dark:bg-[#191a24] border-[#ded5c3] dark:border-[#2a2c3d] space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b pb-2.5 border-[#eee6d6] dark:border-[#272938] flex-wrap gap-2">
          <div className="font-bold text-xs sm:text-sm text-[#333] dark:text-[#ddd] flex items-center gap-1.5">
            <span className="p-1 rounded bg-indigo-600 text-white text-[11px]">📐</span>
            <span>八宅九宮缺角診斷 · 家庭成員 ✕ 臟腑病變 ✕ 草本安鎮</span>
          </div>
          <span className="text-[10px] text-[#706456] dark:text-[#a09a8f]">
            住宅方正為吉 · 缺角氣場物理補缺
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e2d8c5] dark:border-[#2d3042] bg-[#f7f3e8] dark:bg-[#1c1d29] text-[#443e37] dark:text-[#cfc8bd]">
                <th className="p-2 font-bold whitespace-nowrap">方位卦位</th>
                <th className="p-2 font-bold whitespace-nowrap">受損家庭成員</th>
                <th className="p-2 font-bold whitespace-nowrap">易發臟腑病變</th>
                <th className="p-2 font-bold">草本與氣場補缺方藥</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ebd9] dark:divide-[#242636]">
              {fengshuiResult.ninePalaceMissingGuas?.map((item) => (
                <tr key={item.gua} className="hover:bg-[#faf7f0] dark:hover:bg-[#1e202d] transition">
                  <td className="p-2 font-bold text-[#8d271c] dark:text-[#ef5350] whitespace-nowrap">
                    {item.gua} ({item.direction})
                  </td>
                  <td className="p-2 font-bold text-[#333] dark:text-[#eee] whitespace-nowrap">
                    {item.memberAffected}
                  </td>
                  <td className="p-2 text-[#555] dark:text-[#aaa]">
                    <span className="font-bold text-rose-700 dark:text-rose-400">{item.organsVulnerable}</span>
                    <div className="text-[10px] text-[#777] dark:text-[#888]">{item.diseaseSymptoms}</div>
                  </td>
                  <td className="p-2 text-[11px] text-[#443e37] dark:text-[#cfc8bd]">
                    {item.remedyHerbAndCrystal}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
