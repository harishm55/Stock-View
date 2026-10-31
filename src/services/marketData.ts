import { StockQuote, CandleData, MarketOverviewData } from '../types/stock.ts';

// Comprehensive baseline equities with real-world sector representation
export const INITIAL_STOCKS: StockQuote[] = [
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Technology',
    price: 138.25,
    change: 4.82,
    changePercent: 3.61,
    open: 134.10,
    previousClose: 133.43,
    dayHigh: 139.50,
    dayLow: 133.80,
    fiftyTwoWeekHigh: 153.15,
    fiftyTwoWeekLow: 75.60,
    volume: 68420000,
    avgVolume: 58200000,
    marketCap: 3380, // $3.38T
    peRatio: 52.4,
    beta: 1.68,
    dividendYield: 0.08,
    eps: 2.64,
    rsi14: 64.2,
    sma20: 133.80,
    sma50: 128.40,
    sma200: 112.50,
    exchange: 'NASDAQ',
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Technology',
    price: 232.80,
    change: 1.95,
    changePercent: 0.84,
    open: 231.20,
    previousClose: 230.85,
    dayHigh: 234.10,
    dayLow: 230.50,
    fiftyTwoWeekHigh: 237.23,
    fiftyTwoWeekLow: 164.08,
    volume: 48900000,
    avgVolume: 51200000,
    marketCap: 3520, // $3.52T
    peRatio: 34.6,
    beta: 0.94,
    dividendYield: 0.44,
    eps: 6.73,
    rsi14: 58.5,
    sma20: 228.60,
    sma50: 224.10,
    sma200: 202.40,
    exchange: 'NASDAQ',
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    sector: 'Technology',
    price: 436.50,
    change: -2.30,
    changePercent: -0.52,
    open: 439.00,
    previousClose: 438.80,
    dayHigh: 441.20,
    dayLow: 434.90,
    fiftyTwoWeekHigh: 468.35,
    fiftyTwoWeekLow: 366.50,
    volume: 21400000,
    avgVolume: 23800000,
    marketCap: 3240, // $3.24T
    peRatio: 36.1,
    beta: 0.91,
    dividendYield: 0.72,
    eps: 12.09,
    rsi14: 51.3,
    sma20: 432.40,
    sma50: 438.90,
    sma200: 418.10,
    exchange: 'NASDAQ',
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    sector: 'Consumer Cyclical',
    price: 198.40,
    change: 3.15,
    changePercent: 1.61,
    open: 196.20,
    previousClose: 195.25,
    dayHigh: 199.80,
    dayLow: 195.80,
    fiftyTwoWeekHigh: 201.20,
    fiftyTwoWeekLow: 118.35,
    volume: 38200000,
    avgVolume: 42100000,
    marketCap: 2070, // $2.07T
    peRatio: 44.8,
    beta: 1.25,
    dividendYield: 0.00,
    eps: 4.43,
    rsi14: 61.8,
    sma20: 192.50,
    sma50: 188.70,
    sma200: 174.20,
    exchange: 'NASDAQ',
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    sector: 'Communication',
    price: 172.90,
    change: 2.10,
    changePercent: 1.23,
    open: 171.10,
    previousClose: 170.80,
    dayHigh: 173.80,
    dayLow: 170.60,
    fiftyTwoWeekHigh: 191.75,
    fiftyTwoWeekLow: 120.21,
    volume: 29400000,
    avgVolume: 32600000,
    marketCap: 2150, // $2.15T
    peRatio: 23.9,
    beta: 1.05,
    dividendYield: 0.46,
    eps: 7.23,
    rsi14: 55.4,
    sma20: 169.80,
    sma50: 168.30,
    sma200: 161.40,
    exchange: 'NASDAQ',
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    sector: 'Consumer Cyclical',
    price: 254.60,
    change: 8.90,
    changePercent: 3.62,
    open: 247.50,
    previousClose: 245.70,
    dayHigh: 258.40,
    dayLow: 246.20,
    fiftyTwoWeekHigh: 271.00,
    fiftyTwoWeekLow: 138.80,
    volume: 72100000,
    avgVolume: 64900000,
    marketCap: 812, // $812B
    peRatio: 72.1,
    beta: 2.34,
    dividendYield: 0.00,
    eps: 3.53,
    rsi14: 67.9,
    sma20: 238.10,
    sma50: 226.50,
    sma200: 205.80,
    exchange: 'NASDAQ',
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'META',
    name: 'Meta Platforms, Inc.',
    sector: 'Communication',
    price: 592.30,
    change: 5.60,
    changePercent: 0.95,
    open: 588.00,
    previousClose: 586.70,
    dayHigh: 596.40,
    dayLow: 585.10,
    fiftyTwoWeekHigh: 602.95,
    fiftyTwoWeekLow: 279.40,
    volume: 14500000,
    avgVolume: 16200000,
    marketCap: 1495, // $1.49T
    peRatio: 28.5,
    beta: 1.21,
    dividendYield: 0.34,
    eps: 20.78,
    rsi14: 63.1,
    sma20: 581.40,
    sma50: 554.80,
    sma200: 489.20,
    exchange: 'NASDAQ',
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'PLTR',
    name: 'Palantir Technologies',
    sector: 'Technology',
    price: 52.80,
    change: 2.45,
    changePercent: 4.87,
    open: 50.80,
    previousClose: 50.35,
    dayHigh: 53.60,
    dayLow: 50.40,
    fiftyTwoWeekHigh: 54.20,
    fiftyTwoWeekLow: 14.48,
    volume: 85300000,
    avgVolume: 61400000,
    marketCap: 118, // $118B
    peRatio: 98.4,
    beta: 2.12,
    dividendYield: 0.00,
    eps: 0.54,
    rsi14: 73.8,
    sma20: 46.20,
    sma50: 38.90,
    sma200: 28.40,
    exchange: 'NYSE',
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'AMD',
    name: 'Advanced Micro Devices',
    sector: 'Technology',
    price: 154.20,
    change: -1.80,
    changePercent: -1.15,
    open: 156.40,
    previousClose: 156.00,
    dayHigh: 157.90,
    dayLow: 152.80,
    fiftyTwoWeekHigh: 227.30,
    fiftyTwoWeekLow: 94.04,
    volume: 36800000,
    avgVolume: 44200000,
    marketCap: 249, // $249B
    peRatio: 41.2,
    beta: 1.62,
    dividendYield: 0.00,
    eps: 3.74,
    rsi14: 48.7,
    sma20: 157.10,
    sma50: 152.40,
    sma200: 159.80,
    exchange: 'NASDAQ',
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    sector: 'Financial Services',
    price: 226.40,
    change: 1.10,
    changePercent: 0.49,
    open: 225.80,
    previousClose: 225.30,
    dayHigh: 227.80,
    dayLow: 224.90,
    fiftyTwoWeekHigh: 231.40,
    fiftyTwoWeekLow: 138.00,
    volume: 9400000,
    avgVolume: 10800000,
    marketCap: 648, // $648B
    peRatio: 12.8,
    beta: 1.08,
    dividendYield: 2.05,
    eps: 17.68,
    rsi14: 56.2,
    sma20: 223.10,
    sma50: 218.40,
    sma200: 198.60,
    exchange: 'NYSE',
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'LLY',
    name: 'Eli Lilly and Company',
    sector: 'Healthcare',
    price: 885.60,
    change: -8.40,
    changePercent: -0.94,
    open: 896.00,
    previousClose: 894.00,
    dayHigh: 902.50,
    dayLow: 881.20,
    fiftyTwoWeekHigh: 972.53,
    fiftyTwoWeekLow: 541.20,
    volume: 3100000,
    avgVolume: 3450000,
    marketCap: 841, // $841B
    peRatio: 64.8,
    beta: 0.62,
    dividendYield: 0.59,
    eps: 13.66,
    rsi14: 46.1,
    sma20: 898.20,
    sma50: 914.50,
    sma200: 824.10,
    exchange: 'NYSE',
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'XOM',
    name: 'Exxon Mobil Corporation',
    sector: 'Energy',
    price: 119.50,
    change: 0.65,
    changePercent: 0.55,
    open: 118.90,
    previousClose: 118.85,
    dayHigh: 120.40,
    dayLow: 118.50,
    fiftyTwoWeekHigh: 126.34,
    fiftyTwoWeekLow: 95.77,
    volume: 14200000,
    avgVolume: 16800000,
    marketCap: 472, // $472B
    peRatio: 14.1,
    beta: 0.74,
    dividendYield: 3.22,
    eps: 8.47,
    rsi14: 52.8,
    sma20: 118.10,
    sma50: 116.90,
    sma200: 114.20,
    exchange: 'NYSE',
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'COIN',
    name: 'Coinbase Global, Inc.',
    sector: 'Financial Services',
    price: 218.40,
    change: 9.60,
    changePercent: 4.60,
    open: 210.50,
    previousClose: 208.80,
    dayHigh: 222.10,
    dayLow: 209.20,
    fiftyTwoWeekHigh: 283.48,
    fiftyTwoWeekLow: 71.05,
    volume: 12400000,
    avgVolume: 11200000,
    marketCap: 54, // $54B
    peRatio: 42.1,
    beta: 3.15,
    dividendYield: 0.00,
    eps: 5.18,
    rsi14: 69.4,
    sma20: 198.50,
    sma50: 184.20,
    sma200: 192.60,
    exchange: 'NASDAQ',
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    sector: 'Indices',
    price: 582.40,
    change: 3.20,
    changePercent: 0.55,
    open: 580.10,
    previousClose: 579.20,
    dayHigh: 583.90,
    dayLow: 579.60,
    fiftyTwoWeekHigh: 586.20,
    fiftyTwoWeekLow: 410.07,
    volume: 52300000,
    avgVolume: 56800000,
    marketCap: 595, // $595B
    peRatio: 26.2,
    beta: 1.00,
    dividendYield: 1.22,
    eps: 22.22,
    rsi14: 61.2,
    sma20: 578.40,
    sma50: 569.20,
    sma200: 532.80,
    exchange: 'NYSE Arca',
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'QQQ',
    name: 'Invesco QQQ Trust (NASDAQ 100)',
    sector: 'Indices',
    price: 498.20,
    change: 4.60,
    changePercent: 0.93,
    open: 494.50,
    previousClose: 493.60,
    dayHigh: 500.10,
    dayLow: 493.80,
    fiftyTwoWeekHigh: 503.52,
    fiftyTwoWeekLow: 345.10,
    volume: 38400000,
    avgVolume: 43200000,
    marketCap: 290, // $290B
    peRatio: 31.4,
    beta: 1.16,
    dividendYield: 0.58,
    eps: 15.86,
    rsi14: 62.9,
    sma20: 492.10,
    sma50: 482.30,
    sma200: 450.40,
    exchange: 'NASDAQ',
    lastUpdated: new Date().toISOString()
  }
];

