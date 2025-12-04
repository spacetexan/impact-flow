import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSuccessCriteria } from './useSuccessCriteria';
import { createMockCriteriaRepository } from '@/test/mocks/repositories';
import { testCriteria } from '@/test/fixtures';
import { SuccessCriteria } from '@/domain';

describe('useSuccessCriteria', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('initializes with provided initial criteria', () => {
      const mockCriteriaRepo = createMockCriteriaRepository();

      const { result } = renderHook(() =>
        useSuccessCriteria(mockCriteriaRepo, testCriteria)
      );

      expect(result.current.successCriteria).toEqual(testCriteria);
    });

    it('initializes with empty array when no initial data', () => {
      const mockCriteriaRepo = createMockCriteriaRepository();

      const { result } = renderHook(() =>
        useSuccessCriteria(mockCriteriaRepo, [])
      );

      expect(result.current.successCriteria).toEqual([]);
    });

    it('loads criteria from repository on mount', async () => {
      const repoCriteria: SuccessCriteria[] = [
        {
          id: 'repo-1',
          projectId: 'project-1',
          description: 'Repo Criteria',
          isComplete: false,
        },
      ];
      const mockCriteriaRepo = createMockCriteriaRepository(repoCriteria);

      const { result } = renderHook(() =>
        useSuccessCriteria(mockCriteriaRepo, [])
      );

      await waitFor(() => {
        expect(result.current.successCriteria).toHaveLength(1);
        expect(result.current.successCriteria[0].description).toBe('Repo Criteria');
      });

      expect(mockCriteriaRepo.getAll).toHaveBeenCalled();
    });
  });

  describe('addSuccessCriteria', () => {
    it('adds criteria and updates state', async () => {
      const mockCriteriaRepo = createMockCriteriaRepository();

      const { result } = renderHook(() =>
        useSuccessCriteria(mockCriteriaRepo, [])
      );

      const input = {
        projectId: 'project-1',
        description: 'New criteria',
        isComplete: false,
      };

      await act(async () => {
        await result.current.addSuccessCriteria(input);
      });

      expect(mockCriteriaRepo.create).toHaveBeenCalledWith(input);

      await waitFor(() => {
        expect(result.current.successCriteria).toHaveLength(1);
        expect(result.current.successCriteria[0].description).toBe('New criteria');
      });
    });

    it('returns the created criteria with id', async () => {
      const mockCriteriaRepo = createMockCriteriaRepository();

      const { result } = renderHook(() =>
        useSuccessCriteria(mockCriteriaRepo, [])
      );

      let createdCriteria: SuccessCriteria | null = null;
      await act(async () => {
        createdCriteria = await result.current.addSuccessCriteria({
          projectId: 'project-1',
          description: 'New criteria',
          isComplete: false,
        });
      });

      expect(createdCriteria).toBeDefined();
      expect(createdCriteria!.id).toBeDefined();
      expect(createdCriteria!.description).toBe('New criteria');
    });

    it('throws error when repository not initialized', async () => {
      const { result } = renderHook(() => useSuccessCriteria(null, []));

      await expect(
        result.current.addSuccessCriteria({
          projectId: 'project-1',
          description: 'Test',
          isComplete: false,
        })
      ).rejects.toThrow('Criteria repository not initialized');
    });
  });

  describe('updateSuccessCriteria', () => {
    it('updates criteria in state', async () => {
      const mockCriteriaRepo = createMockCriteriaRepository(testCriteria);

      const { result } = renderHook(() =>
        useSuccessCriteria(mockCriteriaRepo, testCriteria)
      );

      await act(async () => {
        await result.current.updateSuccessCriteria('criteria-1', {
          isComplete: false,
        });
      });

      expect(mockCriteriaRepo.update).toHaveBeenCalledWith('criteria-1', {
        isComplete: false,
      });

      await waitFor(() => {
        const updated = result.current.successCriteria.find(
          (c) => c.id === 'criteria-1'
        );
        expect(updated?.isComplete).toBe(false);
      });
    });

    it('updates description', async () => {
      const mockCriteriaRepo = createMockCriteriaRepository(testCriteria);

      const { result } = renderHook(() =>
        useSuccessCriteria(mockCriteriaRepo, testCriteria)
      );

      await act(async () => {
        await result.current.updateSuccessCriteria('criteria-1', {
          description: 'Updated description',
        });
      });

      await waitFor(() => {
        const updated = result.current.successCriteria.find(
          (c) => c.id === 'criteria-1'
        );
        expect(updated?.description).toBe('Updated description');
      });
    });

    it('does nothing when repository not initialized', async () => {
      const { result } = renderHook(() =>
        useSuccessCriteria(null, testCriteria)
      );

      await act(async () => {
        await result.current.updateSuccessCriteria('criteria-1', {
          isComplete: false,
        });
      });

      // Should remain unchanged
      expect(result.current.successCriteria[0].isComplete).toBe(true);
    });
  });

  describe('deleteSuccessCriteria', () => {
    it('deletes criteria from state', async () => {
      const mockCriteriaRepo = createMockCriteriaRepository(testCriteria);

      const { result } = renderHook(() =>
        useSuccessCriteria(mockCriteriaRepo, testCriteria)
      );

      const initialLength = result.current.successCriteria.length;

      await act(async () => {
        await result.current.deleteSuccessCriteria('criteria-1');
      });

      expect(mockCriteriaRepo.delete).toHaveBeenCalledWith('criteria-1');

      await waitFor(() => {
        expect(result.current.successCriteria).toHaveLength(initialLength - 1);
        expect(
          result.current.successCriteria.find((c) => c.id === 'criteria-1')
        ).toBeUndefined();
      });
    });

    it('does nothing when repository not initialized', async () => {
      const { result } = renderHook(() =>
        useSuccessCriteria(null, testCriteria)
      );

      await act(async () => {
        await result.current.deleteSuccessCriteria('criteria-1');
      });

      expect(result.current.successCriteria).toHaveLength(testCriteria.length);
    });
  });

  describe('getProjectCriteria', () => {
    it('returns criteria for a specific project', () => {
      const mockCriteriaRepo = createMockCriteriaRepository();

      const { result } = renderHook(() =>
        useSuccessCriteria(mockCriteriaRepo, testCriteria)
      );

      const project1Criteria = result.current.getProjectCriteria('project-1');
      expect(project1Criteria).toHaveLength(2);
      expect(project1Criteria.every((c) => c.projectId === 'project-1')).toBe(true);
    });

    it('returns empty array for project with no criteria', () => {
      const mockCriteriaRepo = createMockCriteriaRepository();

      const { result } = renderHook(() =>
        useSuccessCriteria(mockCriteriaRepo, testCriteria)
      );

      const noCriteria = result.current.getProjectCriteria('nonexistent');
      expect(noCriteria).toEqual([]);
    });
  });

  describe('removeCriteriaByProjectId', () => {
    it('removes all criteria for a project from state', () => {
      const mockCriteriaRepo = createMockCriteriaRepository();

      const { result } = renderHook(() =>
        useSuccessCriteria(mockCriteriaRepo, testCriteria)
      );

      act(() => {
        result.current.removeCriteriaByProjectId('project-1');
      });

      expect(
        result.current.successCriteria.filter((c) => c.projectId === 'project-1')
      ).toHaveLength(0);
      // Other project's criteria should remain
      expect(
        result.current.successCriteria.filter((c) => c.projectId !== 'project-1')
      ).toHaveLength(2);
    });
  });
});
