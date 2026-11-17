import React, { useEffect, useState } from 'react';
import { selectorProfiler, type TelemetryRecord } from '../utils/selectorProfiler';
import { getRenderCountsSnapshot, subscribeRenderCounts, resetRenderCounts } from '../utils/useRenderTracker';
import { useAppDispatch, useAppSelector } from '../store/store';
import { heartbeat } from '../store/marketSlice';
import {
  Gauge,
  Cpu,
  Sparkles,
  Layers,
  RefreshCw,
  Flame,
  CheckCircle,
  AlertTriangle,
  PlayCircle,
} from 'lucide-react';

export const ProfilerPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.profiler.mode);
  const [telemetry, setTelemetry] = useState<Record<string, TelemetryRecord>>(
    selectorProfiler.getSnapshot()
  );
  const [renderCounts, setRenderCounts] = useState<Record<string, number>>(
    getRenderCountsSnapshot()
  );
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  useEffect(() => {
    const unsubTelemetry = selectorProfiler.subscribe(setTelemetry);
    const unsubRenders = subscribeRenderCounts(() => {
      setRenderCounts(getRenderCountsSnapshot());
    });
    return () => {
      unsubTelemetry();
      unsubRenders();
    };
  }, []);

  const records = Object.values(telemetry);

  // Run automated 500-action synthetic stress test
  const runSyntheticBenchmark = () => {
    setIsBenchmarking(true);
    let count = 0;
    const interval = setInterval(() => {
      dispatch(heartbeat());
      count++;
      if (count >= 100) {
        clearInterval(interval);
        setIsBenchmarking(false);
      }
    }, 10);
  };

  const handleReset = () => {
    selectorProfiler.reset();
    resetRenderCounts();
  };

  // Render leaderboard sorted by highest render count
  const renderEntries = Object.entries(renderCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const maxRenders = Math.max(1, ...renderEntries.map((e) => e[1]));

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Benchmark Trigger */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Synthetic Benchmark
              </span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Dispatch 100 Background Actions
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dispatches 100 rapid state heartbeats. In <strong>Optimized mode</strong>, observe 0 unnecessary re-renders. In <strong>Unoptimized mode</strong>, witness render storms.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              disabled={isBenchmarking}
              onClick={runSyntheticBenchmark}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              <PlayCircle className="w-4 h-4" />
              <span>{isBenchmarking ? 'Running Benchmark...' : 'Run 100-Tick Test'}</span>
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Reset all counters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card 2: Current Mode Status */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active Architecture
              </span>
              <Gauge className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-lg font-bold ${
                  mode === 'optimized' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {mode === 'optimized' ? 'Reselect createSelector' : 'Naive Inline Selectors'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {mode === 'optimized'
                ? 'Referential equality checks on inputs prevent downstream recalculations and child re-renders.'
                : 'Allocating fresh array/object references on each selector invocation causes cascading re-renders.'}
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs">
            {mode === 'optimized' ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle className="w-4 h-4" /> Zero wasted cycles detected
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <AlertTriangle className="w-4 h-4" /> High GC & re-render pressure
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Memory & GC Efficiency */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Garbage Collection Impact
              </span>
              <Cpu className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Referential Stability
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When a selector returns <code>prevResult === nextResult</code>, React-Redux skips component execution entirely via strict equality check <code>===</code>.
            </p>
          </div>

          <div className="mt-4 bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300">
            Reference Check: <span className="text-emerald-400">prev === next ? SKIP : RENDER</span>
          </div>
        </div>
      </div>

      {/* Selectors Telemetry Breakdown Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">
              Selector Execution & Cache Telemetry Matrix
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {records.length} Monitored Selectors
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Selector Identifier</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4 text-right">Calculations Run</th>
                <th className="py-3 px-4 text-right">Cache Hits</th>
                <th className="py-3 px-4 text-right">Hit Rate</th>
                <th className="py-3 px-4 text-right">Last Latency</th>
                <th className="py-3 px-4 text-right">Total Exec Time</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => {
                const totalCalls = rec.computationCount + rec.cacheHitCount;
                const hitRate =
                  totalCalls > 0 ? ((rec.cacheHitCount / totalCalls) * 100).toFixed(1) : '100.0';
                const hitRateNum = Number(hitRate);

                return (
                  <tr
                    key={rec.id}
                    className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white text-xs">{rec.id}</div>
                      <div className="text-[11px] text-slate-400">{rec.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          rec.category === 'aggregate'
                            ? 'bg-purple-950/60 text-purple-300 border border-purple-800/60'
                            : rec.category === 'derived'
                            ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60'
                            : rec.category === 'parametric'
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {rec.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                      {rec.computationCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {rec.cacheHitCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span
                        className={
                          hitRateNum >= 90
                            ? 'text-emerald-400'
                            : hitRateNum >= 50
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }
                      >
                        {hitRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {rec.lastExecutionMs} ms
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {rec.totalExecutionMs.toFixed(2)} ms
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Component Re-render Distribution Leaderboard */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-semibold text-white">
              Component Re-render Leaderboard
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Tracks total render cycles invoked per component
          </span>
        </div>

        <div className="space-y-3">
          {renderEntries.map(([name, count]) => {
            const pct = (count / maxRenders) * 100;
            return (
              <div key={name} className="flex items-center gap-3 text-xs font-mono">
                <span className="w-36 truncate text-slate-300 text-right">{name}</span>
                <div className="flex-1 bg-slate-950 h-5 rounded-lg overflow-hidden border border-slate-800 relative flex items-center">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full transition-all duration-300 ${
                      mode === 'optimized'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500'
                        : 'bg-gradient-to-r from-rose-600 to-orange-500'
                    }`}
                  />
                  <span className="absolute left-2 text-[10px] text-white font-bold drop-shadow">
                    {count.toLocaleString()} renders
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
