/**
 * SQLite database schema definitions
 * Creates tables and indexes for the delegation system
 */

import type { Database } from 'sql.js';

const SCHEMA_SQL = `
-- Profiles table (team members)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT
);

-- Projects table (delegations with Impact Filter fields)
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  importance TEXT NOT NULL,
  ideal_outcome TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('planned', 'in_progress', 'complete', 'blocked')),
  due_date TEXT,
  comments TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Success criteria table (completion checkpoints)
CREATE TABLE IF NOT EXISTS success_criteria (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  description TEXT NOT NULL,
  is_complete INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Indexes for foreign key lookups
CREATE INDEX IF NOT EXISTS idx_projects_profile_id ON projects(profile_id);
CREATE INDEX IF NOT EXISTS idx_criteria_project_id ON success_criteria(project_id);
`;

/**
 * Initialize the database schema
 * Creates all tables and indexes if they don't exist
 */
export function initializeSchema(db: Database): void {
  db.run(SCHEMA_SQL);
}

/**
 * Drop all tables (for testing/reset)
 */
export function dropAllTables(db: Database): void {
  db.run(`
    DROP TABLE IF EXISTS success_criteria;
    DROP TABLE IF EXISTS projects;
    DROP TABLE IF EXISTS profiles;
  `);
}
