// Armazena imagens dos slides no IndexedDB para manter localStorage leve.
(() => {
const DB_NAME = 'MancheteExpressImagesDB';
const STORE_NAME = 'slideImages';
const DB_VERSION = 1;
let dbPromise = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = (event) => reject(event.target.error);
            request.onsuccess = (event) => resolve(event.target.result);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
            };
        });
    }
    return dbPromise;
}

async function withStore(mode, callback) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], mode);
        const store = transaction.objectStore(STORE_NAME);
        const result = callback(store);
        transaction.oncomplete = () => resolve(result);
        transaction.onerror = (event) => reject(event.target.error);
    });
}

function requestToPromise(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

async function saveSlideImage(slideId, dataUrl) {
    if (!slideId || !dataUrl) return;
    await withStore('readwrite', (store) => store.put(dataUrl, slideId));
}

async function getSlideImage(slideId) {
    if (!slideId) return '';
    const db = await getDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    return requestToPromise(transaction.objectStore(STORE_NAME).get(slideId));
}

async function deleteMissingImages(activeSlideIds) {
    const keep = new Set(activeSlideIds);
    await withStore('readwrite', (store) => {
        const request = store.openCursor();
        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (!cursor) return;
            if (!keep.has(cursor.key)) cursor.delete();
            cursor.continue();
        };
        return request;
    });
}

window.imageStore = { saveSlideImage, getSlideImage, deleteMissingImages };
})();
