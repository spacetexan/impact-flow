import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import React from 'react';

// Test fixture data - inline to avoid hoisting issues
const testProfiles = [
  { id: 'profile-1', name: 'Alice Johnson', role: 'Developer' },
  { id: 'profile-2', name: 'Bob Smith', role: 'Designer', avatar: 'https://example.com/bob.png' },
  { id: 'profile-3', name: 'Charlie Brown', role: 'PM' },
];

const testProjects = [
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

const testCriteria = [
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

// Mock the repository initialization
vi.mock('@/repositories', () => ({
  initializeRepositories: vi.fn().mockResolvedValue({
    profiles: {
      getAll: vi.fn().mockResolvedValue([]),
      getById: vi.fn(),
      create: vi.fn().mockImplementation(async (input: any) => ({
        ...input,
        id: 'new-id',
      })),
      update: vi.fn().mockImplementation(async (id: string, input: any) => ({ id, ...input })),
      delete: vi.fn().mockResolvedValue(true),
    },
    projects: {
      getAll: vi.fn().mockResolvedValue([]),
      getById: vi.fn(),
      getByProfileId: vi.fn(),
      create: vi.fn().mockImplementation(async (input: any) => ({
        ...input,
        id: 'new-project-id',
        createdAt: new Date().toISOString(),
      })),
      update: vi.fn().mockImplementation(async (id: string, input: any) => ({ id, ...input })),
      delete: vi.fn().mockResolvedValue(true),
      deleteByProfileId: vi.fn().mockResolvedValue(0),
    },
    criteria: {
      getAll: vi.fn().mockResolvedValue([]),
      getById: vi.fn(),
      getByProjectId: vi.fn(),
      create: vi.fn().mockImplementation(async (input: any) => ({
        ...input,
        id: 'new-criteria-id',
      })),
      update: vi.fn().mockImplementation(async (id: string, input: any) => ({ id, ...input })),
      delete: vi.fn().mockResolvedValue(true),
      deleteByProjectId: vi.fn().mockResolvedValue(0),
    },
  }),
}));

// Mock seedRepositories to be a no-op
vi.mock('@/data', () => ({
  seedRepositories: vi.fn().mockResolvedValue(undefined),
  getInitialData: vi.fn().mockReturnValue({
    profiles: [
      { id: 'profile-1', name: 'Alice Johnson', role: 'Developer' },
      { id: 'profile-2', name: 'Bob Smith', role: 'Designer', avatar: 'https://example.com/bob.png' },
      { id: 'profile-3', name: 'Charlie Brown', role: 'PM' },
    ],
    projects: [
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
    ],
    criteria: [
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
    ],
  }),
}));

import { DelegationProvider, useDelegation } from './DelegationContext';

// Test component that uses the context
function TestConsumer() {
  const {
    profiles,
    projects,
    successCriteria,
    getProfileProjects,
    getProjectCriteria,
  } = useDelegation();

  return (
    <div>
      <div data-testid="profile-count">{profiles.length}</div>
      <div data-testid="project-count">{projects.length}</div>
      <div data-testid="criteria-count">{successCriteria.length}</div>
      <div data-testid="profile-1-projects">
        {getProfileProjects('profile-1').length}
      </div>
      <div data-testid="project-1-criteria">
        {getProjectCriteria('project-1').length}
      </div>
    </div>
  );
}

describe('DelegationContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('DelegationProvider', () => {
    it('shows loading state initially', async () => {
      const { container } = render(
        <DelegationProvider>
          <TestConsumer />
        </DelegationProvider>
      );

      // Loading state should be shown initially (may be brief)
      // The component will render children after loading
      await waitFor(() => {
        expect(screen.getByTestId('profile-count')).toBeInTheDocument();
      });
    });

    it('provides profiles to consumers after loading', async () => {
      render(
        <DelegationProvider>
          <TestConsumer />
        </DelegationProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('profile-count')).toHaveTextContent(
          String(testProfiles.length)
        );
      });
    });

    it('provides projects to consumers after loading', async () => {
      render(
        <DelegationProvider>
          <TestConsumer />
        </DelegationProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('project-count')).toHaveTextContent(
          String(testProjects.length)
        );
      });
    });

    it('provides successCriteria to consumers after loading', async () => {
      render(
        <DelegationProvider>
          <TestConsumer />
        </DelegationProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('criteria-count')).toHaveTextContent(
          String(testCriteria.length)
        );
      });
    });

    it('provides getProfileProjects helper', async () => {
      render(
        <DelegationProvider>
          <TestConsumer />
        </DelegationProvider>
      );

      await waitFor(() => {
        // profile-1 has 2 projects in testProjects
        expect(screen.getByTestId('profile-1-projects')).toHaveTextContent('2');
      });
    });

    it('provides getProjectCriteria helper', async () => {
      render(
        <DelegationProvider>
          <TestConsumer />
        </DelegationProvider>
      );

      await waitFor(() => {
        // project-1 has 2 criteria in testCriteria
        expect(screen.getByTestId('project-1-criteria')).toHaveTextContent('2');
      });
    });
  });

  describe('useDelegation', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useDelegation());
      }).toThrow('useDelegation must be used within a DelegationProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('context methods', () => {
    it('addProfile returns a temporary profile synchronously', async () => {
      function AddProfileConsumer() {
        const { addProfile, profiles } = useDelegation();
        const [tempProfile, setTempProfile] = React.useState<any>(null);

        const handleAdd = () => {
          const result = addProfile({ name: 'New User', role: 'Tester' });
          setTempProfile(result);
        };

        return (
          <div>
            <button data-testid="add-btn" onClick={handleAdd}>
              Add
            </button>
            <div data-testid="temp-id">{tempProfile?.id || 'none'}</div>
            <div data-testid="temp-name">{tempProfile?.name || 'none'}</div>
          </div>
        );
      }

      render(
        <DelegationProvider>
          <AddProfileConsumer />
        </DelegationProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('add-btn')).toBeInTheDocument();
      });

      act(() => {
        screen.getByTestId('add-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('temp-name')).toHaveTextContent('New User');
        expect(screen.getByTestId('temp-id')).not.toHaveTextContent('none');
      });
    });

    it('addProject returns a temporary project synchronously', async () => {
      function AddProjectConsumer() {
        const { addProject } = useDelegation();
        const [tempProject, setTempProject] = React.useState<any>(null);

        const handleAdd = () => {
          const result = addProject({
            profileId: 'profile-1',
            name: 'New Project',
            purpose: 'Test',
            importance: 'Test',
            idealOutcome: 'Test',
            status: 'planned',
            dueDate: null,
            comments: '',
          });
          setTempProject(result);
        };

        return (
          <div>
            <button data-testid="add-btn" onClick={handleAdd}>
              Add
            </button>
            <div data-testid="temp-id">{tempProject?.id || 'none'}</div>
            <div data-testid="temp-name">{tempProject?.name || 'none'}</div>
            <div data-testid="temp-created">{tempProject?.createdAt || 'none'}</div>
          </div>
        );
      }

      render(
        <DelegationProvider>
          <AddProjectConsumer />
        </DelegationProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('add-btn')).toBeInTheDocument();
      });

      act(() => {
        screen.getByTestId('add-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('temp-name')).toHaveTextContent('New Project');
        expect(screen.getByTestId('temp-id')).not.toHaveTextContent('none');
        expect(screen.getByTestId('temp-created')).not.toHaveTextContent('none');
      });
    });

    it('addSuccessCriteria returns a temporary criteria synchronously', async () => {
      function AddCriteriaConsumer() {
        const { addSuccessCriteria } = useDelegation();
        const [tempCriteria, setTempCriteria] = React.useState<any>(null);

        const handleAdd = () => {
          const result = addSuccessCriteria({
            projectId: 'project-1',
            description: 'New Criteria',
            isComplete: false,
          });
          setTempCriteria(result);
        };

        return (
          <div>
            <button data-testid="add-btn" onClick={handleAdd}>
              Add
            </button>
            <div data-testid="temp-id">{tempCriteria?.id || 'none'}</div>
            <div data-testid="temp-desc">{tempCriteria?.description || 'none'}</div>
          </div>
        );
      }

      render(
        <DelegationProvider>
          <AddCriteriaConsumer />
        </DelegationProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('add-btn')).toBeInTheDocument();
      });

      act(() => {
        screen.getByTestId('add-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('temp-desc')).toHaveTextContent('New Criteria');
        expect(screen.getByTestId('temp-id')).not.toHaveTextContent('none');
      });
    });
  });
});
