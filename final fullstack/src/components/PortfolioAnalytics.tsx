import React from 'react';
import { useAdaptiveSectorAllocation, useAdaptiveRiskDistribution } from '../store/selectors/useAdaptiveSelectors';
import { useRenderTracker } from '../utils/useRenderTracker';
import { useAppSelector } from '../store/store';
import { PieChart, Shield, Info } from 'lucide-react';

export const PortfolioAnalytics: React.FC = () => {
  const mode = useAppSelector((state) => state.profiler.mode);
  const highlightRenders = useAppSelector((state) => state.profiler.highlightRenders);
  const sectors = useAdaptiveSectorAllocation();
  const risks = useAdaptiveRiskDistribution();
  const { renderCount, flashClass, flashKey } = useRenderTracker(
    'PortfolioAnalytics',
    mode === 'optimized'
  );

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Allocation */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-200">
                Sector Allocation Breakdown
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              selectSectorAllocation
            </span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex mb-3 border border-slate-800">
            {sectors.map((sec) => (
              <div
                key={sec.sector}
                style={{
                  width: `${sec.percentage}%`,
                  backgroundColor: sec.color,
                }}
                className="h-full transition-all duration-300 hover:opacity-90"
                title={`${sec.sector}: ${sec.percentage}% ($${sec.value.toLocaleString()})`}
              />
            ))}
          </div>

          {/* Sector Legend Chips */}
          <div className="flex flex-wrap gap-2">
            {sectors.slice(0, 6).map((sec) => (
              <div
                key={sec.sector}
                className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800/80 px-2.5 py-1 rounded-lg text-xs"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: sec.color }}
                />
                <span className="text-slate-300 text-[11px] font-medium truncate max-w-[120px]">
                  {sec.sector}
                </span>
                <span className="font-mono text-[11px] font-bold text-white ml-1">
                  {sec.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Distribution Profile */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-200">
                Capital Exposure by Risk Tier
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              selectRiskDistribution
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {risks.map((r) => (
              <div
                key={r.level}
                className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-[11px] font-bold tracking-wide uppercase"
                    style={{ color: r.color }}
                  >
                    {r.level}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {r.count} assets
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${r.percentage}%`, backgroundColor: r.color }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">${r.value >= 1000000 ? `${(r.value / 1000000).toFixed(1)}M` : `$${Math.round(r.value).toLocaleString()}`}</span>
                  <span className="font-bold text-white">{r.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-2 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>
          <strong>Why this matters:</strong> Both charts derive from the sorted assets list. In <em>Optimized Mode</em>, they reuse intermediate memoized arrays, computing 0ms when unrelated actions dispatch.
        </span>
      </div>
    </div>
  );
};
