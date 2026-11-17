import type { MarketAsset, AssetClass, RiskLevel } from '../types/market';

const ASSET_CLASSES: AssetClass[] = ['Equities', 'Crypto', 'Commodities', 'Fixed Income', 'Forex'];

const SECTORS: Record<AssetClass, string[]> = {
  Equities: ['Semiconductors', 'Cloud Computing', 'Clean Energy', 'Biotech', 'Fintech', 'Aerospace'],
  Crypto: ['Layer 1 Protocols', 'DeFi Liquidity', 'Oracle Networks', 'Zero Knowledge', 'AI Infrastructure'],
  Commodities: ['Precious Metals', 'Crude & Gas', 'Agriculture', 'Industrial Metals'],
  'Fixed Income': ['US Sovereign Debt', 'Corporate High Yield', 'Municipal Bonds', 'T-Bills'],
  Forex: ['G10 Majors', 'Emerging Markets', 'Cross Rates']
};

const SEED_DATA: Array<{ ticker: string; name: string; assetClass: AssetClass; basePrice: number }> = [
  { ticker: 'NVDA', name: 'Nvidia Corporation', assetClass: 'Equities', basePrice: 135.50 },
  { ticker: 'AAPL', name: 'Apple Inc.', assetClass: 'Equities', basePrice: 224.20 },
  { ticker: 'MSFT', name: 'Microsoft Corp', assetClass: 'Equities', basePrice: 428.80 },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', assetClass: 'Equities', basePrice: 188.40 },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', assetClass: 'Equities', basePrice: 176.30 },
  { ticker: 'TSLA', name: 'Tesla Inc.', assetClass: 'Equities', basePrice: 218.90 },
  { ticker: 'BTC', name: 'Bitcoin Network', assetClass: 'Crypto', basePrice: 91400.00 },
  { ticker: 'ETH', name: 'Ethereum Protocol', assetClass: 'Crypto', basePrice: 3380.00 },
  { ticker: 'SOL', name: 'Solana High-TPS', assetClass: 'Crypto', basePrice: 215.40 },
  { ticker: 'LINK', name: 'Chainlink Oracles', assetClass: 'Crypto', basePrice: 18.20 },
  { ticker: 'GLD', name: 'SPDR Gold Shares', assetClass: 'Commodities', basePrice: 242.10 },
  { ticker: 'SLV', name: 'iShares Silver Trust', assetClass: 'Commodities', basePrice: 28.90 },
  { ticker: 'USO', name: 'United States Oil', assetClass: 'Commodities', basePrice: 76.50 },
  { ticker: 'TLT', name: '20+ Year Treasury Bond', assetClass: 'Fixed Income', basePrice: 94.20 },
  { ticker: 'HYG', name: 'iShares High Yield Bond', assetClass: 'Fixed Income', basePrice: 78.40 },
  { ticker: 'BND', name: 'Vanguard Total Bond', assetClass: 'Fixed Income', basePrice: 72.80 },
  { ticker: 'EURUSD', name: 'Euro / US Dollar', assetClass: 'Forex', basePrice: 1.085 },
  { ticker: 'USDJPY', name: 'US Dollar / Japanese Yen', assetClass: 'Forex', basePrice: 154.2 },
  { ticker: 'GBPUSD', name: 'British Pound / US Dollar', assetClass: 'Forex', basePrice: 1.295 },
  { ticker: 'PLTR', name: 'Palantir Technologies', assetClass: 'Equities', basePrice: 62.40 },
  { ticker: 'AMD', name: 'Advanced Micro Devices', assetClass: 'Equities', basePrice: 142.10 },
  { ticker: 'AVGO', name: 'Broadcom Inc.', assetClass: 'Equities', basePrice: 165.80 },
  { ticker: 'META', name: 'Meta Platforms Inc.', assetClass: 'Equities', basePrice: 585.00 },
  { ticker: 'LLY', name: 'Eli Lilly and Co.', assetClass: 'Equities', basePrice: 840.00 },
  { ticker: 'XOM', name: 'Exxon Mobil Corp.', assetClass: 'Commodities', basePrice: 119.50 },
];

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateAssets(count: number = 250): MarketAsset[] {
  const assets: MarketAsset[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const seedItem = SEED_DATA[i % SEED_DATA.length];
    const isSynthetic = i >= SEED_DATA.length;
    const ticker = isSynthetic ? `${seedItem.ticker}-${Math.floor(i / SEED_DATA.length)}` : seedItem.ticker;
    const name = isSynthetic ? `${seedItem.name} Series ${Math.floor(i / SEED_DATA.length)}` : seedItem.name;
    const assetClass = isSynthetic ? ASSET_CLASSES[i % ASSET_CLASSES.length] : seedItem.assetClass;
    const sectors = SECTORS[assetClass];
    const sector = sectors[i % sectors.length];

    const rnd = pseudoRandom(i + 42);
    const priceVariance = (pseudoRandom(i * 3 + 7) - 0.5) * 0.2;
    const price = Number(Math.max(0.1, seedItem.basePrice * (1 + priceVariance)).toFixed(2));
    const change24h = Number(((pseudoRandom(i * 7 + 13) - 0.48) * 16).toFixed(2));
    const volume24h = Math.floor(100000 + pseudoRandom(i * 11 + 3) * 50000000);
    const marketCap = volume24h * Math.floor(10 + pseudoRandom(i * 5 + 9) * 40);

    // Some assets are in user's portfolio holdings
    const hasHolding = i % 3 === 0;
    const holdingQuantity = hasHolding ? Math.floor(10 + pseudoRandom(i * 13 + 17) * 400) : 0;
    const holdingValue = Number((holdingQuantity * price).toFixed(2));
    const unrealizedPnL = hasHolding
      ? Number((holdingValue * (change24h / 100) * (pseudoRandom(i * 19 + 23) + 0.5)).toFixed(2))
      : 0;

    let riskLevel: RiskLevel = 'Low';
    if (assetClass === 'Crypto') {
      riskLevel = rnd > 0.4 ? 'Speculative' : 'High';
    } else if (assetClass === 'Commodities' || assetClass === 'Forex') {
      riskLevel = rnd > 0.5 ? 'Moderate' : 'High';
    } else if (assetClass === 'Fixed Income') {
      riskLevel = rnd > 0.8 ? 'Moderate' : 'Low';
    } else {
      riskLevel = rnd > 0.6 ? 'High' : rnd > 0.3 ? 'Moderate' : 'Low';
    }

    // Sparkline history (8 data points)
    const sparkline: number[] = [];
    let p = price * 0.95;
    for (let s = 0; s < 8; s++) {
      p = p * (1 + (pseudoRandom(i * 31 + s * 17) - 0.49) * 0.04);
      sparkline.push(Number(p.toFixed(2)));
    }
    sparkline.push(price);

    assets.push({
      id: `asset-${i + 1}`,
      ticker,
      name,
      assetClass,
      price,
      change24h,
      volume24h,
      marketCap,
      holdingQuantity,
      holdingValue,
      unrealizedPnL,
      riskLevel,
      sector,
      sparkline,
      lastUpdated: now,
    });
  }

  return assets;
}
