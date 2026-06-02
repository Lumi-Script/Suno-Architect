
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SunoClip, AlignedWord, Qt6Style } from '../../../types';
import { getLyricAlignment, getSunoClip } from '../../../services/sunoApi';
import { ASPECT_RATIOS } from '../../../constants';
import { drawCover, drawQt6Visualizer, drawScrollingLyrics, formatTime } from '../../../utils/visualizer';
import { groupLyricsByLines, matchWordsToPrompt, groupWordsByTiming, stripMetaTags, getCleanAlignedWords } from '../../../utils/lyrics';
import { performOfflineRender } from '../../../utils/offlineRender';

export const useVisualizer = (
    history: SunoClip[],
    sunoCookie: string | undefined,
    onUpdateClip: (id: string, updates: Partial<SunoClip>) => void,
    apiKey: string | undefined,
    geminiModel: string | undefined
) => {
    // Selection State
    const [selectedClipId, setSelectedClipId] = useState<string>('');
    const [manualId, setManualId] = useState('');
    
    // Visual Settings
    const [aspectRatio, setAspectRatio] = useState<keyof typeof ASPECT_RATIOS>("16:9");
    const [visualMode, setVisualMode] = useState<'cover' | 'qt6'>('cover');
    const [customBg, setCustomBg] = useState<{ url: string, type: 'image' | 'video', name: string } | null>(null);
    const [customAudio, setCustomAudio] = useState<{ url: string, name: string } | null>(null);
    const [audioBitrate, setAudioBitrate] = useState(320000);
    const [videoBitrate, setVideoBitrate] = useState(5000000);
    const [videoBitrateMode, setVideoBitrateMode] = useState<'constant' | 'variable'>('variable');
    const [imgSrc, setImgSrc] = useState<string>('');

    // Update video bitrate based on resolution
    useEffect(() => {
        const dims = ASPECT_RATIOS[aspectRatio];
        if (dims.width >= 1920 || dims.height >= 1920) {
            setVideoBitrate(8000000);
        } else {
            setVideoBitrate(5000000);
        }
    }, [aspectRatio]);

    // Style Customization State
    const [activeColor, setActiveColor] = useState('#e879f9');
    const [inactiveColor, setInactiveColor] = useState('#ffffff');
    const [inactiveOpacity, setInactiveOpacity] = useState(0.3);
    const [fontFamily, setFontFamily] = useState('Inter, sans-serif');
    const [smoothingFactor, setSmoothingFactor] = useState(0.1); 
    const [verticalOffset, setVerticalOffset] = useState(0); 
    
    // Color Events State
    const [colorEvents, setColorEvents] = useState<any[]>([]);

    const addColorEvent = (event: any) => {
        setColorEvents(prev => [...prev, event].sort((a: any, b: any) => a.time - b.time));
    };

    const removeColorEvent = (index: number) => {
        setColorEvents(prev => prev.filter((_, i) => i !== index));
    };

    const updateColorEvent = (index: number, updatedEvent: any) => {
        setColorEvents(prev => {
            const newEvents = [...prev];
            newEvents[index] = updatedEvent;
            return newEvents.sort((a: any, b: any) => a.time - b.time);
        });
    }; 

    // Qt6 Specific Settings
    const [qt6Style, setQt6Style] = useState<Qt6Style>('wave');
    const [qt6BarCount, setQt6BarCount] = useState(64);
    const [qt6Sensitivity, setQt6Sensitivity] = useState(1.0);

    // Data State
    const [clipData, setClipData] = useState<SunoClip | null>(null);
    const [alignment, setAlignment] = useState<AlignedWord[] | null>(null);
    const [lines, setLines] = useState<AlignedWord[][]>([]);
    const [lyricSource, setLyricSource] = useState(''); 
    const [applyStatus, setApplyStatus] = useState<'idle' | 'applied'>('idle');
    
    // Audio/Canvas/Media References
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const customVideoRef = useRef<HTMLVideoElement>(null);
    const requestRef = useRef<number | null>(null);
    
    // Audio Context & Analysis Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);

    // Smoothing Refs
    const smoothLineIdxRef = useRef(0);
    
    // Rendering State
    const [isRendering, setIsRendering] = useState(false);
    const [renderProgress, setRenderProgress] = useState(0);
    const [renderSpeed, setRenderSpeed] = useState(0);
    const [isPreparing, setIsPreparing] = useState(false);
    const [isGrouping, setIsGrouping] = useState(false);
    const [progress, setProgress] = useState(0); 
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const renderStartTimeRef = useRef(0);
    const lastSpeedUpdateRef = useRef(0);

    // Setup Audio Analysis for Qt6 Visualizer
    useEffect(() => {
        if (visualMode === 'qt6' && audioRef.current && !sourceNodeRef.current) {
            try {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                if (!AudioContextClass) return;

                const ctx = new AudioContextClass();
                const analyser = ctx.createAnalyser();
                analyser.fftSize = 2048; // Standard size
                analyser.smoothingTimeConstant = 0.8;
                
                const source = ctx.createMediaElementSource(audioRef.current);
                source.connect(analyser);
                analyser.connect(ctx.destination);
                
                audioContextRef.current = ctx;
                analyserRef.current = analyser;
                sourceNodeRef.current = source;
                dataArrayRef.current = new Uint8Array(analyser.fftSize);
            } catch (e) {
                console.error("Audio Context Init Failed:", e);
            }
        }
    }, [visualMode]);

    // Handle Image Source Logic
    useEffect(() => {
        if (!clipData) return;
        let url = clipData.imageLargeUrl || clipData.imageUrl || `https://cdn2.suno.ai/image_large_${clipData.id}.jpeg`;
        if (url.includes('suno.ai') && !url.includes('?')) {
            url += `?t=${Date.now()}`;
        }
        setImgSrc(url);
        if (!lyricSource) {
            const raw = clipData.metadata?.prompt || clipData.originalData?.lyricsAlone || "";
            setLyricSource(raw);
        }
    }, [clipData]);

    const handleImageError = useCallback(() => {
        setImgSrc('https://placehold.co/1080x1080/1e293b/475569?text=No+Cover');
    }, []);

    // Load Clip Data
    useEffect(() => {
        if (!selectedClipId) return;
        setLines([]); 
        setApplyStatus('idle');
        setCustomAudio(null);

        const loadData = async () => {
            let currentClip = history.find(c => c.id === selectedClipId);
            let fetchedData: any = null;

            if (sunoCookie && !selectedClipId.startsWith('draft_')) {
                try {
                    setIsPreparing(true);
                    fetchedData = await getSunoClip(selectedClipId, sunoCookie);
                } catch (e) {
                    console.warn("Could not fetch clip details, using local/fallback", e);
                }
            }

            if (fetchedData) {
                const meta = fetchedData.metadata || {};
                const prompt = meta.prompt || "";
                const tags = meta.tags || "";
                
                currentClip = {
                    id: fetchedData.id,
                    title: fetchedData.title || (currentClip?.title || 'Untitled'),
                    created_at: fetchedData.created_at || new Date().toISOString(),
                    model_name: fetchedData.model_name || 'Unknown',
                    imageUrl: fetchedData.image_url || fetchedData.image_large_url,
                    imageLargeUrl: fetchedData.image_large_url,
                    metadata: { tags: tags, prompt: prompt },
                    originalData: currentClip?.originalData || {
                        style: tags, title: fetchedData.title || '', excludeStyles: '', advancedParams: '', vocalGender: '', weirdness: 50, styleInfluence: 50, lyricsWithTags: prompt, lyricsAlone: prompt.replace(/\[[\s\S]*?\]/g, "").trim(), fullResponse: ''
                    },
                    alignmentData: currentClip?.alignmentData 
                };
            } else if (!currentClip) {
                currentClip = {
                    id: selectedClipId,
                    title: '', 
                    created_at: new Date().toISOString(),
                    model_name: 'Unknown',
                    imageUrl: `https://cdn2.suno.ai/image_large_${selectedClipId}.jpeg`,
                    metadata: { tags: '', prompt: '' }
                };
            }
            
            setClipData(currentClip);

            let sourceText = currentClip.metadata?.prompt || "";
            if (!sourceText && currentClip.originalData?.lyricsAlone) {
                sourceText = currentClip.originalData.lyricsAlone;
            }
            setLyricSource(sourceText);

            let align = currentClip.alignmentData;
            if (!align && sunoCookie && !currentClip.id.startsWith('draft_')) {
                try {
                    setIsPreparing(true);
                    const res = await getLyricAlignment(currentClip.id, sunoCookie);
                    if (res && res.aligned_words) {
                        align = res.aligned_words;
                        if (history.some(h => h.id === currentClip.id)) {
                            onUpdateClip(currentClip.id, { alignmentData: align });
                        }
                    }
                } catch (e) {
                    console.error("Alignment fetch failed", e);
                }
            }
            setAlignment(align || null);

            if (align) {
                let autoLines;
                if (sourceText) {
                    autoLines = matchWordsToPrompt(align, sourceText);
                } else {
                    autoLines = groupWordsByTiming(align);
                }
                setLines(autoLines);
            }

            setIsPreparing(false);
        };

        loadData();
    }, [selectedClipId, history, sunoCookie, onUpdateClip]);

    const handleManualLoad = useCallback(() => {
        if (manualId.trim()) setSelectedClipId(manualId.trim());
    }, [manualId]);

    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            let type: 'video' | 'image' = 'image';
            if (file.type.startsWith('video') || file.name.match(/\.(mp4|webm|mov|mkv)$/i)) {
                type = 'video';
            }
            setCustomBg({ url, type, name: file.name });
            setVisualMode('cover'); 
        }
    }, []);

    const handleAudioUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setCustomAudio({ url, name: file.name });
            if (audioRef.current && !audioRef.current.paused) {
                audioRef.current.pause();
                setIsPlaying(false);
            }
        }
    }, []);

    const handleApplyLyrics = useCallback(() => {
        if(!alignment) return;
        const newLines = matchWordsToPrompt(alignment, lyricSource);
        setLines(newLines);
        setApplyStatus('applied');
        setTimeout(() => setApplyStatus('idle'), 2000);
    }, [alignment, lyricSource]);

    const handleSmartGroup = async () => {
        if (!clipData || !alignment) return;
        const cleanLyrics = stripMetaTags(lyricSource);
        if (!cleanLyrics.trim()) {
            alert("No text lyrics found to group against.");
            return;
        }
        setIsGrouping(true);
        try {
            const cleanAligned = getCleanAlignedWords(alignment);
            const pseudoLines = matchWordsToPrompt(alignment, lyricSource);
            setLines(pseudoLines);
            const grouped = await groupLyricsByLines(cleanLyrics, cleanAligned, apiKey, geminiModel, pseudoLines);
            if (grouped && grouped.length > 0) {
                setLines(grouped);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to group lines with AI. Kept prompt-based grouping.");
        } finally {
            setIsGrouping(false);
        }
    };

    const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setProgress(time);
        }
    }, []);

    const togglePlay = useCallback(() => {
        if (audioRef.current) {
            if (audioRef.current.paused) {
                if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                    audioContextRef.current.resume().catch(console.error);
                }
                const p = audioRef.current.play();
                if (p !== undefined) {
                    p.catch(e => {
                        console.error("Playback error:", e);
                        setIsPlaying(false);
                    });
                }
                // State update handled by event listeners in component
            } else {
                audioRef.current.pause();
                // State update handled by event listeners in component
            }
        }
    }, []);

    // --- DRAWING LOGIC ---
    const renderFrame = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number, data?: Uint8Array | Float32Array) => {
        // Determine current colors based on time for background/visualizer
        let currentActiveColor = activeColor;
        // Find the last event that happened before or at current time
        const activeEvent = [...colorEvents].reverse().find((e: any) => e.time <= time);
        if (activeEvent) {
            currentActiveColor = activeEvent.activeColor;
        }

        // 1. Background Layer
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, width, height);

        if (visualMode === 'cover') {
            let drawn = false;
            if (customBg) {
                if (customBg.type === 'video' && customVideoRef.current) {
                    drawCover(ctx, customVideoRef.current, width, height);
                    drawn = true;
                } else if (customBg.type === 'image') {
                    const customImg = document.getElementById('custom-bg-img') as HTMLImageElement;
                    if (customImg && customImg.complete) {
                        drawCover(ctx, customImg, width, height);
                        drawn = true;
                    }
                }
            }
            if (!drawn) {
                const bgImg = document.getElementById('source-img') as HTMLImageElement;
                if (bgImg && bgImg.complete) {
                    drawCover(ctx, bgImg, width, height);
                }
            }
            // Overlay Dimmer
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, width, height);
        } else if (visualMode === 'qt6') {
            // Qt6 Visualizer Background (Dark Gradient)
            const grad = ctx.createLinearGradient(0, 0, 0, height);
            grad.addColorStop(0, '#0f172a');
            grad.addColorStop(1, '#000000');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);

            // Render Visualizer
            if (data) {
                drawQt6Visualizer(ctx, width, height, data, qt6Style, { activeColor: currentActiveColor, qt6Sensitivity, qt6BarCount });
            } else if (analyserRef.current && dataArrayRef.current) {
                // Realtime extraction
                if (qt6Style === 'wave') {
                    analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
                    drawQt6Visualizer(ctx, width, height, dataArrayRef.current, 'wave', { activeColor: currentActiveColor, qt6Sensitivity, qt6BarCount });
                } else {
                    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
                    drawQt6Visualizer(ctx, width, height, dataArrayRef.current, qt6Style, { activeColor: currentActiveColor, qt6Sensitivity, qt6BarCount });
                }
            }
        }

        // 2. Draw Text (Smooth Scroll)
        drawScrollingLyrics(ctx, width, height, time, lines, smoothLineIdxRef, {
            fontFamily,
            activeColor,
            inactiveColor,
            inactiveOpacity,
            smoothingFactor,
            verticalOffset,
            aspectRatio,
            colorEvents
        });

        // Title & Progress Bar
        if (clipData && duration) {
            const pct = time / duration;
            ctx.fillStyle = currentActiveColor;
            ctx.fillRect(0, height - 8, width * pct, 8);
        }
    };

    // Preview Loop
    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        // Sync video playback during preview
        if (!isRendering && customBg?.type === 'video' && customVideoRef.current && audioRef.current) {
            if(!audioRef.current.paused && customVideoRef.current.paused) customVideoRef.current.play();
            if(audioRef.current.paused && !customVideoRef.current.paused) customVideoRef.current.pause();
        }

        if (!isRendering && audioRef.current && canvas && ctx) {
            const dims = ASPECT_RATIOS[aspectRatio];
            renderFrame(ctx, dims.width, dims.height, audioRef.current.currentTime);
            setProgress(audioRef.current.currentTime);
            requestRef.current = requestAnimationFrame(animate);
        }
    }, [isRendering, customBg, aspectRatio, clipData, duration, activeColor, inactiveColor, inactiveOpacity, fontFamily, smoothingFactor, verticalOffset, qt6Style, qt6BarCount, qt6Sensitivity, visualMode, lines, colorEvents]);

    useEffect(() => {
        if (selectedClipId && !isRendering) {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            requestRef.current = requestAnimationFrame(animate);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [selectedClipId, animate, isRendering]);

    // --- OFFLINE RENDERING ---
    const startOfflineRender = async () => {
        if (!clipData || !audioRef.current || !canvasRef.current) return;
        
        audioRef.current.pause();
        if(customVideoRef.current) customVideoRef.current.pause();

        setIsRendering(true);
        setRenderProgress(0);
        setRenderSpeed(0);
        renderStartTimeRef.current = performance.now();
        lastSpeedUpdateRef.current = 0;

        const originalSmoothRef = smoothLineIdxRef.current;
        smoothLineIdxRef.current = 0; 

        try {
            await performOfflineRender(
                audioRef.current.src,
                canvasRef.current,
                {
                    width: ASPECT_RATIOS[aspectRatio].width,
                    height: ASPECT_RATIOS[aspectRatio].height,
                    bitrate: audioBitrate,
                    videoBitrate,
                    videoBitrateMode,
                    title: clipData.title || "video",
                    visualMode,
                    qt6Style,
                    customVideo: customVideoRef.current,
                    customBgType: customBg?.type
                },
                setRenderProgress,
                (ctx, time, data) => {
                    renderFrame(ctx, ASPECT_RATIOS[aspectRatio].width, ASPECT_RATIOS[aspectRatio].height, time, data);
                    
                    // Calculate Speed
                    const now = performance.now();
                    if (now - lastSpeedUpdateRef.current > 500) {
                        const elapsed = (now - renderStartTimeRef.current) / 1000;
                        if (elapsed > 0.1) {
                            setRenderSpeed(time / elapsed);
                            lastSpeedUpdateRef.current = now;
                        }
                    }
                }
            );
        } catch (e: any) {
            if(e.message !== "Render Cancelled") {
                console.error(e);
                alert("Render Failed. See console.");
            }
        } finally {
            setIsRendering(false);
            setRenderProgress(0);
            smoothLineIdxRef.current = originalSmoothRef;
            requestRef.current = requestAnimationFrame(animate);
        }
    };

    return {
        state: {
            selectedClipId, manualId, aspectRatio, visualMode, customBg, customAudio,
            audioBitrate, videoBitrate, videoBitrateMode, imgSrc, activeColor, inactiveColor, inactiveOpacity, fontFamily,
            smoothingFactor, verticalOffset, qt6Style, qt6BarCount, qt6Sensitivity,
            clipData, alignment, lines, lyricSource, applyStatus,
            isRendering, renderProgress, renderSpeed, isPreparing, isGrouping, progress, duration, isPlaying,
            colorEvents
        },
        setters: {
            setSelectedClipId, setManualId, setAspectRatio, setVisualMode, setCustomBg, setCustomAudio,
            setAudioBitrate, setVideoBitrate, setVideoBitrateMode, setImgSrc, setActiveColor, setInactiveColor, setInactiveOpacity, setFontFamily,
            setSmoothingFactor, setVerticalOffset, setQt6Style, setQt6BarCount, setQt6Sensitivity,
            setLyricSource, setIsPlaying,
            addColorEvent, removeColorEvent, updateColorEvent
        },
        refs: {
            canvasRef, audioRef, customVideoRef
        },
        handlers: {
            handleManualLoad, handleFileUpload, handleAudioUpload, handleApplyLyrics,
            handleSmartGroup, handleSeek, togglePlay, startOfflineRender, handleImageError, setDuration
        }
    };
};
