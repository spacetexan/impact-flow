/**
 * SQLite Project repository implementation
 */

import type { Project, CreateProjectInput, UpdateProjectInput } from '@/domain';
import type { IProjectRepository } from '../../interfaces';
import { getDatabase, schedulePersist } from './shared/connection';
import { rowToProject, resultToRows } from './shared/mappers';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

interface ProjectRow {
  id: string;
  profile_id: string;
  name: string;
  purpose: string;
  importance: string;
  ideal_outcome: string;
  status: string;
  due_date: string | null;
  comments: string;
  created_at: string;
}

const SELECT_COLUMNS = `
  id, profile_id, name, purpose, importance, ideal_outcome,
  status, due_date, comments, created_at
`;

export class SQLiteProjectRepository implements IProjectRepository {
  async getAll(): Promise<Project[]> {
    const db = getDatabase();
    const result = db.exec(`SELECT ${SELECT_COLUMNS} FROM projects`);

    if (result.length === 0) return [];

    const rows = resultToRows<ProjectRow>(result[0]);
    return rows.map(rowToProject);
  }

  async getById(id: string): Promise<Project | null> {
    const db = getDatabase();
    const stmt = db.prepare(`SELECT ${SELECT_COLUMNS} FROM projects WHERE id = ?`);
    stmt.bind([id]);

    if (stmt.step()) {
      const row = stmt.getAsObject() as ProjectRow;
      stmt.free();
      return rowToProject(row);
    }

    stmt.free();
    return null;
  }

  async getByProfileId(profileId: string): Promise<Project[]> {
    const db = getDatabase();
    const stmt = db.prepare(`SELECT ${SELECT_COLUMNS} FROM projects WHERE profile_id = ?`);
    stmt.bind([profileId]);

    const projects: Project[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject() as ProjectRow;
      projects.push(rowToProject(row));
    }

    stmt.free();
    return projects;
  }

  async create(input: CreateProjectInput): Promise<Project> {
    const db = getDatabase();
    const id = generateId();
    const createdAt = new Date().toISOString();

    db.run(
      `INSERT INTO projects (
        id, profile_id, name, purpose, importance, ideal_outcome,
        status, due_date, comments, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.profileId,
        input.name,
        input.purpose,
        input.importance,
        input.idealOutcome,
        input.status,
        input.dueDate,
        input.comments,
        createdAt,
      ]
    );

    schedulePersist();

    return {
      id,
      profileId: input.profileId,
      name: input.name,
      purpose: input.purpose,
      importance: input.importance,
      idealOutcome: input.idealOutcome,
      status: input.status,
      dueDate: input.dueDate,
      comments: input.comments,
      createdAt,
    };
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const db = getDatabase();
    const updated: Project = { ...existing, ...input };

    db.run(
      `UPDATE projects SET
        profile_id = ?, name = ?, purpose = ?, importance = ?,
        ideal_outcome = ?, status = ?, due_date = ?, comments = ?
      WHERE id = ?`,
      [
        updated.profileId,
        updated.name,
        updated.purpose,
        updated.importance,
        updated.idealOutcome,
        updated.status,
        updated.dueDate,
        updated.comments,
        id,
      ]
    );

    schedulePersist();

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const db = getDatabase();
    const existing = await this.getById(id);
    if (!existing) return false;

    db.run('DELETE FROM projects WHERE id = ?', [id]);
    schedulePersist();

    return true;
  }

  async deleteByProfileId(profileId: string): Promise<number> {
    const db = getDatabase();

    // Get count before delete
    const projects = await this.getByProfileId(profileId);
    const count = projects.length;

    if (count > 0) {
      db.run('DELETE FROM projects WHERE profile_id = ?', [profileId]);
      schedulePersist();
    }

    return count;
  }

  seed(projects: Project[]): void {
    const db = getDatabase();

    for (const project of projects) {
      db.run(
        `INSERT OR REPLACE INTO projects (
          id, profile_id, name, purpose, importance, ideal_outcome,
          status, due_date, comments, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          project.id,
          project.profileId,
          project.name,
          project.purpose,
          project.importance,
          project.idealOutcome,
          project.status,
          project.dueDate,
          project.comments,
          project.createdAt,
        ]
      );
    }

    schedulePersist();
  }

  clear(): void {
    const db = getDatabase();
    db.run('DELETE FROM projects');
    schedulePersist();
  }
}
