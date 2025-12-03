/**
 * Domain layer barrel export
 */

// Entities
export type {
  Profile,
  CreateProfileInput,
  UpdateProfileInput,
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  SuccessCriteria,
  CreateSuccessCriteriaInput,
  UpdateSuccessCriteriaInput,
} from './entities';

// Constants
export {
  PROJECT_STATUSES,
  STATUS_COLORS,
  STATUS_LABELS,
  type ProjectStatus,
} from './constants/status';

// Validation
export {
  profileSchema,
  createProfileSchema,
  updateProfileSchema,
  projectSchema,
  createProjectSchema,
  updateProjectSchema,
  successCriteriaSchema,
  createSuccessCriteriaSchema,
  updateSuccessCriteriaSchema,
} from './validation';
