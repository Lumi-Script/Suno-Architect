import React from 'react';
import { AlignedWord } from '../../../types';

interface AiControlsCardProps {
  alignment: AlignedWord[] | null;
  sunoCookie?: string;
  isGrouping: boolean;
  isRendering: boolean;
  onSmartGroup: () => void;
}

const AiControlsCard: React.FC<AiControlsCardProps> = ({ 
  alignment, 
  sunoCookie, 
  isGrouping, 
  isRendering, 
  onSmartGroup 
}) => {
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${alignment ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-xs text-slate-300">
                    {alignment ? `${alignment.length} words synced` : 'No alignment data found'}
                </span>
            </div>
            
            {alignment && (
                  <button 
                    onClick={onSmartGroup}
                    disabled={isGrouping || isRendering}
                    className="w-full py-2 bg-slate-700 hover:bg-purple-600 text-white text-xs font-bold rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                      {isGrouping ? (
                          <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                            <path d="M16 16h5v5" />
                        </svg>
                      )}
                      Refine Lines with AI
                  </button>
            )}
          </div>
          
          {!alignment && sunoCookie && (
              <p className="text-xs text-yellow-500 mt-2">
                  Attempts to fetch alignment happen automatically. If red, ensure you are logged in and this is your song.
              </p>
          )}
    </div>
  );
};

export default AiControlsCard;
