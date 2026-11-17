# StatePulse — Optimized State Access with Memoized Selectors

> Production-grade Financial Analytics Terminal and State Selector Laboratory engineered to demonstrate, benchmark, and visualize **Optimized State Access with Memoized Selectors** using **Redux Toolkit 2.x**, **Reselect 5.x**, **React 19**, and **Tailwind CSS**.

---

## 🎯 The Core Problem & Solution

In modern React applications powered by state containers (Redux, Zustand, TanStack Store), accessing derived state inside components often leads to subtle, catastrophic performance bottlenecks:

```typescript
// ❌ THE NAIVE DERIVED STATE ANTI-PATTERN:
// On EVERY dispatch (even unrelated ones like a timer, heartbeat, or mouse coordinate):
// .filter() creates a BRAND NEW array reference: [] !== []
// React-Redux uses referential equality (===) by default.
// Result: Every consumer component re-renders on EVERY tick!
const filteredAssets = useSelector(state => 
  state.market.assets.filter(a => a.riskLevel === 'High')
);
```

### ✅ The Memoized Selector Solution (Reselect `createSelector`)

```typescript
// ✅ OPTIMIZED MEMOIZED SELECTOR:
// Checks inputs referentially (prevAssets === nextAssets && prevFilter === nextFilter).
// If inputs did not change, the combiner function is NOT executed.
// The exact same cached reference is returned in 0ms!
// Result: React-Redux detects prevResult === nextResult and SKIPS re-rendering!
export const selectFilteredAssets = createSelector(
  [selectRawAssets, selectFilters],
  (assets, filters) => assets.filter(a => matches(a, filters))
);
```

---

## 🏗️ Architecture: Multi-Stage Selector Pipeline

StatePulse organizes state derivation into a 5-tier composable pipeline:

```
[Redux State Tree: Root Assets + Filters + Sort]
                     │
                     ▼
  [Tier 1: Primitive Selectors] ──> selectRawAssets, selectFilters, selectSort
                     │
                     ▼
  [Tier 2: Filtering Selector] ───> selectFilteredAssets (Cached by assets & filters)
                     │
                     ▼
  [Tier 3: Sorting Selector] ─────> selectSortedAssets (Reuses Tier 2 without re-filtering!)
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
[Tier 4: Heavy Aggregates]   [Tier 5: Parametric Selectors]
- selectPortfolioKPIs         - makeSelectAssetById() (Per-instance factory)
- selectSectorAllocation      - selectAssetByIdLRU (Reselect 5 lruMemoize)
- selectRiskDistribution
```

---

## 🚀 Key Features

1. **⚡ Live Optimization Switcher:**
   - Toggle instantly between **Optimized Mode** (`createSelector` with Reselect caching) and **Unoptimized Mode** (naive inline state derivation).
2. **🔥 High-Frequency Noise Generator (Stress Testing):**
   - Dispatches background heartbeat actions (10 Hz – 100 Hz) simulating real-world websocket traffic, timers, or unrelated store changes.
   - **In Unoptimized Mode:** Triggers severe render cascades across the entire UI.
   - **In Optimized Mode:** 100% cache hits and 0 unnecessary re-renders.
3. **📊 Real-Time Selector & Render Telemetry:**
   - Monitored metrics: Cache Hit Rate (%), Saved Calculations, Execution Latency (ms), and Cumulative CPU Time Saved.
   - Visual **"Flash on Re-render"** highlights (green = optimized/valid update, red = redundant re-render).
   - Component Render Leaderboard tracking render counts per component.
4. **🏭 Parametric / Factory Selectors:**
   - Demonstrates `makeSelectAssetById()` factory pattern to prevent cache trashing when querying different IDs across sibling rows.
   - Includes Reselect 5 `lruMemoize` with configurable cache size (`maxSize: 50`).
5. **📈 Interactive Financial Analytics:**
   - Multi-criteria filtering (Asset Class, Risk Tier, Full-text Search, Holdings Only).
   - Dynamic Portfolio KPIs: Total AUM, Daily P&L, Weighted 24h Return, Parametric Value-at-Risk (VaR 95%), and Sharpe Ratio.
   - Interactive Sector Allocation and Risk Distribution visualizations.
   - Expandable dataset size: test with 250, 1,000, or 5,000 assets.

