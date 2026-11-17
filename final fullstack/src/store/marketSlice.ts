import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { MarketAsset, FilterState, SortState } from '../types/market';
import { generateAssets } from '../utils/dataGenerator';

interface MarketState {
  assets: MarketAsset[];
  filters: FilterState;
  sort: SortState;
  selectedAssetId: string | null;
  heartbeatTick: number;
  lastHeartbeat: number;
}

const initialDatasetSize = 250;

const initialState: MarketState = {
  assets: generateAssets(initialDatasetSize),
  filters: {
    searchQuery: '',
    assetClass: 'All',
    riskLevel: 'All',
    onlyHoldings: false,
  },
  sort: {
    field: 'holdingValue',
    direction: 'desc',
  },
  selectedAssetId: 'asset-1',
  heartbeatTick: 0,
  lastHeartbeat: Date.now(),
};

export const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    // Unrelated background heartbeat tick (simulating websockets, clock, system state)
    // In unoptimized mode, this will force all derived selectors to recompute and re-render!
    // In optimized mode, memoized selectors bail out because assets and filters haven't changed!
    heartbeat: (state) => {
      state.heartbeatTick++;
      state.lastHeartbeat = Date.now();
    },

    // Updates a single random asset's price to simulate genuine live market trade
    randomPriceTick: (state) => {
      if (state.assets.length === 0) return;
      const index = Math.floor(Math.random() * state.assets.length);
      const asset = state.assets[index];
      const deltaPercent = (Math.random() - 0.49) * 1.5;
      const newPrice = Number((asset.price * (1 + deltaPercent / 100)).toFixed(2));
      asset.price = Math.max(0.01, newPrice);
      asset.change24h = Number((asset.change24h + deltaPercent * 0.2).toFixed(2));
      if (asset.holdingQuantity > 0) {
        asset.holdingValue = Number((asset.holdingQuantity * asset.price).toFixed(2));
      }
      asset.lastUpdated = Date.now();
      // append to sparkline
      asset.sparkline = [...asset.sparkline.slice(1), asset.price];
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
    },

    setAssetClassFilter: (state, action: PayloadAction<FilterState['assetClass']>) => {
      state.filters.assetClass = action.payload;
    },

    setRiskFilter: (state, action: PayloadAction<FilterState['riskLevel']>) => {
      state.filters.riskLevel = action.payload;
    },

    toggleOnlyHoldings: (state) => {
      state.filters.onlyHoldings = !state.filters.onlyHoldings;
    },

    setSort: (state, action: PayloadAction<SortState>) => {
      state.sort = action.payload;
    },

    selectAsset: (state, action: PayloadAction<string | null>) => {
      state.selectedAssetId = action.payload;
    },

    setDatasetSize: (state, action: PayloadAction<number>) => {
      state.assets = generateAssets(action.payload);
      state.selectedAssetId = state.assets[0]?.id || null;
    },

    resetFilters: (state) => {
      state.filters = {
        searchQuery: '',
        assetClass: 'All',
        riskLevel: 'All',
        onlyHoldings: false,
      };
      state.sort = {
        field: 'holdingValue',
        direction: 'desc',
      };
    },
  },
});

export const {
  heartbeat,
  randomPriceTick,
  setSearchQuery,
  setAssetClassFilter,
  setRiskFilter,
  toggleOnlyHoldings,
  setSort,
  selectAsset,
  setDatasetSize,
  resetFilters,
} = marketSlice.actions;

export default marketSlice.reducer;
