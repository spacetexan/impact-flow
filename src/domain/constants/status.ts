/**
 * Project status constants
 * Centralized status definitions for extensibility (OCP)
 */

export const PROJECT_STATUSES = ['planned', 'in_progress', 'complete', 'blocked'] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

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