---

## 📂 Project Structure

```
final-fullstack/
├── src/
│   ├── types/
│   │   ├── market.ts                  # Asset, Filter, Sort, and KPI interfaces
│   │   └── profiler.ts                # Telemetry record definitions
│   ├── store/
│   │   ├── store.ts                   # Redux Toolkit store configuration
│   │   ├── marketSlice.ts             # Assets, filters, ticks, and state actions
│   │   ├── profilerSlice.ts           # Profiler modes, stress tests, and active tabs
│   │   └── selectors/
│   │       ├── memoizedSelectors.ts   # Composed createSelector pipeline & factories
│   │       ├── unoptimizedSelectors.ts# Naive derivation baseline for benchmarking
│   │       └── useAdaptiveSelectors.ts# Facade hook switching modes dynamically
│   ├── utils/
│   │   ├── dataGenerator.ts           # Synthetic multi-asset financial data generator
│   │   ├── selectorProfiler.ts        # Telemetry observer avoiding Redux dispatch loops
│   │   └── useRenderTracker.ts        # Re-render counter hook with DOM flash animations
│   ├── components/
│   │   ├── Navbar.tsx                 # Header, optimization toggle, noise generator controls
│   │   ├── TelemetryBanner.tsx        # Real-time HUD showing cache hit rate & saved CPU ms
│   │   ├── MetricsBar.tsx             # Portfolio KPI summary cards with render badges
│   │   ├── PortfolioAnalytics.tsx     # Segmented sector bar & risk profile matrix
│   │   ├── FilterToolbar.tsx          # Search, category pills, risk dropdown, sort controls
│   │   ├── AssetGrid.tsx              # Financial asset data grid with pagination
│   │   ├── AssetRow.tsx               # Row component featuring per-instance render tracking
│   │   ├── AssetDetailModal.tsx       # Parametric factory selector inspection modal
│   │   ├── ProfilerPanel.tsx          # Telemetry breakdown table & render leaderboard
│   │   └── CodeArchitectureGuide.tsx  # In-app interactive architectural guide
│   ├── App.tsx                        # Application shell & ticker orchestration
│   ├── index.css                      # Tailwind CSS v4 & custom render pulse keyframes
│   └── main.tsx                       # React 19 root entrypoint
├── package.json
├── vite.config.ts                     # Vite 8 + Tailwind CSS v4 setup
└── tsconfig.json
```

---

## 🛠️ Getting Started

### ⚡ Quick Start on Windows (.bat file)
Simply double-click:
- **[start.bat](file:///D:/final%20fullstack/start.bat)**: One-click launcher that auto-installs dependencies if needed, starts the Vite server, and opens `http://localhost:5173/` in your browser.

---

### Manual CLI Commands
- Node.js 18+ (tested on Node 24)
- npm / pnpm / yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or build for production
npm run build

# Preview production build
npm run preview
```

Open `http://localhost:5173` (or `http://localhost:4173` for preview) in your browser.

---

## 🧪 How to Reproduce the Benchmark

1. Open the application.
2. Observe the initial state: **Optimized Mode** is active.
3. Click **"Stress Noise"** in the top navigation bar.
   - The pulse indicator blinks rapidly at 20 Hz (20 state updates per second).
   - Notice that the **Cache Hit Rate** climbs to **99.8%+**.
   - Notice that the **Total Re-renders** on cards and grid remain completely still (0 re-renders).
4. Click the **"Unoptimized"** button.
   - Notice that all components start flashing red!
   - Every single card and table row re-renders 20 times per second.
   - The Cache Hit Rate drops to **0.0%**.
5. Switch to the **"Selector Profiler"** tab to inspect the detailed calculation latency, hit counters, and render leaderboard.
6. Switch to the **"Architecture & Code"** tab to explore implementation patterns and copy production-ready selector snippets.

---

## 📜 License
MIT License. Built for high-performance React and Redux state engineering.
