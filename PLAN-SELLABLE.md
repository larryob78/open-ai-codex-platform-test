# AI Comply — Sellable Product Plan

## Reality Check: What You Already Have

Before building anything new, here's what the audit found **already working**:

| Feature | Your Assumption | Reality |
|---------|----------------|---------|
| Persistence | "Static demo data" | Dexie/IndexedDB — full CRUD, migrations, transactions |
| Tests | "No tests whatsoever" | 6 unit test suites + 3 E2E tests (Vitest + Playwright) |
| Settings page | "No settings page" | Full settings: company profile, theme, data management, danger zone |
| Audit trail | "No audit trail" | Immutable-style audit log with filtering, CSV export |
| PDF export | "Print = PDF export" | Real jsPDF generation with data binding |
| Dark mode | "No dark mode" | Three themes (System/Light/Dark) with localStorage persistence |
| Data validation | "No data validation" | 5 validators with 18 test cases |
| Keyboard nav in modals | "No keyboard support" | Escape close, focus management, focus restore, ARIA |
| Error handling | "No error boundaries" | Global handlers + try-catch everywhere + logging |

**You're not at 2/10. You're at 6/10.** The plan below covers the gap from 6 to 10.

---

## What's Genuinely Missing (Prioritised)

### Phase 1 — Quick Wins (No new deps, no backend)
*Estimated: can be done in this codebase as-is*

#### 1.1 Full CI/CD Pipeline
- **Current:** Deploy-only workflow
- **Target:** Test → Typecheck → Format → Build → Deploy
- **Files:** `.github/workflows/deploy-pages.yml`
- **Risk:** Low
- **Acceptance:** Push to main runs all checks before deploying

#### 1.2 Loading States (Spinners + Skeletons)
- **Current:** Button text changes ("Generating...")
- **Target:** CSS spinner component + skeleton screens on page load
- **Files:** `src/style.css`, `src/components/spinner.ts` (new), update each page's `render()`
- **Risk:** Low — purely visual
- **Acceptance:** Every async operation shows a visual indicator

#### 1.3 First-Run Onboarding Flow
- **Current:** Training modules exist but aren't surfaced to new users
- **Target:** Welcome modal on first visit → company profile setup → guided tour
- **Files:** `src/components/onboarding.ts` (new), `src/main.ts`
- **Risk:** Low
- **Acceptance:** New user (empty DB) sees guided setup before dashboard

#### 1.4 Accessibility Gaps → WCAG 2.1 AA
- **Current:** 70% — ARIA + keyboard nav exists
- **Target:** Full WCAG 2.1 AA
- **Changes needed:**
  - Add skip-to-content link in `index.html`
  - Add `<main>`, `<nav>` landmark elements
  - Tab trapping inside modals (prevent focus escaping)
  - `aria-live` regions for toast notifications
  - Color contrast audit on all themes
  - `alt` text on any icons used as interactive elements
- **Files:** `index.html`, `src/components/modal.ts`, `src/components/toast.ts`, `src/components/nav.ts`, `src/style.css`
- **Risk:** Medium — must test across screen readers
- **Acceptance:** Automated axe-core audit passes in E2E tests

#### 1.5 README + Documentation
- **Current:** Basic README
- **Target:** Proper README with screenshots, setup, architecture, contributing guide
- **Files:** `README.md`
- **Risk:** None
- **Acceptance:** New developer can set up and understand the project in 5 minutes

---

### Phase 2 — Product Features (Still no backend)

#### 2.1 Assessment Version History
- **Current:** Only timestamps, no version tracking
- **Target:** Every time an AI system is updated, save a snapshot
- **Changes:**
  - New DB table: `systemVersions` with `systemId`, `version`, `snapshot` (JSON), `changedBy`, `timestamp`
  - Increment DB version in `db/index.ts`
  - "History" button on inventory detail → modal showing version timeline
  - Diff view between versions
- **Files:** `src/db/index.ts`, `src/types/index.ts`, `src/pages/inventory.ts`
- **Risk:** Medium — DB migration needed
- **Acceptance:** Edit a system → see previous version in history → can restore it

