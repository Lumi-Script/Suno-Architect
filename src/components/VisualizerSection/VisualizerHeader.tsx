import React, { useMemo, useRef, useEffect } from 'react';
import { SunoClip, SunoWorkspace } from '../../types';

interface VisualizerHeaderProps {
  history: SunoClip[];
  selectedClipId: string;
  setSelectedClipId: (id: string) => void;
  manualId: string;
  setManualId: (id: string) => void;
  onManualLoad: () => void;
  workspaces?: SunoWorkspace[];
  selectedWorkspaceId?: string;
  onSelectWorkspace?: (id: string) => void;
  onFetchHistory?: (limit: number | 'all', workspaceId?: string) => void;
  isSyncing?: boolean;
  syncProgress?: string;
}

const VisualizerHeader: React.FC<VisualizerHeaderProps> = ({ 
    history, 
    selectedClipId, 
    setSelectedClipId, 
    manualId, 
    setManualId, 
    onManualLoad,
    workspaces = [],
    selectedWorkspaceId = 'all',
    onSelectWorkspace,
    onFetchHistory,
    isSyncing = false,
    syncProgress
}) => {
  // Live counts per workspace
  const workspaceCounts = useMemo(() => {
    const counts: Record<string, number> = { all: history.length, drafts: 0, default: 0 };
    history.forEach(c => {
      if (c.id.startsWith('draft_') || c.workspaceId === 'drafts') {
        counts.drafts = (counts.drafts || 0) + 1;
      } else if (!c.workspaceId || c.workspaceId === 'default') {
        counts.default = (counts.default || 0) + 1;
      } else {
        counts[c.workspaceId] = (counts[c.workspaceId] || 0) + 1;
      }
    });
    return counts;
  }, [history]);

  const getCount = (id: string, fallback?: number) => {
    if (workspaceCounts && typeof workspaceCounts[id] === 'number') {
      return workspaceCounts[id];
    }
    return fallback ?? 0;
  };

  const sortedWorkspaces = useMemo(() => {
    const list = [...(workspaces || [])];
    return list.sort((a, b) => {
      if (a.id === 'drafts') return -1;
      if (b.id === 'drafts') return 1;
      if (a.id === 'default') return -1;
      if (b.id === 'default') return 1;
      const dateA = a.last_updated_clip ? new Date(a.last_updated_clip).getTime() : 0;
      const dateB = b.last_updated_clip ? new Date(b.last_updated_clip).getTime() : 0;
      return dateB - dateA;
    });
  }, [workspaces]);

  // Filter history clips by selected workspace
  const filteredHistory = useMemo(() => {
    if (!selectedWorkspaceId || selectedWorkspaceId === 'all') {
      return history.filter(c => !c.id.startsWith('draft_'));
    }
    if (selectedWorkspaceId === 'drafts') {
      return history.filter(c => c.workspaceId === 'drafts' || c.id.startsWith('draft_'));
    }
    if (selectedWorkspaceId === 'default') {
      return history.filter(c => !c.id.startsWith('draft_') && c.workspaceId !== 'drafts' && (!c.workspaceId || c.workspaceId === 'default'));
    }
    return history.filter(c => c.workspaceId === selectedWorkspaceId);
  }, [history, selectedWorkspaceId]);

  // Auto-fetch if the selected workspace has 0 local clips
  const fetchedWsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!onFetchHistory || isSyncing) return;
    if (!selectedWorkspaceId || selectedWorkspaceId === 'all' || selectedWorkspaceId === 'drafts') return;

    const wsMeta = workspaces.find(w => w.id === selectedWorkspaceId);
    const expected = wsMeta?.clip_count ?? 0;

    if (!fetchedWsRef.current.has(selectedWorkspaceId) && filteredHistory.length === 0 && expected > 0) {
      fetchedWsRef.current.add(selectedWorkspaceId);
      onFetchHistory(50, selectedWorkspaceId);
    }
  }, [selectedWorkspaceId, filteredHistory.length, workspaces, isSyncing, onFetchHistory]);

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-1">Lyric Video Visualizer</h2>
                <p className="text-sm text-slate-400">Generate a high-quality WebM lyric video (Offline Render).</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                {/* Workspace Selector */}
                {onSelectWorkspace && (
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5">
                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Workspace:</span>
                        <select
                            value={selectedWorkspaceId}
                            onChange={(e) => onSelectWorkspace(e.target.value)}
                            className="bg-transparent border-none text-purple-300 font-semibold text-xs outline-none cursor-pointer focus:ring-0 pr-2"
                        >
                            <option value="all" className="bg-slate-900 text-purple-300">🌐 All Workspaces ({history.length})</option>
                            <option value="drafts" className="bg-slate-900 text-purple-300">📝 Drafts ({getCount('drafts', 0)})</option>
                            <option value="default" className="bg-slate-900 text-purple-300">📁 My Workspace ({getCount('default', 0)})</option>
                            {sortedWorkspaces
                                .filter(w => w.id !== 'drafts' && w.id !== 'default')
                                .map(w => (
                                    <option key={w.id} value={w.id} className="bg-slate-900 text-purple-300">
                                        📂 {w.name} ({getCount(w.id, w.clip_count)})
                                    </option>
                                ))}
                        </select>
                    </div>
                )}

                {/* Track Selector */}
                <select 
                    value={selectedClipId}
                    onChange={(e) => setSelectedClipId(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-purple-500 outline-none block w-full sm:w-64"
                >
                    <option value="">
                        {isSyncing ? 'Syncing tracks from Suno...' : `Select Track (${filteredHistory.length} available)...`}
                    </option>
                    {filteredHistory.map(c => (
                        <option key={c.id} value={c.id}>{c.title || c.id}</option>
                    ))}
                </select>

                {/* Quick Fetch button */}
                {onFetchHistory && selectedWorkspaceId && selectedWorkspaceId !== 'drafts' && (
                    <button
                        onClick={() => onFetchHistory(50, selectedWorkspaceId)}
                        disabled={isSyncing}
                        title={isSyncing ? (syncProgress || 'Syncing...') : 'Fetch tracks from Suno'}
                        className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center border border-slate-700 cursor-pointer
                        ${isSyncing 
                            ? 'bg-slate-800 text-slate-400 cursor-wait' 
                            : 'bg-slate-800 hover:bg-purple-600 text-white'}`}
                    >
                        {isSyncing ? (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                <path d="M3 3v5h5" />
                                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                                <path d="M16 16h5v5" />
                            </svg>
                        )}
                    </button>
                )}
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
                className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors cursor-pointer"
            >
                Load ID
            </button>
        </div>
    </div>
  );
};

export default VisualizerHeader;
