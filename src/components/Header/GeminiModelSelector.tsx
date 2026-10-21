import React, { useState, useRef, useEffect } from 'react';
import { GEMINI_MODEL_MAPPINGS } from '../../constants';

interface GeminiModelSelectorProps {
  geminiModel: string;
  onGeminiModelChange: (model: string) => void;
}

export const GeminiModelSelector: React.FC<GeminiModelSelectorProps> = ({
  geminiModel,
  onGeminiModelChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedModelLabel = GEMINI_MODEL_MAPPINGS.find(m => m.value === geminiModel)?.label || 'Select Model';

  return (
    <div className="pt-3 border-t border-slate-700" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-slate-400 mb-2">Gemini Model</label>
      
      <div className="relative">
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all flex items-center justify-between group hover:border-slate-600"
        >
            <span className="truncate font-medium text-slate-200">
                {selectedModelLabel}
            </span>
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={`w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            >
                <polyline points="6 9 12 15 18 9" />
            </svg>
        </button>

        {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/20">
                <div className="py-1">
                    {GEMINI_MODEL_MAPPINGS.map((model) => (
                        <button
                            key={model.value}
                            onClick={() => { onGeminiModelChange(model.value); setIsOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between
                            ${geminiModel === model.value 
                                ? 'bg-purple-600/20 text-purple-300' 
                                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}
                        >
                            <span>{model.label}</span>
                            {geminiModel === model.value && (
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
    </div>
  );
};
