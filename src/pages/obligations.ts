import { db } from '../db';
import type { AISystem, RiskCategory } from '../types';
import { riskLabel, riskBadgeClass } from '../services/classifier';

/* ── Obligation definitions ── */

interface Obligation {
  text: string;
  article: string;
}

const HIGH_RISK_OBLIGATIONS: Obligation[] = [
  { text: 'Risk management system', article: 'Art. 9' },
  { text: 'Data governance', article: 'Art. 10' },
  { text: 'Technical documentation', article: 'Art. 11' },
  { text: 'Record-keeping / logging', article: 'Art. 12' },
  { text: 'Transparency to users', article: 'Art. 13' },
  { text: 'Human oversight measures', article: 'Art. 14' },
  { text: 'Accuracy, robustness, cybersecurity', article: 'Art. 15' },
  { text: 'Conformity assessment', article: 'Art. 43' },
  { text: 'EU database registration', article: 'Art. 49' },
  { text: 'Post-market monitoring', article: 'Art. 72' },
  { text: 'Incident reporting', article: 'Art. 73' },
  { text: 'Vendor management', article: '' },
  { text: 'Staff training', article: '' },
];

const LIMITED_RISK_OBLIGATIONS: Obligation[] = [
  { text: 'Transparency notices', article: 'Art. 50' },
  { text: 'Staff AI usage policy', article: '' },
  { text: 'Vendor review', article: '' },
  { text: 'Output review guidance', article: '' },
];

const MINIMAL_RISK_OBLIGATIONS: Obligation[] = [
  { text: 'Basic AI usage policy', article: '' },
  { text: 'Staff awareness training', article: '' },
  { text: 'Voluntary code of conduct', article: 'Art. 95' },
];

const OBLIGATION_MAP: Record<string, Obligation[]> = {
  'high-risk': HIGH_RISK_OBLIGATIONS,
  'limited-risk': LIMITED_RISK_OBLIGATIONS,
  'minimal-risk': MINIMAL_RISK_OBLIGATIONS,
};

/* ── Sources table data ── */

interface SourceEntry {
  obligation: string;
  article: string;
  description: string;
}

const SOURCES: SourceEntry[] = [
  {
    obligation: 'Risk management system',
    article: 'Art. 9',
    description: 'Establishment, implementation, documentation and maintenance of a risk management system.',
  },
  {
    obligation: 'Data governance',
    article: 'Art. 10',
    description: 'Training, validation and testing data sets shall meet quality criteria.',
  },
  {
    obligation: 'Technical documentation',
    article: 'Art. 11',
    description: 'Technical documentation shall be drawn up before the system is placed on the market.',
  },
  {
    obligation: 'Record-keeping / logging',
    article: 'Art. 12',
    description: 'High-risk AI systems shall allow automatic recording of events (logs).',
  },
  {
    obligation: 'Transparency to users',
    article: 'Art. 13',
    description: 'High-risk AI systems shall be designed to ensure operation is sufficiently transparent.',
  },
  {
    obligation: 'Human oversight',
    article: 'Art. 14',
    description: 'High-risk AI systems shall be designed to be effectively overseen by natural persons.',
  },
  {
    obligation: 'Accuracy, robustness, cybersecurity',
    article: 'Art. 15',
    description: 'High-risk AI systems shall achieve appropriate levels of accuracy, robustness and cybersecurity.',
  },
  {
    obligation: 'Conformity assessment',
    article: 'Art. 43',
    description: 'Providers shall follow the conformity assessment procedure before placing on market.',
  },
  {
    obligation: 'EU database registration',
    article: 'Art. 49',
    description: 'Providers shall register the high-risk AI system in the EU database.',
  },
  {
    obligation: 'Transparency notices',
    article: 'Art. 50',
    description: 'Providers shall ensure AI systems intended to interact with persons are identified as such.',
  },
  {
    obligation: 'Post-market monitoring',
    article: 'Art. 72',
    description: 'Providers shall establish a post-market monitoring system proportionate to the nature of the AI.',
  },
  {
    obligation: 'Incident reporting',
    article: 'Art. 73',
    description: 'Providers shall report serious incidents to market surveillance authorities.',
  },
  {
    obligation: 'Voluntary code of conduct',
    article: 'Art. 95',
    description: 'Codes of conduct intended to foster voluntary application of requirements for non-high-risk AI.',
  },
];

/* ── Helpers ── */

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ── Render ── */

