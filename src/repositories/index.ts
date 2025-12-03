/**
 * Repositories barrel export
 */

// Interfaces
export type { IProfileRepository } from './interfaces';
export type { IProjectRepository } from './interfaces';
export type { ICriteriaRepository } from './interfaces';

// Factory
export {
  initializeRepositories,
  getRepositories,
  resetRepositories,
  requiresAsyncInit,
} from './factory';
export type { Repositories } from './factory';

// Implementations (for direct use or testing)
export {
  InMemoryProfileRepository,
  InMemoryProjectRepository,
  InMemoryCriteriaRepository,
} from './implementations/memory';

export {
  SQLiteProfileRepository,
  SQLiteProjectRepository,
  SQLiteCriteriaRepository,
} from './implementations/sqlite';
