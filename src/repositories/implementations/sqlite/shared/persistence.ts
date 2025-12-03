/**
 * IndexedDB persistence for SQLite database
 * Saves and loads the database binary to/from browser storage
 */

const DB_NAME = 'impact-flow-sqlite';
const STORE_NAME = 'database';
const DB_KEY = 'main';

/**
 * Open IndexedDB database
 */
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Save database binary to IndexedDB
 */
export async function saveToIndexedDB(data: Uint8Array): Promise<void> {
  const db = await openIndexedDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.put(data, DB_KEY);

    request.onerror = () => {
      reject(new Error('Failed to save database to IndexedDB'));
    };

    request.onsuccess = () => {
      resolve();
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Load database binary from IndexedDB
 * Returns null if no saved database exists
 */
export async function loadFromIndexedDB(): Promise<Uint8Array | null> {
  try {
    const db = await openIndexedDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.get(DB_KEY);

      request.onerror = () => {
        reject(new Error('Failed to load database from IndexedDB'));
      };

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? new Uint8Array(result) : null);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch {
    // IndexedDB not available or other error
    return null;
  }
}

/**
 * Clear saved database from IndexedDB
 */
export async function clearIndexedDB(): Promise<void> {
  const db = await openIndexedDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.delete(DB_KEY);

    request.onerror = () => {
      reject(new Error('Failed to clear database from IndexedDB'));
    };

    request.onsuccess = () => {
      resolve();
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}
