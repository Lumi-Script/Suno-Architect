import React from 'react';

interface MetadataCardProps {
  lyricSource: string;
  setLyricSource: (val: string) => void;
  onApplyLyrics: () => void;
  applyStatus: 'idle' | 'applied';
  hasAlignment: boolean;
}

const MetadataCard: React.FC<MetadataCardProps> = ({ 
  lyricSource, 
  setLyricSource, 
  onApplyLyrics, 
  applyStatus, 
  hasAlignment 
}) => {
  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-lg">
      <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lyrics & Structure Source</h3>
          <button 
              onClick={onApplyLyrics}
              disabled={!hasAlignment}
              className={`text-xs px-2 py-1 rounded transition-colors disabled:opacity-50 font-bold border
                  ${applyStatus === 'applied' 
                      ? 'bg-green-600 border-green-500 text-white' 
                      : 'bg-purple-600 hover:bg-purple-500 border-purple-500 text-white'}`}
              title="Update lines based on this text"
          >
              {applyStatus === 'applied' ? 'Applied!' : 'Apply Structure'}
          </button>
      </div>
      <div className="p-2">
            <textarea 
              value={lyricSource}
              onChange={(e) => setLyricSource(e.target.value)}
              className="w-full h-40 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-300 placeholder-slate-600 focus:ring-1 focus:ring-purple-500 outline-none custom-scrollbar resize-none leading-relaxed"
              placeholder="Paste lyrics here. Use newlines to determine how lines are grouped in the visualizer."
            />
            <p className="text-[10px] text-slate-500 mt-2 px-1">
              <strong>Tip:</strong> This text determines line breaks. Aligning is fuzzy; edit text to fix grouping issues.
            </p>
      </div>
    </div>
  );
};

export default MetadataCard;
