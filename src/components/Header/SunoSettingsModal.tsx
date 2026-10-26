import React, { useState, useEffect, useRef } from 'react';
import CopyButton from './CopyButton';
import { getSunoCredits, getSunoBillingInfo, getSunoPersonas } from '../../services/sunoApi';
import { getAllPersonas, savePersonas } from '../../utils/idb';
import { SUNO_MODEL_MAPPINGS, getCombinedSunoModels, buildKnowledgeBase, GEN_STATIC_PROMPT, GET_PROMPT_V2, GET_PROMPT_V3, GET_PROMPT_V4, DEFAULT_SUNO_LIBRARY, DEFAULT_LYRICAL_CONSTRAINTS } from '../../constants';
import { PromptSettings, SunoLibrary, LyricalConstraints, SunoPersona } from '../../types';

interface SunoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cookie: string, model: string, promptSettings: PromptSettings) => void;
  initialCookie: string;
  initialModel: string;
  sunoModels?: Array<{ label: string; value: string }>;
  onCustomModelsUpdate?: (models: Array<{ label: string; value: string }>) => void;
  personas?: SunoPersona[];
  onPersonasUpdate?: (personas: SunoPersona[]) => void;
  initialPromptSettings?: PromptSettings;
  initialSettings?: PromptSettings;
  currentCredits?: number | null;
}

const defaultPromptSettings: PromptSettings = {
  version: 'v4',
  customSystemPrompt: GET_PROMPT_V4(),
  library: DEFAULT_SUNO_LIBRARY,
  constraints: DEFAULT_LYRICAL_CONSTRAINTS
};

