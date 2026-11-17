import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import {
  setSearchQuery,
  setAssetClassFilter,
  setRiskFilter,
  toggleOnlyHoldings,
  setSort,
  resetFilters,
} from '../store/marketSlice';
import type { AssetClass, RiskLevel, MarketAsset, FilterState } from '../types/market';
import { Search, Filter, ArrowUpDown, X, CheckSquare, Square } from 'lucide-react';
import { useRenderTracker } from '../utils/useRenderTracker';

const ASSET_CLASSES: Array<AssetClass | 'All'> = [
  'All',
  'Equities',
  'Crypto',
  'Commodities',
  'Fixed Income',
  'Forex',
];

const RISK_LEVELS: Array<RiskLevel | 'All'> = ['All', 'Low', 'Moderate', 'High', 'Speculative'];

const SORT_OPTIONS: Array<{ label: string; field: keyof MarketAsset }> = [
  { label: 'Holding Value', field: 'holdingValue' },
  { label: 'Price', field: 'price' },
  { label: '24h Change', field: 'change24h' },
  { label: '24h Volume', field: 'volume24h' },
  { label: 'Ticker Symbol', field: 'ticker' },
  { label: 'Asset Name', field: 'name' },
];

export const FilterToolbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.market.filters);
  const sort = useAppSelector((state) => state.market.sort);
  const mode = useAppSelector((state) => state.profiler.mode);
  const highlightRenders = useAppSelector((state) => state.profiler.highlightRenders);

  const { renderCount, flashClass, flashKey } = useRenderTracker(
    'FilterToolbar',
    mode === 'optimized'
  );

  return (
    <div
      key={highlightRenders ? flashKey : 0}
      className={`relative bg-slate-900/80 rounded-2xl border border-slate-800 p-4 shadow-xl transition-all ${
        highlightRenders ? flashClass : ''
      }`}
    >
      {/* Component Render Indicator Badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-800/90 text-slate-300 border border-slate-700/60">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            mode === 'optimized' ? 'bg-emerald-400' : 'bg-rose-400 animate-ping'
          }`}
        />
        <span>Renders: {renderCount}</span>
      </div>

      <div className="flex flex-col gap-3">
        {/* Top Row: Search & Asset Class Tabs */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pr-24">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              placeholder="Search ticker, name, or sector..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
            {filters.searchQuery && (
              <button
                onClick={() => dispatch(setSearchQuery(''))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Asset Class Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {ASSET_CLASSES.map((ac) => (
              <button
                key={ac}
                onClick={() => dispatch(setAssetClassFilter(ac))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  filters.assetClass === ac
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'bg-slate-950/70 text-slate-400 border border-slate-800/80 hover:text-slate-200'
                }`}
              >
                {ac}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Row: Risk Dropdown, Holdings Toggle, Sort Config, Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
          <div className="flex flex-wrap items-center gap-3">
            {/* Risk Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Risk:</span>
              <select
                value={filters.riskLevel}
                onChange={(e) =>
                  dispatch(setRiskFilter(e.target.value as FilterState['riskLevel']))
                }
                className="bg-slate-950 border border-slate-800 text-xs text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500"
              >
                {RISK_LEVELS.map((rl) => (
                  <option key={rl} value={rl}>
                    {rl}
                  </option>
                ))}
              </select>
            </div>

            {/* Holdings Only Checkbox */}
            <button
              onClick={() => dispatch(toggleOnlyHoldings())}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                filters.onlyHoldings
                  ? 'bg-blue-950/70 text-blue-300 border-blue-700/60'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {filters.onlyHoldings ? (
                <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>Holdings Only</span>
            </button>

            {/* Sort Field & Direction */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort:</span>
              <select
                value={sort.field}
                onChange={(e) =>
                  dispatch(
                    setSort({
                      ...sort,
                      field: e.target.value as keyof MarketAsset,
                    })
                  )
                }
                className="bg-slate-950 border border-slate-800 text-xs text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.field} value={opt.field}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() =>
                  dispatch(
                    setSort({
                      ...sort,
                      direction: sort.direction === 'asc' ? 'desc' : 'asc',
                    })
                  )
                }
                className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-slate-300 hover:text-white"
                title="Toggle sort direction"
              >
                {sort.direction.toUpperCase()}
              </button>
            </div>
          </div>

          {/* Reset Filters */}
          <button
            onClick={() => dispatch(resetFilters())}
            className="text-xs text-slate-400 hover:text-white underline underline-offset-4 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};
