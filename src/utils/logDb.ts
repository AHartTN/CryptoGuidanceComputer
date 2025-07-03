/**
 * IndexedDB utility for logging DSKY application events and errors.
 *
 * @file logDb.ts
 */

/**
 * Log entry structure for IndexedDB log storage.
 */
export interface LogDbEntry {
  id: string;
  timestamp: number;
  level: number;
  category: string;
  message: string;
  metadata?: Record<string, unknown>;
  stack?: string;
  correlationId?: string;
}

const DB_NAME = "DSKYLogsDB";
const STORE_NAME = "logs";
const DB_VERSION = 1;

/**
 * Opens (or creates) the IndexedDB database for logs.
 * @returns Promise resolving to the IDBDatabase instance.
 */
function getDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Adds a log entry to the database.
 * @param entry - The log entry to add.
 * @returns Promise that resolves when the log is added.
 */
export async function addLogToDb(entry: LogDbEntry) {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).put(entry);
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Retrieves logs from the database, most recent first.
 * @param limit - Maximum number of logs to retrieve (default 200).
 * @returns Promise resolving to an array of log entries.
 */
export async function getLogsFromDb(limit = 200): Promise<LogDbEntry[]> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const logs: LogDbEntry[] = [];
    const store = db
      .transaction(STORE_NAME, "readonly")
      .objectStore(STORE_NAME);
    const req = store.openCursor(null, "prev");
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

/**
 * Clears all logs from the database.
 * @returns Promise that resolves when logs are cleared.
 */
export async function clearLogsDb() {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).clear();
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
