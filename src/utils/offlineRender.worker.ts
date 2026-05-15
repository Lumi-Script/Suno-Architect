import { 
    Output, 
    Mp4OutputFormat, // CHANGED: Replaced WebMOutputFormat with Mp4OutputFormat
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

self.onmessage = async (e) => {
    try {
        const { type } = e.data;

        if (type === 'INIT') {
            const { config, fps: initFps, fileHandle, audioData } = e.data;
            fps = initFps;
            
            let target;
            if (fileHandle) {
                const writableStream = await fileHandle.createWritable();
                target = new StreamTarget(writableStream);
            } else {
                fallbackTarget = new BufferTarget();
                target = fallbackTarget;
            }

            output = new Output({
                format: new Mp4OutputFormat(), // CHANGED: Instantiating MP4
                target: target
            });

            offscreenCanvas = new OffscreenCanvas(config.width, config.height);
            offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true }) as OffscreenCanvasRenderingContext2D;

            videoSource = new CanvasSource(offscreenCanvas, {
                codec: 'avc',
                bitrate: config.videoBitrate || 5_000_000,
                bitrateMode: config.videoBitrateMode || 'variable' 
            });
            output.addVideoTrack(videoSource, { frameRate: fps });

            const useFlac = (config.bitrate || 0) > 192000;
            audioSource = new AudioBufferSource({
                codec: useFlac ? 'pcm-s16' : 'aac',
                ...(!useFlac && { bitrate: config.bitrate || 128000 })
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
            
            offscreenCtx.drawImage(bitmap, 0, 0);
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