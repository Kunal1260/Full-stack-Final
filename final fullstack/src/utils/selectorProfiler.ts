// High-performance telemetry collector that prevents Redux dispatch recursion

export interface TelemetryRecord {
  id: string;
  name: string;
  category: 'primitive' | 'derived' | 'aggregate' | 'parametric';
  computationCount: number;
  cacheHitCount: number;
  lastExecutionMs: number;
  totalExecutionMs: number;
  description: string;
}

type Listener = (records: Record<string, TelemetryRecord>) => void;

class SelectorProfilerService {
  private records: Record<string, TelemetryRecord> = {};
  private listeners: Set<Listener> = new Set();
  private dirty = false;

  constructor() {
    this.initDefaultRecords();
  }

  private initDefaultRecords() {
    this.register('selectAssets', 'All Raw Assets Array', 'primitive', 'Retrieves root assets list directly from state.assets');
    this.register('selectFilteredAssets', 'Filtered Assets', 'derived', 'Applies full-text search, asset class, risk, and holdings filters');
    this.register('selectSortedAssets', 'Sorted & Filtered Assets', 'derived', 'Performs multi-criteria sorting on the filtered assets array');
    this.register('selectPortfolioKPIs', 'Portfolio Executive KPIs', 'aggregate', 'Calculates Total AUM, P&L %, Weighted Return, VaR (95%), and Sharpe Ratio');
    this.register('selectSectorAllocation', 'Sector Allocation Matrix', 'aggregate', 'Groups holding values by industry sector and normalizes percentages');
    this.register('selectRiskDistribution', 'Risk Breakdown Matrix', 'aggregate', 'Aggregates capital exposure across Low, Moderate, High, Speculative risks');
    this.register('selectAssetById', 'Parametric Asset Detail', 'parametric', 'Per-instance / LRU memoized selector to fetch specific asset by ID without full table invalidation');
  }

  public register(id: string, name: string, category: TelemetryRecord['category'], description: string) {
    if (!this.records[id]) {
      this.records[id] = {
        id,
        name,
        category,
        computationCount: 0,
        cacheHitCount: 0,
        lastExecutionMs: 0,
        totalExecutionMs: 0,
        description,
      };
    }
  }

  public recordComputation(id: string, durationMs: number) {
    if (!this.records[id]) return;
    this.records[id].computationCount++;
    this.records[id].lastExecutionMs = Number(durationMs.toFixed(3));
    this.records[id].totalExecutionMs += durationMs;
    this.scheduleNotify();
  }

  public recordCacheHit(id: string) {
    if (!this.records[id]) return;
    this.records[id].cacheHitCount++;
    this.scheduleNotify();
  }

  public getSnapshot(): Record<string, TelemetryRecord> {
    return { ...this.records };
  }

  public reset() {
    for (const key of Object.keys(this.records)) {
      this.records[key].computationCount = 0;
      this.records[key].cacheHitCount = 0;
      this.records[key].lastExecutionMs = 0;
      this.records[key].totalExecutionMs = 0;
    }
    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  private scheduleNotify() {
    if (this.dirty) return;
    this.dirty = true;
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        this.dirty = false;
        this.notify();
      });
    }
  }

  private notify() {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }
}

export const selectorProfiler = new SelectorProfilerService();
