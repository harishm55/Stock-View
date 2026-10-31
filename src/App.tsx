/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  StockQuote, 
  CandleData, 
  MarketOverviewData, 
  AIInvestmentAnalysis, 
  PortfolioPosition, 
  SceneMode, 
  HeightMetric 
} from './types/stock.ts';
import { INITIAL_STOCKS, INITIAL_MARKET_OVERVIEW, generateCandleHistory } from './services/marketData.ts';
import { MarketSkylineScene } from './components/scene/MarketSkylineScene.tsx';
import { ControlOverlay } from './components/scene/ControlOverlay.tsx';
import { Header } from './components/layout/Header.tsx';
import { StockDetailPanel } from './components/dashboard/StockDetailPanel.tsx';
import { PortfolioModal } from './components/portfolio/PortfolioModal.tsx';
import { StockTableView } from './components/dashboard/StockTableView.tsx';
import { Layers, Activity, Sparkles, Eye, Info } from 'lucide-react';

export default function App() {
  // Real-time market state
  const [stocks, setStocks] = useState<StockQuote[]>(INITIAL_STOCKS);
  const [marketOverview, setMarketOverview] = useState<MarketOverviewData>(INITIAL_MARKET_OVERVIEW);
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(INITIAL_STOCKS[0]);
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [timeframe, setTimeframe] = useState<'1d' | '1w' | '1mo' | '1y' | '5y'>('1mo');

  // 3D Scene Controls State
  const [sceneMode, setSceneMode] = useState<SceneMode>('skyline');
  const [heightMetric, setHeightMetric] = useState<HeightMetric>('marketCap');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  const [cameraPreset, setCameraPreset] = useState<'overview' | 'top' | 'focus' | 'cinematic'>('overview');
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);

  // View Mode: '3d' or 'table'
  const [viewMode, setViewMode] = useState<'3d' | 'table'>('3d');
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState<boolean>(true);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState<boolean>(false);

  // AI Investment Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<AIInvestmentAnalysis | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  // Portfolio & Watchlist State (Persisted in localStorage)
  const [positions, setPositions] = useState<PortfolioPosition[]>(() => {
    try {
      const saved = localStorage.getItem('apex_portfolio');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Initial starter positions
    return [
      {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        shares: 25,
        averageBuyPrice: 124.50,
        currentPrice: 138.25,
        totalCost: 3112.50,
        currentValue: 3456.25,
        unrealizedPnL: 343.75,
        unrealizedPnLPercent: 11.04,
        sector: 'Technology'
      },
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        shares: 15,
        averageBuyPrice: 220.00,
        currentPrice: 232.80,
        totalCost: 3300.00,
        currentValue: 3492.00,
        unrealizedPnL: 192.00,
        unrealizedPnLPercent: 5.82,
        sector: 'Technology'
      }
    ];
  });

  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('apex_watchlist');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['NVDA', 'AAPL', 'TSLA', 'PLTR', 'SPY'];
  });

  // Save portfolio to local storage
  useEffect(() => {
    try {
      localStorage.setItem('apex_portfolio', JSON.stringify(positions));
    } catch {}
  }, [positions]);

  // Save watchlist to local storage
  useEffect(() => {
    try {
      localStorage.setItem('apex_watchlist', JSON.stringify(watchlistSymbols));
    } catch {}
  }, [watchlistSymbols]);

  // Fetch real-time stocks & overview from backend API
  const fetchMarketData = useCallback(async () => {
    try {
      const [stocksRes, overviewRes] = await Promise.all([
        fetch('/api/stocks'),
        fetch('/api/market/overview')
      ]);

      if (stocksRes.ok) {
        const stocksData = await stocksRes.json();
        if (stocksData.stocks) {
          setStocks(stocksData.stocks);
          // Keep selected stock quote in sync, merging any newly fetched details
          if (selectedStock) {
            const updated = stocksData.stocks.find((s: StockQuote) => s.symbol === selectedStock.symbol);
            if (updated) {
              setSelectedStock(prev => ({ ...prev, ...updated }));
            }
          }
        }
      }

      if (overviewRes.ok) {
        const overviewData = await overviewRes.json();
        setMarketOverview(overviewData);
      }
    } catch {
      // In offline/dev environment, fallback smoothly
    }
  }, [selectedStock?.symbol]);

  // Initial load and periodic polling every 2.5s for real-time live data
  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 2500);
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  // Fetch historical candle data whenever selectedStock or timeframe changes
  useEffect(() => {
    if (!selectedStock) return;

    let isMounted = true;
    async function loadCandles() {
      try {
        const res = await fetch(`/api/stocks/${selectedStock?.symbol}/history?range=${timeframe}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.candles) {
            setCandles(data.candles);
            return;
          }
        }
      } catch {}

      // Fallback
      if (isMounted && selectedStock) {
        setCandles(generateCandleHistory(selectedStock.price, timeframe));
      }
    }

    loadCandles();
    return () => { isMounted = false; };
  }, [selectedStock?.symbol, timeframe]);

  // Request AI Investment Analysis from backend
  const runAiAnalysis = useCallback(async (userQuery?: string) => {
    if (!selectedStock) return;
    setIsLoadingAi(true);

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedStock.symbol,
          userQuery
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.analysis) {
          setAiAnalysis(data.analysis);
          return;
        }
      }
    } catch {}

    // Algorithmic local fallback if network fails
    const isBullish = selectedStock.rsi14 < 70 && selectedStock.price > selectedStock.sma50;
    const upside = isBullish ? 15.2 : -3.5;
    setAiAnalysis({
      symbol: selectedStock.symbol,
      companyName: selectedStock.name,
      recommendation: isBullish ? 'Buy' : 'Hold',
      confidenceScore: isBullish ? 84 : 62,
      valuationStatus: selectedStock.peRatio > 45 ? 'Premium Growth' : 'Fair Value',
      executiveSummary: `${selectedStock.name} exhibits steady trading liquidity at $${selectedStock.price}. Technical RSI of ${selectedStock.rsi14} indicates balanced institutional order flow with critical support at $${selectedStock.sma50}.`,
      targetPrice: {
        bear: Number((selectedStock.price * 0.85).toFixed(2)),
        base: Number((selectedStock.price * (1 + upside / 100)).toFixed(2)),
        bull: Number((selectedStock.price * 1.25).toFixed(2)),
        currentPrice: selectedStock.price,
        upsidePercent: upside
      },
      bullThesis: [
        `Leadership in ${selectedStock.sector} sector with sustained gross margins`,
        `Solid price consolidation above 50-day moving average ($${selectedStock.sma50})`,
        `Resilient free cash flow conversion and long-term enterprise demand`
      ],
      bearRisks: [
        `Broad macro yield sensitivity and market multiple compression`,
        `Near-term resistance approaching 52-week high ($${selectedStock.fiftyTwoWeekHigh})`,
        `Supply chain or regulatory headwinds in global operations`
      ],
      technicalOutlook: {
        trend: isBullish ? 'Strong Uptrend' : 'Bullish Consolidation',
        rsiAssessment: `14-Day RSI at ${selectedStock.rsi14} signals neutral-to-positive momentum.`,
        supportLevel: selectedStock.sma50,
        resistanceLevel: selectedStock.fiftyTwoWeekHigh,
        momentum: isBullish ? 'High Positive' : 'Neutral'
      },
      keyCatalysts: [
        'Upcoming quarterly financial release and corporate management briefing',
        'Industry strategic symposium showcasing latest technological products'
      ],
      disclaimer: 'Institutional simulation for informational decision support. Not certified financial advice.',
      generatedAt: new Date().toISOString()
    });

    setIsLoadingAi(false);
  }, [selectedStock]);

  // Trigger analysis when stock changes
  useEffect(() => {
    if (selectedStock) {
      runAiAnalysis();
    }
  }, [selectedStock?.symbol]);

  // Update position values when live prices change
  useEffect(() => {
    setPositions(prev =>
      prev.map(pos => {
        const live = stocks.find(s => s.symbol === pos.symbol);
        const currentPrice = live ? live.price : pos.currentPrice;
        const currentValue = pos.shares * currentPrice;
        const unrealizedPnL = currentValue - pos.totalCost;
        const unrealizedPnLPercent = pos.totalCost > 0 ? (unrealizedPnL / pos.totalCost) * 100 : 0;
        return {
          ...pos,
          currentPrice,
          currentValue,
          unrealizedPnL,
          unrealizedPnLPercent
        };
      })
    );
  }, [stocks]);

  // Handlers for Portfolio
  const handleAddToPortfolio = (stock: StockQuote, shares: number) => {
    setPositions(prev => {
      const existing = prev.find(p => p.symbol === stock.symbol);
      if (existing) {
        const totalShares = existing.shares + shares;
        const newCost = existing.totalCost + (shares * stock.price);
        const avgPrice = newCost / totalShares;
        const currentValue = totalShares * stock.price;
        return prev.map(p =>
          p.symbol === stock.symbol
            ? {
                ...p,
                shares: totalShares,
                averageBuyPrice: avgPrice,
                totalCost: newCost,
                currentPrice: stock.price,
                currentValue,
                unrealizedPnL: currentValue - newCost,
                unrealizedPnLPercent: ((currentValue - newCost) / newCost) * 100
              }
            : p
        );
      } else {
        const cost = shares * stock.price;
        const newPos: PortfolioPosition = {
          symbol: stock.symbol,
          name: stock.name,
          shares,
          averageBuyPrice: stock.price,
          currentPrice: stock.price,
          totalCost: cost,
          currentValue: cost,
          unrealizedPnL: 0,
          unrealizedPnLPercent: 0,
          sector: stock.sector
        };
        return [...prev, newPos];
      }
    });
  };

  const handleRemovePosition = (symbol: string) => {
    setPositions(prev => prev.filter(p => p.symbol !== symbol));
  };

  // Watchlist handlers
  const handleToggleWatchlist = (stock: StockQuote) => {
    setWatchlistSymbols(prev =>
      prev.includes(stock.symbol)
        ? prev.filter(s => s !== stock.symbol)
        : [...prev, stock.symbol]
    );
  };

  const handleSelectStock = (stock: StockQuote) => {
    setSelectedStock(stock);
    setIsDetailPanelOpen(true);
    setCameraPreset('focus');
  };

  const handleSwitchTo3D = (stock: StockQuote) => {
    setSelectedStock(stock);
    setViewMode('3d');
    setIsDetailPanelOpen(true);
    setCameraPreset('focus');
  };

  // Portfolio totals
  const portfolioTotalValue = positions.reduce((acc, p) => acc + p.currentValue, 0);
  const portfolioTotalCost = positions.reduce((acc, p) => acc + p.totalCost, 0);
  const portfolioTotalPnL = portfolioTotalValue - portfolioTotalCost;
  const portfolioPnLPct = portfolioTotalCost > 0 ? (portfolioTotalPnL / portfolioTotalCost) * 100 : 0;

  const watchlistStocks = stocks.filter(s => watchlistSymbols.includes(s.symbol));

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#060a12] text-slate-100 flex flex-col font-sans select-none">
      
      {/* Top Header & Real-Time Marquee */}
      <Header
        overview={marketOverview}
        stocks={stocks}
        selectedStock={selectedStock}
        onSelectStock={handleSelectStock}
        onOpenPortfolio={() => setIsPortfolioOpen(true)}
        portfolioTotalValue={portfolioTotalValue}
        portfolioTotalPnL={portfolioTotalPnL}
        portfolioPnLPct={portfolioPnLPct}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Main Content Area */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        
        {viewMode === '3d' ? (
          <>
            {/* Stable Three.js 3D Viewport container */}
            <MarketSkylineScene
              stocks={stocks}
              selectedStock={selectedStock}
              onSelectStock={handleSelectStock}
              sceneMode={sceneMode}
              heightMetric={heightMetric}
              sectorFilter={sectorFilter}
              candles={candles}
              cameraPreset={cameraPreset}
              isAutoRotate={isAutoRotate}
            />

            {/* Top-Left Minimal Spec Badge (as required in 3D UX layout diagram) */}
            <div className="absolute top-24 left-5 z-20 pointer-events-none hidden sm:block">
              <div className="bg-[#0b111e]/90 border border-slate-800/80 rounded-xl px-3.5 py-2 shadow-xl pointer-events-auto">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <span className="text-xs font-mono font-bold text-white tracking-wide">
                    {sceneMode === 'skyline' ? '3D CAPITAL SKYLINE' : sceneMode === 'corridor' ? `3D CORRIDOR: ${selectedStock?.symbol}` : '3D BETA RISK ORBIT'}
                  </span>
                  <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                    {stocks.length} EQUITIES
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  Click any monolith to inspect • Drag to Orbit • Scroll to Zoom
                </div>
              </div>
            </div>

            {/* Slide-out Re-open Button if Detail Panel is closed */}
            {!isDetailPanelOpen && selectedStock && (
              <button
                onClick={() => setIsDetailPanelOpen(true)}
                className="fixed top-24 right-5 z-30 flex items-center gap-2 px-3.5 py-2 bg-[#0b111e] hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-semibold text-white shadow-2xl transition-all"
              >
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Open {selectedStock.symbol} Intelligence</span>
              </button>
            )}

            {/* Collapsible Unified Bottom Control Dock (Pinned to bottom center <= 15% viewport) */}
            <ControlOverlay
              sceneMode={sceneMode}
              setSceneMode={setSceneMode}
              heightMetric={heightMetric}
              setHeightMetric={setHeightMetric}
              sectorFilter={sectorFilter}
              setSectorFilter={setSectorFilter}
              cameraPreset={cameraPreset}
              setCameraPreset={setCameraPreset}
              isAutoRotate={isAutoRotate}
              setIsAutoRotate={setIsAutoRotate}
              selectedStockSymbol={selectedStock?.symbol}
            />

            {/* Stock Detail & AI Investment Intelligence Panel */}
            {isDetailPanelOpen && selectedStock && (
              <StockDetailPanel
                stock={selectedStock}
                onClose={() => setIsDetailPanelOpen(false)}
                candles={candles}
                timeframe={timeframe}
                setTimeframe={setTimeframe}
                onAddToPortfolio={handleAddToPortfolio}
                isWatchlisted={watchlistSymbols.includes(selectedStock.symbol)}
                onToggleWatchlist={handleToggleWatchlist}
                aiAnalysis={aiAnalysis}
                isLoadingAi={isLoadingAi}
                onRunAiAnalysis={runAiAnalysis}
              />
            )}
          </>
        ) : (
          /* 2D Multi-Column Financial Table View */
          <div className="w-full h-full overflow-y-auto">
            <StockTableView
              stocks={stocks}
              selectedStock={selectedStock}
              onSelectStock={handleSelectStock}
              onSwitchTo3D={handleSwitchTo3D}
            />
            {isDetailPanelOpen && selectedStock && (
              <StockDetailPanel
                stock={selectedStock}
                onClose={() => setIsDetailPanelOpen(false)}
                candles={candles}
                timeframe={timeframe}
                setTimeframe={setTimeframe}
                onAddToPortfolio={handleAddToPortfolio}
                isWatchlisted={watchlistSymbols.includes(selectedStock.symbol)}
                onToggleWatchlist={handleToggleWatchlist}
                aiAnalysis={aiAnalysis}
                isLoadingAi={isLoadingAi}
                onRunAiAnalysis={runAiAnalysis}
              />
            )}
          </div>
        )}

      </main>

      {/* Portfolio & Watchlist Modal */}
      <PortfolioModal
        isOpen={isPortfolioOpen}
        onClose={() => setIsPortfolioOpen(false)}
        positions={positions}
        onRemovePosition={handleRemovePosition}
        onAddPosition={handleAddToPortfolio}
        watchlist={watchlistStocks}
        onSelectStock={handleSelectStock}
        onRemoveFromWatchlist={handleToggleWatchlist as any}
      />

    </div>
  );
}
