export type AssetClass = 'Equities' | 'Crypto' | 'Commodities' | 'Fixed Income' | 'Forex';

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Speculative';

export interface MarketAsset {
  id: string;
  ticker: string;
  name: string;
  assetClass: AssetClass;
  price: number;
  change24h: number; // percentage
  volume24h: number; // in USD
  marketCap: number; // in USD
  holdingQuantity: number;
  holdingValue: number; // price * holdingQuantity
  unrealizedPnL: number;
  riskLevel: RiskLevel;
  sector: string;
  sparkline: number[];
  lastUpdated: number;
}

export interface FilterState {
  searchQuery: string;
  assetClass: AssetClass | 'All';
  riskLevel: RiskLevel | 'All';
  minReturn?: number;
  onlyHoldings: boolean;
}

export interface SortState {
  field: keyof MarketAsset;
  direction: 'asc' | 'desc';
}

export interface PortfolioKPIs {
  totalAUM: number;
  totalUnrealizedPnL: number;
  totalPnLPercentage: number;
  weightedDailyReturn: number;
  valueAtRisk95: number;
  estimatedSharpeRatio: number;
  holdingCount: number;
  topPerformer: { ticker: string; change: number } | null;
  worstPerformer: { ticker: string; change: number } | null;
}

export interface SectorAllocation {
  sector: string;
  value: number;
  percentage: number;
  color: string;
}

export interface RiskDistribution {
  level: RiskLevel;
  count: number;
  value: number;
  percentage: number;
  color: string;
}
