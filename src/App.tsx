import React, { useState, useEffect, useRef, useCallback } from 'react';
import InputSection from './components/InputSection/InputSection';
import OutputSection from './components/OutputSection/OutputSection';
import { Header } from './components/Header/Header';
import { generateSunoPrompt } from './services/geminiService';
import { GenerationState, SunoClip, SunoWorkspace, ParsedSunoOutput, PromptSettings, FileContext, SunoPersona } from './types';
import { DEFAULT_SUNO_LIBRARY, DEFAULT_LYRICAL_CONSTRAINTS, buildKnowledgeBase, GET_PROMPT_V4, SUNO_MODEL_MAPPINGS, getCombinedSunoModels } from './constants';
import Footer from './components/Footer/Footer';
import SunoSettingsModal from './components/Header/SunoSettingsModal';
import { getSunoCredits, getSunoBillingInfo, getSunoFeed, getSunoWorkspaces, getSunoPersonas, DRAFTS_WORKSPACE, mapSunoClip } from './services/sunoApi';
import { updateSunoMetadata } from './services/sunoGenApi';
import HistorySection from './components/HistorySection/HistorySection';
import VisualizerSection from './components/VisualizerSection/VisualizerSection';
import { stripMetaTags } from './utils/lyrics';
import { getAllClips, saveClip, saveClips, getAllWorkspaces, saveWorkspaces, getAllPersonas, savePersonas, get, set } from './utils/idb';
import { useRouter, Link } from './router/Router';
import { HomePage } from './pages/HomePage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { AboutPage } from './pages/AboutPage';

