# Production Hardening Plan - Phase 2

**Repository:** `larryob78/open-ai-codex-platform-test`
**Branch:** `claude/ai-compliance-ui-WG5US`
**Baseline:** 47 tests passing, build clean, format clean, TypeScript clean
**Goal:** Raise product readiness from 6.5/10 to 8+/10

---

## Milestone 1: Content Security Policy + Security Headers

**Problem:** `index.html` has no CSP meta tag. The app uses `innerHTML` extensively, making it vulnerable to injected inline scripts. No referrer policy, no X-Frame-Options equivalent.

**Files to modify:**
- `index.html` - add CSP meta tag and referrer policy

**Changes:**
- Add `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';">` - allows the inline SVG favicon and inline styles but blocks external scripts
- Add `<meta name="referrer" content="strict-origin-when-cross-origin" />`

**Acceptance criteria:**
- CSP blocks external script injection
- App still functions (styles, favicon, JS all load)
- Build passes

---

## Milestone 2: Error Boundary + Route Recovery

**Problem:** If `page.render()` or `page.init()` throws, the user sees a raw error string with no way to recover. No Escape key handler on modals. No global unhandled rejection handler.

**Files to modify:**
- `src/router.ts` - add error boundary with retry button, add global error handler
- `src/components/modal.ts` - add Escape key to close modal
- `src/main.ts` - add `window.onerror` and `unhandledrejection` handlers that show toast

**Changes in router.ts:**
- Error catch renders a card with "Something went wrong", the escaped error, and a "Reload Page" button + "Go to Dashboard" link
- Add `window.addEventListener('unhandledrejection', ...)` in bootstrap that shows an error toast

**Changes in modal.ts:**
- Add `keydown` listener for Escape key that calls `closeModal()`
- Clean up listener on modal close

**Acceptance criteria:**
- Route error shows recovery UI with buttons
- Escape key closes any open modal
- Unhandled promise rejections show error toast instead of silently failing
- Build passes, all tests pass

---

## Milestone 3: Structured Logging + Audit Trail

**Problem:** Only `console.error` exists. A compliance tool must track who changed what and when. No audit trail for regulatory inspections.

**Files to create:**
- `src/utils/logger.ts` - structured logging utility

**Files to modify:**
- `src/types/index.ts` - add `AuditEntry` interface
- `src/db/index.ts` - add `auditLog` table in v5 migration, add to export/import
- `src/router.ts` - replace `console.error` with logger
- `src/pages/inventory.ts` - log system create/update/delete
- `src/pages/incidents.ts` - log incident create/update/delete
- `src/pages/settings.ts` - log profile save
- `src/pages/tasks.ts` - log task create/update/delete/status change
- `src/pages/vendors.ts` - log vendor create/update/delete

**Logger API:**
```typescript
// src/utils/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

export const logger = {
  debug(msg: string, ctx?: Record<string, unknown>): void,
  info(msg: string, ctx?: Record<string, unknown>): void,
  warn(msg: string, ctx?: Record<string, unknown>): void,
  error(msg: string, ctx?: Record<string, unknown>): void,
};
```

**AuditEntry type:**
```typescript
interface AuditEntry {
  id?: number;
  action: 'create' | 'update' | 'delete' | 'status-change' | 'import' | 'export';
  entity: string;     // 'aiSystem' | 'vendor' | 'task' | 'incident' | 'profile'
  entityId?: number;
  details: string;
  timestamp: string;
}
```

**Audit log calls (examples):**
- `inventory.ts` save: `await db.auditLog.add({ action: 'create', entity: 'aiSystem', entityId: id, details: 'Created AI system: ' + name, timestamp: now })`
- `tasks.ts` status change: `await db.auditLog.add({ action: 'status-change', entity: 'task', entityId: id, details: 'Moved from pending to in-progress', timestamp: now })`

**Acceptance criteria:**
- Logger utility with 4 levels, outputs to console in dev
- Audit entries persisted to IndexedDB on all CRUD operations
- Audit log included in JSON backup/restore
- Build passes, all tests pass

---

## Milestone 4: Input Validation Hardening

**Problem:** Form inputs are only `.trim()`'d. No length limits, no enum validation, no special character blocking. Email regex is weak.

**Files to create:**
- `src/utils/validate.ts` - shared validation functions

**Files to modify:**
- `src/pages/settings.ts` - use validators for profile fields
- `src/pages/inventory.ts` - use validators for system fields
- `src/pages/vendors.ts` - use validators for vendor fields
- `src/pages/incidents.ts` - use validators for incident fields
- `src/pages/tasks.ts` - use validators for task fields

