import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_STOCKS, INITIAL_MARKET_OVERVIEW, generateCandleHistory } from './src/services/marketData.ts';
import { StockQuote, AIInvestmentAnalysis } from './src/types/stock.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// In-memory live stock state
let liveStocks: StockQuote[] = JSON.parse(JSON.stringify(INITIAL_STOCKS));
let marketOverview = { ...INITIAL_MARKET_OVERVIEW };

// Cache for AI analyses to prevent redundant API calls
const aiAnalysisCache: Record<string, { analysis: AIInvestmentAnalysis; timestamp: number }> = {};

// Helper: Real-time price micro-tick simulation
function updateMicroTicks() {
  liveStocks = liveStocks.map(stock => {
    // 70% chance of small tick
    if (Math.random() > 0.3) {
      const volatility = (stock.beta || 1.0) * 0.0008;
      const deltaPercent = (Math.random() - 0.495) * volatility;
      const newPrice = Number(Math.max(1, stock.price * (1 + deltaPercent)).toFixed(2));
      const priceDelta = Number((newPrice - stock.previousClose).toFixed(2));
      const changePercent = Number(((priceDelta / stock.previousClose) * 100).toFixed(2));
      const dayHigh = Number(Math.max(stock.dayHigh, newPrice).toFixed(2));
      const dayLow = Number(Math.min(stock.dayLow, newPrice).toFixed(2));
      const volumeDelta = Math.floor(Math.random() * 8000 + 500);

      return {
        ...stock,
        price: newPrice,
        change: priceDelta,
        changePercent,
        dayHigh,
        dayLow,
        volume: stock.volume + volumeDelta,
        lastUpdated: new Date().toISOString()
      };
    }
    return stock;
  });

  // Also slightly tick indices
  marketOverview.indices = marketOverview.indices.map(idx => {
    const delta = (Math.random() - 0.49) * 0.0004 * idx.price;
    const newPrice = Number((idx.price + delta).toFixed(2));
    const newChange = Number((idx.change + delta).toFixed(2));
    const newChangePct = Number(((newChange / (newPrice - newChange)) * 100).toFixed(2));
    return {
      ...idx,
      price: newPrice,
      change: newChange,
      changePercent: newChangePct
    };
  });
}

// Tick periodically
setInterval(updateMicroTicks, 2000);

// Attempt fetching live data from Yahoo Finance free endpoint
async function fetchYahooQuote(symbol: string): Promise<Partial<StockQuote> | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(3500)
    });

    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result || !result.meta) return null;

    const meta = result.meta;
    const price = meta.regularMarketPrice ?? meta.chartPreviousClose;
    const previousClose = meta.chartPreviousClose ?? price;
    const change = Number((price - previousClose).toFixed(2));
    const changePercent = Number(((change / previousClose) * 100).toFixed(2));

    return {
      symbol: meta.symbol,
      price,
      change,
      changePercent,
      dayHigh: meta.regularMarketDayHigh ?? price,
      dayLow: meta.regularMarketDayLow ?? price,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? price * 1.25,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? price * 0.75,
      previousClose,
      volume: meta.regularMarketVolume ?? 10000000,
      exchange: meta.exchangeName ?? 'US',
      lastUpdated: new Date().toISOString()
    };
  } catch {
    return null;
  }
}

// Fetch historical candles from Yahoo Finance with fallback
async function fetchYahooHistory(symbol: string, range: '1d' | '1w' | '1mo' | '1y' | '5y') {
  try {
    const intervalMap = {
      '1d': '5m',
      '1w': '30m',
      '1mo': '1d',
      '1y': '1wk',
      '5y': '1mo'
    };
    const interval = intervalMap[range] || '1d';
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(4000)
    });

    if (!res.ok) throw new Error('Yahoo chart error');
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result || !result.timestamp) throw new Error('No candle data');

    const timestamps: number[] = result.timestamp;
    const quote = result.indicators?.quote?.[0];
    if (!quote) throw new Error('No quote indicator');

    const candles = timestamps.map((ts, i) => {
      const open = quote.open?.[i] ?? 0;
      const high = quote.high?.[i] ?? open;
      const low = quote.low?.[i] ?? open;
      const close = quote.close?.[i] ?? open;
      const volume = quote.volume?.[i] ?? 0;
      const d = new Date(ts * 1000);
      const dateStr = range === '1d'
        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString([], { month: 'short', day: 'numeric' });

      return {
        timestamp: ts * 1000,
        dateStr,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume
      };
    }).filter(c => c.open > 0 && c.close > 0);

    if (candles.length > 5) {
      // Calculate 20 and 50 SMA
      let sum20 = 0;
      let sum50 = 0;
      for (let i = 0; i < candles.length; i++) {
        sum20 += candles[i].close;
        if (i >= 20) sum20 -= candles[i - 20].close;
        (candles[i] as any).sma20 = i >= 19 ? Number((sum20 / 20).toFixed(2)) : undefined;

        sum50 += candles[i].close;
        if (i >= 50) sum50 -= candles[i - 50].close;
        (candles[i] as any).sma50 = i >= 49 ? Number((sum50 / 50).toFixed(2)) : undefined;
      }
      return candles;
    }
    throw new Error('Not enough candles');
  } catch {
    // Graceful fallback to synthetic high-precision candles
    const currentStock = liveStocks.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
    const price = currentStock ? currentStock.price : 150.00;
    return generateCandleHistory(price, range);
  }
}

