/**
 * Profile entity
 * Represents a team member who can be assigned projects
 */

export interface Profile {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export type CreateProfileInput = Omit<Profile, 'id'>;
export type UpdateProfileInput = Partial<Omit<Profile, 'id'>>;
