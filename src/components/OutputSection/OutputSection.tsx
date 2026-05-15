import React, { useState } from 'react';
import { ParsedSunoOutput } from '../../types';
import { triggerSunoGeneration } from '../../services/sunoGenApi';
import EditSongModal from '../EditSongModal';
import AlbumHeader from './AlbumHeader';
import TrackCard from './TrackCard';

interface OutputSectionProps {
  results: ParsedSunoOutput[];
  sunoCookie?: string;
  sunoModel?: string;
  onSyncSuccess?: (response: any, originalData: ParsedSunoOutput) => void;
  onUpdateTrack?: (index: number, updatedTrack: ParsedSunoOutput) => void;
}

const OutputSection: React.FC<OutputSectionProps> = ({ results, sunoCookie, sunoModel, onSyncSuccess, onUpdateTrack }) => {
  const [syncAllLoading, setSyncAllLoading] = useState(false);
  const [syncStatuses, setSyncStatuses] = useState<Record<number, {loading: boolean, error?: string, success?: boolean}>>({});
  
  // Editing State
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSyncTrack = async (data: ParsedSunoOutput, index: number) => {
    if (!sunoCookie) return;
    
    setSyncStatuses(prev => ({ ...prev, [index]: { loading: true } }));
    
    try {
        const result = await triggerSunoGeneration(data, sunoCookie, sunoModel);
        setSyncStatuses(prev => ({ ...prev, [index]: { loading: false, success: true } }));
        if (onSyncSuccess) {
            onSyncSuccess(result, data);
        }
    } catch (err: any) {
        setSyncStatuses(prev => ({ ...prev, [index]: { loading: false, error: err.message || "Failed" } }));
    }
  };

  const handleSyncAll = async () => {
    if (!sunoCookie || results.length === 0) return;
    setSyncAllLoading(true);
    
    // Process sequentially to avoid heavy rate limiting or context mixing
    for (let i = 0; i < results.length; i++) {
        const track = results[i];
        if (syncStatuses[i]?.success) continue;
        await handleSyncTrack(track, i);
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
