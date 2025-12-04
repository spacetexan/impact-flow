import { describe, it, expect } from 'vitest';
import { profileSchema, createProfileSchema, updateProfileSchema } from './profileValidation';

describe('profileSchema', () => {
  it('validates a complete profile', () => {
    const validProfile = {
      id: 'abc123',
      name: 'John Doe',
      role: 'Developer',
      avatar: 'https://example.com/avatar.png',
    };

    const result = profileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it('validates profile without optional avatar', () => {
    const profileWithoutAvatar = {
      id: 'abc123',
      name: 'John Doe',
      role: 'Developer',
    };

    const result = profileSchema.safeParse(profileWithoutAvatar);
    expect(result.success).toBe(true);
  });

  it('rejects empty id', () => {
    const invalidProfile = {
      id: '',
      name: 'John Doe',
      role: 'Developer',
    };

    const result = profileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const invalidProfile = {
      id: 'abc123',
      name: '',
      role: 'Developer',
    };

    const result = profileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Name is required');
    }
  });

  it('rejects empty role', () => {
    const invalidProfile = {
      id: 'abc123',
      name: 'John Doe',
      role: '',
    };

    const result = profileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Role is required');
    }
  });

  it('rejects invalid avatar URL', () => {
    const invalidProfile = {
      id: 'abc123',
      name: 'John Doe',
      role: 'Developer',
      avatar: 'not-a-url',
    };

    const result = profileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const incompleteProfile = {
      id: 'abc123',
    };

    const result = profileSchema.safeParse(incompleteProfile);
    expect(result.success).toBe(false);
  });
});

describe('createProfileSchema', () => {
  it('validates input without id', () => {
    const input = {
      name: 'John Doe',
      role: 'Developer',
    };

    const result = createProfileSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('validates input with optional avatar', () => {
    const input = {
      name: 'John Doe',
      role: 'Developer',
      avatar: 'https://example.com/avatar.png',
    };

    const result = createProfileSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const input = {
      name: '',
      role: 'Developer',
    };

    const result = createProfileSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects empty role', () => {
    const input = {
      name: 'John Doe',
      role: '',
    };

    const result = createProfileSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe('updateProfileSchema', () => {
  it('allows partial updates with only name', () => {
    const partialUpdate = { name: 'Updated Name' };

    const result = updateProfileSchema.safeParse(partialUpdate);
    expect(result.success).toBe(true);
  });

  it('allows partial updates with only role', () => {
    const partialUpdate = { role: 'New Role' };

    const result = updateProfileSchema.safeParse(partialUpdate);
    expect(result.success).toBe(true);
  });

  it('allows partial updates with only avatar', () => {
    const partialUpdate = { avatar: 'https://example.com/new-avatar.png' };

    const result = updateProfileSchema.safeParse(partialUpdate);
    expect(result.success).toBe(true);
  });

  it('allows empty object (no changes)', () => {
    const result = updateProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects invalid avatar URL in partial update', () => {
    const partialUpdate = { avatar: 'not-a-url' };

    const result = updateProfileSchema.safeParse(partialUpdate);
    expect(result.success).toBe(false);
  });

  it('rejects empty string for name when provided', () => {
    const partialUpdate = { name: '' };

    const result = updateProfileSchema.safeParse(partialUpdate);
    expect(result.success).toBe(false);
  });
});
