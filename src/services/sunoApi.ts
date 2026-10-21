import { LyricAlignmentResponse, SunoClip, SunoWorkspace, ParsedSunoOutput, SunoPersona } from "../types";
import { stripMetaTags } from "../utils/lyrics";

export const DRAFTS_WORKSPACE: SunoWorkspace = {
    id: 'drafts',
    name: 'Drafts',
    description: 'Phantom workspace for local lyric drafts and ideas',
    clip_count: 0,
    isPhantom: true
};

/**
 * Maps raw Suno API clip payloads or cached records into strongly-typed SunoClip models.
 * Properly attributes project/workspace IDs.
 */
export const mapSunoClip = (clip: any, workspaceId?: string): SunoClip => {
    const metadata = clip.metadata || {};
    const tags = metadata.tags || '';
    const prompt = metadata.prompt || '';
    const title = clip.title || 'Untitled';

    const originalData: ParsedSunoOutput = {
        style: tags,
        title: title,
        excludeStyles: metadata.negative_tags || '',
        advancedParams: '',
        vocalGender: '',
        weirdness: metadata.control_sliders?.weirdness_constraint ? Math.round(metadata.control_sliders.weirdness_constraint * 100) : 50,
        styleInfluence: metadata.control_sliders?.style_weight ? Math.round(metadata.control_sliders.style_weight * 100) : 50,
        lyricsWithTags: prompt,
        lyricsAlone: stripMetaTags(prompt),
        fullResponse: ''
    };

    const isDraft = typeof clip.id === 'string' && clip.id.startsWith('draft_');
    const assignedWorkspace = (workspaceId && workspaceId !== 'all')
        ? workspaceId
        : (clip.project_id || clip.workspace_id || clip.workspaceId || (isDraft ? 'drafts' : 'default'));

    return {
        id: clip.id,
        title: title,
        created_at: clip.created_at,
        model_name: clip.model_name || 'unknown',
        workspaceId: assignedWorkspace,
        imageUrl: clip.image_url,
        imageLargeUrl: clip.image_large_url,
        explicit: clip.explicit,
        metadata: {
            tags: tags,
            prompt: prompt,
            negative_tags: metadata.negative_tags,
            duration: metadata.duration,
            max_bpm: metadata.max_bpm,
            min_bpm: metadata.min_bpm,
            avg_bpm: metadata.avg_bpm,
            key: metadata.key,
        },
        originalData: originalData
    };
};

/**
 * Standardizes authentication headers for Suno API requests.
 * Handles:
 * - Bearer prefix presence or absence
 * - Outer quotes from copy-pasting
 * - Raw __session= cookie values
 */
export const formatAuthHeader = (cookie: string): Record<string, string> => {
    let clean = (cookie || '').trim();

    // Remove surrounding quotes if pasted from JSON or quotes
    if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
        clean = clean.slice(1, -1).trim();
    }

    // Extract __session value if a full cookie string was pasted
    if (clean.includes('__session=')) {
        const match = clean.match(/__session=([^;]+)/);
        if (match && match[1]) {
            clean = match[1].trim();
        }
    }

    // Strip "Bearer " prefix if already present so we don't send "Bearer Bearer ..."
    if (clean.toLowerCase().startsWith('bearer ')) {
        clean = clean.substring(7).trim();
    }

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (clean) {
        headers["Authorization"] = `Bearer ${clean}`;
        headers["X-Suno-Cookie"] = clean;
    }

    return headers;
};

export interface SunoCustomModelOption {
    label: string;
    value: string;
}

export interface SunoBillingInfo {
    credits: number;
    customModels: SunoCustomModelOption[];
    allModels?: any[];
}

export const getSunoBillingInfo = async (cookie: string): Promise<SunoBillingInfo> => {
    if (!cookie) throw new Error("No cookie provided");
    
    // Direct Suno billing endpoint
    const BILLING_ENDPOINT = "/api/billing/info/";
    
    try {
        const headers = formatAuthHeader(cookie);

        const response = await fetch(BILLING_ENDPOINT, {
            method: "GET",
            headers: headers
        });

        if (response.status === 401) {
            throw new Error("401");
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch billing info. Status: ${response.status}`);
        }

        const data = await response.json();
        const credits = typeof data.total_credits_left === 'number' ? data.total_credits_left : 0;

        const rawModels: any[] = Array.isArray(data.models) ? data.models : [];
        const customModels: SunoCustomModelOption[] = rawModels
            .filter((m: any) => Array.isArray(m.badges) && m.badges.includes('custom') && m.name && m.external_key)
            .map((m: any) => ({
                label: m.name.startsWith('Custom-') ? m.name : `Custom-${m.name}`,
                value: m.external_key
            }));

        // Persist discovered custom models to localStorage
        try {
            localStorage.setItem('suno_custom_models', JSON.stringify(customModels));
        } catch (_) {}

        return {
            credits,
            customModels,
            allModels: rawModels
        };
    } catch (error: any) {
        if (error.message === '401') {
            console.warn("Suno token expired or unauthorized (401). Please update in Suno API Settings.");
        } else {
            console.error("Failed to get billing info:", error);
        }
        throw error;
    }
};

export const getSunoCredits = async (cookie: string): Promise<number> => {
    const info = await getSunoBillingInfo(cookie);
    return info.credits;
};

/**
 * Fetches workspaces/projects from Suno API.
 * Endpoint: /api/project/me?page=1&sort=max_created_at_last_updated_clip&show_trashed=false&exclude_shared=false
 * Handles pagination to retrieve all available projects.
 */
export const getSunoWorkspaces = async (cookie: string): Promise<SunoWorkspace[]> => {
    if (!cookie) throw new Error("No cookie provided");

    const headers = formatAuthHeader(cookie);

    let allWorkspaces: SunoWorkspace[] = [];
    let page = 1;
    let totalResults = 0;
    const maxPages = 20;

    try {
        while (page <= maxPages) {
            const endpoint = `/api/project/me?page=${page}&sort=max_created_at_last_updated_clip&show_trashed=false&exclude_shared=false`;
            const response = await fetch(endpoint, {
                method: "GET",
                headers: headers
            });

            if (response.status === 401) {
                console.warn("Suno workspaces request returned 401 Unauthorized.");
                break;
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch workspaces. Status: ${response.status}`);
            }

            const data = await response.json();
            const projects: SunoWorkspace[] = data.projects || [];
            totalResults = data.num_total_results || 0;

            if (projects.length === 0) break;

            allWorkspaces.push(...projects);

            if (allWorkspaces.length >= totalResults) {
                break;
            }
            page++;
        }

        return allWorkspaces;
    } catch (error) {
        console.warn("Failed to get Suno workspaces:", error);
        return allWorkspaces;
    }
};

