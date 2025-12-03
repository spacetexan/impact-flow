/**
 * SuccessCriteria repository interface
 * Abstracts data storage for SuccessCriteria entities (DIP)
 */

import { SuccessCriteria, CreateSuccessCriteriaInput, UpdateSuccessCriteriaInput } from '@/domain';

export interface ICriteriaRepository {
  getAll(): Promise<SuccessCriteria[]>;
  getById(id: string): Promise<SuccessCriteria | null>;
  getByProjectId(projectId: string): Promise<SuccessCriteria[]>;
  create(input: CreateSuccessCriteriaInput): Promise<SuccessCriteria>;
  update(id: string, input: UpdateSuccessCriteriaInput): Promise<SuccessCriteria | null>;
  delete(id: string): Promise<boolean>;
  deleteByProjectId(projectId: string): Promise<number>;
}