export const INITIAL_MARKET_OVERVIEW: MarketOverviewData = {
  indices: [
    { name: 'S&P 500', symbol: '^GSPC', price: 5832.40, change: 32.10, changePercent: 0.55 },
    { name: 'NASDAQ Comp', symbol: '^IXIC', price: 18567.20, change: 165.40, changePercent: 0.90 },
    { name: 'Dow Jones', symbol: '^DJI', price: 42350.80, change: 112.30, changePercent: 0.27 },
    { name: 'Russell 2000', symbol: '^RUT', price: 2235.10, change: 16.80, changePercent: 0.76 },
    { name: '10Y Treasury', symbol: '^TNX', price: 4.28, change: -0.04, changePercent: -0.92 },
    { name: 'VIX Volatility', symbol: '^VIX', price: 16.24, change: -0.85, changePercent: -4.97 }
  ],
  fearGreedIndex: {
    score: 68,
    rating: 'Greed'
  },
  marketSentiment: 'Bullish',
  advancersCount: 1845,
  declinersCount: 1120,
  marketStatus: 'OPEN'
};

// Generates synthetic historical candles with realistic brownian trend, volatility, and volume
export function generateCandleHistory(currentPrice: number, range: '1d' | '1w' | '1mo' | '1y' | '5y' = '1mo'): CandleData[] {
  const pointsCount = range === '1d' ? 39 : range === '1w' ? 35 : range === '1mo' ? 30 : range === '1y' ? 52 : 60;
  const candles: CandleData[] = [];
  const now = Date.now();
  
  const stepMs = range === '1d' 
    ? 10 * 60 * 1000 // 10 min
    : range === '1w'
    ? 2 * 3600 * 1000
    : range === '1mo'
    ? 24 * 3600 * 1000
    : range === '1y'
    ? 7 * 24 * 3600 * 1000
    : 30 * 24 * 3600 * 1000;

  // Work backwards from current price
  let price = currentPrice;
  const volatility = range === '1d' ? 0.004 : range === '1w' ? 0.009 : range === '1mo' ? 0.016 : 0.028;
  const tempCandles: { open: number; high: number; low: number; close: number; volume: number; timestamp: number }[] = [];

  for (let i = 0; i < pointsCount; i++) {
    const timestamp = now - (pointsCount - 1 - i) * stepMs;
    // Drift slightly upward on average
    const drift = (Math.random() - 0.48) * volatility * price;
    const open = i === 0 ? price * (1 - 0.05) : tempCandles[i - 1].close;
    const close = Math.max(1, open + drift + (Math.random() - 0.5) * volatility * price);
    const high = Math.max(open, close) + Math.random() * volatility * price * 0.8;
    const low = Math.min(open, close) - Math.random() * volatility * price * 0.8;
    const volume = Math.floor(1000000 + Math.random() * 5000000);

    tempCandles.push({ open, high, low, close, volume, timestamp });
  }

  // Adjust so last close is roughly currentPrice
  const lastIndex = tempCandles.length - 1;
  const scale = currentPrice / tempCandles[lastIndex].close;

  let smaSum20 = 0;
  let smaSum50 = 0;

  for (let i = 0; i < tempCandles.length; i++) {
    const c = tempCandles[i];
    const adjOpen = Number((c.open * scale).toFixed(2));
    const adjHigh = Number((c.high * scale).toFixed(2));
    const adjLow = Number((c.low * scale).toFixed(2));
    const adjClose = i === lastIndex ? currentPrice : Number((c.close * scale).toFixed(2));
    
    smaSum20 += adjClose;
    if (i >= 20) smaSum20 -= tempCandles[i - 20].close * scale;
    const sma20 = i >= 19 ? Number((smaSum20 / 20).toFixed(2)) : undefined;

    smaSum50 += adjClose;
    if (i >= 50) smaSum50 -= tempCandles[i - 50].close * scale;
    const sma50 = i >= 49 ? Number((smaSum50 / 50).toFixed(2)) : undefined;

    const d = new Date(c.timestamp);
    const dateStr = range === '1d' 
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString([], { month: 'short', day: 'numeric' });

    candles.push({
      timestamp: c.timestamp,
      dateStr,
      open: adjOpen,
      high: Math.max(adjHigh, adjOpen, adjClose),
      low: Math.min(adjLow, adjOpen, adjClose),
      close: adjClose,
      volume: c.volume,
      sma20,
      sma50
    });
  }

  return candles;
}
