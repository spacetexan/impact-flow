/**
 * Project repository interface
 * Abstracts data storage for Project entities (DIP)
 */

import { Project, CreateProjectInput, UpdateProjectInput } from '@/domain';

export interface IProjectRepository {
  getAll(): Promise<Project[]>;
  getById(id: string): Promise<Project | null>;
  getByProfileId(profileId: string): Promise<Project[]>;
  create(input: CreateProjectInput): Promise<Project>;
  update(id: string, input: UpdateProjectInput): Promise<Project | null>;
  delete(id: string): Promise<boolean>;
  deleteByProfileId(profileId: string): Promise<number>;
}
