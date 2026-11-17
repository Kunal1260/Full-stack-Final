import { createSelector, lruMemoize } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { MarketAsset, PortfolioKPIs, SectorAllocation, RiskDistribution, RiskLevel } from '../../types/market';
import { selectorProfiler } from '../../utils/selectorProfiler';

// ==========================================
// 1. PRIMITIVE / ROOT INPUT SELECTORS
// Cheap, direct state tree property lookups
// ==========================================
export const selectRawAssets = (state: RootState) => state.market.assets;
export const selectFilters = (state: RootState) => state.market.filters;
export const selectSort = (state: RootState) => state.market.sort;
export const selectSelectedAssetId = (state: RootState) => state.market.selectedAssetId;
export const selectHeartbeatTick = (state: RootState) => state.market.heartbeatTick;
export const selectProfilerMode = (state: RootState) => state.profiler.mode;

// ==========================================
// INSTRUMENTATION HELPER
// Measures execution latency & detects cache hits
// ==========================================
function instrumentSelector<I extends unknown[], R>(
  id: string,
  baseSelector: (...args: I) => R
) {
  let wasComputed = false;

  return {
    wrapper: (...args: I): R => {
      wasComputed = false;
      const result = baseSelector(...args);
      if (!wasComputed) {
        selectorProfiler.recordCacheHit(id);
      }
      return result;
    },
    markComputed: (durationMs: number) => {
      wasComputed = true;
      selectorProfiler.recordComputation(id, durationMs);
    },
  };
}

// ==========================================
// 2. STAGE 1 DERIVED SELECTOR: FILTERING
// Depends on: [selectRawAssets, selectFilters]
// Re-computes ONLY when assets or filter criteria change
// ==========================================
const filteredAssetsInstrumentation = instrumentSelector(
  'selectFilteredAssets',
  createSelector(
    [selectRawAssets, selectFilters],
    (assets, filters) => {
      const t0 = performance.now();
      const query = filters.searchQuery.trim().toLowerCase();

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
      filteredAssetsInstrumentation.markComputed(t1 - t0);
      return result;
    }
  )
);

export const selectFilteredAssets = filteredAssetsInstrumentation.wrapper;

// ==========================================
// 3. STAGE 2 DERIVED SELECTOR: SORTING
// Depends on: [selectFilteredAssets, selectSort]
// Re-computes ONLY when filtered list or sort direction changes
// ==========================================
const sortedAssetsInstrumentation = instrumentSelector(
  'selectSortedAssets',
  createSelector(
    [selectFilteredAssets, selectSort],
    (filteredAssets, sort) => {
      const t0 = performance.now();
      const { field, direction } = sort;
      const multiplier = direction === 'asc' ? 1 : -1;

      // Slice to avoid mutating cached filtered array
      const result = filteredAssets.slice().sort((a, b) => {
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
      sortedAssetsInstrumentation.markComputed(t1 - t0);
      return result;
    }
  )
);

export const selectSortedAssets = sortedAssetsInstrumentation.wrapper;

// ==========================================
// 4. HEAVY AGGREGATE SELECTOR: PORTFOLIO KPIS
// Depends on: [selectSortedAssets]
// Re-computes Total AUM, P&L, Weighted Return, VaR, Sharpe
// ==========================================
const portfolioKPIsInstrumentation = instrumentSelector(
  'selectPortfolioKPIs',
  createSelector(
    [selectSortedAssets],
    (assets): PortfolioKPIs => {
      const t0 = performance.now();

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

      // Parametric Value-at-Risk (95% confidence 1-day horizon, approx 1.65 std dev)
      const volatilityEstimate = Math.abs(weightedDailyReturn) * 1.8 + 1.2;
      const valueAtRisk95 = totalAUM * (1.645 * (volatilityEstimate / 100));

      // Sharpe Ratio approximation assuming risk-free rate of 4.5% annual (~0.012% daily)
      const dailyRiskFreeRate = 0.012;
      const excessDailyReturn = weightedDailyReturn - dailyRiskFreeRate;
      const estimatedSharpeRatio = volatilityEstimate > 0 ? Number(((excessDailyReturn / volatilityEstimate) * Math.sqrt(252)).toFixed(2)) : 0;

      const t1 = performance.now();
      portfolioKPIsInstrumentation.markComputed(t1 - t0);

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
    }
  )
);

export const selectPortfolioKPIs = portfolioKPIsInstrumentation.wrapper;

// ==========================================
// 5. AGGREGATE SELECTOR: SECTOR ALLOCATION
// ==========================================
const SECTOR_PALETTE = ['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#fb923c', '#4ade80', '#2dd4bf'];

const sectorAllocationInstrumentation = instrumentSelector(
  'selectSectorAllocation',
  createSelector(
    [selectSortedAssets],
    (assets): SectorAllocation[] => {
      const t0 = performance.now();

      const sectorMap = new Map<string, number>();
      let totalValue = 0;

      for (let i = 0; i < assets.length; i++) {
        const a = assets[i];
        const val = a.holdingQuantity > 0 ? a.holdingValue : a.price;
        totalValue += val;
        sectorMap.set(a.sector, (sectorMap.get(a.sector) || 0) + val);
      }

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
      sectorAllocationInstrumentation.markComputed(t1 - t0);
      return allocations;
    }
  )
);

export const selectSectorAllocation = sectorAllocationInstrumentation.wrapper;

// ==========================================
// 6. AGGREGATE SELECTOR: RISK DISTRIBUTION
// ==========================================
const RISK_COLORS: Record<RiskLevel, string> = {
  Low: '#22c55e',
  Moderate: '#3b82f6',
  High: '#f97316',
  Speculative: '#ef4444',
};

const riskDistributionInstrumentation = instrumentSelector(
  'selectRiskDistribution',
  createSelector(
    [selectSortedAssets],
    (assets): RiskDistribution[] => {
      const t0 = performance.now();

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

      const riskOrder: RiskLevel[] = ['Low', 'Moderate', 'High', 'Speculative'];
      const result: RiskDistribution[] = riskOrder.map((level) => {
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
      riskDistributionInstrumentation.markComputed(t1 - t0);
      return result;
    }
  )
);

export const selectRiskDistribution = riskDistributionInstrumentation.wrapper;

// ==========================================
// 7. PARAMETRIC / FACTORY SELECTORS (WITH PROPS)
// Best Practice: Factory function returns a fresh selector instance per component
// Ensures isolated memoization cache per asset row
// ==========================================
export const makeSelectAssetById = () => {
  return createSelector(
    [selectRawAssets, (_state: RootState, assetId: string) => assetId],
    (assets, assetId): MarketAsset | undefined => {
      return assets.find((a) => a.id === assetId);
    }
  );
};

// Reselect 5.x LRU memoized selector with argument
export const selectAssetByIdLRU = createSelector(
  [selectRawAssets, (_state: RootState, assetId: string) => assetId],
  (assets, assetId): MarketAsset | undefined => {
    return assets.find((a) => a.id === assetId);
  },
  {
    memoize: lruMemoize,
    memoizeOptions: {
      maxSize: 50,
    },
  }
);
