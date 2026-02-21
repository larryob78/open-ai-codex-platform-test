# AI Comply — EU AI Act Compliance Platform

## Project Overview
Static web application for SME compliance management with the EU AI Act. No build step, no backend — pure HTML5, CSS3, and vanilla JavaScript (ES5-compatible).

## Tech Stack
- **Markup:** HTML5 (semantic elements)
- **Styling:** CSS3 with custom properties (`css/styles.css`)
- **Logic:** Vanilla JavaScript via two modules:
  - `js/data.js` — data layer using `localStorage` (IIFE: `AIComplyData`)
  - `js/app.js` — UI logic, modals, page init
- **Fonts:** Google Fonts (Inter)
- **Deployment:** GitHub Pages via `.github/workflows/deploy-pages.yml`

## Structure
```
index.html              — Main dashboard
pages/*.html            — Secondary pages
js/data.js              — Data layer (localStorage CRUD)
js/app.js               — Application logic
css/styles.css          — Complete design system
```

## How to Test
Open any HTML file in a browser. No build or install step needed.

## Conventions
- All JavaScript uses ES5 (no arrow functions, no `let`/`const`, no template literals)
- IIFE module pattern for `AIComplyData`; plain functions for `app.js`
- All pages share the same sidebar, top bar, and script includes
- Use `escapeHTML()` / `escapeAttr()` for user-provided strings in HTML
- Data persistence via `localStorage` with `AIComplyData` API
- CSS uses custom properties defined in `:root`
