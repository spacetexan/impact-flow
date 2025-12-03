/**
 * Project entity
 * Represents a delegated task using the Impact Filter framework
 */

import { ProjectStatus } from '../constants/status';

export interface Project {
  id: string;
  profileId: string;
  name: string;
  purpose: string;
  importance: string;
  idealOutcome: string;
  status: ProjectStatus;
  dueDate: string | null;
  comments: string;
  createdAt: string;
}

export type CreateProjectInput = Omit<Project, 'id' | 'createdAt'>;
export type UpdateProjectInput = Partial<Omit<Project, 'id' | 'createdAt'>>;
