# AI Comply Platform — Bug Fix & Enhancement Plan

## Overview
Address all 20 issues across 3 files: `js/app.js`, `css/styles.css`, and all 4 HTML files (`index.html`, `pages/assessment.html`, `pages/risk.html`, `pages/ai-test-1.html`). Changes are organized into 7 implementation phases to group related work.

---

## Phase 1: Toast Notification System + Button Handlers (Issues #1, #10, #20)

**Files:** `js/app.js`, `css/styles.css`

### 1a. Add a lightweight toast notification system
- Add CSS for `.toast-container` and `.toast` elements (positioned fixed bottom-right)
- Add `showToast(message, type)` function in `app.js` with auto-dismiss after 3s
- Types: `success`, `info`, `warning`, `error`

### 1b. Wire up ALL 13+ dead action buttons with placeholder feedback
Every non-functional button gets a click handler via `initActionButtons()`:

| Button | Page | Behavior |
|--------|------|----------|
| Export PDF (header) | ai-test-1.html | Toast: "PDF export coming soon" |
| Re-run Test (header) | ai-test-1.html | Toast: "Test re-run coming soon" |
| Download PDF | ai-test-1.html | Toast: "PDF download coming soon" |
| Share Report | ai-test-1.html | Toast: "Report sharing coming soon" |
| Re-run Test (footer) | ai-test-1.html | Toast: "Test re-run coming soon" |
| View Details | index.html | Toast: "Detailed breakdown coming soon" |
| View All | index.html | Toast: "Full activity log coming soon" |
| Export | index.html | Toast: "Data export coming soon" |
| Add System | index.html | Toast: "System registration coming soon" |
| 6x View (table) | index.html | Toast: "System detail view coming soon" |
| Classify New System | risk.html | Toast: "Redirecting to assessment..." then navigate to assessment.html |

**Strategy:** Use `data-action` attributes on buttons to map to behavior, with a generic delegated listener. This avoids fragile selectors — we add `data-action="toast"` and `data-toast="message"` attributes to buttons in the HTML files.

### 1c. Wire up Search and Notification buttons (#10)
- Search button: Show toast "Search functionality coming soon"
- Notification bell: Show toast "Notifications panel coming soon"

---

## Phase 2: Dead Sidebar Links — "Coming Soon" Treatment (Issue #2)

**Files:** All 4 HTML files, `css/styles.css`

### Changes:
- Replace `href="#"` on "Documentation", "AI Systems Registry", "Team & Roles", and "Export Reports" links across all 4 pages with `href="#"` + class `sidebar-link--disabled`
- Add a `(Coming Soon)` `<span>` after each link text
- Add CSS: `.sidebar-link--disabled` with `opacity: 0.5; pointer-events: none; cursor: default;` and a small "Coming Soon" pill style
- Fix the breadcrumb `<a href="#">Reports</a>` in `ai-test-1.html` — change to `<span class="text-muted">Reports</span>` (non-clickable)
- Fix the breadcrumb `<a href="#">AI Comply</a>` in `index.html` — change to `<a href="index.html">AI Comply</a>`

---

## Phase 3: Wizard Form Validation + Misleading State Fix (Issues #3, #12, #13)

**Files:** `js/app.js`, `pages/assessment.html`

### 3a. Form validation on "Continue to Obligations" (#3)
- Before advancing from Step 2 to Step 3, validate:
  - Domain select must have a non-empty value
  - All 4 radio groups (`decisions`, `safety`, `biometric`, `interaction`) must have a selection
- If validation fails: show inline error messages below each unfilled field and prevent step advancement
- Add CSS for `.form-error` (red text, `var(--text-xs)`) and `.form-group--error` (red border on inputs)

### 3b. Fix misleading "Step 1 Complete" message (#12)
- Change Step 1 content from "Step 1 Complete — System information has been recorded" to a form with basic system info fields (name, version, description) — OR simply change the message to indicate it's demo/sample data
- For the MVP: change the alert text to: "Step 1 Complete (Demo) — Sample system information pre-loaded for demonstration purposes."
- Step 3 obligations: Add a disclaimer banner at the top: "These are sample compliance statuses for demonstration. In production, statuses would reflect actual assessment results."

