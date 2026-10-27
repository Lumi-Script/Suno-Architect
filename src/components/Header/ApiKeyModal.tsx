
import React from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center shadow-inner border border-slate-700 ring-1 ring-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-purple-400">
               <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-white tracking-tight">API Key Required</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              To utilize the Gemini AI architect, you must configure your API Key. This key is stored locally in your browser.
            </p>
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                <p className="text-slate-500 text-xs">
                    Click the <span className="text-purple-400 font-bold bg-purple-500/10 px-1.5 py-0.5 rounded">Set API Key</span> button in the top right header to get started.
                </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-purple-500/25 active:scale-95"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
