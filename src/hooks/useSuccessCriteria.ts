/**
 * SuccessCriteria hook
 * Focused hook for success criteria state management (ISP, SRP)
 */

import { useState, useCallback, useEffect } from 'react';
import { SuccessCriteria, CreateSuccessCriteriaInput, UpdateSuccessCriteriaInput } from '@/domain';
import { ICriteriaRepository } from '@/repositories';

export interface UseSuccessCriteriaResult {
  successCriteria: SuccessCriteria[];
  addSuccessCriteria: (input: CreateSuccessCriteriaInput) => Promise<SuccessCriteria>;
  updateSuccessCriteria: (id: string, input: UpdateSuccessCriteriaInput) => Promise<void>;
  deleteSuccessCriteria: (id: string) => Promise<void>;
  getProjectCriteria: (projectId: string) => SuccessCriteria[];
  // Internal: allows parent to sync state when projects are deleted
  removeCriteriaByProjectId: (projectId: string) => void;
}

export function useSuccessCriteria(
  criteriaRepo: ICriteriaRepository | null,
  initialCriteria: SuccessCriteria[] = []
): UseSuccessCriteriaResult {
  const [successCriteria, setSuccessCriteria] = useState<SuccessCriteria[]>(initialCriteria);

  // Load data from repository when it becomes available
  useEffect(() => {
    if (criteriaRepo) {
      criteriaRepo.getAll().then(setSuccessCriteria);
    }
  }, [criteriaRepo]);

  const addSuccessCriteria = useCallback(
    async (input: CreateSuccessCriteriaInput): Promise<SuccessCriteria> => {
      if (!criteriaRepo) {
        throw new Error('Criteria repository not initialized');
      }
      const newCriteria = await criteriaRepo.create(input);
      setSuccessCriteria((prev) => [...prev, newCriteria]);
      return newCriteria;
    },
    [criteriaRepo]
  );

  const updateSuccessCriteria = useCallback(
    async (id: string, input: UpdateSuccessCriteriaInput): Promise<void> => {
      if (!criteriaRepo) return;
      const updated = await criteriaRepo.update(id, input);
      if (updated) {
        setSuccessCriteria((prev) => prev.map((c) => (c.id === id ? updated : c)));
      }
    },
    [criteriaRepo]
  );

  const deleteSuccessCriteria = useCallback(
    async (id: string): Promise<void> => {
      if (!criteriaRepo) return;
      const deleted = await criteriaRepo.delete(id);
      if (deleted) {
        setSuccessCriteria((prev) => prev.filter((c) => c.id !== id));
      }
    },
    [criteriaRepo]
  );

  const getProjectCriteria = useCallback(
    (projectId: string): SuccessCriteria[] => {
      return successCriteria.filter((c) => c.projectId === projectId);
    },
    [successCriteria]
  );

  const removeCriteriaByProjectId = useCallback((projectId: string): void => {
    setSuccessCriteria((prev) => prev.filter((c) => c.projectId !== projectId));
  }, []);

  return {
    successCriteria,
    addSuccessCriteria,
    updateSuccessCriteria,
    deleteSuccessCriteria,
    getProjectCriteria,
    removeCriteriaByProjectId,
  };
}
