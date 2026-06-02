import React, { useState } from 'react';
import { ColorEvent } from '../../../types';
import { formatTime } from '../../../utils/visualizer';

interface ColorEventsManagerProps {
    colorEvents: ColorEvent[];
    onAddEvent: (event: ColorEvent) => void;
    onRemoveEvent: (index: number) => void;
    onUpdateEvent: (index: number, event: ColorEvent) => void;
    currentTime: number;
    activeColor: string;
    inactiveColor: string;
}

const ColorEventsManager: React.FC<ColorEventsManagerProps> = ({
    colorEvents, onAddEvent, onRemoveEvent, onUpdateEvent, currentTime, activeColor, inactiveColor
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleAddCurrent = () => {
        onAddEvent({
            time: currentTime,
            activeColor: activeColor,
            inactiveColor: inactiveColor
        });
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mt-4">
            <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span>Color Change Events</span>
                    <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px]">{colorEvents.length}</span>
                </h3>
                <button className="text-slate-500 hover:text-slate-300">
                    {isExpanded ? '▼' : '▶'}
                </button>
            </div>

            {isExpanded && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Current Time: {formatTime(currentTime)}</span>
                        <button 
                            onClick={handleAddCurrent}
                            className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded transition-colors"
                        >
                            + Add Event at {formatTime(currentTime)}
                        </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                        {colorEvents.length === 0 && (
                            <div className="text-center py-4 text-xs text-slate-600 italic">
                                No color changes added. The default colors will be used throughout.
                            </div>
                        )}
                        {[...colorEvents].sort((a, b) => a.time - b.time).map((event, idx) => (
                            <div key={idx} className="bg-slate-800/50 rounded p-2 flex items-center gap-3 border border-slate-700/50">
                                <div className="w-16">
                                    <label className="text-[9px] text-slate-500 block">Time</label>
                                    <input 
                                        type="number" 
                                        step="0.1"
                                        value={event.time}
                                        onChange={(e) => onUpdateEvent(idx, { ...event, time: parseFloat(e.target.value) })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-xs text-slate-300"
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-[9px] text-slate-500 block">Active</label>
                                    <div className="flex items-center gap-1">
                                        <input 
                                            type="color" 
                                            value={event.activeColor}
                                            onChange={(e) => onUpdateEvent(idx, { ...event, activeColor: e.target.value })}
                                            className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0" 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[9px] text-slate-500 block">Inactive</label>
                                    <div className="flex items-center gap-1">
                                        <input 
                                            type="color" 
                                            value={event.inactiveColor}
                                            onChange={(e) => onUpdateEvent(idx, { ...event, inactiveColor: e.target.value })}
                                            className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0" 
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 text-right">
                                    <button 
                                        onClick={() => onRemoveEvent(idx)}
                                        className="text-red-400 hover:text-red-300 p-1 hover:bg-red-900/20 rounded"
                                        title="Remove Event"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColorEventsManager;
