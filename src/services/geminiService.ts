
import { GoogleGenAI, Type } from "@google/genai";
import { ParsedSunoOutput, AlignedWord, FileContext } from "../types";
import { GET_STRICT_OUTPUT_SUFFIX } from "../constants";

export const generateSunoPrompt = async (
  userInput: string, 
  customApiKey?: string,
  systemInstruction?: string,
  geminiModel: string = "gemini-3-flash-preview",
  contextFiles: FileContext[] = [],
  numTracks: number = 1
): Promise<ParsedSunoOutput[]> => {
  const apiKey = customApiKey || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API Key is missing. Please set your Gemini API Key.");
  }

  const ai = new GoogleGenAI({ apiKey });

  if (!systemInstruction) {
      throw new Error("System Instruction is missing.");
  }

  // Enforce strict output format for the requested number of tracks
  const finalSystemInstruction = `${systemInstruction}\n\n${GET_STRICT_OUTPUT_SUFFIX(numTracks)}`;

  try {
    const parts: any[] = [];
    
    // Add multiple files to context
    let hasAudio = false;
    contextFiles.forEach(file => {
        const base64Data = file.data.includes(',') 
            ? file.data.split(',')[1] 
            : file.data;
            
        parts.push({
            inlineData: {
                mimeType: file.mimeType,
                data: base64Data
            }
        });
        
        if (file.mimeType.startsWith('audio/')) {
            hasAudio = true;
        }
    });

    // Add prompt hints based on content
    if (hasAudio) {
        parts.push({ text: `[CRITICAL: Audio files are provided as Style References. Analyze their tempo, instrumentation, genre, and production characteristics to influence the generated Suno prompt.]` });
    }

    if (contextFiles.length > 0) {
        const fileNames = contextFiles.map(f => f.name).join(', ');
        parts.push({ text: `[Context Files Provided: ${fileNames}]` });
    }

    // Add user text prompt
    if (userInput) {
        parts.push({ text: `${userInput}\n\nPlease generate an album containing exactly ${numTracks} tracks based on this idea.` });
    } else if (contextFiles.length > 0) {
        parts.push({ text: `Generate a professional Suno AI album of exactly ${numTracks} tracks based on the provided context files.` });
    }

    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: { parts },
      config: {
        systemInstruction: finalSystemInstruction,
        temperature: 0.8,
      },
    });

    const text = response.text || "";
    return parseMultipleResponses(text);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const msg = error.message || "Failed to generate prompt.";
    throw new Error(msg);
  }
};

const parseMultipleResponses = (fullText: string): ParsedSunoOutput[] => {
  // Split the response by Track headers if possible
  const trackSplits = fullText.split(/--- TRACK \d+ ---/i).filter(s => s.trim().length > 10);
  
  // If no clear track splits, try to parse everything as a continuous stream of blocks
  if (trackSplits.length === 0) {
    const allMatches = extractCodeBlocks(fullText);
    const results: ParsedSunoOutput[] = [];
    // Each track has 6 blocks now (Style, Title, Exclude, Params, LyricsTags, Clean)
    for (let i = 0; i < allMatches.length; i += 6) {
        const chunk = allMatches.slice(i, i + 6);
        if (chunk.length >= 5) {
            results.push(constructParsedOutput(chunk, fullText));
        }
    }
    return results.length > 0 ? results : [constructParsedOutput([], fullText)];
  }

  return trackSplits.map(trackText => {
      const matches = extractCodeBlocks(trackText);
      return constructParsedOutput(matches, trackText);
  });
};

const extractCodeBlocks = (text: string): string[] => {
  const codeBlockRegex = /```(?:text|markdown)?\s*([\s\S]*?)\s*```/g;
  const matches: string[] = [];
  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
};

const constructParsedOutput = (matches: string[], rawText: string): ParsedSunoOutput => {
  const result: ParsedSunoOutput = {
    style: matches[0] || "",
    title: matches[1] || "",
    excludeStyles: matches[2] === "None" ? "" : (matches[2] || ""),
    advancedParams: matches[3] || "", // Now in a code block
    vocalGender: "None",
    weirdness: 50,
    styleInfluence: 50,
    lyricsWithTags: cleanTrailingHyphens(matches[4] || ""),
    lyricsAlone: cleanTrailingHyphens(matches[5] || ""),
    fullResponse: rawText,
  };

  // Parse advanced params from block 3 or the raw text of the segment
  const paramSource = result.advancedParams || rawText;
  const paramLines = paramSource.split('\n').filter(line => 
    line.toLowerCase().includes('vocal gender') || 
    line.toLowerCase().includes('weirdness') || 
    line.toLowerCase().includes('style influence')
  ).map(line => line.replace(/^[\s\*\-\u2022]+/, '').trim());

  if (paramLines.length > 0) {
    if (!result.advancedParams) result.advancedParams = paramLines.join('\n');
    paramLines.forEach(line => {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('vocal gender')) {
            const val = line.split(':')[1]?.trim();
            if (val) result.vocalGender = val;
        } else if (lowerLine.includes('weirdness')) {
             const val = line.match(/(\d+)/);
             if (val) result.weirdness = parseInt(val[1], 10);
        } else if (lowerLine.includes('style influence')) {
             const val = line.match(/(\d+)/);
             if (val) result.styleInfluence = parseInt(val[1], 10);
        }
    });
  }

  return result;
};

