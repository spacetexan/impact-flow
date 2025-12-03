/**
 * Seed data for demo/development mode
 * Isolated from application code for 12-Factor compliance (Dev/Prod Parity)
 */

import { Profile, Project, SuccessCriteria } from '@/domain';

export const seedProfiles: Profile[] = [
  { id: '1', name: 'Sarah Chen', role: 'Product Manager' },
  { id: '2', name: 'Marcus Johnson', role: 'Lead Developer' },
  { id: '3', name: 'Emily Roberts', role: 'Designer' },
];

export const seedProjects: Project[] = [
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

export const seedCriteria: SuccessCriteria[] = [
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

export interface SeedData {
  profiles: Profile[];
  projects: Project[];
  criteria: SuccessCriteria[];
}

export const allSeedData: SeedData = {
  profiles: seedProfiles,
  projects: seedProjects,
  criteria: seedCriteria,
};
