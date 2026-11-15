import React, { useState, useEffect } from 'react';
import { VertexPriority } from '../../types';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [isVertexKey, setIsVertexKey] = useState(false);
  const [vertexPriority, setVertexPriority] = useState<VertexPriority>('standard');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('gemini_api_key') || '';
      const storedVertex = localStorage.getItem('is_vertex_key') === 'true';
      const storedPriority = (localStorage.getItem('vertex_priority') as VertexPriority) || 'standard';
      setApiKey(storedKey);
      setIsVertexKey(storedVertex);
      setVertexPriority(storedPriority);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVertexToggle = (checked: boolean) => {
    setIsVertexKey(checked);
    localStorage.setItem('is_vertex_key', checked.toString());
    localStorage.removeItem('vertex_project_id');
    window.dispatchEvent(new Event('storage'));
  };

  const handlePriorityChange = (opt: VertexPriority) => {
    setVertexPriority(opt);
    localStorage.setItem('vertex_priority', opt);
    window.dispatchEvent(new Event('storage'));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = apiKey.trim();
    if (trimmed) {
      localStorage.setItem('gemini_api_key', trimmed);
      localStorage.setItem('is_vertex_key', isVertexKey.toString());
      if (isVertexKey) {
        localStorage.setItem('vertex_priority', vertexPriority);
      } else {
        localStorage.removeItem('vertex_priority');
      }
      localStorage.removeItem('vertex_project_id');

      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('gemini_key_updated', {
        detail: { apiKey: trimmed, isVertex: isVertexKey, vertexPriority }
      }));

      if (onKeySaved) {
        onKeySaved(trimmed);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-700 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center space-y-5">
          <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center shadow-inner border border-slate-700 ring-1 ring-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-purple-400">
               <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </div>
          
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-white tracking-tight">Gemini API Key Required</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Enter your Google AI Studio or Vertex AI API Key. It is stored solely in your browser's private local storage.
            </p>
          </div>

          <form onSubmit={handleSave} className="w-full space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIza..."
                  autoFocus
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isVertexKey}
                  onChange={(e) => handleVertexToggle(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500/50 cursor-pointer w-4 h-4"
                />
                <span className="font-medium">This is a Vertex AI API Key</span>
              </label>

              {/* Vertex AI Priority Setting (shown if ticked) */}
              {isVertexKey && (
                <div className="p-3 bg-slate-900/80 rounded-xl border border-purple-500/20 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Vertex AI Priority
                    </label>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {vertexPriority}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
                    {(['priority', 'standard', 'flex'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handlePriorityChange(opt)}
                        className={`py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${
                          vertexPriority === opt
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug">
                    {vertexPriority === 'priority' && 'Priority PayGo: Prioritized execution with lower, more consistent latency.'}
                    {vertexPriority === 'standard' && 'Standard PayGo: Default standard capacity Pay-as-you-go inference.'}
                    {vertexPriority === 'flex' && 'Flex PayGo: Discounted rate for non-critical, latency-tolerant workloads.'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition-all active:scale-95 text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-purple-500/25 active:scale-95 text-center"
              >
                Save API Key
              </button>
            </div>
          </form>

          <p className="text-[11px] text-slate-500">
            Need an API key?{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-purple-400 hover:text-purple-300 hover:underline transition-colors"
            >
              Get one from Google AI Studio
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
