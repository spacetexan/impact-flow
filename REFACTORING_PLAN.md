# Refactoring Plan for SOLID & 12-Factor Compliance

## Current Issues

### SOLID Violations

| Principle | Issue | Location |
|-----------|-------|----------|
| **SRP** | Context handles state, CRUD, queries, sample data, ID generation | `DelegationContext.tsx` |
| **SRP** | Wizard mixes form state, wizard logic, validation, UI, data submission | `AddDelegationWizard.tsx` |
| **SRP** | Embedded node positioning logic | `DelegationFlow.tsx` |
| **OCP** | Hard-coded status options and wizard steps | Multiple files |
| **DIP** | Direct dependency on concrete `useDelegation()` context | All components |
| **ISP** | Monolithic `DelegationContextType` interface | `DelegationContext.tsx` |

### 12-Factor App Violations

| Factor | Issue |
|--------|-------|
| **Config** | Hard-coded sample data; no environment-based configuration |
| **Backing Services** | No abstraction for data storage |
| **Dev/Prod Parity** | No separation for demo/development data |
| **Logs** | No logging infrastructure |

---

## Refactoring Phases

### Phase 1: Configuration & Environment

**Goal:** Externalize configuration (12-Factor: Config)

**Files to create:**
- `src/config/index.ts` - Main configuration export
- `src/config/env.ts` - Type-safe environment variable access

```typescript
// src/config/index.ts
export const config = {
  storage: {
    type: import.meta.env.VITE_STORAGE_TYPE || 'memory', // 'memory' | 'sqlite' | 'supabase'
  },
  features: {
    demoMode: import.meta.env.VITE_DEMO_MODE === 'true',
  },
};
```

---

### Phase 2: Domain Layer Separation

**Goal:** Extract types, validation, and business rules (SRP, DIP)

**Files to create:**
- `src/domain/entities/Profile.ts`
- `src/domain/entities/Project.ts`
- `src/domain/entities/SuccessCriteria.ts`
- `src/domain/validation/profileValidation.ts`
- `src/domain/validation/projectValidation.ts`
- `src/domain/validation/criteriaValidation.ts`
- `src/domain/constants/status.ts`

**Actions:**
- Move `STATUS_COLORS`, `STATUS_LABELS` to constants
- Create Zod schemas for validation
- Define entity types with business rules

---

### Phase 3: Repository Pattern

**Goal:** Abstract data storage (DIP, OCP)

**Files to create:**
- `src/repositories/interfaces/IProfileRepository.ts`
- `src/repositories/interfaces/IProjectRepository.ts`
- `src/repositories/interfaces/ICriteriaRepository.ts`
- `src/repositories/implementations/memory/InMemoryProfileRepository.ts`
- `src/repositories/implementations/memory/InMemoryProjectRepository.ts`
- `src/repositories/implementations/memory/InMemoryCriteriaRepository.ts`
- `src/repositories/factory.ts`

```typescript
// Example interface
export interface IProfileRepository {
  getAll(): Promise<Profile[]>;
  getById(id: string): Promise<Profile | null>;
  create(profile: Omit<Profile, 'id'>): Promise<Profile>;
  update(id: string, data: Partial<Profile>): Promise<Profile>;
  delete(id: string): Promise<void>;
}
```

---

### Phase 4: Service Layer

**Goal:** Separate business logic from state management (SRP)

**Files to create:**
- `src/services/ProfileService.ts`
- `src/services/ProjectService.ts`
- `src/services/CriteriaService.ts`

**Responsibilities:**
- Inject repositories via constructor
- Handle business logic (e.g., cascading deletes)
- Return results without managing React state

---

### Phase 5: Split Context into Focused Hooks

**Goal:** Replace monolithic context with smaller, focused hooks (ISP, SRP)

**Files to create:**
- `src/hooks/useProfiles.ts`
- `src/hooks/useProjects.ts`
- `src/hooks/useSuccessCriteria.ts`

**Files to update:**
- `src/context/DelegationContext.tsx` - Compose from smaller hooks

---

### Phase 6: Extract Seed Data

**Goal:** Conditional data loading (12-Factor: Config, Dev/Prod Parity)

**Files to create:**
- `src/data/seedData.ts`
- `src/data/seedLoader.ts`

**Actions:**
- Move sample data out of context
- Only load in demo/development mode based on config

---

### Phase 7: Component Refactoring

**Goal:** Split large components into focused units (SRP)

