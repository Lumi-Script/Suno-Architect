
import React, { useState, useEffect } from 'react';
import { ParsedSunoOutput } from '../types';
import { stripMetaTags } from '../utils/lyrics';

interface EditSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: ParsedSunoOutput) => void;
  initialData: ParsedSunoOutput;
}

const EditSongModal: React.FC<EditSongModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [data, setData] = useState<ParsedSunoOutput>(initialData);

  useEffect(() => {
    if (isOpen) {
      setData(initialData);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Reconstruct the advancedParams string based on current slider/button states
    // However, advancedParams usually stores the raw text block from Gemini.
    // We should update it if possible, or just rely on the individual fields (weirdness, styleInfluence).
    // The individual fields are what triggersSunoGeneration uses.
    
    // Auto-update clean lyrics
    const newLyricsAlone = stripMetaTags(data.lyricsWithTags);
    
    const newData = { ...data, lyricsAlone: newLyricsAlone };
    
    onSave({ ...newData });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex-shrink-0 border-b border-slate-800 bg-slate-900/80 p-4 rounded-t-2xl flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Edit Song Output
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-6">
            
            {/* Title */}
            <div>
                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Title</label>
                <input 
                    type="text" 
                    value={data.title}
                    onChange={(e) => setData({ ...data, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                />
            </div>

            {/* Params Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sliders */}
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-slate-400">Weirdness</label>
                            <span className="text-xs font-mono text-purple-400">{data.weirdness}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={data.weirdness}
                            onChange={(e) => setData({ ...data, weirdness: parseInt(e.target.value) })}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-slate-400">Style Influence</label>
                            <span className="text-xs font-mono text-blue-400">{data.styleInfluence}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={data.styleInfluence}
                            onChange={(e) => setData({ ...data, styleInfluence: parseInt(e.target.value) })}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                </div>

                {/* Vocal Gender */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">Vocal Gender</label>
                    <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                        {['Male', 'Female', 'None'].map((gender) => (
                            <button
                                key={gender}
                                onClick={() => setData({ ...data, vocalGender: gender })}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                    (data.vocalGender?.toLowerCase() || 'none') === gender.toLowerCase()
                                    ? 'bg-slate-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                {gender}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Styles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Style Tags</label>
                    <textarea 
                        value={data.style}
                        onChange={(e) => setData({ ...data, style: e.target.value })}
                        className="w-full h-24 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 focus:ring-1 focus:ring-purple-500 outline-none resize-none custom-scrollbar"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Negative Styles</label>
                    <textarea 
                        value={data.excludeStyles}
                        onChange={(e) => setData({ ...data, excludeStyles: e.target.value })}
                        className="w-full h-24 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 focus:ring-1 focus:ring-red-500 outline-none resize-none custom-scrollbar"
                    />
                </div>
            </div>

            {/* Lyrics */}
            <div>
                <label className="block text-xs font-bold text-pink-400 uppercase tracking-wider mb-2">Lyrics with Tags</label>
                <textarea 
                    value={data.lyricsWithTags}
                    onChange={(e) => setData({ ...data, lyricsWithTags: e.target.value })}
                    className="w-full h-64 bg-slate-950 border border-slate-700 rounded-lg p-4 text-sm font-mono text-slate-300 focus:ring-1 focus:ring-pink-500 outline-none custom-scrollbar leading-relaxed"
                />
            </div>

        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-end gap-3 p-4 border-t border-slate-800 bg-slate-900/80 rounded-b-2xl">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="px-6 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-lg hover:shadow-purple-500/25 transition-all">
              Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};

export default EditSongModal;
