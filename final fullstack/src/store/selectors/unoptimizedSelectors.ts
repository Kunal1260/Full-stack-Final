import type { RootState } from '../store';
import type { MarketAsset, PortfolioKPIs, SectorAllocation, RiskDistribution, RiskLevel } from '../../types/market';
import { selectorProfiler } from '../../utils/selectorProfiler';

// ==========================================
// UNOPTIMIZED / NAIVE SELECTORS
// Anti-pattern: Computes derived state inline and returns a fresh object/array reference every single time!
// Result: 0 Cache Hits, endless re-renders, high GC pressure.
// ==========================================

export const selectUnoptimizedFilteredAssets = (state: RootState): MarketAsset[] => {
  const t0 = performance.now();
  const assets = state.market.assets;
  const filters = state.market.filters;
  const query = filters.searchQuery.trim().toLowerCase();

  // Fresh array allocated on EVERY invocation
  const result = assets.filter((asset) => {
    if (filters.assetClass !== 'All' && asset.assetClass !== filters.assetClass) {
      return false;
    }
    if (filters.riskLevel !== 'All' && asset.riskLevel !== filters.riskLevel) {
      return false;
    }
    if (filters.onlyHoldings && asset.holdingQuantity <= 0) {
      return false;
    }
    if (query.length > 0) {
      const matchTicker = asset.ticker.toLowerCase().includes(query);
      const matchName = asset.name.toLowerCase().includes(query);
      const matchSector = asset.sector.toLowerCase().includes(query);
      if (!matchTicker && !matchName && !matchSector) return false;
    }
    return true;
  });

  const t1 = performance.now();
  selectorProfiler.recordComputation('selectFilteredAssets', t1 - t0);
  return result;
};

export const selectUnoptimizedSortedAssets = (state: RootState): MarketAsset[] => {
  const t0 = performance.now();
  // Calls unoptimized filtered assets, then sorts on another fresh array
  const filtered = selectUnoptimizedFilteredAssets(state);
  const { field, direction } = state.market.sort;
  const multiplier = direction === 'asc' ? 1 : -1;

  const result = filtered.slice().sort((a, b) => {
    const valA = a[field];
    const valB = b[field];

    if (typeof valA === 'string' && typeof valB === 'string') {
      return valA.localeCompare(valB) * multiplier;
    }
    if (typeof valA === 'number' && typeof valB === 'number') {
      return (valA - valB) * multiplier;
    }
    return 0;
  });

  const t1 = performance.now();
  selectorProfiler.recordComputation('selectSortedAssets', t1 - t0);
  return result;
};

export const selectUnoptimizedPortfolioKPIs = (state: RootState): PortfolioKPIs => {
  const t0 = performance.now();
  const assets = selectUnoptimizedSortedAssets(state);

  let totalAUM = 0;
  let totalUnrealizedPnL = 0;
  let weightedReturnAccumulator = 0;
  let holdingCount = 0;
  let topPerformer: { ticker: string; change: number } | null = null;
  let worstPerformer: { ticker: string; change: number } | null = null;

  for (let i = 0; i < assets.length; i++) {
    const a = assets[i];
    if (a.holdingQuantity > 0) {
      totalAUM += a.holdingValue;
      totalUnrealizedPnL += a.unrealizedPnL;
      weightedReturnAccumulator += a.change24h * a.holdingValue;
      holdingCount++;
    }

    if (!topPerformer || a.change24h > topPerformer.change) {
      topPerformer = { ticker: a.ticker, change: a.change24h };
    }
    if (!worstPerformer || a.change24h < worstPerformer.change) {
      worstPerformer = { ticker: a.ticker, change: a.change24h };
    }
  }

  const totalPnLPercentage = totalAUM > 0 ? (totalUnrealizedPnL / totalAUM) * 100 : 0;
  const weightedDailyReturn = totalAUM > 0 ? weightedReturnAccumulator / totalAUM : 0;
  const volatilityEstimate = Math.abs(weightedDailyReturn) * 1.8 + 1.2;
  const valueAtRisk95 = totalAUM * (1.645 * (volatilityEstimate / 100));
  const dailyRiskFreeRate = 0.012;
  const excessDailyReturn = weightedDailyReturn - dailyRiskFreeRate;
  const estimatedSharpeRatio = volatilityEstimate > 0 ? Number(((excessDailyReturn / volatilityEstimate) * Math.sqrt(252)).toFixed(2)) : 0;

  const t1 = performance.now();
  selectorProfiler.recordComputation('selectPortfolioKPIs', t1 - t0);

  // Brand-new object reference allocated on every single render!
  return {
    totalAUM: Number(totalAUM.toFixed(2)),
    totalUnrealizedPnL: Number(totalUnrealizedPnL.toFixed(2)),
    totalPnLPercentage: Number(totalPnLPercentage.toFixed(2)),
    weightedDailyReturn: Number(weightedDailyReturn.toFixed(2)),
    valueAtRisk95: Number(valueAtRisk95.toFixed(2)),
    estimatedSharpeRatio,
    holdingCount,
    topPerformer,
    worstPerformer,
  };
};

