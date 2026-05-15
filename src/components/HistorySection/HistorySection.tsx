import React, { useState, useMemo } from 'react';
import { SunoClip, ParsedSunoOutput } from '../../types';
import { getSunoClip, getSunoFeed } from '../../services/sunoApi';
import HistoryToolbar from './HistoryToolbar';
import HistoryCard from './HistoryCard';
import DetailsModal from './DetailsModal';
import { stripMetaTags } from '../../utils/lyrics';

interface HistorySectionProps {
  history: SunoClip[];
  onUpdateClip: (id: string, updates: Partial<SunoClip>) => void;
  onAddClip: (clip: SunoClip | SunoClip[]) => void;
  sunoCookie?: string;
  onFetchHistory: (limit: number | 'all') => void;
  isSyncing: boolean;
  syncProgress?: string;
}

// Helper to map API response to SunoClip (reused logic)
const mapSunoClip = (clip: any): SunoClip => {
    const metadata = clip.metadata || {};
    const tags = metadata.tags || '';
    const prompt = metadata.prompt || '';
    const title = clip.title || 'Untitled';

    const originalData: ParsedSunoOutput = {
        style: tags,
        title: title,
        excludeStyles: metadata.negative_tags || '',
        advancedParams: '',
        vocalGender: '',
        weirdness: metadata.control_sliders?.weirdness_constraint ? Math.round(metadata.control_sliders.weirdness_constraint * 100) : 50,
        styleInfluence: metadata.control_sliders?.style_weight ? Math.round(metadata.control_sliders.style_weight * 100) : 50,
        lyricsWithTags: prompt,
        lyricsAlone: stripMetaTags(prompt),
        fullResponse: ''
    };

    return {
        id: clip.id,
        title: title,
        created_at: clip.created_at,
        model_name: clip.model_name || 'unknown',
        imageUrl: clip.image_url,
        imageLargeUrl: clip.image_large_url,
        explicit: clip.explicit,
        metadata: {
            tags: tags,
            prompt: prompt,
            negative_tags: metadata.negative_tags,
            duration: metadata.duration,
            max_bpm: metadata.max_bpm,
            min_bpm: metadata.min_bpm,
            avg_bpm: metadata.avg_bpm,
            key: metadata.key,
        },
        originalData: originalData
    };
};

const HistorySection: React.FC<HistorySectionProps> = ({ history, onUpdateClip, onAddClip, sunoCookie, onFetchHistory, isSyncing, syncProgress }) => {
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  
  // Search & Filter State
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SunoClip[] | null>(null);
  const [limit, setLimit] = useState<number>(50);

  // Derive the active clip from history to ensure we always have the latest data
  const selectedClip = useMemo(() => {
    // Check history first, then search results
    let clip = history.find(c => c.id === selectedClipId);
    if (!clip && searchResults) {
        clip = searchResults.find(c => c.id === selectedClipId);
    }
    return clip || null;
  }, [history, searchResults, selectedClipId]);

  const isDraft = (clip: SunoClip) => clip.id.startsWith('draft_');

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
                  const clip = mapSunoClip(data);
                  onAddClip(clip);
                  // Display the imported clip as a search result
                  setSearchResults([clip]);
              }
          } else {
              // Feed Search
              const data = await getSunoFeed(sunoCookie, limit, null, input);
              if (data && Array.isArray(data.clips)) {
                  const results = data.clips.map(mapSunoClip);
                  setSearchResults(results);
                  // Automatically merge search results into history persistence
                  onAddClip(results); 
              } else {
                  setSearchResults([]);
              }
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

  const displayList = (searchText && searchResults) ? searchResults : history;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <HistoryToolbar 
            count={history.length}
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
        />
        
        {displayList.length === 0 ? (
             <div className="text-center py-20 bg-slate-800/30 rounded-xl border-2 border-dashed border-slate-700">
                <p className="text-slate-500 mb-2">
                    {searchText && searchResults ? "No results found for search." : "Your history is empty."}
                </p>
                <p className="text-xs text-slate-600">
                    {searchText && searchResults ? "Try a different keyword." : "Generated songs and drafts will appear here."}
                </p>
             </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {displayList.map((clip) => (
                    <HistoryCard 
                        key={clip.id} 
                        clip={clip} 
                        onClick={() => setSelectedClipId(clip.id)}
                        isDraft={isDraft(clip)}
                    />
                ))}
            </div>
        )}

        {selectedClip && (
            <DetailsModal 
                clip={selectedClip} 
                onClose={() => setSelectedClipId(null)} 
                onUpdateClip={onUpdateClip}
                sunoCookie={sunoCookie}
                isDraft={isDraft(selectedClip)}
            />
        )}
    </div>
  );
};

export default HistorySection;