### 3c. Make wizard steps clickable to navigate back (#13)
- Add click handlers to `.stepper-step` divs for completed steps
- Add `role="button"`, `tabindex="0"`, `aria-label` to stepper steps
- Only allow clicking steps that are already completed (step number < currentStep)
- Add `cursor: pointer` to completed stepper steps

---

## Phase 4: State Persistence with localStorage (Issue #4)

**Files:** `js/app.js`

### Checklist persistence
- On checkbox change, save state to `localStorage` key `aicomply_checklist` (array of booleans)
- On page load in `initChecklist()`, restore saved state and update UI
- Update the badge count on restore

### Wizard persistence
- Save current wizard step and form values to `localStorage` key `aicomply_wizard`
- On page load, restore step and form selections
- Clear on wizard completion (Step 5)

### Assessment form persistence
- Save domain selection and radio values to `localStorage` key `aicomply_assessment_form`
- Restore on page load

---

## Phase 5: Fix Data Inconsistency (Issue #5)

**Files:** `index.html`

### Problem
The dashboard shows 72% overall compliance, but the breakdown scores average to 66.6%:
- Risk Management: 90%
- Data Governance: 78%
- Transparency: 62%
- Human Oversight: 45%
- Technical Documentation: 58%

### Fix
Use a **weighted average** that correctly yields 72%. Apply weights based on the EU AI Act's emphasis on each area:

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Risk Management | 90% | 25% | 22.5 |
| Data Governance | 78% | 20% | 15.6 |
| Transparency | 62% | 20% | 12.4 |
| Human Oversight | 45% | 20% | 9.0 |
| Technical Documentation | 58% | 15% | 8.7 |
| **Total** | | **100%** | **68.2** |

That doesn't work perfectly either. Better approach — adjust the individual scores to make a simple average of 72%:
- Risk Management: 90% (keep)
- Data Governance: 78% (keep)
- Transparency: 65% (was 62%)
- Human Oversight: 48% (was 45%)
- Technical Documentation: 79% (was 58%)

90+78+65+48+79 = 360 / 5 = 72 ✓

Update the legend items in `index.html` to reflect these corrected values. Also update the SVG donut chart stroke-dashoffset if needed to match (current `stroke-dashoffset="105"` represents 72% of circumference 377, which is correct: 377 * 0.72 = 271.44 shown, offset = 377 - 271.44 ≈ 105.56 ≈ 105. This is already correct).

---

## Phase 6: Mobile Responsiveness & CSS Fixes (Issues #6, #7, #8, #9, #11)

**Files:** `css/styles.css`, `pages/assessment.html`

### 6a. Mobile responsiveness fixes (#6)
Add/update media queries at 375px-480px:
- Stat cards: use single column, allow text to wrap (remove `white-space: nowrap` from stat labels at small sizes)
- Page title: ensure full text visible (reduce `font-size` at 480px)
- Badge text: ensure no truncation (adjust badge padding/font-size)
- Header buttons: keep Export PDF / Re-run Test visible or move to page body
- AI Systems table: ensure `overflow-x: auto` on `.table-wrapper` (already exists in CSS, verify in HTML)
- Report test result cards: stack to single column at small widths

### 6b. Content clipping on Assessment page (#7)
- The issue is that `.page-content` doesn't have enough left padding, or the `.main-content` area overlaps. Debug the assessment page layout
- Likely cause: the stepper or card elements have negative margins or the `.page-content` has `overflow: hidden` cutting content
- Fix: Ensure `.page-content` has proper padding and no overflow clipping. Add `overflow: visible` if needed, and check `box-sizing`

### 6c. Risk pyramid tooltip repositioning (#8)
- Change tooltip positioning: detect if near viewport right edge
- CSS-only approach: at medium widths, position tooltip above/below instead of right. Use `@media (max-width: 1024px)` to change tooltip to bottom-positioned
- Keep the existing `display: none !important` on mobile (768px)

