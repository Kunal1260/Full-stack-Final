import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import {
  toggleMode,
  toggleStressTesting,
  setStressFrequencyHz,
  setActiveTab,
  setDatasetSizeState,
  toggleHighlightRenders,
  toggleSimulatingLiveTrades,
} from '../store/profilerSlice';
import { setDatasetSize } from '../store/marketSlice';
import {
  Zap,
  Activity,
  Layers,
  Code2,
  RefreshCw,
  Play,
  Square,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { selectorProfiler } from '../utils/selectorProfiler';
import { resetRenderCounts } from '../utils/useRenderTracker';

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    mode,
    isStressTesting,
    stressFrequencyHz,
    activeTab,
    datasetSize,
    highlightRenders,
    isSimulatingLiveTrades,
  } = useAppSelector((state) => state.profiler);
  const heartbeatTick = useAppSelector((state) => state.market.heartbeatTick);

  const handleDatasetChange = (size: number) => {
    dispatch(setDatasetSizeState(size));
    dispatch(setDatasetSize(size));
    selectorProfiler.reset();
    resetRenderCounts();
  };

  const handleResetTelemetry = () => {
    selectorProfiler.reset();
    resetRenderCounts();
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Terminal Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight text-lg">StatePulse</span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-mono font-bold tracking-widest bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 rounded">
                  v2.5 RTK
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Optimized State Access & Memoized Selectors
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => dispatch(setActiveTab('terminal'))}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'terminal'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Terminal
            </button>
            <button
              onClick={() => dispatch(setActiveTab('telemetry'))}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'telemetry'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Selector Profiler
            </button>
            <button
              onClick={() => dispatch(setActiveTab('architecture'))}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'architecture'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              Architecture & Code
            </button>
          </nav>

          {/* Core Optimization Controls */}
          <div className="flex items-center gap-2.5">
            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => dispatch(toggleMode())}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  mode === 'optimized'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Active: createSelector with Reselect caching"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Optimized</span>
              </button>
              <button
                onClick={() => dispatch(toggleMode())}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  mode === 'unoptimized'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm shadow-rose-500/20'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Active: Naive inline selectors (allocates new references on every tick)"
              >
                <span>Unoptimized</span>
              </button>
            </div>

            {/* Stress Test Generator (Noise Heartbeat) */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
              <button
                onClick={() => dispatch(toggleStressTesting())}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isStressTesting
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                }`}
                title="Dispatches background heartbeat actions to simulate high-frequency websocket / state noise"
              >
                {isStressTesting ? (
                  <>
                    <Square className="w-3 h-3 fill-amber-400" />
                    <span>Stop Noise</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                    <span>Stress Noise</span>
                  </>
                )}
              </button>

              {/* Stress Frequency */}
              {isStressTesting && (
                <select
                  value={stressFrequencyHz}
                  onChange={(e) => dispatch(setStressFrequencyHz(Number(e.target.value)))}
                  className="bg-slate-950 text-amber-300 text-xs px-1.5 py-0.5 rounded border border-amber-500/30 focus:outline-none"
                >
                  <option value={10}>10 Hz</option>
                  <option value={20}>20 Hz</option>
                  <option value={50}>50 Hz</option>
                  <option value={100}>100 Hz</option>
                </select>
              )}

              {/* Pulse Indicator */}
              <div
                className={`w-2 h-2 rounded-full transition-all duration-75 ${
                  heartbeatTick % 2 === 0
                    ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                    : 'bg-slate-700'
                }`}
                title={`Heartbeat tick: ${heartbeatTick}`}
              />
            </div>

            {/* Live Trades Simulator */}
            <button
              onClick={() => dispatch(toggleSimulatingLiveTrades())}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                isSimulatingLiveTrades
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="Simulates real trade updates that legitimately alter asset prices"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Live Ticker</span>
            </button>

            {/* Dataset Scale Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 text-[11px]">Items:</span>
              {[250, 1000, 5000].map((size) => (
                <button
                  key={size}
                  onClick={() => handleDatasetChange(size)}
                  className={`px-1.5 py-0.5 rounded font-mono text-[11px] transition-all ${
                    datasetSize === size
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {size >= 1000 ? `${size / 1000}k` : size}
                </button>
              ))}
            </div>

            {/* Highlight Toggle */}
            <button
              onClick={() => dispatch(toggleHighlightRenders())}
              className={`p-1.5 rounded-xl border text-xs transition-all ${
                highlightRenders
                  ? 'bg-slate-800 border-cyan-500/40 text-cyan-400'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={highlightRenders ? 'Render flash highlights enabled' : 'Render flash highlights disabled'}
            >
              <div className="w-4 h-4 border border-current rounded flex items-center justify-center text-[9px] font-bold">
                R
              </div>
            </button>

            {/* Reset Button */}
            <button
              onClick={handleResetTelemetry}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Reset telemetry counters and render logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
