import React from 'react';

interface MetadataCardProps {
  lyricSource: string;
  setLyricSource: (val: string) => void;
  onApplyLyrics: () => void;
  applyStatus: 'idle' | 'applied';
  hasAlignment: boolean;
  useSyllables: boolean;
  setUseSyllables: (val: boolean) => void;
  onRefreshAlignment?: () => void;
  refreshStatus?: 'idle' | 'loading' | 'success' | 'error';
}

const MetadataCard: React.FC<MetadataCardProps> = ({ 
  lyricSource, 
  setLyricSource, 
  onApplyLyrics, 
  applyStatus, 
  hasAlignment,
  useSyllables,
  setUseSyllables,
  onRefreshAlignment,
  refreshStatus = 'idle'
}) => {
  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-lg">
      <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-700 flex justify-between items-center gap-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">Lyrics & Structure Source</h3>
          <div className="flex items-center gap-1.5 flex-shrink-0">
              {onRefreshAlignment && (
                  <button 
                      onClick={onRefreshAlignment}
                      disabled={refreshStatus === 'loading'}
                      className={`text-xs px-2.5 py-1 rounded transition-colors disabled:opacity-50 font-bold border flex items-center gap-1
                          ${refreshStatus === 'loading'
                              ? 'bg-slate-700 border-slate-600 text-slate-300 cursor-wait'
                              : refreshStatus === 'success'
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : refreshStatus === 'error'
                              ? 'bg-rose-600 border-rose-500 text-white'
                              : 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-200'}`}
                      title="Re-pull word & lyric alignment data from Suno"
                  >
                      <svg className={`w-3 h-3 ${refreshStatus === 'loading' ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {refreshStatus === 'loading' ? 'Pulling...' : refreshStatus === 'success' ? 'Aligned!' : 'Repull Alignment'}
                  </button>
              )}
              <button 
                  onClick={onApplyLyrics}
                  disabled={!hasAlignment}
                  className={`text-xs px-2.5 py-1 rounded transition-colors disabled:opacity-50 font-bold border
                      ${applyStatus === 'applied' 
                          ? 'bg-green-600 border-green-500 text-white' 
                          : 'bg-purple-600 hover:bg-purple-500 border-purple-500 text-white'}`}
                  title="Update lines based on this text"
              >
                  {applyStatus === 'applied' ? 'Applied!' : 'Apply Structure'}
              </button>
          </div>
      </div>
      <div className="p-2">
            <textarea 
              value={lyricSource}
              onChange={(e) => setLyricSource(e.target.value)}
              className="w-full h-40 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-300 placeholder-slate-600 focus:ring-1 focus:ring-purple-500 outline-none custom-scrollbar resize-none leading-relaxed"
              placeholder="Paste lyrics here. Use newlines to determine how lines are grouped in the visualizer."
            />
            
            <div className="mt-3 px-1 flex items-start gap-2">
                <input 
                    type="checkbox" 
                    id="use-syllables" 
                    checked={useSyllables}
                    onChange={(e) => setUseSyllables(e.target.checked)}
                    className="mt-0.5"
                />
                <label htmlFor="use-syllables" className="text-xs text-slate-400 cursor-pointer select-none">
                    Use syllable alignment (highlights individual syllables instead of full words).
                </label>
            </div>
            
            <p className="text-[10px] text-slate-500 mt-2 px-1">
              <strong>Tip:</strong> This text determines line breaks. Aligning is fuzzy; edit text to fix grouping issues.
            </p>
      </div>
    </div>
  );
};

export default MetadataCard;