#### AddDelegationWizard
**Files to create:**
- `src/hooks/useWizardState.ts` - Step management
- `src/hooks/useProjectForm.ts` - Form state
- `src/components/delegation/wizard/WizardContainer.tsx`
- `src/components/delegation/wizard/WizardNavigation.tsx`
- `src/components/delegation/wizard/steps/NameStep.tsx`
- `src/components/delegation/wizard/steps/PurposeStep.tsx`
- `src/components/delegation/wizard/steps/ImportanceStep.tsx`
- `src/components/delegation/wizard/steps/OutcomeStep.tsx`
- `src/components/delegation/wizard/steps/CriteriaStep.tsx`
- `src/components/delegation/wizard/steps/AssignStep.tsx`
- `src/components/delegation/wizard/wizardValidation.ts`

#### DelegationFlow
**Files to create:**
- `src/hooks/useFlowLayout.ts` - Node positioning
- `src/components/delegation/flow/layoutUtils.ts`

#### ProjectSheet
**Files to create:**
- `src/hooks/useProjectEditor.ts`

---

### Phase 8: Logging Infrastructure

**Goal:** Centralized logging (12-Factor: Logs)

**Files to create:**
- `src/lib/logger.ts`

**Features:**
- Log levels (debug, info, warn, error)
- Console output in development
- Structured logging format

---

### Phase 9: Error Handling

**Goal:** Consistent error handling

**Files to create:**
- `src/lib/errors/AppError.ts`
- `src/components/ErrorBoundary.tsx`

---

## Final File Structure

```
src/
├── config/
│   ├── index.ts
│   └── env.ts
├── domain/
│   ├── entities/
│   │   ├── Profile.ts
│   │   ├── Project.ts
│   │   └── SuccessCriteria.ts
│   ├── validation/
│   │   ├── profileValidation.ts
│   │   ├── projectValidation.ts
│   │   └── criteriaValidation.ts
│   └── constants/
│       └── status.ts
├── repositories/
│   ├── interfaces/
│   │   ├── IProfileRepository.ts
│   │   ├── IProjectRepository.ts
│   │   └── ICriteriaRepository.ts
│   ├── implementations/
│   │   └── memory/
│   │       ├── InMemoryProfileRepository.ts
│   │       ├── InMemoryProjectRepository.ts
│   │       └── InMemoryCriteriaRepository.ts
│   └── factory.ts
├── services/
│   ├── ProfileService.ts
│   ├── ProjectService.ts
│   └── CriteriaService.ts
├── hooks/
│   ├── useProfiles.ts
│   ├── useProjects.ts
│   ├── useSuccessCriteria.ts
│   ├── useWizardState.ts
│   ├── useProjectForm.ts
│   └── useFlowLayout.ts
├── context/
│   └── DelegationContext.tsx
├── data/
│   ├── seedData.ts
│   └── seedLoader.ts
├── lib/
│   ├── logger.ts
│   ├── utils.ts
│   └── errors/
│       └── AppError.ts
├── components/
│   ├── ErrorBoundary.tsx
│   └── delegation/
│       ├── wizard/
│       │   ├── WizardContainer.tsx
│       │   ├── WizardNavigation.tsx
│       │   ├── wizardValidation.ts
│       │   └── steps/
│       │       ├── NameStep.tsx
│       │       ├── PurposeStep.tsx
│       │       ├── ImportanceStep.tsx
│       │       ├── OutcomeStep.tsx
│       │       ├── CriteriaStep.tsx
│       │       └── AssignStep.tsx
│       ├── flow/
│       │   ├── DelegationFlow.tsx
│       │   └── layoutUtils.ts
│       └── ...
└── types/
    └── delegation.ts
```

---

## Benefits Summary

| Principle | Before | After |
|-----------|--------|-------|
| **SRP** | Context does 5+ things | Each file has one responsibility |
| **OCP** | Hard-coded statuses | Extensible via config/constants |
| **LSP** | N/A | Repositories are substitutable |
| **ISP** | Monolithic context | Focused hooks per entity |
| **DIP** | Components → Concrete context | Components → Hooks → Services → Interfaces |

| 12-Factor | Before | After |
|-----------|--------|-------|
| **Config** | Hard-coded | Environment-based |
| **Backing Services** | Tightly coupled | Repository abstraction |
| **Dev/Prod Parity** | Mixed demo data | Conditional seed loading |
| **Logs** | None | Centralized logger |

---

## Implementation Order

Recommended order for minimal disruption:

1. **Phase 1 + 6** - Configuration & Seed Data (foundation)
2. **Phase 2** - Domain Layer (types and constants)
3. **Phase 3** - Repository Pattern (data abstraction)
4. **Phase 4** - Service Layer (business logic)
5. **Phase 5** - Split Context (React integration)
6. **Phase 7** - Component Refactoring (UI cleanup)
7. **Phase 8 + 9** - Logging & Error Handling (polish)

Each phase can be implemented independently and tested before proceeding to the next.
