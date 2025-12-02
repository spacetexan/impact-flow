export type ProjectStatus = 'planned' | 'in_progress' | 'complete' | 'blocked';

export interface SuccessCriteria {
  id: string;
  projectId: string;
  description: string;
  isComplete: boolean;
}

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

export interface Profile {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  planned: 'hsl(var(--muted))',
  in_progress: 'hsl(var(--primary))',
  complete: 'hsl(var(--chart-2))',
  blocked: 'hsl(var(--destructive))',
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
  complete: 'Complete',
  blocked: 'Blocked',
};
