import { useAppSelector } from '../store';
import {
  selectFilteredAssets,
  selectSortedAssets,
  selectPortfolioKPIs,
  selectSectorAllocation,
  selectRiskDistribution,
  selectProfilerMode,
} from './memoizedSelectors';
import {
  selectUnoptimizedFilteredAssets,
  selectUnoptimizedSortedAssets,
  selectUnoptimizedPortfolioKPIs,
  selectUnoptimizedSectorAllocation,
  selectUnoptimizedRiskDistribution,
} from './unoptimizedSelectors';

export function useAdaptiveFilteredAssets() {
  const mode = useAppSelector(selectProfilerMode);
  return useAppSelector(mode === 'optimized' ? selectFilteredAssets : selectUnoptimizedFilteredAssets);
}

export function useAdaptiveSortedAssets() {
  const mode = useAppSelector(selectProfilerMode);
  return useAppSelector(mode === 'optimized' ? selectSortedAssets : selectUnoptimizedSortedAssets);
}

export function useAdaptivePortfolioKPIs() {
  const mode = useAppSelector(selectProfilerMode);
  return useAppSelector(mode === 'optimized' ? selectPortfolioKPIs : selectUnoptimizedPortfolioKPIs);
}

export function useAdaptiveSectorAllocation() {
  const mode = useAppSelector(selectProfilerMode);
  return useAppSelector(mode === 'optimized' ? selectSectorAllocation : selectUnoptimizedSectorAllocation);
}

export function useAdaptiveRiskDistribution() {
  const mode = useAppSelector(selectProfilerMode);
  return useAppSelector(mode === 'optimized' ? selectRiskDistribution : selectUnoptimizedRiskDistribution);
}
