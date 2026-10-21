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
            exportFormat?: 'mp4' | 'webm';
    setExportFormat?: (val: 'mp4' | 'webm') => void;
    colorSpaceFix?: boolean;
    setColorSpaceFix?: (val: boolean) => void;
    
    onReset: () => void;
    onAiSuggest?: () => Promise<void>;
}

const VisualizerSettings: React.FC<VisualizerSettingsProps> = ({
    fontFamily, setFontFamily, activeColor, setActiveColor, inactiveColor, setInactiveColor,
    smoothingFactor, setSmoothingFactor, verticalOffset, setVerticalOffset, inactiveOpacity, setInactiveOpacity,
    visualMode, qt6Style, setQt6Style, qt6BarCount, setQt6BarCount, qt6Sensitivity, setQt6Sensitivity, 
        videoBitrate, setVideoBitrate,     videoBitrateMode, setVideoBitrateMode,     exportFormat, setExportFormat, colorSpaceFix, setColorSpaceFix,
    onReset, onAiSuggest
}) => {
  const [isSuggesting, setIsSuggesting] = React.useState(false);

  const handleSuggest = async () => {
      if (!onAiSuggest) return;
      setIsSuggesting(true);
      try {
          await onAiSuggest();
      } catch (e: any) {
          console.error(e);
          let errorMsg = e.message || "Failed to generate AI suggestion.";
          if (errorMsg.includes("503") || errorMsg.includes("429") || errorMsg.includes("overloaded") || errorMsg.includes("timeout")) {
              errorMsg += "\n\n💡 Tip: The Gemini API seems to be overloaded right now. Trying a different model from the top-right Settings menu (e.g. Gemini Flash-Lite) often works!";
          }
          alert(errorMsg);
      } finally {
          setIsSuggesting(false);
      }
  };

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
                    {!VISUALIZER_FONTS.some(f => f.value === fontFamily) && (
                        <option key="custom" value={fontFamily}>
                            {fontFamily.split(',')[0].replace(/['"]/g, '')} (AI Suggested)
                        </option>
                    )}
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
                <label className="text-[10px] text-slate-500 block mb-1 flex justify-between">Export Format <span title="WebM preserves colors better and supports transparency. MP4 plays on iPhones.">?</span></label>
                <select 
                    value={exportFormat || 'mp4'}
                    onChange={(e) => setExportFormat && setExportFormat(e.target.value as 'mp4' | 'webm')}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-slate-200"
                >
                    <option value="mp4">MP4 (H.264)</option>
                    <option value="webm">WebM (VP8/VP9)</option>
                </select>
            </div>
                        
                        <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] text-slate-500 block mb-1 flex justify-between">
                    Color Space Fix <span title="Applies a CSS filter to prevent local video players from crushing blacks. Leave ON for local playback. Turn OFF if uploading to YouTube, as YouTube applies its own stretch.">?</span>
                </label>
                <div className="flex items-center h-[34px]">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={colorSpaceFix !== false} // Default true
                            onChange={(e) => setColorSpaceFix && setColorSpaceFix(e.target.checked)}
                        />
                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        <span className="ml-2 text-xs text-slate-300">{colorSpaceFix !== false ? 'ON (Local)' : 'OFF (YouTube)'}</span>
                    </label>
                </div>
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
            {onAiSuggest && (
                <div className="col-span-2 md:col-span-1 flex items-end">
                    <button 
                        onClick={handleSuggest}
                        disabled={isSuggesting}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-1.5 px-3 rounded flex items-center justify-center transition-colors disabled:opacity-50 h-[34px]"
                    >
                        {isSuggesting ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Suggesting...
                            </span>
                        ) : (
                            '✨ AI Suggestions'
                        )}
                    </button>
                </div>
            )}
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





