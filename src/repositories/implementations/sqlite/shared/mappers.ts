/**
 * SQL row to entity mappers
 * Handles snake_case to camelCase conversion and type coercion
 */

import type { Profile } from '@/domain/entities/Profile';
import type { Project } from '@/domain/entities/Project';
import type { SuccessCriteria } from '@/domain/entities/SuccessCriteria';
import type { ProjectStatus } from '@/domain/constants/status';

/**
 * SQL row type for profiles table
 */
interface ProfileRow {
  id: string;
  name: string;
  role: string;
  avatar: string | null;
}

/**
 * SQL row type for projects table
 */
interface ProjectRow {
  id: string;
  profile_id: string;
  name: string;
  purpose: string;
  importance: string;
  ideal_outcome: string;
  status: string;
  due_date: string | null;
  comments: string;
  created_at: string;
}

/**
 * SQL row type for success_criteria table
 */
interface CriteriaRow {
  id: string;
  project_id: string;
  description: string;
  is_complete: number; // SQLite uses 0/1 for boolean
}

/**
 * Convert SQL row to Profile entity
 */
export function rowToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    avatar: row.avatar ?? undefined,
  };
}

/**
 * Convert SQL row to Project entity
 */
export function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    profileId: row.profile_id,
    name: row.name,
    purpose: row.purpose,
    importance: row.importance,
    idealOutcome: row.ideal_outcome,
    status: row.status as ProjectStatus,
    dueDate: row.due_date,
    comments: row.comments,
    createdAt: row.created_at,
  };
}

/**
 * Convert SQL row to SuccessCriteria entity
 */
export function rowToCriteria(row: CriteriaRow): SuccessCriteria {
  return {
    id: row.id,
    projectId: row.project_id,
    description: row.description,
    isComplete: row.is_complete === 1,
  };
}

/**
 * Convert sql.js query result to typed rows
 * sql.js returns results in column-major format
 */
export function resultToRows<T>(result: { columns: string[]; values: unknown[][] }): T[] {
  const { columns, values } = result;
  return values.map((row) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj as T;
  });
}
