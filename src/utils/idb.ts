import { SunoClip, SunoWorkspace, SunoPersona } from '../types';

export const DB_NAME = 'SunoArchitectDB';
export const DB_VERSION = 3;

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

export const openDB = (): Promise<IDBDatabase> => {
    if (dbInstance) return Promise.resolve(dbInstance);
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        let needsMigration = false;

        request.onupgradeneeded = (e) => {
            const db = (e.target as IDBOpenDBRequest).result;
            const oldVersion = e.oldVersion;

            // Only users on version 1 (the original schema) require migration
            if (oldVersion < 2) {
                needsMigration = true;
            }

            // Key-value store for app settings
            if (!db.objectStoreNames.contains('store')) {
                db.createObjectStore('store');
            }

            // Clean, indexed clips store
            if (!db.objectStoreNames.contains('clips')) {
                const clipsStore = db.createObjectStore('clips', { keyPath: 'id' });
                clipsStore.createIndex('workspaceId', 'workspaceId', { unique: false });
                clipsStore.createIndex('created_at', 'created_at', { unique: false });
            }

            // Dedicated workspaces store
            if (!db.objectStoreNames.contains('workspaces')) {
                db.createObjectStore('workspaces', { keyPath: 'id' });
            }

            // Dedicated personas store
            if (!db.objectStoreNames.contains('personas')) {
                db.createObjectStore('personas', { keyPath: 'id' });
            }
        };

        request.onsuccess = async (e) => {
            const db = (e.target as IDBOpenDBRequest).result;
            dbInstance = db;
            db.onclose = () => {
                dbInstance = null;
                dbPromise = null;
            };
            db.onversionchange = () => {
                try { db.close(); } catch (_) {}
                dbInstance = null;
                dbPromise = null;
            };
            if (needsMigration) {
                try {
                    await migrateFromOriginalSchema(db);
                } catch (err) {
                    console.warn('Database migration warning:', err);
                }
            }
            resolve(db);
        };

        request.onerror = () => {
            dbInstance = null;
            dbPromise = null;
            reject(request.error);
        };
    });

    return dbPromise;
};

/**
 * Clean one-time migration for users coming from the original schema (version 1)
 * Migrates clips from 'store'['suno_history'] or localStorage['suno_history'] into 'clips'
 */
const migrateFromOriginalSchema = (db: IDBDatabase): Promise<void> => {
    return new Promise((resolve) => {
        try {
            if (!db.objectStoreNames.contains('store') || !db.objectStoreNames.contains('clips')) {
                return resolve();
            }

            const tx = db.transaction(['store', 'clips'], 'readwrite');
            const store = tx.objectStore('store');
            const clipsStore = tx.objectStore('clips');

            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
            tx.onabort = () => resolve();

            const historyReq = store.get('suno_history');
            historyReq.onsuccess = () => {
                let oldClips = historyReq.result;

                // Fallback to localStorage if store was empty
                if (!Array.isArray(oldClips) || oldClips.length === 0) {
                    try {
                        const ls = localStorage.getItem('suno_history');
                        if (ls) oldClips = JSON.parse(ls);
                    } catch (_) {}
                }

                if (Array.isArray(oldClips) && oldClips.length > 0) {
                    oldClips.forEach((clip: any) => {
                        if (!clip || !clip.id) return;
                        const isDraft = typeof clip.id === 'string' && clip.id.startsWith('draft_');
                        clip.workspaceId = clip.workspaceId || clip.project_id || (isDraft ? 'drafts' : 'default');
                        clipsStore.put(clip);
                    });
                }

                // Cleanup legacy key
                try {
                    store.delete('suno_history');
                    localStorage.removeItem('suno_history');
                } catch (_) {}
            };
        } catch (e) {
            console.error('Migration error', e);
            resolve();
        }
    });
};

/**
 * Fetch all clips sorted by created_at desc
 */
