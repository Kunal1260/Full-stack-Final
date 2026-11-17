import React, { useState } from 'react';
import { useAdaptiveSortedAssets } from '../store/selectors/useAdaptiveSelectors';
import { useRenderTracker } from '../utils/useRenderTracker';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setSort } from '../store/marketSlice';
import { AssetRow } from './AssetRow';
import type { MarketAsset } from '../types/market';
import { ChevronLeft, ChevronRight, Database, ArrowDown, ArrowUp } from 'lucide-react';

export const AssetGrid: React.FC = () => {
  const dispatch = useAppDispatch();
  const sortedAssets = useAdaptiveSortedAssets();
  const sort = useAppSelector((state) => state.market.sort);
  const mode = useAppSelector((state) => state.profiler.mode);
  const highlightRenders = useAppSelector((state) => state.profiler.highlightRenders);

  const { renderCount, flashClass, flashKey } = useRenderTracker(
    'AssetGrid',
    mode === 'optimized'
  );

  // Pagination for smooth table navigation across thousands of items
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const totalPages = Math.ceil(sortedAssets.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleAssets = sortedAssets.slice(startIndex, startIndex + pageSize);

  const handleHeaderSort = (field: keyof MarketAsset) => {
    if (sort.field === field) {
      dispatch(
        setSort({
          field,
          direction: sort.direction === 'asc' ? 'desc' : 'asc',
        })
      );
    } else {
      dispatch(setSort({ field, direction: 'desc' }));
    }
  };

  const renderSortIndicator = (field: keyof MarketAsset) => {
    if (sort.field !== field) return null;
    return sort.direction === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-cyan-400 inline ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 text-cyan-400 inline ml-1" />
    );
  };

  return (
    <div
      key={highlightRenders ? flashKey : 0}
      className={`relative bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl overflow-hidden transition-all ${
        highlightRenders ? flashClass : ''
      }`}
    >
      {/* Header and Telemetry Tag */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-200">
            Market Holdings Ledger
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            ({sortedAssets.length} matching / selectSortedAssets)
          </span>
        </div>

        {/* Component Render Indicator Badge */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-800/90 text-slate-300 border border-slate-700/60">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              mode === 'optimized' ? 'bg-emerald-400' : 'bg-rose-400 animate-ping'
            }`}
          />
          <span>Grid Renders: {renderCount}</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th
                onClick={() => handleHeaderSort('ticker')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                Asset / Ticker {renderSortIndicator('ticker')}
              </th>
              <th
                onClick={() => handleHeaderSort('price')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                Spot Price {renderSortIndicator('price')}
              </th>
              <th
                onClick={() => handleHeaderSort('change24h')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                24h Trend {renderSortIndicator('change24h')}
              </th>
              <th className="py-3 px-4 hidden md:table-cell">
                7D Sparkline
              </th>
              <th
                onClick={() => handleHeaderSort('holdingValue')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                Holdings {renderSortIndicator('holdingValue')}
              </th>
              <th
                onClick={() => handleHeaderSort('riskLevel')}
                className="py-3 px-4 hidden sm:table-cell cursor-pointer hover:text-white transition-colors"
              >
                Risk Tier {renderSortIndicator('riskLevel')}
              </th>
              <th className="py-3 px-4 text-right">
                Profile
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleAssets.length > 0 ? (
              visibleAssets.map((asset) => (
                <AssetRow key={asset.id} asset={asset} />
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500 text-xs">
                  No assets match the current filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing <span className="font-mono text-white font-bold">{startIndex + 1}</span> to{' '}
          <span className="font-mono text-white font-bold">
            {Math.min(startIndex + pageSize, sortedAssets.length)}
          </span>{' '}
          of <span className="font-mono text-white font-bold">{sortedAssets.length}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
