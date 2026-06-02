import { ParsedSunoOutput } from "../types";

export const triggerSunoGeneration = async (
  data: ParsedSunoOutput, 
  cookie: string,
  model: string = "chirp-bluejay"
): Promise<any> => {
  if (!cookie) {
    throw new Error("Suno Cookie/Token is missing.");
  }

  // Use the proxy endpoint to avoid CORS issues and manage headers
  const API_ENDPOINT = "/api/generate/v2/";
  
  // Normalize 0-100 to 0.0-1.0
  const weirdness = typeof data.weirdness === 'number' ? data.weirdness / 100 : 0.5;
  const styleWeight = typeof data.styleInfluence === 'number' ? data.styleInfluence / 100 : 0.5;

  // Construct payload for Custom Mode
  const payload = {
    prompt: data.lyricsWithTags || "",
    tags: data.style || "",
    negative_tags: data.excludeStyles || "",
    title: data.title || "Suno Architect Generation",
    make_instrumental: !data.lyricsWithTags && !!data.style,
    mv: model, // Dynamic Model selection
    continue_clip_id: null,
    continue_at: null,
    generation_type: "TEXT",
    metadata: {
        create_mode: "custom",
        control_sliders: {
            weirdness_constraint: weirdness,
            style_weight: styleWeight
        },
        can_control_sliders: [
            "weirdness_constraint",
            "style_weight"
        ]
    }
  };

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Handle Authentication
    const trimmedCookie = cookie.trim();
    
    // Check if it's a Bearer token (JWT usually starts with ey...)
    if (trimmedCookie.startsWith("ey")) {
        headers["Authorization"] = `Bearer ${trimmedCookie}`;
    } else {
        // If it's not a Bearer token (e.g. session cookie), send as X-Suno-Cookie
        // The proxy will convert this to the Cookie header
        headers["X-Suno-Cookie"] = trimmedCookie;
    }

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Status ${response.status}`;
      
      try {
          const jsonErr = JSON.parse(errorText);
          if (jsonErr.detail) errorMessage = jsonErr.detail;
          if (jsonErr.message) errorMessage = jsonErr.message;
          if (jsonErr.error) errorMessage = jsonErr.error;
      } catch (e) {
          // Fallback if not JSON
          const cleanText = errorText.replace(/<[^>]*>?/gm, '').substring(0, 200);
          if (cleanText) errorMessage = cleanText;
      }
      throw new Error(`Suno API Failed: ${errorMessage}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Suno Proxy API Error:", error);
    throw error;
  }
};

export const updateSunoMetadata = async (clipId: string, data: ParsedSunoOutput, cookie: string): Promise<any> => {
    if (!cookie) throw new Error("No cookie provided");

    // Point to the metadata proxy
    const PROXY_ENDPOINT = `/api/gen/${clipId}/set_metadata/`;
    
    // Construct payload
    const payload = {
      "title": data.title || "Untitled",
      "lyrics": data.lyricsAlone || "", // Use clean lyrics
      "caption": "",
      "caption_mentions": {
        "user_mentions": []
      },
      "remove_image_cover": false,
      "remove_video_cover": false
    };

    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        const trimmedCookie = cookie.trim();
        if (trimmedCookie.startsWith("ey")) {
             headers["Authorization"] = `Bearer ${trimmedCookie}`;
        } else {
             headers["X-Suno-Cookie"] = trimmedCookie;
        }

        const response = await fetch(PROXY_ENDPOINT, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
             const errorText = await response.text();
             console.warn("Metadata update failed for " + clipId, errorText);
             return null;
        }
        
        return await response.json();
    } catch (e) {
        console.error("Failed to update metadata", e);
        return null; 
    }
};
