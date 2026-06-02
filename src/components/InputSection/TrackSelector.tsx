import React from 'react';

interface TrackSelectorProps {
  numTracks: number;
  onChange: (n: number) => void;
}

const TrackSelector: React.FC<TrackSelectorProps> = ({ numTracks, onChange }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-slate-300">Tracks to Generate</label>
            <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">{numTracks} {numTracks === 1 ? 'Track' : 'Tracks'}</span>
        </div>
        <input 
            type="range" 
            min="1" 
            max="7" 
            step="1" 
            value={numTracks}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-bold px-1">
            <span>Single</span>
            <span>Mini Album (EP)</span>
            <span>Full Album</span>
        </div>
    </div>
  );
};

export default TrackSelector;