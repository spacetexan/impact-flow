import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Profile, Project, SuccessCriteria } from '@/types/delegation';

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

// Sample data for demo
const sampleProfiles: Profile[] = [
  { id: '1', name: 'Sarah Chen', role: 'Product Manager' },
  { id: '2', name: 'Marcus Johnson', role: 'Lead Developer' },
  { id: '3', name: 'Emily Roberts', role: 'Designer' },
];

const sampleProjects: Project[] = [
  {
    id: 'p1',
    profileId: '1',
    name: 'Q1 Product Roadmap',
    purpose: 'Define and communicate the strategic direction for Q1 to align all teams.',
    importance: 'Without a clear roadmap, teams work in silos and miss critical dependencies.',
    idealOutcome: 'A visual roadmap document approved by leadership with clear milestones and ownership.',
    status: 'in_progress',
    dueDate: '2024-03-15',
    comments: 'Draft ready for review.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    profileId: '2',
    name: 'API Performance Optimization',
    purpose: 'Reduce API response times to improve user experience.',
    importance: 'Current 2s load times are causing user drop-off and hurting conversions.',
    idealOutcome: 'API responses under 200ms for 95% of requests.',
    status: 'planned',
    dueDate: '2024-04-01',
    comments: '',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p3',
    profileId: '3',
    name: 'Brand Refresh',
    purpose: 'Modernize visual identity to appeal to enterprise customers.',
    importance: 'Current branding feels dated and undermines premium positioning.',
    idealOutcome: 'New logo, color palette, and design system implemented across all touchpoints.',
    status: 'complete',
    dueDate: '2024-02-01',
    comments: 'Launched successfully!',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p4',
    profileId: '2',
    name: 'Database Migration',
    purpose: 'Move from legacy database to modern cloud infrastructure.',
    importance: 'Legacy system is reaching capacity limits and lacks disaster recovery.',
    idealOutcome: 'Zero-downtime migration with full data integrity verification.',
    status: 'blocked',
    dueDate: '2024-03-30',
    comments: 'Waiting on security team approval.',
    createdAt: new Date().toISOString(),
  },
];

const sampleCriteria: SuccessCriteria[] = [
  { id: 'c1', projectId: 'p1', description: 'All feature requests categorized and prioritized', isComplete: true },
  { id: 'c2', projectId: 'p1', description: 'Dependencies mapped between teams', isComplete: true },
  { id: 'c3', projectId: 'p1', description: 'Leadership sign-off obtained', isComplete: false },
  { id: 'c4', projectId: 'p2', description: 'Baseline performance metrics documented', isComplete: false },
  { id: 'c5', projectId: 'p2', description: 'Critical bottlenecks identified', isComplete: false },
  { id: 'c6', projectId: 'p3', description: 'New logo finalized', isComplete: true },
  { id: 'c7', projectId: 'p3', description: 'Website updated', isComplete: true },
  { id: 'c8', projectId: 'p4', description: 'Migration plan approved', isComplete: true },
  { id: 'c9', projectId: 'p4', description: 'Test migration completed', isComplete: false },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function DelegationProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>(sampleProfiles);
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [successCriteria, setSuccessCriteria] = useState<SuccessCriteria[]>(sampleCriteria);

  const addProfile = (profile: Omit<Profile, 'id'>) => {
    const newProfile = { ...profile, id: generateId() };
    setProfiles((prev) => [...prev, newProfile]);
    return newProfile;
  };

  const updateProfile = (id: string, profile: Partial<Profile>) => {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...profile } : p)));
  };

  const deleteProfile = (id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    setProjects((prev) => prev.filter((p) => p.profileId !== id));
  };

  const addProject = (project: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject = { ...project, id: generateId(), createdAt: new Date().toISOString() };
    setProjects((prev) => [...prev, newProject]);
    return newProject;
  };

  const updateProject = (id: string, project: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...project } : p)));
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setSuccessCriteria((prev) => prev.filter((c) => c.projectId !== id));
  };

  const addSuccessCriteria = (criteria: Omit<SuccessCriteria, 'id'>) => {
    const newCriteria = { ...criteria, id: generateId() };
    setSuccessCriteria((prev) => [...prev, newCriteria]);
    return newCriteria;
  };

  const updateSuccessCriteria = (id: string, criteria: Partial<SuccessCriteria>) => {
    setSuccessCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, ...criteria } : c)));
  };

  const deleteSuccessCriteria = (id: string) => {
    setSuccessCriteria((prev) => prev.filter((c) => c.id !== id));
  };

  const getProjectCriteria = (projectId: string) => {
    return successCriteria.filter((c) => c.projectId === projectId);
  };

  const getProfileProjects = (profileId: string) => {
    return projects.filter((p) => p.profileId === profileId);
  };

  return (
    <DelegationContext.Provider
      value={{
        profiles,
        projects,
        successCriteria,
        addProfile,
        updateProfile,
        deleteProfile,
        addProject,
        updateProject,
        deleteProject,
        addSuccessCriteria,
        updateSuccessCriteria,
        deleteSuccessCriteria,
        getProjectCriteria,
        getProfileProjects,
      }}
    >
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
