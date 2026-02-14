import { db } from '../db';
import type { TrainingCompletion } from '../types';
import { escapeHtml } from '../utils/escapeHtml';
import { showToast } from '../components/toast';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/* ── Module definitions ── */

interface TrainingModule {
  moduleId: string;
  title: string;
  sections: { heading: string; intro?: string; items: string[]; ordered?: boolean }[];
}

const MODULES: TrainingModule[] = [
  {
    moduleId: 'safe-prompting',
    title: 'Safe Prompting & Verification',
    sections: [
      {
        heading: 'Why it matters',
        intro:
          'AI systems can hallucinate facts, be manipulated through prompt injection, and inadvertently leak sensitive data. Understanding these risks is the first step towards safe use.',
        items: [],
      },
      {
        heading: 'Best practices',
        items: [
          'Be specific and unambiguous in your prompts',
          'Avoid including PII or confidential data in prompts',
          'Verify AI outputs against trusted sources before acting on them',
          'Use system prompts to set constraints and boundaries',
          'Document prompting patterns that work well for your use case',
        ],
      },
      {
        heading: 'Red flags',
        items: [
          'Outputs that seem overly confident or authoritative without citations',
          'Unexpected personal or sensitive data appearing in responses',
          'Inconsistent answers to the same question across sessions',
        ],
      },
    ],
  },
  {
    moduleId: 'privacy-basics',
    title: 'Privacy Basics for AI Use',
    sections: [
      {
        heading: 'GDPR fundamentals',
        intro:
          'The General Data Protection Regulation requires a lawful basis for processing personal data. Key principles include data minimisation (collect only what is necessary) and purpose limitation (use data only for its stated purpose).',
        items: [],
      },
      {
        heading: 'AI-specific risks',
        items: [
          'Training data may contain personal data without proper consent',
          'Inputs sent to AI services may be logged and retained by vendors',
          'Outputs may inadvertently reveal sensitive information about individuals',
        ],
      },
      {
        heading: 'Practical steps',
        items: [
          'Anonymise or pseudonymise inputs before sending them to AI systems',
          'Check that your vendor has a signed Data Processing Agreement (DPA)',
          'Minimise the amount of personal data included in prompts',
          'Understand the vendor\u2019s data retention and deletion policies',
        ],
      },
    ],
  },
  {
    moduleId: 'human-oversight',
    title: 'Human Oversight & Escalation',
    sections: [
      {
        heading: 'EU AI Act requirements',
        intro:
          'Article 14 of the EU AI Act mandates that high-risk AI systems be designed to allow effective human oversight. Deployers must ensure individuals assigned to oversight understand the system\u2019s capabilities and limitations.',
        items: [],
      },
      {
        heading: 'When to escalate',
        items: [
          'High-stakes decisions affecting individuals\u2019 rights or livelihoods',
          'Uncertain or ambiguous outputs that cannot be independently verified',
          'Potential bias or discriminatory patterns in AI outputs',
          'Situations involving vulnerable groups such as children or at-risk populations',
        ],
      },
      {
        heading: 'Escalation process',
        items: [
          'Pause the AI process and prevent further automated actions',
          'Document the concern with screenshots, logs, or output copies',
          'Notify your supervisor or designated AI oversight officer',
          'Log the issue in the incident management system for tracking',
        ],
        ordered: true,
      },
    ],
  },
];

/* ── Render ── */

function renderSections(sections: TrainingModule['sections']): string {
  return sections
    .map((s) => {
      let body = '';
      if (s.intro) {
        body += `<p>${s.intro}</p>`;
      }
      if (s.items.length > 0) {
        const tag = s.ordered ? 'ol' : 'ul';
        body += `<${tag}>${s.items.map((i) => `<li>${i}</li>`).join('')}</${tag}>`;
      }
      return `<div class="module-content"><h4>${s.heading}</h4>${body}</div>`;
    })
    .join('');
}

