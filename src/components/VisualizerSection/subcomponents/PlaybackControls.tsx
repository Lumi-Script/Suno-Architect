
import React from 'react';
import { ASPECT_RATIOS } from '../../../constants';

interface PlaybackControlsProps {
  progress: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTogglePlay: () => void;
  aspectRatio: keyof typeof ASPECT_RATIOS;
  isRendering: boolean;
  formatTime: (seconds: number) => string;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  progress,
  duration,
  isPlaying,
  onSeek,
  onTogglePlay,
  aspectRatio,
  isRendering,
  formatTime
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="relative group">
            <input 
              type="range" 
              min={0} 
              max={duration || 100}
              value={progress}
              onChange={onSeek}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              style={{
                  background: `linear-gradient(to right, #a855f7 ${(progress / (duration || 1)) * 100}%, #1e293b ${(progress / (duration || 1)) * 100}%)`
              }}
            />
        </div>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button 
                    onClick={onTogglePlay}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:bg-purple-400 transition-colors"
                >
                    {isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                          <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                        </svg>
                    )}
                </button>
                <div className="text-xs font-mono text-slate-400">
                    <span className="text-white">{formatTime(progress)}</span> / {formatTime(duration)}
                </div>
            </div>
            <div className="text-xs text-slate-600 font-mono hidden sm:block">
                {ASPECT_RATIOS[aspectRatio].label} • {isRendering ? 'RENDERING' : 'PREVIEW'}
            </div>
        </div>
    </div>
  );
};

export default PlaybackControls;
