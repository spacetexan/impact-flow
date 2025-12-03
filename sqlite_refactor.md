# SQLite Integration Plan for Impact Flow

## Summary

Add SQLite as an alternative storage backend using **sql.js** (WebAssembly SQLite). The existing repository pattern and factory architecture make this a clean addition—no component changes required.

**Storage Modes:**
- `indexeddb` (default) - SQLite persisted to IndexedDB (survives page refresh)
- `memory` - In-memory SQLite (ephemeral, for testing)

Switch at runtime via environment variable: `VITE_STORAGE_TYPE=sqlite`

---

## Library Choice: sql.js

**Why sql.js:**
- Most mature browser SQLite solution (WebAssembly)
- TypeScript support via `@types/sql.js`
- Works with Vite out of the box
- Supports both in-memory and IndexedDB persistence
- ~1.5MB WASM bundle (loads async on demand)

---

## Database Schema

```sql
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT
);

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  importance TEXT NOT NULL,
  ideal_outcome TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('planned', 'in_progress', 'complete', 'blocked')),
  due_date TEXT,
  comments TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE success_criteria (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  description TEXT NOT NULL,
  is_complete INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_projects_profile_id ON projects(profile_id);
CREATE INDEX idx_criteria_project_id ON success_criteria(project_id);
```

---

## File Structure (New Files)

```
src/repositories/implementations/sqlite/
├── index.ts                    # Exports all SQLite repos
├── SQLiteProfileRepository.ts  # IProfileRepository implementation
├── SQLiteProjectRepository.ts  # IProjectRepository implementation
├── SQLiteCriteriaRepository.ts # ICriteriaRepository implementation
└── shared/
    ├── connection.ts           # DB singleton, WASM loading
    ├── schema.ts               # DDL, table creation
    ├── persistence.ts          # IndexedDB save/load
    └── mappers.ts              # Row <-> Entity conversion
```

---

## Implementation Steps

### Step 1: Install Dependencies

```bash
npm install sql.js
npm install -D @types/sql.js
```

### Step 2: Create Connection Manager

**File:** `src/repositories/implementations/sqlite/shared/connection.ts`

- Load sql.js WASM asynchronously
- Create singleton database instance
- Support two persistence modes via `VITE_SQLITE_PERSISTENCE`:
  - `memory` (default): Data lost on refresh
  - `indexeddb`: Persist to browser storage
- Expose `initializeDatabase()`, `getDatabase()`, `persistDatabase()`

### Step 3: Create Schema Module

**File:** `src/repositories/implementations/sqlite/shared/schema.ts`

- `initializeSchema(db)`: Create tables if not exist
- Enable foreign keys: `PRAGMA foreign_keys = ON`

### Step 4: Create Persistence Module

**File:** `src/repositories/implementations/sqlite/shared/persistence.ts`

- `saveToIndexedDB(data: Uint8Array)`: Store DB binary
- `loadFromIndexedDB(): Uint8Array | null`: Retrieve DB binary
- Debounced auto-save after mutations

### Step 5: Create Entity Mappers

**File:** `src/repositories/implementations/sqlite/shared/mappers.ts`

- `rowToProfile()`, `rowToProject()`, `rowToCriteria()`
- Handle snake_case (SQL) to camelCase (TypeScript) conversion
- Handle SQLite INTEGER (0/1) to boolean conversion

### Step 6: Implement SQLite Repositories

**Files:**
- `SQLiteProfileRepository.ts`
- `SQLiteProjectRepository.ts`
- `SQLiteCriteriaRepository.ts`

Each implements the existing interface with SQL queries:
- `getAll()` → `SELECT * FROM table`
- `getById(id)` → `SELECT * FROM table WHERE id = ?`
- `create(input)` → `INSERT INTO table ... VALUES ...`
- `update(id, input)` → `UPDATE table SET ... WHERE id = ?`
- `delete(id)` → `DELETE FROM table WHERE id = ?`
- `seed(data)` → Bulk `INSERT OR REPLACE`

### Step 7: Update Factory for Async Init

**File:** `src/repositories/factory.ts`

Add async initialization path:

```typescript
export async function initializeRepositories(): Promise<Repositories> {
  if (config.storage.type === 'sqlite') {
    await initializeDatabase();  // Load WASM, create tables
    return {
      profiles: new SQLiteProfileRepository(),
      projects: new SQLiteProjectRepository(),
      criteria: new SQLiteCriteriaRepository(),
    };
  }
  return createRepositories();  // Sync path for memory
}

export async function getRepositoriesAsync(): Promise<Repositories> {
  // Singleton with lazy async init
}
```

### Step 8: Update DelegationContext

**File:** `src/context/DelegationContext.tsx`

Add loading state for async SQLite initialization:

```typescript
export function DelegationProvider({ children }) {
  const [repos, setRepos] = useState<Repositories | null>(null);

  useEffect(() => {
    getRepositoriesAsync().then(r => {
      seedRepositories(r);
      setRepos(r);
    });
  }, []);

  if (!repos) return <LoadingSpinner />;
  // ... rest unchanged
}
```

### Step 9: Update Seed Loader

**File:** `src/data/seedLoader.ts`

Check for existing data before seeding (for persistent storage):

```typescript
export async function seedRepositories(repos: Repositories) {
  if (!config.features.demoMode) return;

  const existing = await repos.profiles.getAll();
  if (existing.length > 0) return;  // Already seeded

  // Seed data...
}
```

### Step 10: Add Environment Variable

**File:** `src/config/env.ts`

Add optional persistence mode config:

```typescript
VITE_SQLITE_PERSISTENCE: 'memory' | 'indexeddb'  // default: 'indexeddb'
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `package.json` | Add sql.js dependency |
| `src/config/env.ts` | Add VITE_SQLITE_PERSISTENCE |
| `src/config/index.ts` | Export sqlite persistence config |
| `src/repositories/factory.ts` | Add async init, SQLite case |
| `src/repositories/index.ts` | Export SQLite repos |
| `src/context/DelegationContext.tsx` | Add loading state for async init |
| `src/data/seedLoader.ts` | Check existing data before seeding |

## New Files to Create

| File | Purpose |
|------|---------|
| `src/repositories/implementations/sqlite/index.ts` | Module exports |
| `src/repositories/implementations/sqlite/SQLiteProfileRepository.ts` | Profile CRUD |
| `src/repositories/implementations/sqlite/SQLiteProjectRepository.ts` | Project CRUD |
| `src/repositories/implementations/sqlite/SQLiteCriteriaRepository.ts` | Criteria CRUD |
| `src/repositories/implementations/sqlite/shared/connection.ts` | DB lifecycle |
| `src/repositories/implementations/sqlite/shared/schema.ts` | Table DDL |
| `src/repositories/implementations/sqlite/shared/persistence.ts` | IndexedDB I/O |
| `src/repositories/implementations/sqlite/shared/mappers.ts` | Data mapping |

---

## Usage

```bash
# Persistent SQLite (default when using sqlite)
VITE_STORAGE_TYPE=sqlite npm run dev

# Ephemeral SQLite (for testing)
VITE_STORAGE_TYPE=sqlite VITE_SQLITE_PERSISTENCE=memory npm run dev

# Original in-memory JS objects (default)
npm run dev
```

---

## Browser Compatibility

- Chrome 57+, Firefox 52+, Safari 11+, Edge 16+
- Fallback to memory storage if WebAssembly unavailable
