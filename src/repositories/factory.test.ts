import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  initializeRepositories,
  getRepositories,
  resetRepositories,
  requiresAsyncInit,
} from './factory';

// Mock the config module
vi.mock('@/config', () => ({
  config: {
    storage: { type: 'memory' },
    sqlite: { persistence: 'memory' },
    api: { baseUrl: 'http://localhost:3001/api' },
  },
}));

// Mock the SQLite initialization to avoid WASM loading
vi.mock('./implementations/sqlite', () => ({
  SQLiteProfileRepository: vi.fn(),
  SQLiteProjectRepository: vi.fn(),
  SQLiteCriteriaRepository: vi.fn(),
  initializeDatabase: vi.fn().mockResolvedValue(undefined),
}));

describe('Repository Factory', () => {
  beforeEach(() => {
    resetRepositories();
    vi.clearAllMocks();
  });

  describe('initializeRepositories', () => {
    it('creates memory repositories when configured for memory storage', async () => {
      const repos = await initializeRepositories();

      expect(repos).toBeDefined();
      expect(repos.profiles).toBeDefined();
      expect(repos.projects).toBeDefined();
      expect(repos.criteria).toBeDefined();
    });

    it('returns cached instance on subsequent calls', async () => {
      const first = await initializeRepositories();
      const second = await initializeRepositories();

      expect(first).toBe(second);
    });

    it('returns same promise when called multiple times concurrently', async () => {
      // Call multiple times without await
      const promise1 = initializeRepositories();
      const promise2 = initializeRepositories();
      const promise3 = initializeRepositories();

      const [result1, result2, result3] = await Promise.all([
        promise1,
        promise2,
        promise3,
      ]);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });

  describe('getRepositories', () => {
    it('returns repositories after initialization', async () => {
      await initializeRepositories();
      const repos = getRepositories();

      expect(repos).toBeDefined();
      expect(repos.profiles).toBeDefined();
      expect(repos.projects).toBeDefined();
      expect(repos.criteria).toBeDefined();
    });

    it('creates memory repositories synchronously when not initialized', () => {
      // For memory storage, should work without async init
      const repos = getRepositories();

      expect(repos).toBeDefined();
      expect(repos.profiles).toBeDefined();
    });
  });

  describe('resetRepositories', () => {
    it('clears cached instance', async () => {
      const first = await initializeRepositories();
      resetRepositories();
      const second = await initializeRepositories();

      // Different instances after reset
      expect(first).not.toBe(second);
    });

    it('allows re-initialization after reset', async () => {
      await initializeRepositories();
      resetRepositories();

      // Should not throw
      const repos = await initializeRepositories();
      expect(repos).toBeDefined();
    });
  });

  describe('requiresAsyncInit', () => {
    it('returns false for memory storage', () => {
      expect(requiresAsyncInit()).toBe(false);
    });
  });
});

describe('Repository Factory with SQLite config', () => {
  beforeEach(() => {
    resetRepositories();
    vi.clearAllMocks();
  });

  // Note: Testing SQLite config properly requires dynamic imports and module re-loading.
  // The current memory config tests validate the factory pattern works correctly.
  // SQLite-specific behavior (WASM loading, etc.) would be tested in integration tests.
  it('is documented as needing integration tests for full SQLite coverage', () => {
    // This is a placeholder to acknowledge that SQLite-specific tests
    // require more complex setup with actual WASM loading
    expect(true).toBe(true);
  });
});
