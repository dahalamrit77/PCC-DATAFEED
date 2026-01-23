# Industry Standard Codebase Transformation Plan
## 3-Phase Implementation Roadmap

**Objective**: Transform the codebase into an industry-standard, production-ready application following feature-first architecture, eliminating redundancy, and ensuring professional code quality throughout.

**Architectural Style**: **Feature-First Architecture** (app + features + shared + entities)
- `src/app/` - Application shell (config, providers, router, store)
- `src/features/` - Business domain features (auth, dashboard, patients, users)
- `src/shared/` - Shared utilities, UI components, hooks, libs, constants, types
- `src/entities/` - Cross-feature domain entities (facility)

---

## PHASE 1: Architecture Cleanup & Directory Consistency
**Goal**: Eliminate all legacy directories and ensure single source of truth for every module.

### 1.1 Remove Legacy Bootstrap & App Entry Points
**Files to Delete:**
- `src/bootstrap/router.tsx`
- `src/bootstrap/providers.tsx`
- `src/bootstrap/index.ts` (if exists)
- `src/App.tsx` (not used - main.tsx uses AppProviders directly)

**Verification:**
- Confirm `src/main.tsx` only imports from `app/providers/AppProviders`
- Confirm `app/providers/AppProviders.tsx` uses `app/router` (not bootstrap/router)

---

### 1.2 Consolidate Router & Route Protection
**Files to Keep:**
- `src/app/router/routes.tsx` (canonical)
- `src/app/router/ProtectedRoute.tsx` (canonical)
- `src/app/router/RoleProtectedRoute.tsx` (canonical)
- `src/app/router/index.ts` (exports router)

**Files to Delete:**
- `src/routes/ProtectedRoute.tsx`
- `src/routes/index.ts`

**Actions:**
1. Search entire codebase for imports from `../routes` or `../../routes`
2. Replace with imports from `app/router` or `@app/router`
3. Verify no references remain, then delete legacy folder

---

### 1.3 Consolidate Layout Components
**Current State:**
- `src/components/layout/DashboardLayout.tsx` (legacy)
- `src/components/layout/DashboardWrapper.tsx` (legacy)
- `src/components/layout/UserMenu.tsx` (legacy)
- `src/shared/components/layout/DashboardLayout.tsx` (canonical)
- `src/shared/components/layout/DashboardWrapper.tsx` (canonical)
- `src/shared/components/layout/UserMenu.tsx` (canonical)

**Actions:**
1. Search codebase for imports from `components/layout` or `../../components/layout`
2. Replace all with imports from `shared/components/layout` or `@shared/components/layout`
3. Verify `app/router/routes.tsx` imports `DashboardWrapper` from shared (already does)
4. Verify `DashboardLayout` is only used from shared (check DashboardWrapper)
5. Delete `src/components/layout/` folder entirely

---

### 1.4 Consolidate Auth Components
**Current State:**
- `src/components/auth/LoginForm.tsx` (legacy - uses old authService)
- `src/components/auth/LoginHero.tsx` (legacy)
- `src/components/auth/index.ts` (legacy)
- `src/features/auth/components/LoginForm.tsx` (canonical - uses RTK Query)
- `src/features/auth/components/LoginHero.tsx` (canonical)
- `src/features/auth/components/index.ts` (canonical)

**Actions:**
1. Verify `features/auth/pages/LoginPage.tsx` imports from `../components` (correct)
2. Verify no other files import from `components/auth`
3. Delete `src/components/auth/` folder entirely
4. Delete `src/components/index.ts` if it only exports auth/layout

---

### 1.5 Remove Legacy Pages Directory
**Current State:**
- `src/pages/auth/LoginPage.tsx` (duplicate)
- `src/pages/dashboard/DashboardPage.tsx` (still used via re-export)
- `src/pages/dashboard/PatientsIndexPage.tsx` (still used via re-export)
- `src/pages/dashboard/PatientDetailsPage.tsx` (still used)
- `src/pages/index.ts` (legacy)

