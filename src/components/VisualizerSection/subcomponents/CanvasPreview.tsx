import React, { useRef, useState } from 'react';
import { ASPECT_RATIOS } from '../../../constants';

interface CanvasPreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  aspectRatio: keyof typeof ASPECT_RATIOS;
  isPreparing: boolean;
  visualMode?: 'cover' | 'qt6';
  coverX?: number;
  setCoverX?: (val: number) => void;
  coverY?: number;
  setCoverY?: (val: number) => void;
  onResetCoverPosition?: () => void;
}

const CanvasPreview: React.FC<CanvasPreviewProps> = ({ 
  canvasRef, 
  aspectRatio, 
  isPreparing,
  visualMode = 'cover',
  coverX = 0.5,
  setCoverX,
  coverY = 0.5,
  setCoverY,
  onResetCoverPosition
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startCoverX: number;
    startCoverY: number;
    overflowXScreen: number;
    overflowYScreen: number;
  } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (visualMode !== 'cover' || (!setCoverX && !setCoverY)) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get image dimensions
    const imgEl = (document.getElementById('custom-bg-img') as HTMLImageElement) ||
                  (document.getElementById('source-img') as HTMLImageElement);
    const imgW = imgEl?.naturalWidth || imgEl?.width || 1080;
    const imgH = imgEl?.naturalHeight || imgEl?.height || 1080;

    const cw = canvas.width;
    const ch = canvas.height;
    const imgRatio = imgW / imgH;
    const winRatio = cw / ch;

    let drawW = cw;
    let drawH = ch;
    if (imgRatio > winRatio) {
      drawH = ch;
      drawW = ch * imgRatio;
    } else {
      drawW = cw;
      drawH = cw / imgRatio;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / cw;
    const scaleY = rect.height / ch;
    const overflowXScreen = (drawW - cw) * scaleX;
    const overflowYScreen = (drawH - ch) * scaleY;

    // If neither axis overflows significantly, no drag needed
    if (overflowXScreen <= 1 && overflowYScreen <= 1) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    dragStateRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startCoverX: coverX,
      startCoverY: coverY,
      overflowXScreen,
      overflowYScreen
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragStateRef.current || dragStateRef.current.pointerId !== e.pointerId) return;
    const { startX, startY, startCoverX, startCoverY, overflowXScreen, overflowYScreen } = dragStateRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (overflowXScreen > 1 && setCoverX) {
      const newX = startCoverX - (dx / overflowXScreen);
      setCoverX(Math.max(0, Math.min(1, newX)));
    }

    if (overflowYScreen > 1 && setCoverY) {
      const newY = startCoverY - (dy / overflowYScreen);
      setCoverY(Math.max(0, Math.min(1, newY)));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragStateRef.current && dragStateRef.current.pointerId === e.pointerId) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      dragStateRef.current = null;
      setIsDragging(false);
    }
  };

  const isCoverMode = visualMode === 'cover';

  return (
    <div className="bg-black border border-slate-700 rounded-xl overflow-hidden shadow-2xl relative flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzIyMiI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiB4PSIwIiB5PSIwIiBmaWxsPSIjMzMzIi8+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiB4PSIxMCIgeT0iMTAiIGZpbGw9IiMzMzMiLz48L3N2Zz4=')]">
        <canvas 
          ref={canvasRef}
          width={ASPECT_RATIOS[aspectRatio].width}
          height={ASPECT_RATIOS[aspectRatio].height}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`max-w-full max-h-[70vh] w-auto h-auto object-contain shadow-2xl select-none ${
            isCoverMode 
              ? (isDragging ? 'cursor-grabbing touch-none' : 'cursor-grab touch-none') 
              : ''
          }`}
        />

        {/* Repositioning Hint / Indicator */}
        {isCoverMode && (
          <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/80 backdrop-blur-md rounded-full border border-slate-700/80 text-[10px] text-slate-300 select-none transition-all shadow-lg ${
            isDragging ? 'opacity-100 ring-1 ring-purple-500 scale-105' : 'opacity-70 hover:opacity-100'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v3.69l1.72-1.72a.75.75 0 111.06 1.06l-3 3a.75.75 0 01-1.06 0l-3-3a.75.75 0 111.06-1.06l1.72 1.72V2.75A.75.75 0 0110 2zm0 16a.75.75 0 01-.75-.75v-3.69l-1.72 1.72a.75.75 0 01-1.06-1.06l3-3a.75.75 0 011.06 0l3 3a.75.75 0 01-1.06 1.06l-1.72-1.72v3.69A.75.75 0 0110 18z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">
              {isDragging 
                ? `Cover: Y ${Math.round(coverY * 100)}% | X ${Math.round(coverX * 100)}%`
                : (coverX !== 0.5 || coverY !== 0.5) 
                  ? `Position: ${coverY === 0 ? 'Top' : coverY === 1 ? 'Bottom' : `${Math.round(coverY * 100)}%`}`
                  : 'Drag to position cover'
              }
            </span>
            {(coverX !== 0.5 || coverY !== 0.5) && onResetCoverPosition && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onResetCoverPosition();
                }}
                className="ml-1 text-purple-400 hover:text-purple-300 font-semibold px-1 rounded hover:bg-white/10"
                title="Reset to Center"
              >
                Reset
              </button>
            )}
          </div>
        )}
        
        {isPreparing && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                <div className="flex flex-col items-center">
                    <svg className="animate-spin h-8 w-8 text-purple-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-white text-sm font-medium">Fetching Assets...</span>
                </div>
            </div>
        )}
    </div>
  );
};

export default CanvasPreview;
