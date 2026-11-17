export interface SelectorTelemetry {
  id: string;
  name: string;
  category: 'primitive' | 'derived' | 'aggregate' | 'parametric';
  computationCount: number;
  cacheHitCount: number;
  lastExecutionMs: number;
  averageExecutionMs: number;
  description: string;
}

export type SelectorMode = 'optimized' | 'unoptimized';

export interface ProfilerState {
  mode: SelectorMode;
  isStressTesting: boolean;
  stressFrequencyHz: number; // e.g. 20 Hz
  totalHeartbeats: number;
  componentRenders: Record<string, number>;
  telemetry: Record<string, SelectorTelemetry>;
  totalComputations: number;
  totalCacheHits: number;
  datasetSize: number;
}
