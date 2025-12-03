/**
 * SQLite Profile repository implementation
 */

import type { Profile, CreateProfileInput, UpdateProfileInput } from '@/domain';
import type { IProfileRepository } from '../../interfaces';
import { getDatabase, schedulePersist } from './shared/connection';
import { rowToProfile, resultToRows } from './shared/mappers';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

interface ProfileRow {
  id: string;
  name: string;
  role: string;
  avatar: string | null;
}

export class SQLiteProfileRepository implements IProfileRepository {
  async getAll(): Promise<Profile[]> {
    const db = getDatabase();
    const result = db.exec('SELECT id, name, role, avatar FROM profiles');

    if (result.length === 0) return [];

    const rows = resultToRows<ProfileRow>(result[0]);
    return rows.map(rowToProfile);
  }

  async getById(id: string): Promise<Profile | null> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT id, name, role, avatar FROM profiles WHERE id = ?');
    stmt.bind([id]);

    if (stmt.step()) {
      const row = stmt.getAsObject() as ProfileRow;
      stmt.free();
      return rowToProfile(row);
    }

    stmt.free();
    return null;
  }

  async create(input: CreateProfileInput): Promise<Profile> {
    const db = getDatabase();
    const id = generateId();

    db.run(
      'INSERT INTO profiles (id, name, role, avatar) VALUES (?, ?, ?, ?)',
      [id, input.name, input.role, input.avatar ?? null]
    );

    schedulePersist();

    return {
      id,
      name: input.name,
      role: input.role,
      avatar: input.avatar,
    };
  }

  async update(id: string, input: UpdateProfileInput): Promise<Profile | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const db = getDatabase();
    const updated: Profile = { ...existing, ...input };

    db.run(
      'UPDATE profiles SET name = ?, role = ?, avatar = ? WHERE id = ?',
      [updated.name, updated.role, updated.avatar ?? null, id]
    );

    schedulePersist();

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const db = getDatabase();
    const existing = await this.getById(id);
    if (!existing) return false;

    db.run('DELETE FROM profiles WHERE id = ?', [id]);
    schedulePersist();

    return true;
  }

  seed(profiles: Profile[]): void {
    const db = getDatabase();

    for (const profile of profiles) {
      db.run(
        'INSERT OR REPLACE INTO profiles (id, name, role, avatar) VALUES (?, ?, ?, ?)',
        [profile.id, profile.name, profile.role, profile.avatar ?? null]
      );
    }

    schedulePersist();
  }

  clear(): void {
    const db = getDatabase();
    db.run('DELETE FROM profiles');
    schedulePersist();
  }
}