export const selectUnoptimizedSectorAllocation = (state: RootState): SectorAllocation[] => {
  const t0 = performance.now();
  const assets = selectUnoptimizedSortedAssets(state);

  const sectorMap = new Map<string, number>();
  let totalValue = 0;

  for (let i = 0; i < assets.length; i++) {
    const a = assets[i];
    const val = a.holdingQuantity > 0 ? a.holdingValue : a.price;
    totalValue += val;
    sectorMap.set(a.sector, (sectorMap.get(a.sector) || 0) + val);
  }

  const SECTOR_PALETTE = ['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#fb923c', '#4ade80', '#2dd4bf'];
  const allocations: SectorAllocation[] = [];
  let colorIdx = 0;

  sectorMap.forEach((val, sector) => {
    const percentage = totalValue > 0 ? (val / totalValue) * 100 : 0;
    allocations.push({
      sector,
      value: Number(val.toFixed(2)),
      percentage: Number(percentage.toFixed(1)),
      color: SECTOR_PALETTE[colorIdx % SECTOR_PALETTE.length],
    });
    colorIdx++;
  });

  allocations.sort((a, b) => b.value - a.value);

  const t1 = performance.now();
  selectorProfiler.recordComputation('selectSectorAllocation', t1 - t0);
  return allocations;
};

export const selectUnoptimizedRiskDistribution = (state: RootState): RiskDistribution[] => {
  const t0 = performance.now();
  const assets = selectUnoptimizedSortedAssets(state);

  const counts: Record<RiskLevel, { count: number; value: number }> = {
    Low: { count: 0, value: 0 },
    Moderate: { count: 0, value: 0 },
    High: { count: 0, value: 0 },
    Speculative: { count: 0, value: 0 },
  };

  let totalVal = 0;
  for (let i = 0; i < assets.length; i++) {
    const a = assets[i];
    const val = a.holdingQuantity > 0 ? a.holdingValue : a.price;
    counts[a.riskLevel].count++;
    counts[a.riskLevel].value += val;
    totalVal += val;
  }

  const RISK_COLORS: Record<RiskLevel, string> = {
    Low: '#22c55e',
    Moderate: '#3b82f6',
    High: '#f97316',
    Speculative: '#ef4444',
  };

  const riskOrder: RiskLevel[] = ['Low', 'Moderate', 'High', 'Speculative'];
  const result = riskOrder.map((level) => {
    const item = counts[level];
    return {
      level,
      count: item.count,
      value: Number(item.value.toFixed(2)),
      percentage: totalVal > 0 ? Number(((item.value / totalVal) * 100).toFixed(1)) : 0,
      color: RISK_COLORS[level],
    };
  });

  const t1 = performance.now();
  selectorProfiler.recordComputation('selectRiskDistribution', t1 - t0);
  return result;
};
