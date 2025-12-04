import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProjects } from './useProjects';
import { createMockProjectRepository, createMockCriteriaRepository } from '@/test/mocks/repositories';
import { testProjects } from '@/test/fixtures';
import { Project } from '@/domain';

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('initializes with provided initial projects', () => {
      const mockProjectRepo = createMockProjectRepository();
      const mockCriteriaRepo = createMockCriteriaRepository();

      const { result } = renderHook(() =>
        useProjects(mockProjectRepo, mockCriteriaRepo, testProjects)
      );

      expect(result.current.projects).toEqual(testProjects);
    });

    it('initializes with empty array when no initial data', () => {
      const mockProjectRepo = createMockProjectRepository();
      const mockCriteriaRepo = createMockCriteriaRepository();

      const { result } = renderHook(() =>
        useProjects(mockProjectRepo, mockCriteriaRepo, [])
      );

      expect(result.current.projects).toEqual([]);
    });

    it('loads projects from repository on mount', async () => {
      const repoProjects: Project[] = [
        {
          id: 'repo-1',
          profileId: 'profile-1',
          name: 'Repo Project',
          purpose: 'Test',
          importance: 'Test',
          idealOutcome: 'Test',
          status: 'planned',
          dueDate: null,
          comments: '',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      const mockProjectRepo = createMockProjectRepository(repoProjects);
      const mockCriteriaRepo = createMockCriteriaRepository();

      const { result } = renderHook(() =>
        useProjects(mockProjectRepo, mockCriteriaRepo, [])
      );

      await waitFor(() => {
        expect(result.current.projects).toHaveLength(1);
        expect(result.current.projects[0].name).toBe('Repo Project');
      });

      expect(mockProjectRepo.getAll).toHaveBeenCalled();
    });
  });

  describe('addProject', () => {
    it('adds a project and updates state', async () => {
      const mockProjectRepo = createMockProjectRepository();
      const mockCriteriaRepo = createMockCriteriaRepository();

      const { result } = renderHook(() =>
        useProjects(mockProjectRepo, mockCriteriaRepo, [])
      );

      const input = {
        profileId: 'profile-1',
        name: 'New Project',
        purpose: 'Test purpose',
        importance: 'Test importance',
        idealOutcome: 'Test outcome',
        status: 'planned' as const,
        dueDate: null,
        comments: '',
      };

      await act(async () => {
        await result.current.addProject(input);
      });

      expect(mockProjectRepo.create).toHaveBeenCalledWith(input);

      await waitFor(() => {
        expect(result.current.projects).toHaveLength(1);
        expect(result.current.projects[0].name).toBe('New Project');
      });
    });

    it('returns the created project with id and createdAt', async () => {
      const mockProjectRepo = createMockProjectRepository();
      const mockCriteriaRepo = createMockCriteriaRepository();

      const { result } = renderHook(() =>
        useProjects(mockProjectRepo, mockCriteriaRepo, [])
      );

      let createdProject: Project | null = null;
      await act(async () => {
        createdProject = await result.current.addProject({
          profileId: 'profile-1',
          name: 'New Project',
          purpose: 'Test',
          importance: 'Test',
          idealOutcome: 'Test',
          status: 'planned',
          dueDate: null,
          comments: '',
        });
      });

      expect(createdProject).toBeDefined();
      expect(createdProject!.id).toBeDefined();
      expect(createdProject!.createdAt).toBeDefined();
    });

    it('throws error when repository not initialized', async () => {
      const { result } = renderHook(() => useProjects(null, null, []));

      await expect(
        result.current.addProject({
          profileId: 'profile-1',
          name: 'Test',
          purpose: 'Test',
          importance: 'Test',
          idealOutcome: 'Test',
          status: 'planned',
          dueDate: null,
          comments: '',
        })
      ).rejects.toThrow('Project repository not initialized');
    });
  });

  describe('updateProject', () => {
    it('updates a project in state', async () => {
      const mockProjectRepo = createMockProjectRepository(testProjects);
      const mockCriteriaRepo = createMockCriteriaRepository();

      const { result } = renderHook(() =>
        useProjects(mockProjectRepo, mockCriteriaRepo, testProjects)
      );

      await act(async () => {
        await result.current.updateProject('project-1', { status: 'complete' });
      });

      expect(mockProjectRepo.update).toHaveBeenCalledWith('project-1', {
        status: 'complete',
      });

      await waitFor(() => {
        const updatedProject = result.current.projects.find(
          (p) => p.id === 'project-1'
        );
        expect(updatedProject?.status).toBe('complete');
      });
    });

    it('does nothing when repository not initialized', async () => {
      const { result } = renderHook(() =>
        useProjects(null, null, testProjects)
      );

      await act(async () => {
        await result.current.updateProject('project-1', { status: 'complete' });
      });

      // Status should remain unchanged
      expect(result.current.projects[0].status).toBe('in_progress');
    });
  });

  describe('deleteProject', () => {
    it('deletes a project and cascades to criteria', async () => {
      const mockProjectRepo = createMockProjectRepository(testProjects);
      const mockCriteriaRepo = createMockCriteriaRepository();

      const { result } = renderHook(() =>
        useProjects(mockProjectRepo, mockCriteriaRepo, testProjects)
      );

      const initialLength = result.current.projects.length;

      await act(async () => {
        await result.current.deleteProject('project-1');
      });

      expect(mockProjectRepo.delete).toHaveBeenCalledWith('project-1');
      expect(mockCriteriaRepo.deleteByProjectId).toHaveBeenCalledWith('project-1');

      await waitFor(() => {
        expect(result.current.projects).toHaveLength(initialLength - 1);
        expect(result.current.projects.find((p) => p.id === 'project-1')).toBeUndefined();
      });
    });

    it('does nothing when project repository not initialized', async () => {
      const mockCriteriaRepo = createMockCriteriaRepository();

      const { result } = renderHook(() =>
        useProjects(null, mockCriteriaRepo, testProjects)
      );

      await act(async () => {
        await result.current.deleteProject('project-1');
      });

      expect(result.current.projects).toHaveLength(testProjects.length);
    });

    it('does nothing when criteria repository not initialized', async () => {
      const mockProjectRepo = createMockProjectRepository(testProjects);

      const { result } = renderHook(() =>
        useProjects(mockProjectRepo, null, testProjects)
      );

      await act(async () => {
        await result.current.deleteProject('project-1');
      });

      // Should not delete since both repos needed
      expect(result.current.projects).toHaveLength(testProjects.length);
    });
  });

  describe('getProfileProjects', () => {
    it('returns projects for a specific profile', () => {
      const mockProjectRepo = createMockProjectRepository();
      const mockCriteriaRepo = createMockCriteriaRepository();

      const { result } = renderHook(() =>
        useProjects(mockProjectRepo, mockCriteriaRepo, testProjects)
      );

      const profile1Projects = result.current.getProfileProjects('profile-1');
      expect(profile1Projects).toHaveLength(2);
      expect(profile1Projects.every((p) => p.profileId === 'profile-1')).toBe(true);
    });

    it('returns empty array for profile with no projects', () => {
      const mockProjectRepo = createMockProjectRepository();
      const mockCriteriaRepo = createMockCriteriaRepository();

      const { result } = renderHook(() =>
        useProjects(mockProjectRepo, mockCriteriaRepo, testProjects)
      );

      const noProjects = result.current.getProfileProjects('nonexistent');
      expect(noProjects).toEqual([]);
    });
  });

  describe('removeProjectsByProfileId', () => {
    it('removes all projects for a profile from state', () => {
      const mockProjectRepo = createMockProjectRepository();
      const mockCriteriaRepo = createMockCriteriaRepository();

      const { result } = renderHook(() =>
        useProjects(mockProjectRepo, mockCriteriaRepo, testProjects)
      );

      act(() => {
        result.current.removeProjectsByProfileId('profile-1');
      });

      expect(result.current.projects.filter((p) => p.profileId === 'profile-1')).toHaveLength(0);
      // Other profile's projects should remain
      expect(result.current.projects.filter((p) => p.profileId === 'profile-2')).toHaveLength(1);
    });
  });
});
