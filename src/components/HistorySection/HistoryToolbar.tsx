import React from 'react';

interface HistoryToolbarProps {
  count: number;
  searchText: string;
  setSearchText: (text: string) => void;
  onAction: () => void;
  isActionLoading: boolean;
  onFetchHistory: (limit: number | 'all') => void;
  isSyncing: boolean;
  syncProgress?: string;
  limit: number;
  setLimit: (limit: number) => void;
  onClearSearch: () => void;
  isShowingSearchResults: boolean;
}

const HistoryToolbar: React.FC<HistoryToolbarProps> = ({ 
    count, searchText, setSearchText, onAction, isActionLoading, 
    onFetchHistory, isSyncing, syncProgress,
    limit, setLimit, onClearSearch, isShowingSearchResults
}) => {
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          onAction();
      }
  };

  return (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm shadow-sm">
        <div className="flex-shrink-0">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {isShowingSearchResults ? 'Search Results' : 'Your Library'}
                {isShowingSearchResults && (
                    <button 
                        onClick={onClearSearch}
                        className="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-0.5 rounded text-slate-300 transition-colors flex items-center gap-1"
                    >
                        Clear
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                             <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                )}
                {!isShowingSearchResults && count > 0 && <span className="text-xs font-normal text-slate-400">({count} items)</span>}
            </h2>
            <p className="text-xs text-slate-400">
                {isShowingSearchResults 
                    ? `Showing results for "${searchText}"` 
                    : "Manage your generated prompts and Suno generations."}
            </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-center">
            {/* Search / Import Bar */}
            <div className="flex gap-2 flex-grow sm:max-w-md w-full relative">
                <div className="relative w-full">
                    <input 
                        type="text" 
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search or Paste ID..."
                        className="bg-slate-950 border border-slate-700 text-white text-xs rounded-lg pl-8 pr-3 py-2 focus:ring-1 focus:ring-purple-500 outline-none w-full"
                    />
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
                <button 
                    onClick={onAction}
                    disabled={isActionLoading || !searchText.trim()}
                    className="px-3 py-2 bg-slate-800 hover:bg-purple-600 text-white text-xs font-bold rounded-lg transition-colors border border-slate-700 whitespace-nowrap"
                >
                    {isActionLoading ? '...' : 'Add'}
                </button>
            </div>

            {/* Sync Controls */}
            <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-900/50 p-1 rounded-lg border border-slate-700">
                <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    disabled={isSyncing}
                    className="bg-slate-800 border-none text-white text-xs rounded-md py-1.5 px-2 focus:ring-1 focus:ring-purple-500 outline-none cursor-pointer"
                >
                    <option value={50}>50 items</option>
                    <option value={100}>100 items</option>
                    <option value={200}>200 items</option>
                </select>

                <button
                    onClick={() => onFetchHistory(limit)}
                    disabled={isSyncing}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap
                    ${isSyncing 
                    ? 'bg-slate-700/50 text-slate-400 cursor-wait' 
                    : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
                >
                    {isSyncing ? (
                        <>
                            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>{syncProgress || 'Syncing...'}</span>
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                            <path d="M16 16h5v5" />
                            </svg>
                            <span>Fetch</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    </div>
  );
};

export default HistoryToolbar;