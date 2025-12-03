/**
 * In-memory Project repository implementation
 */

import { Project, CreateProjectInput, UpdateProjectInput } from '@/domain';
import { IProjectRepository } from '../../interfaces';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export class InMemoryProjectRepository implements IProjectRepository {
  private projects: Map<string, Project> = new Map();

  async getAll(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getById(id: string): Promise<Project | null> {
    return this.projects.get(id) ?? null;
  }

  async getByProfileId(profileId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter((p) => p.profileId === profileId);
  }

  async create(input: CreateProjectInput): Promise<Project> {
    const project: Project = {
      ...input,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    this.projects.set(project.id, project);
    return project;
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project | null> {
    const existing = this.projects.get(id);
    if (!existing) return null;

    const updated: Project = { ...existing, ...input };
    this.projects.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  async deleteByProfileId(profileId: string): Promise<number> {
    const toDelete = Array.from(this.projects.values()).filter((p) => p.profileId === profileId);
    for (const project of toDelete) {
      this.projects.delete(project.id);
    }
    return toDelete.length;
  }

  // Helper method for seeding data
  seed(projects: Project[]): void {
    for (const project of projects) {
      this.projects.set(project.id, project);
    }
  }

  clear(): void {
    this.projects.clear();
  }
}
