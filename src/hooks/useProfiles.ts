/**
 * Profiles hook
 * Focused hook for profile state management (ISP, SRP)
 */

import { useState, useCallback, useEffect } from 'react';
import { Profile, CreateProfileInput, UpdateProfileInput } from '@/domain';
import { IProfileRepository, IProjectRepository } from '@/repositories';

export interface UseProfilesResult {
  profiles: Profile[];
  addProfile: (input: CreateProfileInput) => Promise<Profile>;
  updateProfile: (id: string, input: UpdateProfileInput) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
}

export function useProfiles(
  profileRepo: IProfileRepository | null,
  projectRepo: IProjectRepository | null,
  initialProfiles: Profile[] = []
): UseProfilesResult {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);

  // Load data from repository when it becomes available
  useEffect(() => {
    if (profileRepo) {
      profileRepo.getAll().then(setProfiles);
    }
  }, [profileRepo]);

  const addProfile = useCallback(
    async (input: CreateProfileInput): Promise<Profile> => {
      if (!profileRepo) {
        throw new Error('Profile repository not initialized');
      }
      const newProfile = await profileRepo.create(input);
      setProfiles((prev) => [...prev, newProfile]);
      return newProfile;
    },
    [profileRepo]
  );

  const updateProfile = useCallback(
    async (id: string, input: UpdateProfileInput): Promise<void> => {
      if (!profileRepo) return;
      const updated = await profileRepo.update(id, input);
      if (updated) {
        setProfiles((prev) => prev.map((p) => (p.id === id ? updated : p)));
      }
    },
    [profileRepo]
  );

  const deleteProfile = useCallback(
    async (id: string): Promise<void> => {
      if (!profileRepo || !projectRepo) return;
      const deleted = await profileRepo.delete(id);
      if (deleted) {
        // Cascade delete projects for this profile
        await projectRepo.deleteByProfileId(id);
        setProfiles((prev) => prev.filter((p) => p.id !== id));
      }
    },
    [profileRepo, projectRepo]
  );

  return {
    profiles,
    addProfile,
    updateProfile,
    deleteProfile,
  };
}
