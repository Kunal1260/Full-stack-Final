import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SelectorMode } from '../types/profiler';

interface ProfilerSliceState {
  mode: SelectorMode;
  isStressTesting: boolean;
  stressFrequencyHz: number;
  activeTab: 'terminal' | 'telemetry' | 'architecture';
  datasetSize: number;
  highlightRenders: boolean;
  isSimulatingLiveTrades: boolean;
}

const initialState: ProfilerSliceState = {
  mode: 'optimized',
  isStressTesting: false,
  stressFrequencyHz: 20,
  activeTab: 'terminal',
  datasetSize: 250,
  highlightRenders: true,
  isSimulatingLiveTrades: false,
};

export const profilerSlice = createSlice({
  name: 'profiler',
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<SelectorMode>) => {
      state.mode = action.payload;
    },
    toggleMode: (state) => {
      state.mode = state.mode === 'optimized' ? 'unoptimized' : 'optimized';
    },
    setStressTesting: (state, action: PayloadAction<boolean>) => {
      state.isStressTesting = action.payload;
    },
    toggleStressTesting: (state) => {
      state.isStressTesting = !state.isStressTesting;
    },
    setStressFrequencyHz: (state, action: PayloadAction<number>) => {
      state.stressFrequencyHz = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<ProfilerSliceState['activeTab']>) => {
      state.activeTab = action.payload;
    },
    setDatasetSizeState: (state, action: PayloadAction<number>) => {
      state.datasetSize = action.payload;
    },
    toggleHighlightRenders: (state) => {
      state.highlightRenders = !state.highlightRenders;
    },
    toggleSimulatingLiveTrades: (state) => {
      state.isSimulatingLiveTrades = !state.isSimulatingLiveTrades;
    },
  },
});

export const {
  setMode,
  toggleMode,
  setStressTesting,
  toggleStressTesting,
  setStressFrequencyHz,
  setActiveTab,
  setDatasetSizeState,
  toggleHighlightRenders,
  toggleSimulatingLiveTrades,
} = profilerSlice.actions;

export default profilerSlice.reducer;
