import React, { useState, useEffect, useRef } from 'react';
import CopyButton from './CopyButton';
import { getSunoCredits } from '../services/sunoApi';
import { SUNO_MODEL_MAPPINGS, buildKnowledgeBase, GET_PROMPT_V1, GET_PROMPT_V2, GET_PROMPT_V3, GET_PROMPT_V4, DEFAULT_SUNO_LIBRARY, DEFAULT_LYRICAL_CONSTRAINTS } from '../constants';
import { PromptSettings, SunoLibrary, LyricalConstraints } from '../types';

interface SunoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cookie: string, model: string, promptSettings: PromptSettings) => void;
  initialCookie: string;
  initialModel: string;
  initialPromptSettings: PromptSettings;
  currentCredits: number | null;
}

const SunoSettingsModal: React.FC<SunoSettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialCookie, 
  initialModel,
  initialPromptSettings,
  currentCredits 
}) => {
  const [activeTab, setActiveTab] = useState<'connection' | 'prompt'>('connection');
  
  // Connection State
  const [cookie, setCookie] = useState('');
  const [model, setModel] = useState('chirp-bluejay');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<{success: boolean, msg: string} | null>(null);
  const [localCredits, setLocalCredits] = useState<number | null>(null);

  // Model Dropdown State
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  // Prompt Settings State
  const [promptSettings, setPromptSettings] = useState<PromptSettings>(initialPromptSettings);
  
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

  // Effect to load initial state when modal opens
  useEffect(() => {
    if (isOpen) {
        setCookie(initialCookie);
        setModel(initialModel || 'chirp-bluejay');
        setLocalCredits(currentCredits);
        setPromptSettings(initialPromptSettings);
        
        // Initialize Library Inputs
        setLibGenres(initialPromptSettings.library.genres.join(', '));
        setLibStructures(initialPromptSettings.library.structures.join(', '));
        setLibVocals(initialPromptSettings.library.vocalStyles.join(', '));
        setLibProduction(initialPromptSettings.library.production.join(', '));
        setLibTheory(initialPromptSettings.library.theory.join(', '));
        
        // Initialize Constraints Inputs
        setConstForbidden(initialPromptSettings.constraints.forbidden.join(', '));
        setConstAdjectives(initialPromptSettings.constraints.forbiddenAdjectives.join(', '));
        setConstPhrases(initialPromptSettings.constraints.forbiddenPhrases.join(', '));
        setConstRhymes(initialPromptSettings.constraints.forbiddenRhymes);
    }
  }, [isOpen, initialCookie, initialModel, currentCredits, initialPromptSettings]);

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
          newText = GET_PROMPT_V1(kb);
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
            finalSystemPrompt = GET_PROMPT_V1(kb);
        } else if (promptSettings.version === 'v2') {
            finalSystemPrompt = GET_PROMPT_V2(kb, updatedConstraints);
        } else if (promptSettings.version === 'v3') {
            finalSystemPrompt = GET_PROMPT_V3();
        } else if (promptSettings.version === 'v4') {
            finalSystemPrompt = GET_PROMPT_V4();
        }
    }

    const finalSettings: PromptSettings = {
        version: promptSettings.version,
        customSystemPrompt: finalSystemPrompt,
        library: updatedLibrary,
        constraints: updatedConstraints
    };

    onSave(cookie, model, finalSettings);
    onClose();
  };

  const handleVerify = async () => {
      if (!cookie) {
          setVerifyStatus({ success: false, msg: "Please enter a token first." });
          return;
      }
      setIsVerifying(true);
      setVerifyStatus(null);
      try {
          const credits = await getSunoCredits(cookie);
          setLocalCredits(credits);
          setVerifyStatus({ success: true, msg: "Connected Successfully!" });
      } catch (e: any) {
          setLocalCredits(null);
          setVerifyStatus({ success: false, msg: "Login Failed. Check token." });
      } finally {
          setIsVerifying(false);
      }
  };

  const tokenSnippet = `await (async function() {
    const sessionCookie = await window.Clerk.session.getToken();

    if (sessionCookie) {
        console.log("%c Suno Session Token Found! ", "background: #222; color: #bada55; font-size: 14px;");
        console.log(sessionCookie);
        copy(sessionCookie); 
        console.log("%c Result copied to clipboard automatically.", "color: gray;");
    } else {
        console.error("Session token not found. Make sure you are logged in at suno.com");
    }
})();`;

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
                            <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider">Auto-Get Token Script</h3>
                            <CopyButton text={tokenSnippet} label="Copy Script" />
                        </div>
                        <p className="text-xs text-slate-400 mb-3">
                            1. Go to suno.com and log in.<br/>
                            2. Open Developer Tools (F12) &gt; Console.<br/>
                            3. Paste this code and hit Enter.
                        </p>
                        <div className="bg-black/50 rounded-lg p-3 overflow-x-auto border border-white/5 shadow-inner">
                            <pre className="text-[10px] font-mono text-slate-400 whitespace-pre-wrap">{tokenSnippet}</pre>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-slate-300">Suno Token / Cookie</label>
                            {localCredits !== null && (
                                <span className="text-xs font-bold text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded">
                                    Credits: {localCredits}
                                </span>
                            )}
                        </div>
                        <textarea
                            value={cookie}
                            onChange={(e) => setCookie(e.target.value)}
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
                                <span>{SUNO_MODEL_MAPPINGS.find(m => m.value === model)?.label || model} ({model})</span>
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
                                <div className="absolute bottom-full left-0 right-0 mb-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-20 max-h-48 overflow-y-auto custom-scrollbar">
                                    {SUNO_MODEL_MAPPINGS.map((m) => (
                                        <button
                                            key={m.value}
                                            onClick={() => { setModel(m.value); setIsModelDropdownOpen(false); }}
                                            className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between
                                            ${model === m.value 
                                                ? 'bg-pink-600/20 text-pink-300' 
                                                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}
                                        >
                                            <span>{m.label}</span>
                                            {model === m.value && (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-pink-400">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
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