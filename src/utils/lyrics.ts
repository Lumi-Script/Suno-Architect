import { AlignedWord } from '../types';
import { Type, GoogleGenAI } from "@google/genai";

export const stripMetaTags = (text: string): string => {
    if (!text) return "";
    return text
        .replace(/\[[^\]]*\]/g, "")
        .replace(/\{[^}]*\}/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
};

export const cleanStringForMatch = (s: string) => {
    if (!s) return "";
    return s.toLowerCase().replace(/['".,/#!$%^&*;:{}=\-_`~()\[\]]/g, "").trim();
};

export const splitMergedAlignedWords = (words: AlignedWord[]): AlignedWord[] => {
    const result: AlignedWord[] = [];
    for (const w of words) {
        const parts = w.word.split(/(\n+)/);
        
        if (parts.length === 1) {
            result.push(w);
            continue;
        }
        
        const splitWords: string[] = [];
        let current = "";
        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
                 if (current) splitWords.push(current);
                 current = parts[i];
            } else {
                 current += parts[i];
                 splitWords.push(current);
                 current = "";
            }
        }
        if (current) splitWords.push(current);
        
        const finalWords = splitWords.filter(s => s.length > 0);
        
        if (finalWords.length === 1) {
             result.push({ ...w, word: finalWords[0] });
             continue;
        }

        const totalLen = finalWords.reduce((sum, s) => sum + s.length, 0);
        const duration = w.end_s - w.start_s;
        let currentStart = w.start_s;
        
        for (const fw of finalWords) {
             const fwDuration = (fw.length / totalLen) * duration;
             result.push({
                  ...w,
                  word: fw,
                  start_s: currentStart,
                  end_s: currentStart + fwDuration
             });
             currentStart += fwDuration;
        }
    }
    return result;
};

export const getCleanAlignedWords = (aligned: AlignedWord[]): AlignedWord[] => {
    const splitAligned = splitMergedAlignedWords(aligned);
    
    const stripped: AlignedWord[] = [];
    let inSquare = false;
    let inCurly = false;

    for (const w of splitAligned) {
        let cleanedWord = "";
        for (const char of w.word) {
            if (char === '[') { inSquare = true; continue; }
            if (char === ']') { inSquare = false; continue; }
            if (char === '{') { inCurly = true; continue; }
            if (char === '}') { inCurly = false; continue; }
            if (char === '\n') { inSquare = false; inCurly = false; } // Safety reset

            if (!inSquare && !inCurly) {
                cleanedWord += char;
            }
        }
        
        const trimmed = cleanedWord.trim();
        if (trimmed.length > 0) {
            stripped.push({ ...w, word: cleanedWord.replace(/[\n\r]/g, '') });
        }
    }
    
    // Quick merge for punctuation
    const merged: AlignedWord[] = [];
    const isCloser = (s: string) => /^[\)\"\'\u201D\u2019\u00BB\>\,\.\!\?\:\;]+$/.test(s.trim());
    for (let i = 0; i < stripped.length; i++) {
        const current = { ...stripped[i] };
        if (merged.length > 0) {
            const prev = merged[merged.length - 1];
            if (isCloser(current.word) && current.start_s - prev.end_s < 1.0) {
                merged[merged.length - 1] = {
                    ...prev,
                    word: prev.word + current.word,
                    end_s: current.end_s
                };
                continue;
            }
        }
        merged.push(current);
    }

    return merged;
};

export const groupWordsByTiming = (aligned: AlignedWord[]): AlignedWord[][] => {
    const cleanAligned = getCleanAlignedWords(aligned); 
    if (cleanAligned.length === 0) return [];
    const groups: AlignedWord[][] = [];
    let currentLine: AlignedWord[] = [];
    const GAP_THRESHOLD = 0.5;
    const MAX_CHARS = 40; 
    cleanAligned.forEach((word, idx) => {
        if (idx === 0) { currentLine.push(word); return; }
        const prevWord = cleanAligned[idx - 1];
        const timeGap = word.start_s - prevWord.end_s;
        const currentLen = currentLine.reduce((sum, w) => sum + w.word.length + 1, 0);
        const isGapBig = timeGap > GAP_THRESHOLD;
        const isLineLong = currentLen > MAX_CHARS;
        const endsClause = /[.,;!?\)]$/.test(prevWord.word);
        if (isGapBig || ((isLineLong || endsClause) && timeGap > 0.15)) {
            groups.push(currentLine);
            currentLine = [word];
        } else {
            currentLine.push(word);
        }
    });
    if (currentLine.length > 0) groups.push(currentLine);
    return groups;
};

