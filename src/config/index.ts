/**
 * Application configuration
 * Centralizes all configuration values derived from environment variables
 */

import { env } from './env';

export const config = {
  storage: {
    type: env.VITE_STORAGE_TYPE,
  },
  sqlite: {
    persistence: env.VITE_SQLITE_PERSISTENCE,
  },
  features: {
    demoMode: env.VITE_DEMO_MODE,
  },
} as const;

export type Config = typeof config;