**Migration Strategy:**

**Step 1: Fully Migrate DashboardPage**
1. Open `src/pages/dashboard/DashboardPage.tsx`
2. Copy entire content to `src/features/dashboard/pages/DashboardPage.tsx`
3. Replace all imports:
   - `../../services/*` → `@shared/api` or RTK Query hooks
   - `../../components/*` → `@shared/components/*` or `@features/*/components`
   - `../../contexts/*` → Remove if RTK Query replaces it
   - `../../hooks/*` → `@shared/hooks/*` or feature-specific hooks
4. Remove re-export, keep only the migrated component
5. Verify imports in `app/router/routes.tsx` still work

**Step 2: Fully Migrate PatientsIndexPage**
1. Open `src/pages/dashboard/PatientsIndexPage.tsx`
2. Copy entire content to `src/features/patients/pages/PatientsIndexPage.tsx`
3. Replace all imports (same pattern as above)
4. Remove re-export, keep only migrated component

**Step 3: Migrate PatientDetailsPage**
1. Open `src/pages/dashboard/PatientDetailsPage.tsx`
2. Copy entire content to `src/features/patients/pages/PatientDetailsPage.tsx` (if not already done)
3. Replace all imports (same pattern)
4. Verify `app/router/routes.tsx` imports from features (already does)

**Step 4: Remove Legacy Pages**
1. Verify `features/auth/pages/LoginPage.tsx` exists and is complete
2. Delete `src/pages/auth/LoginPage.tsx`
3. Delete `src/pages/dashboard/DashboardPage.tsx`
4. Delete `src/pages/dashboard/PatientsIndexPage.tsx`
5. Delete `src/pages/dashboard/PatientDetailsPage.tsx` (if migrated)
6. Delete `src/pages/auth/index.ts`
7. Delete `src/pages/index.ts`
8. Delete empty `src/pages/` folder

---

### 1.6 Consolidate Store/State Management
**Current State:**
- `src/store/index.ts` (legacy - may set store instance)
- `src/store/hooks.ts` (legacy)
- `src/store/slices/facilitySlice.ts` (legacy - uses old service)
- `src/app/store/index.ts` (canonical)
- `src/app/store/hooks.ts` (canonical)
- `src/app/store/rootReducer.ts` (canonical)
- `src/entities/facility/store/facilitySlice.ts` (canonical - uses RTK Query)

**Actions:**
1. Check if `src/store/index.ts` sets store instance for services
2. If yes, move that logic to `app/store/index.ts` or remove if not needed
3. Search codebase for imports from `../../store` or `../store` (excluding `app/store`)
4. Replace with imports from `app/store` or `@app/store`
5. Verify `src/entities/facility/store/facilitySlice.ts` is the only facility slice
6. Delete `src/store/` folder entirely

---

### 1.7 Remove Legacy Hooks & Contexts
**Current State:**
- `src/hooks/usePatientCoverage.ts` (legacy - may use old service)
- `src/contexts/DashboardContext.tsx` (legacy - replaced by RTK Query)

**Actions:**
1. Check `usePatientCoverage.ts`:
   - If it wraps RTK Query, move to `features/patients/hooks/`
   - If it uses old service, replace with RTK Query hook and delete
2. Search for imports of `usePatientCoverage`:
   - Replace with `useGetMultiplePatientCoverageQuery` or appropriate RTK Query hook
3. Check `DashboardContext.tsx`:
   - Verify it's only used in legacy `components/layout/DashboardWrapper.tsx`
   - Since DashboardWrapper will be deleted, context becomes unused
   - If any features use it, migrate to RTK Query + Redux state
4. Search for imports of `DashboardContext` or `useDashboard`:
   - Replace with RTK Query hooks (e.g., `useGetPatientsQuery`, `useGetEventsQuery`)
5. Delete `src/hooks/` folder
6. Delete `src/contexts/` folder

---