function render(): string {
  return `
    <div class="page">
      <div class="page-header">
        <h1>Obligations</h1>
        <p>Review the compliance obligations that apply to your AI systems based on their
           risk classification under the EU AI Act. Each risk tier carries specific requirements
           that must be implemented and documented.</p>
      </div>

      <div class="disclaimer-banner">
        This tool provides guidance only  -  it does not constitute legal advice.
        The obligation checklists are indicative summaries; always refer to the official
        EU AI Act text and consult qualified legal counsel.
      </div>

      <div id="obligations-content"></div>

      <div class="card" id="sources-panel">
        <div class="card-header">
          <h2 class="card-title">Sources  -  EU AI Act Article References</h2>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Obligation</th>
                <th>Article</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${SOURCES.map(
                (s) => `
                <tr>
                  <td>${escapeHtml(s.obligation)}</td>
                  <td><span class="checklist-cite">${escapeHtml(s.article)}</span></td>
                  <td>${escapeHtml(s.description)}</td>
                </tr>`,
              ).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
}

/* ── Render sub-components ── */

function renderChecklistItem(obligation: Obligation, index: number, category: string): string {
  const cite = obligation.article ? `<span class="checklist-cite">${escapeHtml(obligation.article)}</span>` : '';

  return `
    <div class="checklist-item">
      <label>
        <input type="checkbox" data-category="${escapeHtml(category)}" data-index="${index}" />
        <span>${escapeHtml(obligation.text)}</span>
        ${cite}
      </label>
    </div>`;
}

function renderSystemBadges(systems: AISystem[]): string {
  if (systems.length === 0) return '';
  const badges = systems.map((s) => `<span class="badge badge-gray">${escapeHtml(s.name)}</span>`).join(' ');
  return `<div class="obligation-systems"><strong>Applies to:</strong> ${badges}</div>`;
}

function renderAccordionSection(
  category: RiskCategory,
  obligations: Obligation[],
  systems: AISystem[],
  sectionIndex: number,
): string {
  const badge = riskBadgeClass(category);
  const label = riskLabel(category);
  const sectionId = `accordion-body-${sectionIndex}`;

  const checklistItems = obligations.map((o, i) => renderChecklistItem(o, i, category)).join('');

  return `
    <div class="accordion-item">
      <button class="accordion-btn" data-target="${sectionId}" aria-expanded="false">
        <span class="badge ${badge}">${label}</span>
        <span>${label} Obligations (${obligations.length})</span>
        <span class="accordion-icon">&#9660;</span>
      </button>
      <div class="accordion-body" id="${sectionId}" style="display:none;">
        ${renderSystemBadges(systems)}
        ${checklistItems}
      </div>
    </div>`;
}

/* ── Init ── */

async function init(): Promise<void> {
  const allSystems = await db.aiSystems.toArray();

  const contentEl = document.getElementById('obligations-content');
  if (!contentEl) return;

  // Group systems by risk category
  const systemsByCategory: Partial<Record<RiskCategory, AISystem[]>> = {};
  for (const s of allSystems) {
    const cat = s.riskCategory ?? 'unknown';
    if (!systemsByCategory[cat]) {
      systemsByCategory[cat] = [];
    }
    systemsByCategory[cat]!.push(s);
  }

  // Build accordion sections for categories that have systems or obligations
  const categoriesToShow: RiskCategory[] = ['high-risk', 'limited-risk', 'minimal-risk'];
  const sections: string[] = [];
  let sectionIndex = 0;

  for (const cat of categoriesToShow) {
    const obligations = OBLIGATION_MAP[cat];
    if (!obligations) continue;

    const systems = systemsByCategory[cat] ?? [];

    // Only show the section if there are systems in this category
    // or if we want to always show all obligation sections for reference
    if (systems.length > 0) {
      sections.push(renderAccordionSection(cat, obligations, systems, sectionIndex));
      sectionIndex++;
    }
  }

  // Handle prohibited systems separately
  const prohibitedSystems = systemsByCategory['prohibited'] ?? [];
  if (prohibitedSystems.length > 0) {
    const prohibitedHtml = `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">
            <span class="badge badge-red">Prohibited</span> Systems Detected
          </h2>
        </div>
        <p>The following systems have been classified as <strong>prohibited</strong> under the
           EU AI Act (Art. 5). These systems must be discontinued or modified to comply.</p>
        ${renderSystemBadges(prohibitedSystems)}
        <div class="checklist-item">
          <label>
            <input type="checkbox" />
            <span>Seek immediate legal counsel regarding prohibited classification</span>
          </label>
        </div>
        <div class="checklist-item">
          <label>
            <input type="checkbox" />
            <span>Evaluate whether any exemptions or modifications apply</span>
          </label>
        </div>
        <div class="checklist-item">
          <label>
            <input type="checkbox" />
            <span>Document decision to discontinue or modify the system</span>
          </label>
        </div>
      </div>`;
    sections.unshift(prohibitedHtml);
  }

  if (sections.length === 0) {
    contentEl.innerHTML = `
      <div class="empty-state">
        No AI systems registered yet. Add systems in the Inventory and classify them
        to see applicable obligations here.
      </div>`;
    return;
  }

  contentEl.innerHTML = sections.join('');

  // ── Wire up accordion buttons ──
  const accordionBtns = contentEl.querySelectorAll<HTMLButtonElement>('.accordion-btn');
  for (const btn of accordionBtns) {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      if (!targetId) return;

      const body = document.getElementById(targetId);
      if (!body) return;

      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isExpanded));
      body.style.display = isExpanded ? 'none' : 'block';

      const icon = btn.querySelector('.accordion-icon');
      if (icon) {
        icon.textContent = isExpanded ? '\u25BC' : '\u25B2';
      }
    });
  }

  // ── Persist checkbox state in sessionStorage ──
  const checkboxes = contentEl.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
  for (const cb of checkboxes) {
    const key = `obligation-${cb.dataset.category ?? 'misc'}-${cb.dataset.index ?? cb.closest('.checklist-item')?.textContent?.trim().slice(0, 30)}`;

    // Restore state
    const stored = sessionStorage.getItem(key);
    if (stored === 'true') {
      cb.checked = true;
    }

    cb.addEventListener('change', () => {
      sessionStorage.setItem(key, String(cb.checked));
    });
  }
}

export default { render, init };
