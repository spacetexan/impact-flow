import { describe, it, expect } from 'vitest';
import { PROJECT_STATUSES, STATUS_COLORS, STATUS_LABELS, ProjectStatus } from './status';

describe('PROJECT_STATUSES', () => {
  it('contains exactly 4 statuses', () => {
    expect(PROJECT_STATUSES).toHaveLength(4);
  });

  it('includes all expected statuses', () => {
    expect(PROJECT_STATUSES).toContain('planned');
    expect(PROJECT_STATUSES).toContain('in_progress');
    expect(PROJECT_STATUSES).toContain('complete');
    expect(PROJECT_STATUSES).toContain('blocked');
  });

  it('has statuses as readonly array', () => {
    // This is a compile-time check but we can verify the values are strings
    PROJECT_STATUSES.forEach((status) => {
      expect(typeof status).toBe('string');
    });
  });
});

describe('STATUS_COLORS', () => {
  it('provides color for every status', () => {
    for (const status of PROJECT_STATUSES) {
      expect(STATUS_COLORS[status]).toBeDefined();
      expect(typeof STATUS_COLORS[status]).toBe('string');
    }
  });

  it('has correct color for planned', () => {
    expect(STATUS_COLORS.planned).toBe('hsl(var(--muted))');
  });

  it('has correct color for in_progress', () => {
    expect(STATUS_COLORS.in_progress).toBe('hsl(var(--primary))');
  });

  it('has correct color for complete', () => {
    expect(STATUS_COLORS.complete).toBe('hsl(var(--chart-2))');
  });

  it('has correct color for blocked', () => {
    expect(STATUS_COLORS.blocked).toBe('hsl(var(--destructive))');
  });
});

describe('STATUS_LABELS', () => {
  it('provides human-readable label for every status', () => {
    for (const status of PROJECT_STATUSES) {
      expect(STATUS_LABELS[status]).toBeDefined();
      expect(typeof STATUS_LABELS[status]).toBe('string');
    }
  });

  it('has correct label for planned', () => {
    expect(STATUS_LABELS.planned).toBe('Planned');
  });

  it('has correct label for in_progress', () => {
    expect(STATUS_LABELS.in_progress).toBe('In Progress');
  });

  it('has correct label for complete', () => {
    expect(STATUS_LABELS.complete).toBe('Complete');
  });

  it('has correct label for blocked', () => {
    expect(STATUS_LABELS.blocked).toBe('Blocked');
  });
});

describe('ProjectStatus type', () => {
  it('can be used as a type for status values', () => {
    // Type check: these should compile
    const status1: ProjectStatus = 'planned';
    const status2: ProjectStatus = 'in_progress';
    const status3: ProjectStatus = 'complete';
    const status4: ProjectStatus = 'blocked';

    expect(status1).toBe('planned');
    expect(status2).toBe('in_progress');
    expect(status3).toBe('complete');
    expect(status4).toBe('blocked');
  });
});
