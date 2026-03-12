(() => {
    const DB_NAME = 'MancheteExpressDB';
    const STORE_NAME = 'history';
    const DB_VERSION = 2;
    const MAX_HISTORY_ITEMS = 10;

    let dbPromise = null;

    function getDB() {
        if (!dbPromise) {
            dbPromise = new Promise((resolve, reject) => {
                const request = indexedDB.open(DB_NAME, DB_VERSION);

                request.onerror = (event) => {
                    console.error("Database error: ", event.target.error);
                    reject(event.target.error);
                };

                request.onsuccess = (event) => {
                    resolve(event.target.result);
                };

                request.onupgradesneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        // Create object store with auto-incrementing key, also index by timestamp
                        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                        store.createIndex('timestamp', 'timestamp', { unique: false });
                    }
                };
            });
        }
        return dbPromise;
    }

    async function saveStateToHistory(state) {
        try {
            const db = await getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);

                const itemToSave = {
                    ...state,
                    timestamp: Date.now()
                };

                // Omit baseImageElement as it's a DOM node that can't be cloned
                delete itemToSave.baseImageElement;
                delete itemToSave.feedback;
                delete itemToSave.showExportModal;
                delete itemToSave.croppingFormatId;

                const addRequest = store.add(itemToSave);

                addRequest.onsuccess = () => {
                   // After adding, cleanly enforce limits
                   enforceHistoryLimit(store);
                };

                transaction.oncomplete = () => {
                    resolve();
                };

                transaction.onerror = (event) => {
                    reject(event.target.error);
                };
            });
        } catch (e) {
            console.error("Failed to save to history:", e);
        }
    }

    function enforceHistoryLimit(store) {
        // We use a cursor to count and delete oldest if necessary
        const countRequest = store.count();
        countRequest.onsuccess = () => {
            if (countRequest.result > MAX_HISTORY_ITEMS) {
                const itemsToDelete = countRequest.result - MAX_HISTORY_ITEMS;
                
                // Open cursor sorted by timestamp ascending (oldest first)
                // Actually the default traversal is by primary key, which is auto-incremented, 
                // so oldest first anyway.
                const cursorRequest = store.openCursor();
                let deletedCount = 0;

                cursorRequest.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor && deletedCount < itemsToDelete) {
                        cursor.delete();
                        deletedCount++;
                        cursor.continue();
                    }
                };
            }
        };
    }

    async function getHistory() {
        try {
            const db = await getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                
                // Use a cursor to get items reverse-chronologically (newest first)
                const items = [];
                const request = store.openCursor(null, 'prev'); // 'prev' goes backwards

                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        items.push({
                            id: cursor.value.id,
                            timestamp: cursor.value.timestamp,
                            slug: cursor.value.slug,
                            templateId: cursor.value.templateId,
                            headlines: cursor.value.headlines,
                            // we don't return the baseImage string here to save memory in the list view unless requested, 
                            // wait, let's keep it simple and just return it. 
                            state: cursor.value
                        });
                        cursor.continue();
                    } else {
                        resolve(items);
                    }
                };

                request.onerror = (event) => reject(event.target.error);
            });
        } catch (e) {
            console.error("Failed to fetch history:", e);
            return [];
        }
    }

    async function getHistoryItem(id) {
        try {
            const db = await getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.get(id);
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = (event) => reject(event.target.error);
            });
        } catch (e) {
             console.error("Failed to fetch history item:", e);
             return null;
        }
    }

    // --- GAMIFICATION / STATS ---
    function getStats() {
        const statsStr = localStorage.getItem('mancheteExpress_stats');
        if (statsStr) {
            try {
                return JSON.parse(statsStr);
            } catch (e) {
                console.error("Erro ao ler estatísticas", e);
            }
        }
        return { artsGenerated: 0, timeSavedMinutes: 0 };
    }

    function incrementStats() {
        const stats = getStats();
        stats.artsGenerated += 1;
        stats.timeSavedMinutes += 10; // Assume 10 mins saved per art
        localStorage.setItem('mancheteExpress_stats', JSON.stringify(stats));
        return stats;
    }

    window.historyService = {
        saveStateToHistory,
        getHistory,
        getHistoryItem,
        getStats,
        incrementStats
    };

})();