const cleanTrailingHyphens = (text: string): string => {
    if (!text) return "";
    return text.replace(/[ \t]*[-–—]+[ \t]*$/gm, "");
};

export const STOP_WORDS = new Set(['the', 'and', 'a', 'to', 'of', 'in', 'it', 'is', 'that', 'you', 'he', 'she', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they', 'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word', 'but', 'not', 'what', 'all', 'were', 'we', 'when', 'your', 'can', 'said', 'there', 'use', 'an', 'each', 'which', 'she', 'do', 'how', 'their', 'if', 'will', 'up', 'other', 'about', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like', 'him', 'into', 'time', 'has', 'look', 'two', 'more', 'write', 'go', 'see', 'number', 'no', 'way', 'could', 'people', 'my', 'than', 'first', 'water', 'been', 'call', 'who', 'oil', 'its', 'now', 'find']);

export const getCleanAlignedWords = (aligned: AlignedWord[]): AlignedWord[] => {
    const clean: AlignedWord[] = [];
    let bracketDepth = 0;
    for (const w of aligned) {
        const originalWord = w.word;
        let cleanWordBuilder = "";
        for (let i = 0; i < originalWord.length; i++) {
            const char = originalWord[i];
            if (char === '[') { bracketDepth++; continue; }
            if (char === ']') { if (bracketDepth > 0) bracketDepth--; continue; }
            if (bracketDepth === 0) cleanWordBuilder += char;
        }
        const trimmed = cleanWordBuilder.trim();
        if (trimmed.length > 0) {
            clean.push({ ...w, word: trimmed });
        }
    }
    if (clean.length === 0) return [];
    const fixed: AlignedWord[] = [];
    let current = clean[0];
    for (let i = 1; i < clean.length; i++) {
            const next = clean[i];
            const currText = current.word.trim();
            const nextText = next.word.trim();
            const isFragment = /['’]$/.test(currText) || /^['’]/.test(nextText) || /^['’]+$/.test(currText) || /^['’]+$/.test(nextText);
            const gap = next.start_s - current.end_s;
            if (isFragment && gap < 0.5) {
                current = { ...current, word: currText + nextText, end_s: next.end_s };
            } else {
                fixed.push(current);
                current = next;
            }
    }
    fixed.push(current);
    return fixed;
};

export const stripMetaTags = (text: string): string => {
    if (!text) return "";
    return text
        .replace(/\[[\s\S]*?\]/g, '')
        .replace(/\([\s\S]*?\)/g, '')
        .replace(/\{[\s\S]*?\}/g, '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
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
        const endsClause = /[.,;!?]$/.test(prevWord.word);
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
        if (!cleanWord) { currentGroup.push(wordObj); continue; }
        let bestMatchOffset = -1;
        const isLost = wordsSinceLastMatch > 4; 
        const MAX_LOOKAHEAD = isLost ? 1000 : 200; 
        const searchLimit = Math.min(tokens.length - tokenPtr, MAX_LOOKAHEAD);
        for (let lookahead = 0; lookahead < searchLimit; lookahead++) {
            const target = tokens[tokenPtr + lookahead];
            const isMatch = target.text === cleanWord || (!isLost && (target.text.includes(cleanWord) || cleanWord.includes(target.text)));
            if (isMatch) {
                let contextMatch = false;
                if (i + 1 < cleanAligned.length) {
                    const nextAudio = cleanStringForMatch(cleanAligned[i+1].word);
                    if (nextAudio) {
                            for (let offset = 1; offset <= 3; offset++) {
                                if (tokenPtr + lookahead + offset < tokens.length) {
                                    const nextToken = tokens[tokenPtr + lookahead + offset].text;
                                    if (nextToken === nextAudio || nextToken.includes(nextAudio) || nextAudio.includes(nextToken)) { contextMatch = true; break; }
                                }
                            }
                    } else { contextMatch = true; }
                }
                if (lookahead < 3 || contextMatch) { bestMatchOffset = lookahead; break; }
                if (isLost && !STOP_WORDS.has(cleanWord) && target.text === cleanWord) {
                        if (target.isLineStart || lookahead < 20) { bestMatchOffset = lookahead; break; }
                }
            }
        }
        if (bestMatchOffset !== -1) {
            const target = tokens[tokenPtr + bestMatchOffset];
            if (target.lineIndex > currentLineIndex) { if (currentGroup.length > 0) groups.push(currentGroup); currentGroup = []; currentLineIndex = target.lineIndex; }
            tokenPtr += bestMatchOffset + 1;
            wordsSinceLastMatch = 0; 
        } else { wordsSinceLastMatch++; }
        currentGroup.push(wordObj);
    }
    if (currentGroup.length > 0) groups.push(currentGroup);
    return groups;
};

/**
 * Uses Gemini to group a flat list of aligned words into logical lines 
 * based on the provided lyrics text structure.
 */
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
    return data.map((line: any[]) => line.map(item => ({
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