const App: React.FC = () => {
  const { currentPath } = useRouter();

  const [state, setState] = useState<GenerationState>({
    isLoading: false,
    error: null,
    result: null,
  });
  
  const [history, setHistory] = useState<SunoClip[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Workspaces state
  const [workspaces, setWorkspaces] = useState<SunoWorkspace[]>([
      DRAFTS_WORKSPACE,
      {
          id: 'default',
          name: 'My Workspace',
          description: 'Workspace for unassigned clips',
          clip_count: 0
      }
  ]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('all');
  const [targetWorkspaceId, setTargetWorkspaceId] = useState<string>(() => {
      return localStorage.getItem('suno_target_workspace') || 'default';
  });

  const handleTargetWorkspaceChange = (id: string) => {
      setTargetWorkspaceId(id);
      localStorage.setItem('suno_target_workspace', id);
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const saved = await getAllClips();
        if (saved && Array.isArray(saved)) {
           setHistory(saved);
        }

        const cachedWorkspaces = await getAllWorkspaces();
        if (cachedWorkspaces && Array.isArray(cachedWorkspaces) && cachedWorkspaces.length > 0) {
           const hasDrafts = cachedWorkspaces.some(w => w.id === 'drafts');
           const hasDefault = cachedWorkspaces.some(w => w.id === 'default');
           const combined = [
               ...(hasDrafts ? [] : [DRAFTS_WORKSPACE]),
               ...(hasDefault ? [] : [{
                   id: 'default',
                   name: 'My Workspace',
                   description: 'Workspace for unassigned clips',
                   clip_count: 0
               }]),
               ...cachedWorkspaces
           ];
           setWorkspaces(combined);
        }
      } catch (e) {
        console.error("Failed to load history from indexedDB", e);
      } finally {
        setHistoryLoaded(true);
      }
    };
    loadHistory();
  }, []);
  
  const [customApiKey, setCustomApiKey] = useState('');
  const [isKeyValid, setIsKeyValid] = useState(false);
  
  const [geminiModel, setGeminiModel] = useState<string>(() => {
      return localStorage.getItem('gemini_model') || 'gemini-3.8-flash';
  });

  const handleGeminiModelChange = (model: string) => {
      setGeminiModel(model);
      localStorage.setItem('gemini_model', model);
  };
  
  const defaultSunoModel = SUNO_MODEL_MAPPINGS[0]?.value || 'chirp-hawk';
  const [sunoModels, setSunoModels] = useState<Array<{ label: string; value: string }>>(() => getCombinedSunoModels());
  const [isSunoModalOpen, setIsSunoModalOpen] = useState(false);
  const [sunoCookie, setSunoCookie] = useState('');
  const [sunoModel, setSunoModel] = useState<string>(() => {
    const saved = localStorage.getItem('suno_model');
    return (saved && saved !== 'chirp-bluejay') ? saved : defaultSunoModel;
  });
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

  const [personas, setPersonas] = useState<SunoPersona[]>(() => {
    try {
      const cached = localStorage.getItem('suno_personas');
      if (cached) return JSON.parse(cached);
    } catch (_) {}
    return [];
  });

  const fetchWorkspaces = async (cookie: string) => {
      try {
          const apiWorkspaces = await getSunoWorkspaces(cookie);
          const hasDrafts = apiWorkspaces.some(w => w.id === 'drafts');
          const hasDefault = apiWorkspaces.some(w => w.id === 'default');
          const combined: SunoWorkspace[] = [
              ...(hasDrafts ? [] : [DRAFTS_WORKSPACE]),
              ...(hasDefault ? [] : [{
                  id: 'default',
                  name: 'My Workspace',
                  description: 'Workspace for unassigned clips',
                  clip_count: 0
              }]),
              ...apiWorkspaces
          ];
          const unique = Array.from(new Map(combined.map(w => [w.id, w])).values());
          setWorkspaces(unique);
          await saveWorkspaces(unique);
      } catch (e) {
          console.warn("Could not fetch workspaces from Suno", e);
      }
  };

  const fetchPersonas = async (cookie: string) => {
      try {
          const apiPersonas = await getSunoPersonas(cookie);
          if (apiPersonas.length > 0) {
              setPersonas(apiPersonas);
              await savePersonas(apiPersonas);
          }
      } catch (e) {
          console.warn("Could not fetch personas from Suno", e);
      }
  };

  useEffect(() => {
    getAllPersonas().then((cached) => {
        if (cached && cached.length > 0) {
            setPersonas(cached);
        }
    }).catch(() => {});

    // Check if suno_token is passed in the URL parameters
    let initialToken = '';
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('suno_token');
      if (urlToken && urlToken.trim()) {
        initialToken = urlToken.trim();
        localStorage.setItem('suno_cookie', initialToken);
        localStorage.setItem('suno_token', initialToken);

        // Clean query parameter from address bar so token doesn't linger in URL
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('suno_token');
        const cleanPath = cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : '') + cleanUrl.hash;
        window.history.replaceState({}, '', cleanPath);
      }
    } catch (e) {
      console.warn("Could not parse URL for suno_token:", e);
    }

    if (!initialToken) {
      initialToken = localStorage.getItem('suno_cookie') || localStorage.getItem('suno_token') || '';
    }

    const savedModel = localStorage.getItem('suno_model');
    
    if (initialToken) {
      setSunoCookie(initialToken);
      getSunoBillingInfo(initialToken).then((info) => {
          setSunoCredits(info.credits);
          if (info.customModels.length > 0) {
              setSunoModels(getCombinedSunoModels(info.customModels));
          }
      }).catch((err) => {
          setSunoCredits(null);
          if (err.message !== '401') {
              console.warn("Could not fetch Suno billing info:", err);
          }
      });
      fetchWorkspaces(initialToken);
      fetchPersonas(initialToken);
      
      if (!historyFetchedRef.current) {
          historyFetchedRef.current = true;
          // Initial fetch with default limit
          fetchAndMergeSunoHistory(initialToken);
      }
    }
    if (savedModel && savedModel !== 'chirp-bluejay') {
      setSunoModel(savedModel);
    } else {
      setSunoModel(defaultSunoModel);
      localStorage.setItem('suno_model', defaultSunoModel);
    }
  }, []);

  useEffect(() => {
      localStorage.setItem('suno_prompt_settings', JSON.stringify(promptSettings));
  }, [promptSettings]);

  const mergeClips = (newClips: SunoClip[]) => {
      setHistory(prev => {
        const nonDrafts = prev.filter(p => !p.id.startsWith('draft_') && p.workspaceId !== 'drafts');
        const map = new Map<string, SunoClip>(nonDrafts.map(c => [c.id, c]));
        const savedBatch: SunoClip[] = [];

        newClips.forEach(newClip => {
            if (map.has(newClip.id)) {
                const existing = map.get(newClip.id)!;
                const isRich = !!existing.originalData?.fullResponse;
                
                // Retain specific workspace if assigned, avoid falling back to 'default' if existing has a workspace
                const resolvedWorkspace = (newClip.workspaceId && newClip.workspaceId !== 'default')
                    ? newClip.workspaceId
                    : (existing.workspaceId || newClip.workspaceId || 'default');

                const merged: SunoClip = {
                    ...newClip,
                    workspaceId: resolvedWorkspace,
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
                };
                map.set(newClip.id, merged);
                savedBatch.push(merged);
            } else {
                map.set(newClip.id, newClip);
                savedBatch.push(newClip);
            }
        });

        // Efficiently save resolved clips into indexedDB clips store
        saveClips(savedBatch).catch(console.error);

        const drafts = prev.filter(p => p.id.startsWith('draft_') || p.workspaceId === 'drafts');
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
            const newClips = feedData.clips.map((c: any) => mapSunoClip(c));
            mergeClips(newClips);
        }
    } catch (e) {
        console.error("Failed to fetch history feed", e);
    }
  };

  const handleFetchHistory = async (limit: number | 'all', workspaceId?: string) => {
    if (!sunoCookie) {
         alert("Please connect your Suno account in Settings first.");
         return;
    }

    if (workspaceId === 'drafts') {
        alert("Drafts are phantom workspaces stored locally in your browser and are not fetched from Suno.");
        return;
    }
    
    setIsSyncingHistory(true);
    setSyncProgress('Fetching...');

    const targetWs = (workspaceId && workspaceId !== 'all') ? workspaceId : undefined;

    const fetchPage = async (limitVal: number, cursorVal: string | null): Promise<any> => {
        let attempts = 0;
        const maxAttempts = 10;
        while (true) {
            try {
                return await getSunoFeed(sunoCookie, limitVal, cursorVal, undefined, targetWs);
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
                    const newClips = feedData.clips.map((c: any) => mapSunoClip(c, targetWs));
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
                 const newClips = feedData.clips.map((c: any) => mapSunoClip(c, targetWs));
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
      localStorage.setItem('suno_token', cookie);
      getSunoBillingInfo(cookie).then((info) => {
          setSunoCredits(info.credits);
          if (info.customModels.length > 0) {
              setSunoModels(getCombinedSunoModels(info.customModels));
          }
      }).catch(() => setSunoCredits(null));
      fetchWorkspaces(cookie);
      fetchPersonas(cookie);
      historyFetchedRef.current = true;
      fetchAndMergeSunoHistory(cookie);
    } else {
      localStorage.removeItem('suno_cookie');
      localStorage.removeItem('suno_token');
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

  const handleSyncSuccess = async (response: any, originalData: ParsedSunoOutput, cleanLyrics: boolean = true, chosenTargetWorkspace?: string) => {
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

        const effectiveWs = chosenTargetWorkspace || targetWorkspaceId || 'default';
        const newClips: SunoClip[] = response.clips.map((clip: any) => ({
            id: clip.id,
            title: clip.title || 'Untitled',
            created_at: clip.created_at,
            model_name: clip.model_name,
            workspaceId: effectiveWs,
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
      
      // Save all as drafts in phantom 'drafts' workspace
      const draftClips: SunoClip[] = results.map((result, idx) => ({
          id: `draft_${Date.now()}_${idx}`,
          title: result.title || `Untitled Track ${idx + 1}`,
          created_at: new Date().toISOString(),
          model_name: 'Gemini Draft',
          workspaceId: 'drafts', // Phantom workspace!
          metadata: {
              tags: result.style || '',
              prompt: result.lyricsWithTags || ''
          },
          originalData: result
      }));
      setHistory(prev => [...draftClips, ...prev]);
      saveClips(draftClips).catch(console.error);

    } catch (err: any) {
      let errorMsg = err.message || "Something went wrong.";
      if (errorMsg.includes("503") || errorMsg.includes("429") || errorMsg.includes("overloaded") || errorMsg.includes("timeout")) {
          errorMsg += "\n\n💡 Tip: The Gemini API seems to be overloaded right now. Trying a different model from the top-right Settings menu (e.g. Gemini Flash-Lite) often works!";
      }

      setState({
        isLoading: false,
        error: errorMsg,
        result: null,
      });
    }
  };

  const handleUpdateClip = useCallback((id: string, updates: Partial<SunoClip>) => {
    setHistory(prev => {
        const targetIndex = prev.findIndex(c => c.id === id);
        if (targetIndex === -1) return prev;
        const updated = { ...prev[targetIndex], ...updates };
        const next = [...prev];
        next[targetIndex] = updated;
        saveClip(updated).catch(console.error);
        return next;
    });
  }, []);

  const handleAddClip = useCallback((clips: SunoClip | SunoClip[]) => {
      const clipsArray = Array.isArray(clips) ? clips : [clips];
      mergeClips(clipsArray);
  }, []);

  const renderContent = () => {
    switch (currentPath) {
      case '/':
        return <HomePage historyCount={history.length} />;
      case '/privacy':
        return <PrivacyPage />;
      case '/terms':
        return <TermsPage />;
      case '/about':
        return <AboutPage />;
      case '/history':
        return (
          <HistorySection 
              history={history} 
              onUpdateClip={handleUpdateClip} 
              onAddClip={handleAddClip}
              sunoCookie={sunoCookie}
              onFetchHistory={handleFetchHistory}
              isSyncing={isSyncingHistory}
              syncProgress={syncProgress}
              workspaces={workspaces}
              selectedWorkspaceId={selectedWorkspaceId}
              onSelectWorkspace={setSelectedWorkspaceId}
              targetWorkspaceId={targetWorkspaceId}
              onTargetWorkspaceChange={handleTargetWorkspaceChange}
          />
        );
      case '/video':
        return (
          <VisualizerSection 
            history={history}
            sunoCookie={sunoCookie}
            onUpdateClip={handleUpdateClip}
            apiKey={customApiKey}
            geminiModel={geminiModel}
            workspaces={workspaces}
            selectedWorkspaceId={selectedWorkspaceId}
            onSelectWorkspace={setSelectedWorkspaceId}
            onFetchHistory={handleFetchHistory}
            isSyncing={isSyncingHistory}
            syncProgress={syncProgress}
          />
        );
      case '/lyrics':
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
                        promptSettings={promptSettings}
                        onSyncSuccess={handleSyncSuccess}
                        onUpdateTrack={handleUpdateResult}
                        workspaces={workspaces}
                        targetWorkspaceId={targetWorkspaceId}
                        onTargetWorkspaceChange={handleTargetWorkspaceChange}
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
        onOpenSunoModal={() => setIsSunoModalOpen(true)}
        sunoCredits={sunoCredits}
        sunoModel={sunoModel}
        sunoModels={sunoModels}
        onModelChange={handleModelChange}
        geminiModel={geminiModel}
        onGeminiModelChange={handleGeminiModelChange}
        historyCount={history.length}
      />

      <SunoSettingsModal 
        isOpen={isSunoModalOpen}
        onClose={() => setIsSunoModalOpen(false)}
        initialCookie={sunoCookie}
        initialModel={sunoModel}
        sunoModels={sunoModels}
        onCustomModelsUpdate={(models) => setSunoModels(getCombinedSunoModels(models))}
        personas={personas}
        onPersonasUpdate={(p) => setPersonas(p)}
        initialPromptSettings={promptSettings}
        initialSettings={promptSettings}
        currentCredits={sunoCredits}
        onSave={handleSaveSunoConfig}
      />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {renderContent()}
      </main>

      <Footer git="https://github.com/Lumi-Script/Suno-Architect/" />
    </div>
  );
};

export default App;