### 6d. Hamburger menu improvements (#9)
- Hide hamburger on desktop (add `display: none` to `#menuToggle` above 768px)
- On mobile, add an overlay div that appears when sidebar is open — clicking it closes the sidebar
- Add a close button (X) inside the sidebar header for mobile
- Add `aria-label="Toggle navigation"` and `aria-expanded` attribute

### 6e. Dashboard table overflow (#11)
- The `.table-wrapper` already has `overflow-x: auto` in CSS. Verify it's applied in HTML — it is. The issue may be that the parent card constrains it. Ensure the card doesn't have `overflow: hidden`. Add `min-width: 0` to the card to prevent grid blowout.

---

## Phase 7: Accessibility & Meta (Issues #14, #15, #16, #17, #18, #19)

### 7a. Favicon and meta description (#14)
- Add a simple inline SVG favicon using a data URI in all 4 HTML `<head>` sections
- Add `<meta name="description" content="AI Comply — EU AI Act compliance management platform for SMEs. Monitor compliance, classify risk, and generate audit-ready reports.">` to all pages

### 7b. Risk Classification tab clicking fix (#15)
- The tabs use `<div class="tab">` elements. They need proper `role="tab"`, `tabindex="0"` attributes
- Ensure click event targets the `.tab` element properly — the current JS uses `querySelectorAll('.tab')` and attaches listeners. The issue may be that the `data-tab` attribute isn't on the right element. Review and fix event delegation if needed
- Add `position: relative; z-index: 1` to `.tab` to ensure clicks register over the border

### 7c. Heading hierarchy (#16)
- In `index.html`, the stat card headings use `<h4>` directly under `<h1>`. Change to use a semantic approach:
  - Stat card labels: change from `<h4>` to `<span class="stat-label">` (these are really labels, not headings)
  - This removes the heading skip without adding unnecessary heading levels

### 7d. Skip navigation link (#17)
- Add `<a href="#main-content" class="skip-link">Skip to main content</a>` as the first child of `<body>` in all 4 HTML files
- Add `id="main-content"` to each page's `<main>` element
- CSS: `.skip-link` is visually hidden until focused (positioned offscreen, brought onscreen with `:focus`)

### 7e. ARIA attributes for risk tabs (#18)
- Add `role="tablist"` to `.tabs` container
- Add `role="tab"`, `aria-selected="true/false"`, `aria-controls="tab-{id}"` to each `.tab`
- Add `role="tabpanel"`, `aria-labelledby` to each `.tab-content`
- Update JS `initTabs()` to toggle `aria-selected` on tab switch

### 7f. Checklist disclaimer (#19)
- Add a small info text below the checklist header: "This checklist tracks your review progress. Check items you have verified — it does not replace formal compliance testing."
- Style with `.text-xs .text-muted`

---

## Summary of Files Modified

| File | Changes |
|------|---------|
| `js/app.js` | Toast system, button handlers, form validation, localStorage persistence, stepper click navigation, tab ARIA updates, sidebar overlay |
| `css/styles.css` | Toast styles, form error styles, disabled sidebar link, skip-link, tooltip responsive positioning, mobile fixes, stepper cursor, overlay |
| `index.html` | Button data-attributes, sidebar disabled links, heading fixes, skip link, favicon, meta desc, score fix, checklist disclaimer, breadcrumb fix |
| `pages/assessment.html` | Form validation markup, stepper ARIA, step 1/3 disclaimers, sidebar disabled links, skip link, favicon, meta desc |
| `pages/risk.html` | Tab ARIA roles, tooltip fixes, sidebar disabled links, Classify New System wiring, skip link, favicon, meta desc |
| `pages/ai-test-1.html` | Button data-attributes, sidebar disabled links, breadcrumb fix, skip link, favicon, meta desc |

## Commit Strategy
One commit per phase (7 commits total), with a clear message per phase. Final push to `claude/ai-compliance-ui-WG5US`.
