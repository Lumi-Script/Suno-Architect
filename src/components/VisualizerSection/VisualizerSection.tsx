
import React from 'react';
import { SunoClip } from '../../types';
import VisualizerHeader from './VisualizerHeader';
import VisualizerSettings from './VisualizerSettings';
import { formatTime } from '../../utils/visualizer';
import { useVisualizer } from './hooks/useVisualizer';

// Subcomponents
import MetadataCard from './subcomponents/MetadataCard';
import MediaCard from './subcomponents/MediaCard';
import AiControlsCard from './subcomponents/AiControlsCard';
import ActionButtons from './subcomponents/ActionButtons';
import CanvasPreview from './subcomponents/CanvasPreview';
import PlaybackControls from './subcomponents/PlaybackControls';
import ColorEventsManager from './subcomponents/ColorEventsManager';

interface VisualizerSectionProps {
  history: SunoClip[];
  sunoCookie?: string;
  onUpdateClip: (id: string, updates: Partial<SunoClip>) => void;
  apiKey?: string;
  geminiModel?: string;
}

const VisualizerSection: React.FC<VisualizerSectionProps> = ({ history, sunoCookie, onUpdateClip, apiKey, geminiModel }) => {
  const { state, setters, refs, handlers } = useVisualizer(history, sunoCookie, onUpdateClip, apiKey, geminiModel);

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-8">
        
        <VisualizerHeader 
            history={history}
            selectedClipId={state.selectedClipId}
            setSelectedClipId={setters.setSelectedClipId}
            manualId={state.manualId}
            setManualId={setters.setManualId}
            onManualLoad={handlers.handleManualLoad}
        />

        {/* Main Content */}
        {state.selectedClipId && state.clipData && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Left: Controls & Info */}
                 <div className="lg:col-span-1 space-y-6">
                     <MetadataCard 
                        lyricSource={state.lyricSource}
                        setLyricSource={setters.setLyricSource}
                        onApplyLyrics={handlers.handleApplyLyrics}
                        applyStatus={state.applyStatus}
                        hasAlignment={!!state.alignment}
                     />

                     <MediaCard 
                        visualMode={state.visualMode} setVisualMode={setters.setVisualMode}
                        customBg={state.customBg} setCustomBg={setters.setCustomBg}
                        customAudio={state.customAudio} setCustomAudio={setters.setCustomAudio}
                        imgSrc={state.imgSrc}
                        qt6Style={state.qt6Style}
                        aspectRatio={state.aspectRatio} setAspectRatio={setters.setAspectRatio}
                        videoRef={refs.customVideoRef}
                        onFileUpload={handlers.handleFileUpload}
                        onAudioUpload={handlers.handleAudioUpload}
                        handleImageError={handlers.handleImageError}
                     />
                     
                     <AiControlsCard 
                        alignment={state.alignment}
                        sunoCookie={sunoCookie}
                        isGrouping={state.isGrouping}
                        isRendering={state.isRendering}
                        onSmartGroup={handlers.handleSmartGroup}
                     />

                     {/* Audio Player (Hidden visually but used for logic) */}
                     <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 hidden">
                         <audio 
                            ref={refs.audioRef} 
                            controls 
                            src={state.customAudio ? state.customAudio.url : `https://cdn1.suno.ai/${state.selectedClipId}.mp3`}
                            crossOrigin="anonymous" // CRITICAL FOR RECORDING
                            className="w-full h-8"
                            onLoadedMetadata={(e) => handlers.setDuration(e.currentTarget.duration)}
                            onPlay={() => setters.setIsPlaying(true)} 
                            onPause={() => setters.setIsPlaying(false)} 
                         />
                     </div>

                     <ActionButtons 
                        audioBitrate={state.audioBitrate}
                        setAudioBitrate={setters.setAudioBitrate}
                        fps={state.fps}
                        setFps={setters.setFps}
                        isRendering={state.isRendering}
                        renderProgress={state.renderProgress}
                        renderSpeed={state.renderSpeed}
                        onStartRender={handlers.startOfflineRender}
                        isPreparing={state.isPreparing}
                        hasAlignment={!!state.alignment}
                     />
                 </div>

                 {/* Right: Canvas Preview */}
                 <div className="lg:col-span-2 space-y-4">
                     <CanvasPreview 
                        canvasRef={refs.canvasRef}
                        aspectRatio={state.aspectRatio}
                        isPreparing={state.isPreparing}
                     />
                     
                     <VisualizerSettings 
                        fontFamily={state.fontFamily} setFontFamily={setters.setFontFamily}
                        activeColor={state.activeColor} setActiveColor={setters.setActiveColor}
                        inactiveColor={state.inactiveColor} setInactiveColor={setters.setInactiveColor}
                        smoothingFactor={state.smoothingFactor} setSmoothingFactor={setters.setSmoothingFactor}
                        verticalOffset={state.verticalOffset} setVerticalOffset={setters.setVerticalOffset}
                        inactiveOpacity={state.inactiveOpacity} setInactiveOpacity={setters.setInactiveOpacity}
                        visualMode={state.visualMode}
                        qt6Style={state.qt6Style} setQt6Style={setters.setQt6Style}
                        qt6BarCount={state.qt6BarCount} setQt6BarCount={setters.setQt6BarCount}
                        qt6Sensitivity={state.qt6Sensitivity} setQt6Sensitivity={setters.setQt6Sensitivity}
                        videoBitrate={state.videoBitrate} setVideoBitrate={setters.setVideoBitrate}
                        videoBitrateMode={state.videoBitrateMode} setVideoBitrateMode={setters.setVideoBitrateMode}
                        fps={state.fps} setFps={setters.setFps}
                        onReset={() => {
                            setters.setActiveColor('#e879f9');
                            setters.setInactiveColor('#ffffff');
                            setters.setInactiveOpacity(0.3);
                            setters.setFontFamily('Inter, sans-serif');
                            setters.setSmoothingFactor(0.1);
                            setters.setVerticalOffset(0);
                            setters.setQt6Style('wave');
                            setters.setQt6BarCount(64);
                            setters.setQt6Sensitivity(1.0);
                            setters.setVideoBitrate(5000000);
                            setters.setVideoBitrateMode('variable');
                            setters.setFps(30);
                        }}
                     />

                     <ColorEventsManager 
                        colorEvents={state.colorEvents}
                        onAddEvent={setters.addColorEvent}
                        onRemoveEvent={setters.removeColorEvent}
                        onUpdateEvent={setters.updateColorEvent}
                        currentTime={state.progress}
                        activeColor={state.activeColor}
                        inactiveColor={state.inactiveColor}
                     />

                     <PlaybackControls 
                        progress={state.progress}
                        duration={state.duration}
                        isPlaying={state.isPlaying}
                        onSeek={handlers.handleSeek}
                        onTogglePlay={handlers.togglePlay}
                        aspectRatio={state.aspectRatio}
                        isRendering={state.isRendering}
                        formatTime={formatTime}
                     />
                 </div>
             </div>
        )}
        
        {!state.selectedClipId && (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20 text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 opacity-20 mb-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                </svg>
                <p>Select a song from history or enter an ID to start.</p>
            </div>
        )}
    </div>
  );
};

export default VisualizerSection;
