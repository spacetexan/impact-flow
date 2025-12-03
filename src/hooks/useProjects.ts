/**
 * Projects hook
 * Focused hook for project state management (ISP, SRP)
 */

import { useState, useCallback, useEffect } from 'react';
import { Project, CreateProjectInput, UpdateProjectInput } from '@/domain';
import { IProjectRepository, ICriteriaRepository } from '@/repositories';

export interface UseProjectsResult {
  projects: Project[];
  addProject: (input: CreateProjectInput) => Promise<Project>;
  updateProject: (id: string, input: UpdateProjectInput) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProfileProjects: (profileId: string) => Project[];
  // Internal: allows parent to sync state when profiles are deleted
  removeProjectsByProfileId: (profileId: string) => void;
}

export function useProjects(
  projectRepo: IProjectRepository | null,
  criteriaRepo: ICriteriaRepository | null,
  initialProjects: Project[] = []
): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  // Load data from repository when it becomes available
  useEffect(() => {
    if (projectRepo) {
      projectRepo.getAll().then(setProjects);
    }
  }, [projectRepo]);

  const addProject = useCallback(
    async (input: CreateProjectInput): Promise<Project> => {
      if (!projectRepo) {
        throw new Error('Project repository not initialized');
      }
      const newProject = await projectRepo.create(input);
      setProjects((prev) => [...prev, newProject]);
      return newProject;
    },
    [projectRepo]
  );

  const updateProject = useCallback(
    async (id: string, input: UpdateProjectInput): Promise<void> => {
      if (!projectRepo) return;
      const updated = await projectRepo.update(id, input);
      if (updated) {
        setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      }
    },
    [projectRepo]
  );

  const deleteProject = useCallback(
    async (id: string): Promise<void> => {
      if (!projectRepo || !criteriaRepo) return;
      const deleted = await projectRepo.delete(id);
      if (deleted) {
        // Cascade delete criteria for this project
        await criteriaRepo.deleteByProjectId(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    },
    [projectRepo, criteriaRepo]
  );

  const getProfileProjects = useCallback(
    (profileId: string): Project[] => {
      return projects.filter((p) => p.profileId === profileId);
    },
    [projects]
  );

  const removeProjectsByProfileId = useCallback((profileId: string): void => {
    setProjects((prev) => prev.filter((p) => p.profileId !== profileId));
  }, []);

  return {
    projects,
    addProject,
    updateProject,
    deleteProject,
    getProfileProjects,
    removeProjectsByProfileId,
  };
}
