/**
 * SuccessCriteria validation schemas
 */

import { z } from 'zod';

export const successCriteriaSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1, 'Project ID is required'),
  description: z.string().min(1, 'Description is required'),
  isComplete: z.boolean(),
});

export const createSuccessCriteriaSchema = successCriteriaSchema.omit({ id: true });

export const updateSuccessCriteriaSchema = successCriteriaSchema.omit({ id: true }).partial();

export type SuccessCriteriaSchema = z.infer<typeof successCriteriaSchema>;
export type CreateSuccessCriteriaSchema = z.infer<typeof createSuccessCriteriaSchema>;
export type UpdateSuccessCriteriaSchema = z.infer<typeof updateSuccessCriteriaSchema>;