**Validation functions:**
```typescript
// src/utils/validate.ts
export function isValidEmail(email: string): boolean  // RFC-compliant regex
export function isNonEmpty(val: string, fieldName: string): string | null  // returns error or null
export function maxLength(val: string, max: number, fieldName: string): string | null
export function isValidDate(val: string): boolean  // ISO date format
export function isOneOf<T extends string>(val: string, allowed: T[], fieldName: string): string | null
```

**Validation pattern in pages:**
```typescript
const errors: string[] = [];
const nameErr = maxLength(name, 200, 'Name');
if (nameErr) errors.push(nameErr);
if (!isNonEmpty(name, 'Name')) errors.push('Name is required');
if (errors.length > 0) {
  showToast(errors[0], 'warning');
  return;
}
```

**Acceptance criteria:**
- All form inputs validate: required fields, max length (200 for names, 2000 for descriptions), valid email, valid date
- Enum fields (status, priority, severity, deploymentType) validated against allowed values
- Validation errors show as warning toasts
- Tests for all validation functions
- Build passes

---

## Milestone 5: Audit Log Viewer Page

**Problem:** Audit log entries from Milestone 3 need a UI for viewing. Compliance officers need to review change history.

**Files to create:**
- `src/pages/audit.ts` - audit log viewer page

**Files to modify:**
- `src/main.ts` - register `/audit` route
- `src/components/nav.ts` - add Audit Log nav item (after Task Board, before Exports)

**Page features:**
- Table displaying audit entries: Timestamp, Action, Entity, Details
- Sorted newest first
- Filter buttons: All | Creates | Updates | Deletes
- "Export Audit Log" button that downloads CSV
- Empty state: "No audit entries yet."

**Acceptance criteria:**
- Audit log page renders table of entries
- Filters work
- CSV export works
- Nav item appears in sidebar
- Build passes

---

## Milestone 6: Search and Filtering

**Problem:** No search on inventory, tasks, vendors, or incidents pages. Users with 50+ systems have no way to find specific items.

**Files to modify:**
- `src/pages/inventory.ts` - add search bar filtering by system name/description/vendor
- `src/pages/tasks.ts` - add filter bar for priority and status on kanban board
- `src/pages/vendors.ts` - add search bar filtering by vendor name
- `src/pages/incidents.ts` - add search bar and severity/status filter

**Pattern:**
```html
<div class="search-bar">
  <input class="form-input" id="search-{page}" type="search" placeholder="Search..." />
</div>
```

```typescript
searchInput?.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase().trim();
  // Filter displayed items, re-render table/cards
});
```

**Acceptance criteria:**
- Inventory: search filters systems by name, description, or vendor
- Tasks: dropdown filters by priority (all/high/medium/low)
- Vendors: search by name
- Incidents: search by title, filter by severity dropdown
- Searches are instant (client-side filter on already-loaded data)
- Build passes

---

## Milestone 7: Accessibility Hardening

**Problem:** Missing skip-to-content link, SVG nav icons lack aria-labels, no screen reader announcements for dynamic content changes.

**Files to modify:**
- `index.html` - add skip-to-content link
- `src/style.css` - add `.sr-only` and `.skip-link` classes
- `src/components/nav.ts` - add `aria-label` to all nav links (using the label text)
- `src/components/toast.ts` - add `role="alert"` and `aria-live="assertive"` to toast container
- `src/components/modal.ts` - add `role="dialog"`, `aria-modal="true"`, `aria-labelledby` to modal, add focus trap

**Changes:**
- Skip link: `<a href="#app-content" class="skip-link">Skip to main content</a>` as first child of `<body>`
- `.skip-link` CSS: visually hidden, visible on `:focus`
- `.sr-only` CSS: screen-reader-only utility class
- Nav icons: wrap icon span with `aria-hidden="true"`, rely on nav label text
- Toast: add `role="status"` to `#toast-container`, `role="alert"` to individual toasts
- Modal: focus first focusable element on open, return focus to trigger on close

**Acceptance criteria:**
- Tab from page top focuses skip link first
- Screen readers announce toasts
- Modal traps focus within itself
- Nav icons hidden from screen readers
- Build passes

---

## Milestone 8: Deletion Cascading + Data Integrity

**Problem:** Deleting an AI system leaves orphaned tasks, incidents, and generated docs referencing that system's ID. No referential integrity.

**Files to modify:**
- `src/pages/inventory.ts` - cascade delete related tasks and incidents when a system is deleted
- `src/pages/vendors.ts` - clean up `aiSystemIds` references when a system is deleted (already somewhat handled, but verify)
- `src/db/index.ts` - add helper `deleteSystemCascade(id: number)` that deletes related tasks, incidents, and updates vendor references in a transaction

