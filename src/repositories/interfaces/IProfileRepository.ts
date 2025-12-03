/**
 * Profile repository interface
 * Abstracts data storage for Profile entities (DIP)
 */

import { Profile, CreateProfileInput, UpdateProfileInput } from '@/domain';

export interface IProfileRepository {
  getAll(): Promise<Profile[]>;
  getById(id: string): Promise<Profile | null>;
  create(input: CreateProfileInput): Promise<Profile>;
  update(id: string, input: UpdateProfileInput): Promise<Profile | null>;
  delete(id: string): Promise<boolean>;
}
