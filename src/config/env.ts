/**
 * Type-safe environment variable access
 * All environment variables should be accessed through this module
 */

type StorageType = 'memory' | 'sqlite' | 'server' | 'supabase';
type SqlitePersistence = 'memory' | 'indexeddb';

interface EnvConfig {
  VITE_STORAGE_TYPE: StorageType;
  VITE_DEMO_MODE: boolean;
  VITE_SQLITE_PERSISTENCE: SqlitePersistence;
  VITE_API_URL: string;
}

function getEnvString(key: string, defaultValue: string): string {
  return import.meta.env[key] ?? defaultValue;
}

function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true';
}

function getStorageType(): StorageType {
  const value = getEnvString('VITE_STORAGE_TYPE', 'memory');
  if (value === 'memory' || value === 'sqlite' || value === 'server' || value === 'supabase') {
    return value;
  }
  console.warn(`Invalid VITE_STORAGE_TYPE "${value}", defaulting to "memory"`);
  return 'memory';
}

function getSqlitePersistence(): SqlitePersistence {
  const value = getEnvString('VITE_SQLITE_PERSISTENCE', 'indexeddb');
  if (value === 'memory' || value === 'indexeddb') {
    return value;
  }
  console.warn(`Invalid VITE_SQLITE_PERSISTENCE "${value}", defaulting to "indexeddb"`);
  return 'indexeddb';
}

export const env: EnvConfig = {
  VITE_STORAGE_TYPE: getStorageType(),
  VITE_DEMO_MODE: getEnvBoolean('VITE_DEMO_MODE', true),
  VITE_SQLITE_PERSISTENCE: getSqlitePersistence(),
  VITE_API_URL: getEnvString('VITE_API_URL', 'http://localhost:3001/api'),
};
