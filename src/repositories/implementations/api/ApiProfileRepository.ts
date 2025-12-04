/**
 * API-based Profile repository implementation
 * Calls the Express backend for persistence
 */

import type { Profile, CreateProfileInput, UpdateProfileInput } from '@/domain';
import type { IProfileRepository } from '../../interfaces';
import { config } from '@/config';

const API_BASE = config.api.baseUrl;

export class ApiProfileRepository implements IProfileRepository {
  async getAll(): Promise<Profile[]> {
    const response = await fetch(`${API_BASE}/profiles`);
    if (!response.ok) throw new Error('Failed to fetch profiles');
    return response.json();
  }

  async getById(id: string): Promise<Profile | null> {
    const response = await fetch(`${API_BASE}/profiles/${id}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  }

  async create(input: CreateProfileInput): Promise<Profile> {
    const response = await fetch(`${API_BASE}/profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error('Failed to create profile');
    return response.json();
  }

  async update(id: string, input: UpdateProfileInput): Promise<Profile | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const updated = { ...existing, ...input };
    const response = await fetch(`${API_BASE}/profiles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  }

  async delete(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE}/profiles/${id}`, {
      method: 'DELETE',
    });
    if (response.status === 404) return false;
    return response.ok;
  }

  async seed(profiles: Profile[]): Promise<void> {
    const response = await fetch(`${API_BASE}/profiles/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profiles }),
    });
    if (!response.ok) throw new Error('Failed to seed profiles');
  }

  async clear(): Promise<void> {
    const profiles = await this.getAll();
    for (const profile of profiles) {
      await this.delete(profile.id);
    }
  }
}