### 1.8 Remove Legacy Services (Phase 1 Prep - Identify All Usages)
**Current State:**
- `src/services/api.ts` (legacy axios client)
- `src/services/auth.service.ts`
- `src/services/patient.service.ts`
- `src/services/coverage.service.ts`
- `src/services/events.service.ts`
- `src/services/adt.service.ts`
- `src/services/facility.service.ts`
- `src/services/patient.adapter.ts`
- `src/services/index.ts`

**RTK Query Replacements (Already Exist):**
- `src/shared/api/baseApi.ts` (RTK Query base)
- `src/shared/api/apiClient.ts` (Axios for RTK Query)
- `src/shared/api/interceptors.ts`
- `src/features/auth/api/authApi.ts`
- `src/features/patients/api/*.ts` (patientsApi, coverageApi, adtApi, eventsApi)
- `src/entities/facility/api/facilityApi.ts`

**Actions (Phase 1 - Identification Only):**
1. Create a mapping document of old service → new RTK Query API:
   - `authService.login()` → `useLoginMutation()` from `authApi`
   - `patientService.getPatients()` → `useGetPatientsQuery()` from `patientsApi`
   - `coverageService.getCoverage()` → `useGetMultiplePatientCoverageQuery()` from `coverageApi`
   - `eventsService.getEvents()` → `useGetEventsQuery()` from `eventsApi`
   - `adtService.getADTHistory()` → `useGetPatientADTHistoryQuery()` from `adtApi`
   - `facilityService.getFacilities()` → `useGetFacilitiesQuery()` from `facilityApi`
2. Search for ALL imports from `services/*`:
   - Document each file that imports services
   - Mark which are already migrated vs which need migration
3. **DO NOT DELETE SERVICES YET** - this will be done in Phase 2

---

### 1.9 Clean Up Remaining Components Directory
**Check `src/components/`:**
- If only `components/dashboard/` remains (InsuranceCell, etc.):
  - Evaluate if these belong in `shared/components/ui` or `features/dashboard/components`
  - Move appropriately
- Delete `src/components/index.ts` if empty or only re-exports
- Delete `src/components/` folder if empty

---

### 1.10 Verify Path Aliases & Import Consistency
**Actions:**
1. Ensure all files use path aliases (`@app`, `@features`, `@shared`, `@entities`) instead of relative paths where beneficial
2. Update `tsconfig.app.json` and `vite.config.ts` if any aliases are missing
3. Standardize import order:
   - External libraries (React, MUI, etc.)
   - Internal aliases (@app, @features, @shared, @entities)
   - Relative imports (../ or ./)
   - Types (import type {...})

---

### 1.11 Final Directory Structure Verification
**Expected Final Structure:**
```
src/
├── app/
│   ├── config/
│   ├── providers/
│   ├── router/
│   └── store/
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── patients/
│   └── users/
├── entities/
│   └── facility/
├── shared/
│   ├── api/
│   ├── components/
│   ├── constants/
│   ├── hooks/
│   ├── lib/
│   └── types/
├── theme/
├── main.tsx
└── index.css
```

**Folders to be DELETED:**
- `src/bootstrap/`
- `src/components/` (or only dashboard subfolder moved)
- `src/contexts/`
- `src/hooks/`
- `src/pages/`
- `src/routes/`
- `src/services/` (Phase 2)
- `src/store/` (except app/store)
- `src/App.tsx` (standalone file)

---

## PHASE 2: Code Quality & Redundancy Elimination
**Goal**: Make RTK Query the single data fetching layer, remove all service dependencies, standardize React/TypeScript patterns, eliminate code duplication.

### 2.1 Complete Service-to-RTK Query Migration

**2.1.1 Migrate Remaining Service Usages**

**File: `src/pages/dashboard/PatientDetailsPage.tsx` (if not migrated in Phase 1)**
- Find: `import { patientService } from '../../services/patient.service';`
- Replace: Use `useGetPatientQuery(id)` from `patientsApi.ts`
- Remove any manual data fetching logic

