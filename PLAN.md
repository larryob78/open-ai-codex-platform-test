# Production-Grade Upgrade Plan

**Repository:** `larryob78/open-ai-codex-platform-test`
**Branch:** `claude/ai-compliance-ui-WG5US`
**Baseline:** 22 tests passing, build clean, format clean, TypeScript clean

---

## Milestone 1: Security Hardening - Unified XSS Escape

**Problem:** 6 page files define local `escapeHtml()` that omit single-quote escaping (`'` -> `&#39;`). Only `dashboard.ts` and `risk.ts` import the shared utility. Additionally, `router.ts:30` injects `${String(err)}` into innerHTML unescaped.

**Files to modify:**
- `src/pages/inventory.ts` - line 33-37: delete local `escapeHtml()`, add `import { escapeHtml } from '../utils/escapeHtml';`
- `src/pages/vendors.ts` - line 8-10: delete local, add import
- `src/pages/templates.ts` - line 10-12: delete local, add import
- `src/pages/training.ts` - line 7-9: delete local, add import
- `src/pages/incidents.ts` - line 9-11: delete local, add import
- `src/pages/obligations.ts` - line 125-127: delete local, add import
- `src/router.ts` - line 30: escape `String(err)` using imported `escapeHtml`

**Acceptance criteria:**
- `grep -r "function escapeHtml" src/pages/` returns zero results
- All 7 files import from `../utils/escapeHtml`
- Router error path XSS is eliminated
- Build passes, all existing tests pass

---

## Milestone 2: Security Hardening - Template Markdown Injection

**Problem:** `templateGen.ts` interpolates user data (system names, descriptions, vendor names, DPO details) directly into markdown strings. A system named `| DROP TABLE |` or `[evil](javascript:alert(1))` would break markdown table structure or inject links.

**Files to modify:**
- `src/utils/escapeHtml.ts` - add exported `escapeMarkdown(str)` function that escapes `|`, `[`, `]`, `(`, `)`, `*`, `_`, `` ` ``, `#`, `~`
- `src/services/templateGen.ts` - import `escapeMarkdown`, use it in `systemInventoryTable()` and `vendorSection()` for all interpolated user values (system.name, system.owner, system.description, vendor.name, vendor.contact, profile.dpoName, profile.dpoEmail, companyName)

**Acceptance criteria:**
- New test in `src/tests/escapeHtml.test.ts` verifying `escapeMarkdown()` escapes pipe characters and brackets
- Build passes

---

## Milestone 3: Bug Fixes

**3a: Training module `&amp;` double-encoding**
- `src/pages/training.ts` lines 30, 89: Replace `&amp;` with `&` in module titles. Lines 252, 258 that manually decode `&amp;` back to `&` can then be simplified to use `mod.title` directly.

**3b: Templates `.reverse().sortBy()` bug**
- `src/pages/templates.ts` line 204: Dexie's `.sortBy()` re-sorts ignoring prior `.reverse()`. Fix: use `.sortBy('createdAt')` then `docs.reverse()` on the result array, or use `.orderBy('createdAt').reverse().toArray()`.

**3c: `taskGenerator.ts` date math across year boundary**
- `src/services/taskGenerator.ts` line 22-26: `setMonth()` with large negative values can produce wrong dates (e.g., subtracting 6 months from Jan gives July of prior year but day may overflow). Replace with explicit calculation: decrement year when months go negative, or use `d.setDate(1)` before `setMonth` to avoid day overflow.

**3d: Import data `JSON.parse` uncaught**
- `src/db/index.ts` line 100: `JSON.parse(json)` is not in a try-catch. If the file is malformed, it throws a raw SyntaxError. Wrap in try-catch and throw a user-friendly error: `"Invalid backup file: not valid JSON."`

**3e: `incidents.ts` uses `window.confirm()`**
- `src/pages/incidents.ts` line 331: Replace `window.confirm()` with the same modal-based confirmation pattern used by `inventory.ts:confirmDelete()` and `vendors.ts:confirmDeleteVendor()`.

**Acceptance criteria:**
- Training titles contain `&` not `&amp;`
- Templates "View Saved" shows most-recent document (not random order)
- `monthsBefore('2025-01-15', 6)` returns `'2024-07-15'` (not an incorrect date)
- Malformed JSON import shows "not valid JSON" toast, not raw error
- Incident delete uses modal confirmation
- Build passes, all tests pass

---

## Milestone 4: Data Model Upgrade

**Files to modify:**
- `src/types/index.ts`:
  - Add `createdAt: string` to `CompanyProfile` interface (line 11, before `updatedAt`)
  - Make `Task.taskType` non-optional (change `taskType?: string` to `taskType: string` at line 60)
- `src/db/index.ts`:
  - Add `version(3)` upgrade with a migration callback that:
    - Sets `createdAt = updatedAt` on any existing `companyProfile` rows missing `createdAt`
    - Sets `taskType = 'manual'` on any existing `tasks` rows where `taskType` is undefined
  - Schema for v3 same indexes as v2 (no new indexes needed)
- `src/services/taskGenerator.ts`:
  - Remove optional chaining on `taskType` filter (line 164: `.filter(Boolean)` no longer needed)
- `src/pages/dashboard.ts`:
  - Task creation for manual tasks (if any future feature adds them) must include `taskType: 'manual'`

