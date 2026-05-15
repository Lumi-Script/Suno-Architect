import React from 'react';
import { SunoClip } from '../../types';

interface VisualizerHeaderProps {
  history: SunoClip[];
  selectedClipId: string;
  setSelectedClipId: (id: string) => void;
  manualId: string;
  setManualId: (id: string) => void;
  onManualLoad: () => void;
}

const VisualizerHeader: React.FC<VisualizerHeaderProps> = ({ 
    history, selectedClipId, setSelectedClipId, manualId, setManualId, onManualLoad 
}) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
            <h2 className="text-2xl font-bold text-white mb-1">Lyric Video Visualizer</h2>
            <p className="text-sm text-slate-400">Generate a high-quality WebM lyric video (Offline Render).</p>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
                <select 
                value={selectedClipId}
                onChange={(e) => setSelectedClipId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg p-2.5 focus:ring-purple-500 focus:border-purple-500 block w-full md:w-64"
                >
                    <option value="">Select from History...</option>
                    {history.filter(c => !c.id.startsWith('draft_')).map(c => (
                        <option key={c.id} value={c.id}>{c.title || c.id}</option>
                    ))}
                </select>
            </div>
        </div>
        
        <div className="flex gap-2 items-center pt-4 border-t border-slate-700/50">
        <input 
            type="text" 
            placeholder="Or paste Suno ID / UUID manually..." 
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-2.5 flex-1"
        />
        <button 
            onClick={onManualLoad}
            className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
        >
            Load ID
        </button>
        </div>
    </div>
  );
};

export default VisualizerHeader;