import { FFmpeg } from '@ffmpeg/ffmpeg';

let ffmpeg: FFmpeg | null = null;

export const fixVideoColors = async (buffer: ArrayBuffer, format: 'mp4' | 'webm', onProgress: (msg: string) => void): Promise<ArrayBuffer> => {
    if (!ffmpeg) {
        onProgress("Loading FFmpeg engine...");
        ffmpeg = new FFmpeg();
        ffmpeg.on('log', ({ message }) => console.log(message));
        
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        await ffmpeg.load({
            coreURL: `${baseURL}/ffmpeg-core.js`,
            wasmURL: `${baseURL}/ffmpeg-core.wasm`
        });
    }

    onProgress("Injecting color metadata...");
    const inputName = `input.${format}`;
    const outputName = `output.${format}`;
    
    await ffmpeg.writeFile(inputName, new Uint8Array(buffer));

    if (format === 'mp4') {
        await ffmpeg.exec([
            '-y',
            '-i', inputName,
            '-c', 'copy',
            '-bsf:v', 'h264_metadata=video_full_range_flag=1:colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1',
            outputName
        ]);
    } else {
        // For WebM/VP9, color_range=1 is PC (Full Range)
        await ffmpeg.exec([
            '-y',
            '-i', inputName,
            '-c', 'copy',
            '-bsf:v', 'vp9_metadata=color_space=1:color_range=1',
            outputName
        ]);
    }

    const data = await ffmpeg.readFile(outputName);
    return (data as Uint8Array).buffer;
};
