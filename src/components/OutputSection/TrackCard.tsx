
import React from 'react';
import { ParsedSunoOutput } from '../../types';
import CopyButton from '../CopyButton';

interface TrackCardProps {
  data: ParsedSunoOutput;
  index: number;
  totalTracks: number;
  status: { loading: boolean, error?: string, success?: boolean };
  sunoCookie?: string;
  onSync: () => void;
  onEdit: () => void;
}

const TrackCard: React.FC<TrackCardProps> = ({ data, index, totalTracks, status, sunoCookie, onSync, onEdit }) => {
  const metaItemsCount = [data.title, data.style, data.excludeStyles, data.advancedParams].filter(Boolean).length;
  const gridClass = metaItemsCount >= 4 
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4" 
    : metaItemsCount >= 3
        ? "grid grid-cols-1 md:grid-cols-3 gap-4"
        : "grid grid-cols-1 md:grid-cols-2 gap-4";

  return (
    <div className="space-y-6 relative pb-12 border-b border-slate-800 last:border-0 last:pb-0">
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
                {totalTracks > 1 && (
                    <span className="bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-slate-700">Track {index + 1}</span>
                )}
                {status.success && <span className="text-xs text-green-400 font-bold">✓ Synced</span>}
            </div>
            <button 
                onClick={onEdit}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800/50 hover:bg-slate-800 px-2 py-1 rounded transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
            </button>
        </div>
        
        {/* Meta Data Grid */}
        <div className={gridClass}>
            {data.title && (
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow-lg flex flex-col">
                    <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-700 flex justify-between items-center shrink-0">
                        <h3 className="text-sm font-semibold text-emerald-300 uppercase tracking-wider">Title</h3>
                        <CopyButton text={data.title} label="Copy" />
                    </div>
                    <div className="p-4 bg-slate-900/30 flex-grow flex items-center justify-center">
                        <p className="font-mono text-lg font-bold text-white text-center whitespace-pre-wrap break-words">{data.title}</p>
                    </div>
                </div>
            )}
            {data.style && (
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow-lg flex flex-col">
                    <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-700 flex justify-between items-center shrink-0">
                        <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider">Style</h3>
                        <CopyButton text={data.style} label="Copy" />
                    </div>
                    <div className="p-4 bg-slate-900/30 flex-grow">
                        <pre className="whitespace-pre-wrap font-mono text-sm text-slate-300 w-full break-words">{data.style}</pre>
                    </div>
                </div>
            )}
            {data.excludeStyles && (
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow-lg flex flex-col">
                    <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-700 flex justify-between items-center shrink-0">
                        <h3 className="text-sm font-semibold text-red-300 uppercase tracking-wider">Negative</h3>
                        <CopyButton text={data.excludeStyles} label="Copy" />
                    </div>
                    <div className="p-4 bg-slate-900/30 flex-grow">
                        <pre className="whitespace-pre-wrap font-mono text-sm text-red-300/80 w-full break-words">{data.excludeStyles}</pre>
                    </div>
                </div>
            )}
            {data.advancedParams && (
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow-lg flex flex-col">
                    <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-700 flex justify-between items-center shrink-0">
                        <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider">Parameters</h3>
                        <CopyButton text={data.advancedParams} label="Copy" />
                    </div>
                    <div className="p-4 bg-slate-900/30 flex-grow">
                        <pre className="whitespace-pre-wrap font-mono text-sm text-blue-300/80 w-full break-words">{data.advancedParams}</pre>
                    </div>
                </div>
            )}
        </div>

        {/* Lyrics Section */}
        {data.lyricsWithTags && (
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
                <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-pink-300 uppercase tracking-wider">Lyrics</h3>
                    <div className="flex items-center gap-2">
                        {sunoCookie && (
                            <button
                                onClick={onSync}
                                disabled={status.loading}
                                title={status.success ? "Sync again (creates new generation)" : "Sync to Suno"}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border flex items-center space-x-2
                                ${status.loading 
                                    ? 'bg-pink-600/50 border-pink-500/50 text-white cursor-wait' 
                                    : status.success
                                        ? 'bg-green-600/20 border-green-500/30 text-green-400 hover:bg-green-600/30 hover:border-green-500/50 hover:text-green-300'
                                        : 'bg-pink-700/80 border-pink-600 text-pink-100 hover:bg-pink-600'}`}
                            >
                                {status.loading ? (
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : status.success ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                )}
                                <span>{status.loading ? 'Syncing...' : status.success ? 'Synced' : 'Sync to Suno'}</span>
                            </button>
                        )}
                        <CopyButton text={data.lyricsWithTags} label="Copy" />
                    </div>
                </div>
                <div className="p-4 bg-slate-900/30">
                    {status.error && (
                        <div className="mb-4 p-2 bg-red-500/20 text-red-300 text-xs rounded border border-red-500/30">
                            <strong>Sync Error:</strong> {status.error}
                        </div>
                    )}
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        <pre className="whitespace-pre-wrap font-mono text-sm text-slate-300 leading-relaxed break-words">{data.lyricsWithTags}</pre>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default TrackCard;
