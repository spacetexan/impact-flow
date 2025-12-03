/**
 * In-memory Profile repository implementation
 */

import { Profile, CreateProfileInput, UpdateProfileInput } from '@/domain';
import { IProfileRepository } from '../../interfaces';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export class InMemoryProfileRepository implements IProfileRepository {
  private profiles: Map<string, Profile> = new Map();

  async getAll(): Promise<Profile[]> {
    return Array.from(this.profiles.values());
  }

  async getById(id: string): Promise<Profile | null> {
    return this.profiles.get(id) ?? null;
  }

  async create(input: CreateProfileInput): Promise<Profile> {
    const profile: Profile = {
      ...input,
      id: generateId(),
    };
    this.profiles.set(profile.id, profile);
    return profile;
  }

  async update(id: string, input: UpdateProfileInput): Promise<Profile | null> {
    const existing = this.profiles.get(id);
    if (!existing) return null;

    const updated: Profile = { ...existing, ...input };
    this.profiles.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.profiles.delete(id);
  }

  // Helper method for seeding data
  seed(profiles: Profile[]): void {
    for (const profile of profiles) {
      this.profiles.set(profile.id, profile);
    }
  }

  clear(): void {
    this.profiles.clear();
  }
}
