import React, { useState, useEffect, useRef, useCallback } from 'react';
import InputSection from './components/InputSection/InputSection';
import OutputSection from './components/OutputSection/OutputSection';
import { Header } from './components/Header';
import { generateSunoPrompt } from './services/geminiService';
import { GenerationState, SunoClip, ParsedSunoOutput, PromptSettings, ViewMode, FileContext } from './types';
import { DEFAULT_SUNO_LIBRARY, DEFAULT_LYRICAL_CONSTRAINTS, buildKnowledgeBase, GET_PROMPT_V4 } from './constants';
import Footer from './components/Footer';
import SunoSettingsModal from './components/SunoSettingsModal';
import { getSunoCredits, getSunoFeed } from './services/sunoApi';
import { updateSunoMetadata } from './services/sunoGenApi';
import HistorySection from './components/HistorySection/HistorySection';
import VisualizerSection from './components/VisualizerSection/VisualizerSection';
import { stripMetaTags } from './utils/lyrics';

// Helper to map API response to SunoClip
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

const App: React.FC = () => {
  const [state, setState] = useState<GenerationState>({
    isLoading: false,
    error: null,
    result: null,
  });

  const [view, setView] = useState<ViewMode>('generator');
  
  const [history, setHistory] = useState<SunoClip[]>(() => {
    try {
      const saved = localStorage.getItem('suno_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse history from local storage", e);
      return [];
    }
  });
  
  const [customApiKey, setCustomApiKey] = useState('');
  const [isKeyValid, setIsKeyValid] = useState(false);
  
  const [geminiModel, setGeminiModel] = useState<string>(() => {
      return localStorage.getItem('gemini_model') || 'gemini-3.5-flash';
  });

  const handleGeminiModelChange = (model: string) => {
      setGeminiModel(model);
      localStorage.setItem('gemini_model', model);
  };
  
  const [isSunoModalOpen, setIsSunoModalOpen] = useState(false);
  const [sunoCookie, setSunoCookie] = useState('');
  const [sunoModel, setSunoModel] = useState('chirp-bluejay');
  const [sunoCredits, setSunoCredits] = useState<number | null>(null);
  const [isSyncingHistory, setIsSyncingHistory] = useState(false);
  const [syncProgress, setSyncProgress] = useState('');

  const [promptSettings, setPromptSettings] = useState<PromptSettings>(() => {
      try {
          const saved = localStorage.getItem('suno_prompt_settings');
          if (saved) return JSON.parse(saved);
      } catch(e) {}
      
      const kb = buildKnowledgeBase(DEFAULT_SUNO_LIBRARY);
      return {
          version: 'v4',
          customSystemPrompt: GET_PROMPT_V4(),
          library: DEFAULT_SUNO_LIBRARY,
          constraints: DEFAULT_LYRICAL_CONSTRAINTS
      };
  });
  const historyFetchedRef = useRef(false);

  useEffect(() => {
    const savedCookie = localStorage.getItem('suno_cookie');
    const savedModel = localStorage.getItem('suno_model');
    
    if (savedCookie) {
      setSunoCookie(savedCookie);
      getSunoCredits(savedCookie).then(setSunoCredits).catch(console.error);
      
      if (!historyFetchedRef.current) {
          historyFetchedRef.current = true;
          // Initial fetch with default limit
          fetchAndMergeSunoHistory(savedCookie);
      }
    }
    if (savedModel) {
      setSunoModel(savedModel);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('suno_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
      localStorage.setItem('suno_prompt_settings', JSON.stringify(promptSettings));
  }, [promptSettings]);

  const mergeClips = (newClips: SunoClip[]) => {
      setHistory(prev => {
        const nonDrafts = prev.filter(p => !p.id.startsWith('draft_'));
        const map = new Map<string, SunoClip>(nonDrafts.map(c => [c.id, c]));

        newClips.forEach(newClip => {
            if (map.has(newClip.id)) {
                    const existing = map.get(newClip.id)!;
                    const isRich = !!existing.originalData?.fullResponse;
                    
                    map.set(newClip.id, {
                        ...newClip,
                        originalData: isRich ? existing.originalData : newClip.originalData,
                        metadata: {
                            ...(isRich ? existing.metadata : newClip.metadata),
                            // Always prefer new metadata for these fields if they are present in the fresh fetch
                            avg_bpm: newClip.metadata.avg_bpm || existing.metadata.avg_bpm,
                            key: newClip.metadata.key || existing.metadata.key,
                            duration: newClip.metadata.duration || existing.metadata.duration,
                            max_bpm: newClip.metadata.max_bpm || existing.metadata.max_bpm,
                            min_bpm: newClip.metadata.min_bpm || existing.metadata.min_bpm,
                        },
                        alignmentData: existing.alignmentData || newClip.alignmentData,
                        lrcContent: existing.lrcContent || newClip.lrcContent,
                        srtContent: existing.srtContent || newClip.srtContent,
                    });
            } else {
                map.set(newClip.id, newClip);
            }
        });

        const drafts = prev.filter(p => p.id.startsWith('draft_'));
        const merged = Array.from(map.values());
        return [...drafts, ...merged].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    });
  };

  const fetchAndMergeSunoHistory = async (cookie: string) => {
    try {
        const feedData = await getSunoFeed(cookie, 50);
        if (feedData && Array.isArray(feedData.clips)) {
            const newClips = feedData.clips.map(mapSunoClip);
            mergeClips(newClips);
        }
    } catch (e) {
        console.error("Failed to fetch history feed", e);
    }
  };

  const handleFetchHistory = async (limit: number | 'all') => {
    if (!sunoCookie) {
         alert("Please connect your Suno account in Settings first.");
         return;
    }
    
    setIsSyncingHistory(true);
    setSyncProgress('Fetching...');

    const fetchPage = async (limitVal: number, cursorVal: string | null): Promise<any> => {
        let attempts = 0;
        const maxAttempts = 10;
        while (true) {
            try {
                return await getSunoFeed(sunoCookie, limitVal, cursorVal);
            } catch (err: any) {
                if (err.message === "429") {
                    attempts++;
                    if (attempts >= maxAttempts) {
                        throw err;
                    }
                    setSyncProgress(`Rate limited. Retrying page in 1s...`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                }
                throw err;
            }
        }
    };
    
    try {
        if (limit === 'all') {
            let cursor: string | null = null;
            let hasMore = true;
            let totalUpdated = 0;
            const pageSize = 100;

            while (hasMore) {
                setSyncProgress(`Fetched ${totalUpdated} items...`);
                const feedData = await fetchPage(pageSize, cursor);
                
                if (feedData && Array.isArray(feedData.clips)) {
                    const newClips = feedData.clips.map(mapSunoClip);
                    mergeClips(newClips);
                    totalUpdated += newClips.length;

                    hasMore = feedData.has_more === true;
                    cursor = feedData.next_cursor || feedData.cursor || null;
                    if (!cursor) {
                        hasMore = false;
                    }
                    
                    // Polite delay between successful page loads
                    await new Promise(r => setTimeout(r, 100));
                } else {
                    hasMore = false;
                }
            }
            setSyncProgress(`Updated ${totalUpdated} items`);
        } else {
            const feedData = await fetchPage(limit, null);
            if (feedData && Array.isArray(feedData.clips)) {
                 const newClips = feedData.clips.map(mapSunoClip);
                 mergeClips(newClips);
                 setSyncProgress(`Updated ${newClips.length} items`);
            }
        }
    } catch(e: any) {
         console.error("Sync flow failed", e);
         if (e.message === "429") {
             alert("Failed to sync history due to rate limits after multiple attempts.");
         } else {
             alert("Failed to sync history.");
         }
    } finally {
        setIsSyncingHistory(false);
        setTimeout(() => { if (!isSyncingHistory) setSyncProgress(''); }, 2000);
    }
  };

  const handleSaveSunoConfig = (cookie: string, model: string, newSettings: PromptSettings) => {
    setSunoCookie(cookie);
    setSunoModel(model);
    setPromptSettings(newSettings);

    if (cookie) {
      localStorage.setItem('suno_cookie', cookie);
      getSunoCredits(cookie).then(setSunoCredits).catch(() => setSunoCredits(null));
      historyFetchedRef.current = true;
      fetchAndMergeSunoHistory(cookie);
    } else {
      localStorage.removeItem('suno_cookie');
      setSunoCredits(null);
    }

    if (model) {
       localStorage.setItem('suno_model', model);
    }
  };

  const handleModelChange = (model: string) => {
      setSunoModel(model);
      localStorage.setItem('suno_model', model);
  };

  const handleSyncSuccess = async (response: any, originalData: ParsedSunoOutput, cleanLyrics: boolean = true) => {
    if (sunoCookie) {
        getSunoCredits(sunoCookie).then(setSunoCredits).catch(console.error);
    }

    if (response && response.clips && Array.isArray(response.clips)) {
        response.clips.forEach((clip: any) => {
             if (cleanLyrics) {
                 updateSunoMetadata(clip.id, originalData, sunoCookie)
                    .then(() => console.log(`Metadata updated for ${clip.id}`))
                    .catch(err => console.error(`Metadata update failed for ${clip.id}`, err));
             } else {
                 console.log(`Skipping metadata update for ${clip.id} as per user preference`);
             }
        });

        const newClips: SunoClip[] = response.clips.map((clip: any) => ({
            id: clip.id,
            title: clip.title || 'Untitled',
            created_at: clip.created_at,
            model_name: clip.model_name,
            imageUrl: clip.image_url,
            imageLargeUrl: clip.image_large_url,
            explicit: clip.explicit,
            metadata: {
                tags: clip.metadata?.tags || '',
                prompt: clip.metadata?.prompt || '',
                negative_tags: clip.metadata?.negative_tags,
                duration: clip.metadata?.duration,
                max_bpm: clip.metadata?.max_bpm,
                min_bpm: clip.metadata?.min_bpm,
                avg_bpm: clip.metadata?.avg_bpm,
                key: clip.metadata?.key
            },
            originalData: originalData
        }));
        
        mergeClips(newClips);
    }
  };

  const handleUpdateResult = (index: number, updatedTrack: ParsedSunoOutput) => {
    setState(prev => {
      if (!prev.result) return prev;
      const newResult = [...prev.result];
      newResult[index] = updatedTrack;
      return { ...prev, result: newResult };
    });
  };

  const handleGenerate = async (prompt: string, files: FileContext[] = [], numTracks: number = 1) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null, result: null }));
    try {
      const results = await generateSunoPrompt(
          prompt, 
          customApiKey, 
          promptSettings.customSystemPrompt, 
          geminiModel, 
          files,
          numTracks
      );
      
      setState({ isLoading: false, error: null, result: results });
      
      // Save all as drafts
      const draftClips: SunoClip[] = results.map((result, idx) => ({
          id: `draft_${Date.now()}_${idx}`,
          title: result.title || `Untitled Track ${idx + 1}`,
          created_at: new Date().toISOString(),
          model_name: 'Gemini Draft',
          metadata: {
              tags: result.style || '',
              prompt: result.lyricsWithTags || ''
          },
          originalData: result
      }));
      setHistory(prev => [...draftClips, ...prev]);

    } catch (err: any) {
      setState({
        isLoading: false,
        error: err.message || "Something went wrong.",
        result: null,
      });
    }
  };

  const handleUpdateClip = useCallback((id: string, updates: Partial<SunoClip>) => {
    setHistory(prev => {
        const exists = prev.some(c => c.id === id);
        if (!exists) return prev; 
        return prev.map(clip => clip.id === id ? { ...clip, ...updates } : clip);
    });
  }, []);

  const handleAddClip = useCallback((clips: SunoClip | SunoClip[]) => {
      const clipsArray = Array.isArray(clips) ? clips : [clips];
      mergeClips(clipsArray);
  }, []);

  const renderContent = () => {
      switch(view) {
          case 'history':
              return (
                <HistorySection 
                    history={history} 
                    onUpdateClip={handleUpdateClip} 
                    onAddClip={handleAddClip}
                    sunoCookie={sunoCookie}
                    onFetchHistory={handleFetchHistory}
                    isSyncing={isSyncingHistory}
                    syncProgress={syncProgress}
                />
              );
          case 'visualizer':
              return (
                  <VisualizerSection 
                    history={history}
                    sunoCookie={sunoCookie}
                    onUpdateClip={handleUpdateClip}
                    apiKey={customApiKey}
                    geminiModel={geminiModel} 
                  />
              );
          case 'generator':
          default:
              return (
                <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                      <div className="lg:col-span-4 space-y-6">
                          <div className="sticky top-24">
                          <div className="mb-6">
                              <h2 className="text-3xl font-bold text-white mb-2">Architect Your Album</h2>
                              <p className="text-slate-400 text-sm leading-relaxed">
                                  Transform raw ideas into structured albums (up to 7 tracks). 
                                  Generates cohesive prompts with production directives for Suno & Udio.
                              </p>
                          </div>
                          <InputSection 
                              onGenerate={handleGenerate} 
                              isLoading={state.isLoading} 
                              apiKeyValid={isKeyValid} 
                          />
                          {state.error && (
                              <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
                              <strong>Error:</strong> {state.error}
                              </div>
                          )}
                          </div>
                      </div>
                      <div className="lg:col-span-8">
                          {state.result ? (
                          <OutputSection 
                              results={state.result} 
                              sunoCookie={sunoCookie}
                              sunoModel={sunoModel}
                              onSyncSuccess={handleSyncSuccess}
                              onUpdateTrack={handleUpdateResult}
                          />
                          ) : (
                          <div className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20 text-slate-600 min-h-[400px]">
                              {!state.isLoading && (
                              <>
                                  <div className="w-16 h-16 rounded-full bg-slate-800 mb-4 flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 opacity-50">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                  </svg>
                                  </div>
                                  <p className="text-lg font-medium">Ready to Generate</p>
                                  <p className="text-sm mt-1">Your structured album tracks will appear here.</p>
                              </>
                              )}
                              {state.isLoading && (
                              <div className="flex flex-col items-center animate-pulse">
                                  <div className="h-4 w-3/4 bg-slate-800 rounded mb-3"></div>
                                  <div className="h-4 w-1/2 bg-slate-800 rounded mb-3"></div>
                                  <div className="h-32 w-full bg-slate-800 rounded"></div>
                              </div>
                              )}
                          </div>
                          )}
                      </div>
                  </div>
                  
                  {!state.result && !state.isLoading && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800/50">
                          {/* Card 1 */}
                          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:bg-slate-800/80 hover:border-purple-500/30 transition-all duration-300">
                              <div className="absolute top-0 right-0 p-4 opacity-10 text-purple-500 group-hover:scale-110 transition-transform duration-300">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16">
                                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                  </svg>
                              </div>
                              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-purple-400">
                                      <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  Advanced Prompting
                              </h3>
                              <p className="text-sm text-slate-400 leading-relaxed pr-8">
                                 Uses the latest Gemini LLMs and specialized system instructions to generate highly structured, emotive meta-tags tailored specifically for AI music engines.
                              </p>
                          </div>
                          
                          {/* Card 2 */}
                          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:bg-slate-800/80 hover:border-pink-500/30 transition-all duration-300">
                              <div className="absolute top-0 right-0 p-4 opacity-10 text-pink-500 group-hover:scale-110 transition-transform duration-300">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16">
                                      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                                      <path d="M3 12v5a2 2 0 0 0 2 2h16v-4"></path>
                                      <path d="M3 15h14"></path>
                                  </svg>
                              </div>
                              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-pink-400">
                                      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                                      <path d="M3 12v5a2 2 0 0 0 2 2h16v-4" />
                                      <path d="M3 15h14" />
                                  </svg>
                                  Direct Studio Sync
                              </h3>
                              <p className="text-sm text-slate-400 leading-relaxed pr-8">
                                 Seamlessly push your generated lyrics and structural tags directly to the Suno API. Bypasses manual copy-pasting for an accelerated album workflow.
                              </p>
                          </div>

                          {/* Card 3 */}
                          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:bg-slate-800/80 hover:border-blue-500/30 transition-all duration-300">
                              <div className="absolute top-0 right-0 p-4 opacity-10 text-blue-500 group-hover:scale-110 transition-transform duration-300">
                                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16">
                                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                  </svg>
                              </div>
                              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-400">
                                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                  </svg>
                                  Privacy-First
                              </h3>
                              <p className="text-sm text-slate-400 leading-relaxed pr-8">
                                  Your data remains yours. Connects securely with strict, transient tokens that are never logged or persistently stored on our servers.
                              </p>
                          </div>
                      </div>
                  )}
                </div>
              );
      }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-[#0f172a] to-black text-slate-200 font-sans selection:bg-purple-500/30">
      
      <Header 
        onKeyUpdate={setCustomApiKey} 
        onValidationChange={setIsKeyValid}
        onOpenSunoSettings={() => setIsSunoModalOpen(true)}
        sunoCredits={sunoCredits}
        sunoModel={sunoModel}
        onModelChange={handleModelChange}
        geminiModel={geminiModel}
        onGeminiModelChange={handleGeminiModelChange}
      />

      <SunoSettingsModal 
        isOpen={isSunoModalOpen}
        onClose={() => setIsSunoModalOpen(false)}
        onSave={handleSaveSunoConfig}
        initialCookie={sunoCookie}
        initialModel={sunoModel}
        initialPromptSettings={promptSettings}
        currentCredits={sunoCredits}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full flex justify-center">
          <div className="bg-slate-800/50 p-1 rounded-xl flex space-x-1 border border-slate-700/50 backdrop-blur-sm">
             <button
                onClick={() => setView('generator')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    view === 'generator' 
                    ? 'bg-slate-700 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
             >
                Generator
             </button>
             <button
                onClick={() => setView('history')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                    view === 'history' 
                    ? 'bg-slate-700 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
             >
                <span>History</span>
                {history.length > 0 && (
                    <span className="bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        {history.length}
                    </span>
                )}
             </button>
             <button
                onClick={() => setView('visualizer')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                    view === 'visualizer' 
                    ? 'bg-slate-700 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
             >
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M23 7l-7 5 7 5V7z" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                <span>Visualizer</span>
             </button>
          </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {renderContent()}
      </main>
      <Footer git="https://github.com/Lumi-Script/Suno-Architect/" />
    </div>
  );
};

export default App;
