import React, { useEffect, useState, useRef } from 'react';
import { SUNO_MODEL_MAPPINGS } from '../../constants';
import { GeminiModelSelector } from './GeminiModelSelector';
interface HeaderProps {
  onKeyUpdate: (key: string) => void;
  onValidationChange: (isValid: boolean) => void;
  onOpenSunoSettings: () => void;
  sunoCredits: number | null;
  sunoModel?: string;
  onModelChange?: (model: string) => void;
  geminiModel: string;
  onGeminiModelChange: (model: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onKeyUpdate, 
  onValidationChange, 
  onOpenSunoSettings,
  sunoCredits,
  sunoModel,
  onModelChange,
  geminiModel,
  onGeminiModelChange
}) => {
  const [hasKey, setHasKey] = useState(false);
  const [isAiStudio, setIsAiStudio] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [manualKey, setManualKey] = useState('');
  const [hasGoogleAuth, setHasGoogleAuth] = useState(false);

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
        const googleAuth = localStorage.getItem('google_access_token');
        if (stored) {
            isValid = true;
            setManualKey(stored);
            keyToSet = stored;
        } else if (googleAuth) {
            isValid = true;
            setHasGoogleAuth(true);
        } else if (process.env.API_KEY) {
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
        localStorage.removeItem('google_access_token');
        setHasGoogleAuth(false);
        setHasKey(true);
        setShowKeyInput(false);
        onKeyUpdate(trimmed);
        onValidationChange(true);
    } else {
        localStorage.removeItem('gemini_api_key');
        
        const hasEnv = !!process.env.API_KEY || !!localStorage.getItem('google_access_token');
        setHasKey(hasEnv);
        onKeyUpdate('');
        onValidationChange(hasEnv);
    }
  };

  return (
    <header className="w-full py-4 px-4 md:px-8 flex items-center justify-between border-b border-slate-800 bg-slate-900/70 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-lg shadow-lg shadow-purple-500/20">
          {/* Music Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Suno <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Architect</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">Version 1.5.2 - Download History Button</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 relative">
        {showKeyInput && !isAiStudio && (
            <div className="absolute top-14 right-0 bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-2xl w-80 z-50 animate-in fade-in slide-in-from-top-2">
                {!hasGoogleAuth && (
                    <>
                        <label className="block text-xs font-semibold text-slate-400 mb-2">Enter your Gemini API Key</label>
                        <div className="flex gap-2 mb-3">
                            <input 
                                type="password" 
                                value={manualKey}
                                onChange={(e) => setManualKey(e.target.value)}
                                placeholder="AIza..."
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder-slate-600"
                            />
                            <button 
                                onClick={saveManualKey}
                                className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
                                title="Save Key"
                            >
                                {/* Check Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </button>
                            <button 
                                onClick={() => setShowKeyInput(false)}
                                className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-2 rounded-lg transition-colors flex items-center justify-center"
                                title="Close"
                            >
                                {/* X Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex items-center mb-3">
                            <div className="flex-1 border-t border-slate-700"></div>
                            <span className="px-2 text-xs text-slate-500 font-semibold uppercase">Or</span>
                            <div className="flex-1 border-t border-slate-700"></div>
                        </div>
                    </>
                )}

                {!hasGoogleAuth ? (
                    <button
                        onClick={() => {
                            const clientId = '687066814993-pr69u2f6ro28n8v2gehnnblgmbmp3a2r.apps.googleusercontent.com';
                            const redirectUri = window.location.origin + '/GoogleOAuth';
                            const scope = 'https://www.googleapis.com/auth/generative-language.retriever';
                            
                            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${encodeURIComponent(scope)}&prompt=consent`;
                            
                            window.location.href = authUrl;
                        }}
                        className="w-full bg-white hover:bg-gray-100 text-slate-900 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors mb-4"
                    >
                        <svg viewBox="0 0 24 24" className="w-4 h-4">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Sign in with Google
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            localStorage.removeItem('google_access_token');
                            setHasGoogleAuth(false);
                            const stored = !!localStorage.getItem('gemini_api_key') || !!process.env.API_KEY;
                            setHasKey(stored);
                            onValidationChange(stored);
                        }}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors mb-4"
                    >
                        Sign Out of Google
                    </button>
                )}

                {/* Gemini Model Selector */}
                <GeminiModelSelector 
                  geminiModel={geminiModel} 
                  onGeminiModelChange={onGeminiModelChange} 
                />

                {!hasGoogleAuth && (
                    <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
                        Your key is stored locally in your browser. 
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-300 hover:underline ml-1 transition-colors">
                            Get an API key
                        </a>
                    </p>
                )}
            </div>
        )}
        
        {/* Credits Display & Model Selector - Visible when logged in (credits not null) */}
        {sunoCredits !== null && (
          <>
            <div className="hidden sm:flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 px-3 py-1 rounded-lg mr-1 backdrop-blur-sm">
                <div className="flex flex-col items-end leading-none">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Credits</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">{sunoCredits}</span>
                </div>
            </div>

            {/* Header Model Selector - Custom Dropdown */}
            <div className="hidden sm:block relative" ref={sunoDropdownRef}>
              <button
                onClick={() => setIsSunoDropdownOpen(!isSunoDropdownOpen)}
                className="flex items-center justify-between gap-2 bg-slate-800/50 border border-slate-700/50 text-slate-300 text-xs font-bold py-2 px-3 rounded-lg hover:bg-slate-700/50 hover:text-white transition-all min-w-[140px]"
                title="Select Suno Model"
              >
                 <span className="truncate">
                    {SUNO_MODEL_MAPPINGS.find(m => m.value === sunoModel)?.label || 'Select Model'}
                 </span>
                 <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isSunoDropdownOpen ? 'rotate-180' : ''}`}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isSunoDropdownOpen && (
                 <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/20">
                    <div className="py-1">
                        {SUNO_MODEL_MAPPINGS.map((m) => (
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
                                <span>{m.label}</span>
                                {sunoModel === m.value && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-purple-400">
                                    <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                 </div>
              )}
            </div>
          </>
        )}

        {/* Suno Settings Button */}
        <button
            onClick={onOpenSunoSettings}
            className="flex items-center gap-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 rounded-lg px-3 py-2 transition-all text-xs font-bold"
            title="Suno Configuration"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Suno API</span>
        </button>

        <button 
            onClick={handleAction}
            className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-lg 
            ${!hasKey 
                ? 'bg-slate-100 text-slate-900 hover:bg-white shadow-purple-500/10' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'}`}
        >
            {!hasKey ? (
                <>
                    {/* Zap Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-purple-600">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    <span>{isAiStudio ? 'Login with Google' : 'Set API Key'}</span>
                </>
            ) : (
                <>
                    {/* Key Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                    <span>{isAiStudio ? 'API Key' : 'Gemini Key'}</span>
                </>
            )}
        </button>
      </div>
    </header>
  );
};
