import { SuccessCriteria, CreateSuccessCriteriaInput } from '@/domain';

export const testCriteria: SuccessCriteria[] = [
  {
    id: 'criteria-1',
    projectId: 'project-1',
    description: 'Dashboard loads in under 2 seconds',
    isComplete: true,
  },
  {
    id: 'criteria-2',
    projectId: 'project-1',
    description: 'All charts render correctly',
    isComplete: false,
  },
  {
    id: 'criteria-3',
    projectId: 'project-2',
    description: 'API endpoints documented',
    isComplete: false,
  },
  {
    id: 'criteria-4',
    projectId: 'project-3',
    description: 'Design reviewed by stakeholders',
    isComplete: true,
  },
];

export const validCreateCriteriaInput: CreateSuccessCriteriaInput = {
  projectId: 'project-1',
  description: 'New success criteria',
  isComplete: false,
};

export const invalidCreateCriteriaInputs = {
  emptyDescription: {
    projectId: 'project-1',
    description: '',
    isComplete: false,
  },
  emptyProjectId: {
    projectId: '',
    description: 'Test criteria',
    isComplete: false,
  },
};
