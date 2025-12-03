/**
 * Project validation schemas
 */

import { z } from 'zod';
import { PROJECT_STATUSES } from '../constants/status';

export const projectSchema = z.object({
  id: z.string().min(1),
  profileId: z.string().min(1, 'Assignee is required'),
  name: z.string().min(1, 'Project name is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  importance: z.string().min(1, 'Importance is required'),
  idealOutcome: z.string().min(1, 'Ideal outcome is required'),
  status: z.enum(PROJECT_STATUSES),
  dueDate: z.string().nullable(),
  comments: z.string(),
  createdAt: z.string(),
});

export const createProjectSchema = projectSchema.omit({ id: true, createdAt: true });

export const updateProjectSchema = projectSchema.omit({ id: true, createdAt: true }).partial();

export type ProjectSchema = z.infer<typeof projectSchema>;
export type CreateProjectSchema = z.infer<typeof createProjectSchema>;
export type UpdateProjectSchema = z.infer<typeof updateProjectSchema>;
