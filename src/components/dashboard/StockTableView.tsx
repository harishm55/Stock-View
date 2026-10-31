import React, { useState } from 'react';
import { StockQuote } from '../../types/stock.ts';
import { 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Layers, 
  BrainCircuit, 
  ExternalLink,
  SlidersHorizontal
} from 'lucide-react';

interface StockTableViewProps {
  stocks: StockQuote[];
  selectedStock: StockQuote | null;
  onSelectStock: (stock: StockQuote) => void;
  onSwitchTo3D: (stock: StockQuote) => void;
}

type SortField = 'symbol' | 'price' | 'changePercent' | 'marketCap' | 'volume' | 'peRatio' | 'rsi14' | 'beta';

export const StockTableView: React.FC<StockTableViewProps> = ({
  stocks,
  selectedStock,
  onSelectStock,
  onSwitchTo3D
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [sortField, setSortField] = useState<SortField>('marketCap');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filtered = stocks.filter(s => {
    const matchesSearch = s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === 'ALL' || s.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (typeof valA === 'string') {
      return sortAsc ? (valA as string).localeCompare(valB as string) : (valB as string).localeCompare(valA as string);
    }
    return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
  });

  return (
    <div className="pt-24 pb-28 max-w-7xl mx-auto px-4 sm:px-6 select-none">
      {/* Top Filter Controls */}
      <div className="bg-[#0b111e] border border-slate-800 rounded-2xl p-4 mb-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by ticker or name..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Sectors</option>
            <option value="Technology">Technology</option>
            <option value="Financial Services">Financial Services</option>
            <option value="Consumer Cyclical">Consumer Cyclical</option>
            <option value="Communication">Communication</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Energy">Energy</option>
            <option value="Indices">Indices / ETFs</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <strong className="text-white">{sorted.length}</strong> active equities
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#0b111e] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-sans text-xs">
                <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('symbol')}>
                  <div className="flex items-center gap-1.5">
                    <span>Ticker & Company</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-3">Sector</th>
                <th className="py-3.5 px-3 cursor-pointer hover:text-white text-right" onClick={() => handleSort('price')}>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Price</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-3 cursor-pointer hover:text-white text-right" onClick={() => handleSort('changePercent')}>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Day Change</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-3 cursor-pointer hover:text-white text-right" onClick={() => handleSort('marketCap')}>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Mkt Cap ($B)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-3 cursor-pointer hover:text-white text-right" onClick={() => handleSort('peRatio')}>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>P/E</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-3 cursor-pointer hover:text-white text-right" onClick={() => handleSort('rsi14')}>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>RSI (14)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-3 cursor-pointer hover:text-white text-right" onClick={() => handleSort('volume')}>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Volume</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sorted.map(stock => {
                const isUp = stock.change >= 0;
                const isSelected = selectedStock?.symbol === stock.symbol;
                return (
                  <tr
                    key={stock.symbol}
                    onClick={() => onSelectStock(stock)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-sky-950/30 ring-1 ring-inset ring-sky-500/40' : 'hover:bg-slate-900/40'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{stock.symbol}</span>
                        <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">
                          {stock.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-[11px] font-sans px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        {stock.sector}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-white">
                      {stock.currency === 'INR' ? '₹' : '$'}{stock.price.toFixed(2)}
                    </td>

                    <td className={`py-3 px-3 text-right font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <div className="flex items-center justify-end gap-1">
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right text-slate-200">
                      {stock.currency === 'INR' ? '₹' : '$'}{stock.marketCap}B
                    </td>

                    <td className="py-3 px-3 text-right text-slate-300">
                      {stock.peRatio}x
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span className={`px-1.5 py-0.5 rounded ${
                        stock.rsi14 > 70 ? 'bg-rose-950 text-rose-400' : stock.rsi14 < 35 ? 'bg-emerald-950 text-emerald-400' : 'text-slate-300'
                      }`}>
                        {stock.rsi14}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right text-slate-400">
                      {(stock.volume / 1e6).toFixed(1)}M
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSwitchTo3D(stock);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-[11px] font-sans font-semibold flex items-center gap-1 transition-colors"
                          title="Inspect 3D Monolith"
                        >
                          <Layers className="w-3 h-3" />
                          <span>3D View</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStock(stock);
                          }}
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                          title="Open AI Analysis"
                        >
                          <BrainCircuit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
