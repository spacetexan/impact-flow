import { Project, CreateProjectInput } from '@/domain';

export const testProjects: Project[] = [
  {
    id: 'project-1',
    profileId: 'profile-1',
    name: 'Build Dashboard',
    purpose: 'Visualize team metrics',
    importance: 'Critical for team visibility',
    idealOutcome: 'Interactive dashboard with real-time data',
    status: 'in_progress',
    dueDate: '2024-12-31',
    comments: 'Started last week',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'project-2',
    profileId: 'profile-1',
    name: 'API Integration',
    purpose: 'Connect to external services',
    importance: 'Enables automation',
    idealOutcome: 'Seamless data sync',
    status: 'planned',
    dueDate: null,
    comments: '',
    createdAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 'project-3',
    profileId: 'profile-2',
    name: 'UI Redesign',
    purpose: 'Improve user experience',
    importance: 'User feedback requests this',
    idealOutcome: 'Modern, accessible design',
    status: 'complete',
    dueDate: '2024-06-30',
    comments: 'Completed ahead of schedule',
    createdAt: '2024-01-03T00:00:00.000Z',
  },
];

export const validCreateProjectInput: CreateProjectInput = {
  profileId: 'profile-1',
  name: 'New Project',
  purpose: 'Test purpose',
  importance: 'Test importance',
  idealOutcome: 'Test outcome',
  status: 'planned',
  dueDate: null,
  comments: '',
};

export const invalidCreateProjectInputs = {
  emptyName: {
    profileId: 'profile-1',
    name: '',
    purpose: 'Test',
    importance: 'Test',
    idealOutcome: 'Test',
    status: 'planned' as const,
    dueDate: null,
    comments: '',
  },
  emptyProfileId: {
    profileId: '',
    name: 'Test Project',
    purpose: 'Test',
    importance: 'Test',
    idealOutcome: 'Test',
    status: 'planned' as const,
    dueDate: null,
    comments: '',
  },
  invalidStatus: {
    profileId: 'profile-1',
    name: 'Test Project',
    purpose: 'Test',
    importance: 'Test',
    idealOutcome: 'Test',
    status: 'invalid_status',
    dueDate: null,
    comments: '',
  },
};
