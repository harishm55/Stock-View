export interface StockQuote {
  symbol: string;
  name: string;
  sector: 'Technology' | 'Financial Services' | 'Consumer Cyclical' | 'Communication' | 'Healthcare' | 'Energy' | 'Indices';
  price: number;
  change: number;
  changePercent: number;
  open: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  volume: number;
  avgVolume: number;
  marketCap: number; // in billions
  peRatio: number;
  beta: number;
  dividendYield: number; // in percent
  eps: number;
  rsi14: number;
  sma20: number;
  sma50: number;
  sma200: number;
  exchange: string;
  lastUpdated: string;
}

export interface CandleData {
  timestamp: number;
  dateStr: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma20?: number;
  sma50?: number;
}

export interface AIInvestmentAnalysis {
  symbol: string;
  companyName: string;
  recommendation: 'Strong Buy' | 'Buy' | 'Hold' | 'Underperform' | 'Sell';
  confidenceScore: number; // 0 - 100
  valuationStatus: 'Undervalued' | 'Fair Value' | 'Overvalued' | 'Premium Growth';
  executiveSummary: string;
  targetPrice: {
    bear: number;
    base: number;
    bull: number;
    currentPrice: number;
    upsidePercent: number;
  };
  bullThesis: string[];
  bearRisks: string[];
  technicalOutlook: {
    trend: 'Strong Uptrend' | 'Bullish Consolidation' | 'Neutral' | 'Bearish Breakdown' | 'Oversold Bounce Candidate';
    rsiAssessment: string;
    supportLevel: number;
    resistanceLevel: number;
    momentum: 'High Positive' | 'Moderate Positive' | 'Neutral' | 'Negative';
  };
  keyCatalysts: string[];
  disclaimer: string;
  generatedAt: string;
}

export interface MarketIndex {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface MarketOverviewData {
  indices: MarketIndex[];
  fearGreedIndex: {
    score: number; // 0-100
    rating: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  };
  marketSentiment: 'Bullish' | 'Neutral' | 'Cautious';
  advancersCount: number;
  declinersCount: number;
  marketStatus: 'OPEN' | 'PRE-MARKET' | 'AFTER-HOURS' | 'WEEKEND/CLOSED';
}

export interface PortfolioPosition {
  symbol: string;
  name: string;
  shares: number;
  averageBuyPrice: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  sector: string;
}

export type SceneMode = 'skyline' | 'corridor' | 'orbit';
export type HeightMetric = 'marketCap' | 'volume' | 'changePercent' | 'peRatio';
