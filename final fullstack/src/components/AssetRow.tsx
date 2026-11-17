import React from 'react';
import type { MarketAsset } from '../types/market';
import { useRenderTracker } from '../utils/useRenderTracker';
import { useAppDispatch, useAppSelector } from '../store/store';
import { selectAsset } from '../store/marketSlice';
import { TrendingUp, TrendingDown, Eye } from 'lucide-react';

interface AssetRowProps {
  asset: MarketAsset;
}

export const AssetRow: React.FC<AssetRowProps> = React.memo(({ asset }) => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.profiler.mode);
  const highlightRenders = useAppSelector((state) => state.profiler.highlightRenders);
  const selectedAssetId = useAppSelector((state) => state.market.selectedAssetId);
  const isSelected = selectedAssetId === asset.id;

  const { renderCount, flashClass, flashKey } = useRenderTracker(
    `Row-${asset.ticker}`,
    mode === 'optimized'
  );

  // Sparkline mini SVG path
  const minVal = Math.min(...asset.sparkline);
  const maxVal = Math.max(...asset.sparkline);
  const range = maxVal - minVal || 1;
  const points = asset.sparkline
    .map((val, idx) => {
      const x = (idx / (asset.sparkline.length - 1)) * 60;
      const y = 20 - ((val - minVal) / range) * 16;
      return `${x},${y}`;
    })
    .join(' ');

  const isPositive = asset.change24h >= 0;

  return (
    <tr
      key={highlightRenders ? flashKey : 0}
      onClick={() => dispatch(selectAsset(asset.id))}
      className={`group cursor-pointer transition-colors border-b border-slate-800/60 text-xs ${
        isSelected
          ? 'bg-cyan-950/40 hover:bg-cyan-950/60'
          : 'hover:bg-slate-800/40 bg-slate-950/20'
      } ${highlightRenders ? flashClass : ''}`}
    >
      {/* Ticker & Name */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold font-mono text-cyan-400 group-hover:border-cyan-500/50 transition-colors">
            {asset.ticker.slice(0, 3)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white font-mono">{asset.ticker}</span>
              <span className="text-[10px] text-slate-500 px-1 py-0.2 bg-slate-900 rounded border border-slate-800">
                {asset.assetClass}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
              {asset.name}
            </div>
          </div>
        </div>
      </td>

      {/* Price & Sparkline */}
      <td className="py-3 px-4 font-mono font-medium">
        <div className="text-slate-100 font-bold">${asset.price.toLocaleString()}</div>
        <div className="text-[10px] text-slate-500">{asset.sector}</div>
      </td>

      {/* 24h Change */}
      <td className="py-3 px-4 font-mono">
        <div
          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded font-bold ${
            isPositive
              ? 'text-emerald-400 bg-emerald-950/50 border border-emerald-800/50'
              : 'text-rose-400 bg-rose-950/50 border border-rose-800/50'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{isPositive ? '+' : ''}{asset.change24h}%</span>
        </div>
      </td>

      {/* Mini Trend Sparkline */}
      <td className="py-3 px-4 hidden md:table-cell">
        <svg className="w-[60px] h-[22px] overflow-visible">
          <polyline
            fill="none"
            stroke={isPositive ? '#34d399' : '#f87171'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
      </td>

      {/* Holdings */}
      <td className="py-3 px-4 font-mono">
        {asset.holdingQuantity > 0 ? (
          <div>
            <div className="text-white font-bold">
              ${asset.holdingValue.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400">
              {asset.holdingQuantity} units
            </div>
          </div>
        ) : (
          <span className="text-slate-600 font-mono">—</span>
        )}
      </td>

      {/* Risk Level */}
      <td className="py-3 px-4 hidden sm:table-cell">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
            asset.riskLevel === 'Low'
              ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
              : asset.riskLevel === 'Moderate'
              ? 'text-blue-400 bg-blue-950/40 border border-blue-800/40'
              : asset.riskLevel === 'High'
              ? 'text-amber-400 bg-amber-950/40 border border-amber-800/40'
              : 'text-rose-400 bg-rose-950/40 border border-rose-800/40'
          }`}
        >
          {asset.riskLevel}
        </span>
      </td>

      {/* Render Counter Badge */}
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            r:{renderCount}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch(selectAsset(asset.id));
            }}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-400"
            title="Inspect Parametric Selector"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
});

AssetRow.displayName = 'AssetRow';
