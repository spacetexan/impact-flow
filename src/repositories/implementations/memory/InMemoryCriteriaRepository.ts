/**
 * In-memory SuccessCriteria repository implementation
 */

import { SuccessCriteria, CreateSuccessCriteriaInput, UpdateSuccessCriteriaInput } from '@/domain';
import { ICriteriaRepository } from '../../interfaces';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export class InMemoryCriteriaRepository implements ICriteriaRepository {
  private criteria: Map<string, SuccessCriteria> = new Map();

  async getAll(): Promise<SuccessCriteria[]> {
    return Array.from(this.criteria.values());
  }

  async getById(id: string): Promise<SuccessCriteria | null> {
    return this.criteria.get(id) ?? null;
  }

  async getByProjectId(projectId: string): Promise<SuccessCriteria[]> {
    return Array.from(this.criteria.values()).filter((c) => c.projectId === projectId);
  }

  async create(input: CreateSuccessCriteriaInput): Promise<SuccessCriteria> {
    const criteria: SuccessCriteria = {
      ...input,
      id: generateId(),
    };
    this.criteria.set(criteria.id, criteria);
    return criteria;
  }

  async update(id: string, input: UpdateSuccessCriteriaInput): Promise<SuccessCriteria | null> {
    const existing = this.criteria.get(id);
    if (!existing) return null;

    const updated: SuccessCriteria = { ...existing, ...input };
    this.criteria.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.criteria.delete(id);
  }

  async deleteByProjectId(projectId: string): Promise<number> {
    const toDelete = Array.from(this.criteria.values()).filter((c) => c.projectId === projectId);
    for (const criteria of toDelete) {
      this.criteria.delete(criteria.id);
    }
    return toDelete.length;
  }

  // Helper method for seeding data
  seed(criteria: SuccessCriteria[]): void {
    for (const item of criteria) {
      this.criteria.set(item.id, item);
    }
  }

  clear(): void {
    this.criteria.clear();
  }
}
