import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Zap,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

export const CodeArchitectureGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const codeSnippets = [
    {
      title: '1. Basic Derived State: The Naive Anti-Pattern vs createSelector',
      description:
        'Inlining .filter() or .map() inside useSelector returns a new array reference every dispatch, breaking React-Redux referential equality check.',
      badCode: `// ❌ ANTI-PATTERN: Naive inline derivation
// Allocates brand-new array reference on EVERY Redux dispatch!
// Causes all consumer components to re-render constantly.
const filteredItems = useSelector(state => 
  state.items.filter(item => item.status === 'active')
);`,
      goodCode: `// ✅ OPTIMIZED: createSelector from @reduxjs/toolkit (Reselect)
// Only recomputes when 'items' reference actually changes.
export const selectActiveItems = createSelector(
  [(state: RootState) => state.items],
  (items) => items.filter(item => item.status === 'active')
);

// In Component:
const activeItems = useAppSelector(selectActiveItems);`,
    },
    {
      title: '2. Multi-Stage Selector Composition (Pipeline Architecture)',
      description:
        'Layering selectors allows intermediate stages to cache their outputs. If only sorting criteria changes, filtering is NOT re-executed!',
      goodCode: `// Stage 1: Primitive input selectors (cheap property reads)
export const selectAssets = (state: RootState) => state.market.assets;
export const selectFilters = (state: RootState) => state.market.filters;
export const selectSort = (state: RootState) => state.market.sort;

// Stage 2: Filtered collection (Cached)
export const selectFilteredAssets = createSelector(
  [selectAssets, selectFilters],
  (assets, filters) => assets.filter(a => matchesFilter(a, filters))
);

// Stage 3: Sorted collection (Reuses cached Stage 2!)
export const selectSortedAssets = createSelector(
  [selectFilteredAssets, selectSort],
  (filteredAssets, sort) => filteredAssets.slice().sort(compareFn(sort))
);

// Stage 4: Heavy Analytics (Only runs when sorted assets change)
export const selectPortfolioKPIs = createSelector(
  [selectSortedAssets],
  (assets) => computeHeavyAnalytics(assets)
);`,
    },
    {
      title: '3. Parametric Selectors: Factory Pattern for Props / Arguments',
      description:
        'Standard createSelector has a cache size of 1. Sharing one selector with multiple arguments in sibling components causes 100% cache misses. Factory functions give each component instance its own cache.',
      goodCode: `// 1. Selector Factory function
export const makeSelectAssetById = () => {
  return createSelector(
    [selectAssets, (_state: RootState, assetId: string) => assetId],
    (assets, assetId) => assets.find(a => a.id === assetId)
  );
};

// 2. In Component: Memoize selector instance per component lifecycle
export const AssetCard: React.FC<{ assetId: string }> = ({ assetId }) => {
  const selectAsset = useMemo(makeSelectAssetById, []);
  const asset = useAppSelector(state => selectAsset(state, assetId));
  return <div>{asset?.name}</div>;
};`,
    },
    {
      title: '4. Reselect 5.x LRU Memoization (Alternative to Factories)',
      description:
        'Reselect 5 (bundled with Redux Toolkit 2.x) introduces lruMemoize, allowing a single selector instance to store multiple cached entries.',
      goodCode: `import { createSelector, lruMemoize } from '@reduxjs/toolkit';

// Caches up to 100 distinct assetId results globally!
export const selectAssetByIdLRU = createSelector(
  [selectAssets, (_state: RootState, assetId: string) => assetId],
  (assets, assetId) => assets.find(a => a.id === assetId),
  {
    memoize: lruMemoize,
    memoizeOptions: {
      maxSize: 100, // Keeps last 100 argument combinations cached
    },
  }
);`,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Architecture Concept Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Optimized State Access Architecture
            </h2>
            <p className="text-xs text-slate-400">
              The engineering principles behind zero-waste Redux state access and Reselect pipelines
            </p>
          </div>
        </div>

        {/* Visual Pipeline Diagram */}
        <div className="mt-6 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-3">
            Multi-Tier Memoization Pipeline:
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs font-mono">
            <div className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-slate-200 text-center w-full md:w-auto">
              <span className="text-[10px] text-slate-500 block">Layer 1</span>
              Raw State Tree
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 rotate-90 md:rotate-0" />
            <div className="bg-cyan-950/70 border border-cyan-800 px-3 py-2 rounded-lg text-cyan-300 text-center w-full md:w-auto">
              <span className="text-[10px] text-cyan-500 block">Layer 2 (Cached)</span>
              selectFilteredAssets
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 rotate-90 md:rotate-0" />
            <div className="bg-blue-950/70 border border-blue-800 px-3 py-2 rounded-lg text-blue-300 text-center w-full md:w-auto">
              <span className="text-[10px] text-blue-500 block">Layer 3 (Cached)</span>
              selectSortedAssets
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 rotate-90 md:rotate-0" />
            <div className="bg-purple-950/70 border border-purple-800 px-3 py-2 rounded-lg text-purple-300 text-center w-full md:w-auto">
              <span className="text-[10px] text-purple-500 block">Layer 4 (Aggregates)</span>
              KPIs / Charts / VaR
            </div>
          </div>
        </div>
      </div>

      {/* The 5 Golden Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Rule 1: Keep Input Selectors Pure & Cheap</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Input selectors should only retrieve raw state slices (e.g., <code>{'state => state.assets'}</code>). Never allocate arrays or objects inside input selectors.
          </p>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-2">
            <Layers className="w-4 h-4" />
            <span>Rule 2: Compose Rather than Duplicate</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pass existing memoized selectors as inputs into new selectors. This allows intermediate computations to be reused across different UI views.
          </p>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-2">
            <Zap className="w-4 h-4" />
            <span>Rule 3: Use Factories for Component Props</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            When a selector takes component props or item IDs, use <code>makeSelect...</code> factory functions with <code>useMemo</code> to isolate caches per component.
          </p>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Rule 4: Avoid Unstable Combiner Outputs</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            If your output function computes a primitive or checks if data is identical, return the previous reference or use custom equality functions to preserve stability.
          </p>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold mb-2">
            <Lightbulb className="w-4 h-4" />
            <span>Rule 5: Leverage Reselect 5 LRU Cache</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Use <code>lruMemoize</code> with <code>maxSize</code> for shared selectors across dynamic queries to avoid factory boilerplate while retaining multi-argument caching.
          </p>
        </div>
      </div>

      {/* Code Snippets Section */}
      <div className="space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-cyan-400" />
          <span>Implementation Blueprint & Code Comparisons</span>
        </h3>

        {codeSnippets.map((snippet, idx) => (
          <div
            key={idx}
            className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl"
          >
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{snippet.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{snippet.description}</p>
              </div>
              <button
                onClick={() =>
                  copyCode(snippet.goodCode || snippet.badCode || '', idx)
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 gap-4 font-mono text-xs">
              {snippet.badCode && (
                <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-3">
                  <div className="text-[10px] uppercase font-bold text-rose-400 tracking-wider mb-1">
                    Problem (Unoptimized):
                  </div>
                  <pre className="text-rose-200 overflow-x-auto">
                    {snippet.badCode}
                  </pre>
                </div>
              )}

              {snippet.goodCode && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider mb-1">
                    Solution (Memoized):
                  </div>
                  <pre className="text-slate-200 overflow-x-auto">
                    {snippet.goodCode}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