const SunoSettingsModal: React.FC<SunoSettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialCookie, 
  initialModel,
  sunoModels,
  onCustomModelsUpdate,
  personas,
  onPersonasUpdate,
  initialPromptSettings,
  initialSettings,
  currentCredits = null
}) => {
  const [activeTab, setActiveTab] = useState<'connection' | 'prompt'>('connection');
  
  // Connection State
  const [cookie, setCookie] = useState('');
  const [model, setModel] = useState('chirp-hawk');
  const [localModels, setLocalModels] = useState<Array<{ label: string; value: string }>>(() => sunoModels || SUNO_MODEL_MAPPINGS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<{success: boolean, msg: string} | null>(null);
  const [localCredits, setLocalCredits] = useState<number | null>(null);

  // Synchronize localModels when sunoModels prop changes
  useEffect(() => {
    if (sunoModels && sunoModels.length > 0) {
      setLocalModels(sunoModels);
    }
  }, [sunoModels]);

  // Model Dropdown State
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  // Prompt Settings State
  const [promptSettings, setPromptSettings] = useState<PromptSettings>(() => initialPromptSettings || initialSettings || defaultPromptSettings);
  
  // Temporary state for editing text areas (joined arrays)
  const [libGenres, setLibGenres] = useState('');
  const [libStructures, setLibStructures] = useState('');
  const [libVocals, setLibVocals] = useState('');
  const [libProduction, setLibProduction] = useState('');
  const [libTheory, setLibTheory] = useState('');
  
  const [constForbidden, setConstForbidden] = useState('');
  const [constAdjectives, setConstAdjectives] = useState('');
  const [constPhrases, setConstPhrases] = useState('');
  const [constRhymes, setConstRhymes] = useState('');
  const [includeVoice, setIncludeVoice] = useState(false);
  // Voice Persona State
  const [localPersonas, setLocalPersonas] = useState<SunoPersona[]>(() => {
    if (personas && personas.length > 0) return personas;
    try {
      const cached = localStorage.getItem('suno_personas');
      if (cached) return JSON.parse(cached);
    } catch (_) {}
    return [];
  });
  const [personaId, setPersonaId] = useState('');
  const [personaName, setPersonaName] = useState('');
  const [isPersonaDropdownOpen, setIsPersonaDropdownOpen] = useState(false);
  const [isManualPersona, setIsManualPersona] = useState(false);
  const [isFetchingPersonas, setIsFetchingPersonas] = useState(false);
  const personaDropdownRef = useRef<HTMLDivElement>(null);

  // Synchronize localPersonas when personas prop changes
  useEffect(() => {
    if (personas && personas.length > 0) {
      setLocalPersonas(personas);
    }
  }, [personas]);

  // Load personas from IndexedDB on initial mount if not yet loaded
  useEffect(() => {
    if (localPersonas.length === 0) {
      getAllPersonas().then((cached) => {
        if (cached && cached.length > 0) {
          setLocalPersonas(cached);
        }
      }).catch(() => {});
    }
  }, []);

  // Click outside listener for persona dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (personaDropdownRef.current && !personaDropdownRef.current.contains(event.target as Node)) {
        setIsPersonaDropdownOpen(false);
      }
    }
    if (isPersonaDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPersonaDropdownOpen]);
  const [audioWeight, setAudioWeight] = useState(100);

  const [isCustomMode, setIsCustomMode] = useState(false);

  // Effect to load initial state when modal opens
  useEffect(() => {
    if (isOpen) {
        setCookie(initialCookie || '');
        const currentList = (sunoModels && sunoModels.length > 0) ? sunoModels : getCombinedSunoModels();
        const activeModel = (initialModel && initialModel !== 'chirp-bluejay') 
            ? initialModel 
            : (currentList[0]?.value || 'chirp-hawk');
        setModel(activeModel);
        setIsCustomMode(!!activeModel && !currentList.some(m => m.value === activeModel));
        setLocalCredits(currentCredits);
        
        const settings = initialPromptSettings || initialSettings || defaultPromptSettings;
        setPromptSettings(settings);
        
        const lib = settings.library || DEFAULT_SUNO_LIBRARY;
        setLibGenres((lib.genres || DEFAULT_SUNO_LIBRARY.genres).join(', '));
        setLibStructures((lib.structures || DEFAULT_SUNO_LIBRARY.structures).join(', '));
        setLibVocals((lib.vocalStyles || DEFAULT_SUNO_LIBRARY.vocalStyles).join(', '));
        setLibProduction((lib.production || DEFAULT_SUNO_LIBRARY.production).join(', '));
        setLibTheory((lib.theory || DEFAULT_SUNO_LIBRARY.theory).join(', '));
        
        const cons = settings.constraints || DEFAULT_LYRICAL_CONSTRAINTS;
        setConstForbidden((cons.forbidden || DEFAULT_LYRICAL_CONSTRAINTS.forbidden).join(', '));
        setConstAdjectives((cons.forbiddenAdjectives || DEFAULT_LYRICAL_CONSTRAINTS.forbiddenAdjectives).join(', '));
        setConstPhrases((cons.forbiddenPhrases || DEFAULT_LYRICAL_CONSTRAINTS.forbiddenPhrases).join(', '));
        setConstRhymes(cons.forbiddenRhymes || DEFAULT_LYRICAL_CONSTRAINTS.forbiddenRhymes);
        
        setIncludeVoice(settings.includeVoice || false);
        const pId = settings.personaUUID || settings.personaId || '';
        const pName = settings.personaName || '';
        const matched = localPersonas.find(p => p.id === pId || p.name === pId || (pName && p.name === pName));
        if (matched) {
            setPersonaId(matched.id);
            setPersonaName(matched.name);
            setIsManualPersona(false);
        } else if (pId || pName) {
            setPersonaId(pId);
            setPersonaName(pName || pId);
            setIsManualPersona(true);
        } else {
            setPersonaId('');
            setPersonaName('');
            setIsManualPersona(false);
        }
        setAudioWeight(settings.audioWeight ?? 100);
    }
  }, [isOpen, initialCookie, initialModel, currentCredits, initialPromptSettings, initialSettings]);

  // Click outside listener for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    }
    if (isModelDropdownOpen) {
        document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModelDropdownOpen]);

  // Handle version switching to auto-fill custom prompt if switching to a preset
  const handleVersionChange = (newVersion: 'v1' | 'v2' | 'v3' | 'v4' | 'custom') => {
      let newText = promptSettings.customSystemPrompt;
      
      const currentLib: SunoLibrary = {
          genres: libGenres.split(',').map(s => s.trim()).filter(Boolean),
          structures: libStructures.split(',').map(s => s.trim()).filter(Boolean),
          vocalStyles: libVocals.split(',').map(s => s.trim()).filter(Boolean),
          production: libProduction.split(',').map(s => s.trim()).filter(Boolean),
          theory: libTheory.split(',').map(s => s.trim()).filter(Boolean),
      };

      const currentConstraints: LyricalConstraints = {
          forbidden: constForbidden.split(',').map(s => s.trim()).filter(Boolean),
          forbiddenAdjectives: constAdjectives.split(',').map(s => s.trim()).filter(Boolean),
          forbiddenPhrases: constPhrases.split(',').map(s => s.trim()).filter(Boolean),
          forbiddenRhymes: constRhymes
      };

      const kb = buildKnowledgeBase(currentLib);

      if (newVersion === 'v1') {
          newText = GEN_STATIC_PROMPT(kb);
      } else if (newVersion === 'v2') {
          newText = GET_PROMPT_V2(kb, currentConstraints);
      } else if (newVersion === 'v3') {
          newText = GET_PROMPT_V3();
      } else if (newVersion === 'v4') {
          newText = GET_PROMPT_V4();
      }
      
      setPromptSettings(prev => ({
          ...prev,
          version: newVersion,
          customSystemPrompt: newText
      }));
  };

  const handleResetDefaults = () => {
    if(window.confirm("Reset all library definitions and constraints to default?")) {
        setLibGenres(DEFAULT_SUNO_LIBRARY.genres.join(', '));
        setLibStructures(DEFAULT_SUNO_LIBRARY.structures.join(', '));
        setLibVocals(DEFAULT_SUNO_LIBRARY.vocalStyles.join(', '));
        setLibProduction(DEFAULT_SUNO_LIBRARY.production.join(', '));
        setLibTheory(DEFAULT_SUNO_LIBRARY.theory.join(', '));
        
        setConstForbidden(DEFAULT_LYRICAL_CONSTRAINTS.forbidden.join(', '));
        setConstAdjectives(DEFAULT_LYRICAL_CONSTRAINTS.forbiddenAdjectives.join(', '));
        setConstPhrases(DEFAULT_LYRICAL_CONSTRAINTS.forbiddenPhrases.join(', '));
        setConstRhymes(DEFAULT_LYRICAL_CONSTRAINTS.forbiddenRhymes);
    }
  };

  if (!isOpen) return null;

  const handleSave = () => {
    // Reconstruct objects from string inputs
    const updatedLibrary: SunoLibrary = {
        genres: libGenres.split(',').map(s => s.trim()).filter(Boolean),
        structures: libStructures.split(',').map(s => s.trim()).filter(Boolean),
        vocalStyles: libVocals.split(',').map(s => s.trim()).filter(Boolean),
        production: libProduction.split(',').map(s => s.trim()).filter(Boolean),
        theory: libTheory.split(',').map(s => s.trim()).filter(Boolean),
    };

    const updatedConstraints: LyricalConstraints = {
        forbidden: constForbidden.split(',').map(s => s.trim()).filter(Boolean),
        forbiddenAdjectives: constAdjectives.split(',').map(s => s.trim()).filter(Boolean),
        forbiddenPhrases: constPhrases.split(',').map(s => s.trim()).filter(Boolean),
        forbiddenRhymes: constRhymes
    };
    
    // If we are in V1 or V2 mode, regenerate the prompt text based on the NEW library/constraints before saving.
    // If V3 or V4, regenerate using static.
    let finalSystemPrompt = promptSettings.customSystemPrompt;
    if (promptSettings.version !== 'custom') {
        const kb = buildKnowledgeBase(updatedLibrary);
        if (promptSettings.version === 'v1') {
            finalSystemPrompt = GEN_STATIC_PROMPT(kb);
        } else if (promptSettings.version === 'v2') {
            finalSystemPrompt = GET_PROMPT_V2(kb, updatedConstraints);
        } else if (promptSettings.version === 'v3') {
            finalSystemPrompt = GET_PROMPT_V3();
        } else if (promptSettings.version === 'v4') {
            finalSystemPrompt = GET_PROMPT_V4();
        }
    }

    if (includeVoice && !personaId.trim() && !personaName.trim()) {
        alert("Please select a Voice Persona when Vocal Selection is enabled.");
        return;
    }

    const matchedPersona = localPersonas.find(p => p.id === personaId || p.name === personaName);
    const finalPersonaName = matchedPersona ? matchedPersona.name : (personaName || personaId);
    const finalPersonaUUID = matchedPersona ? matchedPersona.id : (personaId || personaName);

    const finalSettings: PromptSettings = {
        version: promptSettings.version,
        customSystemPrompt: finalSystemPrompt,
        library: updatedLibrary,
        constraints: updatedConstraints,
        includeVoice,
        personaId: finalPersonaName,
        personaName: finalPersonaName,
        personaUUID: finalPersonaUUID,
        audioWeight
    };

    onSave(cookie, model, finalSettings);
    onClose();
  };

  const handleReloadPersonas = async () => {
    if (!cookie || !cookie.trim()) return;
    setIsFetchingPersonas(true);
    try {
      const fetched = await getSunoPersonas(cookie);
      if (fetched.length > 0) {
        setLocalPersonas(fetched);
        await savePersonas(fetched);
        onPersonasUpdate?.(fetched);
      }
    } catch (e) {
      console.warn("Failed to reload personas:", e);
    } finally {
      setIsFetchingPersonas(false);
    }
  };

  const handleVerify = async () => {
      if (!cookie || !cookie.trim()) {
          setVerifyStatus({ success: false, msg: "Please enter a token first." });
          return;
      }
      setIsVerifying(true);
      setVerifyStatus(null);
      try {
          const info = await getSunoBillingInfo(cookie);
          setLocalCredits(info.credits);
          if (info.customModels.length > 0) {
              const combined = getCombinedSunoModels(info.customModels);
              setLocalModels(combined);
              onCustomModelsUpdate?.(info.customModels);
          }
          
          let fetchedPersonas: SunoPersona[] = [];
          try {
              fetchedPersonas = await getSunoPersonas(cookie);
              if (fetchedPersonas.length > 0) {
                  setLocalPersonas(fetchedPersonas);
                  await savePersonas(fetchedPersonas);
                  onPersonasUpdate?.(fetchedPersonas);
              }
          } catch (pe) {
              console.warn("Could not fetch personas during verify:", pe);
          }

          const parts = [`Connected Successfully! (${info.credits} credits available)`];
          if (info.customModels.length > 0) {
              parts.push(`found ${info.customModels.length} custom model${info.customModels.length > 1 ? 's' : ''}`);
          }
          if (fetchedPersonas.length > 0) {
              parts.push(`found ${fetchedPersonas.length} persona${fetchedPersonas.length > 1 ? 's' : ''}`);
          }
          setVerifyStatus({ success: true, msg: parts.join(', ') });
      } catch (e: any) {
          setLocalCredits(null);
          if (e.message === '401' || e.message?.includes('401')) {
              setVerifyStatus({ 
                  success: false, 
                  msg: "Current key/token has expired or is unauthorized (401). Paste your fresh token below to update it." 
              });
          } else {
              setVerifyStatus({ success: false, msg: e.message ? `Connection failed: ${e.message}` : "Login Failed. Check token or network." });
          }
      } finally {
          setIsVerifying(false);
      }
  };

  const appOrigin = typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('suno.com')
    ? window.location.origin
    : 'https://sunoarchitect.lumi-script.dev';
  const tokenSnippet = `window.cookieStore.get("__session").then(c => c?.value && (window.location.href = \`${appOrigin}/?suno_token=\${encodeURIComponent(c.value)}\`));`;
  const copyOnlySnippet = `copy(await (await window.cookieStore.get("__session")).value)`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header & Tabs */}
        <div className="flex-shrink-0 border-b border-slate-800 bg-slate-900/80 p-4 rounded-t-2xl flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="bg-slate-800 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-pink-400">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polygon points="10 8 16 12 10 16 10 8"></polygon>
                    </svg>
                </span>
                Settings
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-slate-950/50 border-b border-slate-800">
            <button 
                onClick={() => setActiveTab('connection')}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'connection' ? 'text-purple-400 border-b-2 border-purple-400 bg-slate-900' : 'text-slate-500 hover:text-slate-300'}`}
            >
                API Connection
            </button>
            <button 
                onClick={() => setActiveTab('prompt')}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'prompt' ? 'text-purple-400 border-b-2 border-purple-400 bg-slate-900' : 'text-slate-500 hover:text-slate-300'}`}
            >
                Prompt Engineering
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
            
            {/* --- TAB: CONNECTION --- */}
            {activeTab === 'connection' && (
                <div className="space-y-6 max-w-lg mx-auto">
                    <p className="text-sm text-slate-400 leading-relaxed">
                        To sync directly with Suno, provide your <strong>Authorization Token</strong> (Bearer) or Session Cookie.
                    </p>

                    <div className="bg-slate-950/50 border border-purple-500/20 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider">1-Click Auto-Connect Script</h3>
                            <div className="flex items-center gap-2">
                                <CopyButton text={copyOnlySnippet} label="Copy Token Only" />
                                <CopyButton text={tokenSnippet} label="Copy Auto-Redirect Script" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mb-3">
                            1. Go to <a href="https://suno.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline hover:text-purple-300">suno.com</a> and make sure you are logged in.<br/>
                            2. Open Developer Tools (<kbd className="bg-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300">F12</kbd> or <kbd className="bg-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300">Ctrl+Shift+J</kbd>) &gt; <strong>Console</strong>.<br/>
                            3. Paste the script below and hit <kbd className="bg-slate-800 px-1 py-0.5 rounded text-[11px] text-slate-300">Enter</kbd>.<br/>
                            4. It will immediately redirect back here, save your token, and sync your billing, personas, and workspaces automatically!
                        </p>
                        <div className="bg-black/50 rounded-lg p-3 overflow-x-auto border border-white/5 shadow-inner">
                            <pre className="text-[10px] font-mono text-purple-300/90 whitespace-pre-wrap select-all">{tokenSnippet}</pre>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-slate-300">Suno Token / Cookie</label>
                            <div className="flex items-center gap-2">
                                {cookie && (
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            setCookie('');
                                            setLocalCredits(null);
                                            setVerifyStatus({ success: false, msg: "Key cleared. Paste your new key below." });
                                        }}
                                        className="text-[11px] text-slate-400 hover:text-red-400 underline transition-colors"
                                    >
                                        Clear Key
                                    </button>
                                )}
                                {localCredits !== null && (
                                    <span className="text-xs font-bold text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded">
                                        Credits: {localCredits}
                                    </span>
                                )}
                            </div>
                        </div>
                        <textarea
                            value={cookie}
                            onChange={(e) => {
                                setCookie(e.target.value);
                                setVerifyStatus(null);
                            }}
                            placeholder="Paste your Bearer Token (ey...) here..."
                            className="w-full h-24 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-300 placeholder-slate-600 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none custom-scrollbar resize-none"
                        />
                        <div className="flex justify-between items-center mt-2">
                             <span className="text-yellow-500/80 text-xs block bg-yellow-900/10 p-2 rounded border border-yellow-900/30 flex-1 mr-4">
                                ⚠️ <strong>Recommendation:</strong> Use the <strong>Bearer Token</strong>.
                             </span>
                            <button
                                onClick={handleVerify}
                                disabled={isVerifying || !cookie}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap
                                    ${isVerifying ? 'bg-slate-700 text-slate-400 cursor-wait' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                            >
                                {isVerifying ? 'Checking...' : 'Login & Verify'}
                            </button>
                        </div>
                         {verifyStatus && (
                            <div className={`mt-2 text-xs font-medium ${verifyStatus.success ? 'text-green-400' : 'text-red-400'}`}>
                                {verifyStatus.msg}
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700" ref={modelDropdownRef}>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Generation Model</label>
                        <div className="relative">
                            <button
                                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all flex items-center justify-between"
                            >
                                <span>{isCustomMode ? `Manual ID (${model || 'Not set'})` : `${localModels.find(m => m.value === model)?.label || model} (${model})`}</span>
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isModelDropdownOpen ? 'rotate-180' : ''}`}
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>
                            
                            {isModelDropdownOpen && (
                                <div className="absolute bottom-full left-0 right-0 mb-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-20 max-h-60 overflow-y-auto custom-scrollbar">
                                    {localModels.map((m) => (
                                        <button
                                            key={m.value}
                                            onClick={() => { setModel(m.value); setIsCustomMode(false); setIsModelDropdownOpen(false); }}
                                            className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between
                                            ${!isCustomMode && model === m.value 
                                                ? 'bg-pink-600/20 text-pink-300' 
                                                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}
                                        >
                                            <div className="flex flex-col">
                                                <span>{m.label}</span>
                                                <span className="text-[10px] text-slate-400 font-mono">{m.value}</span>
                                            </div>
                                            {!isCustomMode && model === m.value && (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-pink-400">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => { setIsCustomMode(true); setIsModelDropdownOpen(false); }}
                                        className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between border-t border-slate-700/60
                                        ${isCustomMode 
                                            ? 'bg-pink-600/20 text-pink-300' 
                                            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}
                                    >
                                        <div className="flex flex-col">
                                            <span>Manual ID Entry...</span>
                                            <span className="text-[10px] text-slate-400">Enter custom model key manually</span>
                                        </div>
                                        {isCustomMode && (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-pink-400">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                        {isCustomMode && (
                            <div className="mt-3">
                                <label className="block text-xs font-medium text-slate-400 mb-1">Custom Model ID</label>
                                <input
                                    type="text"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    placeholder="e.g. chirp-custom:id"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                />
                            </div>
                        )}
                        <div className="mt-4 pt-4 border-t border-slate-700/50">
                            <label className="flex items-center gap-2 mb-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={includeVoice}
                                    onChange={(e) => setIncludeVoice(e.target.checked)}
                                    className="w-4 h-4 text-pink-500 bg-slate-900 border-slate-700 rounded focus:ring-pink-500/50"
                                />
                                <span className="text-sm font-medium text-slate-300">Vocal Selection (Include Voice)</span>
                            </label>
                            
                            {includeVoice && (
                                <div className="mt-3 space-y-4">
                                    <div ref={personaDropdownRef}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="text-xs font-medium text-slate-400">
                                                Voice Persona <span className="text-red-400">*</span>
                                            </label>
                                            {cookie && (
                                                <button
                                                    type="button"
                                                    onClick={handleReloadPersonas}
                                                    disabled={isFetchingPersonas}
                                                    className="text-[11px] text-pink-400 hover:text-pink-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                                                    title="Refresh personas from Suno"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-3 h-3 ${isFetchingPersonas ? 'animate-spin' : ''}`}>
                                                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                                                    </svg>
                                                    <span>{isFetchingPersonas ? 'Fetching...' : 'Sync Personas'}</span>
                                                </button>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsPersonaDropdownOpen(!isPersonaDropdownOpen)}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all flex items-center justify-between"
                                            >
                                                <span className="truncate">
                                                    {isManualPersona 
                                                        ? `Manual ID (${personaId || 'None'})` 
                                                        : (personaName || localPersonas.find(p => p.id === personaId)?.name || 'Select a Persona...')}
                                                </span>
                                                <svg 
                                                    xmlns="http://www.w3.org/2000/svg" 
                                                    viewBox="0 0 24 24" 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    strokeWidth="2" 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${isPersonaDropdownOpen ? 'rotate-180' : ''}`}
                                                >
                                                    <polyline points="6 9 12 15 18 9" />
                                                </svg>
                                            </button>

                                            {isPersonaDropdownOpen && (
                                                <div className="absolute bottom-full left-0 right-0 mb-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-20 max-h-60 overflow-y-auto custom-scrollbar">
                                                    {localPersonas.length === 0 ? (
                                                        <div className="p-3 text-xs text-slate-400 text-center">
                                                            No personas cached yet. Click <strong>Sync Personas</strong> or verify your Suno token to load them.
                                                        </div>
                                                    ) : (
                                                        localPersonas.map((p) => {
                                                            const isSelected = !isManualPersona && (personaId === p.id || personaName === p.name);
                                                            return (
                                                                <button
                                                                    key={p.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setPersonaId(p.id);
                                                                        setPersonaName(p.name);
                                                                        setIsManualPersona(false);
                                                                        setIsPersonaDropdownOpen(false);
                                                                    }}
                                                                    className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                                                                        isSelected 
                                                                            ? 'bg-pink-600/20 text-pink-300' 
                                                                            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                                                    }`}
                                                                >
                                                                    <div className="flex flex-col truncate mr-2">
                                                                        <span className="font-medium text-white truncate">{p.name}</span>
                                                                        <span className="text-[10px] text-slate-400 font-mono truncate">{p.id}</span>
                                                                    </div>
                                                                    {isSelected && (
                                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-pink-400 flex-shrink-0">
                                                                            <polyline points="20 6 9 17 4 12" />
                                                                        </svg>
                                                                    )}
                                                                </button>
                                                            );
                                                        })
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsManualPersona(true);
                                                            setIsPersonaDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between border-t border-slate-700/60 ${
                                                            isManualPersona 
                                                                ? 'bg-pink-600/20 text-pink-300' 
                                                                : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                                        }`}
                                                    >
                                                        <span>Manual ID Entry...</span>
                                                        {isManualPersona && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-pink-400">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {isManualPersona && (
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    value={personaId}
                                                    onChange={(e) => {
                                                        setPersonaId(e.target.value);
                                                        setPersonaName(e.target.value);
                                                    }}
                                                    placeholder="Enter Persona UUID or Name"
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <label className="text-xs font-medium text-slate-400">Audio Weight</label>
                                            <span className="text-xs text-pink-400 font-mono">{audioWeight}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="1"
                                            value={audioWeight}
                                            onChange={(e) => setAudioWeight(parseInt(e.target.value))}
                                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB: PROMPT ENGINEERING --- */}
            {activeTab === 'prompt' && (
                <div className="space-y-8">
                    
                    {/* 1. Prompt Version */}
                    <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
                         <div>
                             <h3 className="text-base font-bold text-white">System Prompt Version</h3>
                             <p className="text-xs text-slate-400">Select which instruction set the AI uses.</p>
                         </div>
                         <div className="flex bg-slate-900 p-1 rounded-lg">
                             {(['v1', 'v2', 'v3', 'v4', 'custom'] as const).map(v => (
                                 <button
                                    key={v}
                                    onClick={() => handleVersionChange(v)}
                                    className={`px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${promptSettings.version === v ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                                 >
                                     {v === 'v2' ? 'V2 (Lyrical)' : v === 'v1' ? 'V1 (Classic)' : v === 'v3' ? 'V3 (Detailed)' : v === 'v4' ? 'V4 (Advanced)' : 'Custom'}
                                 </button>
                             ))}
                         </div>
                    </div>

                    {/* 2 & 3. Library & Constraints (Hidden if V3 or V4) */}
                    {promptSettings.version !== 'v3' && promptSettings.version !== 'v4' && (
                        <>
                            <div className={`grid grid-cols-1 ${promptSettings.version !== 'v1' ? 'lg:grid-cols-2' : ''} gap-8`}>
                                {/* Library Configuration */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider">Suno Library</h3>
                                        <button onClick={handleResetDefaults} className="text-xs text-red-400 hover:text-red-300 hover:underline">Reset Defaults</button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <ConfigArea label="Genres" value={libGenres} onChange={setLibGenres} />
                                        <ConfigArea label="Structures" value={libStructures} onChange={setLibStructures} />
                                        <ConfigArea label="Vocal Styles" value={libVocals} onChange={setLibVocals} />
                                        <ConfigArea label="Production" value={libProduction} onChange={setLibProduction} />
                                        <ConfigArea label="Music Theory" value={libTheory} onChange={setLibTheory} />
                                    </div>
                                </div>

                                {/* Constraints Configuration - Hidden for V1 */}
                                {promptSettings.version !== 'v1' && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">Lyrical Constraints</h3>
                                        <div className="space-y-3">
                                            <ConfigArea label="Forbidden Words" value={constForbidden} onChange={setConstForbidden} />
                                            <ConfigArea label="Forbidden Adjectives" value={constAdjectives} onChange={setConstAdjectives} />
                                            <ConfigArea label="Forbidden Phrases" value={constPhrases} onChange={setConstPhrases} />
                                            <ConfigArea label="Forbidden Rhymes" value={constRhymes} onChange={setConstRhymes} />
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-6 p-4 bg-purple-900/20 border border-purple-500/20 rounded-xl">
                                <h4 className="text-xs font-bold text-purple-300 mb-2">How it works</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    The settings above automatically update the <strong>Knowledge Base</strong> injected into the system prompt. 
                                    Switching between V1 and V2 will regenerate the prompt text below using these values. 
                                    Selecting "Custom" preserves your edits.
                                </p>
                            </div>
                        </>
                    )}

                    {/* Information Box for V3 */}
                    {promptSettings.version === 'v3' && (
                         <div className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-xl">
                            <h4 className="text-xs font-bold text-blue-300 mb-2">Extended Knowledge Base Active</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                V3 uses a comprehensive, static knowledge base covering advanced parameters, extensive genre lists, and specific prompting strategies. 
                                Library customisation is disabled in this mode to ensure prompt consistency with the knowledge base.
                            </p>
                        </div>
                    )}

                    {/* Information Box for V4 */}
                    {promptSettings.version === 'v4' && (
                         <div className="p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-xl">
                            <h4 className="text-xs font-bold text-emerald-300 mb-2">Extended Knowledge Base Active</h4>
                            <div className="text-xs text-slate-400 leading-relaxed space-y-2">
                                <p>
                                    V4 uses an alternative, comprehensive, static knowledge base covering advanced parameters and alternative structuring of available parameters. Library customisation is disabled in this mode to ensure prompt consistency with the knowledge base.
                                </p>
                                <div className="pt-2 border-t border-emerald-500/10">
                                    <p>Version: 2025-12-02 (distilled from tag-reference_20251120-02.md)</p>
                                    <p>Source: <a href="https://github.com/stayen/suno-reference/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">https://github.com/stayen/suno-reference/</a></p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. Full Prompt Editor */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-bold text-slate-300">Active System Instruction</h3>
                        <textarea 
                            value={promptSettings.customSystemPrompt}
                            onChange={(e) => setPromptSettings(prev => ({...prev, customSystemPrompt: e.target.value, version: 'custom'}))}
                            className="w-full h-[400px] bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 focus:ring-1 focus:ring-purple-500 outline-none custom-scrollbar leading-relaxed"
                        />
                    </div>
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 flex justify-end gap-3 p-4 border-t border-slate-800 bg-slate-900/80 rounded-b-2xl">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 rounded-lg shadow-lg hover:shadow-pink-500/25 transition-all">
              Save Configuration
            </button>
        </div>
      </div>
    </div>
  );
};

const ConfigArea = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
        <textarea 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-16 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 focus:ring-1 focus:ring-purple-500/50 outline-none custom-scrollbar resize-none"
        />
    </div>
);

export default SunoSettingsModal;