export const matchWordsToPrompt = (aligned: AlignedWord[], promptText: string): AlignedWord[][] => {
    const cleanAligned = getCleanAlignedWords(aligned);
    if (cleanAligned.length === 0) return [];
    
    const promptLines = stripMetaTags(promptText).split('\n').map(l => l.trim());
    
    const tokens: { text: string; clean: string; lineIndex: number }[] = [];
    promptLines.forEach((line, lineIndex) => {
        if (!line) return;
        const words = line.split(/\s+/);
        words.forEach(w => {
            const clean = cleanStringForMatch(w);
            if (clean) {
                tokens.push({ text: w, clean, lineIndex });
            }
        });
    });

    if (tokens.length === 0) {
        return groupWordsByTiming(cleanAligned);
    }

    const audioTokens = cleanAligned.map(w => ({
        obj: w,
        clean: cleanStringForMatch(w.word)
    }));

    const N = audioTokens.length;
    const M = tokens.length;
    
    const dp: number[][] = Array.from({ length: N + 1 }, () => new Array(M + 1).fill(0));
    const backtrack: number[][] = Array.from({ length: N + 1 }, () => new Array(M + 1).fill(0));
    
    for (let i = 1; i <= N; i++) { dp[i][0] = i * 2; backtrack[i][0] = 2; }
    for (let j = 1; j <= M; j++) { dp[0][j] = j * 2; backtrack[0][j] = 3; }
    
    for (let i = 1; i <= N; i++) {
        for (let j = 1; j <= M; j++) {
            const aClean = audioTokens[i - 1].clean;
            const pClean = tokens[j - 1].clean;
            
            let matchCost = 3; 
            if (aClean === pClean) {
                matchCost = 0; 
            } else if (aClean.includes(pClean) || pClean.includes(aClean)) {
                matchCost = 1; 
            }
            
            const costDiag = dp[i - 1][j - 1] + matchCost;
            const costUp = dp[i - 1][j] + 2; 
            const costLeft = dp[i][j - 1] + 2; 
            
            let min = costDiag;
            let dir = 1;
            
            if (costUp < min) {
                min = costUp;
                dir = 2;
            }
            if (costLeft < min) {
                min = costLeft;
                dir = 3;
            }
            
            dp[i][j] = min;
            backtrack[i][j] = dir;
        }
    }
    
    let i = N;
    let j = M;
    const assignment: number[] = new Array(N).fill(-1);
    
    while (i > 0 && j > 0) {
        const dir = backtrack[i][j];
        if (dir === 1) {
            assignment[i - 1] = tokens[j - 1].lineIndex;
            i--; j--;
        } else if (dir === 2) {
            assignment[i - 1] = j < M ? tokens[j].lineIndex : (j > 0 ? tokens[j - 1].lineIndex : -1);
            i--;
        } else {
            j--;
        }
    }
    while (i > 0) {
        assignment[i - 1] = j < M ? tokens[j].lineIndex : (j > 0 ? tokens[j - 1].lineIndex : 0);
        i--;
    }
    
    const lines: AlignedWord[][] = [];
    let currentLine: AlignedWord[] = [];
    let currentLineIdx = -1;
    
    for (let k = 0; k < N; k++) {
        let assignedLine = assignment[k];
        if (assignedLine === -1) {
             assignedLine = currentLineIdx === -1 ? 0 : currentLineIdx;
        }
        
        if (assignedLine !== currentLineIdx) {
            if (currentLine.length > 0) {
                lines.push(currentLine);
                currentLine = [];
            }
            currentLineIdx = assignedLine;
            while (lines.length < currentLineIdx) {
                 lines.push([]);
            }
        }
        currentLine.push(audioTokens[k].obj);
    }
    if (currentLine.length > 0) {
        lines.push(currentLine);
    }
    
    return lines;
};

export const groupLyricsByLines = async (
  lyrics: string,
  aligned: AlignedWord[],
  apiKey?: string,
  modelName: string = "gemini-3-flash-preview",
  fallback?: AlignedWord[][]
): Promise<AlignedWord[][]> => {
  const key = apiKey || process.env.API_KEY;
  if (!key) return fallback || [];

  const isVertex = localStorage.getItem('is_vertex_key') === 'true';
  const ai = new GoogleGenAI({ apiKey: key, vertexai: isVertex });

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `
        Task: Group a list of synchronized words into arrays that represent lines of a song.
        Use the LYRICS provided as the ground truth for line breaks.
        
        LYRICS:
        ${lyrics}

        SYNCED WORDS (JSON):
        ${JSON.stringify(aligned.map(w => ({ word: w.word, start: w.start_s, end: w.end_s })))}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING, description: "The word text" },
                start: { type: Type.NUMBER, description: "Start time in seconds" },
                end: { type: Type.NUMBER, description: "End time in seconds" }
              },
              required: ["word", "start", "end"]
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((line: any[]) => line.map((item: any) => ({
      word: item.word,
      start_s: item.start,
      end_s: item.end,
      success: true,
      p_align: 1.0
    })));
  } catch (error) {
    console.error("Gemini Grouping Error:", error);
    return fallback || [];
  }
};

export const formatLrcTimestamp = (seconds: number) => {
    const date = new Date(0);
    date.setMilliseconds(seconds * 1000);
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const secs = String(date.getUTCSeconds()).padStart(2, '0');
    const hundredths = String(Math.floor(date.getUTCMilliseconds() / 10)).padStart(2, '0');
    return `[${minutes}:${secs}.${hundredths}]`;
};

export const formatSrtTimestamp = (seconds: number) => {
    const date = new Date(0);
    date.setMilliseconds(seconds * 1000);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const secs = String(date.getUTCSeconds()).padStart(2, '0');
    const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${secs},${milliseconds}`;
};

export const generateLrc = (lines: AlignedWord[][]): string => {
    let lrcContent = '';
    lines.forEach(line => {
        if (line.length === 0) return;
        const time = formatLrcTimestamp(line[0].start_s);
        const lineText = line.map(w => w.word).join(' ');
        lrcContent += `${time}${lineText}\n`;
    });
    return lrcContent;
};

export const generateSrt = (lines: AlignedWord[][]): string => {
    let srtContent = '';
    lines.forEach((line, index) => {
        if (line.length === 0) return;
        const startTime = formatSrtTimestamp(line[0].start_s);
        const endTime = formatSrtTimestamp(line[line.length - 1].end_s);
        const lineText = line.map(w => w.word).join(' ');
        srtContent += `${index + 1}\n${startTime} --> ${endTime}\n${lineText}\n\n`;
    });
    return srtContent;
};