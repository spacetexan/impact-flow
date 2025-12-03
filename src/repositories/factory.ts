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

export interface Repositories {
  profiles: IProfileRepository;
  projects: IProjectRepository;
  criteria: ICriteriaRepository;
}

let repositoriesInstance: Repositories | null = null;

export function createRepositories(): Repositories {
  const storageType = config.storage.type;

  switch (storageType) {
    case 'memory':
      return {
        profiles: new InMemoryProfileRepository(),
        projects: new InMemoryProjectRepository(),
        criteria: new InMemoryCriteriaRepository(),
      };
    case 'sqlite':
    case 'supabase':
      // Future implementations will be added here
      console.warn(`Storage type "${storageType}" not yet implemented, falling back to memory`);
      return {
        profiles: new InMemoryProfileRepository(),
        projects: new InMemoryProjectRepository(),
        criteria: new InMemoryCriteriaRepository(),
      };
    default:
      throw new Error(`Unknown storage type: ${storageType}`);
  }
}

export function getRepositories(): Repositories {
  if (!repositoriesInstance) {
    repositoriesInstance = createRepositories();
  }
  return repositoriesInstance;
}

// For testing purposes
export function resetRepositories(): void {
  repositoriesInstance = null;
}
