import React, { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { selectAsset } from '../store/marketSlice';
import { makeSelectAssetById } from '../store/selectors/memoizedSelectors';
import { X, Code, CheckCircle2 } from 'lucide-react';
import { useRenderTracker } from '../utils/useRenderTracker';

export const AssetDetailModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedAssetId = useAppSelector((state) => state.market.selectedAssetId);
  const mode = useAppSelector((state) => state.profiler.mode);

  // Demonstrate factory selector: memoized per-component-instance!
  const selectAssetMemoized = useMemo(() => makeSelectAssetById(), []);
  const asset = useAppSelector((state) =>
    selectedAssetId ? selectAssetMemoized(state, selectedAssetId) : undefined
  );

  const { renderCount } = useRenderTracker('AssetDetailModal', mode === 'optimized');

  if (!asset || !selectedAssetId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/80 flex items-center justify-center font-mono font-bold text-cyan-400 text-lg">
              {asset.ticker.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono">{asset.ticker}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {asset.assetClass}
                </span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-1.5 py-0.5 rounded">
                  Factory Selector Resolved
                </span>
              </div>
              <p className="text-xs text-slate-400">{asset.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">
              Modal Renders: {renderCount}
            </span>
            <button
              onClick={() => dispatch(selectAsset(null))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400">Current Price</span>
              <div className="text-lg font-bold text-white font-mono mt-0.5">
                ${asset.price.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400">24h Change</span>
              <div
                className={`text-lg font-bold font-mono mt-0.5 ${
                  asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
              </div>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400">Portfolio Holdings</span>
              <div className="text-lg font-bold text-cyan-300 font-mono mt-0.5">
                ${asset.holdingValue.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500">{asset.holdingQuantity} units</div>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400">Risk Profile</span>
              <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">
                {asset.riskLevel}
              </div>
              <div className="text-[10px] text-slate-500">{asset.sector}</div>
            </div>
          </div>

          {/* Educational Box: Factory Selectors vs Cache Trashing */}
          <div className="bg-blue-950/30 border border-blue-900/60 rounded-xl p-4">
            <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Code className="w-4 h-4" />
              <span>How This Component Accesses State via Factory Selector</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Standard <code>createSelector</code> has a default memoization cache size of 1. If multiple components query different IDs using the same selector instance, the cache constantly misses (cache trashing).
            </p>
            <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
              <span className="text-slate-500">// 1. Selector Factory function:</span>
              <br />
              <span className="text-purple-400">export const</span> makeSelectAssetById = () =&gt;{' '}
              <span className="text-blue-400">createSelector</span>(
              <br />
              &nbsp;&nbsp;[selectRawAssets, (_state, assetId) =&gt; assetId],
              <br />
              &nbsp;&nbsp;(assets, id) =&gt; assets.find(a =&gt; a.id === id)
              <br />
              );
              <br />
              <br />
              <span className="text-slate-500">// 2. Inside Component instance:</span>
              <br />
              <span className="text-purple-400">const</span> selectAsset ={' '}
              <span className="text-yellow-400">useMemo</span>(makeSelectAssetById, []);
              <br />
              <span className="text-purple-400">const</span> asset ={' '}
              <span className="text-cyan-400">useAppSelector</span>(state =&gt; selectAsset(state, id));
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Result: Dedicated cache per component instance + 0 unnecessary recalculations.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => dispatch(selectAsset(null))}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
