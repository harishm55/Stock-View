import React, { useState } from 'react';
import { StockQuote, CandleData, AIInvestmentAnalysis } from '../../types/stock.ts';
import { StockChart } from './StockChart.tsx';
import { 
  X, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  CheckCircle2, 
  Target, 
  Activity, 
  BrainCircuit, 
  Plus, 
  ArrowUpRight, 
  Send, 
  RefreshCw,
  Sliders,
  DollarSign,
  Briefcase
} from 'lucide-react';

interface StockDetailPanelProps {
  stock: StockQuote;
  onClose: () => void;
  candles: CandleData[];
  timeframe: '1d' | '1w' | '1mo' | '1y' | '5y';
  setTimeframe: (tf: '1d' | '1w' | '1mo' | '1y' | '5y') => void;
  onAddToPortfolio: (stock: StockQuote, shares: number) => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (stock: StockQuote) => void;
  aiAnalysis: AIInvestmentAnalysis | null;
  isLoadingAi: boolean;
  onRunAiAnalysis: (userQuery?: string) => void;
}

export const StockDetailPanel: React.FC<StockDetailPanelProps> = ({
  stock,
  onClose,
  candles,
  timeframe,
  setTimeframe,
  onAddToPortfolio,
  isWatchlisted,
  onToggleWatchlist,
  aiAnalysis,
  isLoadingAi,
  onRunAiAnalysis
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'chart' | 'fundamentals' | 'trade'>('ai');
  const [tradeShares, setTradeShares] = useState<number>(10);
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [tradeSuccessMsg, setTradeSuccessMsg] = useState<string | null>(null);

  const isUp = stock.change >= 0;

  // Calculate 52-week position percentage
  const rangeSpan = stock.fiftyTwoWeekHigh - stock.fiftyTwoWeekLow || 1;
  const rangePct = Math.min(100, Math.max(0, ((stock.price - stock.fiftyTwoWeekLow) / rangeSpan) * 100));

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (tradeShares > 0) {
      onAddToPortfolio(stock, tradeShares);
      setTradeSuccessMsg(`Successfully simulated purchase of ${tradeShares} shares of ${stock.symbol}!`);
      setTimeout(() => setTradeSuccessMsg(null), 3500);
    }
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (customQuestion.trim()) {
      onRunAiAnalysis(customQuestion);
      setCustomQuestion('');
    }
  };

  return (
    <div 
      className="fixed top-18 right-4 bottom-22 w-full max-w-[540px] z-40 bg-[#0c121e] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200 select-text"
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)'
      }}
    >
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold font-mono tracking-tight text-white">{stock.symbol}</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
              {stock.exchange}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800/60 font-medium">
              {stock.sector}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5 truncate max-w-[320px]">{stock.name}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Watchlist toggle */}
          <button
            onClick={() => onToggleWatchlist(stock)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
              isWatchlisted
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {isWatchlisted ? '★ In Watchlist' : '+ Watchlist'}
          </button>

          {/* Close Panel */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Price Summary Banner */}
      <div className="px-5 py-3.5 bg-slate-900/60 border-b border-slate-800/80 flex items-baseline justify-between">
        <div>
          <div className="text-3xl font-bold font-mono text-white tracking-tight">
            ${stock.price.toFixed(2)}
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-mono font-semibold mt-0.5 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{isUp ? '+' : ''}${stock.change.toFixed(2)}</span>
            <span>({isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
            <span className="text-slate-400 font-normal ml-1">Today</span>
          </div>
        </div>

        {/* 52W Range Micro Bar */}
        <div className="w-44 text-right">
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
            <span>52W L: ${stock.fiftyTwoWeekLow.toFixed(1)}</span>
            <span>52W H: ${stock.fiftyTwoWeekHigh.toFixed(1)}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full"
              style={{ width: `${rangePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'ai'
              ? 'border-sky-500 text-sky-400 bg-sky-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>AI Intelligence</span>
        </button>

        <button
          onClick={() => setActiveTab('chart')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'chart'
              ? 'border-sky-500 text-sky-400 bg-sky-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Technical Chart</span>
        </button>

        <button
          onClick={() => setActiveTab('fundamentals')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'fundamentals'
              ? 'border-sky-500 text-sky-400 bg-sky-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Key Metrics</span>
        </button>

        <button
          onClick={() => setActiveTab('trade')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'trade'
              ? 'border-sky-500 text-sky-400 bg-sky-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Paper Trade</span>
        </button>
      </div>

      {/* Panel Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* TAB 1: AI INVESTMENT INTELLIGENCE */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            {/* Top Analysis Trigger & Status */}
            <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Gemini Institutional Engine</div>
                  <div className="text-[11px] text-slate-400">Real-time fundamental & technical reasoning</div>
                </div>
              </div>

              <button
                onClick={() => onRunAiAnalysis()}
                disabled={isLoadingAi}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
                <span>{isLoadingAi ? 'Analyzing...' : 'Refresh Thesis'}</span>
              </button>
            </div>

            {isLoadingAi ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800">
                <BrainCircuit className="w-8 h-8 text-sky-400 mx-auto animate-bounce mb-3" />
                <h4 className="text-sm font-semibold text-white">Synthesizing Investment Intelligence</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Evaluating valuation ratios, trend strength, technical support/resistance, and risk/reward profile...
                </p>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-4">
                {/* Decision Score & Recommendation Card */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Recommendation Signal
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xl font-bold font-mono ${
                        aiAnalysis.recommendation.includes('Buy')
                          ? 'text-emerald-400'
                          : aiAnalysis.recommendation === 'Hold'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}>
                        {aiAnalysis.recommendation}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-mono">
                        {aiAnalysis.valuationStatus}
                      </span>
                    </div>
                  </div>

                  {/* Quantitative Score Gauge */}
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Conviction Score
                    </span>
                    <div className="text-2xl font-bold font-mono text-white flex items-baseline justify-end gap-1">
                      <span>{aiAnalysis.confidenceScore}</span>
                      <span className="text-xs text-slate-500">/100</span>
                    </div>
                  </div>
                </div>

                {/* 12-Month Target Price Breakdown */}
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2.5">
                    <span className="flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-sky-400" />
                      12-Month Price Targets
                    </span>
                    <span className={`font-mono text-xs ${aiAnalysis.targetPrice.upsidePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {aiAnalysis.targetPrice.upsidePercent >= 0 ? '+' : ''}{aiAnalysis.targetPrice.upsidePercent}% Base Return
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center font-mono">
                    <div className="bg-slate-950/80 p-2 rounded-lg border border-rose-900/40">
                      <div className="text-[10px] text-rose-400">Bear Case</div>
                      <div className="text-sm font-bold text-slate-200 mt-0.5">${aiAnalysis.targetPrice.bear}</div>
                    </div>
                    <div className="bg-slate-950/80 p-2 rounded-lg border border-sky-800/60 ring-1 ring-sky-500/30">
                      <div className="text-[10px] text-sky-400 font-semibold">Base Case</div>
                      <div className="text-sm font-bold text-white mt-0.5">${aiAnalysis.targetPrice.base}</div>
                    </div>
                    <div className="bg-slate-950/80 p-2 rounded-lg border border-emerald-900/40">
                      <div className="text-[10px] text-emerald-400">Bull Case</div>
                      <div className="text-sm font-bold text-slate-200 mt-0.5">${aiAnalysis.targetPrice.bull}</div>
                    </div>
                  </div>
                </div>

                {/* Executive Summary Thesis */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs leading-relaxed text-slate-300">
                  <h4 className="font-semibold text-white mb-1.5 flex items-center gap-1.5">
                    <BrainCircuit className="w-3.5 h-3.5 text-sky-400" />
                    Executive Thesis
                  </h4>
                  <p>{aiAnalysis.executiveSummary}</p>
                </div>

                {/* Bull Thesis vs Bear Risks (Two-column comparative cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Bull Drivers */}
                  <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Growth Catalysts</span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-slate-300">
                      {aiAnalysis.bullThesis.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bear Risks */}
                  <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 mb-2">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Key Downside Risks</span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-slate-300">
                      {aiAnalysis.bearRisks.map((risk, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Technical Signals & Support/Resistance */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-200">Technical Posture: {aiAnalysis.technicalOutlook.trend}</span>
                    <span className="text-[11px] font-mono text-sky-400">Momentum: {aiAnalysis.technicalOutlook.momentum}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">{aiAnalysis.technicalOutlook.rsiAssessment}</p>
                  <div className="flex items-center justify-between text-xs font-mono bg-slate-900 p-2 rounded-lg">
                    <span className="text-emerald-400">Key Support: ${aiAnalysis.technicalOutlook.supportLevel}</span>
                    <span className="text-rose-400">Key Resistance: ${aiAnalysis.technicalOutlook.resistanceLevel}</span>
                  </div>
                </div>

                {/* Interactive Q&A Input for Gemini */}
                <form onSubmit={handleAskQuestion} className="pt-2">
                  <div className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-sky-400" />
                    Ask Gemini Advisor About {stock.symbol}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      placeholder="e.g. Compare valuation against competitors..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="submit"
                      disabled={!customQuestion.trim() || isLoadingAi}
                      className="p-2 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 text-white rounded-lg transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>

                <div className="text-[10px] text-slate-500 italic text-center pt-1">
                  {aiAnalysis.disclaimer}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-950/60 rounded-xl border border-slate-800">
                <BrainCircuit className="w-7 h-7 text-sky-400 mx-auto mb-2" />
                <p className="text-xs text-slate-300 mb-3">
                  Generate an AI-powered institutional investment breakdown for {stock.symbol}.
                </p>
                <button
                  onClick={() => onRunAiAnalysis()}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-semibold shadow"
                >
                  Generate Thesis Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TECHNICAL CHART */}
        {activeTab === 'chart' && (
          <div className="space-y-3">
            <StockChart
              candles={candles}
              symbol={stock.symbol}
              currentPrice={stock.price}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
            />

            {/* Quick Technical Signals Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">14-Day RSI</div>
                <div className="text-sm font-bold text-white mt-0.5">{stock.rsi14}</div>
                <div className={`text-[10px] ${stock.rsi14 > 70 ? 'text-rose-400' : stock.rsi14 < 35 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {stock.rsi14 > 70 ? 'Overbought' : stock.rsi14 < 35 ? 'Oversold' : 'Neutral'}
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">20-Day SMA</div>
                <div className="text-sm font-bold text-white mt-0.5">${stock.sma20.toFixed(2)}</div>
                <div className={`text-[10px] ${stock.price >= stock.sma20 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stock.price >= stock.sma20 ? 'Above SMA20' : 'Below SMA20'}
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">50-Day SMA</div>
                <div className="text-sm font-bold text-white mt-0.5">${stock.sma50.toFixed(2)}</div>
                <div className={`text-[10px] ${stock.price >= stock.sma50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stock.price >= stock.sma50 ? 'Above SMA50' : 'Below SMA50'}
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">200-Day SMA</div>
                <div className="text-sm font-bold text-white mt-0.5">${stock.sma200.toFixed(2)}</div>
                <div className={`text-[10px] ${stock.price >= stock.sma200 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  Long-Term Bullish
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: KEY METRICS & FUNDAMENTALS */}
        {activeTab === 'fundamentals' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400 font-sans">Market Capitalization</div>
                <div className="text-base font-bold text-white mt-0.5">${stock.marketCap} Billion</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400 font-sans">P/E Ratio (TTM)</div>
                <div className="text-base font-bold text-white mt-0.5">{stock.peRatio}x</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400 font-sans">EPS (Trailing 12M)</div>
                <div className="text-base font-bold text-white mt-0.5">${stock.eps}</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400 font-sans">Beta (Volatility vs SPY)</div>
                <div className="text-base font-bold text-white mt-0.5">{stock.beta}</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400 font-sans">Dividend Yield</div>
                <div className="text-base font-bold text-white mt-0.5">{stock.dividendYield}%</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400 font-sans">Daily Volume</div>
                <div className="text-base font-bold text-white mt-0.5">{(stock.volume / 1e6).toFixed(2)}M</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400 font-sans">Day Range</div>
                <div className="text-sm font-bold text-white mt-0.5">${stock.dayLow} - ${stock.dayHigh}</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400 font-sans">Previous Close</div>
                <div className="text-sm font-bold text-white mt-0.5">${stock.previousClose}</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PAPER TRADE SIMULATOR */}
        {activeTab === 'trade' && (
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h4 className="text-sm font-semibold text-white mb-1">Simulated Order Execution</h4>
              <p className="text-xs text-slate-400 mb-4">
                Execute virtual trades at real-time market prices without risk to test your investment hypothesis.
              </p>

              {tradeSuccessMsg && (
                <div className="mb-3 p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{tradeSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleExecuteTrade} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Quantity (Shares)</label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={tradeShares}
                    onChange={(e) => setTradeShares(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 font-mono text-xs space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Order Type:</span>
                    <span className="text-white">MARKET ORDER</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Fill Price:</span>
                    <span className="text-white">${stock.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-200 font-bold border-t border-slate-800 pt-1 mt-1">
                    <span>Estimated Total Cost:</span>
                    <span className="text-sky-400">${(tradeShares * stock.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Simulate Buy {tradeShares} Shares</span>
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
