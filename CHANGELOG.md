# AI Comply Platform — Development Changelog

All notable changes to the AI Comply EU AI Act compliance platform, in reverse chronological order.

---

## [2026-02-13] Bug Fix Sprint — 5 Critical/High/Medium Bugs

**Commit:** `117887e` — Fix 5 bugs: wizard nav stuck, invisible icons, duplicate CSS, stale data, wrong label

### Bugs Fixed

| # | Severity | Bug | Files |
|---|----------|-----|-------|
| 1 | **CRITICAL** | Assessment wizard Next/Previous buttons disappeared on steps 3–5. Users were permanently trapped with no way to navigate forward or back. | `pages/assessment.html` |
| 2 | **HIGH** | Export page SVG icons invisible — used undefined CSS var `var(--color-primary)` instead of `var(--color-primary-600)`. All 4 export card icons rendered with no stroke color. | `pages/export.html` |
| 3 | **MEDIUM** | Duplicate CSS modal definitions — two conflicting rule sets for `.modal-overlay`, `.modal`, `.modal-header`, `.modal-close`, `.modal-body`, `.modal-footer` with different `z-index` (200 vs 1000) and spacing values. | `css/styles.css` |
| 4 | **MEDIUM** | Risk page "Your AI Systems by Risk Level" section was entirely hardcoded HTML. System names, counts, and compliance percentages did not update when data changed via other pages. | `pages/risk.html`, `js/app.js` |
| 5 | **LOW** | Team page "Departments" stat card label was misleading — it actually counted unique permission levels (Admin/Editor/Viewer), not departments. | `pages/team.html` |

### Technical Details

- **Wizard fix:** Moved `#prevStep` and `#nextStep` buttons from inside `#step-2` (a `.tab-content` panel that gets `display: none`) to a standalone `<div>` after all step panels, so they remain visible regardless of which step is active.
- **Export icons fix:** Replaced all 4 instances of `stroke="var(--color-primary)"` with `stroke="var(--color-primary-600)"` which is defined in the `:root` CSS custom properties.
- **Duplicate CSS fix:** Removed the first set of modal rules (lines 926–976) and kept the second, more complete set (lines 1136–1195 in the "Modal System" section).
- **Risk page fix:** Added `initRiskPageSystems()` function in `app.js` that reads from `AIComplyData.getSystems()`, groups by `riskLevel`, and renders dynamically. Replaced 70+ lines of hardcoded HTML with a `<div id="riskSystemsGrid">` container.
- **Team label fix:** Changed `<div class="text-sm text-muted">Departments</div>` to `Permission Levels`.

---

## [2026-02-12] Full Dynamic Data Layer

**Commit:** `3c8e830` — Make entire AI Comply platform fully functional with dynamic data layer

### What Changed

- Created `js/data.js` — a shared client-side data store using `localStorage` with an IIFE module (`AIComplyData`) exposing a full CRUD API for:
  - AI Systems (add, update, delete, get, getAll)
  - Activity feed (auto-logged on actions)
  - Notifications (add, mark read, mark all read, unread count)
  - Team members (add, update, remove)
  - Assessments (add, getAll)
  - Checklist state (get, save)
  - Export history (add, getAll)
  - Wizard state (step + form persistence)
  - Computed stats (averages, counts, compliance scores)
- Created `js/app.js` — main application logic with:
  - Toast notification system
  - Full modal system (open, close, Escape key, overlay click)
  - Delegated action button handler (`data-action` attributes)
  - Sidebar mobile toggle with overlay
  - Tab switching with ARIA attributes
  - Notification badge (unread count)
  - Dashboard dynamic rendering (stats, scores, activity, systems table)
  - System CRUD modals (Add, View, Edit, Delete)
  - Score breakdown modal
  - Activity log modal
  - Global search modal (systems + pages)
  - Notifications modal
  - Assessment wizard (5-step with validation, state persistence, dynamic population)
  - Checklist with localStorage persistence
  - Risk classifier (domain-based risk level determination)
  - Report page (PDF export via print, share modal, re-run test simulation)
  - CSV export (systems, team, assessments, activity)
  - Team page (table rendering, add/edit/remove members)
  - Systems registry page (filter by risk level, search by name)
  - Export page (history table)
  - Documentation page (search/filter)

### New Pages Added

| Page | Path | Purpose |
|------|------|---------|
| AI Systems Registry | `pages/systems.html` | Full CRUD management of registered AI systems with filter/search |
| Team & Roles | `pages/team.html` | Team member management with roles, permissions, stats |
| Export Reports | `pages/export.html` | CSV export for systems, team, assessments, activity + export history |
| Documentation | `pages/documentation.html` | EU AI Act reference articles, FAQ, resources with search |

---

## [2026-02-12] UI/UX Enhancement Plan

**Commit:** `841802c` — Add implementation plan for 20 UI/UX issue fixes

- Created `plan.md` documenting 20 identified UI/UX issues grouped into 7 implementation phases
- Covered: toast system, mobile responsiveness, accessibility (ARIA), form validation, stepper interactivity, action button wiring, and more

---

