import React, { useState, useRef } from 'react';
import { SunoClip } from '../../types';
import JSZip from 'jszip';

interface DownloadModalProps {
  clips: SunoClip[];
  onClose: () => void;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ clips, onClose }) => {
  const [includeCovers, setIncludeCovers] = useState(true);
  const [includeMp3, setIncludeMp3] = useState(true);
  const [downloadMethod, setDownloadMethod] = useState<'folder' | 'zip'>('zip');
  const [concurrentDownloads, setConcurrentDownloads] = useState<number>(4);
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [statusText, setStatusText] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const validClips = clips.filter(c => !c.id.startsWith('draft_'));

  const handleDownload = async () => {
    setIsDownloading(true);
    let tracksToDownload: { files: { url: string, filename: string }[] }[] = [];
    const filenameCounts = new Map<string, number>();

    const getUniqueName = (baseName: string) => {
        const count = filenameCounts.get(baseName) || 0;
        filenameCounts.set(baseName, count + 1);
        if (count === 0) return baseName;
        return `${baseName} (${count})`;
    };
    
    // Process from oldest to newest
    const clipsToProcess = [...validClips].reverse();
    
    for (const clip of clipsToProcess) {
      let files = [];
      
      const safeTitle = (clip.title || clip.id).replace(/[<>:"/\\|?*]+/g, '_').trim();
      const uniqueBaseName = getUniqueName(safeTitle);

      if (includeMp3) {
        files.push({
          url: `https://cdn1.suno.ai/${clip.id}.mp3`,
          filename: `${uniqueBaseName}.mp3`
        });
      }
      if (includeCovers && (clip.imageLargeUrl || clip.imageUrl)) {
        files.push({
          url: clip.imageLargeUrl || clip.imageUrl!,
          filename: `${uniqueBaseName}.jpeg`
        });
      }
      if (files.length > 0) {
        tracksToDownload.push({ files });
      }
    }

    setTotal(tracksToDownload.length);
    setProgress(0);

    if (tracksToDownload.length === 0) {
      setStatusText("Nothing to download.");
      setIsDownloading(false);
      return;
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    if (downloadMethod === 'folder') {
      try {
        // @ts-ignore
        const dirHandle = await window.showDirectoryPicker();
        
        let i = 0;
        let trackIndex = 0;
        
        const processTrack = async (track: { files: { url: string, filename: string }[] }) => {
          if (signal.aborted) return;
          setStatusText(`Downloading track...`);
          try {
            for (const item of track.files) {
                if (signal.aborted) return;
                const response = await fetch(item.url, { signal });
                if (!response.ok) throw new Error("Failed to fetch");
                const blob = await response.blob();
                if (signal.aborted) return;
                
                const fileHandle = await dirHandle.getFileHandle(item.filename, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
            }
          } catch(e: any) {
             if (e.name !== 'AbortError') {
                 console.error(`Failed to download track`, e);
             }
          }
          i++;
          setProgress(i);
        };

        const workers = Array.from({ length: concurrentDownloads }).map(async () => {
             while (trackIndex < tracksToDownload.length) {
                 if (signal.aborted) break;
                 const track = tracksToDownload[trackIndex++];
                 await processTrack(track);
             }
        });
        
        await Promise.all(workers);

        if (!signal.aborted) {
            setStatusText("Finished downloading to folder.");
        } else {
            setStatusText("Download cancelled.");
        }
      } catch (e: any) {
         if (e.name !== 'AbortError') {
             console.error(e);
             setStatusText("Error selecting folder or saving.");
         } else {
             setStatusText("Folder selection cancelled.");
         }
      }
    } else {
      try {
        const zip = new JSZip();
        let i = 0;
        let trackIndex = 0;

        const processTrackZip = async (track: { files: { url: string, filename: string }[] }) => {
          if (signal.aborted) return;
          setStatusText(`Fetching track for zip...`);
          try {
            for (const item of track.files) {
                if (signal.aborted) return;
                const response = await fetch(item.url, { signal });
                if (!response.ok) throw new Error("Failed to fetch");
                const blob = await response.blob();
                if (signal.aborted) return;
                zip.file(item.filename, blob);
            }
          } catch(e: any) {
             if (e.name !== 'AbortError') {
                 console.error(`Failed to download track`, e);
             }
          }
          i++;
          setProgress(i);
        };

        const workers = Array.from({ length: concurrentDownloads }).map(async () => {
             while (trackIndex < tracksToDownload.length) {
                 if (signal.aborted) break;
                 const track = tracksToDownload[trackIndex++];
                 await processTrackZip(track);
             }
        });
        
        await Promise.all(workers);
        
        if (!signal.aborted) {
            setStatusText("Generating zip file...");
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            
            const url = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Suno_Architect_Export_${new Date().toISOString().split('T')[0]}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            setStatusText("Finished downloading zip.");
        }
      } catch(e: any) {
         if (e.name === 'AbortError') {
             setStatusText("Download cancelled.");
         } else {
             console.error(e);
             setStatusText("Error generating zip.");
         }
      }
    }
    
    setIsDownloading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button 
            onClick={onClose}
            disabled={isDownloading}
            className="absolute top-4 right-4 text-slate-400 hover:text-white disabled:opacity-50"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>

        <h2 className="text-xl font-bold text-white mb-4">Download All</h2>
        <p className="text-sm text-slate-400 mb-6">
            Download {validClips.length} generated tracks (drafts are ignored).
        </p>

        <div className="space-y-4 mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={includeCovers} 
                    onChange={(e) => setIncludeCovers(e.target.checked)}
                    disabled={isDownloading}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-purple-600 focus:ring-purple-600 focus:ring-offset-slate-900"
                />
                <span className="text-slate-200">Include Covers (Large)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={includeMp3} 
                    onChange={(e) => setIncludeMp3(e.target.checked)}
                    disabled={isDownloading}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-purple-600 focus:ring-purple-600 focus:ring-offset-slate-900"
                />
                <span className="text-slate-200">Include MP3 Audio</span>
            </label>

            <div className="pt-4 border-t border-slate-700/50">
                <p className="text-sm font-semibold text-slate-300 mb-3">Concurrency (Threads)</p>
                <select
                    value={concurrentDownloads}
                    onChange={(e) => setConcurrentDownloads(Number(e.target.value))}
                    disabled={isDownloading}
                    className="bg-slate-800 border-none text-white text-xs rounded-md py-1.5 px-2 pr-6 focus:ring-1 focus:ring-purple-500 outline-none cursor-pointer appearance-none w-fit"
                    style={{
                        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.5rem top 50%',
                        backgroundSize: '0.65rem auto',
                    }}
                >
                    <option value={1}>1 thread</option>
                    <option value={2}>2 threads</option>
                    <option value={4}>4 threads</option>
                    <option value={8}>8 threads</option>
                </select>
            </div>

            <div className="pt-4 border-t border-slate-700/50">
                <p className="text-sm font-semibold text-slate-300 mb-3">Download Method</p>
                <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="radio" 
                            name="method" 
                            value="zip" 
                            checked={downloadMethod === 'zip'}
                            onChange={() => setDownloadMethod('zip')}
                            disabled={isDownloading}
                            className="text-purple-600 bg-slate-800 border-slate-600 focus:ring-purple-600 focus:ring-offset-slate-900"
                        />
                        <span className="text-sm text-slate-300">Zip File</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="radio" 
                            name="method" 
                            value="folder" 
                            checked={downloadMethod === 'folder'}
                            onChange={() => setDownloadMethod('folder')}
                            disabled={isDownloading}
                            className="text-purple-600 bg-slate-800 border-slate-600 focus:ring-purple-600 focus:ring-offset-slate-900"
                        />
                        <span className="text-sm text-slate-300">Direct to Folder</span>
                    </label>
                </div>
                {downloadMethod === 'folder' && (
                    <p className="text-xs text-yellow-500/80 mt-2">
                        * Note: "Direct to Folder" will prompt you to select a directory and grant write permissions. Not supported in all browsers.
                    </p>
                )}
            </div>
        </div>

        {isDownloading || statusText ? (
            <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span className="truncate pr-2">{statusText}</span>
                    <span className="whitespace-nowrap">{progress} / {total}</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2">
                    <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: total > 0 ? `${(progress / total) * 100}%` : '0%' }}
                    ></div>
                </div>
            </div>
        ) : null}

        <div className="flex justify-end gap-3">
            {isDownloading ? (
                <button 
                    onClick={() => {
                        abortControllerRef.current?.abort();
                    }}
                    className="px-4 py-2 text-sm font-bold text-red-400 hover:text-red-300 transition-colors"
                >
                    Cancel Download
                </button>
            ) : (
                <button 
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                >
                    {statusText ? 'Close' : 'Cancel'}
                </button>
            )}
            {!isDownloading && (
                <button 
                    onClick={handleDownload}
                    disabled={!includeCovers && !includeMp3}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    Download Now
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
