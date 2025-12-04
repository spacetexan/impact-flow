/**
 * Repository factory
 * Creates repository instances based on configuration (OCP, DIP)
 */

import { config } from '@/config';
import { IProfileRepository, IProjectRepository, ICriteriaRepository } from './interfaces';
import {
  InMemoryProfileRepository,
  InMemoryProjectRepository,
  InMemoryCriteriaRepository,
} from './implementations/memory';
import {
  SQLiteProfileRepository,
  SQLiteProjectRepository,
  SQLiteCriteriaRepository,
  initializeDatabase,
} from './implementations/sqlite';
import {
  ApiProfileRepository,
  ApiProjectRepository,
  ApiCriteriaRepository,
} from './implementations/api';

export interface Repositories {
  profiles: IProfileRepository;
  projects: IProjectRepository;
  criteria: ICriteriaRepository;
}

let repositoriesInstance: Repositories | null = null;
let initPromise: Promise<Repositories> | null = null;

/**
 * Create in-memory repositories (sync)
 */
function createMemoryRepositories(): Repositories {
  return {
    profiles: new InMemoryProfileRepository(),
    projects: new InMemoryProjectRepository(),
    criteria: new InMemoryCriteriaRepository(),
  };
}

/**
 * Create SQLite repositories (requires async DB init)
 */
function createSQLiteRepositories(): Repositories {
  return {
    profiles: new SQLiteProfileRepository(),
    projects: new SQLiteProjectRepository(),
    criteria: new SQLiteCriteriaRepository(),
  };
}

/**
 * Create API-based repositories (calls Express backend)
 */
function createApiRepositories(): Repositories {
  return {
    profiles: new ApiProfileRepository(),
    projects: new ApiProjectRepository(),
    criteria: new ApiCriteriaRepository(),
  };
}

/**
 * Initialize and get repositories asynchronously
 * Required for SQLite (WASM loading)
 */
export async function initializeRepositories(): Promise<Repositories> {
  // Return cached instance if available
  if (repositoriesInstance) {
    return repositoriesInstance;
  }

  // Return existing init promise if in progress
  if (initPromise) {
    return initPromise;
  }

  const storageType = config.storage.type;

  if (storageType === 'sqlite') {
    initPromise = (async () => {
      await initializeDatabase();
      repositoriesInstance = createSQLiteRepositories();
      return repositoriesInstance;
    })();
    return initPromise;
  }

  if (storageType === 'server') {
    // API repositories are synchronous (async happens in fetch calls)
    repositoriesInstance = createApiRepositories();
    return repositoriesInstance;
  }

  // Memory storage is synchronous
  repositoriesInstance = createMemoryRepositories();
  return repositoriesInstance;
}

/**
 * Get repositories synchronously (for backward compatibility with memory mode)
 * Throws if using async storage type (SQLite) and not yet initialized
 */
export function getRepositories(): Repositories {
  if (repositoriesInstance) {
    return repositoriesInstance;
  }

  const storageType = config.storage.type;

  if (storageType === 'sqlite') {
    throw new Error(
      'SQLite storage requires async initialization. Use initializeRepositories() first.'
    );
  }

  // Memory storage can be created synchronously
  repositoriesInstance = createMemoryRepositories();
  return repositoriesInstance;
}

/**
 * Check if repositories require async initialization
 */
export function requiresAsyncInit(): boolean {
  return config.storage.type === 'sqlite';
}

// For testing purposes
export function resetRepositories(): void {
  repositoriesInstance = null;
  initPromise = null;
}
