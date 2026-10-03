import { 
    Output, 
    Mp4OutputFormat, 
    WebMOutputFormat,
    BufferTarget, 
    StreamTarget, 
    CanvasSource, 
    AudioBufferSource 
} from 'mediabunny';

if (typeof globalThis.AudioBuffer === 'undefined') {
    (globalThis as any).AudioBuffer = class AudioBuffer {
        length: number;
        numberOfChannels: number;
        sampleRate: number;
        duration: number;
        _channels: Float32Array[];

        constructor(options: { length: number; numberOfChannels: number; sampleRate: number }) {
            this.length = options.length;
            this.numberOfChannels = options.numberOfChannels;
            this.sampleRate = options.sampleRate;
            this.duration = this.length / this.sampleRate;
            this._channels = new Array(this.numberOfChannels);
        }

        getChannelData(channel: number) {
            return this._channels[channel];
        }

        copyToChannel(source: Float32Array, channelNumber: number, bufferOffset = 0) {
            if (!this._channels[channelNumber]) {
                this._channels[channelNumber] = new Float32Array(this.length);
            }
            this._channels[channelNumber].set(source, bufferOffset);
        }

        copyFromChannel(destination: Float32Array, channelNumber: number, bufferOffset = 0) {
            const source = this._channels[channelNumber].subarray(bufferOffset, bufferOffset + destination.length);
            destination.set(source);
        }
    };
}

let output: Output;
let videoSource: CanvasSource;
let audioSource: AudioBufferSource;
let offscreenCanvas: OffscreenCanvas;
let offscreenCtx: OffscreenCanvasRenderingContext2D;
let fallbackTarget: BufferTarget | undefined;
let fps: number = 60;
let currentExportFormat: 'mp4' | 'webm' = 'mp4';

self.onmessage = async (e) => {
    try {
        const { type } = e.data;

        if (type === 'INIT') {
            const { config, fps: initFps, fileHandle, audioData } = e.data;
            fps = initFps;
            currentExportFormat = config.exportFormat || 'mp4';
            
            let target;
            if (fileHandle) {
                const writableStream = await fileHandle.createWritable();
                target = new StreamTarget(writableStream);
            } else {
                fallbackTarget = new BufferTarget();
                target = fallbackTarget;
            }

            output = new Output({
                format: currentExportFormat === 'webm' ? new WebMOutputFormat() : new Mp4OutputFormat(),
                target: target
            });

            offscreenCanvas = new OffscreenCanvas(config.width, config.height);
            offscreenCtx = offscreenCanvas.getContext('2d', { alpha: false, willReadFrequently: true }) as OffscreenCanvasRenderingContext2D;

            videoSource = new CanvasSource(offscreenCanvas, {
                codec: currentExportFormat === 'webm' ? 'vp9' : 'avc',
                bitrate: config.videoBitrate || 5_000_000,
                bitrateMode: config.videoBitrateMode || 'variable' 
            });
            output.addVideoTrack(videoSource, { frameRate: fps });

                        const useFlac = (config.bitrate || 0) >= 1000000;
            const audioCodec = currentExportFormat === 'webm' ? 'opus' : (useFlac ? 'pcm-s16' : 'aac');
            
            // AAC (MP4) often caps out at 192kbps in WebCodecs implementations. 
            // Opus (WebM) supports high bitrates like 320kbps perfectly.
            const fallbackBitrate = audioCodec === 'opus' ? 320000 : 192000;
            
            audioSource = new AudioBufferSource({
                codec: audioCodec,
                ...((audioCodec !== 'pcm-s16') && { bitrate: config.bitrate || fallbackBitrate })
            });

            output.addAudioTrack(audioSource);

            await output.start();

            const reconstructedAudioBuffer = new AudioBuffer({
                length: audioData.length,
                numberOfChannels: audioData.numberOfChannels,
                sampleRate: audioData.sampleRate
            });

            for (let i = 0; i < audioData.numberOfChannels; i++) {
                reconstructedAudioBuffer.copyToChannel(audioData.channels[i], i);
            }

            await audioSource.add(reconstructedAudioBuffer as any);

            self.postMessage({ type: 'INIT_DONE' });
        }

        if (type === 'ENCODE_FRAME') {
            const { bitmap, time, keyFrame } = e.data;
            
                        offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
            // Apply a mathematical Full-to-Limited range color compression (16-235)
            offscreenCtx.filter = 'brightness(0.982063) contrast(0.87451)';
            offscreenCtx.drawImage(bitmap, 0, 0);
            offscreenCtx.filter = 'none';
            bitmap.close(); 

            await videoSource.add(time, 1 / fps, { keyFrame });

            self.postMessage({ type: 'FRAME_ENCODED' });
        }

        if (type === 'FINALIZE') {
            await output.finalize();
            
            if (fallbackTarget) {
                self.postMessage({ type: 'DONE', buffer: fallbackTarget.buffer }, [fallbackTarget.buffer]);
            } else {
                self.postMessage({ type: 'DONE' });
            }
        }
    } catch (err: any) {
        self.postMessage({ type: 'ERROR', message: err.message || 'Worker Error' });
    }
};







