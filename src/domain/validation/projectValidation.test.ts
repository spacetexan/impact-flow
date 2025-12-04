import { describe, it, expect } from 'vitest';
import { projectSchema, createProjectSchema, updateProjectSchema } from './projectValidation';

describe('projectSchema', () => {
  const validProject = {
    id: 'proj-123',
    profileId: 'profile-1',
    name: 'Test Project',
    purpose: 'Test purpose',
    importance: 'Test importance',
    idealOutcome: 'Test outcome',
    status: 'planned',
    dueDate: '2024-12-31',
    comments: 'Some comments',
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  it('validates a complete project', () => {
    const result = projectSchema.safeParse(validProject);
    expect(result.success).toBe(true);
  });

  it('validates project with null dueDate', () => {
    const projectWithNullDate = { ...validProject, dueDate: null };
    const result = projectSchema.safeParse(projectWithNullDate);
    expect(result.success).toBe(true);
  });

  it('validates project with empty comments', () => {
    const projectWithEmptyComments = { ...validProject, comments: '' };
    const result = projectSchema.safeParse(projectWithEmptyComments);
    expect(result.success).toBe(true);
  });

  it('validates all valid status values', () => {
    const statuses = ['planned', 'in_progress', 'complete', 'blocked'];

    for (const status of statuses) {
      const project = { ...validProject, status };
      const result = projectSchema.safeParse(project);
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid status value', () => {
    const projectWithInvalidStatus = { ...validProject, status: 'invalid' };
    const result = projectSchema.safeParse(projectWithInvalidStatus);
    expect(result.success).toBe(false);
  });

  it('rejects empty id', () => {
    const projectWithEmptyId = { ...validProject, id: '' };
    const result = projectSchema.safeParse(projectWithEmptyId);
    expect(result.success).toBe(false);
  });

  it('rejects empty profileId', () => {
    const projectWithEmptyProfileId = { ...validProject, profileId: '' };
    const result = projectSchema.safeParse(projectWithEmptyProfileId);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Assignee is required');
    }
  });

  it('rejects empty name', () => {
    const projectWithEmptyName = { ...validProject, name: '' };
    const result = projectSchema.safeParse(projectWithEmptyName);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Project name is required');
    }
  });

  it('rejects empty purpose', () => {
    const projectWithEmptyPurpose = { ...validProject, purpose: '' };
    const result = projectSchema.safeParse(projectWithEmptyPurpose);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Purpose is required');
    }
  });

  it('rejects empty importance', () => {
    const projectWithEmptyImportance = { ...validProject, importance: '' };
    const result = projectSchema.safeParse(projectWithEmptyImportance);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Importance is required');
    }
  });

  it('rejects empty idealOutcome', () => {
    const projectWithEmptyOutcome = { ...validProject, idealOutcome: '' };
    const result = projectSchema.safeParse(projectWithEmptyOutcome);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Ideal outcome is required');
    }
  });
});

describe('createProjectSchema', () => {
  const validCreateInput = {
    profileId: 'profile-1',
    name: 'Test Project',
    purpose: 'Test purpose',
    importance: 'Test importance',
    idealOutcome: 'Test outcome',
    status: 'planned',
    dueDate: null,
    comments: '',
  };

  it('validates input without id and createdAt', () => {
    const result = createProjectSchema.safeParse(validCreateInput);
    expect(result.success).toBe(true);
  });

  it('validates all required fields', () => {
    const result = createProjectSchema.safeParse(validCreateInput);
    expect(result.success).toBe(true);
  });

  it('rejects missing profileId', () => {
    const { profileId, ...withoutProfileId } = validCreateInput;
    const result = createProjectSchema.safeParse(withoutProfileId);
    expect(result.success).toBe(false);
  });

  it('rejects missing name', () => {
    const { name, ...withoutName } = validCreateInput;
    const result = createProjectSchema.safeParse(withoutName);
    expect(result.success).toBe(false);
  });

  it('rejects missing purpose', () => {
    const { purpose, ...withoutPurpose } = validCreateInput;
    const result = createProjectSchema.safeParse(withoutPurpose);
    expect(result.success).toBe(false);
  });

  it('rejects missing importance', () => {
    const { importance, ...withoutImportance } = validCreateInput;
    const result = createProjectSchema.safeParse(withoutImportance);
    expect(result.success).toBe(false);
  });

  it('rejects missing idealOutcome', () => {
    const { idealOutcome, ...withoutOutcome } = validCreateInput;
    const result = createProjectSchema.safeParse(withoutOutcome);
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const inputWithInvalidStatus = { ...validCreateInput, status: 'invalid' };
    const result = createProjectSchema.safeParse(inputWithInvalidStatus);
    expect(result.success).toBe(false);
  });
});

describe('updateProjectSchema', () => {
  it('allows partial updates with only name', () => {
    const result = updateProjectSchema.safeParse({ name: 'Updated Name' });
    expect(result.success).toBe(true);
  });

  it('allows partial updates with only status', () => {
    const result = updateProjectSchema.safeParse({ status: 'in_progress' });
    expect(result.success).toBe(true);
  });

  it('allows partial updates with only dueDate', () => {
    const result = updateProjectSchema.safeParse({ dueDate: '2024-12-31' });
    expect(result.success).toBe(true);
  });

  it('allows partial updates with null dueDate', () => {
    const result = updateProjectSchema.safeParse({ dueDate: null });
    expect(result.success).toBe(true);
  });

  it('allows empty object (no changes)', () => {
    const result = updateProjectSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects invalid status in partial update', () => {
    const result = updateProjectSchema.safeParse({ status: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('rejects empty string for name when provided', () => {
    const result = updateProjectSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('allows multiple fields in update', () => {
    const result = updateProjectSchema.safeParse({
      name: 'Updated Name',
      status: 'complete',
      comments: 'Updated comments',
    });
    expect(result.success).toBe(true);
  });
});
