import React from 'react';
import { VISUALIZER_FONTS } from '../../constants';
import { Qt6Style } from '../../types';

interface VisualizerSettingsProps {
    fontFamily: string;
    setFontFamily: (val: string) => void;
    activeColor: string;
    setActiveColor: (val: string) => void;
    inactiveColor: string;
    setInactiveColor: (val: string) => void;
    smoothingFactor: number;
    setSmoothingFactor: (val: number) => void;
    verticalOffset: number;
    setVerticalOffset: (val: number) => void;
    inactiveOpacity: number;
    setInactiveOpacity: (val: number) => void;
    visualMode: 'cover' | 'qt6';
    qt6Style: Qt6Style;
    setQt6Style: (val: Qt6Style) => void;
    qt6BarCount: number;
    setQt6BarCount: (val: number) => void;
    qt6Sensitivity: number;
    setQt6Sensitivity: (val: number) => void;
    videoBitrate: number;
    setVideoBitrate: (val: number) => void;
    videoBitrateMode: 'constant' | 'variable';
    setVideoBitrateMode: (val: 'constant' | 'variable') => void;
    onReset: () => void;
}

const VisualizerSettings: React.FC<VisualizerSettingsProps> = ({
    fontFamily, setFontFamily, activeColor, setActiveColor, inactiveColor, setInactiveColor,
    smoothingFactor, setSmoothingFactor, verticalOffset, setVerticalOffset, inactiveOpacity, setInactiveOpacity,
    visualMode, qt6Style, setQt6Style, qt6BarCount, setQt6BarCount, qt6Sensitivity, setQt6Sensitivity, 
    videoBitrate, setVideoBitrate, videoBitrateMode, setVideoBitrateMode,
    onReset
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visual & Export Settings</h3>
            <button onClick={onReset} className="text-xs text-purple-400 hover:text-purple-300">Reset to Default</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] text-slate-500 block mb-1">Font Family</label>
                <select 
                value={fontFamily} 
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-slate-200"
                >
                    {VISUALIZER_FONTS.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="text-[10px] text-slate-500 block mb-1">Active Color</label>
                <div className="flex items-center gap-2">
                    <input 
                    type="color" 
                    value={activeColor}
                    onChange={(e) => setActiveColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0" 
                    />
                    <span className="text-xs font-mono text-slate-400">{activeColor}</span>
                </div>
            </div>
            <div>
                <label className="text-[10px] text-slate-500 block mb-1">Inactive Color</label>
                <div className="flex items-center gap-2">
                    <input 
                    type="color" 
                    value={inactiveColor}
                    onChange={(e) => setInactiveColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0" 
                    />
                    <span className="text-xs font-mono text-slate-400">{inactiveColor}</span>
                </div>
            </div>
            <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] text-slate-500 block mb-1">Scroll Smoothing</label>
                <input 
                type="range" 
                min="0.01" 
                max="0.5" 
                step="0.01" 
                value={smoothingFactor} 
                onChange={(e) => setSmoothingFactor(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Smooth</span>
                    <span>Instant</span>
                </div>
            </div>
            <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] text-slate-500 block mb-1">Vertical Position</label>
                <input 
                type="range" 
                min="-0.4" 
                max="0.4" 
                step="0.01" 
                value={verticalOffset} 
                onChange={(e) => setVerticalOffset(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Top</span>
                    <span>Bottom</span>
                </div>
            </div>
            
            {/* Export Settings */}
            <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] text-slate-500 block mb-1">Video Bitrate (bps)</label>
                <input 
                    type="number" 
                    value={videoBitrate}
                    onChange={(e) => setVideoBitrate(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-slate-200"
                    step={100000}
                />
            </div>
            <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] text-slate-500 block mb-1">Bitrate Mode</label>
                <select 
                    value={videoBitrateMode}
                    onChange={(e) => setVideoBitrateMode(e.target.value as 'constant' | 'variable')}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-slate-200"
                >
                    <option value="variable">Variable (VBR)</option>
                    <option value="constant">Constant (CBR)</option>
                </select>
            </div>
        </div>

        {/* Qt6 Specific Controls */}
        {visualMode === 'qt6' && (
            <div className="mt-4 pt-4 border-t border-slate-800 animate-in fade-in">
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">Qt6 Visualizer Controls</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-[10px] text-slate-500 block mb-1">Type</label>
                        <select 
                        value={qt6Style}
                        onChange={(e) => setQt6Style(e.target.value as Qt6Style)}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-white focus:ring-1 focus:ring-purple-500"
                        >
                            <option value="wave">Oscilloscope (Wave)</option>
                            <option value="bars">Stylish Bars</option>
                            <option value="circle">Expanding Circle</option>
                            <option value="circular-wave">Circular Wave</option>
                        </select>
                    </div>
                    {qt6Style === 'bars' && (
                        <div>
                            <label className="text-[10px] text-slate-500 block mb-1">Bar Count</label>
                            <select 
                            value={qt6BarCount}
                            onChange={(e) => setQt6BarCount(Number(e.target.value))}
                            className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-white"
                            >
                                <option value="32">32 Bars (Chunky)</option>
                                <option value="64">64 Bars (Standard)</option>
                                <option value="128">128 Bars (Detailed)</option>
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="text-[10px] text-slate-500 block mb-1">Sensitivity (Gain)</label>
                        <input 
                        type="range" 
                        min="0.5" 
                        max="3.0" 
                        step="0.1" 
                        value={qt6Sensitivity}
                        onChange={(e) => setQt6Sensitivity(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default VisualizerSettings;