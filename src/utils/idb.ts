export const get = (key: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('SunoArchitectDB', 1);
        request.onupgradeneeded = (e) => {
            const db = (e.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('store')) {
                db.createObjectStore('store');
            }
        };
        request.onsuccess = (e) => {
            const db = (e.target as IDBOpenDBRequest).result;
            // It's possible that upgrade wasn't called but store doesn't exist
            // if another tab created it differently. But for version 1, this is fine.
            try {
                const transaction = db.transaction('store', 'readonly');
                const store = transaction.objectStore('store');
                const getRequest = store.get(key);
                getRequest.onsuccess = () => resolve(getRequest.result);
                getRequest.onerror = () => reject(getRequest.error);
            } catch (err) {
                reject(err);
            }
        };
        request.onerror = () => reject(request.error);
    });
};

export const set = (key: string, value: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('SunoArchitectDB', 1);
        request.onupgradeneeded = (e) => {
            const db = (e.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('store')) {
                db.createObjectStore('store');
            }
        };
        request.onsuccess = (e) => {
            const db = (e.target as IDBOpenDBRequest).result;
            try {
                const transaction = db.transaction('store', 'readwrite');
                const store = transaction.objectStore('store');
                const putRequest = store.put(value, key);
                putRequest.onsuccess = () => resolve(putRequest.result);
                putRequest.onerror = () => reject(putRequest.error);
            } catch (err) {
                reject(err);
            }
        };
        request.onerror = () => reject(request.error);
    });
};
