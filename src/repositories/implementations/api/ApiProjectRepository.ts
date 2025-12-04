/**
 * API-based Project repository implementation
 * Calls the Express backend for persistence
 */

import type { Project, CreateProjectInput, UpdateProjectInput } from '@/domain';
import type { IProjectRepository } from '../../interfaces';
import { config } from '@/config';

const API_BASE = config.api.baseUrl;

export class ApiProjectRepository implements IProjectRepository {
  async getAll(): Promise<Project[]> {
    const response = await fetch(`${API_BASE}/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  }

  async getById(id: string): Promise<Project | null> {
    const response = await fetch(`${API_BASE}/projects/${id}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to fetch project');
    return response.json();
  }

  async getByProfileId(profileId: string): Promise<Project[]> {
    const response = await fetch(`${API_BASE}/projects/profile/${profileId}`);
    if (!response.ok) throw new Error('Failed to fetch projects by profile');
    return response.json();
  }

  async create(input: CreateProjectInput): Promise<Project> {
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error('Failed to create project');
    return response.json();
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const updated = { ...existing, ...input };
    const response = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to update project');
    return response.json();
  }

  async delete(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
    });
    if (response.status === 404) return false;
    return response.ok;
  }

  async deleteByProfileId(profileId: string): Promise<number> {
    const response = await fetch(`${API_BASE}/projects/profile/${profileId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete projects by profile');
    const result = await response.json();
    return result.deleted;
  }

  async seed(projects: Project[]): Promise<void> {
    const response = await fetch(`${API_BASE}/projects/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projects }),
    });
    if (!response.ok) throw new Error('Failed to seed projects');
  }

  async clear(): Promise<void> {
    const projects = await this.getAll();
    for (const project of projects) {
      await this.delete(project.id);
    }
  }
}
