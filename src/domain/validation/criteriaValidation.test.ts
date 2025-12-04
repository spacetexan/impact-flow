import { describe, it, expect } from 'vitest';
import {
  successCriteriaSchema,
  createSuccessCriteriaSchema,
  updateSuccessCriteriaSchema,
} from './criteriaValidation';

describe('successCriteriaSchema', () => {
  const validCriteria = {
    id: 'criteria-123',
    projectId: 'project-1',
    description: 'Test criteria description',
    isComplete: false,
  };

  it('validates complete criteria', () => {
    const result = successCriteriaSchema.safeParse(validCriteria);
    expect(result.success).toBe(true);
  });

  it('validates criteria with isComplete true', () => {
    const completedCriteria = { ...validCriteria, isComplete: true };
    const result = successCriteriaSchema.safeParse(completedCriteria);
    expect(result.success).toBe(true);
  });

  it('rejects empty id', () => {
    const criteriaWithEmptyId = { ...validCriteria, id: '' };
    const result = successCriteriaSchema.safeParse(criteriaWithEmptyId);
    expect(result.success).toBe(false);
  });

  it('rejects empty projectId', () => {
    const criteriaWithEmptyProjectId = { ...validCriteria, projectId: '' };
    const result = successCriteriaSchema.safeParse(criteriaWithEmptyProjectId);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Project ID is required');
    }
  });

  it('rejects empty description', () => {
    const criteriaWithEmptyDescription = { ...validCriteria, description: '' };
    const result = successCriteriaSchema.safeParse(criteriaWithEmptyDescription);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Description is required');
    }
  });

  it('rejects non-boolean isComplete', () => {
    const criteriaWithStringComplete = { ...validCriteria, isComplete: 'true' };
    const result = successCriteriaSchema.safeParse(criteriaWithStringComplete);
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const incompleteCriteria = { id: 'criteria-123' };
    const result = successCriteriaSchema.safeParse(incompleteCriteria);
    expect(result.success).toBe(false);
  });
});

describe('createSuccessCriteriaSchema', () => {
  const validCreateInput = {
    projectId: 'project-1',
    description: 'Test criteria description',
    isComplete: false,
  };

  it('validates input without id', () => {
    const result = createSuccessCriteriaSchema.safeParse(validCreateInput);
    expect(result.success).toBe(true);
  });

  it('validates input with isComplete true', () => {
    const inputWithCompleteTrue = { ...validCreateInput, isComplete: true };
    const result = createSuccessCriteriaSchema.safeParse(inputWithCompleteTrue);
    expect(result.success).toBe(true);
  });

  it('rejects empty projectId', () => {
    const inputWithEmptyProjectId = { ...validCreateInput, projectId: '' };
    const result = createSuccessCriteriaSchema.safeParse(inputWithEmptyProjectId);
    expect(result.success).toBe(false);
  });

  it('rejects empty description', () => {
    const inputWithEmptyDescription = { ...validCreateInput, description: '' };
    const result = createSuccessCriteriaSchema.safeParse(inputWithEmptyDescription);
    expect(result.success).toBe(false);
  });

  it('rejects missing isComplete', () => {
    const { isComplete, ...withoutComplete } = validCreateInput;
    const result = createSuccessCriteriaSchema.safeParse(withoutComplete);
    expect(result.success).toBe(false);
  });
});

describe('updateSuccessCriteriaSchema', () => {
  it('allows partial updates with only description', () => {
    const result = updateSuccessCriteriaSchema.safeParse({
      description: 'Updated description',
    });
    expect(result.success).toBe(true);
  });

  it('allows partial updates with only isComplete', () => {
    const result = updateSuccessCriteriaSchema.safeParse({ isComplete: true });
    expect(result.success).toBe(true);
  });

  it('allows partial updates with only projectId', () => {
    const result = updateSuccessCriteriaSchema.safeParse({
      projectId: 'new-project-id',
    });
    expect(result.success).toBe(true);
  });

  it('allows empty object (no changes)', () => {
    const result = updateSuccessCriteriaSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('allows toggling isComplete to false', () => {
    const result = updateSuccessCriteriaSchema.safeParse({ isComplete: false });
    expect(result.success).toBe(true);
  });

  it('rejects empty string for description when provided', () => {
    const result = updateSuccessCriteriaSchema.safeParse({ description: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty string for projectId when provided', () => {
    const result = updateSuccessCriteriaSchema.safeParse({ projectId: '' });
    expect(result.success).toBe(false);
  });

  it('allows multiple fields in update', () => {
    const result = updateSuccessCriteriaSchema.safeParse({
      description: 'Updated description',
      isComplete: true,
    });
    expect(result.success).toBe(true);
  });
});
