import React, { useEffect, useState, useRef } from 'react';
import { SUNO_MODEL_MAPPINGS } from '../../constants';
import { GeminiModelSelector } from './GeminiModelSelector';
import { Link, useRouter } from '../../router/Router';

interface HeaderProps {
  onKeyUpdate: (key: string) => void;
  onValidationChange: (isValid: boolean) => void;
  onOpenSunoSettings?: () => void;
  onOpenSunoModal?: () => void;
  sunoCredits: number | null;
  sunoModel?: string;
  sunoModels?: Array<{ label: string; value: string }>;
  onModelChange?: (model: string) => void;
  geminiModel: string;
  onGeminiModelChange: (model: string) => void;
  historyCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  onKeyUpdate, 
  onValidationChange, 
  onOpenSunoSettings,
  onOpenSunoModal,
  sunoCredits,
  sunoModel,
  sunoModels,
  onModelChange,
  geminiModel,
  onGeminiModelChange,
  historyCount = 0,
}) => {
  const { currentPath } = useRouter();
  const [hasKey, setHasKey] = useState(false);
  const [isAiStudio, setIsAiStudio] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [manualKey, setManualKey] = useState('');
  const [isVertexKey, setIsVertexKey] = useState(false);

  const getEnvApiKey = () => {
    try {
      return (typeof process !== 'undefined' && process.env?.API_KEY) || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
    } catch (e) {
      return '';
    }
  };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Custom Dropdown State for Suno
  const [isSunoDropdownOpen, setIsSunoDropdownOpen] = useState(false);
  const sunoDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sunoDropdownRef.current && !sunoDropdownRef.current.contains(event.target as Node)) {
        setIsSunoDropdownOpen(false);
      }
    }
    if (isSunoDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSunoDropdownOpen]);

  useEffect(() => {
    const checkEnv = async () => {
      const aistudio = (window as any).aistudio;
      let isValid = false;
      let keyToSet = '';

      // 1. Check AI Studio
      if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
        try {
          const has = await aistudio.hasSelectedApiKey();
          if (has) {
            isValid = true;
            setIsAiStudio(true);
          }
        } catch (e) {
          console.warn("AI Studio key check failed", e);
        }
      }

      // 2. Check Local Storage if not AI Studio
      if (!isValid) {
        setIsAiStudio(false);
        const stored = localStorage.getItem('gemini_api_key');
        const vertexStored = localStorage.getItem('is_vertex_key') === 'true';
        if (stored) {
          isValid = true;
          setManualKey(stored);
          setIsVertexKey(vertexStored);
          keyToSet = stored;
        } else if (getEnvApiKey()) {
          // 3. Check Environment Variable
          isValid = true;
        }
      }

      setHasKey(isValid);
      onKeyUpdate(keyToSet);
      onValidationChange(isValid);
    };
    
    checkEnv();
  }, [onKeyUpdate, onValidationChange]);

  const handleAction = async () => {
    if (isAiStudio) {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        try {
          await aistudio.openSelectKey();
          const has = await aistudio.hasSelectedApiKey();
          setHasKey(has);
          onValidationChange(has);
        } catch (e) {
          console.error("AI Studio key selection failed", e);
        }
      }
    } else {
      setShowKeyInput(!showKeyInput);
    }
  };

  const saveManualKey = () => {
    const trimmed = manualKey.trim();
    if (trimmed) {
      localStorage.setItem('gemini_api_key', trimmed);
      localStorage.setItem('is_vertex_key', isVertexKey.toString());
      localStorage.removeItem('vertex_project_id');
      setHasKey(true);
      setShowKeyInput(false);
      onKeyUpdate(trimmed);
      onValidationChange(true);
    } else {
      localStorage.removeItem('gemini_api_key');
      localStorage.removeItem('is_vertex_key');
      localStorage.removeItem('vertex_project_id');
      
      const hasEnv = !!getEnvApiKey();
      setHasKey(hasEnv);
      onKeyUpdate('');
      onValidationChange(hasEnv);
    }
  };

  const navLinks = [
    { href: '/', label: 'Home', isExact: true },
    { href: '/lyrics', label: 'Lyrics Generator' },
    { href: '/video', label: 'Video Visualizer' },
    { href: '/history', label: 'History', count: historyCount },
  ];

  const isLinkActive = (href: string, isExact?: boolean) => {
    if (isExact) return currentPath === href;
    return currentPath === href;
  };

  return (
    <header className="w-full py-3 px-4 md:px-8 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-lg shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
            {/* Music Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white block leading-none">
              Suno <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Architect</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">AI Music & Video Studio</span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60 backdrop-blur-sm">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href, link.isExact);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  active
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <span>{link.label}</span>
                {typeof link.count === 'number' && link.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    active ? 'bg-white/20 text-white' : 'bg-purple-500/30 text-purple-300'
                  }`}>
                    {link.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions (Credits, Suno Model, Settings, Google / API key) */}
        <div className="flex items-center gap-2 relative">
          
          {/* Credits Display */}
          {sunoCredits !== null && (
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/60 px-2.5 py-1.5 rounded-lg backdrop-blur-sm">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Credits</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">{sunoCredits}</span>
            </div>
          )}

          {/* Header Suno Model Selector Dropdown */}
          {sunoCredits !== null && (
            <div className="hidden lg:block relative" ref={sunoDropdownRef}>
              <button
                onClick={() => setIsSunoDropdownOpen(!isSunoDropdownOpen)}
                className="flex items-center justify-between gap-2 bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs font-bold py-1.5 px-2.5 rounded-lg hover:bg-slate-700/60 hover:text-white transition-all min-w-[125px]"
                title="Select Suno Model"
              >
                <span className="truncate">
                  {(sunoModels || SUNO_MODEL_MAPPINGS).find(m => m.value === sunoModel)?.label || sunoModel || 'Model'}
                </span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${isSunoDropdownOpen ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isSunoDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/20 max-h-72 overflow-y-auto custom-scrollbar">
                  <div className="py-1">
                    {(sunoModels || SUNO_MODEL_MAPPINGS).map((m) => (
                      <button
                        key={m.value}
                        onClick={() => { 
                          if(onModelChange) onModelChange(m.value); 
                          setIsSunoDropdownOpen(false); 
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center justify-between
                        ${sunoModel === m.value 
                          ? 'bg-purple-600/20 text-purple-300' 
                          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}
                      >
                        <span className="truncate mr-2">{m.label}</span>
                        {sunoModel === m.value && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-purple-400 flex-shrink-0">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Suno Settings Modal Button */}
          <button
            onClick={() => (onOpenSunoSettings || onOpenSunoModal)?.()}
            className="flex items-center gap-1.5 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 rounded-lg px-2.5 py-1.5 transition-all text-xs font-bold"
            title="Suno Account & Prompt Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-purple-400">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="hidden sm:inline">Suno API</span>
          </button>

          {/* Gemini API Key Button */}
          <button 
            onClick={handleAction}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-md ${
              !hasKey 
                ? 'bg-white text-slate-900 hover:bg-slate-100' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {!hasKey ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-purple-600">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>{isAiStudio ? 'AI Studio Key' : 'Set API Key'}</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-emerald-400">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
                <span>Gemini Key</span>
              </>
            )}
          </button>

          {/* GitHub Repository Link */}
          <a
            href="https://github.com/Lumi-Script/Suno-Architect/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center justify-center p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors"
            title="GitHub Repository"
            aria-label="GitHub Repository"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>

          {/* Key Input Modal / Dropdown */}
          {showKeyInput && !isAiStudio && (
            <div className="absolute top-14 right-0 bg-slate-900 border border-slate-700 p-5 rounded-2xl shadow-2xl w-80 z-50 animate-in fade-in slide-in-from-top-2">
              <label className="block text-xs font-semibold text-slate-300 mb-2">Enter your Gemini API Key</label>
              <div className="flex flex-col gap-2 mb-3">
                <div className="flex gap-2">
                  <input 
                    type="password" 
                    value={manualKey}
                    onChange={(e) => setManualKey(e.target.value)}
                    placeholder="AIza..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder-slate-600"
                  />
                  <button 
                    onClick={saveManualKey}
                    className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
                    title="Save Key"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setShowKeyInput(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg transition-colors flex items-center justify-center"
                    title="Close"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-400 mt-1 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isVertexKey}
                    onChange={(e) => setIsVertexKey(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500/50 cursor-pointer"
                  />
                  <span>This is a Vertex AI API Key</span>
                </label>
              </div>

              {/* Gemini Model Selector */}
              <GeminiModelSelector 
                geminiModel={geminiModel} 
                onGeminiModelChange={onGeminiModelChange} 
              />

              <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
                Your key is stored locally in your browser. 
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-300 hover:underline ml-1 transition-colors">
                  Get an API key
                </a>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-800 space-y-2 animate-in fade-in slide-in-from-top-1">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href, link.isExact);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                    active
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span>{link.label}</span>
                  {typeof link.count === 'number' && link.count > 0 && (
                    <span className="bg-purple-900/80 text-purple-200 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {link.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {sunoCredits !== null && (
            <div className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/60 text-xs">
              <span className="text-slate-400 font-medium">Suno Credits:</span>
              <span className="font-bold text-emerald-400 font-mono">{sunoCredits}</span>
            </div>
          )}

          <a
            href="https://github.com/Lumi-Script/Suno-Architect/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
          >
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-slate-400">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub Repository</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-slate-500">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      )}
    </header>
  );
};
