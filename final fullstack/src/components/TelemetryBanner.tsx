import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../store/store';
import { selectorProfiler, type TelemetryRecord } from '../utils/selectorProfiler';
import { subscribeRenderCounts, getRenderCountsSnapshot } from '../utils/useRenderTracker';
import { ShieldCheck, AlertTriangle, Cpu, Gauge, Layers, Sparkles } from 'lucide-react';

export const TelemetryBanner: React.FC = () => {
  const mode = useAppSelector((state) => state.profiler.mode);
  const isStressTesting = useAppSelector((state) => state.profiler.isStressTesting);
  const heartbeatTick = useAppSelector((state) => state.market.heartbeatTick);

  const [telemetry, setTelemetry] = useState<Record<string, TelemetryRecord>>(
    selectorProfiler.getSnapshot()
  );
  const [renderCounts, setRenderCounts] = useState<Record<string, number>>(
    getRenderCountsSnapshot()
  );

  useEffect(() => {
    const unsubTelemetry = selectorProfiler.subscribe((records) => {
      setTelemetry(records);
    });
    const unsubRenders = subscribeRenderCounts(() => {
      setRenderCounts(getRenderCountsSnapshot());
    });

    return () => {
      unsubTelemetry();
      unsubRenders();
    };
  }, []);

  // Compute aggregate statistics
  let totalComputations = 0;
  let totalCacheHits = 0;
  let totalExecutionMs = 0;

  Object.values(telemetry).forEach((rec) => {
    totalComputations += rec.computationCount;
    totalCacheHits += rec.cacheHitCount;
    totalExecutionMs += rec.totalExecutionMs;
  });

  const totalSelectorCalls = totalComputations + totalCacheHits;
  const cacheHitRate =
    totalSelectorCalls > 0 ? ((totalCacheHits / totalSelectorCalls) * 100).toFixed(1) : '100.0';

  const totalComponentRenders = Object.values(renderCounts).reduce((a, b) => a + b, 0);

  // Estimate computation time saved by cache hits
  const avgDurationPerComp = totalComputations > 0 ? totalExecutionMs / totalComputations : 0.8;
  const estimatedTimeSavedMs = (totalCacheHits * avgDurationPerComp).toFixed(1);

  return (
    <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Mode Status Pill */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider ${
              mode === 'optimized'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-lg shadow-emerald-950/50'
                : 'bg-rose-950/80 text-rose-300 border border-rose-700/60 shadow-lg shadow-rose-950/50 animate-pulse'
            }`}
          >
            {mode === 'optimized' ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Memoized Access (Reselect Active)</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Unoptimized (Naive Derived Selectors)</span>
              </>
            )}
          </div>

          {isStressTesting && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-950/50 border border-amber-800/60 px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              Noise Stress Active ({heartbeatTick} ticks)
            </span>
          )}
        </div>

        {/* Telemetry Real-time HUD Metrics */}
        <div className="flex items-center flex-wrap gap-4 sm:gap-6 text-xs">
          {/* Cache Hit Rate */}
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Cache Hit Rate
              </div>
              <div className="flex items-center gap-1.5 font-mono font-bold">
                <span
                  className={
                    Number(cacheHitRate) >= 90
                      ? 'text-emerald-400 text-sm'
                      : Number(cacheHitRate) >= 50
                      ? 'text-amber-400 text-sm'
                      : 'text-rose-400 text-sm'
                  }
                >
                  {cacheHitRate}%
                </span>
                <span className="text-[11px] text-slate-500 font-normal">
                  ({totalCacheHits.toLocaleString()} hits)
                </span>
              </div>
            </div>
          </div>

          {/* Computations Saved */}
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Saved Executions
              </div>
              <div className="font-mono font-bold text-slate-200 text-sm">
                {totalCacheHits.toLocaleString()}
                <span className="text-[11px] text-slate-400 font-normal ml-1">
                  (~{estimatedTimeSavedMs}ms saved)
                </span>
              </div>
            </div>
          </div>

          {/* Actual Executions */}
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Calculations Run
              </div>
              <div className="font-mono font-bold text-amber-300 text-sm">
                {totalComputations.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Total Component Re-renders */}
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-rose-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Total Re-renders
              </div>
              <div
                className={`font-mono font-bold text-sm ${
                  mode === 'optimized' ? 'text-emerald-300' : 'text-rose-400 animate-pulse'
                }`}
              >
                {totalComponentRenders.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