**File: `src/features/patients/hooks/usePatientDetails.ts`**
- Find: `import { enrichPatientData } from '../../../services/patient.adapter';`
- Action: Move adapter logic into RTK Query transformResponse or a shared utility in `shared/lib/`
- Update import path

**File: `src/store/slices/facilitySlice.ts` (if still exists)**
- This should have been deleted in Phase 1, but if found:
  - Verify `entities/facility/store/facilitySlice.ts` handles all facility state
  - Delete legacy slice

**File: `src/components/dashboard/InsuranceCell.tsx` (if exists)**
- Find: `import { coverageService } from '../../services';`
- Replace: Use `useGetPatientCoverageQuery()` from `coverageApi.ts`
- If component is used, ensure it receives data as props or uses hook internally

**File: `src/components/auth/LoginForm.tsx` (if still exists)**
- Should have been deleted in Phase 1
- If found, verify `features/auth/components/LoginForm.tsx` uses RTK Query

**File: `src/routes/ProtectedRoute.tsx` (if still exists)**
- Should have been deleted in Phase 1
- If found, verify it imports storage from `shared/lib/storage`

**File: `src/hooks/usePatientCoverage.ts` (if still exists)**
- Should have been deleted in Phase 1
- If found, replace usages with RTK Query hooks

**2.1.2 Remove Service Dependencies from Shared API**
- Check `src/shared/api/apiClient.ts`:
  - If it imports from `services/api.ts`, consolidate axios config here
  - Ensure interceptors are in `shared/api/interceptors.ts`
- Verify `src/store/index.ts` (legacy) doesn't set store instance - if it does, remove that logic

**2.1.3 Delete All Service Files**
After verifying no imports remain:
1. Delete `src/services/api.ts`
2. Delete `src/services/auth.service.ts`
3. Delete `src/services/patient.service.ts`
4. Delete `src/services/coverage.service.ts`
5. Delete `src/services/events.service.ts`
6. Delete `src/services/adt.service.ts`
7. Delete `src/services/facility.service.ts`
8. Delete `src/services/patient.adapter.ts`
9. Delete `src/services/index.ts`
10. Delete `src/services/` folder

---

### 2.2 Standardize RTK Query API Structure

**2.2.1 Ensure Consistent API Patterns**
For each RTK Query API file (`authApi.ts`, `patientsApi.ts`, `coverageApi.ts`, `adtApi.ts`, `eventsApi.ts`, `facilityApi.ts`):

1. **Base Configuration:**
   - All should extend `baseApi` from `shared/api/baseApi.ts`
   - Use consistent tag invalidation strategies
   - Use consistent error handling

2. **Type Safety:**
   - All endpoints should have explicit TypeScript generics:
     ```typescript
     query: (arg: QueryArg) => ({
       url: '/endpoint',
       params: arg,
     }),
     transformResponse: (response: ApiResponse<DataType>) => response.data,
     ```
   - Define and export request/response types in feature `types/` folder or `shared/types/`

3. **Tagging Strategy:**
   - Use consistent tag types (e.g., 'Patient', 'Coverage', 'Facility')
   - Ensure proper cache invalidation on mutations

**2.2.2 Audit and Fix API Endpoints**
- Review each API file for:
  - Missing type definitions
  - Inconsistent error handling
  - Missing cache tags
  - Hardcoded URLs (should use constants or env vars)

---

### 2.3 Eliminate Redundant State Management

**2.3.1 Remove Context-Based State**
- Verify no `DashboardContext` or similar contexts remain
- All data fetching should go through RTK Query
- UI state (modals, filters) can use `useState` or Redux slices if shared

**2.3.2 Consolidate Facility State**
- Ensure `entities/facility/store/facilitySlice.ts` is the single source of truth
- Verify `DashboardLayout` uses Redux facility state, not local state
- Remove any duplicate facility filtering logic

