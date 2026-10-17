import { GoogleGenAI } from "@google/genai";
import { ParsedSunoOutput, AlignedWord, FileContext } from "../types";
import { GET_STRICT_OUTPUT_SUFFIX } from "../constants";

const withRetry = async <T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> => {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;
            const msg = error.message || "";
            if (msg.includes("503") || msg.includes("429") || msg.includes("overloaded") || msg.includes("quota")) {
                const delay = Math.pow(2, i) * 1000 + Math.random() * 500;
                console.warn(`Gemini API overloaded (503/429). Retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
                await new Promise(res => setTimeout(res, delay));
                continue;
            }
            throw error; 
        }
    }
    throw lastError;
};

export const generateSunoPrompt = async (
  userInput: string, 
  customApiKey?: string,
  systemInstruction?: string,
  geminiModel: string = "gemini-4-argon",
  contextFiles: FileContext[] = [],
  numTracks: number = 1
): Promise<ParsedSunoOutput[]> => {
  const apiKey = customApiKey || import.meta.env?.VITE_API_KEY; 
  const googleToken = localStorage.getItem('google_access_token');

  if (!apiKey && !googleToken) {
    throw new Error("API Key or Google Auth missing.");
  }

  const isOAuthToken = !apiKey && !!googleToken;
  const isVertex = localStorage.getItem('is_vertex_key') === 'true';

  // THE FIX: Intercept the naked URL and rewrite it to target us-central1 explicitly
  const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      let requestUrl = input instanceof Request ? input.url : input.toString();
      const headers = new Headers(init?.headers);

      if (isVertex && requestUrl.includes('publishers/google/models/')) {
          // Extract the model name and the API method (e.g., gemini-4-argon:generateContent)
          const urlParts = requestUrl.split('publishers/google/models/');
          const modelAndMethod = urlParts[1];
          
          // Rebuild the URL to target the GLOBAL endpoint for preview models
          // Note: No region prefix on aiplatform.googleapis.com, and location is 'global'
          requestUrl = `https://aiplatform.googleapis.com/v1beta1/publishers/google/models/${modelAndMethod}?key=${headers.get('x-goog-api-key')}`;
      }

      if (isOAuthToken) {
          headers.delete('x-goog-api-key');
          headers.set('Authorization', `Bearer ${googleToken}`);
      }

      return fetch(requestUrl, { ...init, headers });
  };
  
  const ai = new GoogleGenAI({ 
      apiKey: apiKey || "OAUTH", 
      vertexai: isVertex,
      httpOptions: { fetch: customFetch } 
  });

  if (!systemInstruction) {
      throw new Error("System Instruction is missing.");
  }

  const finalSystemInstruction = `${systemInstruction}\n\n${GET_STRICT_OUTPUT_SUFFIX(numTracks)}`;

  try {
    const parts: any[] = [];
    
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

    if (userInput) {
        parts.push({ text: `${userInput}\n\nPlease generate an album containing exactly ${numTracks} tracks based on this idea.` });
    } else if (contextFiles.length > 0) {
        parts.push({ text: `Generate a professional Suno AI album of exactly ${numTracks} tracks based on the provided context files.` });
    }

    const response = await withRetry(() => ai.models.generateContent({
      model: geminiModel,
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction: finalSystemInstruction,
        temperature: 1.0,
        thinkingConfig: {
          thinkingLevel: "LOW"
        },
      },
    }));

    const text = response.text || "";
    return parseMultipleResponses(text);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const msg = error.message || "Failed to generate prompt.";
    throw new Error(msg);
  } 
};

// --- (Parsing helpers remain exactly the same) ---
const parseMultipleResponses = (fullText: string): ParsedSunoOutput[] => {
  const trackSplits = fullText.split(/--- TRACK \d+ ---/i).filter(s => s.trim().length > 10);
  
  if (trackSplits.length === 0) {
    const allMatches = extractCodeBlocks(fullText);
    const results: ParsedSunoOutput[] = [];
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
    advancedParams: matches[3] || "", 
    vocalGender: "None",
    weirdness: 50,
    styleInfluence: 50,
    lyricsWithTags: cleanTrailingHyphens(matches[4] || ""),
    lyricsAlone: cleanTrailingHyphens(matches[5] || ""),
    fullResponse: rawText,
  };

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

// Update suggestVisualizerSettings with the exact same injected interceptor
export const suggestVisualizerSettings = async (
    customApiKey?: string,
    geminiModel: string = "gemini-3.8-flash",
    base64Image?: string,
    imageMimeType?: string
): Promise<{ font: string, activeColor: string, inactiveColor: string }> => {
    
    const apiKey = customApiKey || import.meta.env?.VITE_API_KEY;
    const googleToken = localStorage.getItem('google_access_token');
  
    if (!apiKey && !googleToken) {
      throw new Error("API Key or Google Auth missing.");
    }
  
    const isOAuthToken = !apiKey && !!googleToken;
    const isVertex = localStorage.getItem('is_vertex_key') === 'true';
  
    const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        let requestUrl = input instanceof Request ? input.url : input.toString();
        const headers = new Headers(init?.headers);
  
        if (isVertex && requestUrl.includes('publishers/google/models/')) {
            const urlParts = requestUrl.split('publishers/google/models/');
            const modelAndMethod = urlParts[1];
            requestUrl = `https://us-central1-aiplatform.googleapis.com/v1beta1/projects/90224269909/locations/us-central1/publishers/google/models/${modelAndMethod}`;
        }
  
        if (isOAuthToken) {
            headers.delete('x-goog-api-key');
            headers.set('Authorization', `Bearer ${googleToken}`);
        }
  
        return fetch(requestUrl, { ...init, headers });
    };
  
    const ai = new GoogleGenAI({ 
        apiKey: apiKey || "OAUTH", 
        vertexai: isVertex,
        httpOptions: { fetch: customFetch }
    });
  
    const prompt = `Analyze this image (if provided) and suggest a font, active color, and inactive color for a lyric visualizer overlay.
    If no image is provided, suggest a cool combination.
    Format your response EXACTLY as a JSON object:
    {
        "font": "one of: Inter, sans-serif | Montserrat, sans-serif | Roboto, sans-serif | Lora, serif | Playfair Display, serif | Merriweather, serif | Courier New, monospace | Fira Code, monospace | Space Mono, monospace | Pacifico, cursive | Caveat, cursive | or any standard web font",
        "activeColor": "#HEX",
        "inactiveColor": "#HEX"
    }
    Make sure the active color pops against the background, and the inactive color is complementary but less prominent. Do not include markdown codeblocks around the JSON.`;
  
    try {
        const parts: any[] = [{ text: prompt }];
        if (base64Image && imageMimeType) {
            const b64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
            parts.push({
                inlineData: {
                    mimeType: imageMimeType,
                    data: b64Data
                }
            });
        }
  
        const response = await withRetry(() => ai.models.generateContent({
            model: geminiModel,
            contents: [{ role: 'user', parts }],
            config: {
                temperature: 0.7,
                responseMimeType: "application/json"
            }
        }));
  
        const text = response.text || "{}";
        return JSON.parse(text);
    } catch (e: any) {
        console.error("Gemini suggestion error:", e);
        throw new Error(e.message || "Failed to generate suggestions.");
    }
};