**Schema change:**
```typescript
this.version(3).stores({
  // same indexes as v2
}).upgrade(tx => {
  tx.table('companyProfile').toCollection().modify(p => {
    if (!p.createdAt) p.createdAt = p.updatedAt || new Date().toISOString();
  });
  tx.table('tasks').toCollection().modify(t => {
    if (!t.taskType) t.taskType = 'manual';
  });
});
```

**Acceptance criteria:**
- TypeScript compiles with `taskType: string` (not optional)
- Existing v2 databases upgrade cleanly to v3
- Build passes

---

## Milestone 5: Task Engine Hardening

**Files to modify:**
- `src/services/taskGenerator.ts`:
  - Remove non-null assertion `system.id!` at line 162. Add guard: `if (system.id === undefined) return 0;`
  - Use compound index query instead of full-table scan: replace `db.tasks.where('relatedSystemId').equals(systemId).toArray()` with `db.tasks.where('[relatedSystemId+taskType]').between([systemId, Dexie.minKey], [systemId, Dexie.maxKey]).toArray()` for efficient dedup lookup
  - Add `owner` field to generated tasks (default empty string `''`)
- `src/tests/smoke.test.ts`:
  - Add test for `monthsBefore()` edge case (export the function for testing, or test indirectly through task template dates)

**Acceptance criteria:**
- No non-null assertions (`!`) on `system.id`
- Build passes, new tests pass

---

## Milestone 6: Template Engine Upgrade

**Files to modify:**
- `src/services/templateGen.ts`:
  - Add 2 new templates:
    1. `data-processing-record` - "Record of AI Processing Activities" - includes system inventory table, data categories per system, lawful basis placeholder, GDPR Art. 30 reference
    2. `risk-assessment-template` - "AI Risk Assessment Report" - one section per registered system with risk category, reasoning, recommended actions, completeness score
  - Both use `escapeMarkdown()` for user data
- `src/pages/templates.ts`:
  - No changes needed (templates auto-populate from `TEMPLATES` array)

**Acceptance criteria:**
- 8 templates total (6 existing + 2 new)
- New templates include real inventory data
- Build passes

---

## Milestone 7: Timeline Widget Enhancements

**Files to modify:**
- `src/pages/dashboard.ts`:
  - Add a progress indicator showing how many of the 4 milestones have passed
  - Add `aria-label` attributes to timeline status badges for accessibility
  - Sources modal: add link text "View full text on EUR-Lex" pointing to the EUR-Lex URL (already in the modal but as plain text)

**Acceptance criteria:**
- Progress indicator shows e.g. "1 of 4 milestones in effect"
- Badge has aria-label like "2 February 2025 - In effect"
- Build passes

---

## Milestone 8: Testing Strategy

**New tests to add in `src/tests/`:**

**File: `src/tests/escapeHtml.test.ts` (extend)**
- Test `escapeMarkdown()` escapes pipes, brackets, backticks

**File: `src/tests/smoke.test.ts` (extend)**
- Test `monthsBefore()` across year boundary
- Test classifier with all-empty system (completeness = 0%)
- Test classifier with prohibited + incomplete system (confidence = low)

**File: `src/tests/taskGenerator.test.ts` (new)**
- Test the `TASK_TEMPLATES` data structure directly (no mock needed):
  - `TASK_TEMPLATES['minimal-risk']` has 3 entries
  - `TASK_TEMPLATES['high-risk']` has 7 entries
  - `TASK_TEMPLATES['prohibited']` has 2 entries
  - `TASK_TEMPLATES['unknown']` has 0 entries
  - Each template has required fields (taskType, title, description, priority, suggestedDueDate)

**File: `src/tests/templateGen.test.ts` (new)**
- Test each template's `generate()` function produces non-empty output
- Test that templates include company name in output
- Test that templates handle empty systems/vendors arrays

**Target:** 35+ tests (up from 22)

**Acceptance criteria:**
- All tests pass
- Coverage of critical paths: escaping, classification, task generation, template generation

---

## Milestone 9: Code Quality Cleanup

**Files to modify:**
- `src/pages/dashboard.ts`: Extract duplicate sort logic in `init()` and `refreshTaskList()` into a shared `sortTasksByPriority()` helper
- `src/pages/risk.ts`: Extract duplicate `counts` computation (lines 221-234 and 317-329) into helper function
- `src/pages/settings.ts`: Validate DPO email format before save (basic regex check, show toast if invalid)
- All pages: Ensure no stale closures - verify that event handlers referencing arrays (like `allSystems`, `vendors`) are re-attached after data refreshes (already done in most cases, verify `obligations.ts` checkbox handlers)

**Acceptance criteria:**
- No duplicate logic blocks
- DPO email validation on settings page
- Build passes, format:check passes

---

## Execution Order

```
Milestone 1  (Security - unified escapeHtml)
Milestone 2  (Security - markdown escaping)
Milestone 3  (Bug fixes - 5 items)
Milestone 4  (Data model + Dexie v3 migration)
Milestone 5  (Task engine hardening)
Milestone 6  (2 new templates)
Milestone 7  (Timeline widget enhancements)
Milestone 8  (Testing - 13+ new tests)
Milestone 9  (Code quality cleanup)
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
- No UX redesign
- "Not legal advice" disclaimer visible
- EU AI Act timeline references official sources (Regulation (EU) 2024/1689, Art. 113)

---

**Awaiting approval to execute.**
