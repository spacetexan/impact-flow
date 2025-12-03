/**
 * Type-safe environment variable access
 * All environment variables should be accessed through this module
 */

type StorageType = 'memory' | 'sqlite' | 'supabase';

interface EnvConfig {
  VITE_STORAGE_TYPE: StorageType;
  VITE_DEMO_MODE: boolean;
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
  if (value === 'memory' || value === 'sqlite' || value === 'supabase') {
    return value;
  }
  console.warn(`Invalid VITE_STORAGE_TYPE "${value}", defaulting to "memory"`);
  return 'memory';
}

export const env: EnvConfig = {
  VITE_STORAGE_TYPE: getStorageType(),
  VITE_DEMO_MODE: getEnvBoolean('VITE_DEMO_MODE', true),
};
