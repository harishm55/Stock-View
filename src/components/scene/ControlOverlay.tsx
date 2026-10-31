import React, { useState } from 'react';
import { SceneMode, HeightMetric } from '../../types/stock.ts';
import { 
  Building2, 
  CandlestickChart, 
  Orbit, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Compass, 
  Layers, 
  BarChart3, 
  TrendingUp, 
  RotateCw,
  SlidersHorizontal
} from 'lucide-react';

interface ControlOverlayProps {
  sceneMode: SceneMode;
  setSceneMode: (mode: SceneMode) => void;
  heightMetric: HeightMetric;
  setHeightMetric: (metric: HeightMetric) => void;
  sectorFilter: string;
  setSectorFilter: (filter: string) => void;
  cameraPreset: 'overview' | 'top' | 'focus' | 'cinematic';
  setCameraPreset: (preset: 'overview' | 'top' | 'focus' | 'cinematic') => void;
  isAutoRotate: boolean;
  setIsAutoRotate: (val: boolean | ((prev: boolean) => boolean)) => void;
  selectedStockSymbol?: string;
}

export const ControlOverlay: React.FC<ControlOverlayProps> = ({
  sceneMode,
  setSceneMode,
  heightMetric,
  setHeightMetric,
  sectorFilter,
  setSectorFilter,
  cameraPreset,
  setCameraPreset,
  isAutoRotate,
  setIsAutoRotate,
  selectedStockSymbol
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'view' | 'metric' | 'camera'>('view');

  return (
    <div 
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 transition-transform duration-300 ease-out select-none"
      style={{
        maxWidth: 'min(940px, 94vw)',
        transform: isCollapsed ? 'translate(-50%, calc(100% - 34px))' : 'translate(-50%, 0)'
      }}
    >
      {/* Collapse / Expand Tab Button pinned to top edge */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 border-b-0 rounded-t-lg shadow-lg hover:bg-slate-800 transition-colors"
          title="Toggle Zen Mode (H)"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
              <span>Show 3D Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Cinema Mode (Hide HUD)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Solid Dock Surface (No backdrop-filter over WebGL canvas to preserve 60fps) */}
      <div className="bg-[#0b111e] border border-slate-700/80 rounded-2xl shadow-2xl p-3 sm:p-4 text-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Section 1: 3D Visualization Modes */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSceneMode('skyline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sceneMode === 'skyline'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>3D Skyline</span>
            </button>

            <button
              onClick={() => setSceneMode('corridor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sceneMode === 'corridor'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title={selectedStockSymbol ? `View 3D Corridor for ${selectedStockSymbol}` : 'Select a stock to view 3D corridor'}
            >
              <CandlestickChart className="w-3.5 h-3.5" />
              <span>3D Candlesticks</span>
              {selectedStockSymbol && (
                <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-sky-300 font-mono">
                  {selectedStockSymbol}
                </span>
              )}
            </button>

            <button
              onClick={() => setSceneMode('orbit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sceneMode === 'orbit'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>Beta Orbit</span>
            </button>
          </div>

          {/* Section 2: Height Metrics (when in Skyline mode) */}
          {sceneMode === 'skyline' && (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 text-[11px] font-medium hidden md:inline flex items-center gap-1 mr-1">
                <Layers className="w-3 h-3 text-sky-400" /> Height:
              </span>
              {(['marketCap', 'volume', 'changePercent', 'peRatio'] as HeightMetric[]).map(metric => {
                const labels: Record<HeightMetric, string> = {
                  marketCap: 'Mkt Cap',
                  volume: 'Volume',
                  changePercent: '% Gain',
                  peRatio: 'P/E'
                };
                return (
                  <button
                    key={metric}
                    onClick={() => setHeightMetric(metric)}
                    className={`px-2.5 py-1 rounded-md font-mono text-[11px] transition-colors ${
                      heightMetric === metric
                        ? 'bg-slate-800 text-sky-300 border border-sky-500/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    {labels[metric]}
                  </button>
                );
              })}
            </div>
          )}

          {/* Section 3: Sector Filters */}
          {sceneMode === 'skyline' && (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 text-[11px] font-medium hidden lg:inline mr-1">Sector:</span>
              {[
                { id: 'ALL', label: 'All' },
                { id: 'TECH', label: 'Tech' },
                { id: 'FIN', label: 'Finance' },
                { id: 'CNSM', label: 'Consumer' },
                { id: 'INDEX', label: 'ETFs' }
              ].map(sec => (
                <button
                  key={sec.id}
                  onClick={() => setSectorFilter(sec.id)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    sectorFilter === sec.id
                      ? 'bg-slate-800 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          )}

          {/* Section 4: Camera Navigation & Orbit */}
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setCameraPreset('overview')}
                className={`px-2 py-1 text-[11px] font-medium rounded ${
                  cameraPreset === 'overview' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Overview 45° Angle"
              >
                Overview
              </button>
              <button
                onClick={() => setCameraPreset('top')}
                className={`px-2 py-1 text-[11px] font-medium rounded ${
                  cameraPreset === 'top' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Top-Down Market Heatmap"
              >
                Top Heatmap
              </button>
              <button
                onClick={() => setCameraPreset('cinematic')}
                className={`px-2 py-1 text-[11px] font-medium rounded ${
                  cameraPreset === 'cinematic' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Cinematic Low Angle"
              >
                Cinematic
              </button>
              {selectedStockSymbol && (
                <button
                  onClick={() => setCameraPreset('focus')}
                  className={`px-2 py-1 text-[11px] font-medium rounded ${
                    cameraPreset === 'focus' ? 'bg-sky-600 text-white' : 'text-sky-400 hover:text-white'
                  }`}
                  title="Focus on Selected Stock"
                >
                  Focus
                </button>
              )}
            </div>

            {/* Auto Orbit Toggle */}
            <button
              onClick={() => setIsAutoRotate(prev => !prev)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isAutoRotate
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title="Toggle Auto-Rotation"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
