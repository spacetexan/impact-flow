/**
 * SQLite repository implementations barrel export
 */

export { SQLiteProfileRepository } from './SQLiteProfileRepository';
export { SQLiteProjectRepository } from './SQLiteProjectRepository';
export { SQLiteCriteriaRepository } from './SQLiteCriteriaRepository';

// Re-export connection utilities for factory use
export {
  initializeDatabase,
  getDatabase,
  isDatabaseInitialized,
  persistDatabase,
  resetDatabase,
} from './shared/connection';