function renderModule(mod: TrainingModule): string {
  return `
    <div class="card" data-module-id="${mod.moduleId}">
      <div class="card-header">
        <h2 class="card-title">${escapeHtml(mod.title)}</h2>
      </div>
      <div class="accordion-item">
        <button class="accordion-btn" data-accordion="${mod.moduleId}">
          Show module content
        </button>
        <div class="accordion-body" id="accordion-${mod.moduleId}" style="display:none;">
          ${renderSections(mod.sections)}
          <div class="form-group" style="margin-top:1rem; padding-top:1rem; border-top:1px solid var(--border, #e5e7eb);">
            <label class="form-label" for="completion-name-${mod.moduleId}">Your name</label>
            <input
              class="form-input"
              id="completion-name-${mod.moduleId}"
              type="text"
              placeholder="Enter your name"
            />
            <button class="btn btn-primary btn-sm" id="complete-btn-${mod.moduleId}" style="margin-top:0.5rem;">
              Mark Complete
            </button>
          </div>
          <div id="completions-${mod.moduleId}"></div>
        </div>
      </div>
    </div>`;
}

function render(): string {
  return `
    <div class="page">
      <div class="page-header">
        <h1>Training</h1>
        <p>Complete these modules to build AI compliance awareness.</p>
      </div>

      <div class="disclaimer-banner">
        This tool provides guidance only  -  it does not constitute legal advice.
        Always consult qualified legal counsel for compliance decisions.
      </div>

      ${MODULES.map(renderModule).join('')}

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Training Log</h2>
        </div>
        <div id="training-log"></div>
      </div>
    </div>`;
}

/* ── Init ── */

async function init(): Promise<void> {
  const completions = await db.trainingCompletions.toArray();

  // ── Accordion toggles ──
  for (const mod of MODULES) {
    const btn = document.querySelector<HTMLButtonElement>(`[data-accordion="${mod.moduleId}"]`);
    const body = document.getElementById(`accordion-${mod.moduleId}`);
    btn?.addEventListener('click', () => {
      if (!body) return;
      const isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : 'block';
      btn.textContent = isOpen ? 'Show module content' : 'Hide module content';
    });
  }

  // ── Render per-module completions & wire up forms ──
  for (const mod of MODULES) {
    renderModuleCompletions(mod.moduleId, completions);
    wireCompleteButton(mod);
  }

  // ── Training log table ──
  renderTrainingLog(completions);
}

function renderModuleCompletions(moduleId: string, completions: TrainingCompletion[]): void {
  const container = document.getElementById(`completions-${moduleId}`);
  if (!container) return;

  const moduleCompletions = completions.filter((c) => c.moduleId === moduleId);
  if (moduleCompletions.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = moduleCompletions
    .map(
      (c) =>
        `<span class="badge badge-green" style="display:inline-block; margin:0.25rem 0.25rem 0 0;">
          Completed by ${escapeHtml(c.userName)} on ${formatDate(c.completedAt)}
        </span>`,
    )
    .join('');
}

function wireCompleteButton(mod: TrainingModule): void {
  const btn = document.getElementById(`complete-btn-${mod.moduleId}`);
  const input = document.getElementById(`completion-name-${mod.moduleId}`) as HTMLInputElement | null;

  btn?.addEventListener('click', async () => {
    const userName = input?.value.trim();
    if (!userName) {
      showToast('Please enter your name.', 'warning');
      return;
    }

    const completion: TrainingCompletion = {
      moduleId: mod.moduleId,
      moduleName: mod.title,
      userName,
      completedAt: new Date().toISOString(),
    };

    await db.trainingCompletions.add(completion);
    showToast(`Module "${mod.title}" completed by ${userName}.`, 'success');

    if (input) input.value = '';

    // Re-fetch and re-render completions
    const allCompletions = await db.trainingCompletions.toArray();
    renderModuleCompletions(mod.moduleId, allCompletions);
    renderTrainingLog(allCompletions);
  });
}

function renderTrainingLog(completions: TrainingCompletion[]): void {
  const container = document.getElementById('training-log');
  if (!container) return;

  if (completions.length === 0) {
    container.innerHTML =
      '<div class="empty-state">No training completions yet. Complete a module above to get started.</div>';
    return;
  }

  const sorted = [...completions].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Module</th>
            <th>User</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${sorted
            .map(
              (c) => `
            <tr>
              <td>${escapeHtml(c.moduleName)}</td>
              <td>${escapeHtml(c.userName)}</td>
              <td>${formatDate(c.completedAt)}</td>
            </tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </div>`;
}

export default { render, init };
