/**
 * DelegationContext
 * Composes focused hooks to provide unified state management
 * Maintains backward-compatible synchronous API for existing components
 */

import React, { createContext, useContext, useMemo, useCallback, useState, useEffect, ReactNode } from 'react';
import { Profile, Project, SuccessCriteria } from '@/domain';
import { initializeRepositories, Repositories } from '@/repositories';
import { useProfiles } from '@/hooks/useProfiles';
import { useProjects } from '@/hooks/useProjects';
import { useSuccessCriteria } from '@/hooks/useSuccessCriteria';
import { getInitialData, seedRepositories } from '@/data';

// Backward-compatible interface (synchronous returns)
interface DelegationContextType {
  profiles: Profile[];
  projects: Project[];
  successCriteria: SuccessCriteria[];
  addProfile: (profile: Omit<Profile, 'id'>) => Profile;
  updateProfile: (id: string, profile: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Project;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addSuccessCriteria: (criteria: Omit<SuccessCriteria, 'id'>) => SuccessCriteria;
  updateSuccessCriteria: (id: string, criteria: Partial<SuccessCriteria>) => void;
  deleteSuccessCriteria: (id: string) => void;
  getProjectCriteria: (projectId: string) => SuccessCriteria[];
  getProfileProjects: (profileId: string) => Project[];
}

const DelegationContext = createContext<DelegationContextType | undefined>(undefined);

export function DelegationProvider({ children }: { children: ReactNode }) {
  // Repository state with async initialization support
  const [repos, setRepos] = useState<Repositories | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get initial data based on demo mode
  const initialData = useMemo(() => getInitialData(), []);

  // Initialize repositories (async for SQLite, sync for memory)
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const repositories = await initializeRepositories();
      if (!cancelled) {
        await seedRepositories(repositories);
        setRepos(repositories);
        setIsLoading(false);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  // Use focused hooks (only when repos are initialized)
  const profilesHook = useProfiles(
    repos?.profiles ?? null,
    repos?.projects ?? null,
    initialData.profiles
  );
  const projectsHook = useProjects(
    repos?.projects ?? null,
    repos?.criteria ?? null,
    initialData.projects
  );
  const criteriaHook = useSuccessCriteria(repos?.criteria ?? null, initialData.criteria);

  // Synchronous wrappers for backward compatibility
  const addProfile = useCallback(
    (input: Omit<Profile, 'id'>): Profile => {
      // Optimistic: create a temporary profile
      const tempProfile: Profile = {
        ...input,
        id: Math.random().toString(36).substring(2, 11),
      };

      // Fire async operation
      profilesHook.addProfile(input);

      return tempProfile;
    },
    [profilesHook]
  );

  const updateProfile = useCallback(
    (id: string, input: Partial<Profile>): void => {
      profilesHook.updateProfile(id, input);
    },
    [profilesHook]
  );

  const deleteProfile = useCallback(
    (id: string): void => {
      profilesHook.deleteProfile(id).then(() => {
        // Sync projects state after profile deletion
        projectsHook.removeProjectsByProfileId(id);
      });
    },
    [profilesHook, projectsHook]
  );

  const addProject = useCallback(
    (input: Omit<Project, 'id' | 'createdAt'>): Project => {
      const tempProject: Project = {
        ...input,
        id: Math.random().toString(36).substring(2, 11),
        createdAt: new Date().toISOString(),
      };

      projectsHook.addProject(input);

      return tempProject;
    },
    [projectsHook]
  );

  const updateProject = useCallback(
    (id: string, input: Partial<Project>): void => {
      projectsHook.updateProject(id, input);
    },
    [projectsHook]
  );

  const deleteProject = useCallback(
    (id: string): void => {
      projectsHook.deleteProject(id).then(() => {
        // Sync criteria state after project deletion
        criteriaHook.removeCriteriaByProjectId(id);
      });
    },
    [projectsHook, criteriaHook]
  );

  const addSuccessCriteria = useCallback(
    (input: Omit<SuccessCriteria, 'id'>): SuccessCriteria => {
      const tempCriteria: SuccessCriteria = {
        ...input,
        id: Math.random().toString(36).substring(2, 11),
      };

      criteriaHook.addSuccessCriteria(input);

      return tempCriteria;
    },
    [criteriaHook]
  );

  const updateSuccessCriteria = useCallback(
    (id: string, input: Partial<SuccessCriteria>): void => {
      criteriaHook.updateSuccessCriteria(id, input);
    },
    [criteriaHook]
  );

  const deleteSuccessCriteria = useCallback(
    (id: string): void => {
      criteriaHook.deleteSuccessCriteria(id);
    },
    [criteriaHook]
  );

  const value = useMemo<DelegationContextType>(
    () => ({
      profiles: profilesHook.profiles,
      projects: projectsHook.projects,
      successCriteria: criteriaHook.successCriteria,
      addProfile,
      updateProfile,
      deleteProfile,
      addProject,
      updateProject,
      deleteProject,
      addSuccessCriteria,
      updateSuccessCriteria,
      deleteSuccessCriteria,
      getProjectCriteria: criteriaHook.getProjectCriteria,
      getProfileProjects: projectsHook.getProfileProjects,
    }),
    [
      profilesHook.profiles,
      projectsHook.projects,
      criteriaHook.successCriteria,
      addProfile,
      updateProfile,
      deleteProfile,
      addProject,
      updateProject,
      deleteProject,
      addSuccessCriteria,
      updateSuccessCriteria,
      deleteSuccessCriteria,
      criteriaHook.getProjectCriteria,
      projectsHook.getProfileProjects,
    ]
  );

  // Show loading state while repositories initialize
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <DelegationContext.Provider value={value}>
      {children}
    </DelegationContext.Provider>
  );
}

export function useDelegation() {
  const context = useContext(DelegationContext);
  if (!context) {
    throw new Error('useDelegation must be used within a DelegationProvider');
  }
  return context;
}
