/**
 * SQLite SuccessCriteria repository implementation
 */

import type { SuccessCriteria, CreateSuccessCriteriaInput, UpdateSuccessCriteriaInput } from '@/domain';
import type { ICriteriaRepository } from '../../interfaces';
import { getDatabase, schedulePersist } from './shared/connection';
import { rowToCriteria, resultToRows } from './shared/mappers';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

interface CriteriaRow {
  id: string;
  project_id: string;
  description: string;
  is_complete: number;
}

const SELECT_COLUMNS = 'id, project_id, description, is_complete';

export class SQLiteCriteriaRepository implements ICriteriaRepository {
  async getAll(): Promise<SuccessCriteria[]> {
    const db = getDatabase();
    const result = db.exec(`SELECT ${SELECT_COLUMNS} FROM success_criteria`);

    if (result.length === 0) return [];

    const rows = resultToRows<CriteriaRow>(result[0]);
    return rows.map(rowToCriteria);
  }

  async getById(id: string): Promise<SuccessCriteria | null> {
    const db = getDatabase();
    const stmt = db.prepare(`SELECT ${SELECT_COLUMNS} FROM success_criteria WHERE id = ?`);
    stmt.bind([id]);

    if (stmt.step()) {
      const row = stmt.getAsObject() as CriteriaRow;
      stmt.free();
      return rowToCriteria(row);
    }

    stmt.free();
    return null;
  }

  async getByProjectId(projectId: string): Promise<SuccessCriteria[]> {
    const db = getDatabase();
    const stmt = db.prepare(`SELECT ${SELECT_COLUMNS} FROM success_criteria WHERE project_id = ?`);
    stmt.bind([projectId]);

    const criteria: SuccessCriteria[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject() as CriteriaRow;
      criteria.push(rowToCriteria(row));
    }

    stmt.free();
    return criteria;
  }

  async create(input: CreateSuccessCriteriaInput): Promise<SuccessCriteria> {
    const db = getDatabase();
    const id = generateId();

    db.run(
      'INSERT INTO success_criteria (id, project_id, description, is_complete) VALUES (?, ?, ?, ?)',
      [id, input.projectId, input.description, input.isComplete ? 1 : 0]
    );

    schedulePersist();

    return {
      id,
      projectId: input.projectId,
      description: input.description,
      isComplete: input.isComplete,
    };
  }

  async update(id: string, input: UpdateSuccessCriteriaInput): Promise<SuccessCriteria | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const db = getDatabase();
    const updated: SuccessCriteria = { ...existing, ...input };

    db.run(
      'UPDATE success_criteria SET project_id = ?, description = ?, is_complete = ? WHERE id = ?',
      [updated.projectId, updated.description, updated.isComplete ? 1 : 0, id]
    );

    schedulePersist();

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const db = getDatabase();
    const existing = await this.getById(id);
    if (!existing) return false;

    db.run('DELETE FROM success_criteria WHERE id = ?', [id]);
    schedulePersist();

    return true;
  }

  async deleteByProjectId(projectId: string): Promise<number> {
    const db = getDatabase();

    // Get count before delete
    const criteria = await this.getByProjectId(projectId);
    const count = criteria.length;

    if (count > 0) {
      db.run('DELETE FROM success_criteria WHERE project_id = ?', [projectId]);
      schedulePersist();
    }

    return count;
  }

  seed(criteria: SuccessCriteria[]): void {
    const db = getDatabase();

    for (const item of criteria) {
      db.run(
        'INSERT OR REPLACE INTO success_criteria (id, project_id, description, is_complete) VALUES (?, ?, ?, ?)',
        [item.id, item.projectId, item.description, item.isComplete ? 1 : 0]
      );
    }

    schedulePersist();
  }

  clear(): void {
    const db = getDatabase();
    db.run('DELETE FROM success_criteria');
    schedulePersist();
  }
}
