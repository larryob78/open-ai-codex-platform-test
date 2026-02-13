# AI Comply — EU AI Act Compliance Toolkit for Irish SMEs

A local-first web application that helps Irish SMEs navigate EU AI Act compliance. All data stays in your browser — no backend, no accounts, no data leaves your device.

> **Disclaimer:** This tool provides guidance only and does not constitute legal advice. Always consult qualified legal counsel for compliance decisions.

## Features

- **AI Inventory** — Register and manage AI systems with a guided wizard
- **Risk Classification** — Automated rules-based risk assessment (prohibited / high / limited / minimal)
- **Obligations** — Checklist of EU AI Act obligations with article citations per risk category
- **Templates** — Generate compliance documents (AI Policy, Vendor Checklist, Incident Response Plan, SOPs, Transparency Notices)
- **Vendor Management** — Track AI vendors and due diligence status
- **Training** — Three built-in modules: Safe Prompting, Privacy Basics, Human Oversight
- **Incident Reporting** — Log incidents and export PDF reports
- **Exports** — Download ZIP compliance pack (CSVs, JSON, PDFs) or individual exports
- **Dashboard** — Overview of inventory, risk, tasks, and training progress
- **Settings** — Company profile, data management, disclaimers

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Vanilla TypeScript SPA |
| Build | Vite |
| Persistence | IndexedDB via Dexie.js |
| PDF | jsPDF |
| ZIP | JSZip |
| Tests | Vitest |
| Deploy | GitHub Pages (static) |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

The app deploys automatically to GitHub Pages when you push to `main`. The GitHub Actions workflow:

1. Installs dependencies (`npm ci`)
2. Builds the project (`npm run build`)
3. Deploys the `dist/` folder to GitHub Pages

### Manual deployment

```bash
npm run build
# Upload the dist/ folder to any static host
```

## Project Structure

```
src/
  main.ts              # App bootstrap, routing
  router.ts            # Hash-based SPA router
  style.css            # Global styles (mobile-first)
  types/index.ts       # TypeScript interfaces
  db/index.ts          # Dexie database schema
  components/          # Shared UI components (nav, modal, toast)
  services/
    classifier.ts      # Risk classification engine
    templateGen.ts     # Document template generator
    exportService.ts   # CSV, PDF, ZIP export
  pages/               # Page modules (10 routes)
  tests/               # Unit tests
```

## Data Storage

All data is stored locally in your browser using IndexedDB. Tables:

- `companyProfile` — Company details
- `aiSystems` — AI system inventory with risk classifications
- `vendors` — Vendor registry
- `tasks` — Compliance tasks
- `incidents` — Incident reports
- `trainingCompletions` — Training completion log
- `generatedDocs` — Generated compliance documents

Use **Settings > Export JSON** to back up your data. Use **Exports > Download ZIP** for a complete compliance pack.

## Next-Step Enhancements

- Optional backend for multi-user / team access
- Role-based access control (RBAC)
- Real-time collaboration
- Integration with EU AI Act database API
- Automated regulatory update monitoring
- Advanced reporting and analytics
- Multi-language support (Irish / EU languages)

## License

Proprietary. All rights reserved.
