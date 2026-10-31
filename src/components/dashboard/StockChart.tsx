import React, { useState } from 'react';
import { CandleData } from '../../types/stock.ts';
import { CandlestickChart, TrendingUp, BarChart2 } from 'lucide-react';

interface StockChartProps {
  candles: CandleData[];
  symbol: string;
  currentPrice: number;
  timeframe: '1d' | '1w' | '1mo' | '1y' | '5y';
  setTimeframe: (tf: '1d' | '1w' | '1mo' | '1y' | '5y') => void;
}

export const StockChart: React.FC<StockChartProps> = ({
  candles,
  symbol,
  currentPrice,
  timeframe,
  setTimeframe
}) => {
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle');
  const [showSMA, setShowSMA] = useState(true);
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);

  if (!candles || candles.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 font-mono text-sm bg-slate-950/60 rounded-xl border border-slate-800">
        Loading real-time market candles...
      </div>
    );
  }

  // Calculate scales
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  let maxVol = 0;

  candles.forEach(c => {
    if (c.low < minPrice) minPrice = c.low;
    if (c.high > maxPrice) maxPrice = c.high;
    if (c.volume > maxVol) maxVol = c.volume;
  });

  // Add 4% padding
  const pricePadding = (maxPrice - minPrice) * 0.05 || 1;
  const chartMin = minPrice - pricePadding;
  const chartMax = maxPrice + pricePadding;
  const priceRange = chartMax - chartMin;

  const svgWidth = 600;
  const svgHeight = 260;
  const volHeight = 50;
  const priceAreaHeight = svgHeight - volHeight - 20;

  const getX = (index: number) => {
    return (index / (candles.length - 1 || 1)) * (svgWidth - 40) + 20;
  };

  const getY = (price: number) => {
    return priceAreaHeight - ((price - chartMin) / priceRange) * priceAreaHeight + 10;
  };

  // Generate line path
  const linePoints = candles.map((c, i) => `${getX(i)},${getY(c.close)}`).join(' ');
  const areaPoints = `${getX(0)},${priceAreaHeight + 10} ${linePoints} ${getX(candles.length - 1)},${priceAreaHeight + 10}`;

  const isNetPositive = candles[candles.length - 1].close >= candles[0].open;
  const strokeColor = isNetPositive ? '#10b981' : '#f43f5e';
  const fillGradientId = isNetPositive ? 'greenGradient' : 'redGradient';

  // SMA paths
  const sma20Points = candles
    .map((c, i) => c.sma20 ? `${getX(i)},${getY(c.sma20)}` : null)
    .filter(Boolean)
    .join(' ');

  const sma50Points = candles
    .map((c, i) => c.sma50 ? `${getX(i)},${getY(c.sma50)}` : null)
    .filter(Boolean)
    .join(' ');

  const activeCandle = hoveredCandle || candles[candles.length - 1];

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
      {/* Top Toolbar: Timeframes, Chart Style, Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-slate-800/80 pb-3">
        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800">
          {(['1d', '1w', '1mo', '1y', '5y'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                timeframe === tf
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Live candle HUD inspector */}
        <div className="text-xs font-mono text-slate-300 flex items-center gap-3">
          <span>O: <strong className="text-slate-100">${activeCandle.open.toFixed(2)}</strong></span>
          <span>H: <strong className="text-emerald-400">${activeCandle.high.toFixed(2)}</strong></span>
          <span>L: <strong className="text-rose-400">${activeCandle.low.toFixed(2)}</strong></span>
          <span>C: <strong className="text-white">${activeCandle.close.toFixed(2)}</strong></span>
          <span className="text-slate-400 hidden sm:inline">{activeCandle.dateStr}</span>
        </div>

        {/* View toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartType(chartType === 'candle' ? 'line' : 'candle')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-700/60"
            title="Toggle Line / Candlesticks"
          >
            {chartType === 'candle' ? <TrendingUp className="w-3.5 h-3.5 text-sky-400" /> : <CandlestickChart className="w-3.5 h-3.5 text-amber-400" />}
            <span>{chartType === 'candle' ? 'Candles' : 'Area'}</span>
          </button>

          <button
            onClick={() => setShowSMA(!showSMA)}
            className={`px-2 py-1 text-xs font-mono rounded-lg border transition-colors ${
              showSMA ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
            title="Toggle 20 & 50 Moving Averages"
          >
            SMA 20/50
          </button>
        </div>
      </div>

      {/* Main SVG Chart Container */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none"
          onMouseLeave={() => setHoveredCandle(null)}
        >
          <defs>
            <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0.2, 0.4, 0.6, 0.8].map(ratio => {
            const y = priceAreaHeight * ratio + 10;
            const priceVal = chartMax - ratio * priceRange;
            return (
              <g key={ratio}>
                <line
                  x1="0"
                  y1={y}
                  x2={svgWidth}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={svgWidth - 6}
                  y={y - 4}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  ${priceVal.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Area Chart Mode */}
          {chartType === 'line' && (
            <>
              <polygon points={areaPoints} fill={`url(#${fillGradientId})`} />
              <polyline
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={linePoints}
              />
            </>
          )}

          {/* Candlestick Chart Mode */}
          {chartType === 'candle' && (
            <g>
              {candles.map((c, i) => {
                const x = getX(i);
                const isGreen = c.close >= c.open;
                const candleColor = isGreen ? '#10b981' : '#f43f5e';
                const yOpen = getY(c.open);
                const yClose = getY(c.close);
                const yHigh = getY(c.high);
                const yLow = getY(c.low);

                const topY = Math.min(yOpen, yClose);
                const bodyH = Math.max(2, Math.abs(yClose - yOpen));
                const candleWidth = Math.max(3, Math.min(10, (svgWidth / candles.length) * 0.7));

                return (
                  <g
                    key={i}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredCandle(c)}
                  >
                    {/* Wick */}
                    <line
                      x1={x}
                      y1={yHigh}
                      x2={x}
                      y2={yLow}
                      stroke={candleColor}
                      strokeWidth="1.2"
                    />
                    {/* Body */}
                    <rect
                      x={x - candleWidth / 2}
                      y={topY}
                      width={candleWidth}
                      height={bodyH}
                      fill={candleColor}
                      rx="1"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* SMA 20 Overlay (Cyan) */}
          {showSMA && sma20Points && (
            <polyline
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.6"
              strokeDasharray="2 1"
              points={sma20Points}
            />
          )}

          {/* SMA 50 Overlay (Amber) */}
          {showSMA && sma50Points && (
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.6"
              points={sma50Points}
            />
          )}

          {/* Volume bars at bottom */}
          <g>
            <line
              x1="0"
              y1={svgHeight - volHeight}
              x2={svgWidth}
              y2={svgHeight - volHeight}
              stroke="#1e293b"
              strokeWidth="1"
            />
            {candles.map((c, i) => {
              const x = getX(i);
              const barH = (c.volume / (maxVol || 1)) * (volHeight - 8);
              const isGreen = c.close >= c.open;
              const barW = Math.max(2, (svgWidth / candles.length) * 0.6);
              return (
                <rect
                  key={i}
                  x={x - barW / 2}
                  y={svgHeight - barH}
                  width={barW}
                  height={barH}
                  fill={isGreen ? 'rgba(16, 185, 129, 0.45)' : 'rgba(244, 63, 94, 0.45)'}
                />
              );
            })}
          </g>

          {/* Hover Crosshair */}
          {hoveredCandle && (
            <g>
              <line
                x1={getX(candles.indexOf(hoveredCandle))}
                y1="0"
                x2={getX(candles.indexOf(hoveredCandle))}
                y2={svgHeight}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={getX(candles.indexOf(hoveredCandle))}
                cy={getY(hoveredCandle.close)}
                r="4"
                fill="#ffffff"
                stroke={hoveredCandle.close >= hoveredCandle.open ? '#10b981' : '#f43f5e'}
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Legend */}
        {showSMA && (
          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400 mt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-sky-400 inline-block" /> SMA 20
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-amber-400 inline-block" /> SMA 50
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2 bg-emerald-500/40 inline-block" /> Volume
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
