import React from 'react';
import type { DualTrackEnergyData } from '../types';

interface DualTrackRadarProps {
  data?: DualTrackEnergyData;
  energy?: DualTrackEnergyData;
}

export const DualTrackRadar: React.FC<DualTrackRadarProps> = ({ data, energy }) => {
  const currentData = data || energy;
  if (!currentData) return null;
  const { elements, dayMaster, dayMasterElement, dayMasterStrength, favorableElements, unfavorableElements, patternName, climateDescription } = currentData;

  // 五行順序：木(頂), 火(右上), 土(右下), 金(左下), 水(左上)
  // 相對角度：-90° (頂), -18° (右上), 54° (右下), 126° (左下), 198° (左上)
  const vertices = [
    { key: 'wood', elem: '木', angle: -90, color: '#16a34a', darkColor: '#4ade80' },
    { key: 'fire', elem: '火', angle: -18, color: '#dc2626', darkColor: '#f87171' },
    { key: 'earth', elem: '土', angle: 54, color: '#d97706', darkColor: '#fbbf24' },
    { key: 'metal', elem: '金', angle: 126, color: '#475569', darkColor: '#94a3b8' },
    { key: 'water', elem: '水', angle: 198, color: '#2563eb', darkColor: '#60a5fa' }
  ] as const;

  const size = 200;
  const center = size / 2;
  const maxRadius = 70;

  // 計算座標輔助函式
  const getCoordinates = (angleDeg: number, radius: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad)
    };
  };

  // 能量點座標 (依百分比換算半徑，最低保留 15% 半徑視覺效果，上限 100%)
  const polygonPoints = vertices.map(v => {
    const pct = elements[v.key].percentage;
    const r = Math.max(12, Math.min(maxRadius, (pct / 50) * maxRadius));
    const pt = getCoordinates(v.angle, r);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  return (
    <div className="flex flex-col items-center justify-between w-full h-full font-serif text-[#222] dark:text-[#eee]">
      {/* 1. 頂部日主與格局標籤 */}
      <div className="w-full flex items-center justify-between text-[11px] sm:text-xs border-b border-[#e8dfcf] dark:border-[#272935] pb-1">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[#8d271c] dark:text-[#df756b]">
            日主【{dayMaster}{dayMasterElement}】
          </span>
          <span className="px-1.5 py-0.2 rounded border text-[10px] bg-[#f5ede4] dark:bg-[#231b1a] text-[#8d271c] dark:text-[#f87171] border-[#dfcdb8] dark:border-[#4d2822]">
            {dayMasterStrength}
          </span>
        </div>
        <span className="text-[10px] text-[#554e44] dark:text-[#b4aca0] truncate max-w-[130px]">
          {patternName}
        </span>
      </div>

      {/* 2. 核心 SVG 向量雷達圖 */}
      <div className="relative flex items-center justify-center my-1">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          {/* 同心五角形網格引導線 (20%, 40%, 60%, 80%, 100%) */}
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((step, idx) => {
            const gridPts = vertices.map(v => {
              const pt = getCoordinates(v.angle, maxRadius * step);
              return `${pt.x},${pt.y}`;
            }).join(' ');
            return (
              <polygon
                key={idx}
                points={gridPts}
                fill="none"
                stroke="currentColor"
                strokeWidth={idx === 4 ? "1.2" : "0.7"}
                className={idx === 4 ? "text-[#c2b69d] dark:text-[#424555]" : "text-[#e8dfcf] dark:text-[#272935]"}
                strokeDasharray={idx < 4 ? "2,2" : undefined}
              />
            );
          })}

          {/* 軸線 (五條徑向輻射線) */}
          {vertices.map(v => {
            const pt = getCoordinates(v.angle, maxRadius);
            return (
              <line
                key={v.key}
                x1={center}
                y1={center}
                x2={pt.x}
                y2={pt.y}
                stroke="currentColor"
                strokeWidth="0.8"
                className="text-[#d8cdb8] dark:text-[#323544]"
              />
            );
          })}

          {/* 實體能量多邊形 (柔和半透明填充與發光邊框) */}
          <polygon
            points={polygonPoints}
            fill="rgba(141, 39, 28, 0.22)"
            stroke="#8d271c"
            strokeWidth="2"
            className="dark:fill-[rgba(248,113,113,0.25)] dark:stroke-[#f87171] transition-all duration-500 ease-out"
          />

          {/* 五頂點微標籤 */}
          {vertices.map(v => {
            const labelPt = getCoordinates(v.angle, maxRadius + 14);
            const val = elements[v.key].percentage;
            return (
              <g key={v.key} transform={`translate(${labelPt.x}, ${labelPt.y})`}>
                <circle r="3" fill={v.color} className="dark:opacity-90" />
                <text
                  textAnchor="middle"
                  dy="3.5"
                  dx={v.angle === -90 ? 0 : v.angle > -90 && v.angle < 90 ? 12 : -12}
                  className="text-[9px] font-bold fill-[#333] dark:fill-[#eee]"
                >
                  {v.elem}{val}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 3. 喜忌用神與氣候調候調色盤 */}
      <div className="w-full bg-[#f8f5ee] dark:bg-[#1a1c24] border border-[#e8ded0] dark:border-[#2a2c38] rounded p-1.5 text-[10px] space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-[#15803d] dark:text-[#4ade80] font-bold">喜用神：</span>
            <span className="font-semibold">{favorableElements.join('、') || '生扶流通'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#b91c1c] dark:text-[#f87171] font-bold">忌仇神：</span>
            <span className="font-semibold text-[#666] dark:text-[#aaa]">{unfavorableElements.join('、') || '刑衝耗洩'}</span>
          </div>
        </div>
        <div className="text-[9px] text-[#70685c] dark:text-[#908a7e] truncate border-t border-[#ede4d4] dark:border-[#252733] pt-0.5">
          氣候調候：{climateDescription}
        </div>
      </div>
    </div>
  );
};