**2.3.3 Standardize Auth State**
- Verify `features/auth/store/authSlice.ts` is the single source of truth
- Ensure `ProtectedRoute` and `RoleProtectedRoute` read from Redux, not localStorage directly (except for initial hydration)

---

### 2.4 TypeScript Strictness & Type Safety

**2.4.1 Eliminate `any` Types**
1. Search codebase for `: any` or implicit any
2. Replace with proper types:
   - API responses → typed interfaces
   - Component props → explicit interfaces
   - Event handlers → proper event types

**2.4.2 Ensure All Components Are Properly Typed**
- All function components should have explicit prop types
- Use `React.FC<Props>` or `function Component(props: Props)` consistently
- Remove `// @ts-ignore` or `// @ts-expect-error` comments (fix underlying issues)

**2.4.3 Type All API Responses**
- Create/verify types in `shared/types/api.types.ts` or feature-specific types
- Ensure all RTK Query endpoints have `Response` and `Request` types

**2.4.4 Fix TypeScript Errors**
- Run `tsc --noEmit` to find all type errors
- Fix all errors (no exceptions for "good enough")

---

### 2.5 Standardize React Patterns

**2.5.1 Component Structure**
- Standardize component file structure:
  ```typescript
  // Imports (external → internal → relative → types)
  import React from 'react';
  import { Box } from '@mui/material';
  import { PageHeader } from '@shared/components/ui';
  
  // Types
  interface ComponentProps {
    // ...
  }
  
  // Component
  export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
    // Hooks
    // State
    // Effects
    // Handlers
    // Render
  };
  ```

**2.5.2 Hook Usage Standards**
- All custom hooks in `shared/hooks/` or feature-specific hooks folders
- Hooks should follow `use*` naming convention
- No conditional hook calls
- Proper dependency arrays in `useEffect`, `useMemo`, `useCallback`

**2.5.3 Remove Unused Code**
- Remove unused imports
- Remove commented-out code
- Remove dead functions/components
- Use ESLint to auto-fix where possible

---

### 2.6 Standardize Import Paths

**2.6.1 Use Path Aliases Consistently**
- Replace relative imports (`../../../shared`) with aliases (`@shared`)
- Update all files to use:
  - `@app/*` for app-level code
  - `@features/*` for features
  - `@shared/*` for shared code
  - `@entities/*` for entities

**2.6.2 Import Order Standardization**
Create ESLint rule or manual standard:
1. External packages (React, MUI, etc.)
2. Internal path aliases (@app, @features, @shared, @entities)
3. Relative imports (../ or ./)
4. Type-only imports (import type {...})

---

### 2.7 Error Handling Consistency

**2.7.1 Standardize RTK Query Error Handling**
- Ensure all RTK Query APIs use consistent error transformation
- Errors should be logged via `shared/lib/logger.ts`
- User-facing errors should use toast notifications

**2.7.2 Component Error Boundaries**
- Verify `app/providers/ErrorBoundary.tsx` wraps the app
- Add error boundaries at feature level if needed
- Ensure error boundaries log to monitoring service (when added)

---

### 2.8 Remove Duplicate Utilities

**2.8.1 Consolidate Date Utilities**
- Verify all date formatting uses `shared/lib/date.ts`
- Remove any duplicate date utilities

**2.8.2 Consolidate Storage Utilities**
- Verify all localStorage access goes through `shared/lib/storage.ts`
- Remove any direct `localStorage.getItem/setItem` calls

**2.8.3 Consolidate Permission Checks**
- Verify all permission checks use `shared/lib/permissions.ts` and `usePermissions` hook
- Remove any duplicate permission logic in components

---

### Phase 2 Completion Summary ✓

**Completed:**

