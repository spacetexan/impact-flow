/**
 * SQLite database connection manager
 * Handles WASM loading and database singleton lifecycle
 */

import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { config } from '@/config';
import { initializeSchema } from './schema';
import { loadFromIndexedDB, saveToIndexedDB } from './persistence';

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;
let initPromise: Promise<Database> | null = null;
let beforeUnloadRegistered = false;

/**
 * Register beforeunload handler to flush pending database writes
 * Only registers once to avoid duplicate handlers
 */
function registerBeforeUnloadHandler(): void {
  if (beforeUnloadRegistered || typeof window === 'undefined') return;

  window.addEventListener('beforeunload', () => {
    flushPendingPersist();
  });
  beforeUnloadRegistered = true;
}

/**
 * Initialize the SQLite database
 * Loads WASM, creates or restores database, initializes schema
 */
export async function initializeDatabase(): Promise<Database> {
  // Return existing promise if initialization is in progress
  if (initPromise) {
    return initPromise;
  }

  // Return existing database if already initialized
  if (db) {
    return db;
  }

  initPromise = (async () => {
    try {
      // Load sql.js WASM
      if (!SQL) {
        SQL = await initSqlJs({
          // Load WASM from CDN for simplicity
          locateFile: (file) => `https://sql.js.org/dist/${file}`,
        });
      }

      // Try to restore from IndexedDB if using persistent storage
      if (config.sqlite.persistence === 'indexeddb') {
        const savedData = await loadFromIndexedDB();
        if (savedData) {
          db = new SQL.Database(savedData);
          // Enable foreign keys
          db.run('PRAGMA foreign_keys = ON');
          // Register beforeunload handler to flush pending writes
          registerBeforeUnloadHandler();
          return db;
        }
      }

      // Create new database
      db = new SQL.Database();

      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON');

      // Initialize schema
      initializeSchema(db);

      // Persist empty database if using IndexedDB
      if (config.sqlite.persistence === 'indexeddb') {
        await persistDatabase();
        // Register beforeunload handler to flush pending writes
        registerBeforeUnloadHandler();
      }

      return db;
    } catch (error) {
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}

/**
 * Get the current database instance
 * Throws if database is not initialized
 */
export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

/**
 * Check if database is initialized
 */
export function isDatabaseInitialized(): boolean {
  return db !== null;
}

/**
 * Persist current database state to IndexedDB
 */
export async function persistDatabase(): Promise<void> {
  if (!db) return;
  if (config.sqlite.persistence !== 'indexeddb') return;

  const data = db.export();
  await saveToIndexedDB(data);
}

// Debounced persistence for batch operations
let persistTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Schedule database persistence with debouncing
 * Useful after mutations to avoid excessive writes
 */
export function schedulePersist(delay = 100): void {
  if (config.sqlite.persistence !== 'indexeddb') return;

  if (persistTimeout) {
    clearTimeout(persistTimeout);
  }

  persistTimeout = setTimeout(() => {
    persistDatabase();
    persistTimeout = null;
  }, delay);
}

/**
 * Flush any pending persistence immediately
 * Called on beforeunload to ensure data is saved before page closes
 */
export function flushPendingPersist(): void {
  if (persistTimeout) {
    clearTimeout(persistTimeout);
    persistTimeout = null;
    persistDatabase();
  }
}

/**
 * Reset the database (for testing)
 */
export function resetDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
  initPromise = null;
}