// API Routes

// 1. Get all tracked stocks
app.get('/api/stocks', (_req, res) => {
  res.json({
    stocks: liveStocks,
    count: liveStocks.length,
    timestamp: new Date().toISOString()
  });
});

// 2. Get single stock quote with optional live Yahoo refresh
app.get('/api/stocks/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  let stock = liveStocks.find(s => s.symbol.toUpperCase() === symbol);

  if (!stock) {
    // If not in baseline, query Yahoo Finance dynamically!
    const yahooQuote = await fetchYahooQuote(symbol);
    if (yahooQuote && yahooQuote.price) {
      const newStock: StockQuote = {
        symbol,
        name: yahooQuote.symbol || symbol,
        sector: 'Technology',
        price: yahooQuote.price,
        change: yahooQuote.change || 0,
        changePercent: yahooQuote.changePercent || 0,
        open: yahooQuote.previousClose || yahooQuote.price,
        previousClose: yahooQuote.previousClose || yahooQuote.price,
        dayHigh: yahooQuote.dayHigh || yahooQuote.price,
        dayLow: yahooQuote.dayLow || yahooQuote.price,
        fiftyTwoWeekHigh: yahooQuote.fiftyTwoWeekHigh || yahooQuote.price * 1.3,
        fiftyTwoWeekLow: yahooQuote.fiftyTwoWeekLow || yahooQuote.price * 0.7,
        volume: yahooQuote.volume || 5000000,
        avgVolume: yahooQuote.volume || 5000000,
        marketCap: Number(((yahooQuote.price * 1000000000) / 1e9).toFixed(1)),
        peRatio: 28.5,
        beta: 1.15,
        dividendYield: 0.5,
        eps: Number((yahooQuote.price / 25).toFixed(2)),
        rsi14: 55.0,
        sma20: Number((yahooQuote.price * 0.98).toFixed(2)),
        sma50: Number((yahooQuote.price * 0.95).toFixed(2)),
        sma200: Number((yahooQuote.price * 0.90).toFixed(2)),
        exchange: yahooQuote.exchange || 'US',
        lastUpdated: new Date().toISOString()
      };
      liveStocks.push(newStock);
      stock = newStock;
    }
  }

  if (!stock) {
    return res.status(404).json({ error: `Stock symbol ${symbol} not found.` });
  }

  res.json({ stock });
});

// 3. Get historical candles for charting & 3D candlestick corridor
app.get('/api/stocks/:symbol/history', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const range = (req.query.range as '1d' | '1w' | '1mo' | '1y' | '5y') || '1mo';
  
  const candles = await fetchYahooHistory(symbol, range);
  res.json({
    symbol,
    range,
    candles,
    count: candles.length
  });
});

// 4. Market overview & Indices
app.get('/api/market/overview', (_req, res) => {
  res.json(marketOverview);
});

