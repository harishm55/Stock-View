import React, { useState } from 'react';
import { PortfolioPosition, StockQuote } from '../../types/stock.ts';
import { 
  X, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Plus, 
  Briefcase,
  Star,
  ExternalLink
} from 'lucide-react';

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  positions: PortfolioPosition[];
  onRemovePosition: (symbol: string) => void;
  onAddPosition: (stock: StockQuote, shares: number) => void;
  watchlist: StockQuote[];
  onSelectStock: (stock: StockQuote) => void;
  onRemoveFromWatchlist: (symbol: string) => void;
}

export const PortfolioModal: React.FC<PortfolioModalProps> = ({
  isOpen,
  onClose,
  positions,
  onRemovePosition,
  onAddPosition,
  watchlist,
  onSelectStock,
  onRemoveFromWatchlist
}) => {
  const [activeTab, setActiveTab] = useState<'positions' | 'watchlist'>('positions');

  if (!isOpen) return null;

  const totalCost = positions.reduce((acc, p) => acc + p.totalCost, 0);
  const totalValue = positions.reduce((acc, p) => acc + p.currentValue, 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  // Sector breakdown
  const sectorMap: Record<string, number> = {};
  positions.forEach(p => {
    sectorMap[p.sector] = (sectorMap[p.sector] || 0) + p.currentValue;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <div 
        className="w-full max-w-3xl bg-[#0c121e] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-mono">Investment Portfolio & Watchlist</h3>
              <p className="text-xs text-slate-400">Real-time valuation, unrealized gain/loss, and tracked tickers</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portfolio KPI Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 sm:p-5 bg-slate-900/50 border-b border-slate-800">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono">
            <div className="text-[11px] text-slate-400 font-sans">Current Portfolio Value</div>
            <div className="text-2xl font-bold text-white mt-0.5">
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono">
            <div className="text-[11px] text-slate-400 font-sans">Total Invested Cost Basis</div>
            <div className="text-2xl font-bold text-slate-300 mt-0.5">
              ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono">
            <div className="text-[11px] text-slate-400 font-sans">Unrealized Total P&L</div>
            <div className={`text-2xl font-bold mt-0.5 flex items-center gap-1.5 ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalPnL >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              <span>{totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}</span>
              <span className="text-xs font-semibold">({totalPnL >= 0 ? '+' : ''}{totalPnLPct.toFixed(2)}%)</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('positions')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'positions'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Active Positions ({positions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('watchlist')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'watchlist'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Watchlist ({watchlist.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {activeTab === 'positions' ? (
            positions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-mono text-xs">
                No active simulated positions. Click on any stock monolith or search a symbol and use "Paper Trade" to simulate an order.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-sans">
                        <th className="pb-2">Asset</th>
                        <th className="pb-2">Shares</th>
                        <th className="pb-2">Avg Buy</th>
                        <th className="pb-2">Price</th>
                        <th className="pb-2">Market Value</th>
                        <th className="pb-2">Unrealized P&L</th>
                        <th className="pb-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {positions.map(p => {
                        const isPos = p.unrealizedPnL >= 0;
                        return (
                          <tr key={p.symbol} className="hover:bg-slate-900/40">
                            <td className="py-2.5">
                              <span className="font-bold text-white">{p.symbol}</span>
                              <span className="block text-[10px] text-slate-400 font-sans">{p.name}</span>
                            </td>
                            <td className="py-2.5 text-slate-200">{p.shares}</td>
                            <td className="py-2.5 text-slate-300">${p.averageBuyPrice.toFixed(2)}</td>
                            <td className="py-2.5 text-white font-bold">${p.currentPrice.toFixed(2)}</td>
                            <td className="py-2.5 text-slate-100">${p.currentValue.toFixed(2)}</td>
                            <td className={`py-2.5 font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isPos ? '+' : ''}${p.unrealizedPnL.toFixed(2)} ({isPos ? '+' : ''}{p.unrealizedPnLPercent.toFixed(1)}%)
                            </td>
                            <td className="py-2.5 text-right">
                              <button
                                onClick={() => onRemovePosition(p.symbol)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                                title="Liquidate position"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Sector Allocation Breakdown */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                    <PieChart className="w-3.5 h-3.5 text-sky-400" />
                    Portfolio Asset Allocation
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(sectorMap).map(([sec, val]) => {
                      const pct = totalValue > 0 ? (val / totalValue) * 100 : 0;
                      return (
                        <div key={sec} className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
                          <span className="text-slate-400">{sec}:</span>
                          <span className="text-white font-bold ml-1.5">${val.toFixed(0)}</span>
                          <span className="text-sky-400 ml-1">({pct.toFixed(1)}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )
          ) : (
            // Watchlist Tab
            watchlist.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-mono text-xs">
                Your watchlist is empty. Click "+ Watchlist" on any stock to track it here.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {watchlist.map(s => {
                  const isUp = s.change >= 0;
                  return (
                    <div
                      key={s.symbol}
                      className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-sky-500/50 transition-colors flex items-center justify-between"
                    >
                      <div 
                        className="cursor-pointer"
                        onClick={() => {
                          onSelectStock(s);
                          onClose();
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{s.symbol}</span>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                            {s.sector}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 truncate max-w-[160px]">{s.name}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right font-mono">
                          <div className="text-sm font-bold text-white">${s.price.toFixed(2)}</div>
                          <div className={`text-xs ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isUp ? '+' : ''}{s.changePercent.toFixed(2)}%
                          </div>
                        </div>

                        <button
                          onClick={() => onRemoveFromWatchlist(s.symbol)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remove from watchlist"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
};
