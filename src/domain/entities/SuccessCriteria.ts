/**
 * SuccessCriteria entity
 * Represents a checkpoint for project completion
 */

export interface SuccessCriteria {
  id: string;
  projectId: string;
  description: string;
  isComplete: boolean;
}

export type CreateSuccessCriteriaInput = Omit<SuccessCriteria, 'id'>;
export type UpdateSuccessCriteriaInput = Partial<Omit<SuccessCriteria, 'id'>>;