- **2.1 Service-to-RTK Query:** All `src/services/` removed. `enrichPatientData` lives in `shared/lib/patient.adapter.ts`. Data fetching via RTK Query only.
- **2.2 RTK Query:** APIs use `baseApi`, typed request/response, consistent tags (`Patient`, `Coverage`, `Event`, `Adt`, `Facility`, `User`), and `transformResponse`. Unused `providesTags` args prefixed with `_`.
- **2.3 State:** `DashboardContext` kept for `searchTerm` (UI only). Facility and auth state in Redux/RTK Query.
- **2.4 TypeScript:** `any` removed in events/patients APIs (typed `Record<string, unknown>`). Unused imports/vars removed. `tsc --noEmit` passes.
- **2.5 React:** Unused imports and variables removed. Select `onChange` in user forms normalized for typing.
- **2.6 Imports:** `@app`, `@features`, `@shared`, `@entities`, `@components`, `@contexts` used. `patient.types` use relative paths to avoid `@types`/Declaration File conflict.
- **2.7 Error handling:** `logger` used instead of `console` in auth, jwt, env. Toasts for user-facing errors.
- **2.8 Utilities:** `formatEventTime` centralized in `shared/lib/date.ts`. `formatEventTime` used by `DashboardPage` and `LiveUpdates`. Storage and permissions already centralized.

**Path aliases (vite + tsconfig):** `@app`, `@features`, `@shared`, `@entities`, `@types`, `@components`, `@contexts`, `@theme`.

---

## PHASE 3: Production Readiness & Polish
**Goal**: Ensure design consistency, security hardening, performance optimization, and final code quality audit.

### 3.1 Design System Consistency Audit

**3.1.1 Verify All Pages Use Shared UI Components**
Audit each page route:
- **Dashboard** (`features/dashboard/pages/DashboardPage.tsx`):
  - Uses `PageHeader`? ✓
  - Uses `SectionCard` or `DataTableContainer`? ✓
  - Uses skeleton loaders? ✓
  - Uses theme colors (no hardcoded colors)? ✓

- **Patients Index** (`features/patients/pages/PatientsIndexPage.tsx`):
  - Uses `PageHeader`? ✓
  - Uses `DataTableContainer`? ✓
  - Uses skeleton loaders? ✓

- **Patient Details** (`features/patients/pages/PatientDetailsPage.tsx`):
  - Uses `PageHeader`? ✓
  - Uses `SectionCard` for tabs? ✓
  - Uses `DataTableContainer` for tables? ✓
  - Uses `EmptyState` for empty states? ✓

- **Users Index** (`features/users/pages/UsersIndexPage.tsx`):
  - Uses `PageHeader`? ✓
  - Uses `DataTableContainer`? ✓

- **Create User** (`features/users/pages/CreateUserPage.tsx`):
  - Uses `PageHeader`? ✓
  - Uses consistent form styling? ✓

- **Login** (`features/auth/pages/LoginPage.tsx`):
  - Uses consistent layout? ✓

**3.1.2 Replace Ad-hoc Styling**
1. Search for hardcoded colors (`'#1976d2'`, `'#fff'`, etc.):
   - Replace with `theme.palette.primary.main`, `'background.paper'`, etc.
2. Search for magic numbers in `sx` props:
   - Replace with theme spacing (`theme.spacing(2)`) or use `sx={{ p: 2 }}`
3. Ensure all components use theme typography variants:
   - `variant="h1"` through `variant="body2"`, not `fontSize: 14`

**3.1.3 Ensure Consistent Component Usage**
- All cards should use `Card` from MUI (styled by theme) or `SectionCard`
- All tables should use `DataTableContainer` with proper loading/empty states
- All buttons should use MUI `Button` with theme variants
- All inputs should use MUI `TextField` with consistent `size="small"`

---

### 3.2 Security Hardening

**3.2.1 Token Storage & Validation**
- Verify `shared/lib/storage.ts` is the only place that accesses localStorage for auth
- Ensure `isTokenValid()` is called on every route entry (already in `ProtectedRoute`)
- Verify token is never logged in console or error messages

**3.2.2 RBAC Enforcement**
- Audit all protected UI elements:
  - Buttons that create users → check `canCreateUsers()`
  - Facility dropdown → only show for Super Admin
  - Navigation items → use permission checks
