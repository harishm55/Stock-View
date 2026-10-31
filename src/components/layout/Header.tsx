import React, { useState, useEffect } from 'react';
import { MarketOverviewData, StockQuote } from '../../types/stock.ts';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Briefcase, 
  Layers, 
  BarChart2, 
  Sparkles,
  Compass,
  Clock
} from 'lucide-react';

interface HeaderProps {
  overview: MarketOverviewData;
  stocks: StockQuote[];
  selectedStock: StockQuote | null;
  onSelectStock: (stock: StockQuote) => void;
  onOpenPortfolio: () => void;
  portfolioTotalValue: number;
  portfolioTotalPnL: number;
  portfolioPnLPct: number;
  viewMode: '3d' | 'table';
  setViewMode: (mode: '3d' | 'table') => void;
}

export const Header: React.FC<HeaderProps> = ({
  overview,
  stocks,
  selectedStock,
  onSelectStock,
  onOpenPortfolio,
  portfolioTotalValue,
  portfolioTotalPnL,
  portfolioPnLPct,
  viewMode,
  setViewMode
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data.results || []);
          }
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectResult = async (result: any) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    
    // Fetch full stock details from backend
    try {
      const res = await fetch(`/api/stocks/${encodeURIComponent(result.symbol)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.stock) {
          onSelectStock(data.stock);
        }
      }
    } catch (error) {
      console.error('Error fetching stock details:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#060a12]/95 border-b border-slate-800 select-none">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white font-mono text-base">
                Apex<span className="text-sky-400">Pulse</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/40">
                3D Terminal
              </span>
            </div>
          </div>
        </div>

        {/* Global Market Status Badge */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-slate-300 font-semibold">{overview.marketStatus}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">VIX: {overview.indices.find(i => i.symbol === '^VIX')?.price || '16.2'}</span>
          <span className="text-slate-500">•</span>
          <span className="text-amber-300">Sentiment: {overview.fearGreedIndex.rating} ({overview.fearGreedIndex.score})</span>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-xs hidden sm:block">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search stocks (Reliance, NVDA, AAPL)..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-3 h-3 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
              {searchResults.map(result => (
                <button
                  key={result.symbol}
                  onClick={() => handleSelectResult(result)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-800 flex flex-col border-b border-slate-800/60 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-white">{result.symbol}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{result.exchange}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 truncate mt-0.5">{result.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Switcher & Portfolio button */}
        <div className="flex items-center gap-2">
          {/* 3D vs 2D Table switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === '3d'
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden md:inline">3D View</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Analytics Table</span>
            </button>
          </div>

          {/* Portfolio button */}
          <button
            onClick={onOpenPortfolio}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono transition-colors"
          >
            <Briefcase className="w-3.5 h-3.5 text-sky-400" />
            <div className="hidden sm:block text-left">
              <div className="text-[10px] text-slate-400 leading-none">Portfolio</div>
              <div className="text-xs font-bold text-white leading-tight">
                ${portfolioTotalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${portfolioTotalPnL >= 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
              {portfolioTotalPnL >= 0 ? '+' : ''}{portfolioPnLPct.toFixed(1)}%
            </span>
          </button>
        </div>

      </div>

      {/* Ticker Tape Bar */}
      <div className="h-7 bg-slate-950 border-t border-slate-900 overflow-hidden flex items-center px-4 font-mono text-[11px]">
        <div className="flex items-center gap-6 animate-pulse-none whitespace-nowrap overflow-x-auto no-scrollbar">
          {/* Indices */}
          {overview.indices.map(idx => (
            <div key={idx.symbol} className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-slate-400">{idx.name}:</span>
              <span className="text-white font-semibold">{idx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className={`flex items-center ${idx.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {idx.change >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%
              </span>
            </div>
          ))}

          {/* Leading Equities */}
          {stocks.slice(0, 10).map(s => (
            <button
              key={s.symbol}
              onClick={() => onSelectStock(s)}
              className="flex items-center gap-1.5 flex-shrink-0 hover:text-sky-300 transition-colors"
            >
              <span className="text-slate-300 font-bold">{s.symbol}</span>
              <span className="text-slate-100">{s.currency === 'INR' ? '₹' : '$'}{s.price.toFixed(2)}</span>
              <span className={`text-[10px] ${s.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {s.change >= 0 ? '+' : ''}{s.changePercent.toFixed(1)}%
              </span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