**Cascade helper:**
```typescript
export async function deleteSystemCascade(systemId: number): Promise<void> {
  await db.transaction('rw', [db.aiSystems, db.tasks, db.incidents, db.vendors], async () => {
    await db.tasks.where('relatedSystemId').equals(systemId).delete();
    await db.incidents.where('relatedSystemId').equals(systemId).delete();
    await db.vendors.toCollection().modify(v => {
      v.aiSystemIds = v.aiSystemIds.filter(id => id !== systemId);
    });
    await db.aiSystems.delete(systemId);
  });
}
```

**Acceptance criteria:**
- Deleting a system also deletes its tasks and incidents
- Vendor `aiSystemIds` arrays are cleaned up
- All operations happen in a single transaction (atomic)
- Audit log entries created for cascade deletions
- Build passes, tests pass

---

## Milestone 9: Integration Tests for DB Operations

**Problem:** 47 unit tests cover business logic but zero tests cover database operations - migrations, backup/restore, cascade deletes.

**Files to create:**
- `src/tests/db.test.ts` - database integration tests using Dexie's in-memory adapter
- `src/tests/validate.test.ts` - validation function unit tests

**Tests to write:**

**db.test.ts (10+ tests):**
- `saveCompanyProfile` creates profile with createdAt
- `saveCompanyProfile` updates existing profile
- `exportAllData` includes all tables
- `importData` restores all tables
- `importData` rejects invalid JSON
- `importData` rejects non-object payload
- `deleteSystemCascade` removes system, tasks, and incidents
- `deleteSystemCascade` cleans vendor aiSystemIds
- Audit log entries are created on CRUD operations

**validate.test.ts (10+ tests):**
- `isValidEmail` accepts valid emails
- `isValidEmail` rejects invalid emails
- `isNonEmpty` returns error for empty strings
- `maxLength` returns error when exceeded
- `isValidDate` accepts ISO dates
- `isValidDate` rejects invalid dates
- `isOneOf` accepts valid enum values
- `isOneOf` rejects invalid values

**Target:** 67+ tests (up from 47)

**Acceptance criteria:**
- All new tests pass
- DB tests verify actual Dexie operations
- Validation tests cover edge cases
- Build passes

---

## Milestone 10: Polish - Dark Mode Support

**Problem:** No dark mode. Many users and compliance officers work in low-light environments.

**Files to modify:**
- `src/style.css` - add `@media (prefers-color-scheme: dark)` with dark color variables
- `src/pages/settings.ts` - add theme toggle (system/light/dark) saved in localStorage

**CSS changes:**
- Define dark variants of all CSS variables under `@media (prefers-color-scheme: dark)` and `.theme-dark` class
- Key dark values: `--c-bg: #0f172a`, `--c-surface: #1e293b`, `--c-text: #e2e8f0`, `--c-border: #334155`
- Cards, inputs, tables, modals all adapt via CSS variables
- Kanban cards get dark backgrounds

**Settings toggle:**
- 3-option radio: System (default) | Light | Dark
- Saved to `localStorage.getItem('theme-preference')`
- Applied via `document.documentElement.classList.add('theme-dark')` or `.theme-light`

**Acceptance criteria:**
- Dark mode activates automatically based on OS preference
- Manual toggle in Settings overrides OS preference
- All pages readable in dark mode
- Kanban board, modals, toasts, tables all styled
- Build passes

---

## Execution Order

```
Milestone 1   (CSP + security headers)
Milestone 2   (Error boundary + modal Escape key)
Milestone 3   (Structured logging + audit trail)
Milestone 4   (Input validation hardening)
Milestone 5   (Audit log viewer page)
Milestone 6   (Search and filtering)
Milestone 7   (Accessibility hardening)
Milestone 8   (Deletion cascading + data integrity)
Milestone 9   (Integration + validation tests)
Milestone 10  (Dark mode)
```

## Verification Commands (run after each milestone)

```bash
npx tsc --noEmit          # TypeScript clean
npm run build             # Vite production build
npx vitest run            # All tests pass
npm run format:check      # Prettier clean
```

## Non-Negotiables Maintained

- No backend, no accounts, no external services
- All data stays in browser (IndexedDB via Dexie.js)
- No em dashes anywhere
- No UX redesign - enhancements build on existing patterns
- "Not legal advice" disclaimer visible on every page
- EU AI Act timeline references official sources

---

**Awaiting approval to execute.**
