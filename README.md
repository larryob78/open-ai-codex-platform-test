# AI Comply - EU AI Act Compliance Toolkit for Irish SMEs

A local-first web application that helps Irish SMEs navigate EU AI Act compliance. All data stays in your browser - no backend, no accounts, no data leaves your device.

> **Disclaimer:** This tool provides guidance only and does not constitute legal advice. Always consult qualified legal counsel for compliance decisions.

## Features

- **AI Inventory** - Register and manage AI systems with a guided wizard
- **Risk Classification** - Automated rules-based risk assessment (prohibited / high / limited / minimal) with completeness scoring
- **Completeness Scoring** - Each system gets a data completeness score; classifier confidence is adjusted downward when data is incomplete
- **Auto-generated Tasks** - Compliance tasks are automatically created based on risk classification (e.g. risk management, transparency notices, documentation)
- **EU AI Act Timeline** - Dashboard countdown widget showing key compliance dates (2 Feb 2025, 2 Aug 2025, 2 Aug 2026, 2 Aug 2027) with Sources modal citing Regulation (EU) 2024/1689
- **Obligations** - Checklist of EU AI Act obligations with article citations per risk category
- **Templates** - Generate inventory-aware compliance documents (AI Policy, Vendor Checklist, Incident Response Plan, SOPs, Transparency Notices) that pull real system, vendor, and company data
- **Vendor Management** - Track AI vendors and due diligence status
- **Training** - Three built-in modules: Safe Prompting, Privacy Basics, Human Oversight
- **Incident Reporting** - Log incidents and export PDF reports
- **Exports** - Download ZIP compliance pack (CSVs, JSON, PDFs, generated docs) or individual exports
- **Dashboard** - Overview of inventory, risk, EU timeline, tasks with inline editing, and training progress
- **Settings** - Company profile, data management, disclaimers
- **XSS Protection** - All user-controlled values are escaped before rendering into HTML
- **Prettier Formatting** - Consistent code style enforced via Prettier

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Vanilla TypeScript SPA |
| Build | Vite |
| Persistence | IndexedDB via Dexie.js |
| PDF | jsPDF |
| ZIP | JSZip |
| Tests | Vitest |
| Formatting | Prettier |
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

# Format code
npm run format

# Check formatting
npm run format:check
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
  db/index.ts          # Dexie database schema (v2)
  utils/
    escapeHtml.ts      # Shared XSS-safe HTML escaping utility
  components/          # Shared UI components (nav, modal, toast)
  services/
    classifier.ts      # Risk classification engine with completeness scoring
    taskGenerator.ts   # Auto-generates compliance tasks by risk category
    templateGen.ts     # Inventory-aware document template generator
    exportService.ts   # CSV, PDF, ZIP export
  pages/               # Page modules (10 routes)
  tests/               # Unit tests (escapeHtml, classifier, completeness)
```

## Data Storage

All data is stored locally in your browser using IndexedDB. Tables:

- `companyProfile` - Company details
- `aiSystems` - AI system inventory with risk classifications
- `vendors` - Vendor registry
- `tasks` - Compliance tasks (with taskType for deduplication, owner, due date)
- `incidents` - Incident reports
- `trainingCompletions` - Training completion log
- `generatedDocs` - Generated compliance documents

Use **Settings > Export JSON** to back up your data. Use **Exports > Download ZIP** for a complete compliance pack.

## EU AI Act Timeline

The dashboard includes a compliance timeline widget with countdown to key dates:

| Date | What Applies | Reference |
|------|-------------|-----------|
| 2 Feb 2025 | Prohibited practices and AI literacy obligations | Art. 5, Art. 4 |
| 2 Aug 2025 | Governance and GPAI model obligations | Title V, Chapter 1 |
| 2 Aug 2026 | Main obligations (high-risk Annex III, transparency) | Art. 6(2), Annex III, Art. 50 |
| 2 Aug 2027 | Extended transition for Annex I product legislation | Art. 6(1), Annex I |

Source: Regulation (EU) 2024/1689, Article 113.

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
