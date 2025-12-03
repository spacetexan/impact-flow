/**
 * Seed data loader
 * Conditionally loads seed data based on configuration (12-Factor: Config, Dev/Prod Parity)
 */

import { config } from '@/config';
import { allSeedData, SeedData } from './seedData';
import { Repositories } from '@/repositories';

// Interface for repositories that support seeding
interface SeedableRepository {
  seed(data: unknown[]): void;
}

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
 * Only seeds if in demo mode and no existing data (for persistent storage)
 */
export async function seedRepositories(repos: Repositories): Promise<void> {
  if (!config.features.demoMode) {
    return;
  }

  // Check if data already exists (for persistent storage like SQLite)
  const existingProfiles = await repos.profiles.getAll();
  if (existingProfiles.length > 0) {
    // Data already exists, skip seeding
    return;
  }

  const data = getInitialData();

  // Type assertion for seed() method which is implementation-specific
  const profileRepo = repos.profiles as SeedableRepository;
  const projectRepo = repos.projects as SeedableRepository;
  const criteriaRepo = repos.criteria as SeedableRepository;

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
