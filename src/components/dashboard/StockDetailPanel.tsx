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
  Briefcase,
  ExternalLink
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
  const [activeTab, setActiveTab] = useState<'chart' | 'fundamentals' | 'ai' | 'trade'>('chart');
  const [chartMode, setChartMode] = useState<'price' | 'pe'>('price');
  const [tradeShares, setTradeShares] = useState<number>(1);
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [tradeSuccessMsg, setTradeSuccessMsg] = useState<string | null>(null);

  const isUp = stock.change >= 0;

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (tradeShares > 0) {
      onAddToPortfolio(stock, tradeShares);
      setTradeSuccessMsg(`Order executed for ${tradeShares} shares of ${stock.symbol}`);
      setTimeout(() => setTradeSuccessMsg(null), 3000);
    }
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (customQuestion.trim()) {
      onRunAiAnalysis(customQuestion);
      setCustomQuestion('');
    }
  };

  // Helper for formatting currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: stock.currency || 'USD',
      minimumFractionDigits: 2,
    }).format(val);
  };

  const formatLargeNumber = (val: number) => {
    if (val >= 1000) return (val / 1000).toFixed(2) + 'T';
    if (val >= 1) return val.toFixed(2) + 'B';
    return val.toFixed(2);
  };

  return (
    <div 
      className="fixed top-18 right-4 bottom-22 w-full max-w-[640px] z-40 bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-900 select-text"
    >
      {/* Screener Style Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{stock.name || stock.symbol}</h2>
              <button 
                onClick={() => onToggleWatchlist(stock)}
                className={`p-1.5 rounded-full transition-colors ${isWatchlisted ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:bg-slate-100'}`}
              >
                <Sparkles className={`w-5 h-5 ${isWatchlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mt-1">
              <span className="bg-slate-100 px-2 py-0.5 rounded uppercase">{stock.exchange}</span>
              <span>•</span>
              <a href={`https://www.google.com/search?q=${stock.symbol}+stock`} target="_blank" rel="noreferrer" className="hover:text-blue-600 flex items-center gap-1">
                {stock.symbol} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Fundamental Ratios Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-y-4 gap-x-2 border-t border-slate-100 pt-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Market Cap</span>
            <span className="text-sm font-bold text-slate-800">{stock.currency === 'INR' ? '₹' : '$'}{formatLargeNumber(stock.marketCap)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Price</span>
            <span className="text-sm font-bold text-slate-800">{formatCurrency(stock.price)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">High / Low</span>
            <span className="text-sm font-bold text-slate-800">{stock.dayHigh.toFixed(0)} / {stock.dayLow.toFixed(0)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Stock P/E</span>
            <span className="text-sm font-bold text-slate-800">{stock.peRatio.toFixed(1)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dividend Yield</span>
            <span className="text-sm font-bold text-slate-800">{stock.dividendYield.toFixed(2)}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ROCE</span>
            <span className="text-sm font-bold text-slate-800">24.5%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ROE</span>
            <span className="text-sm font-bold text-slate-800">18.2%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Face Value</span>
            <span className="text-sm font-bold text-slate-800">1.00</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Book Value</span>
            <span className="text-sm font-bold text-slate-800">{formatCurrency(stock.price / 4)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">EPS</span>
            <span className="text-sm font-bold text-slate-800">{formatCurrency(stock.eps)}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-100 px-6">
        {(['chart', 'fundamentals', 'ai', 'trade'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-white space-y-8">
        
        {activeTab === 'chart' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <button 
                onClick={() => setChartMode('price')}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${chartMode === 'price' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Price
              </button>
              <button 
                onClick={() => setChartMode('pe')}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${chartMode === 'pe' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                P/E Ratio
              </button>
            </div>

            {chartMode === 'price' ? (
              <StockChart
                candles={candles}
                symbol={stock.symbol}
                currentPrice={stock.price}
                currency={stock.currency}
                timeframe={timeframe}
                setTimeframe={setTimeframe}
              />
            ) : (
              <div className="h-64 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center p-4">
                {/* Simplified PE Chart Visualization */}
                <div className="w-full h-full flex flex-col">
                  <div className="flex-1 flex items-end gap-1 px-4">
                    {(stock.peHistory || []).map((p, i) => (
                      <div key={i} className="flex-1 bg-amber-400/30 border-t-2 border-amber-500 rounded-t-sm" style={{ height: `${p.pe * 2}%` }} title={`Date: ${p.date}, PE: ${p.pe}`} />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
                    <span>Oct 2025</span>
                    <span>Median PE: 28.4</span>
                    <span>Oct 2026</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'fundamentals' && (
          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4">About {stock.name}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {stock.name} is a leading player in the {stock.sector} sector. The company has demonstrated strong historical growth and maintain a dominant market position. {stock.about || "The company continues to expand its operations globally with a focus on innovation and efficiency."}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Balance Sheet <span className="text-xs font-normal text-slate-400 ml-2">(All figures in {stock.currency === 'INR' ? '₹' : '$'} Crores)</span></h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100">
                      <th className="py-2 text-left font-medium">Category</th>
                      <th className="py-2 text-right font-medium">Value</th>
                      <th className="py-2 text-right font-medium">% of Assets</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <tr>
                      <td className="py-3 text-slate-700">Total Assets</td>
                      <td className="py-3 text-right font-bold">{stock.balanceSheet?.totalAssets}</td>
                      <td className="py-3 text-right">100%</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-slate-700">Total Liabilities</td>
                      <td className="py-3 text-right font-bold">{stock.balanceSheet?.totalLiabilities}</td>
                      <td className="py-3 text-right">{((stock.balanceSheet?.totalLiabilities || 0) / (stock.balanceSheet?.totalAssets || 1) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-slate-700 font-medium">Total Equity</td>
                      <td className="py-3 text-right font-bold">{stock.balanceSheet?.totalEquity}</td>
                      <td className="py-3 text-right">{((stock.balanceSheet?.totalEquity || 0) / (stock.balanceSheet?.totalAssets || 1) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="py-3 text-slate-700">Cash & Equivalents</td>
                      <td className="py-3 text-right font-bold text-emerald-600">{stock.balanceSheet?.cash}</td>
                      <td className="py-3 text-right">---</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="py-3 text-slate-700">Total Debt</td>
                      <td className="py-3 text-right font-bold text-rose-600">{stock.balanceSheet?.debt}</td>
                      <td className="py-3 text-right">---</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg text-white">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-900">Gemini Investment Advisor</h4>
                  <p className="text-xs text-blue-700">Real-time fundamental and technical reasoning</p>
                </div>
              </div>
              <button 
                onClick={() => onRunAiAnalysis()}
                disabled={isLoadingAi}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
                {isLoadingAi ? 'Analyzing' : 'Generate Thesis'}
              </button>
            </div>

            {aiAnalysis ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Signal</span>
                    <div className={`text-xl font-black mt-1 ${aiAnalysis.recommendation.includes('Buy') ? 'text-emerald-600' : aiAnalysis.recommendation === 'Hold' ? 'text-amber-500' : 'text-rose-600'}`}>
                      {aiAnalysis.recommendation}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Target Price</span>
                    <div className="text-xl font-black mt-1 text-slate-900">
                      {formatCurrency(aiAnalysis.targetPrice.base)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Investment Thesis</h4>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {aiAnalysis.executiveSummary}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Pros / Bull Case</h4>
                    <ul className="space-y-2">
                      {aiAnalysis.bullThesis.map((t, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wider">Cons / Bear Risks</h4>
                    <ul className="space-y-2">
                      {aiAnalysis.bearRisks.map((r, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : !isLoadingAi && (
              <div className="text-center py-12">
                <BrainCircuit className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 text-sm">Click the button above to generate AI analysis for {stock.symbol}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trade' && (
          <div className="space-y-6">
            <section className="bg-slate-50 border border-slate-100 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Simulate Paper Trade</h3>
              <p className="text-sm text-slate-500 mb-6">Test your strategy using real-time market data without financial risk.</p>

              {tradeSuccessMsg && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-lg flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-5 h-5" />
                  {tradeSuccessMsg}
                </div>
              )}

              <form onSubmit={handleExecuteTrade} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Quantity (Shares)</label>
                  <input
                    type="number"
                    min="1"
                    value={tradeShares}
                    onChange={(e) => setTradeShares(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-lg font-bold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div className="p-4 bg-white border border-slate-100 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Execution Price:</span>
                    <span className="font-bold">{formatCurrency(stock.price)}</span>
                  </div>
                  <div className="flex justify-between text-lg pt-2 border-t border-slate-50 font-black">
                    <span className="text-slate-900">Total Estimate:</span>
                    <span className="text-blue-600">{formatCurrency(stock.price * tradeShares)}</span>
                  </div>
                </div>

                <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl text-lg hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                  <DollarSign className="w-6 h-6" />
                  Confirm Simulated Buy
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
