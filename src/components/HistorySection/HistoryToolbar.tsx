import React from 'react';
import { SunoWorkspace } from '../../types';

interface HistoryToolbarProps {
  count: number;
  searchText: string;
  setSearchText: (text: string) => void;
  onAction: () => void;
  isActionLoading: boolean;
  onFetchHistory: (limit: number | 'all', workspaceId?: string) => void;
  isSyncing: boolean;
  syncProgress?: string;
  limit: number | 'all';
  setLimit: (limit: number | 'all') => void;
  onClearSearch: () => void;
  isShowingSearchResults: boolean;
  workspaces?: SunoWorkspace[];
  selectedWorkspaceId?: string;
  onSelectWorkspace?: (id: string) => void;
  targetWorkspaceId?: string;
  onTargetWorkspaceChange?: (id: string) => void;
  clipSort?: 'newest' | 'oldest' | 'title_asc' | 'title_desc' | 'duration';
  onClipSortChange?: (sort: 'newest' | 'oldest' | 'title_asc' | 'title_desc' | 'duration') => void;
  workspaceCounts?: Record<string, number>;
}

const HistoryToolbar: React.FC<HistoryToolbarProps> = ({ 
    count = 0, 
    searchText = '', 
    setSearchText, 
    onAction, 
    isActionLoading = false, 
    onFetchHistory, 
    isSyncing = false, 
    syncProgress,
    limit = 50, 
    setLimit, 
    onClearSearch, 
    isShowingSearchResults = false,
    workspaces = [],
    selectedWorkspaceId = 'all',
    onSelectWorkspace,
    targetWorkspaceId = 'default',
    onTargetWorkspaceChange,
    clipSort = 'newest',
    onClipSortChange,
    workspaceCounts = {}
}) => {
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          onAction();
      }
  };

  // Safe counts getter
  const getCount = (id: string, fallback?: number) => {
      if (workspaceCounts && typeof workspaceCounts[id] === 'number') {
          return workspaceCounts[id];
      }
      return fallback ?? 0;
  };

  // Sort workspaces for selector display (recent first with drafts and default pinned)
  const sortedWorkspaces = React.useMemo(() => {
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

  const defaultWs = React.useMemo(() => (workspaces || []).find(w => w.id === 'default'), [workspaces]);
  const totalApiClips = React.useMemo(() => {
    return (workspaces || []).reduce((acc, w) => acc + (w.id !== 'drafts' ? (w.clip_count || 0) : 0), 0);
  }, [workspaces]);

  const activeWorkspaceName = React.useMemo(() => {
    if (selectedWorkspaceId === 'all') return 'All Workspaces';
    if (selectedWorkspaceId === 'drafts') return 'Drafts (Phantom)';
    const found = (workspaces || []).find(w => w.id === selectedWorkspaceId);
    return found ? found.name : 'Workspace';
  }, [selectedWorkspaceId, workspaces]);

  return (
    <div className="flex flex-col gap-4 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 backdrop-blur-md shadow-lg">
        {/* Top Row: Title, active workspace info, and quick search */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-shrink-0">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 flex-wrap">
                    {isShowingSearchResults ? 'Search Results' : 'Library & Workspaces'}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {activeWorkspaceName}
                    </span>
                    {isShowingSearchResults && (
                        <button 
                            onClick={onClearSearch}
                            className="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-0.5 rounded text-slate-300 transition-colors flex items-center gap-1"
                        >
                            Clear
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                 <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                        </button>
                    )}
                    {!isShowingSearchResults && <span className="text-xs font-normal text-slate-400">({count} items in view)</span>}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                    {isShowingSearchResults 
                        ? `Showing results for "${searchText}"` 
                        : "Filter by workspace, organize Suno clips, and route new generations."}
                </p>
            </div>
            
            {/* Search / Import Bar */}
            <div className="flex gap-2 w-full lg:w-auto items-center">
                <div className="relative flex-grow lg:w-72">
                    <input 
                        type="text" 
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search songs or paste Suno UUID..."
                        className="bg-slate-950 border border-slate-700 text-white text-xs rounded-lg pl-8 pr-3 py-2 focus:ring-1 focus:ring-purple-500 outline-none w-full"
                    />
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
                <button 
                    onClick={onAction}
                    disabled={isActionLoading || !searchText.trim()}
                    className="px-3 py-2 bg-slate-800 hover:bg-purple-600 text-white text-xs font-bold rounded-lg transition-colors border border-slate-700 whitespace-nowrap"
                >
                    {isActionLoading ? '...' : 'Add / Search'}
                </button>
            </div>
        </div>

        {/* Second Row: Workspace Switching, Target Workspace for New Items, Sorting, and Syncing */}
        <div className="pt-3 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* Workspace Filter & Sorting */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 font-medium">Workspace:</span>
                <select
                    value={selectedWorkspaceId}
                    onChange={(e) => onSelectWorkspace && onSelectWorkspace(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-purple-300 font-medium rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-purple-500 outline-none cursor-pointer"
                >
                    <option value="all">🌐 All Workspaces ({getCount('all', totalApiClips || count)})</option>
                    <option value="drafts">📝 Drafts (Phantom) ({getCount('drafts', 0)})</option>
                    <option value="default">📁 My Workspace (Default) ({getCount('default', defaultWs?.clip_count)})</option>
                    {sortedWorkspaces
                        .filter(w => w.id !== 'drafts' && w.id !== 'default')
                        .map(w => (
                            <option key={w.id} value={w.id}>
                                📂 {w.name} ({getCount(w.id, w.clip_count)})
                            </option>
                        ))}
                </select>

                {/* Clips Sorter */}
                {onClipSortChange && (
                    <div className="flex items-center gap-1.5 ml-1">
                        <span className="text-slate-400">Sort Clips:</span>
                        <select
                            value={clipSort}
                            onChange={(e) => onClipSortChange(e.target.value as any)}
                            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-purple-500 outline-none cursor-pointer"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="title_asc">Title (A-Z)</option>
                            <option value="title_desc">Title (Z-A)</option>
                            <option value="duration">Longest Duration</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Target Workspace Selector for New Items & Fetch controls */}
            <div className="flex flex-wrap items-center gap-2.5 ml-auto">
                {onTargetWorkspaceChange && (
                    <div className="flex items-center gap-1.5 bg-slate-900/70 border border-slate-700/80 px-2 py-1 rounded-lg" title="Determines where newly created, synced, or imported items will be placed">
                        <span className="text-[11px] text-slate-400 whitespace-nowrap">New Items Go To:</span>
                        <select
                            value={targetWorkspaceId}
                            onChange={(e) => onTargetWorkspaceChange(e.target.value)}
                            className="bg-slate-800 border-none text-purple-300 font-semibold text-xs rounded py-1 px-1.5 focus:ring-1 focus:ring-purple-500 outline-none cursor-pointer"
                        >
                            <option value="default">📁 My Workspace</option>
                            {workspaces
                                .filter(w => w.id !== 'drafts' && w.id !== 'default')
                                .map(w => (
                                    <option key={w.id} value={w.id}>📂 {w.name}</option>
                                ))}
                        </select>
                    </div>
                )}

                {/* Fetch & Limit Selector */}
                <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-700">
                    <select
                        value={limit}
                        onChange={(e) => {
                            const val = e.target.value;
                            setLimit(val === 'all' ? 'all' : Number(val));
                        }}
                        disabled={isSyncing}
                        className="bg-slate-800 border-none text-white text-xs rounded-md py-1.5 px-2 focus:ring-1 focus:ring-purple-500 outline-none cursor-pointer"
                    >
                        <option value={50}>50 items</option>
                        <option value={100}>100 items</option>
                        <option value={200}>200 items</option>
                        <option value="all">All items</option>
                    </select>

                    <button
                        onClick={() => onFetchHistory(limit, selectedWorkspaceId)}
                        disabled={isSyncing}
                        title={selectedWorkspaceId === 'drafts' ? 'Drafts are stored locally' : `Fetch from Suno for ${activeWorkspaceName}`}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap
                        ${isSyncing 
                        ? 'bg-slate-700/50 text-slate-400 cursor-wait' 
                        : selectedWorkspaceId === 'drafts'
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'}`}
                    >
                        {isSyncing ? (
                            <>
                                <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>{syncProgress || 'Syncing...'}</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                <path d="M3 3v5h5" />
                                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                                <path d="M16 16h5v5" />
                                </svg>
                                <span>Fetch</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default HistoryToolbar;
