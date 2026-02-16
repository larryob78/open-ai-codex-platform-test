# Phase 1 -- Quick Wins Implementation Plan

**Branch:** `claude/ai-compliance-ui-WG5US`
**Baseline:** Tests passing, build clean, format clean, TypeScript clean
**Goal:** Polish the app into a launchable product (no new deps, no backend)

---

## 1.1 Full CI/CD Pipeline

### Problem
Deploy workflow runs `npm ci` then `npm run build` then deploy -- skips typechecking, formatting, and tests. Broken code can reach production.

### Changes

**File: `.github/workflows/deploy-pages.yml`**
- Add 3 steps **before** the existing Build step:
  1. `npx tsc --noEmit` (Typecheck)
  2. `npm run format:check` (Formatting)
  3. `npm test` (Unit tests)
- Keep existing build + deploy steps unchanged.

**File: `.github/workflows/ci.yml`** (new)
- Triggers on: pull requests targeting `main`
- Steps: checkout, setup node 22 with npm cache, `npm ci`, typecheck, format, test, build
- Purpose: PRs get validated before merge.

### Risks
- None. Additive only. If checks fail, deploy blocks -- that is the desired behaviour.

### Rollback
- Revert the workflow files.

### Acceptance
- Push to `main` runs typecheck + format + test + build before deploying.
- A PR against `main` triggers the CI workflow.

---

## 1.2 Loading States (Spinner + Skeleton Screens)

### Problem
Page transitions show blank content while lazy-loading. Only button text changes ("Generating...") -- no visual spinner.

### Changes

**File: `src/style.css`**
- Add CSS-only spinner using `@keyframes spin` + `.spinner` class.
- Add `.page-loading` container class for centred spinner with "Loading..." text.

**File: `src/router.ts`**
- Before `await loader()`, set `content.innerHTML` to spinner markup.
- After page loads, spinner is replaced by `page.render()` (existing behaviour).

### Risks
- Low. Spinner is replaced as soon as the page renders.

### Rollback
- Revert router.ts changes, remove CSS classes.

### Acceptance
- Navigate between pages -- spinner visible during load.
- Throttle network in DevTools -- spinner clearly visible.

---

## 1.3 First-Run Onboarding Flow

### Problem
New users land on an empty dashboard with no guidance.

### Changes

**File: `src/components/onboarding.ts`** (new)
- Exports `checkAndShowOnboarding(): Promise<void>`
- Checks `db.companyProfile.count()` and `db.aiSystems.count()`
- If both are 0 **and** localStorage key `onboarding-dismissed` is not set:
  - Opens welcome modal via existing `openModal()`
  - Content: welcome heading, brief explanation, two buttons
  - "Get Started" button navigates to `#/settings`
  - "Skip" button closes modal, sets `onboarding-dismissed` in localStorage

**File: `src/main.ts`**
- After `initRouter()`, call `checkAndShowOnboarding()`.

### Risks
- Must not block initial render. Call after bootstrap completes.
- Import adds small code to initial bundle (dynamic import if needed).

### Rollback
- Delete `onboarding.ts`, remove the call from `main.ts`.

### Acceptance
- Clear localStorage + IndexedDB, reload -- welcome modal appears.
- Click "Get Started" -- navigates to Settings page.
- Click "Skip" -- modal closes, does not reappear on reload.
- Existing user (data in DB) -- never sees the modal.

---

## 1.4 Accessibility -- WCAG 2.1 AA Gaps

### Problem
Good foundation (skip-link, ARIA, keyboard nav) but gaps remain: no focus trap in modals, no `<main>` landmark, toast assertiveness for errors, no visible focus outlines.

### Changes

**File: `src/main.ts`**
- Change `<div id="app-content">` to `<main id="app-content">`.

**File: `src/components/modal.ts`**
- Add focus trap: on Tab keydown, cycle through focusable elements inside the modal.
  - Tab on last focusable element wraps to first.
  - Shift+Tab on first wraps to last.
- Attach trap on `openModal()`, remove on `closeModal()`.

**File: `src/components/toast.ts`**
- For `type === 'error'`, set `aria-live="assertive"` on the individual toast element so screen readers announce it immediately.

**File: `src/style.css`**
- Add `:focus-visible` outline styles for buttons, links, inputs, selects, textareas.
- Ensure outlines are visible in both light and dark themes.

**File: `src/components/nav.ts`**
- Add `aria-label="Main navigation"` to the `<nav>` element.

### Risks
- Focus trap must not break mouse users -- trap only activates on keyboard events inside the modal.
- `aria-live="assertive"` only on error toasts, not info/success/warning.

### Rollback
- Revert each file individually.

### Acceptance
- Open modal, press Tab -- focus cycles within modal, never escapes to background.
- Shift+Tab at first element wraps to last.
- Error toast is announced immediately by screen readers.
- Tab through page -- visible outline on focused interactive elements.

---

## 1.5 README + Documentation

### Problem
README is functional but does not help a new user or contributor onboard optimally. Missing architecture overview, contributing section, verification steps.

### Changes

**File: `README.md`**
- Reorganise existing content.
- Add "Architecture" section referencing the structure from CLAUDE.md.
- Add "Verification" section with the 4 commands.
- Add "Contributing" section with branch naming and commit rules.
- Add "Accessibility" section noting WCAG 2.1 AA compliance.

### Risks
- None. Documentation only.

### Rollback
- Revert README.md.

### Acceptance
- New developer can clone, install, run dev, and run all 4 verification commands in 5 minutes.

---

## Execution Order

```
1. 1.1 CI/CD Pipeline        (unblocks quality gates)
2. 1.4 Accessibility          (touches core components first)
3. 1.2 Loading States         (touches router)
4. 1.3 First-Run Onboarding   (depends on improved modal from 1.4)
5. 1.5 README                 (documents final state)
```

## Verification (after each change)

```bash
npx tsc --noEmit
npm run format:check
npm test
npm run build
```

All four must pass before committing.

---

**Awaiting approval to execute.**