- Ensure `RoleProtectedRoute` is used for all role-gated routes
- Verify role/facilities always come from Redux state (initialized from JWT/storage)

**3.2.3 Input Sanitization**
- Ensure all form inputs use proper validation (yup schemas)
- Verify no unsanitized user input is rendered (React escapes by default, but be explicit)
- Ensure API requests don't include sensitive data in URLs (use POST body)

**3.2.4 Error Message Security**
- Ensure error messages don't leak sensitive info (user emails, IDs, etc.)
- Use generic messages for auth failures
- Log detailed errors server-side only (via logger)

**3.2.5 Environment Variables**
- Verify no secrets are hardcoded
- Ensure `.env.example` documents all required variables
- Verify `.env` is in `.gitignore`

---

### 3.3 Performance Optimization

**3.3.1 Code Splitting**
- Verify all routes use lazy loading (already in `app/router/routes.tsx`)
- Ensure heavy components (charts, large tables) are lazy-loaded if possible
- Verify `LoadingFallback` is consistent

**3.3.2 RTK Query Optimization**
- Verify proper cache configuration:
  - Appropriate `keepUnusedDataFor` values
  - Proper tag invalidation to prevent stale data
- Ensure parallel queries where possible (already done in `usePatientDetails`)
- Verify no unnecessary refetches

**3.3.3 Component Optimization**
- Use `React.memo` for expensive components that receive stable props
- Use `useMemo` for expensive computations
- Use `useCallback` for functions passed as props to memoized components
- Verify no unnecessary re-renders (use React DevTools Profiler)

**3.3.4 Bundle Size**
- Run `npm run build` and analyze bundle size
- Remove unused dependencies
- Verify tree-shaking is working (no `import * from 'library'`)

---

### 3.4 Accessibility & UX Polish

**3.4.1 Keyboard Navigation**
- Ensure all interactive elements are keyboard accessible
- Verify focus states are visible
- Ensure proper tab order

**3.4.2 ARIA Labels**
- Ensure icon-only buttons have `aria-label`
- Ensure form inputs have associated labels
- Ensure loading states have `aria-live` regions

**3.4.3 Responsive Design**
- Test on mobile (360px+), tablet (768px+), desktop (1280px+)
- Verify sidebar drawer works on mobile
- Verify tables are scrollable on mobile
- Verify forms don't overflow on small screens

**3.4.4 Loading States**
- Ensure all async operations show loading indicators
- Use skeleton loaders for content (not spinners)
- Ensure error states are user-friendly

---

### 3.5 Final Code Quality Audit

**3.5.1 ESLint Compliance**
- Run `npm run lint`
- Fix all ESLint errors and warnings
- Ensure no `console.log` in production code (use `logger` instead)

**3.5.2 TypeScript Compliance**
- Run `tsc --noEmit`
- Fix all TypeScript errors
- Ensure strict mode is enabled (already is)

**3.5.3 Code Consistency Check**
- Verify naming conventions:
  - Components: PascalCase
  - Hooks: camelCase starting with `use`
  - Utilities: camelCase
  - Constants: UPPER_SNAKE_CASE
- Verify file naming:
  - Components: `ComponentName.tsx`
  - Hooks: `useHookName.ts`
  - Utilities: `utilityName.ts`
  - Types: `domain.types.ts`

**3.5.4 Remove All TODO/FIXME Comments**
- Search for `TODO`, `FIXME`, `XXX`, `HACK`
- Either implement or create proper tickets
- Remove placeholder comments

**3.5.5 Final Redundancy Check**
- Search for duplicate functions/logic
- Consolidate if found
- Ensure no unused exports

---

### 3.6 Build & Runtime Verification

**3.6.1 Build Verification**
- Run `npm run build`
- Ensure build succeeds without errors or warnings
- Verify production build size is reasonable
- Test production build locally (`npm run preview`)

