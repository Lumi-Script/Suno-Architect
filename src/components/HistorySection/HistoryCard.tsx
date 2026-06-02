import React from 'react';
import { SunoClip } from '../../types';

interface HistoryCardProps {
  clip: SunoClip;
  onClick: () => void;
  isDraft: boolean;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ clip, onClick, isDraft }) => {
  // Prioritize explicit image URL from API, otherwise construct it
  const imageUrl = clip.imageUrl || `https://cdn2.suno.ai/image_${clip.id}.jpeg?width=100`;
  const largeImageUrl = clip.imageLargeUrl || `https://cdn2.suno.ai/image_large_${clip.id}.jpeg`;
  const songUrl = `https://suno.com/song/${clip.id}`;

  const handleDownloadImage = async (e: React.MouseEvent, url: string, filename: string) => {
    e.preventDefault();
    e.stopPropagation(); 
    try {
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        return;
      }
    } catch (err) {
      console.warn("Fetch download failed, falling back to direct link", err);
    }
    window.open(url, '_blank');
  };

  return (
    <div 
        onClick={onClick}
        className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow-lg hover:shadow-purple-500/10 transition-all hover:border-slate-600 flex flex-row h-[100px] cursor-pointer group/card"
    >
        <div className="relative w-[100px] h-full shrink-0 bg-slate-900 group">
        {isDraft ? (
            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 opacity-50">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
            </div>
        ) : (
            <>
            <img 
                src={imageUrl} 
                alt={clip.title || 'Generated Song'} 
                className="w-full h-full object-cover"
                onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/1e293b/475569?text=No+Image';
                }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                <a 
                    href={songUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-white p-2 rounded-full bg-purple-600 hover:bg-purple-500 shadow-sm transform hover:scale-110 transition-transform"
                    title="Listen on Suno"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </a>

                <button
                    onClick={(e) => handleDownloadImage(e, largeImageUrl, `${clip.title || 'suno-cover'}.jpeg`)}
                    className="absolute top-1 right-1 text-white/70 hover:text-white bg-black/60 hover:bg-black/80 p-1 rounded backdrop-blur-sm transition-all transform hover:scale-105"
                    title="Download High-Res Cover Art"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                </button>
            </div>
            </>
        )}
        </div>
        
        <div className="p-3 flex-grow flex flex-col justify-between overflow-hidden">
        <div>
            <h3 className="text-base font-bold text-white truncate leading-tight mb-1 group-hover/card:text-purple-400 transition-colors" title={clip.title}>
                {clip.title || 'Untitled Song'}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className={`font-mono px-1.5 py-0.5 rounded ${isDraft ? 'bg-slate-700 text-slate-300' : 'bg-slate-900 text-slate-400'}`}>
                    {clip.model_name}
                </span>
                <span>•</span>
                <span>{new Date(clip.created_at).toLocaleDateString()}</span>
            </div>
        </div>
        
        <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-slate-500 truncate">
                Click for details
            </span>
            {!isDraft && (
                <a 
                    href={songUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-purple-400 hover:text-purple-300 hover:underline truncate"
                >
                    View on Suno.com
                </a>
            )}
            {isDraft && (
                <span className="text-xs text-slate-600 italic">Draft Prompt</span>
            )}
        </div>
        </div>
    </div>
  );
};

export default HistoryCard;