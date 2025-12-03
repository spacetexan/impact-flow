/**
 * Re-export domain types for backward compatibility
 * New code should import directly from @/domain
 */

export type {
  Profile,
  Project,
  SuccessCriteria,
  ProjectStatus,
} from '@/domain';

export { STATUS_COLORS, STATUS_LABELS } from '@/domain';
