import React from 'react';

interface AlbumHeaderProps {
  trackCount: number;
  onSyncAll: () => void;
  syncAllLoading: boolean;
  sunoCookie?: string;
}

const AlbumHeader: React.FC<AlbumHeaderProps> = ({ trackCount, onSyncAll, syncAllLoading, sunoCookie }) => {
  return (
    <div className="sticky top-[80px] z-40 bg-slate-900/90 backdrop-blur-md border border-purple-500/30 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
            {trackCount}
        </div>
        <div>
            <h3 className="text-white font-bold">Album Pack Generated</h3>
            <p className="text-xs text-slate-400">Review {trackCount} tracks below before syncing.</p>
        </div>
        </div>
        
        <button
        onClick={onSyncAll}
        disabled={syncAllLoading || !sunoCookie}
        className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2
        ${syncAllLoading 
            ? 'bg-purple-800 text-white cursor-wait' 
            : !sunoCookie 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20'
        }`}
        >
        {syncAllLoading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
        )}
        {syncAllLoading ? 'Pushing Album...' : 'Sync All to Suno'}
        </button>
    </div>
  );
};

export default AlbumHeader;