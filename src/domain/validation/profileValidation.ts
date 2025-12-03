/**
 * Profile validation schemas
 */

import { z } from 'zod';

export const profileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  avatar: z.string().url().optional(),
});

export const createProfileSchema = profileSchema.omit({ id: true });

export const updateProfileSchema = profileSchema.omit({ id: true }).partial();

export type ProfileSchema = z.infer<typeof profileSchema>;
export type CreateProfileSchema = z.infer<typeof createProfileSchema>;
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
