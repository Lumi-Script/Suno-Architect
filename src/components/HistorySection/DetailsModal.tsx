import React, { useState, useEffect } from 'react';
import { SunoClip } from '../../types';
import CopyButton from '../CopyButton';
import { getLyricAlignment } from '../../services/sunoApi';
import { matchWordsToPrompt, stripMetaTags, generateLrc, generateSrt } from '../../utils/lyrics';

interface DetailsModalProps {
  clip: SunoClip;
  onClose: () => void;
  onUpdateClip: (id: string, updates: Partial<SunoClip>) => void;
  sunoCookie?: string;
  isDraft: boolean;
}

const DetailsModal: React.FC<DetailsModalProps> = ({ clip, onClose, onUpdateClip, sunoCookie, isDraft }) => {
  const [manualIdInput, setManualIdInput] = useState('');
  const [editedLyrics, setEditedLyrics] = useState('');
  
  // Loading States
  const [loadingAlignment, setLoadingAlignment] = useState(false);
  const [alignmentError, setAlignmentError] = useState<string | null>(null);

  useEffect(() => {
      const orig = clip.originalData;
      const text = orig?.lyricsAlone || orig?.lyricsWithTags || clip.metadata?.prompt || "";
      setEditedLyrics(text);
  }, [clip.id]);

  const handleLinkSunoId = () => {
    if (!manualIdInput.trim()) return;
    const newId = manualIdInput.trim();
    
    onUpdateClip(clip.id, { 
        id: newId, 
        model_name: clip.model_name.includes('Draft') ? 'Linked via ID' : clip.model_name
    });
    setManualIdInput('');
    onClose(); 
  };

  const handleSaveLyrics = () => {
      const clean = stripMetaTags(editedLyrics);
      const baseOriginal = clip.originalData || {
         style: '', title: '', excludeStyles: '', advancedParams: '', vocalGender: '', weirdness: 0, styleInfluence: 0, lyricsWithTags: '', lyricsAlone: '', fullResponse: ''
      };
      const updates: Partial<SunoClip> = {
          originalData: { ...baseOriginal, lyricsAlone: clean }
      };
      onUpdateClip(clip.id, updates);
  };

  const handleGetAlignment = async () => {
      if (!sunoCookie || isDraft) return;
      setLoadingAlignment(true);
      setAlignmentError(null);
      try {
          const result = await getLyricAlignment(clip.id, sunoCookie);
          if (result && result.aligned_words) {
              const newData = result.aligned_words;
              
              // Automatically generate LRC and SRT if we have lyrics available
              let lrc = undefined;
              let srt = undefined;
              
              if (editedLyrics) {
                  const lines = matchWordsToPrompt(newData, editedLyrics);
                  if (lines && lines.length > 0) {
                      lrc = generateLrc(lines);
                      srt = generateSrt(lines);
                  }
              }

              onUpdateClip(clip.id, { 
                  alignmentData: newData,
                  lrcContent: lrc,
                  srtContent: srt
              });
          } else {
              setAlignmentError("No alignment data found.");
          }
      } catch (e: any) {
          setAlignmentError(e.message || "Failed to fetch alignment.");
      } finally {
          setLoadingAlignment(false);
      }
  };

  const handleDownloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  };

  const handleGenerateLRC = () => {
      if (!clip.alignmentData) return;
      const lines = matchWordsToPrompt(clip.alignmentData, editedLyrics);
      if (!lines || lines.length === 0) return;

      const lrcContent = generateLrc(lines);

      const clean = stripMetaTags(editedLyrics);
      const baseOriginal = clip.originalData || {
            style: '', title: '', excludeStyles: '', advancedParams: '', vocalGender: '', weirdness: 0, styleInfluence: 0, lyricsWithTags: '', lyricsAlone: '', fullResponse: ''
      };
      
      onUpdateClip(clip.id, { 
          lrcContent, 
          originalData: { ...baseOriginal, lyricsAlone: clean } 
      });
  };

  const handleGenerateSRT = () => {
      if (!clip.alignmentData) return;
      const lines = matchWordsToPrompt(clip.alignmentData, editedLyrics);
      if (!lines || lines.length === 0) return;

      const srtContent = generateSrt(lines);
      
      const clean = stripMetaTags(editedLyrics);
      const baseOriginal = clip.originalData || {
            style: '', title: '', excludeStyles: '', advancedParams: '', vocalGender: '', weirdness: 0, styleInfluence: 0, lyricsWithTags: '', lyricsAlone: '', fullResponse: ''
      };
      
      onUpdateClip(clip.id, { 
          srtContent, 
          originalData: { ...baseOriginal, lyricsAlone: clean } 
      });
  };

  const formatDisplayTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 100);
      return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds?: number) => {
      if (typeof seconds !== 'number') return 'N/A';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const clipData = {
      title: clip.title || clip.originalData?.title || 'Untitled',
      style: clip.metadata?.tags || clip.originalData?.style || '',
      excludeStyles: clip.metadata?.negative_tags || clip.originalData?.excludeStyles || '',
      advancedParams: clip.originalData?.advancedParams || '',
      prompt: clip.metadata?.prompt || clip.originalData?.lyricsWithTags || '',
      weirdness: clip.originalData?.weirdness ?? 50,
      styleInfluence: clip.originalData?.styleInfluence ?? 50,
      
      // New fields
      maxBpm: clip.metadata?.max_bpm,
      minBpm: clip.metadata?.min_bpm,
      avgBpm: clip.metadata?.avg_bpm,
      key: clip.metadata?.key,
      explicit: clip.explicit,
      duration: clip.metadata?.duration
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
        <div 
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
        >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-start bg-slate-900/50">
                <div>
                    <h2 className="text-xl font-bold text-white leading-tight pr-4 flex items-center gap-2">
                        {clipData.title}
                        {clipData.explicit && (
                            <div className="group relative">
                                <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24">
                                    <title>Explicit Content</title>
                                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 6h-4v2h4v2h-4v2h4v2H9V7h6v2z" />
                                </svg>
                                <span className="absolute left-full ml-2 top-0 px-2 py-1 bg-slate-800 text-xs text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none">
                                    Explicit
                                </span>
                            </div>
                        )}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                            <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{clip.model_name}</span>
                            <span>•</span>
                            <span>{new Date(clip.created_at).toLocaleString()}</span>
                            {isDraft && (
                                <span className="bg-yellow-900/50 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-900">Draft</span>
                            )}
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg hover:bg-slate-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 bg-slate-950/30">
                
                {/* Top Grid: Style & Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Style Tags */}
                    {clipData.style && (
                        <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Style Tags</h3>
                                <CopyButton text={clipData.style} label="Copy" />
                                </div>
                                <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                                <p className="text-sm text-slate-200 font-mono break-words">{clipData.style}</p>
                                </div>
                        </div>
                    )}

                    {/* Negative Tags */}
                    {clipData.excludeStyles && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider">Negative Tags</h3>
                            <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg h-full">
                                <p className="text-sm text-red-200 font-mono break-words">{clipData.excludeStyles}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Song Stats & Parameters */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Key</span>
                        <span className="text-sm font-mono text-white">{clipData.key ? clipData.key.replace('_', ' ') : 'N/A'}</span>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">BPM (Avg)</span>
                        <span className="text-sm font-mono text-white">{clipData.avgBpm ? clipData.avgBpm.toFixed(1) : 'N/A'}</span>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Duration</span>
                        <span className="text-sm font-mono text-white">{formatDuration(clipData.duration)}</span>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Explicit</span>
                        <span className={`text-sm font-mono ${clipData.explicit ? 'text-red-400' : 'text-slate-400'}`}>
                            {clipData.explicit ? 'Yes' : 'No'}
                        </span>
                    </div>
                    
                    {/* Control Sliders */}
                    <div className="col-span-2 sm:col-span-2 pt-2 border-t border-slate-800 mt-2">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-purple-400 font-bold uppercase">Weirdness</span>
                            <span className="text-[10px] text-purple-400 font-mono">{clipData.weirdness}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-900 to-purple-500 h-1.5 rounded-full" style={{ width: `${clipData.weirdness}%` }}></div>
                        </div>
                    </div>
                    <div className="col-span-2 sm:col-span-2 pt-2 border-t border-slate-800 mt-2">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-blue-400 font-bold uppercase">Style Influence</span>
                            <span className="text-[10px] text-blue-400 font-mono">{clipData.styleInfluence}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-900 to-blue-500 h-1.5 rounded-full" style={{ width: `${clipData.styleInfluence}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Additional BPM Stats if available */}
                {(clipData.maxBpm || clipData.minBpm) && (
                    <div className="flex gap-4 text-xs text-slate-500 font-mono bg-slate-900/30 p-2 rounded border border-slate-800/50">
                        {clipData.maxBpm && <span>Max BPM: <span className="text-slate-300">{clipData.maxBpm.toFixed(1)}</span></span>}
                        {clipData.minBpm && <span>Min BPM: <span className="text-slate-300">{clipData.minBpm.toFixed(1)}</span></span>}
                    </div>
                )}

                {/* Lyrics Alignment Section */}
                {!isDraft && (
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                            <div className="flex justify-between items-center flex-wrap gap-2">
                            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Timing & Lyrics</h3>
                            <div className="flex flex-wrap items-center gap-2">
                                    {clip.alignmentData && (
                                        <CopyButton text={JSON.stringify(clip.alignmentData, null, 2)} label="JSON" />
                                    )}

                                    {!clip.alignmentData ? (
                                    sunoCookie ? (
                                        <button
                                            onClick={handleGetAlignment}
                                            disabled={loadingAlignment}
                                            className="px-3 py-1 bg-cyan-900/50 hover:bg-cyan-800 text-cyan-200 text-xs font-medium rounded-lg transition-colors border border-cyan-700/50 flex items-center gap-2"
                                        >
                                            {loadingAlignment ? (
                                                <span className="animate-spin h-3 w-3 border-2 border-cyan-400 rounded-full border-t-transparent"></span>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <polyline points="12 6 12 12 16 14" />
                                                </svg>
                                            )}
                                            {loadingAlignment ? 'Fetching...' : 'Get Alignment'}
                                        </button>
                                    ) : (
                                        <span className="text-[10px] text-slate-500 italic">Login to fetch timing</span>
                                    )
                                    ) : (
                                        <div className="flex gap-2">
                                            {!clip.lrcContent ? (
                                            <button
                                                onClick={handleGenerateLRC}
                                                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
                                            >
                                                Gen LRC
                                            </button>
                                            ) : (
                                            <div className="flex gap-1">
                                                <CopyButton text={clip.lrcContent} label="LRC" />
                                                <button
                                                    onClick={() => handleDownloadTextFile(clip.lrcContent!, `${clip.title || 'song'}.lrc`)}
                                                    className="px-2 py-1 bg-purple-700/50 hover:bg-purple-600 text-purple-100 text-xs font-medium rounded-lg border border-purple-600/50"
                                                    title="Download LRC"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                        <polyline points="7 10 12 15 17 10" />
                                                        <line x1="12" y1="15" x2="12" y2="3" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={handleGenerateLRC}
                                                    className="px-2 py-1 bg-purple-800 hover:bg-purple-700 text-purple-200 text-xs font-medium rounded-lg border border-purple-600/30"
                                                    title="Redo LRC with current lyrics"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                                        <path d="M3 3v5h5" />
                                                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                                                        <path d="M16 16h5v5" />
                                                    </svg>
                                                </button>
                                            </div>
                                            )}

                                            {!clip.srtContent ? (
                                            <button
                                                onClick={handleGenerateSRT}
                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
                                            >
                                                Gen SRT
                                            </button>
                                            ) : (
                                            <div className="flex gap-1">
                                                <CopyButton text={clip.srtContent} label="SRT" />
                                                <button
                                                    onClick={() => handleDownloadTextFile(clip.srtContent!, `${clip.title || 'song'}.srt`)}
                                                    className="px-2 py-1 bg-blue-700/50 hover:bg-blue-600 text-blue-100 text-xs font-medium rounded-lg border border-blue-600/50"
                                                    title="Download SRT"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                        <polyline points="7 10 12 15 17 10" />
                                                        <line x1="12" y1="15" x2="12" y2="3" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={handleGenerateSRT}
                                                    className="px-2 py-1 bg-blue-800 hover:bg-blue-700 text-blue-200 text-xs font-medium rounded-lg border border-blue-600/30"
                                                    title="Redo SRT with current lyrics"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                                        <path d="M3 3v5h5" />
                                                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                                                        <path d="M16 16h5v5" />
                                                    </svg>
                                                </button>
                                            </div>
                                            )}
                                        </div>
                                    )}
                            </div>
                            </div>

                            {alignmentError && (
                                <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-900/30">
                                    {alignmentError}
                                </div>
                            )}

                            {clip.alignmentData && (
                                <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex flex-col h-[300px]">
                                    <div className="bg-slate-900/80 px-4 py-2 flex justify-between text-xs font-semibold text-slate-400 border-b border-slate-800">
                                        <span>Timestamp</span>
                                        <span>Word</span>
                                    </div>
                                    <div className="overflow-y-auto custom-scrollbar p-2 space-y-1">
                                        {clip.alignmentData.map((item, idx) => (
                                            <div key={idx} className="flex hover:bg-slate-800/50 rounded px-2 py-1 transition-colors group">
                                                <span className="text-xs font-mono text-cyan-500 w-24 shrink-0 group-hover:text-cyan-400">
                                                    {formatDisplayTime(item.start_s)}
                                                </span>
                                                <span className="text-sm text-slate-300 font-medium group-hover:text-white">
                                                    {item.word.replace(/\n/g, ' ')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                    </div>
                )}

                {/* Key Prompt (Lyrics with Tags) */}
                {clipData.prompt && (
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                            <div className="flex justify-between items-center">
                            <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider">Key Prompt (Lyrics with Tags)</h3>
                            <CopyButton text={clipData.prompt} label="Copy" />
                            </div>
                            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg max-h-[300px] overflow-y-auto custom-scrollbar">
                            <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">{clipData.prompt}</pre>
                            </div>
                    </div>
                )}

                    {/* Clean Lyrics (Editable) */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            Clean Lyrics (Editable)
                        </h3>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleSaveLyrics}
                                className="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1 hover:bg-emerald-900/30 rounded transition-colors border border-transparent hover:border-emerald-800"
                            >
                                Save Edits
                            </button>
                            <CopyButton text={editedLyrics} label="Copy" />
                        </div>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                        <textarea 
                            value={editedLyrics}
                            onChange={(e) => setEditedLyrics(e.target.value)}
                            className="w-full h-[200px] bg-slate-900 p-4 text-sm text-slate-400 font-mono resize-none focus:outline-none focus:bg-slate-800/50 transition-colors custom-scrollbar leading-relaxed"
                            placeholder="Edit lyrics structure here to improve synchronization..."
                        />
                        </div>
                </div>

                {/* ID Linking Section */}
                <div className="pt-4 border-t border-slate-800">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                        Link Suno Generation
                    </label>
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            value={manualIdInput}
                            onChange={(e) => setManualIdInput(e.target.value)}
                            placeholder="Paste Suno Clip ID (UUID) here..."
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none"
                        />
                        <button 
                            onClick={handleLinkSunoId}
                            disabled={!manualIdInput.trim()}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                        >
                            Link ID
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                        If you generated this song on Suno, paste the UUID from the URL to see the cover art and link.
                    </p>
                </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
                    {!isDraft && (
                        <>
                            <a 
                            href={`https://cdn1.suno.ai/${clip.id}.mp3`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                            title="Download MP3"
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            MP3
                            </a>

                            <a 
                            href={`https://suno.com/song/${clip.id}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-purple-900/20"
                            >
                            Open in Suno
                            </a>
                        </>
                    )}
                    <button 
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                    Close
                    </button>
            </div>
        </div>
    </div>
  );
};

export default DetailsModal;