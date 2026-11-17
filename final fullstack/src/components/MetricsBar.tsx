import React from 'react';
import { useAdaptivePortfolioKPIs } from '../store/selectors/useAdaptiveSelectors';
import { useRenderTracker } from '../utils/useRenderTracker';
import { useAppSelector } from '../store/store';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Percent,
  Award,
  Flame,
} from 'lucide-react';

export const MetricsBar: React.FC = () => {
  const mode = useAppSelector((state) => state.profiler.mode);
  const highlightRenders = useAppSelector((state) => state.profiler.highlightRenders);
  const kpis = useAdaptivePortfolioKPIs();
  const { renderCount, flashClass, flashKey } = useRenderTracker('MetricsBar', mode === 'optimized');

  return (
    <div
      key={highlightRenders ? flashKey : 0}
      className={`relative bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl transition-all ${
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

      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
          Portfolio Overview & Risk Analytics
        </h2>
        <span className="text-xs text-slate-500 font-mono">
          [derived via selectPortfolioKPIs]
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total AUM */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Total AUM</span>
            <Wallet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono tracking-tight">
            ${kpis.totalAUM.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {kpis.holdingCount} Active Positions
          </div>
        </div>

        {/* Unrealized P&L */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Unrealized P&L</span>
            {kpis.totalUnrealizedPnL >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div
            className={`text-lg font-bold font-mono tracking-tight ${
              kpis.totalUnrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {kpis.totalUnrealizedPnL >= 0 ? '+' : ''}${kpis.totalUnrealizedPnL.toLocaleString()}
          </div>
          <div
            className={`text-[11px] font-mono mt-0.5 ${
              kpis.totalPnLPercentage >= 0 ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {kpis.totalPnLPercentage >= 0 ? '+' : ''}{kpis.totalPnLPercentage}% all-time
          </div>
        </div>

        {/* Weighted 24h Return */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Weighted 24h</span>
            <Percent className="w-4 h-4 text-indigo-400" />
          </div>
          <div
            className={`text-lg font-bold font-mono tracking-tight ${
              kpis.weightedDailyReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {kpis.weightedDailyReturn >= 0 ? '+' : ''}{kpis.weightedDailyReturn}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Capital-weighted rate</div>
        </div>

        {/* Value at Risk (VaR 95%) */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Value-at-Risk (95%)</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-300 font-mono tracking-tight">
            ${kpis.valueAtRisk95.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">1-day horizon risk</div>
        </div>

        {/* Sharpe Ratio */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Sharpe Ratio</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-purple-300 font-mono tracking-tight">
            {kpis.estimatedSharpeRatio}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Annualized risk-adjusted</div>
        </div>

        {/* Top Performer */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">24h Leader</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono tracking-tight">
            {kpis.topPerformer ? kpis.topPerformer.ticker : '—'}
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
            {kpis.topPerformer ? `+${kpis.topPerformer.change}%` : '—'}
          </div>
        </div>
      </div>
    </div>
  );
};
