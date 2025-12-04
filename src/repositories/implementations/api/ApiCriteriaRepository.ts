/**
 * API-based Criteria repository implementation
 * Calls the Express backend for persistence
 */

import type { SuccessCriteria, CreateCriteriaInput, UpdateCriteriaInput } from '@/domain';
import type { ICriteriaRepository } from '../../interfaces';
import { config } from '@/config';

const API_BASE = config.api.baseUrl;

export class ApiCriteriaRepository implements ICriteriaRepository {
  async getAll(): Promise<SuccessCriteria[]> {
    const response = await fetch(`${API_BASE}/criteria`);
    if (!response.ok) throw new Error('Failed to fetch criteria');
    return response.json();
  }

  async getById(id: string): Promise<SuccessCriteria | null> {
    const response = await fetch(`${API_BASE}/criteria/${id}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to fetch criteria');
    return response.json();
  }

  async getByProjectId(projectId: string): Promise<SuccessCriteria[]> {
    const response = await fetch(`${API_BASE}/criteria/project/${projectId}`);
    if (!response.ok) throw new Error('Failed to fetch criteria by project');
    return response.json();
  }

  async create(input: CreateCriteriaInput): Promise<SuccessCriteria> {
    const response = await fetch(`${API_BASE}/criteria`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error('Failed to create criteria');
    return response.json();
  }

  async update(id: string, input: UpdateCriteriaInput): Promise<SuccessCriteria | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const updated = { ...existing, ...input };
    const response = await fetch(`${API_BASE}/criteria/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to update criteria');
    return response.json();
  }

  async delete(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE}/criteria/${id}`, {
      method: 'DELETE',
    });
    if (response.status === 404) return false;
    return response.ok;
  }

  async deleteByProjectId(projectId: string): Promise<number> {
    const response = await fetch(`${API_BASE}/criteria/project/${projectId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete criteria by project');
    const result = await response.json();
    return result.deleted;
  }

  async seed(criteria: SuccessCriteria[]): Promise<void> {
    const response = await fetch(`${API_BASE}/criteria/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ criteria }),
    });
    if (!response.ok) throw new Error('Failed to seed criteria');
  }

  async clear(): Promise<void> {
    const criteria = await this.getAll();
    for (const c of criteria) {
      await this.delete(c.id);
    }
  }
}
