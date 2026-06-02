
import React from 'react';
import { ASPECT_RATIOS } from '../../../constants';
import { Qt6Style } from '../../../types';

interface MediaCardProps {
  visualMode: 'cover' | 'qt6';
  setVisualMode: (mode: 'cover' | 'qt6') => void;
  customBg: { url: string, type: 'image' | 'video', name: string } | null;
  setCustomBg: (bg: { url: string, type: 'image' | 'video', name: string } | null) => void;
  customAudio: { url: string, name: string } | null;
  setCustomAudio: (audio: { url: string, name: string } | null) => void;
  imgSrc: string;
  qt6Style: Qt6Style;
  aspectRatio: keyof typeof ASPECT_RATIOS;
  setAspectRatio: (ratio: keyof typeof ASPECT_RATIOS) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAudioUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageError: () => void;
}

const MediaCard: React.FC<MediaCardProps> = ({
  visualMode, setVisualMode,
  customBg, setCustomBg,
  customAudio, setCustomAudio,
  imgSrc, qt6Style,
  aspectRatio, setAspectRatio,
  videoRef,
  onFileUpload, onAudioUpload,
  handleImageError
}) => {
  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-lg p-4 space-y-4">
      {/* Cover Art / Visualizer Preview */}
      <div className="relative group rounded-lg overflow-hidden border border-slate-700/50">
          {visualMode === 'cover' ? (
            <>
                <img 
                    id="source-img"
                    src={imgSrc} 
                    alt="Cover" 
                    crossOrigin="anonymous" 
                    onError={handleImageError}
                    className={`w-full h-32 object-cover ${customBg ? 'opacity-50' : 'opacity-100'}`}
                />
                {customBg && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        {customBg.type === 'video' ? (
                            <div className="bg-black/70 p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5m-3.75-13.5H9m3 0h3.75M9 18.75H5.25m8.25 0h3.75" />
                                </svg>
                            </div>
                        ) : (
                            <img src={customBg.url} className="w-full h-full object-cover" alt="custom" />
                        )}
                        <button 
                            onClick={() => setCustomBg(null)}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow-lg hover:bg-red-500"
                            title="Remove Custom BG"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                        </button>
                    </div>
                )}
            </>
          ) : (
            <div className="w-full h-32 bg-gradient-to-b from-slate-800 to-black flex flex-col items-center justify-center border-b border-slate-700 gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Qt6 Style: {qt6Style}</span>
                <div className="flex gap-2">
                    <div className={`w-2 h-6 rounded-full ${qt6Style === 'wave' ? 'bg-purple-500' : 'bg-slate-700'}`}></div>
                    <div className={`w-2 h-6 rounded-full ${qt6Style === 'bars' ? 'bg-purple-500' : 'bg-slate-700'}`}></div>
                    <div className={`w-2 h-6 rounded-full ${qt6Style === 'circle' ? 'bg-purple-500' : 'bg-slate-700'}`}></div>
                    <div className={`w-2 h-6 rounded-full ${qt6Style === 'circular-wave' ? 'bg-purple-500' : 'bg-slate-700'}`}></div>
                </div>
            </div>
          )}
          
          {/* Hidden Custom Media Elements */}
          {customBg?.type === 'image' && (
              <img 
                id="custom-bg-img"
                src={customBg.url}
                className="hidden"
                crossOrigin="anonymous"
                alt="custom-bg"
              />
          )}
          <video 
              ref={videoRef}
              src={customBg?.type === 'video' ? customBg.url : ''}
              className="hidden"
              crossOrigin="anonymous"
              muted
              playsInline
              loop
          />
      </div>

      {/* Settings */}
      <div className="space-y-3">
              {/* Aspect Ratio Selector */}
              <div>
                  <label className="text-xs text-slate-500 block mb-1">Aspect Ratio</label>
                  <select 
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as keyof typeof ASPECT_RATIOS)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white focus:ring-1 focus:ring-purple-500"
                  >
                      {Object.entries(ASPECT_RATIOS).map(([key, val]) => (
                          <option key={key} value={key}>{val.label} ({val.width}x{val.height})</option>
                      ))}
                  </select>
              </div>

              {/* Visual Mode Selector */}
              <div>
                  <label className="text-xs text-slate-500 block mb-1">Background Mode</label>
                  <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                      <button 
                        onClick={() => setVisualMode('cover')}
                        className={`flex-1 text-[10px] font-bold py-1.5 rounded transition-colors ${visualMode === 'cover' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'}`}
                      >
                          Cover / Custom
                      </button>
                      <button 
                        onClick={() => setVisualMode('qt6')}
                        className={`flex-1 text-[10px] font-bold py-1.5 rounded transition-colors ${visualMode === 'qt6' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'}`}
                      >
                          Qt6 Visualizer
                      </button>
                  </div>
              </div>

              {/* Background File Upload */}
              {visualMode === 'cover' && (
                  <div>
                      <label className="text-xs text-slate-500 block mb-1">Custom Media</label>
                      <label className="flex items-center justify-center w-full px-2 py-2 border border-dashed border-slate-600 rounded cursor-pointer hover:bg-slate-800 transition-colors group bg-slate-900/50">
                          <input 
                            type="file" 
                            accept="image/png, image/jpeg, image/webp, video/mp4, video/webm" 
                            className="hidden" 
                            onChange={onFileUpload}
                          />
                          <div className="flex items-center gap-2 text-slate-400 group-hover:text-white">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs">Upload Image / Loop</span>
                          </div>
                      </label>
                  </div>
              )}

              {/* Audio File Upload */}
              <div>
                  <label className="text-xs text-slate-500 block mb-1">Audio Source (Override)</label>
                  {customAudio ? (
                      <div className="flex items-center justify-between bg-slate-900 border border-green-500/30 rounded p-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-400 flex-shrink-0">
                                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs text-green-300 truncate" title={customAudio.name}>{customAudio.name}</span>
                          </div>
                          <button onClick={() => setCustomAudio(null)} className="text-slate-500 hover:text-white">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                              </svg>
                          </button>
                      </div>
                  ) : (
                    <label className="flex items-center justify-center w-full px-2 py-2 border border-dashed border-slate-600 rounded cursor-pointer hover:bg-slate-800 transition-colors group bg-slate-900/50">
                        <input 
                            type="file" 
                            accept="audio/*" 
                            className="hidden" 
                            onChange={onAudioUpload}
                        />
                        <div className="flex items-center gap-2 text-slate-400 group-hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                                <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
                            </svg>
                            <span className="text-xs">Upload Mastered File</span>
                        </div>
                    </label>
                  )}
              </div>
      </div>
    </div>
  );
};

export default MediaCard;