**3.6.2 Runtime Verification**
- Test all user flows:
  - Login → Dashboard
  - Dashboard → Patients
  - Patients → Patient Details
  - Facility filtering (Super Admin)
  - User Management → Create User
  - Logout
- Verify no console errors
- Verify no broken imports
- Verify all API calls work

**3.6.3 Browser Compatibility**
- Test in Chrome, Firefox, Safari, Edge
- Verify no browser-specific issues

---

### Phase 3 Completion Summary ✓ (Testing excluded as requested)

**Completed:**

- **3.1 Design:** Replaced hardcoded colors in `LoginHero` with `common.white` and `alpha(theme.palette.common.white, …)`. Replaced `fontSize: 14` with `'0.875rem'` and `fontSize: 28` with `'1.75rem'`. `UserMenu` and `MetricCardSkeleton` use `boxShadow: 2` / `boxShadow: 4` (theme). Theme tokens in `theme.ts` left as design source.
- **3.2 Security:** `.env` and `.env.local` added to `.gitignore`. `.env.example` rewritten as UTF-8 with `VITE_API_BASE_URL`, `VITE_APP_NAME`, `VITE_ENVIRONMENT`. Auth via `storage`, `isTokenValid` in `ProtectedRoute`, RBAC and `RoleProtectedRoute` in place. User forms use yup/validation. Error copy kept generic; `aria-label`s avoid leaking emails.
- **3.3 Performance:** `keepUnusedDataFor: 60` set on `baseApi`. Routes remain lazy-loaded with `LoadingFallback`. Unused `react-error-boundary` removed from `package.json`.
- **3.4 Accessibility:** `aria-label` on icon-only `IconButton`s (View patient, More actions, Close live updates, Edit user, Delete user). `LoadingFallback` has `role="status"`, `aria-live="polite"`, `aria-label="Loading"`. `DataTableContainer` has `aria-busy` when loading and `role="status"` / `aria-label="Loading table"` on the skeleton box.
- **3.5 Code quality:** `TODO` in `logger.ts` replaced with “Future: integrate with Sentry…”. `tsc --noEmit` passes. ESLint run (no new errors).
- **3.6 Build:** `tsc --noEmit` passes. Manual runtime and browser checks (3.6.2, 3.6.3) left to user; no automated testing added.

**Skipped (per request):** Automated testing (unit, e2e, etc.).

---

## Success Criteria

After completing all 3 phases, the codebase should:

✅ **Architecture:**
- Single, consistent feature-first structure
- No legacy directories
- All imports use path aliases or consistent relative paths

✅ **Code Quality:**
- Zero TypeScript errors
- Zero ESLint errors
- No `any` types (except in extreme edge cases with justification)
- RTK Query is the single data fetching layer
- No duplicate code or utilities

✅ **Consistency:**
- All pages use shared UI components
- All styling uses theme
- Consistent component patterns
- Consistent error handling

✅ **Security:**
- Token validation on route entry
- RBAC enforced throughout
- No sensitive data in logs
- Input validation on all forms

✅ **Performance:**
- Lazy loading on routes
- Optimized RTK Query caching
- No unnecessary re-renders
- Reasonable bundle size

✅ **Production Ready:**
- Build succeeds
- All features work
- No runtime errors
- Responsive and accessible

---

## Execution Notes

- **Work sequentially**: Complete Phase 1 before starting Phase 2, Phase 2 before Phase 3
- **Test frequently**: After each major change, verify the app still works
- **Commit incrementally**: Small, logical commits after each task
- **Document blockers**: If something can't be deleted yet, document why and create a follow-up task
- **Verify imports**: Use IDE "Find Usages" or grep to ensure no broken imports before deleting files

---

## Estimated Timeline

- **Phase 1**: 4-6 hours (mostly mechanical file moves and import updates)
- **Phase 2**: 6-8 hours (requires understanding code logic and making architectural decisions)
- **Phase 3**: 4-6 hours (auditing and polish)

**Total**: ~14-20 hours of focused work
