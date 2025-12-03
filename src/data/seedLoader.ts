/**
 * Seed data loader
 * Conditionally loads seed data based on configuration (12-Factor: Config, Dev/Prod Parity)
 */

import { config } from '@/config';
import { allSeedData, SeedData } from './seedData';
import { Repositories, InMemoryProfileRepository, InMemoryProjectRepository, InMemoryCriteriaRepository } from '@/repositories';

/**
 * Get initial data based on demo mode configuration
 */
export function getInitialData(): SeedData {
  if (config.features.demoMode) {
    return allSeedData;
  }
  return {
    profiles: [],
    projects: [],
    criteria: [],
  };
}

/**
 * Seed repositories with initial data
 * Only seeds if in demo mode
 */
export function seedRepositories(repos: Repositories): void {
  if (!config.features.demoMode) {
    return;
  }

  const data = getInitialData();

  // Type assertion needed for seed() method which is implementation-specific
  const profileRepo = repos.profiles as InMemoryProfileRepository;
  const projectRepo = repos.projects as InMemoryProjectRepository;
  const criteriaRepo = repos.criteria as InMemoryCriteriaRepository;

  profileRepo.seed(data.profiles);
  projectRepo.seed(data.projects);
  criteriaRepo.seed(data.criteria);
}

/**
 * Check if the application is running in demo mode
 */
export function isDemoMode(): boolean {
  return config.features.demoMode;
}
