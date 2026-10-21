import React, { useRef } from 'react';
import { FileContext } from '../../types';

interface FileUploaderProps {
  selectedFiles: FileContext[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  isLoading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ selectedFiles, onFileChange, onRemoveFile, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={onFileChange}
          accept="image/*,text/plain,application/pdf,audio/*"
          multiple
          className="hidden"
        />
        
        <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, idx) => {
                const isAudio = file.mimeType.startsWith('audio/');
                const isImage = file.mimeType.startsWith('image/');
                
                return (
                    <div key={idx} className={`flex items-center gap-2 bg-slate-900 border ${isAudio ? 'border-pink-500/50' : 'border-slate-700'} rounded-lg p-2 animate-in fade-in zoom-in-95 duration-200`}>
                        <div className={`${isAudio ? 'bg-pink-900/50' : 'bg-purple-900/50'} p-1.5 rounded-md`}>
                            {isAudio ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-pink-300">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l.31-.088a2.25 2.25 0 001.632-2.163V6.553zM5.25 18.103V9.5a2.25 2.25 0 011.569-2.141l9.431-3.144a2.25 2.25 0 012.75 2.141v10.503a2.25 2.25 0 01-1.569 2.141l-9.431 3.144a2.25 2.25 0 01-2.75-2.141V18.103z" />
                                </svg>
                            ) : isImage ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-purple-300">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                  </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-purple-300">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-500 uppercase leading-tight">
                                {isAudio ? 'Style Reference' : 'Context'}
                            </span>
                            <span className="text-xs text-slate-300 truncate max-w-[120px]" title={file.name}>{file.name}</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => onRemoveFile(idx)}
                          className="text-slate-500 hover:text-red-400 p-1 rounded-full hover:bg-slate-800 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                );
            })}
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-purple-400 transition-colors px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-purple-500/50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wide">Add Files</span>
            </button>
        </div>
    </div>
  );
};

export default FileUploader;