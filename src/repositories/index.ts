/**
 * Repositories barrel export
 */

// Interfaces
export type { IProfileRepository } from './interfaces';
export type { IProjectRepository } from './interfaces';
export type { ICriteriaRepository } from './interfaces';

// Factory
export { createRepositories, getRepositories, resetRepositories } from './factory';
export type { Repositories } from './factory';

// Implementations (for direct use or testing)
export {
  InMemoryProfileRepository,
  InMemoryProjectRepository,
  InMemoryCriteriaRepository,
} from './implementations/memory';
