/**
 * SQLite database connection using better-sqlite3
 * Stores data in ./data/impact-flow.db file
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'impact-flow.db');

/**
 * Initialize the database connection and schema
 */
export function initializeDatabase(): Database.Database {
  if (db) return db;

  // Ensure data directory exists
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
    console.log(`[Database] Created data directory: ${DB_DIR}`);
  }

  // Open database (creates file if it doesn't exist)
  db = new Database(DB_PATH);
  console.log(`[Database] Connected to ${DB_PATH}`);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Initialize schema
  initializeSchema(db);

  return db;
}

/**
 * Get the database instance
 */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

/**
 * Initialize database schema
 */
function initializeSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar TEXT
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      name TEXT NOT NULL,
      purpose TEXT NOT NULL,
      importance TEXT NOT NULL,
      ideal_outcome TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'planned',
      due_date TEXT,
      comments TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS success_criteria (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      description TEXT NOT NULL,
      is_complete INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_projects_profile_id ON projects(profile_id);
    CREATE INDEX IF NOT EXISTS idx_criteria_project_id ON success_criteria(project_id);
  `);

  console.log('[Database] Schema initialized');
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log('[Database] Connection closed');
  }
}
