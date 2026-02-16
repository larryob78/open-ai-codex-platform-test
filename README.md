# AI Comply - EU AI Act Compliance Toolkit for Irish SMEs

A local-first web application that helps Irish SMEs navigate EU AI Act compliance. All data stays in your browser -- no backend, no accounts, no data leaves your device.

> **Disclaimer:** This tool provides guidance only and does not constitute legal advice. Always consult qualified legal counsel for compliance decisions.

## Quick Start

```bash
git clone https://github.com/larryob78/open-ai-codex-platform-test.git
cd open-ai-codex-platform-test
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. On first visit you will see a welcome modal guiding you through setup.

## Features

- **AI Inventory** -- Register and manage AI systems with a guided wizard
- **Risk Classification** -- Automated rules-based risk assessment (prohibited / high / limited / minimal) with completeness scoring
- **Auto-generated Tasks** -- Compliance tasks created automatically based on risk classification
- **EU AI Act Timeline** -- Dashboard countdown widget showing key compliance dates with article citations
- **Obligations** -- Checklist of EU AI Act obligations per risk category
- **Templates** -- Generate inventory-aware compliance documents (AI Policy, Vendor Checklist, Incident Response Plan, SOPs, Transparency Notices)
- **Vendor Management** -- Track AI vendors and due diligence status
- **Training** -- Built-in modules: Safe Prompting, Privacy Basics, Human Oversight
- **Incident Reporting** -- Log incidents and export PDF reports
- **Exports** -- Download ZIP compliance pack (CSVs, JSON, PDFs, generated docs)
- **Audit Log** -- Immutable record of all create/update/delete operations with filtering and CSV export
- **Dark Mode** -- Three themes: System, Light, Dark
- **Accessibility** -- WCAG 2.1 AA: skip link, focus trap in modals, ARIA landmarks, visible focus outlines
- **First-Run Onboarding** -- Welcome modal guides new users through company profile setup

## Tech Stack

| Layer        | Technology                     |
| ------------ | ------------------------------ |
| Language     | TypeScript (strict mode)       |
| Bundler      | Vite 5                         |
| Persistence  | IndexedDB via Dexie.js         |
| PDF          | jsPDF                          |
| ZIP          | JSZip                          |
| Tests        | Vitest (unit), Playwright (e2e)|
| Formatting   | Prettier                       |
| Deploy       | GitHub Pages via Actions       |

## Architecture

```
src/
  main.ts              # App bootstrap, routing, onboarding
  router.ts            # Hash-based SPA router with loading states
  style.css            # Global styles (mobile-first, dark mode)
  db/index.ts          # Dexie database schema, helpers, import/export
  types/index.ts       # TypeScript interfaces and constants

  components/          # Reusable UI
    modal.ts           # Modal dialog with focus trap
    nav.ts             # Sidebar navigation
    toast.ts           # Toast notifications (aria-live)
    onboarding.ts      # First-run welcome flow

  pages/               # Each page exports render() + init()
    dashboard.ts       # Overview stats and charts
    inventory.ts       # AI system registry (CRUD)
    risk.ts            # Risk classification engine
    obligations.ts     # EU AI Act obligation checklists
    tasks.ts           # Compliance task management (kanban)
    incidents.ts       # Incident reporting
    vendors.ts         # Third-party vendor management
    training.ts        # Staff training tracker
    templates.ts       # Document template generator
    exports.ts         # PDF/ZIP/JSON export
    audit.ts           # Audit log viewer
    settings.ts        # Company profile, theme, data management

  services/            # Business logic (no DOM access)
    classifier.ts      # EU AI Act risk classifier
    exportService.ts   # PDF/ZIP generation
    taskGenerator.ts   # Auto-generates tasks from systems
    templateGen.ts     # Generates compliance documents

  utils/               # Pure helper functions
    escapeHtml.ts      # XSS prevention
    logger.ts          # Structured logging
    validate.ts        # Input validation

  tests/               # Unit tests (Vitest)
```

## Data Storage

All data is stored locally in your browser using IndexedDB. Tables:

- `companyProfile` -- Company details
- `aiSystems` -- AI system inventory with risk classifications
- `vendors` -- Vendor registry
- `tasks` -- Compliance tasks (with taskType for deduplication)
- `incidents` -- Incident reports
- `trainingCompletions` -- Training completion log
- `generatedDocs` -- Generated compliance documents
- `obligationChecks` -- Obligation checklist state
- `auditLog` -- Immutable audit trail

Use **Settings > Export JSON** to back up your data. Use **Exports > Download ZIP** for a complete compliance pack.

## Verification

Run these after every change:

```bash
npx tsc --noEmit        # TypeScript type checking
npm run format:check    # Prettier formatting
npm test                # Unit tests (Vitest)
npm run build           # Production build (Vite)
```

All four must pass before committing. CI enforces these checks on every PR and deploy.

## Scripts

```bash
npm run dev             # Start development server
npm run build           # Production build
npm run preview         # Preview production build
npm test                # Run unit tests
npm run test:e2e        # Run Playwright e2e tests
npm run format          # Format code with Prettier
npm run format:check    # Check formatting
```

## Deployment

The app deploys automatically to GitHub Pages when you push to `main`. The GitHub Actions workflow:

1. Installs dependencies (`npm ci`)
2. Runs typecheck, format check, and unit tests
3. Builds the project (`npm run build`)
4. Deploys the `dist/` folder to GitHub Pages

### Manual deployment

```bash
npm run build
# Upload the dist/ folder to any static host
```

## Contributing

1. Create a feature branch from `main`.
2. Make the smallest change that works. No unrelated refactors.
3. Run all four verification commands before committing.
4. One logical change per commit.
5. Open a PR against `main` -- CI will validate automatically.
6. Never force-push. Never push to `main` directly.

### Code Conventions

- All user-provided strings rendered as HTML must use `escapeHtml()`.
- All DB access goes through `src/db/index.ts` -- never import Dexie directly in pages.
- Every create/update/delete must call `addAuditEntry()`.
- Every page must export `render(): string` and `init(): Promise<void>`.
- Path alias: `@/` maps to `src/`.

## EU AI Act Timeline

| Date         | What Applies                                               | Reference              |
| ------------ | ---------------------------------------------------------- | ---------------------- |
| 2 Feb 2025   | Prohibited practices and AI literacy obligations           | Art. 5, Art. 4         |
| 2 Aug 2025   | Governance and GPAI model obligations                      | Title V, Chapter 1     |
| 2 Aug 2026   | Main obligations (high-risk Annex III, transparency)       | Art. 6(2), Annex III   |
| 2 Aug 2027   | Extended transition for Annex I product legislation        | Art. 6(1), Annex I     |

Source: Regulation (EU) 2024/1689, Article 113.

## Accessibility

AI Comply targets WCAG 2.1 AA compliance:

- Skip-to-content link for keyboard users
- ARIA landmarks (`<nav>`, `<main>`)
- Focus trap inside modals (Tab cycles within modal)
- Focus restored to trigger element on modal close
- `aria-live` regions for toast notifications (assertive for errors)
- Visible focus outlines (`:focus-visible`) on all interactive elements
- Keyboard-accessible accordions (Enter/Space)

## License

Proprietary. All rights reserved.