/**
 * Fetches personas from Suno API.
 * Endpoint: /api/persona/get-personas/?page=1
 * Iterates through all pages until all personas are pulled.
 */
export const getSunoPersonas = async (cookie: string): Promise<SunoPersona[]> => {
    if (!cookie) return [];

    const headers = formatAuthHeader(cookie);
    const allPersonas: SunoPersona[] = [];
    const seenIds = new Set<string>();
    let page = 1;
    const maxPages = 50;

    try {
        while (page <= maxPages) {
            const endpoint = `/api/persona/get-personas/?page=${page}`;
            const response = await fetch(endpoint, {
                method: "GET",
                headers: headers
            });

            if (response.status === 401) {
                console.warn("Suno personas request returned 401 Unauthorized.");
                break;
            }

            if (!response.ok) {
                if (response.status === 404) break;
                throw new Error(`Failed to fetch personas: ${response.status}`);
            }

            const data = await response.json();
            const list = Array.isArray(data) 
                ? data 
                : (data.personas || data.results || data.data || []);

            if (!list || list.length === 0) {
                break;
            }

            let newCount = 0;
            for (const item of list) {
                if (item && item.id && !seenIds.has(item.id)) {
                    seenIds.add(item.id);
                    allPersonas.push({
                        id: item.id,
                        name: item.name || 'Untitled Persona',
                        description: item.description || '',
                        image_s3_id: item.image_s3_id || ''
                    });
                    newCount++;
                }
            }

            if (newCount === 0) {
                break;
            }

            if (data && typeof data === 'object' && !Array.isArray(data)) {
                if (data.has_more === false || data.next_page === null) {
                    break;
                }
            }

            page++;
        }
    } catch (error) {
        console.warn("Failed to get Suno personas:", error);
    }

    return allPersonas;
};

export const getSunoFeed = async (
    cookie: string, 
    limit: number = 20, 
    cursor: string | null = null, 
    searchText?: string,
    workspaceId?: string | null
): Promise<any> => {
    if (!cookie) throw new Error("No cookie provided");

    // Phantom workspace 'drafts' is purely local
    if (workspaceId === 'drafts') {
        return { clips: [], has_more: false };
    }

    const FEED_ENDPOINT = `/api/feed/v3`;

    try {
        const headers = formatAuthHeader(cookie);

        const body: any = {
            "cursor": cursor,
            "limit": limit,
            "filters": {
                "disliked": "False",
                "fullSong": "True",
                "trashed": "False",
                "stem": { "presence": "False" }
            }
        };

        if (searchText && searchText.trim()) {
            body.filters.searchText = searchText.trim();
        }

        // Apply workspace filter according to Suno API specification
        if (workspaceId && workspaceId !== 'all') {
            body.filters.workspace = {
                "presence": "True",
                "workspaceId": workspaceId
            };
        }

        const response = await fetch(FEED_ENDPOINT, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body),
        });

        if (response.status === 429) {
            throw new Error("429");
        }

        if (response.status === 401) {
            throw new Error("401");
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch feed. Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const getLyricAlignment = async (songId: string, cookie: string): Promise<any> => {
    if (!cookie) throw new Error("No cookie provided");

    const ENDPOINT = `/api/gen/${songId}/aligned_lyrics/v2`;

    try {
        const headers = formatAuthHeader(cookie);

        const response = await fetch(ENDPOINT, {
            method: "GET",
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch alignment. Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Failed to get lyric alignment:`, error);
        throw error;
    }
};

export const getSunoClip = async (clipId: string, cookie: string): Promise<any> => {
    if (!cookie) throw new Error("No cookie provided");

    const ENDPOINT = `/api/clip/${clipId}`;

    try {
        const headers = formatAuthHeader(cookie);

        const response = await fetch(ENDPOINT, {
            method: "GET",
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch clip. Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to get suno clip:", error);
        throw error;
    }
};
