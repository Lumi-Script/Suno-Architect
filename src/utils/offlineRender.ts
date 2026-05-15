import { Qt6Style } from '../types';

const MAX_FRAMES_IN_FLIGHT = 10;
let framesInFlight = 0;
let resolvePushback: (() => void) | null = null;

export const performOfflineRender = async (
    audioSrc: string,
    canvas: HTMLCanvasElement,
    config: {
        width: number;
        height: number;
        bitrate: number;
        videoBitrate: number;
        videoBitrateMode: 'constant' | 'variable';
        fps: number;
        title: string;
        visualMode: 'cover' | 'qt6';
        qt6Style: Qt6Style;
        customVideo?: HTMLVideoElement | null;
        customBgType?: 'image' | 'video';
    },
    onProgress: (progress: number) => void,
    onRenderFrame: (ctx: CanvasRenderingContext2D, time: number, data: Uint8Array | Float32Array) => void
) => {
    return new Promise<void>(async (resolve, reject) => {
        try {
            const worker = new Worker(new URL('./offlineRender.worker.ts', import.meta.url), { type: 'module' });
            const fps = config.fps || 30;
            // CHANGED: File extension to .mp4
            const filename = `${(config.title || 'video').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_suno_architect.mp4`;

            let resolveWorkerReady: () => void;
            const workerReadyPromise = new Promise<void>((res) => { resolveWorkerReady = res; });

            worker.onmessage = (e) => {
                if (e.data.type === 'INIT_DONE') {
                    resolveWorkerReady();
                } else if (e.data.type === 'FRAME_ENCODED') {
                    framesInFlight--;
                    if (resolvePushback && framesInFlight < MAX_FRAMES_IN_FLIGHT) {
                        resolvePushback();
                        resolvePushback = null;
                    }
                } else if (e.data.type === 'DONE') {
                    if (e.data.buffer) {
                        triggerDownload(e.data.buffer, filename);
                    }
                    worker.terminate();
                    resolve();
                } else if (e.data.type === 'ERROR') {
                    worker.terminate();
                    reject(new Error(e.data.message));
                }
            };

            const response = await fetch(audioSrc);
            const arrayBuffer = await response.arrayBuffer();

            const audioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const tempCtx = new audioContextClass();
            const decodedBuffer = await tempCtx.decodeAudioData(arrayBuffer.slice(0));
            
            const offlineCtx = new OfflineAudioContext(2, decodedBuffer.length, decodedBuffer.sampleRate);
            const source = offlineCtx.createBufferSource();
            source.buffer = decodedBuffer;
            
            const analyser = offlineCtx.createAnalyser();
            analyser.fftSize = 2048;
            analyser.smoothingTimeConstant = 0.8;
            source.connect(analyser);
            analyser.connect(offlineCtx.destination);
            source.start(0);

            const duration = source.buffer.duration;
            const totalFrames = Math.ceil(duration * fps);
            const ctx = canvas.getContext('2d')!;
            canvas.width = config.width;
            canvas.height = config.height;

            let fileHandle = null;
            if ('showSaveFilePicker' in window) {
                try {
                    fileHandle = await (window as any).showSaveFilePicker({
                        suggestedName: filename,
                        // CHANGED: File picker accepts MP4
                        types: [{ description: 'MP4 Video', accept: { 'video/mp4': ['.mp4'] } }],
                    });
                } catch (err: any) {
                    if (err.name === 'AbortError') return reject(new Error("Render Cancelled"));
                    console.warn("File System Access failed, falling back to RAM.", err);
                }
            }

            const channelData = [];
            for (let i = 0; i < decodedBuffer.numberOfChannels; i++) {
                channelData.push(decodedBuffer.getChannelData(i));
            }

            const { customVideo, ...workerConfig } = config;

            worker.postMessage({
                type: 'INIT',
                config: workerConfig, 
                fps,
                fileHandle, 
                audioData: {
                    channels: channelData,
                    sampleRate: decodedBuffer.sampleRate,
                    length: decodedBuffer.length,
                    numberOfChannels: decodedBuffer.numberOfChannels
                }
            });

            await workerReadyPromise;

            let frameIndex = 0;

            const processFrame = async () => {
                const t = frameIndex / fps;

                if (framesInFlight >= MAX_FRAMES_IN_FLIGHT) {
                    await new Promise<void>(res => { resolvePushback = res; });
                }

                if (config.visualMode === 'cover' && config.customBgType === 'video' && config.customVideo) {
                    config.customVideo.currentTime = t % config.customVideo.duration;
                }

                const freqData = new Uint8Array(analyser.frequencyBinCount);
                if (config.qt6Style === 'wave') {
                    analyser.getByteTimeDomainData(freqData);
                } else {
                    analyser.getByteFrequencyData(freqData);
                }

                onRenderFrame(ctx, t, freqData);

                const bitmap = await createImageBitmap(canvas);

                framesInFlight++;
                worker.postMessage({
                    type: 'ENCODE_FRAME',
                    bitmap,
                    time: t,
                    keyFrame: frameIndex % (fps * 2) === 0
                }, [bitmap]);

                frameIndex++;
                onProgress((frameIndex / totalFrames) * 100);

                if (frameIndex < totalFrames) {
                    offlineCtx.suspend(frameIndex / fps).then(processFrame).then(() => offlineCtx.resume());
                } else {
                    worker.postMessage({ type: 'FINALIZE' });
                    offlineCtx.resume();
                }
            };

            offlineCtx.suspend(0).then(processFrame).then(() => offlineCtx.resume());
            await offlineCtx.startRendering();

        } catch (e: any) {
            console.error("Offline render failed", e);
            reject(e);
        }
    });
};

const triggerDownload = (buffer: ArrayBuffer, filename: string) => {
    // CHANGED: Blob mime type to video/mp4
    const blob = new Blob([buffer], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