export const getAllClips = async (): Promise<SunoClip[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        try {
            const tx = db.transaction('clips', 'readonly');
            const store = tx.objectStore('clips');
            const request = store.getAll();

            request.onsuccess = () => {
                const results: SunoClip[] = request.result || [];
                results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                resolve(results);
            };
            request.onerror = () => reject(request.error);
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Fetch clips for a specific workspace using the workspaceId index
 */
export const getClipsByWorkspace = async (workspaceId: string): Promise<SunoClip[]> => {
    if (!workspaceId || workspaceId === 'all') {
        return getAllClips();
    }

    const db = await openDB();
    return new Promise((resolve, reject) => {
        try {
            const tx = db.transaction('clips', 'readonly');
            const store = tx.objectStore('clips');
            const index = store.index('workspaceId');
            const request = index.getAll(workspaceId);

            request.onsuccess = () => {
                const results: SunoClip[] = request.result || [];
                results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                resolve(results);
            };
            request.onerror = () => reject(request.error);
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Save or update a single clip
 */
export const saveClip = async (clip: SunoClip): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        try {
            const tx = db.transaction('clips', 'readwrite');
            const store = tx.objectStore('clips');
            const request = store.put(clip);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        } catch (err: any) {
            if (err?.name === 'InvalidStateError') {
                dbInstance = null;
                dbPromise = null;
            }
            reject(err);
        }
    });
};

/**
 * Batch save clips efficiently in a single transaction
 */
export const saveClips = async (clips: SunoClip[]): Promise<void> => {
    if (!clips || clips.length === 0) return;
    const db = await openDB();
    return new Promise((resolve, reject) => {
        try {
            const tx = db.transaction('clips', 'readwrite');
            const store = tx.objectStore('clips');

            clips.forEach((clip) => {
                if (clip && clip.id) {
                    store.put(clip);
                }
            });

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        } catch (err: any) {
            if (err?.name === 'InvalidStateError') {
                dbInstance = null;
                dbPromise = null;
            }
            reject(err);
        }
    });
};

/**
 * Delete a clip by ID
 */
export const deleteClip = async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        try {
            const tx = db.transaction('clips', 'readwrite');
            const store = tx.objectStore('clips');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Workspaces persistence
 */
export const getAllWorkspaces = async (): Promise<SunoWorkspace[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        try {
            const tx = db.transaction('workspaces', 'readonly');
            const store = tx.objectStore('workspaces');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        } catch (err) {
            reject(err);
        }
    });
};

export const saveWorkspaces = async (workspaces: SunoWorkspace[]): Promise<void> => {
    if (!workspaces || workspaces.length === 0) return;
    const db = await openDB();
    return new Promise((resolve, reject) => {
        try {
            const tx = db.transaction('workspaces', 'readwrite');
            const store = tx.objectStore('workspaces');

            workspaces.forEach((w) => {
                if (w && w.id) {
                    store.put(w);
                }
            });

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Personas persistence
 */
export const getAllPersonas = async (): Promise<SunoPersona[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        try {
            if (!db.objectStoreNames.contains('personas')) {
                return resolve([]);
            }
            const tx = db.transaction('personas', 'readonly');
            const store = tx.objectStore('personas');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        } catch (err: any) {
            if (err?.name === 'InvalidStateError') {
                dbInstance = null;
                dbPromise = null;
            }
            reject(err);
        }
    });
};

export const savePersonas = async (personas: SunoPersona[]): Promise<void> => {
    if (!personas || personas.length === 0) return;
    try {
        localStorage.setItem('suno_personas', JSON.stringify(personas));
    } catch (_) {}
    const db = await openDB();
    return new Promise((resolve, reject) => {
        try {
            if (!db.objectStoreNames.contains('personas')) {
                return resolve();
            }
            const tx = db.transaction('personas', 'readwrite');
            const store = tx.objectStore('personas');

            personas.forEach((p) => {
                if (p && p.id) {
                    store.put(p);
                }
            });

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        } catch (err: any) {
            if (err?.name === 'InvalidStateError') {
                dbInstance = null;
                dbPromise = null;
            }
            reject(err);
        }
    });
};

/**
 * Key-value store helper
 */
export const get = async (key: string): Promise<any> => {
    if (key === 'suno_history') {
        return getAllClips();
    }

    const db = await openDB();
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction('store', 'readonly');
            const store = transaction.objectStore('store');
            const getRequest = store.get(key);
            getRequest.onsuccess = () => resolve(getRequest.result);
            getRequest.onerror = () => reject(getRequest.error);
        } catch (err) {
            reject(err);
        }
    });
};

export const set = async (key: string, value: any): Promise<any> => {
    if (key === 'suno_history' && Array.isArray(value)) {
        await saveClips(value);
        return value;
    }

    const db = await openDB();
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction('store', 'readwrite');
            const store = transaction.objectStore('store');
            const putRequest = store.put(value, key);
            putRequest.onsuccess = () => resolve(putRequest.result);
            putRequest.onerror = () => reject(putRequest.error);
        } catch (err) {
            reject(err);
        }
    });
};
