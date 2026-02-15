# Boris Mode — Claude Code Operating System

## Project: AI Comply v2.0.0

EU AI Act compliance toolkit for Irish SMEs. Local-first SPA — no backend, no API keys, no server. All data lives in the browser via IndexedDB (Dexie). Deployed to GitHub Pages.

**Live URL:** https://larryob78.github.io/open-ai-codex-platform-test/

---

## Default Workflow

1. **Plan Mode** — Start here. Do not write code yet.
2. **Produce a plan** containing:
   - Steps (numbered, small)
   - Files to create or change
   - Commands to run
   - Risks and how to mitigate them
   - Rollback strategy
   - Acceptance tests (what "done" looks like)
3. **Iterate** — Revise the plan until the user approves it.
4. **Implement** — Execute the approved plan exactly. No extras.
5. **Verify** — Run all verification commands. Fix failures. Rerun until green.
6. **Learn** — When a mistake repeats, add a rule to "Common Mistakes" below.

---

## Hard Constraints

- Make the **smallest change that works**. Nothing more.
- No unrelated refactors, renames, or "while I'm here" changes.
- No new dependencies without explicit approval.
- Do not claim tests pass unless you actually ran them and saw the output.
- Do not modify files outside the scope of the approved plan.
- If something is unclear, **ask — do not guess**.
- Never touch `legacy/` — it is archived and read-only.
- Never commit `.env`, credentials, or secrets.

---

## Tech Stack

| Layer        | Tech                                     |
| ------------ | ---------------------------------------- |
| Language     | TypeScript (strict mode)                 |
| Bundler      | Vite 5                                   |
| Database     | Dexie (IndexedDB) — local-first, no server |
| Testing      | Vitest (unit), Playwright (e2e)          |
| Formatting   | Prettier                                 |
| Export libs  | jsPDF, JSZip, FileSaver                  |
| Deployment   | GitHub Pages via Actions (push to `main`) |

---

## Architecture

```
src/
  main.ts              # Entry point — bootstraps nav, router, DB
  router.ts            # Hash-based SPA router
  style.css            # All styles (single file)
  db/index.ts          # Dexie DB schema, helpers, import/export
  types/index.ts       # All TypeScript interfaces and constants

  components/          # Reusable UI
    modal.ts           # Modal dialog
    nav.ts             # Sidebar navigation
    toast.ts           # Toast notifications

  pages/               # Each page exports { render(), init() }
    dashboard.ts       # Overview stats and charts
    inventory.ts       # AI system registry (CRUD)
    risk.ts            # Risk classification engine
    obligations.ts     # EU AI Act obligation checklists
    tasks.ts           # Compliance task management
    incidents.ts       # Incident reporting
    vendors.ts         # Third-party vendor management
    training.ts        # Staff training tracker
    templates.ts       # Document template generator
    exports.ts         # PDF/ZIP/JSON export
    audit.ts           # Audit log viewer
    settings.ts        # Company profile, data management

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
    smoke.test.ts      # Page render/init smoke tests
    escapeHtml.test.ts
    logger.test.ts
    taskGenerator.test.ts
    templateGen.test.ts
    validate.test.ts

legacy/                # Old v1 code — DO NOT TOUCH
```

### Key Patterns

- **Pages follow a contract:** every page exports `render(): string` and `init(): Promise<void>` (see `PageModule` interface in `types/index.ts`).
- **Router is hash-based:** navigation uses `#/dashboard`, `#/inventory`, etc.
- **Path alias:** `@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.json`).
- **All DB access** goes through `src/db/index.ts`. Never import Dexie directly in pages.
- **Audit logging:** use `addAuditEntry()` from `db/index.ts` when creating, updating, or deleting records.
- **XSS prevention:** always use `escapeHtml()` when rendering user input into HTML strings.

---

## Verification Commands

Run these **after every change**, in this order:

```bash
# 1. Type checking
npx tsc --noEmit

# 2. Format check
npm run format:check

# 3. Unit tests
npm test

# 4. Build (catches bundler errors)
npm run build
```

All four must pass before committing.

---

## Git Rules

- Branch: develop on `claude/ai-compliance-ui-WG5US`
- One logical change per commit.
- Push with: `git push -u origin claude/ai-compliance-ui-WG5US`
- To deploy: merge into `main` via PR — GitHub Actions builds and deploys automatically.
- Never force-push. Never push to `main` directly.

---

## DB Schema (Dexie v5)

| Table                | Indexed Fields                                           |
| -------------------- | -------------------------------------------------------- |
| companyProfile       | `++id`                                                   |
| aiSystems            | `++id, name, riskCategory, status`                       |
| vendors              | `++id, name, dueDiligenceStatus`                         |
| tasks                | `++id, status, priority, relatedSystemId, taskType, [relatedSystemId+taskType]` |
| incidents            | `++id, status, severity, relatedSystemId`                |
| trainingCompletions  | `++id, moduleId, userName`                               |
| generatedDocs        | `++id, templateType`                                     |
| obligationChecks     | `++id, [category+obligationIndex]`                       |
| auditLog             | `++id, action, entity, timestamp`                        |

When adding new tables or indexes, **increment the DB version number** in `db/index.ts`.

---

## Common Mistakes

- **Changing code outside the plan scope.** Stick to what was approved.
- **Skipping verification.** Always run typecheck, format, test, and build after changes.
- **Adding imports or deps that weren't discussed.** Ask first.
- **Assuming a test passes without running it.** Run it. Paste the output.
- **Fixing lint errors by deleting code.** Fix the actual issue.
- **Making multiple unrelated changes in one commit.** One logical change per commit.
- **Forgetting escapeHtml().** All user-provided strings rendered as HTML must be escaped.
- **Direct Dexie imports in pages.** Always go through `db/index.ts`.
- **Touching legacy/.** That folder is archived. Leave it alone.
- **Forgetting audit logging.** Every create/update/delete should call `addAuditEntry()`.
- **Breaking the PageModule contract.** Every page must export `render()` and `init()`.
