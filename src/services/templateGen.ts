import { db, getCompanyProfile } from '../db';
import type { AISystem, CompanyProfile, GeneratedDoc, Vendor } from '../types';
import { riskLabel, computeCompleteness } from './classifier';
import { escapeMarkdown } from '../utils/escapeHtml';

interface TemplateContext {
  companyName: string;
  systems: AISystem[];
  vendors: Vendor[];
  profile: CompanyProfile | undefined;
}

interface TemplateDefinition {
  id: string;
  title: string;
  description: string;
  generate: (ctx: TemplateContext) => string;
}

function systemInventoryTable(systems: AISystem[]): string {
  if (systems.length === 0) return '- *No AI systems registered yet.*\n';
  const header = '| Name | Owner | Purpose | Risk Category |\n|------|-------|---------|---------------|\n';
  const rows = systems
    .map(
      (s) =>
        `| ${escapeMarkdown(s.name)} | ${escapeMarkdown(s.owner || 'Unassigned')} | ${escapeMarkdown(s.description?.slice(0, 60) || 'N/A')} | ${riskLabel(s.riskCategory ?? 'unknown')} |`,
    )
    .join('\n');
  return header + rows + '\n';
}

function vendorSection(vendors: Vendor[]): string {
  if (vendors.length === 0) return '- *No third-party AI vendors registered.*\n';
  return (
    vendors
      .map(
        (v) =>
          `- **${escapeMarkdown(v.name)}** (${escapeMarkdown(v.contact || 'No contact')}) - Status: ${v.dueDiligenceStatus}`,
      )
      .join('\n') + '\n'
  );
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'ai-usage-policy',
    title: 'AI Usage Policy',
    description: 'Company-wide policy governing the use of AI systems.',
    generate: (ctx) => `# AI Usage Policy - ${escapeMarkdown(ctx.companyName)}

**Effective Date:** ${new Date().toISOString().slice(0, 10)}
**Version:** 1.0

## Purpose
This policy governs the responsible use of artificial intelligence (AI) systems within ${escapeMarkdown(ctx.companyName)}. It aligns with the EU AI Act and applicable Irish regulations.

> **Disclaimer:** This document is for guidance only and does not constitute legal advice. Consult qualified legal counsel for binding obligations.

## Scope
This policy applies to all employees, contractors, and third parties who develop, deploy, or use AI systems on behalf of ${escapeMarkdown(ctx.companyName)}.

### AI Systems in Scope
${systemInventoryTable(ctx.systems)}

### Third-Party AI Vendors
${vendorSection(ctx.vendors)}

## Principles
1. **Transparency:** Users must be informed when interacting with AI systems.
2. **Human Oversight:** Qualified personnel must review AI outputs before consequential decisions.
3. **Data Protection:** AI use must comply with GDPR and the Data Protection Act 2018.
4. **Fairness:** AI systems must not discriminate on protected grounds.
5. **Accountability:** Each AI system must have a designated owner.

## Responsibilities
- **AI System Owners** are accountable for compliance of their systems.
- **All Staff** must complete mandatory AI awareness training.
- **DPO / Compliance Officer** (${escapeMarkdown(ctx.profile?.dpoName || '[DPO Name]')}, ${escapeMarkdown(ctx.profile?.dpoEmail || '[DPO Email]')}) reviews AI risk assessments and coordinates audits.

## Incident Reporting
Any AI-related incident must be reported immediately using the company's incident reporting process.

## Review
This policy will be reviewed at least annually or when material changes occur to AI systems or regulations.
`,
  },
  {
    id: 'vendor-due-diligence',
    title: 'Vendor Due Diligence Checklist',
    description: 'Checklist for evaluating third-party AI vendors.',
    generate: (ctx) => `# Vendor Due Diligence Checklist - ${escapeMarkdown(ctx.companyName)}

**Date:** ${new Date().toISOString().slice(0, 10)}

> **Disclaimer:** This checklist is for guidance only and does not constitute legal advice.

## Registered AI Vendors
${vendorSection(ctx.vendors)}

## Vendor Information
- **Vendor Name:** ______________________
- **Contact Person:** ______________________
- **AI System/Service:** ______________________

## Compliance Checks

### EU AI Act Compliance
- [ ] Vendor confirms awareness of the EU AI Act
- [ ] Vendor has provided the risk classification of their AI system
- [ ] Vendor maintains technical documentation per EU AI Act requirements
- [ ] Vendor has a conformity assessment (if high-risk)
- [ ] System is registered in EU database (if required)

### Data Protection
- [ ] Data Processing Agreement (DPA) is in place
- [ ] Data transfers outside EEA are documented and lawful
- [ ] Vendor provides transparency about training data sources
- [ ] Data retention and deletion policies are documented

### Security
- [ ] Vendor has SOC 2 / ISO 27001 or equivalent certification
- [ ] Incident response process is documented
- [ ] Vulnerability disclosure policy exists

### Transparency & Oversight
- [ ] Vendor provides documentation on system capabilities and limitations
- [ ] API for logging/monitoring is available
- [ ] Human override mechanisms are documented

### Contractual
- [ ] Liability clauses cover AI-related harms
- [ ] SLA includes uptime and performance metrics
- [ ] Exit/migration provisions are adequate

## Assessment Result
- **Recommendation:** [ ] Approved / [ ] Conditionally Approved / [ ] Not Approved
- **Reviewer:** ______________________
- **Date:** ______________________
`,
  },
  {
    id: 'incident-response-plan',
    title: 'Incident Response Plan',
    description: 'Procedure for handling AI-related incidents.',
    generate: (ctx) => `# AI Incident Response Plan - ${escapeMarkdown(ctx.companyName)}

**Effective Date:** ${new Date().toISOString().slice(0, 10)}

> **Disclaimer:** This plan is for guidance only and does not constitute legal advice.

## 1. Purpose
To establish a structured approach for identifying, reporting, and resolving incidents involving AI systems at ${escapeMarkdown(ctx.companyName)}.

## 2. Escalation Contacts
- **DPO / Compliance Officer:** ${escapeMarkdown(ctx.profile?.dpoName || '[DPO Name]')} (${escapeMarkdown(ctx.profile?.dpoEmail || '[DPO Email]')})
- **Sector:** ${escapeMarkdown(ctx.profile?.sector || '[Sector]')}

## 3. AI Systems Covered
${systemInventoryTable(ctx.systems)}

## 4. Definitions
- **AI Incident:** Any event where an AI system produces harmful, incorrect, biased, or unexpected outcomes.
- **Severity Levels:**
  - **Critical:** Immediate harm to individuals, legal exposure, or safety risk.
  - **High:** Significant errors affecting business decisions or customer trust.
  - **Medium:** Noticeable errors with limited impact.
  - **Low:** Minor issues with no immediate harm.

## 5. Reporting
1. Any employee who identifies an AI incident must report it immediately.
2. Reports should include: system name, description, affected parties, severity estimate.
3. Critical and high-severity incidents must be escalated to ${escapeMarkdown(ctx.profile?.dpoName || 'the DPO')} and management within 1 hour.

## 6. Response Steps
1. **Contain:** Isolate the AI system if causing ongoing harm.
2. **Assess:** Determine severity, root cause, and affected scope.
3. **Notify:** Inform affected parties and, if required, the DPC/relevant authority.
4. **Remediate:** Fix the root cause. Document changes made.
5. **Review:** Conduct a post-incident review within 5 working days.

## 7. Regulatory Reporting
Under the EU AI Act, serious incidents involving high-risk AI systems must be reported to the relevant market surveillance authority. For Ireland, this is the Irish DPC.

## 8. Record Keeping
All incidents must be logged and retained for a minimum of 5 years.
`,
  },
  {
    id: 'human-oversight-sop',
    title: 'Human Oversight SOP',
    description: 'Standard operating procedure for human oversight of AI outputs.',
    generate: (ctx) => {
      const systemNames = ctx.systems.map((s) => s.name);
      return `# Human Oversight Standard Operating Procedure - ${escapeMarkdown(ctx.companyName)}

**Effective Date:** ${new Date().toISOString().slice(0, 10)}

> **Disclaimer:** This SOP is for guidance only and does not constitute legal advice.

## Purpose
To ensure that qualified personnel review and validate AI system outputs before they are used for consequential decisions.

## Scope
Applies to all AI systems classified as high-risk or limited-risk operated by ${escapeMarkdown(ctx.companyName)}.

### Systems Covered
${systemNames.length ? systemNames.map((s) => `- ${escapeMarkdown(s)}`).join('\n') : '- *All registered AI systems*'}

## Procedure

### 1. Pre-Deployment
- Confirm the AI system has documented performance metrics.
- Designate at least one qualified reviewer per system.
- Ensure reviewers have completed AI oversight training.

### 2. Routine Review
- Reviewers must examine a statistically meaningful sample of AI outputs weekly.
- Flag outputs that appear biased, incorrect, or harmful.
- Document review findings in the compliance log.

### 3. Decision Checkpoints
- **Before any automated decision affecting individuals:** A human must review and approve the AI recommendation.
- **Override authority:** Reviewers may override AI outputs at any time.
- **Escalation:** Uncertain cases must be escalated to the Compliance Officer.

### 4. Logging
- All reviews must be logged with: reviewer name, date, system, findings, action taken.

### 5. Training
- Reviewers must complete refresher training every 6 months.
`;
    },
  },
  {
    id: 'model-output-review',
    title: 'Model Output Review SOP',
    description: 'Procedure for reviewing and validating AI model outputs.',
    generate: (ctx) => `# Model Output Review SOP - ${escapeMarkdown(ctx.companyName)}

**Effective Date:** ${new Date().toISOString().slice(0, 10)}

> **Disclaimer:** This SOP is for guidance only and does not constitute legal advice.

## Purpose
To establish a consistent process for reviewing, validating, and approving AI model outputs before they are published, sent to customers, or used in decision-making.

## Output Categories

| Category | Review Required | Approval Level |
|----------|----------------|----------------|
| Customer-facing content | Mandatory | Team Lead |
| Internal analysis | Recommended | Reviewer |
| Automated decisions | Mandatory | Compliance Officer |
| Training/testing | Optional | N/A |

## Review Checklist
- [ ] Output is factually accurate (spot-check key claims)
- [ ] Output does not contain personal data unless authorised
- [ ] Output is free from discriminatory or biased language
- [ ] Output is appropriate for the intended audience
- [ ] Output aligns with company tone and policy
- [ ] Sources or reasoning are verifiable where applicable

## Escalation
If an output raises concerns about bias, accuracy, or safety:
1. Do not publish or act on the output.
2. Document the concern.
3. Escalate to the AI System Owner and Compliance Officer.

## Record Keeping
Maintain a log of reviewed outputs for audit purposes. Retain for at least 3 years.
`,
  },
  {
    id: 'transparency-notice',
    title: 'Transparency Notice Templates',
    description: 'Notice templates for informing users about AI system usage.',
    generate: (ctx) => {
      const systemNames = ctx.systems.map((s) => s.name);
      return `# Transparency Notice Templates - ${escapeMarkdown(ctx.companyName)}

**Date:** ${new Date().toISOString().slice(0, 10)}

> **Disclaimer:** These templates are for guidance only and do not constitute legal advice. Adapt them to your specific context and seek legal review.

---

## Template 1: General AI Disclosure (Website/App)

> **AI-Powered Features**
> Some features of this service use artificial intelligence. AI-generated outputs are provided for informational purposes and may not always be accurate. A qualified human reviews consequential outputs before decisions are made. For questions, contact ${escapeMarkdown(ctx.companyName)} at [email].

---

## Template 2: Chatbot Disclosure

> You are interacting with an AI-powered assistant operated by ${escapeMarkdown(ctx.companyName)}. This assistant can help with general enquiries but is not a substitute for professional advice. A human agent is available upon request.

---

## Template 3: AI-Assisted Decision Notice

> **Notice:** This process uses AI to assist in decision-making. The AI system provides recommendations which are reviewed by a qualified human before any final decision. You have the right to request a fully human review of any decision that affects you. Contact us at [email] to exercise this right.

---

## Template 4: Employee AI Tool Notice

> **AI Tools in Use**
> ${escapeMarkdown(ctx.companyName)} uses the following AI tools in business operations:
${systemNames.length ? systemNames.map((s) => `> - ${escapeMarkdown(s)}`).join('\n') : '> - *To be populated from AI inventory*'}
>
> All employees must complete AI awareness training before using these tools. Do not enter sensitive personal data or confidential information into AI tools unless specifically authorised.

---

## Regulatory Basis
These notices support compliance with:
- EU AI Act Art. 50 (transparency obligations)
- GDPR Art. 13/14 (information to data subjects)
- Irish DPC guidance on AI transparency
`;
    },
  },
  {
    id: 'data-processing-record',
    title: 'Record of AI Processing Activities',
    description: 'GDPR Art. 30 record covering AI system data processing.',
    generate: (ctx) => {
      const systemRows = ctx.systems
        .map((s) => {
          const cats = s.dataCategories.length > 0 ? s.dataCategories.join(', ') : 'Not specified';
          const users = s.affectedUsers.length > 0 ? s.affectedUsers.join(', ') : 'Not specified';
          return `| ${escapeMarkdown(s.name)} | ${escapeMarkdown(s.description?.slice(0, 40) || 'N/A')} | ${escapeMarkdown(cats)} | ${escapeMarkdown(users)} |`;
        })
        .join('\n');

      const systemTable =
        ctx.systems.length > 0
          ? `| System | Purpose | Data Categories | Affected Users |\n|--------|---------|-----------------|----------------|\n${systemRows}\n`
          : '- *No AI systems registered yet.*\n';

      return `# Record of AI Processing Activities - ${escapeMarkdown(ctx.companyName)}

**Date:** ${new Date().toISOString().slice(0, 10)}

> **Disclaimer:** This record is for guidance only and does not constitute legal advice. It should be reviewed by your DPO and legal counsel.

## 1. Controller Details
- **Organisation:** ${escapeMarkdown(ctx.companyName)}
- **DPO:** ${escapeMarkdown(ctx.profile?.dpoName || '[DPO Name]')} (${escapeMarkdown(ctx.profile?.dpoEmail || '[DPO Email]')})
- **Sector:** ${escapeMarkdown(ctx.profile?.sector || '[Sector]')}
- **Country:** ${escapeMarkdown(ctx.profile?.country || 'Ireland')}

## 2. AI Processing Activities

${systemTable}

## 3. Lawful Basis for Processing
For each AI system above, document the lawful basis under GDPR Art. 6:
- [ ] Consent (Art. 6(1)(a))
- [ ] Contract (Art. 6(1)(b))
- [ ] Legal obligation (Art. 6(1)(c))
- [ ] Vital interests (Art. 6(1)(d))
- [ ] Public interest (Art. 6(1)(e))
- [ ] Legitimate interests (Art. 6(1)(f))

## 4. Data Transfers
Document any transfers of personal data outside the EEA through AI systems:
- **Transfer mechanism:** ______________________
- **Recipient country:** ______________________
- **Safeguards:** ______________________

## 5. Retention
AI system logs and outputs containing personal data should be retained for: ______________________

## 6. Third-Party AI Vendors
${vendorSection(ctx.vendors)}

## Regulatory Basis
- GDPR Art. 30 (Records of processing activities)
- EU AI Act Art. 12 (Record-keeping for high-risk AI)
`;
    },
  },
  {
    id: 'risk-assessment-template',
    title: 'AI Risk Assessment Report',
    description: 'Per-system risk assessment with classification details and actions.',
    generate: (ctx) => {
      const sections = ctx.systems
        .map((s) => {
          const cat = s.riskCategory ?? 'unknown';
          const { score, missingFields } = computeCompleteness(s);
          const pct = Math.round(score * 100);
          const reasoning = (s.riskReasoning ?? []).map((r) => `- ${escapeMarkdown(r)}`).join('\n');
          const actions = (s.riskActions ?? []).map((a) => `- [ ] ${escapeMarkdown(a)}`).join('\n');
          const missing =
            missingFields.length > 0
              ? `**Missing data:** ${missingFields.join(', ')}`
              : 'All required fields complete.';

          return `### ${escapeMarkdown(s.name)}

| Field | Value |
|-------|-------|
| Risk Category | ${riskLabel(cat)} |
| Confidence | ${escapeMarkdown(String(s.riskConfidence ?? 'N/A'))} |
| Completeness | ${pct}% |
| Owner | ${escapeMarkdown(s.owner || 'Unassigned')} |
| Department | ${escapeMarkdown(s.department || 'N/A')} |
| Status | ${escapeMarkdown(s.status)} |

${missing}

**Reasoning:**
${reasoning || '- Not yet classified.'}

**Recommended Actions:**
${actions || '- No actions specified.'}
`;
        })
        .join('\n---\n\n');

      return `# AI Risk Assessment Report - ${escapeMarkdown(ctx.companyName)}

**Date:** ${new Date().toISOString().slice(0, 10)}

> **Disclaimer:** This report is for guidance only and does not constitute legal advice. Risk classifications are indicative; consult qualified legal counsel for final determinations.

## Overview
- **Total AI systems:** ${ctx.systems.length}
- **Assessed by:** AI Comply automated classifier
- **DPO:** ${escapeMarkdown(ctx.profile?.dpoName || '[DPO Name]')}

## System Assessments

${ctx.systems.length > 0 ? sections : '*No AI systems registered yet.*'}

## Methodology
Risk classifications are based on rules derived from the EU AI Act (Regulation (EU) 2024/1689), including:
- Art. 5 (Prohibited practices)
- Art. 6 and Annex III (High-risk classification)
- Art. 50 (Transparency obligations for limited-risk)
- Completeness scoring adjusts confidence when system data is incomplete.

## Next Steps
1. Review each system classification with your legal team.
2. Address all recommended actions by the suggested due dates.
3. Re-assess after adding missing data to improve confidence levels.
`;
    },
  },
];

export async function generateTemplate(templateId: string): Promise<GeneratedDoc> {
  const template = TEMPLATES.find((t) => t.id === templateId);
  if (!template) throw new Error(`Unknown template: ${templateId}`);

  const profile = await getCompanyProfile();
  const companyName = profile?.name || '[Your Company Name]';
  const systems = await db.aiSystems.where('status').equals('active').toArray();
  const vendors = await db.vendors.toArray();

  const ctx: TemplateContext = { companyName, systems, vendors, profile };
  const content = template.generate(ctx);

  const doc: GeneratedDoc = {
    templateType: templateId,
    name: template.title,
    content,
    format: 'markdown',
    createdAt: new Date().toISOString(),
  };

  doc.id = await db.generatedDocs.add(doc);
  return doc;
}
