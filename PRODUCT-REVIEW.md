# AI Comply Platform — Full Review & Recommendations

**Review Date:** 13 February 2026
**Reviewer:** Claude AI (Product & Technical Review)
**Repository:** `open-ai-codex-platform-test`
**Branch:** `claude/ai-compliance-ui-WG5US`

---

## Table of Contents

1. [Scenario Used](#scenario-used)
2. [Section-by-Section Scoring](#section-by-section-scoring)
3. [Overall Platform Score](#overall-platform-score)
4. [CTO Recommendations (Technical & Architecture)](#cto-recommendations-technical--architecture)
5. [Product Manager Recommendations (UX, Market Fit & Growth)](#product-manager-recommendations-ux-market-fit--growth)
6. [Priority Roadmap Suggestion](#priority-roadmap-suggestion)

---

## Scenario Used

An Irish SME in financial services deploying an AI-powered customer support chatbot. The chatbot handles tier-1 queries, FAQs, and escalates to human agents. It processes customer PII (names, emails), serves ~2,000 MAU, and is hosted on AWS eu-west-1 (Ireland). The system was correctly classified as **Limited Risk** with **Art. 50 transparency obligations**.

---

## Section-by-Section Scoring

### 1. Dashboard — Score: 8/10

**Strengths:**
- The KPI cards (75% compliance, 11 open findings, 6 AI systems, 2 high-risk) give an immediate snapshot
- The compliance score breakdown by category (Risk Management 88%, Data Governance 81%, Transparency 71%, Human Oversight 63%, Technical Documentation 74%) is genuinely useful
- The activity feed showing the assessment I just completed felt live and responsive
- The regulatory deadlines section (Aug 2026 for high-risk, Aug 2027 for existing systems) is a standout feature — Irish SMEs constantly worry about these dates
- The compliance checklist (8/12 complete) with article references is practical

**Weaknesses:**
- The donut chart showing 75/100 isn't actionable — users need to know what to fix to get from 75 to 100
- The registered AI systems table duplicates what's on the Registry page
- No filtering or date-range controls on the activity feed

---

### 2. Compliance Assessment Wizard — Score: 7/10

**Strengths:**
- The 5-step wizard is the right approach for SMEs who aren't compliance experts
- The stepper progress bar with green checkmarks is clear
- Step 2's dynamic classification (it correctly identified my chatbot as Limited Risk with Art. 50 obligations based on my answers) is the core value proposition and works well
- The review summary in Step 5 is clean and clearly lays out all answers before submission
- The yellow warning box explaining what submission does is good trust-building UX

**Weaknesses:**
- Step 1 is hardcoded as "Demo complete" — you can't actually enter system information, which is the most critical step
- Step 3 only showed one obligation dropdown for Limited Risk, which feels thin
- Step 4's documentation checklist is a simple tick-box exercise with no ability to actually upload or link documents
- There's no save-as-draft functionality, and no way to go back and edit a submitted assessment
- The "Partially — human reviews output" option I selected is a very common Irish SME pattern, but there's no guidance on what "partially" means under the Act

---

### 3. Risk Classification — Score: 8.5/10

**Strengths:**
- The risk pyramid visualisation is immediately understandable, even for non-technical compliance officers
- The tabbed breakdown (Unacceptable, High Risk, Limited, Minimal) with specific banned practices and article references is excellent educational content
- The "Your AI Systems by Risk Level" section at the bottom with colour-coded cards and compliance progress bars is one of the best features on the platform
- The fine amounts (EUR 35M / 7% for prohibited practices) create urgency

**Weaknesses:**
- The pyramid doesn't link to specific articles for hover/click detail
- The risk tabs don't show which of your systems fall into each category inline
- No interactive "check if my use case is banned" tool — just static descriptions

---

### 4. Documentation — Score: 7.5/10

**Strengths:**
- Comprehensive article-by-article reference covering Art. 5 through Art. 51, each with risk-level badges
- The FAQ section at the bottom is well-written and covers the questions Irish SMEs actually ask (when does it take effect, who needs to comply, what are the penalties, does it apply outside the EU)
- The mention of proportionate caps for SMEs in the penalties FAQ is particularly relevant
- Search bar at the top

**Weaknesses:**
- The documentation is entirely static reference material — there's no way to link articles to your specific systems
- No templates or downloadable checklists
- No links to the official EU AI Act text
- The search bar doesn't appear to filter dynamically
- Missing Ireland-specific guidance (e.g., the role of the Irish DPC, national AI coordination)

---

### 5. AI Systems Registry — Score: 7/10

**Strengths:**
- Clean table layout with the right columns (system name, risk level, purpose, status, compliance %, last reviewed)
- The colour-coded risk badges and status indicators work well
- Search and risk-level filter dropdown
- Version numbers visible (e.g., v2.1, v3.0)
- View/Edit actions per system
- "+Add System" button is prominent

**Weaknesses:**
- No bulk actions
- No way to archive or deprecate systems
- No sorting on columns
- The "View" and "Edit" links don't go anywhere functional (static demo)
- No integration with the assessment wizard — completing an assessment doesn't automatically register the system
- Missing fields like system owner, department, data categories processed, third-party provider, and deployment date
- No pagination for when the registry grows

---

### 6. Team & Roles — Score: 6.5/10

**Strengths:**
- Clear table with names, roles, permissions (Admin/Editor/Viewer), and last active dates
- The role titles map well to EU AI Act concepts (Compliance Officer, Data Protection Officer, ML Operations Lead)
- Edit and Remove actions per member

**Weaknesses:**
- This is the thinnest page on the platform
- No role-based access control explanation — what can Editors do vs. Viewers?
- No ability to assign team members to specific AI systems (crucial for accountability under Art. 14/26)
- No audit log for who changed what
- No invitation workflow
- The "Add Member" button is there but the permission model isn't documented
- Missing the concept of a "deployer representative" which is key under the Act
- For Irish SMEs, where one person often wears multiple hats, the rigid role structure doesn't reflect reality

---

### 7. AI Test 1 (Compliance Testing) — Score: 9/10

**Strengths:**
- This is the strongest page on the platform
- The test report structure — 29 tests across 6 articles, each with Pass/Warning/Fail status and specific descriptions — is exactly what a CTO wants to see
- The article-by-article grouping (Art. 9 Risk Management 5/5, Art. 10 Data Governance 4/4, Art. 11-12 Documentation & Logging 5/5, Art. 13 Transparency 3/5, Art. 14 Human Oversight 3/5, Art. 15 Accuracy & Robustness 3/5) gives precise visibility into gaps
- The "Findings & Recommended Remediation" section with 3 critical items, each with finding ID, detailed description, article reference, remediation steps, and estimated effort is production-quality
- The legal disclaimer at the bottom is appropriate

**Weaknesses:**
- Only one test report exists — there's no test history or trend tracking
- No way to mark findings as "in progress" or "resolved"
- The "Re-run Test" button implies automation but there's no configuration for what gets tested
- No severity weighting — all 3 criticals are weighted equally but F-001 (emergency stop) is arguably more urgent than F-003 (adversarial testing)
- No integration with a ticketing system (Jira, Linear) for remediation tracking

---

### 8. Export Reports — Score: 5/10

**Strengths:**
- Four clear export categories (AI Systems, Team Members, Assessments, Activity Log) with descriptions
- Export history table concept is good for audit trails

**Weaknesses:**
- CSV-only format is limiting — auditors and regulators want PDF reports
- No export customisation (date ranges, filters, specific systems)
- The export history table is empty with no demonstration data
- No scheduled/automated export functionality
- No report templates aligned with EU AI Act submission requirements
- This feels like an afterthought

---

## Overall Platform Score

| Section | Score |
|---|---|
| Dashboard | 8.0 |
| Assessment Wizard | 7.0 |
| Risk Classification | 8.5 |
| Documentation | 7.5 |
| AI Systems Registry | 7.0 |
| Team & Roles | 6.5 |
| AI Test Report | 9.0 |
| Export Reports | 5.0 |
| **Overall** | **7.3/10** |

---

## CTO Recommendations (Technical & Architecture)

### 1. State persistence & data model
The platform is currently a static front-end demo. The highest priority is building a real backend with persistent state. Assessments should save to a database, systems registry should auto-update from assessments, and the dashboard KPIs should calculate from real data. Consider Supabase or Firebase for rapid prototyping given the SME target market.

### 2. Step 1 of the wizard must be functional
The system information step is where you capture the AI system's name, version, provider, deployment date, data categories, and purpose. This is the foundation of the entire compliance record. Without it, the platform can't generate meaningful reports or maintain the EU database registration records required under Art. 51.

### 3. Document upload & linking
Step 4 checkboxes for documentation should allow file uploads (or links to Google Drive/SharePoint/Confluence). Irish SMEs already have these documents scattered across tools — the platform should be a single source of truth. Consider S3-backed storage with versioning.

### 4. API integrations
Build webhooks/integrations for the test findings — connect to Jira, Linear, or GitHub Issues so remediation items automatically create tickets. This is table stakes for engineering teams. Also consider Slack/Teams notifications for compliance status changes.

### 5. Multi-format export
Add PDF export with branded cover pages, executive summaries, and article-specific appendices. Auditors and the Irish DPC will want PDF, not CSV. Consider generating reports that align with the EU AI Act's Annex IV technical documentation structure.

### 6. Role-based access control
Implement proper RBAC tied to the Team & Roles page. Viewers shouldn't see Edit buttons. Editors shouldn't see Remove buttons. The compliance officer (Admin) should be the only one who can submit assessments or modify risk classifications.

### 7. Audit trail
Every action (assessment submission, risk classification change, team member added, document uploaded) should generate an immutable audit log entry with timestamp, user, and diff. This is a regulatory requirement and a legal protection for the SME.

---

## Product Manager Recommendations (UX, Market Fit & Growth)

### 1. Ireland & SME-specific localisation
The platform references the EU AI Act generically but doesn't address Ireland specifically. Add guidance on the Irish DPC's role as the national supervisory authority, Ireland's national AI strategy, and SME-specific proportionality measures (the Act has reduced obligations for SMEs with fewer than 250 employees). This is your differentiator vs. generic EU compliance tools.

### 2. Guided remediation, not just reporting
The test report identifies 3 critical findings but leaves the SME to figure out implementation. Build guided workflows for common remediations — for example, "Implement emergency stop mechanism" could link to a template architecture pattern, a sample code snippet, and a checklist. This turns the platform from a diagnosis tool into a treatment tool.

### 3. Onboarding flow
New users land on the dashboard with pre-loaded demo data, which is confusing. Build a proper onboarding wizard: company details → add your first AI system → run your first assessment → view your compliance score. The current experience assumes familiarity with the EU AI Act.

### 4. Pricing tier alignment
The platform serves very different needs for a 10-person startup with one chatbot vs. a 200-person fintech with 6 AI systems. Consider tiered pricing: Free (1 system, basic assessment), Pro (5 systems, test reports, PDF export), Enterprise (unlimited systems, API, SSO, audit logs).

### 5. Compliance scoring methodology transparency
The 75% overall score and the per-category scores (88%, 81%, etc.) appear on the dashboard but the methodology isn't explained anywhere. Users need to understand how these are calculated to trust them and to know which actions will move the needle. Add a "How is my score calculated?" page.

### 6. Dashboard should be actionable
Replace the static donut chart with a "Top 3 actions to improve your score" component. For example: "Upload Training Data Documentation (+5%)", "Implement emergency stop for HR Screening Tool (+3%)", "Complete adversarial robustness testing (+4%)". This creates a clear path forward.

### 7. Competitive moat through templates
Build a template library: DPIA templates for AI systems, Art. 14 human oversight procedure templates, Art. 13 transparency notice templates (e.g., "This chatbot is powered by AI" banner copy), and Art. 11 technical documentation templates. Irish SMEs will pay for these because they don't have in-house legal teams to draft them.

### 8. Assessment history & versioning
Allow re-running assessments over time and show compliance trajectory. A chart showing "You were 55% compliant in January, 75% in February" is powerful for board reporting and demonstrates regulatory progress to supervisory authorities.

---

## Priority Roadmap Suggestion

### Phase 1 (Now → 2 months)
- Make Step 1 functional
- Add document upload capability
- Implement PDF export
- Add Ireland-specific guidance
- Build proper onboarding

### Phase 2 (2–4 months)
- Backend persistence
- Assessment versioning and history
- Guided remediation workflows
- Scoring methodology transparency
- RBAC implementation

### Phase 3 (4–6 months)
- API integrations (Jira, Slack)
- Template library
- Automated re-testing and trend tracking
- Multi-organisation support
- Compliance trajectory reporting

---

## Summary

The platform has a strong foundation — the risk classification logic, the test report structure, and the overall information architecture are well-conceived. The primary gap is moving from a static demonstration to an interactive, stateful tool that Irish SMEs can use in production to manage real compliance obligations before the **August 2026 deadline**.

---

*End of Product Review*

*Generated: 13 February 2026*
