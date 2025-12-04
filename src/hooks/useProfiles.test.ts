import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProfiles } from './useProfiles';
import { createMockProfileRepository, createMockProjectRepository } from '@/test/mocks/repositories';
import { testProfiles } from '@/test/fixtures';
import { Profile } from '@/domain';

describe('useProfiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('initializes with provided initial profiles', () => {
      const mockProfileRepo = createMockProfileRepository();
      const mockProjectRepo = createMockProjectRepository();

      const { result } = renderHook(() =>
        useProfiles(mockProfileRepo, mockProjectRepo, testProfiles)
      );

      expect(result.current.profiles).toEqual(testProfiles);
    });

    it('initializes with empty array when no initial data', () => {
      const mockProfileRepo = createMockProfileRepository();
      const mockProjectRepo = createMockProjectRepository();

      const { result } = renderHook(() =>
        useProfiles(mockProfileRepo, mockProjectRepo, [])
      );

      expect(result.current.profiles).toEqual([]);
    });

    it('loads profiles from repository on mount', async () => {
      const repoProfiles: Profile[] = [
        { id: 'repo-1', name: 'Repo User', role: 'Developer' },
      ];
      const mockProfileRepo = createMockProfileRepository(repoProfiles);
      const mockProjectRepo = createMockProjectRepository();

      const { result } = renderHook(() =>
        useProfiles(mockProfileRepo, mockProjectRepo, [])
      );

      await waitFor(() => {
        expect(result.current.profiles).toHaveLength(1);
        expect(result.current.profiles[0].name).toBe('Repo User');
      });

      expect(mockProfileRepo.getAll).toHaveBeenCalled();
    });
  });

  describe('addProfile', () => {
    it('adds a profile and updates state', async () => {
      const mockProfileRepo = createMockProfileRepository();
      const mockProjectRepo = createMockProjectRepository();

      const { result } = renderHook(() =>
        useProfiles(mockProfileRepo, mockProjectRepo, [])
      );

      await act(async () => {
        await result.current.addProfile({ name: 'New User', role: 'Tester' });
      });

      expect(mockProfileRepo.create).toHaveBeenCalledWith({
        name: 'New User',
        role: 'Tester',
      });

      await waitFor(() => {
        expect(result.current.profiles).toHaveLength(1);
        expect(result.current.profiles[0].name).toBe('New User');
        expect(result.current.profiles[0].role).toBe('Tester');
      });
    });

    it('returns the created profile', async () => {
      const mockProfileRepo = createMockProfileRepository();
      const mockProjectRepo = createMockProjectRepository();

      const { result } = renderHook(() =>
        useProfiles(mockProfileRepo, mockProjectRepo, [])
      );

      let createdProfile: Profile | null = null;
      await act(async () => {
        createdProfile = await result.current.addProfile({
          name: 'New User',
          role: 'Tester',
        });
      });

      expect(createdProfile).toBeDefined();
      expect(createdProfile!.name).toBe('New User');
      expect(createdProfile!.id).toBeDefined();
    });

    it('throws error when repository not initialized', async () => {
      const { result } = renderHook(() => useProfiles(null, null, []));

      await expect(
        result.current.addProfile({ name: 'Test', role: 'Test' })
      ).rejects.toThrow('Profile repository not initialized');
    });
  });

  describe('updateProfile', () => {
    it('updates a profile in state', async () => {
      const initialProfiles: Profile[] = [
        { id: 'test-1', name: 'Original', role: 'Developer' },
      ];
      const mockProfileRepo = createMockProfileRepository(initialProfiles);
      const mockProjectRepo = createMockProjectRepository();

      const { result } = renderHook(() =>
        useProfiles(mockProfileRepo, mockProjectRepo, initialProfiles)
      );

      await act(async () => {
        await result.current.updateProfile('test-1', { name: 'Updated' });
      });

      expect(mockProfileRepo.update).toHaveBeenCalledWith('test-1', {
        name: 'Updated',
      });

      await waitFor(() => {
        expect(result.current.profiles[0].name).toBe('Updated');
        expect(result.current.profiles[0].role).toBe('Developer'); // unchanged
      });
    });

    it('does nothing when repository not initialized', async () => {
      const initialProfiles: Profile[] = [
        { id: 'test-1', name: 'Original', role: 'Developer' },
      ];

      const { result } = renderHook(() =>
        useProfiles(null, null, initialProfiles)
      );

      await act(async () => {
        await result.current.updateProfile('test-1', { name: 'Updated' });
      });

      // State should remain unchanged
      expect(result.current.profiles[0].name).toBe('Original');
    });
  });

  describe('deleteProfile', () => {
    it('deletes a profile and cascades to projects', async () => {
      const initialProfiles: Profile[] = [
        { id: 'test-1', name: 'To Delete', role: 'Test' },
      ];
      const mockProfileRepo = createMockProfileRepository(initialProfiles);
      const mockProjectRepo = createMockProjectRepository();

      const { result } = renderHook(() =>
        useProfiles(mockProfileRepo, mockProjectRepo, initialProfiles)
      );

      await act(async () => {
        await result.current.deleteProfile('test-1');
      });

      expect(mockProfileRepo.delete).toHaveBeenCalledWith('test-1');
      expect(mockProjectRepo.deleteByProfileId).toHaveBeenCalledWith('test-1');

      await waitFor(() => {
        expect(result.current.profiles).toHaveLength(0);
      });
    });

    it('does nothing when profile repository not initialized', async () => {
      const initialProfiles: Profile[] = [
        { id: 'test-1', name: 'Test', role: 'Test' },
      ];
      const mockProjectRepo = createMockProjectRepository();

      const { result } = renderHook(() =>
        useProfiles(null, mockProjectRepo, initialProfiles)
      );

      await act(async () => {
        await result.current.deleteProfile('test-1');
      });

      // State should remain unchanged
      expect(result.current.profiles).toHaveLength(1);
    });

    it('does nothing when project repository not initialized', async () => {
      const initialProfiles: Profile[] = [
        { id: 'test-1', name: 'Test', role: 'Test' },
      ];
      const mockProfileRepo = createMockProfileRepository(initialProfiles);

      const { result } = renderHook(() =>
        useProfiles(mockProfileRepo, null, initialProfiles)
      );

      await act(async () => {
        await result.current.deleteProfile('test-1');
      });

      // State should remain unchanged since both repos are needed
      expect(result.current.profiles).toHaveLength(1);
    });
  });
});
