
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
  const googleToken = localStorage.getItem('google_access_token');

  if (!apiKey && !googleToken) {
    throw new Error("API Key or Google Auth missing.");
  }

  const isOAuthToken = !apiKey && !!googleToken;

  let ai;
  const originalFetch = window.fetch;

  if (isOAuthToken) {
      window.fetch = async (url, init) => {
         const headers = new Headers(init?.headers);
         headers.delete('x-goog-api-key');
         headers.set('Authorization', `Bearer ${googleToken}`);
         return originalFetch(url, { ...init, headers });
      };
      
      ai = new GoogleGenAI({ apiKey: "OAUTH" });
  } else {
      ai = new GoogleGenAI({ apiKey: apiKey as string });
  }

  if (!systemInstruction) {
      throw new Error("System Instruction is missing.");
  }

  // Enforce strict output format for the requested number of tracks
  const finalSystemInstruction = `${systemInstruction}\n\n${GET_STRICT_OUTPUT_SUFFIX(numTracks)}`;

  try {
    const parts: any[] = [];
    
    // Add multiple files to context
    let hasAudio = false;
    let hasContextDocs = false;

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
        } else {
            hasContextDocs = true;
        }
    });

    // Add prompt hints based on content
    if (hasAudio) {
        parts.push({ text: `[CRITICAL INSTRUCTION: Audio files provided are STYLE REFERENCES. Analyze their tempo, instrumentation, genre, vocal style, and production characteristics. Use these details to generate the 'Style' and 'Advanced Parameters' for the songs.]` });
    }

    if (hasContextDocs) {
        parts.push({ text: `[CRITICAL INSTRUCTION: Text/PDF/Image documents provided are CONTEXT. Analyze their content, themes, mood, and narrative to generate the 'Lyrics' and 'Title' for the songs.]` });
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
  } finally {
    if (isOAuthToken) {
        window.fetch = originalFetch;
    }
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