// 5. AI Investment Analysis endpoint
app.post('/api/ai/analyze', async (req, res) => {
  const { symbol, userQuery } = req.body;
  if (!symbol) {
    return res.status(400).json({ error: 'Stock symbol is required.' });
  }

  const stock = liveStocks.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
  if (!stock) {
    return res.status(404).json({ error: 'Stock not found' });
  }

  // Check cache (valid for 10 minutes if no custom query)
  const cacheKey = `${symbol.toUpperCase()}_${userQuery || 'default'}`;
  const cached = aiAnalysisCache[cacheKey];
  if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
    return res.json({ analysis: cached.analysis, cached: true });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable not configured.');
    }

    const ai = new GoogleGenAI();
    
    const prompt = `
You are a senior Wall Street quantitative equity research analyst and portfolio strategist at an institutional fund.
Analyze this asset for an investor seeking real-time decision-making intelligence:

Asset Details:
- Symbol: ${stock.symbol} (${stock.name})
- Sector: ${stock.sector} | Exchange: ${stock.exchange}
- Current Real-Time Price: $${stock.price}
- Today's Change: ${stock.change >= 0 ? '+' : ''}${stock.change} (${stock.changePercent}%)
- 52-Week Range: $${stock.fiftyTwoWeekLow} - $${stock.fiftyTwoWeekHigh}
- Market Cap: $${stock.marketCap}B | P/E Ratio: ${stock.peRatio} | EPS: $${stock.eps}
- Beta: ${stock.beta} | 14-Day RSI: ${stock.rsi14}
- Key SMAs: SMA20: $${stock.sma20}, SMA50: $${stock.sma50}, SMA200: $${stock.sma200}
${userQuery ? `Investor Specific Question: "${userQuery}"` : ''}

Provide your analysis in the following strict JSON format ONLY without any markdown code fence wrappers or backticks.
{
  "symbol": "${stock.symbol}",
  "companyName": "${stock.name}",
  "recommendation": "Strong Buy" | "Buy" | "Hold" | "Underperform" | "Sell",
  "confidenceScore": <integer 0 to 100>,
  "valuationStatus": "Undervalued" | "Fair Value" | "Overvalued" | "Premium Growth",
  "executiveSummary": "<2-3 sentences crisp institutional thesis summing up risk/reward>",
  "targetPrice": {
    "bear": <realistic 12-month downside target number>,
    "base": <realistic 12-month base target number>,
    "bull": <realistic 12-month upside target number>,
    "currentPrice": ${stock.price},
    "upsidePercent": <percentage upside from currentPrice to base target, e.g. 14.5>
  },
  "bullThesis": [
    "<Key fundamental driver 1>",
    "<Key fundamental driver 2>",
    "<Key fundamental driver 3>"
  ],
  "bearRisks": [
    "<Downside risk or headwind 1>",
    "<Downside risk or headwind 2>",
    "<Downside risk or headwind 3>"
  ],
  "technicalOutlook": {
    "trend": "Strong Uptrend" | "Bullish Consolidation" | "Neutral" | "Bearish Breakdown" | "Oversold Bounce Candidate",
    "rsiAssessment": "<brief sentence interpreting RSI at ${stock.rsi14}>",
    "supportLevel": <key support price number>,
    "resistanceLevel": <key resistance price number>,
    "momentum": "High Positive" | "Moderate Positive" | "Neutral" | "Negative"
  },
  "keyCatalysts": [
    "<Upcoming earnings or product release catalyst 1>",
    "<Macro or industry regulatory catalyst 2>"
  ],
  "disclaimer": "Institutional simulation for informational decision support. Not certified financial advice."
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '';
    // Clean potential markdown wrap if any
    const cleanJson = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const parsed: AIInvestmentAnalysis = JSON.parse(cleanJson);
    parsed.generatedAt = new Date().toISOString();

    aiAnalysisCache[cacheKey] = {
      analysis: parsed,
      timestamp: Date.now()
    };

    return res.json({ analysis: parsed, cached: false });
  } catch (error: any) {
    console.error('AI Analysis failed, falling back to algorithmic analysis:', error);

    // Algorithmic fallback analysis if Gemini key is missing or network times out
    const isBullish = stock.rsi14 < 70 && stock.price > stock.sma50;
    const upside = isBullish ? 16.5 : -4.2;
    const baseTarget = Number((stock.price * (1 + upside / 100)).toFixed(2));
    const fallback: AIInvestmentAnalysis = {
      symbol: stock.symbol,
      companyName: stock.name,
      recommendation: isBullish ? (stock.rsi14 > 60 ? 'Strong Buy' : 'Buy') : 'Hold',
      confidenceScore: isBullish ? 82 : 65,
      valuationStatus: stock.peRatio > 45 ? 'Premium Growth' : stock.peRatio < 20 ? 'Undervalued' : 'Fair Value',
      executiveSummary: `${stock.name} demonstrates ${isBullish ? 'resilient upside momentum' : 'consolidative trade ranges'} with price trading at $${stock.price}. RSI of ${stock.rsi14} suggests ${stock.rsi14 > 70 ? 'overbought levels warranting pullbacks' : stock.rsi14 < 35 ? 'deeply oversold bounce conditions' : 'balanced accumulation'}.`,
      targetPrice: {
        bear: Number((stock.price * 0.84).toFixed(2)),
        base: baseTarget,
        bull: Number((stock.price * 1.28).toFixed(2)),
        currentPrice: stock.price,
        upsidePercent: upside
      },
      bullThesis: [
        `Dominant competitive position in ${stock.sector} with expanding margins`,
        `Robust institutional support with price holding above 50-day moving average ($${stock.sma50})`,
        `Favorable risk/reward profile into upcoming corporate quarterly earnings`
      ],
      bearRisks: [
        `Macro interest rate sensitivity and broad market equity volatility`,
        `Valuation compression risk if forward growth expectations decelerate`,
        `Technical overhead resistance near 52-week peak ($${stock.fiftyTwoWeekHigh})`
      ],
      technicalOutlook: {
        trend: isBullish ? 'Strong Uptrend' : 'Bullish Consolidation',
        rsiAssessment: `RSI-14 at ${stock.rsi14} indicates ${stock.rsi14 > 60 ? 'healthy buyer control' : 'neutral momentum'} without extreme exhaustion.`,
        supportLevel: stock.sma50,
        resistanceLevel: stock.fiftyTwoWeekHigh,
        momentum: isBullish ? 'High Positive' : 'Neutral'
      },
      keyCatalysts: [
        'Upcoming quarterly earnings announcement and forward fiscal year guidance',
        'Industry macro conferences and enterprise customer adoption metrics'
      ],
      disclaimer: 'Institutional simulation for informational decision support. Not certified financial advice.',
      generatedAt: new Date().toISOString()
    };

    return res.json({ analysis: fallback, cached: false, fallback: true });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`ApexPulse Financial Engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
