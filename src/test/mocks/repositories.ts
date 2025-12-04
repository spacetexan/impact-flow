import { vi } from 'vitest';
import {
  Profile,
  Project,
  SuccessCriteria,
  CreateProfileInput,
  CreateProjectInput,
  CreateSuccessCriteriaInput,
  UpdateProfileInput,
  UpdateProjectInput,
  UpdateSuccessCriteriaInput,
} from '@/domain';
import { IProfileRepository, IProjectRepository, ICriteriaRepository } from '@/repositories';

/**
 * Create a mock profile repository with optional initial data
 */
export function createMockProfileRepository(
  initialData: Profile[] = []
): IProfileRepository {
  let profiles = [...initialData];

  return {
    getAll: vi.fn().mockImplementation(async () => [...profiles]),
    getById: vi.fn().mockImplementation(async (id: string) =>
      profiles.find((p) => p.id === id) ?? null
    ),
    create: vi.fn().mockImplementation(async (input: CreateProfileInput) => {
      const profile: Profile = {
        ...input,
        id: Math.random().toString(36).substring(2, 11),
      };
      profiles.push(profile);
      return profile;
    }),
    update: vi.fn().mockImplementation(async (id: string, input: UpdateProfileInput) => {
      const index = profiles.findIndex((p) => p.id === id);
      if (index === -1) return null;
      profiles[index] = { ...profiles[index], ...input };
      return profiles[index];
    }),
    delete: vi.fn().mockImplementation(async (id: string) => {
      const index = profiles.findIndex((p) => p.id === id);
      if (index === -1) return false;
      profiles.splice(index, 1);
      return true;
    }),
  };
}

/**
 * Create a mock project repository with optional initial data
 */
export function createMockProjectRepository(
  initialData: Project[] = []
): IProjectRepository {
  let projects = [...initialData];

  return {
    getAll: vi.fn().mockImplementation(async () => [...projects]),
    getById: vi.fn().mockImplementation(async (id: string) =>
      projects.find((p) => p.id === id) ?? null
    ),
    getByProfileId: vi.fn().mockImplementation(async (profileId: string) =>
      projects.filter((p) => p.profileId === profileId)
    ),
    create: vi.fn().mockImplementation(async (input: CreateProjectInput) => {
      const project: Project = {
        ...input,
        id: Math.random().toString(36).substring(2, 11),
        createdAt: new Date().toISOString(),
      };
      projects.push(project);
      return project;
    }),
    update: vi.fn().mockImplementation(async (id: string, input: UpdateProjectInput) => {
      const index = projects.findIndex((p) => p.id === id);
      if (index === -1) return null;
      projects[index] = { ...projects[index], ...input };
      return projects[index];
    }),
    delete: vi.fn().mockImplementation(async (id: string) => {
      const index = projects.findIndex((p) => p.id === id);
      if (index === -1) return false;
      projects.splice(index, 1);
      return true;
    }),
    deleteByProfileId: vi.fn().mockImplementation(async (profileId: string) => {
      const toDelete = projects.filter((p) => p.profileId === profileId);
      projects = projects.filter((p) => p.profileId !== profileId);
      return toDelete.length;
    }),
  };
}

/**
 * Create a mock criteria repository with optional initial data
 */
export function createMockCriteriaRepository(
  initialData: SuccessCriteria[] = []
): ICriteriaRepository {
  let criteria = [...initialData];

  return {
    getAll: vi.fn().mockImplementation(async () => [...criteria]),
    getById: vi.fn().mockImplementation(async (id: string) =>
      criteria.find((c) => c.id === id) ?? null
    ),
    getByProjectId: vi.fn().mockImplementation(async (projectId: string) =>
      criteria.filter((c) => c.projectId === projectId)
    ),
    create: vi.fn().mockImplementation(async (input: CreateSuccessCriteriaInput) => {
      const item: SuccessCriteria = {
        ...input,
        id: Math.random().toString(36).substring(2, 11),
      };
      criteria.push(item);
      return item;
    }),
    update: vi.fn().mockImplementation(async (id: string, input: UpdateSuccessCriteriaInput) => {
      const index = criteria.findIndex((c) => c.id === id);
      if (index === -1) return null;
      criteria[index] = { ...criteria[index], ...input };
      return criteria[index];
    }),
    delete: vi.fn().mockImplementation(async (id: string) => {
      const index = criteria.findIndex((c) => c.id === id);
      if (index === -1) return false;
      criteria.splice(index, 1);
      return true;
    }),
    deleteByProjectId: vi.fn().mockImplementation(async (projectId: string) => {
      const toDelete = criteria.filter((c) => c.projectId === projectId);
      criteria = criteria.filter((c) => c.projectId !== projectId);
      return toDelete.length;
    }),
  };
}
