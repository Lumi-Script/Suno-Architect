
import React, { useState } from 'react';
import { FileContext } from '../../types';
import FileUploader from './FileUploader';
import TrackSelector from './TrackSelector';
import ApiKeyModal from '../ApiKeyModal';

interface InputSectionProps {
  onGenerate: (prompt: string, files: FileContext[], numTracks: number) => void;
  isLoading: boolean;
  apiKeyValid: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onGenerate, isLoading, apiKeyValid }) => {
  const [prompt, setPrompt] = useState('');
  const [numTracks, setNumTracks] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<FileContext[]>([]);
  const [showKeyModal, setShowKeyModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKeyValid) {
        setShowKeyModal(true);
        return;
    }

    if ((prompt.trim() || selectedFiles.length > 0)) {
      onGenerate(prompt, selectedFiles, numTracks);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      (Array.from(files) as File[]).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setSelectedFiles(prev => [...prev, {
              name: file.name,
              mimeType: file.type,
              data: event.target.result as string
            }]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const isButtonDisabled = isLoading || (!prompt.trim() && selectedFiles.length === 0);

  return (
    <>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-xl relative">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
            Describe Your Album
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-slate-400 mb-2">
                Thematic Idea or Vibe
            </label>
            <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
                placeholder="E.g., A concept album about a city submerged under neon waves. Mix of synth-pop and heavy industrial."
                className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none text-base"
            />
            </div>

            <TrackSelector numTracks={numTracks} onChange={setNumTracks} />

            <FileUploader 
                selectedFiles={selectedFiles} 
                onFileChange={handleFileChange} 
                onRemoveFile={removeFile} 
                isLoading={isLoading} 
            />

            <div className="relative group">
                <button
                type="submit"
                disabled={isButtonDisabled}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center space-x-2
                    ${
                    isButtonDisabled
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-70'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white hover:shadow-purple-500/25'
                    }`}
                >
                {isLoading ? (
                    <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Constructing {numTracks > 1 ? `Album (${numTracks} Tracks)` : 'Prompt'}...</span>
                    </>
                ) : (
                    <>
                    <span>{numTracks > 1 ? `Generate Album (${numTracks} Tracks)` : 'Generate Prompt'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    </>
                )}
                </button>
            </div>
        </form>
        </div>
        
        <ApiKeyModal isOpen={showKeyModal} onClose={() => setShowKeyModal(false)} />
    </>
  );
};

export default InputSection;
