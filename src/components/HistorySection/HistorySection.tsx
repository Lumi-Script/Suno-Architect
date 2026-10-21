import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SunoClip, SunoWorkspace, ParsedSunoOutput } from '../../types';
import { getSunoClip, getSunoFeed, mapSunoClip } from '../../services/sunoApi';
import HistoryToolbar from './HistoryToolbar';
import HistoryCard from './HistoryCard';
import DetailsModal from './DetailsModal';
import { stripMetaTags } from '../../utils/lyrics';

interface HistorySectionProps {
  history: SunoClip[];
  onUpdateClip: (id: string, updates: Partial<SunoClip>) => void;
  onAddClip: (clip: SunoClip | SunoClip[]) => void;
  sunoCookie?: string;
  onFetchHistory: (limit: number | 'all', workspaceId?: string) => void;
  isSyncing: boolean;
  syncProgress?: string;
  workspaces: SunoWorkspace[];
  selectedWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  targetWorkspaceId: string;
  onTargetWorkspaceChange: (id: string) => void;
}

const HistorySection: React.FC<HistorySectionProps> = ({ 
    history, 
    onUpdateClip, 
    onAddClip, 
    sunoCookie, 
    onFetchHistory, 
    isSyncing, 
    syncProgress,
    workspaces,
    selectedWorkspaceId,
    onSelectWorkspace,
    targetWorkspaceId,
    onTargetWorkspaceChange
}) => {
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  
  // Search & Filter State
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SunoClip[] | null>(null);
  const [limit, setLimit] = useState<number | 'all'>(50);

  // Sorting state
  const [clipSort, setClipSort] = useState<'newest' | 'oldest' | 'title_asc' | 'title_desc' | 'duration'>('newest');

  // Compute live clip counts per workspace from loaded history
  const workspaceCounts = useMemo(() => {
    const counts: Record<string, number> = {
        all: history.length,
        drafts: 0,
        default: 0
    };

    history.forEach(clip => {
        if (clip.id.startsWith('draft_') || clip.workspaceId === 'drafts') {
            counts.drafts = (counts.drafts || 0) + 1;
        } else if (!clip.workspaceId || clip.workspaceId === 'default') {
            counts.default = (counts.default || 0) + 1;
        } else {
            counts[clip.workspaceId] = (counts[clip.workspaceId] || 0) + 1;
        }
    });

    return counts;
  }, [history]);

  // Filter clips by active workspace
  const workspaceClips = useMemo(() => {
    if (selectedWorkspaceId === 'all') {
        return history;
    }
    if (selectedWorkspaceId === 'drafts') {
        return history.filter(c => c.workspaceId === 'drafts' || c.id.startsWith('draft_'));
    }
    if (selectedWorkspaceId === 'default') {
        return history.filter(c => !c.id.startsWith('draft_') && c.workspaceId !== 'drafts' && (!c.workspaceId || c.workspaceId === 'default'));
    }
    return history.filter(c => c.workspaceId === selectedWorkspaceId);
  }, [history, selectedWorkspaceId]);

  // Sort filtered clips
  const sortedClips = useMemo(() => {
    const list = [...workspaceClips];
    switch (clipSort) {
        case 'oldest':
            return list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        case 'title_asc':
            return list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        case 'title_desc':
            return list.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        case 'duration':
            return list.sort((a, b) => (b.metadata?.duration || 0) - (a.metadata?.duration || 0));
        case 'newest':
        default:
            return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [workspaceClips, clipSort]);

  // Workspace Name Lookup Map
  const workspaceNameMap = useMemo(() => {
    const map = new Map<string, string>();
    map.set('drafts', 'Drafts');
    map.set('default', 'My Workspace');
    workspaces.forEach(w => {
        map.set(w.id, w.name);
    });
    return map;
  }, [workspaces]);

  // Derive the active clip from history to ensure we always have the latest data
  const selectedClip = useMemo(() => {
    let clip = history.find(c => c.id === selectedClipId);
    if (!clip && searchResults) {
        clip = searchResults.find(c => c.id === selectedClipId);
    }
    return clip || null;
  }, [history, searchResults, selectedClipId]);

  // Auto-fetch clips when switching to a workspace that has un-fetched tracks
  const fetchedWorkspacesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!sunoCookie || isSyncing) return;
    if (selectedWorkspaceId === 'drafts') return;

    // Check how many clips we currently have loaded for this workspace
    const clipsForThisWorkspace = workspaceClips.length;

    // Expected count from workspaces metadata
    const wsMeta = workspaces.find(w => w.id === selectedWorkspaceId);
    const expectedCount = wsMeta?.clip_count ?? 0;

    // Auto-fetch once per workspace if clips are missing
    if (!fetchedWorkspacesRef.current.has(selectedWorkspaceId)) {
        if (selectedWorkspaceId !== 'all' && clipsForThisWorkspace === 0 && expectedCount > 0) {
            fetchedWorkspacesRef.current.add(selectedWorkspaceId);
            onFetchHistory(limit, selectedWorkspaceId);
        }
    }
  }, [selectedWorkspaceId, sunoCookie, workspaceClips.length, workspaces, isSyncing, limit, onFetchHistory]);

  const isDraft = (clip: SunoClip) => clip.id.startsWith('draft_') || clip.workspaceId === 'drafts';

  const handleSearchOrImport = async () => {
      if (!searchText.trim()) return;
      if (!sunoCookie) {
          alert("Please connect Suno API in settings to search or import.");
          return;
      }
      
      setIsSearching(true);
      const input = searchText.trim();
      
      // UUID Check for Direct Import
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input);

      try {
          if (isUUID) {
              // Direct Import
              const data = await getSunoClip(input, sunoCookie);
              if (data) {
                  const targetWs = targetWorkspaceId || (selectedWorkspaceId !== 'all' ? selectedWorkspaceId : 'default');
                  const clip = mapSunoClip(data, targetWs);
                  onAddClip(clip);
                  setSearchResults([clip]);
              }
          } else {
              // Feed Search scoped to current workspace if selected
              let allClips: SunoClip[] = [];
              let hasMore = true;
              let cursor: string | null = null;
              
              const fetchSearchPage = async (limitVal: number, cursorVal: string | null): Promise<any> => {
                  let attempts = 0;
                  const maxAttempts = 10;
                  while (true) {
                      try {
                          return await getSunoFeed(
                              sunoCookie, 
                              limitVal, 
                              cursorVal, 
                              input,
                              selectedWorkspaceId !== 'all' ? selectedWorkspaceId : undefined
                          );
                      } catch (err: any) {
                          if (err.message === "429") {
                              attempts++;
                              if (attempts >= maxAttempts) {
                                  throw err;
                              }
                              await new Promise(resolve => setTimeout(resolve, 1000));
                              continue;
                          }
                          throw err;
                      }
                  }
              };

              if (limit === 'all') {
                  const pageSize = 100;
                  while (hasMore) {
                      const data = await fetchSearchPage(pageSize, cursor);
                      if (data && Array.isArray(data.clips)) {
                          const wsTarget = selectedWorkspaceId !== 'all' ? selectedWorkspaceId : undefined;
                          const results = data.clips.map((c: any) => mapSunoClip(c, wsTarget));
                          allClips = [...allClips, ...results];
                          
                          hasMore = data.has_more === true;
                          cursor = data.next_cursor || data.cursor || null;
                          if (!cursor) {
                              hasMore = false;
                          }
                          
                          await new Promise(r => setTimeout(r, 100));
                      } else {
                          hasMore = false;
                      }
                  }
              } else {
                  const data = await fetchSearchPage(limit, null);
                  if (data && Array.isArray(data.clips)) {
                      const wsTarget = selectedWorkspaceId !== 'all' ? selectedWorkspaceId : undefined;
                      allClips = data.clips.map((c: any) => mapSunoClip(c, wsTarget));
                  }
              }

              setSearchResults(allClips);
              onAddClip(allClips);
          }
      } catch (e: any) {
          console.error("Search/Import failed", e);
          alert("Failed to process request. Check ID/Connection.");
      } finally {
          setIsSearching(false);
      }
  };

  const handleClearSearch = () => {
      setSearchText('');
      setSearchResults(null);
  };

  const displayList = (searchText && searchResults) ? searchResults : sortedClips;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <HistoryToolbar 
            count={sortedClips.length}
            searchText={searchText}
            setSearchText={setSearchText}
            onAction={handleSearchOrImport}
            isActionLoading={isSearching}
            onFetchHistory={onFetchHistory}
            isSyncing={isSyncing}
            syncProgress={syncProgress}
            limit={limit}
            setLimit={setLimit}
            onClearSearch={handleClearSearch}
            isShowingSearchResults={!!(searchText && searchResults)}
            workspaces={workspaces}
            selectedWorkspaceId={selectedWorkspaceId}
            onSelectWorkspace={onSelectWorkspace}
            targetWorkspaceId={targetWorkspaceId}
            onTargetWorkspaceChange={onTargetWorkspaceChange}
            clipSort={clipSort}
            onClipSortChange={setClipSort}
            workspaceCounts={workspaceCounts}
        />
        
        {displayList.length === 0 ? (
             <div className="text-center py-20 bg-slate-800/30 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center p-6">
                {isSyncing ? (
                    <div className="flex flex-col items-center justify-center gap-3">
                        <svg className="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-slate-300 font-medium text-sm">
                            Fetching tracks from Suno for {workspaceNameMap.get(selectedWorkspaceId) || 'this workspace'}...
                        </p>
                        <p className="text-xs text-slate-500">
                            {syncProgress || 'Connecting to Suno library...'}
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="text-slate-400 font-medium mb-1">
                            {searchText && searchResults 
                                ? "No results found for search." 
                                : selectedWorkspaceId === 'drafts'
                                    ? "No drafts found. Generate lyrics in the Architect tab to create prompt drafts."
                                    : `No tracks found in ${workspaceNameMap.get(selectedWorkspaceId) || 'this workspace'}.`}
                        </p>
                        <p className="text-xs text-slate-500">
                            {searchText && searchResults 
                                ? "Try a different keyword or paste a clip UUID." 
                                : selectedWorkspaceId === 'drafts'
                                    ? "Drafts are preserved locally in your browser's IndexedDB."
                                    : "Click 'Fetch' in the toolbar or below to pull items from Suno into this workspace."}
                        </p>
                        {selectedWorkspaceId !== 'drafts' && sunoCookie && (
                            <button
                                onClick={() => onFetchHistory(limit, selectedWorkspaceId)}
                                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-2 shadow-md cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                    <path d="M3 3v5h5" />
                                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                                    <path d="M16 16h5v5" />
                                </svg>
                                <span>Fetch Tracks from Suno</span>
                            </button>
                        )}
                    </>
                )}
             </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {displayList.map((clip) => {
                    const wsName = workspaceNameMap.get(clip.workspaceId || (clip.id.startsWith('draft_') ? 'drafts' : 'default'));
                    return (
                        <HistoryCard 
                            key={clip.id} 
                            clip={clip} 
                            onClick={() => setSelectedClipId(clip.id)}
                            isDraft={isDraft(clip)}
                            workspaceName={wsName}
                        />
                    );
                })}
            </div>
        )}

        {selectedClip && (
            <DetailsModal 
                clip={selectedClip} 
                onClose={() => setSelectedClipId(null)} 
                onUpdateClip={onUpdateClip}
                sunoCookie={sunoCookie}
                isDraft={isDraft(selectedClip)}
                workspaces={workspaces}
            />
        )}
    </div>
  );
};

export default HistorySection;
