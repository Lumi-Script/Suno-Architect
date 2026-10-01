import React, { useState, useEffect } from 'react';
import { ParsedSunoOutput, PromptSettings } from '../../types';
import { triggerSunoGeneration, createSunoPlaylist, updateSunoPlaylistClips } from '../../services/sunoGenApi';
import EditSongModal from '../HistorySection/EditSongModal';
import AlbumHeader from './AlbumHeader';
import TrackCard from './TrackCard';
import CleanLyricsToggle from '../CleanLyricsToggle';

interface OutputSectionProps {
  results: ParsedSunoOutput[];
  sunoCookie?: string;
  sunoModel?: string;
  promptSettings?: PromptSettings;
  onSyncSuccess?: (response: any, originalData: ParsedSunoOutput, cleanLyrics: boolean) => void;
  onUpdateTrack?: (index: number, updatedTrack: ParsedSunoOutput) => void;
}

const OutputSection: React.FC<OutputSectionProps> = ({ results, sunoCookie, sunoModel, promptSettings, onSyncSuccess, onUpdateTrack }) => {
  const [syncAllLoading, setSyncAllLoading] = useState(false);
  const [syncStatuses, setSyncStatuses] = useState<Record<number, {loading: boolean, error?: string, success?: boolean, clipIds?: string[]}>>({});
  const [cleanLyricsToggles, setCleanLyricsToggles] = useState<Record<number, boolean>>({});
  const [masterCleanLyrics, setMasterCleanLyrics] = useState(true);
  const [createPlaylist, setCreatePlaylist] = useState(false);
  
  // Editing State
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Initialize cleanLyricsToggles when results change
  useEffect(() => {
    const initialToggles: Record<number, boolean> = {};
    results.forEach((_, index) => {
      initialToggles[index] = true;
    });
    setCleanLyricsToggles(initialToggles);
    setMasterCleanLyrics(true);
  }, [results]);

  // Update master toggle based on individual toggles
  useEffect(() => {
    if (results.length === 0) return;
    const allChecked = results.every((_, index) => cleanLyricsToggles[index] !== false);
    if (allChecked !== masterCleanLyrics) {
      setMasterCleanLyrics(allChecked);
    }
  }, [cleanLyricsToggles, results, masterCleanLyrics]);

  const handleMasterToggleChange = (checked: boolean) => {
    setMasterCleanLyrics(checked);
    const newToggles: Record<number, boolean> = {};
    results.forEach((_, index) => {
      newToggles[index] = checked;
    });
    setCleanLyricsToggles(newToggles);
  };

  const handleTrackToggleChange = (index: number, checked: boolean) => {
    setCleanLyricsToggles(prev => ({ ...prev, [index]: checked }));
  };

  const handleSyncTrack = async (data: ParsedSunoOutput, index: number) => {
    if (!sunoCookie) return null;
    
    setSyncStatuses(prev => ({ ...prev, [index]: { loading: true } }));
    const shouldClean = cleanLyricsToggles[index] !== false;
    
    try {
        const pId = promptSettings?.includeVoice ? promptSettings.personaId : undefined;
        const aWeight = promptSettings?.includeVoice ? promptSettings.audioWeight : undefined;
        const result = await triggerSunoGeneration(data, sunoCookie, sunoModel, pId, aWeight);
        setSyncStatuses(prev => ({ ...prev, [index]: { loading: false, success: true } }));
        if (onSyncSuccess) {
            onSyncSuccess(result, data, shouldClean);
        }
        return result;
    } catch (err: any) {
        setSyncStatuses(prev => ({ ...prev, [index]: { loading: false, error: err.message || "Failed" } }));
        return null;
    }
  };

  const handleSyncAll = async () => {
    if (!sunoCookie || results.length === 0) return;
    setSyncAllLoading(true);
    
    let playlistV1Id: string | null = null;
    let playlistV2Id: string | null = null;

    if (createPlaylist) {
        const title1 = results[0]?.title || "Album";
        const v1 = await createSunoPlaylist(`${title1} v1`, sunoCookie);
        const v2 = await createSunoPlaylist(`${title1} v2`, sunoCookie);
        
        // Handle various response formats from Suno API
        playlistV1Id = v1?.id || v1?.playlist_id || v1?.playlist?.id || (typeof v1 === 'string' ? v1 : null);
        playlistV2Id = v2?.id || v2?.playlist_id || v2?.playlist?.id || (typeof v2 === 'string' ? v2 : null);
        
        if (!playlistV1Id || !playlistV2Id) {
            console.warn("Failed to extract playlist IDs", { v1, v2 });
        }
    }

    // Process sequentially to avoid heavy rate limiting or context mixing
    for (let i = 0; i < results.length; i++) {
        const track = results[i];
        
        // If already synced and we don't have clips to add, we can't add it.
        // We will just skip, but if we need to force playlist add, user should refresh.
        if (syncStatuses[i]?.success && !syncStatuses[i]?.clipIds) continue;
        
        let clipsToUse = syncStatuses[i]?.clipIds;
        
        if (!syncStatuses[i]?.success) {
            const result = await handleSyncTrack(track, i);
            let actualClips: any[] = [];
            
            if (result && Array.isArray(result.clips)) {
                actualClips = result.clips;
            } else if (Array.isArray(result)) {
                actualClips = result;
            } else if (result && result.id) {
                actualClips = [result];
            }
            
            if (actualClips && actualClips.length > 0) {
                clipsToUse = actualClips.map((c: any) => c.id || c).filter(Boolean);
                setSyncStatuses(prev => ({ 
                    ...prev, 
                    [i]: { ...prev[i], clipIds: clipsToUse } 
                }));
            } else {
                console.warn("Could not find clips in generation result", result);
            }
        }
        
        // Add to playlists if applicable
        if (clipsToUse && clipsToUse.length > 0 && createPlaylist) {
            const clip1Id = clipsToUse[0];
            const clip2Id = clipsToUse.length > 1 ? clipsToUse[1] : null;

            if (playlistV1Id && clip1Id) {
                await updateSunoPlaylistClips(playlistV1Id, [clip1Id], sunoCookie);
            }
            if (playlistV2Id && clip2Id) {
                await updateSunoPlaylistClips(playlistV2Id, [clip2Id], sunoCookie);
            }
        }
    }
    
    setSyncAllLoading(false);
  };

  const handleSaveEdit = (updatedData: ParsedSunoOutput) => {
      if (editingIndex !== null && onUpdateTrack) {
          onUpdateTrack(editingIndex, updatedData);
      }
  };

  if (!results || results.length === 0) return null;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Album Header Controls */}
      {results.length > 1 && (
          <AlbumHeader 
            trackCount={results.length} 
            onSyncAll={handleSyncAll} 
            syncAllLoading={syncAllLoading} 
            sunoCookie={sunoCookie} 
            cleanLyrics={masterCleanLyrics}
            onCleanLyricsChange={handleMasterToggleChange}
            createPlaylist={createPlaylist}
            onCreatePlaylistChange={setCreatePlaylist}
          />
      )}

      {results.map((data, index) => {
          const status = syncStatuses[index] || { loading: false, success: false, error: undefined };
          return (
            <TrackCard 
                key={index}
                data={data}
                index={index}
                totalTracks={results.length}
                status={status}
                sunoCookie={sunoCookie}
                onSync={() => handleSyncTrack(data, index)}
                onEdit={() => setEditingIndex(index)}
                cleanLyrics={cleanLyricsToggles[index] !== false}
                onCleanLyricsChange={(checked) => handleTrackToggleChange(index, checked)}
            />
          );
      })}

      {/* Edit Modal */}
      {editingIndex !== null && results[editingIndex] && (
          <EditSongModal
            isOpen={true}
            onClose={() => setEditingIndex(null)}
            onSave={handleSaveEdit}
            initialData={results[editingIndex]}
          />
      )}

      {/* Fallback if parsing failed for all */}
      {results.length === 1 && !results[0].style && !results[0].lyricsWithTags && results[0].fullResponse && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6">
              <h3 className="text-red-400 mb-2 font-bold">Parsing Error</h3>
              <pre className="whitespace-pre-wrap font-mono text-sm text-slate-300 break-words">{results[0].fullResponse}</pre>
          </div>
      )}
    </div>
  );
};

export default OutputSection;
