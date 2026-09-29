
import { LyricAlignmentResponse } from "../types";

export const getSunoCredits = async (cookie: string): Promise<number> => {
    if (!cookie) throw new Error("No cookie provided");
    
    // Direct Suno billing endpoint
    const BILLING_ENDPOINT = "/api/billing/info/";
    
    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        const trimmedCookie = cookie.trim();
        headers["Authorization"] = `Bearer ${trimmedCookie}`;

        const response = await fetch(BILLING_ENDPOINT, {
            method: "GET",
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch credits. Status: ${response.status}`);
        }

        const data = await response.json();
        // Return total_credits_left or fallback to 0
        return typeof data.total_credits_left === 'number' ? data.total_credits_left : 0;
    } catch (error) {
        console.error("Failed to get credits:", error);
        throw error;
    }
};

export const getSunoFeed = async (
    cookie: string, 
    limit: number = 20, 
    cursor: string | null = null, 
    searchText?: string
): Promise<any> => {
    if (!cookie) throw new Error("No cookie provided");

    const FEED_ENDPOINT = `/api/feed/v3`;

    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        const trimmedCookie = cookie.trim();
        headers["Authorization"] = `Bearer ${trimmedCookie}`;

        const body: any = {
            "cursor": cursor,
            "limit": limit,
            "filters": {
                "disliked": "False",
                "fullSong": "True",
                "trashed": "False",
                "fromStudioProject": { "presence": "False" },
                "stem": { "presence": "False" }
            }
        };

        if (searchText && searchText.trim()) {
            body.filters.searchText = searchText.trim();
        }

        const response = await fetch(FEED_ENDPOINT, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body),
        });

        if (response.status === 429) {
            throw new Error("429");
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch feed. Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        // console.error("Failed to get suno feed:", error);
        throw error;
    }
};

export const getLyricAlignment = async (songId: string, cookie: string, useV3: boolean = false): Promise<any> => {
    if (!cookie) throw new Error("No cookie provided");

    const version = useV3 ? 'v3' : 'v2';
    const ENDPOINT = `/api/gen/${songId}/aligned_lyrics/${version}`;

    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        const trimmedCookie = cookie.trim();
        headers["Authorization"] = `Bearer ${trimmedCookie}`;

        const fetchOnce = async () => {
            const response = await fetch(ENDPOINT, {
                method: "GET",
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch alignment. Status: ${response.status}`);
            }

            return await response.json();
        };

        if (useV3) {
            let data = await fetchOnce();
            let retries = 0;
            while (data.state !== "complete" && retries < 60) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                data = await fetchOnce();
                retries++;
            }
            if (data.state !== "complete") {
                throw new Error("Polling timed out for v3 lyrics");
            }
            return data;
        } else {
            return await fetchOnce();
        }
    } catch (error) {
        console.error(`Failed to get lyric alignment (${version}):`, error);
        throw error;
    }
};

export const getSunoClip = async (clipId: string, cookie: string): Promise<any> => {
    if (!cookie) throw new Error("No cookie provided");

    const ENDPOINT = `/api/clip/${clipId}`;

    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        const trimmedCookie = cookie.trim();
        headers["Authorization"] = `Bearer ${trimmedCookie}`;

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