## [2026-02-12] 20 UI/UX Issue Fixes

**Commit:** `7711bff` — Fix 20 UI/UX issues across AI Comply platform

### Issues Fixed

1. Toast notification system added (all buttons now give feedback)
2. All 13+ dead action buttons wired up
3. Mobile sidebar toggle with overlay
4. Skip navigation link for accessibility
5. ARIA attributes on tabs
6. Form validation with error states on assessment wizard
7. Stepper steps made clickable (completed steps)
8. Keyboard navigation on stepper (Enter/Space)
9. Assessment wizard Previous button visibility logic
10. Notification dot visibility tied to unread count
11. Risk result box dynamic updates on domain change
12. Print styles (`@media print`)
13. Responsive breakpoints (768px, 480px, 1024px)
14. Risk tooltip repositioning on narrow screens
15. `.tab-content` display toggle CSS
16. Empty state styles
17. Form error styles (`.form-group--error`, `.radio-group--error`)
18. Sidebar overlay for mobile
19. Modal overlay with backdrop filter
20. Spin animation for loading states

---

## [2026-02-12] Platform Summary Document

**Commit:** `a1dd858` — Add AI Comply platform summary and roadmap document

- Created `AI-Comply-Summary.html` — a standalone overview page covering platform capabilities, architecture, and future roadmap

---

## [2026-02-12] AI Test 1 — Badge/Count Fixes

**Commit:** `cfd7a0f` — Fix test count and badge mismatches in AI Test 1 report

- Fixed inconsistencies between reported test counts and actual test items in the AI Test 1 compliance report

---

## [2026-02-12] AI Test 1 — Sidebar Navigation

**Commit:** `1a02165` — Add AI Test 1 link to assessment and risk page sidebars

- Added "AI Test 1" navigation link to sidebar on `assessment.html` and `risk.html` so it's accessible from all pages

---

## [2026-02-11] AI Test 1 Compliance Report

**Commit:** `6a7ab6d` — Add AI Test 1 compliance report page

- Created `pages/ai-test-1.html` — a detailed compliance test report for the HR Screening Tool v2.1 covering:
  - Risk Management (Art. 9) — 5/5 passed
  - Data Governance (Art. 10) — 4/4 passed
  - Transparency (Art. 13) — 3/5 (2 warnings)
  - Human Oversight (Art. 14) — 3/5 (2 failures)
  - Accuracy & Robustness (Art. 15) — 3/5 (1 failure, 1 warning)
  - Record-Keeping (Art. 11-12) — 5/5 passed
  - Summary: 23/29 passed, 3 failed, 3 warnings

---

## [2026-02-11] GitHub Pages Deployment

**Commit:** `a31a6e1` — Add GitHub Pages deployment workflow

- Created `.github/workflows/deploy-pages.yml` — deploys on push to `main` using `actions/deploy-pages@v4`

---

## [2026-02-11] Initial Platform Build

**Commit:** `3c4655a` — Add EU AI Act compliance platform UI for SMEs

### Core Platform Created

- `index.html` — Main dashboard with:
  - KPI stat cards (compliance %, open findings, AI systems, high-risk count)
  - Compliance score ring chart with category breakdown
  - Recent activity feed
  - Registered AI systems table
  - EU AI Act compliance checklist (12 items)
  - Key regulatory deadlines timeline
- `pages/assessment.html` — 5-step compliance assessment wizard
- `pages/risk.html` — EU AI Act risk pyramid with tabbed breakdown (Unacceptable, High, Limited, Minimal)
- `css/styles.css` — Complete design system with:
  - CSS custom properties (colors, typography, spacing, shadows, transitions)
  - App shell layout (sidebar + main content)
  - Component library (cards, tables, badges, buttons, forms, alerts, progress bars, etc.)
  - Responsive breakpoints (1024px, 768px, 480px)

### Architecture

- **No build step** — pure HTML/CSS/JS, opens directly in browser
- **No external dependencies** — only Google Fonts (Inter)
- **Client-side data** — `localStorage` for persistence
- **6 seed AI systems** with realistic compliance data

---

## [2025-10-24] Repository Created

**Commit:** `f969be9` — Initial commit

- Repository initialized with `README.md`

---

## File Inventory (Current State)

| File | Lines | Purpose |
|------|-------|---------|
| `index.html` | 477 | Dashboard |
| `pages/assessment.html` | 315 | Assessment wizard |
| `pages/risk.html` | 290 | Risk classification guide |
| `pages/ai-test-1.html` | 640 | AI Test 1 report |
| `pages/systems.html` | 112 | AI Systems Registry |
| `pages/team.html` | 116 | Team & Roles |
| `pages/export.html` | 142 | Export Reports |
| `pages/documentation.html` | 241 | Documentation hub |
| `css/styles.css` | 1248 | Design system |
| `js/app.js` | 1283 | Application logic |
| `js/data.js` | 398 | Data layer |
| `AI-Comply-Summary.html` | 713 | Platform summary |
| `plan.md` | 215 | Enhancement plan |
| `.github/workflows/deploy-pages.yml` | 34 | CI/CD |
| **Total** | **~6,216** | |