#### 2.2 i18n Ready (English + Irish)
- **Current:** All strings hardcoded in English, locale hardcoded to `en-IE`
- **Target:** Externalize strings, support English and Irish Gaelic as MVP
- **Approach:**
  - Create `src/i18n/` directory with `en.json` and `ga.json`
  - Simple `t('key')` function that reads current locale from localStorage
  - Language picker in Settings page
  - No new dependencies — vanilla TS implementation
- **Files:** `src/i18n/index.ts` (new), `src/i18n/en.json` (new), `src/i18n/ga.json` (new), `src/pages/settings.ts`, all pages
- **Risk:** High — touches every page. Do this carefully, one page at a time.
- **Acceptance:** Switch to Irish in settings → all UI text changes

#### 2.3 Real-Time Form Validation
- **Current:** Validation only on submit
- **Target:** Inline validation as user types (debounced)
- **Files:** `src/utils/validate.ts`, form-heavy pages (`inventory.ts`, `settings.ts`, `incidents.ts`)
- **Risk:** Low
- **Acceptance:** Invalid email shows red border + message before submit

---

### Phase 3 — Backend + Multi-Tenant (Major Architecture Change)

> **DECISION REQUIRED:** Adding a backend fundamentally changes the app from "local-first, no server" to a SaaS product. This is a separate product decision, not just a feature.

#### 3.1 Authentication + User Accounts
- **Options:**
  - **A) Firebase Auth** — fastest, no server to manage
  - **B) Supabase** — open-source, includes DB + auth + storage
  - **C) Custom backend** — full control, most work
- **Scope:** Login/signup, password reset, session management, user roles
- **Risk:** Very high — changes entire data model
- **Prerequisite:** Decision on hosting + backend provider

#### 3.2 Cloud Database + Sync
- **Current:** IndexedDB (browser-only)
- **Target:** Cloud DB that syncs with local IndexedDB
- **Options:**
  - Dexie Cloud (built for exactly this — extends current Dexie setup)
  - Supabase + custom sync
  - Firebase Firestore + offline persistence
- **Risk:** Very high — data migration, conflict resolution, encryption
- **Prerequisite:** Auth must be in place first

#### 3.3 Email Integration
- **Current:** Export files manually
- **Target:** Send compliance reports via email
- **Options:**
  - SendGrid / Resend API (needs backend or serverless function)
  - `mailto:` links with pre-filled body (no backend, but limited)
- **Risk:** Medium — requires API key management
- **Prerequisite:** Backend or serverless functions

#### 3.4 Multi-Tenant Data Isolation
- **Current:** Single user, all data in one IndexedDB
- **Target:** Each organization has isolated data
- **Depends on:** Auth (3.1) + Cloud DB (3.2)
- **Risk:** Very high

---

## Recommended Order of Execution

```
Phase 1 (do now — no blockers):
  1.1  CI/CD Pipeline
  1.2  Loading States
  1.3  First-Run Onboarding
  1.4  Accessibility (WCAG 2.1 AA)
  1.5  README + Docs

Phase 2 (do next — still local-first):
  2.1  Version History
  2.2  i18n (English + Irish)
  2.3  Real-Time Validation

Phase 3 (major decision needed first):
  3.1  Auth
  3.2  Cloud DB
  3.3  Email
  3.4  Multi-Tenant
```

---

## Rollback Strategy

- **Phase 1–2:** All changes are additive. Rollback = revert commits.
- **Phase 3:** DB migration needed. Rollback requires data export before migration + tested restore path. **Always export a full JSON backup before starting Phase 3.**

---

## What "Done" Looks Like

- Phase 1 complete: App is polished, accessible, tested, documented. Suitable for a free/freemium launch.
- Phase 2 complete: App has depth — versioning, i18n, better UX. Suitable for paid product with local-first model.
- Phase 3 complete: Full SaaS with auth, cloud sync, multi-tenant. Suitable for enterprise sales.
