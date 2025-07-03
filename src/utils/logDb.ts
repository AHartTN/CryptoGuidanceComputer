// logDb.ts - Simple IndexedDB wrapper for log storage

const DB_NAME = 'DSKYLogsDB';
const STORE_NAME = 'logs';
const DB_VERSION = 1;

export interface LogDbEntry {
  id: string;
  timestamp: number;
  level: number;
  category: string;
  message: string;
  metadata?: any;
  stack?: string;
  correlationId?: string;
}

function getDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function addLogToDb(entry: LogDbEntry) {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).put(entry);
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getLogsFromDb(limit = 200): Promise<LogDbEntry[]> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const logs: LogDbEntry[] = [];
    const store = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME);
    const req = store.openCursor(null, 'prev');
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor && logs.length < limit) {
        logs.push(cursor.value);
        cursor.continue();
      } else {
        resolve(logs);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function clearLogsDb() {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).clear();
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
