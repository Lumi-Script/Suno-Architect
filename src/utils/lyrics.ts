import { AlignedWord } from '../types';
import { Type, GoogleGenAI } from "@google/genai";

export const STOP_WORDS = new Set(['the', 'and', 'a', 'to', 'of', 'in', 'it', 'is', 'that', 'you', 'he', 'she', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they', 'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word', 'but', 'not', 'what', 'all', 'were', 'we', 'when', 'your', 'can', 'said', 'there', 'use', 'an', 'each', 'which', 'she', 'do', 'how', 'their', 'if', 'will', 'up', 'other', 'about', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like', 'him', 'into', 'time', 'has', 'look', 'two', 'more', 'write', 'go', 'see', 'number', 'no', 'way', 'could', 'people', 'my', 'than', 'first', 'water', 'been', 'call', 'who', 'oil', 'its', 'now', 'find']);

export const stripMetaTags = (text: string): string => {
    if (!text) return "";
    // Regex to match [ ... ] and { ... } including newlines
    return text
        .replace(/\[[^\]]*\]/g, "")
        .replace(/\{[^}]*\}/g, "")
        .replace(/\n{3,}/g, "\n\n") // Normalize excessive newlines
        .trim();
};

export const getCleanAlignedWords = (aligned: AlignedWord[]): AlignedWord[] => {
    // 1. Stateful Strip of Square Brackets [] and Curly Braces {}
    const stripped: AlignedWord[] = [];
    let inSquare = false;
    let inCurly = false;

    for (const w of aligned) {
        let cleanedWord = "";
        for (const char of w.word) {
            if (char === '[') { inSquare = true; continue; }
            if (char === ']') { inSquare = false; continue; }
            if (char === '{') { inCurly = true; continue; }
            if (char === '}') { inCurly = false; continue; }

            if (!inSquare && !inCurly) {
                cleanedWord += char;
            }
        }
        
        const trimmed = cleanedWord.trim();
        if (trimmed.length > 0) {
            // Check for trailing opener (e.g. "days (") and split it
            const splitMatch = trimmed.match(/^(.*?)(\s*)([\(\"\'\u201C\u2018\u00AB\<]+)$/);
            if (splitMatch && splitMatch[1].trim().length > 0) {
                const wordPart = splitMatch[1].trim();
                const spacePart = splitMatch[2];
                const openerPart = splitMatch[3];
                
                // Only split if there is space OR if the opener is unambiguous (brackets)
                // We treat quotes as ambiguous - they stick to the word if no space (e.g. end")
                const isAmbiguous = /^[\"\'\u201C\u2018]+$/.test(openerPart);
                
                if (isAmbiguous && spacePart.length === 0) {
                     stripped.push({ ...w, word: trimmed });
                } else {
                    // Split duration: give most to word, last 0.1s to opener
                    const splitTime = Math.max(w.start_s, w.end_s - 0.1);
                    
                    stripped.push({ ...w, word: wordPart, end_s: splitTime });
                    stripped.push({ ...w, word: openerPart, start_s: splitTime });
                }
            } else {
                stripped.push({ ...w, word: trimmed });
            }
        }
    }

    if (stripped.length === 0) return [];

    // 2. Smart Merge of Punctuation & Split Contractions
    const merged: AlignedWord[] = [];
    
    const isOpener = (s: string) => /^[\(\"\'\u201C\u2018\u00AB\<]+$/.test(s); 
    const isCloser = (s: string) => /^[\)\"\'\u201D\u2019\u00BB\>\,\.\!\?\:\;]+$/.test(s);
    const isSuffix = (s: string) => /^['’][a-z]+$/i.test(s);
    const isContractionPart = (s: string) => /^(s|m|t|re|ve|ll|d)$/i.test(s);

    for (let i = 0; i < stripped.length; i++) {
        let current = { ...stripped[i] };
        
        // A. Forward Merge (Openers)
        if (isOpener(current.word) && i + 1 < stripped.length) {
            const next = stripped[i+1];
            // Increased threshold to 5.0s to ensure brackets always join the next word
            if (next.start_s - current.end_s < 5.0) {
                stripped[i+1] = {
                    ...next,
                    word: current.word + next.word,
                    start_s: current.start_s
                };
                continue;
            }
        }

        // B. Backward Merge (Closers & Suffixes & Split Contractions)
        if (merged.length > 0) {
            const prev = merged[merged.length - 1];
            const timeGap = current.start_s - prev.end_s;
            
            const standardMerge = (isCloser(current.word) || isSuffix(current.word));
            const splitContractionMerge = /['’]$/.test(prev.word) && isContractionPart(current.word);

            if ((standardMerge || splitContractionMerge) && timeGap < 1.5) {
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

export const cleanStringForMatch = (s: string) => {
    if (!s) return "";
    try {
        return s.toLowerCase().replace(/['’]/g, '').replace(/[^\p{L}\p{N}]/gu, '');
    } catch (e) {
        return s.toLowerCase().replace(/['".,/#!$%^&*;:{}=\-_`~()]/g, "");
    }
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
    const promptLines = stripMetaTags(promptText).split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (promptLines.length === 0) return groupWordsByTiming(cleanAligned);
    
    type PromptToken = { text: string; lineIndex: number; isLineStart: boolean };
    const tokens: PromptToken[] = [];
    promptLines.forEach((line, idx) => {
        const words = line.split(/\s+/).map(cleanStringForMatch).filter(w => w.length > 0);
        words.forEach((w, wIdx) => tokens.push({ text: w, lineIndex: idx, isLineStart: wIdx === 0 }));
    });
    
    const groups: AlignedWord[][] = [];
    let currentGroup: AlignedWord[] = [];
    let currentLineIndex = 0;
    let tokenPtr = 0;
    let wordsSinceLastMatch = 0; 
    
    for (let i = 0; i < cleanAligned.length; i++) {
        const wordObj = cleanAligned[i];
        const cleanWord = cleanStringForMatch(wordObj.word);
        
        if (!cleanWord) { 
            // Punctuation Handling with Lookahead
            // Check if this punctuation likely belongs to the NEXT line (e.g. leading quote)
            const isAmbiguousOpener = /^['"“‘\(\[\{<]/.test(wordObj.word);
            
            if (isAmbiguousOpener && i + 1 < cleanAligned.length) {
                const nextObj = cleanAligned[i+1];
                const nextClean = cleanStringForMatch(nextObj.word);
                
                if (nextClean) {
                     // Lookahead search to see if next word triggers a line break
                     let nextLineIndex = -1;
                     const searchLimit = 20; 
                     for (let la = 0; la < searchLimit; la++) {
                         if (tokenPtr + la >= tokens.length) break;
                         const t = tokens[tokenPtr + la];
                         if (t.text === nextClean) {
                             nextLineIndex = t.lineIndex;
                             break;
                         }
                     }
                     
                     if (nextLineIndex > currentLineIndex) {
                         // Force switch for openers if next word is on a new line
                         if (currentGroup.length > 0) groups.push(currentGroup);
                         currentGroup = [];
                         currentLineIndex = nextLineIndex;
                     }
                }
            }

            currentGroup.push(wordObj); 
            continue; 
        }

        let bestMatchOffset = -1;
        const isLost = wordsSinceLastMatch > 3; 
        const searchLimit = isLost ? 500 : 50; 

        for (let lookahead = 0; lookahead < searchLimit; lookahead++) {
            if (tokenPtr + lookahead >= tokens.length) break;
            const target = tokens[tokenPtr + lookahead];
            
            const isExact = target.text === cleanWord;
            const isSub = !isExact && (target.text.includes(cleanWord) || cleanWord.includes(target.text));
            const isMatch = isExact || (isLost && isSub);

            if (isMatch) {
                let contextScore = 0;
                
                if (i + 1 < cleanAligned.length) {
                    const nextAudio = cleanStringForMatch(cleanAligned[i+1].word);
                    if (tokenPtr + lookahead + 1 < tokens.length) {
                        const nextToken = tokens[tokenPtr + lookahead + 1].text;
                        if (nextToken === nextAudio) contextScore += 2;
                        else if (nextAudio && nextToken.includes(nextAudio)) contextScore += 1;
                    }
                    if (i + 2 < cleanAligned.length && tokenPtr + lookahead + 2 < tokens.length) {
                         const nextNextAudio = cleanStringForMatch(cleanAligned[i+2].word);
                         const nextNextToken = tokens[tokenPtr + lookahead + 2].text;
                         if (nextNextAudio === nextNextToken) contextScore += 1;
                    }
                }

                const isStrongMatch = (isExact && lookahead === 0) || contextScore > 0;
                
                if (target.isLineStart && (isStrongMatch || (isExact && !STOP_WORDS.has(cleanWord)))) {
                    bestMatchOffset = lookahead;
                    break;
                }

                if (isStrongMatch) {
                    bestMatchOffset = lookahead;
                    break;
                }
                
                if (isLost && isExact && !STOP_WORDS.has(cleanWord)) {
                     if (bestMatchOffset === -1) bestMatchOffset = lookahead;
                }
            }
        }

        if (bestMatchOffset !== -1) {
            const target = tokens[tokenPtr + bestMatchOffset];
            
            if (target.lineIndex > currentLineIndex) {
                if (currentGroup.length > 0) groups.push(currentGroup);
                currentGroup = [];
                currentLineIndex = target.lineIndex;
            } 

            tokenPtr += bestMatchOffset + 1;
            wordsSinceLastMatch = 0; 
        } else {
            wordsSinceLastMatch++;
            
            if (currentGroup.length > 0) {
                const prev = currentGroup[currentGroup.length - 1];
                if (wordObj.start_s - prev.end_s > 2.0) { 
                     groups.push(currentGroup);
                     currentGroup = [];
                }
            }
        }
        
        currentGroup.push(wordObj);
    }
    
    if (currentGroup.length > 0) groups.push(currentGroup);
    return groups;
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

  const ai = new GoogleGenAI({ apiKey: key });

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

// --- FILE GENERATION UTILS ---

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