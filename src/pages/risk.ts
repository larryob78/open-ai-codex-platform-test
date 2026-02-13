import { db } from '../db';
import type { AISystem, RiskCategory } from '../types';
import { classifySystem, riskLabel, riskBadgeClass } from '../services/classifier';
import { showToast } from '../components/toast';

const RISK_CATEGORIES: RiskCategory[] = [
  'prohibited',
  'high-risk',
  'limited-risk',
  'minimal-risk',
];

const CATEGORY_DESCRIPTIONS: Record<RiskCategory, string> = {
  'prohibited': 'AI practices that are banned outright under the EU AI Act.',
  'high-risk': 'AI systems subject to strict requirements before market placement.',
  'limited-risk': 'AI systems with specific transparency obligations.',
  'minimal-risk': 'AI systems with no specific regulatory obligations beyond voluntary codes.',
  'unknown': 'Systems not yet classified.',
};

/* ── Helpers ── */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function confidenceBadgeClass(confidence: string): string {
  switch (confidence) {
    case 'high': return 'badge-green';
    case 'medium': return 'badge-yellow';
    case 'low': return 'badge-red';
    default: return 'badge-gray';
  }
}

/* ── Render ── */

function render(): string {
  return `
    <div class="page">
      <div class="page-header">
        <h1>Risk Classification</h1>
        <p>Classify your AI systems according to the EU AI Act risk categories.
           The Act defines four tiers &mdash; prohibited, high-risk, limited-risk,
           and minimal-risk &mdash; each carrying different compliance obligations.</p>
      </div>

      <div class="disclaimer-banner">
        This tool provides guidance only &mdash; it does not constitute legal advice.
        Automated classification is indicative; always consult qualified legal counsel
        for final risk determinations.
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Risk Category Summary</h2>
          <button class="btn btn-primary" id="reclassify-all-btn">Reclassify All</button>
        </div>
        <div class="risk-grid" id="risk-summary-grid"></div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">AI Systems by Risk Category</h2>
        </div>
        <div id="risk-table-container"></div>
      </div>

      <div id="risk-detail-panel"></div>
    </div>`;
}

/* ── Render sub-components ── */

function renderSummaryGrid(counts: Record<RiskCategory, number>): string {
  return RISK_CATEGORIES.map((cat) => {
    const badge = riskBadgeClass(cat);
    const label = riskLabel(cat);
    const desc = CATEGORY_DESCRIPTIONS[cat];
    return `
      <div class="risk-card">
        <span class="risk-count ${badge}">${counts[cat]}</span>
        <span class="risk-label">${label}</span>
        <span class="risk-desc">${escapeHtml(desc)}</span>
      </div>`;
  }).join('');
}

function renderSystemsTable(systems: AISystem[]): string {
  if (systems.length === 0) {
    return `<div class="empty-state">
      No AI systems registered yet. Add systems in the Inventory to see their risk classification here.
    </div>`;
  }

  // Sort by risk category weight: prohibited first, then high, limited, minimal, unknown last
  const categoryOrder: Record<string, number> = {
    'prohibited': 0,
    'high-risk': 1,
    'limited-risk': 2,
    'minimal-risk': 3,
    'unknown': 4,
  };

  const sorted = [...systems].sort((a, b) => {
    const aOrder = categoryOrder[a.riskCategory ?? 'unknown'] ?? 4;
    const bOrder = categoryOrder[b.riskCategory ?? 'unknown'] ?? 4;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.name.localeCompare(b.name);
  });

  const rows = sorted.map((s) => {
    const cat = s.riskCategory ?? 'unknown';
    const badge = riskBadgeClass(cat);
    const label = riskLabel(cat);
    const confidence = s.riskConfidence ?? 'N/A';
    const confBadge = s.riskConfidence ? confidenceBadgeClass(s.riskConfidence) : 'badge-gray';
    const reasoning = s.riskReasoning && s.riskReasoning.length > 0
      ? escapeHtml(s.riskReasoning[0])
      : '<em>Not classified</em>';
    const statusBadge = s.status === 'active'
      ? 'badge-green'
      : s.status === 'draft'
        ? 'badge-yellow'
        : 'badge-gray';

    return `
      <tr>
        <td>
          <a href="#" class="system-name-link" data-system-id="${s.id}">
            ${escapeHtml(s.name)}
          </a>
        </td>
        <td><span class="badge ${badge}">${label}</span></td>
        <td><span class="badge ${confBadge}">${escapeHtml(String(confidence))}</span></td>
        <td>${reasoning}</td>
        <td><span class="badge ${statusBadge}">${escapeHtml(s.status)}</span></td>
      </tr>`;
  }).join('');

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>System Name</th>
            <th>Category</th>
            <th>Confidence</th>
            <th>Key Reasoning</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>`;
}

function renderDetailPanel(system: AISystem): string {
  const cat = system.riskCategory ?? 'unknown';
  const badge = riskBadgeClass(cat);
  const label = riskLabel(cat);
  const confidence = system.riskConfidence ?? 'N/A';

  const reasoningItems = (system.riskReasoning ?? []).map((r) =>
    `<li>${escapeHtml(r)}</li>`
  ).join('');

  const actionItems = (system.riskActions ?? []).map((a) =>
    `<div class="checklist-item">
      <label>
        <input type="checkbox" />
        <span>${escapeHtml(a)}</span>
      </label>
    </div>`
  ).join('');

  return `
    <div class="card" id="risk-detail-card">
      <div class="card-header">
        <h2 class="card-title">Classification Details &mdash; ${escapeHtml(system.name)}</h2>
        <button class="btn btn-secondary" id="close-detail-btn">Close</button>
      </div>

      <div class="detail-meta">
        <span><strong>Category:</strong> <span class="badge ${badge}">${label}</span></span>
        <span><strong>Confidence:</strong> ${escapeHtml(String(confidence))}</span>
        <span><strong>Status:</strong> ${escapeHtml(system.status)}</span>
      </div>

      <div class="detail-section">
        <h3>All Reasoning</h3>
        ${reasoningItems
          ? `<ul class="reasoning-list">${reasoningItems}</ul>`
          : '<p><em>No reasoning available.</em></p>'}
      </div>

      <div class="detail-section">
        <h3>Recommended Actions</h3>
        ${actionItems || '<p><em>No recommended actions.</em></p>'}
      </div>
    </div>`;
}

/* ── Init ── */

async function init(): Promise<void> {
  const allSystems = await db.aiSystems.toArray();

  // ── Summary grid ──
  const counts: Record<RiskCategory, number> = {
    'prohibited': 0,
    'high-risk': 0,
    'limited-risk': 0,
    'minimal-risk': 0,
    'unknown': 0,
  };

  for (const s of allSystems) {
    const cat = s.riskCategory ?? 'unknown';
    if (counts[cat] !== undefined) {
      counts[cat]++;
    }
  }

  const gridEl = document.getElementById('risk-summary-grid');
  if (gridEl) {
    gridEl.innerHTML = renderSummaryGrid(counts);
  }

  // ── Systems table ──
  const tableContainer = document.getElementById('risk-table-container');
  if (tableContainer) {
    tableContainer.innerHTML = renderSystemsTable(allSystems);
  }

  // ── Wire up system name links ──
  attachSystemLinks(allSystems);

  // ── Reclassify All button ──
  const reclassifyBtn = document.getElementById('reclassify-all-btn');
  reclassifyBtn?.addEventListener('click', async () => {
    await handleReclassifyAll();
  });
}

function attachSystemLinks(allSystems: AISystem[]): void {
  const links = document.querySelectorAll<HTMLAnchorElement>('.system-name-link');
  for (const link of links) {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const systemId = Number(link.dataset.systemId);
      const system = allSystems.find((s) => s.id === systemId);
      if (!system) return;

      const panel = document.getElementById('risk-detail-panel');
      if (!panel) return;

      panel.innerHTML = renderDetailPanel(system);
      panel.scrollIntoView({ behavior: 'smooth' });

      const closeBtn = document.getElementById('close-detail-btn');
      closeBtn?.addEventListener('click', () => {
        panel.innerHTML = '';
      });
    });
  }
}

async function handleReclassifyAll(): Promise<void> {
  const reclassifyBtn = document.getElementById('reclassify-all-btn');
  if (reclassifyBtn) {
    reclassifyBtn.setAttribute('disabled', 'true');
    reclassifyBtn.textContent = 'Reclassifying...';
  }

  try {
    const allSystems = await db.aiSystems.toArray();

    if (allSystems.length === 0) {
      showToast('No AI systems to classify.', 'info');
      return;
    }

    let updated = 0;
    for (const system of allSystems) {
      const result = classifySystem(system);
      await db.aiSystems.update(system.id!, {
        riskCategory: result.category,
        riskConfidence: result.confidence,
        riskReasoning: result.reasoning,
        riskActions: result.actions,
        updatedAt: new Date().toISOString(),
      });
      updated++;
    }

    showToast(`Successfully reclassified ${updated} system(s).`, 'success');

    // Re-render the page content
    const freshSystems = await db.aiSystems.toArray();

    const counts: Record<RiskCategory, number> = {
      'prohibited': 0,
      'high-risk': 0,
      'limited-risk': 0,
      'minimal-risk': 0,
      'unknown': 0,
    };
    for (const s of freshSystems) {
      const cat = s.riskCategory ?? 'unknown';
      if (counts[cat] !== undefined) {
        counts[cat]++;
      }
    }

    const gridEl = document.getElementById('risk-summary-grid');
    if (gridEl) {
      gridEl.innerHTML = renderSummaryGrid(counts);
    }

    const tableContainer = document.getElementById('risk-table-container');
    if (tableContainer) {
      tableContainer.innerHTML = renderSystemsTable(freshSystems);
    }

    // Clear any open detail panel
    const panel = document.getElementById('risk-detail-panel');
    if (panel) panel.innerHTML = '';

    // Re-attach links with fresh data
    attachSystemLinks(freshSystems);

  } catch (err) {
    console.error('Reclassification failed:', err);
    showToast('Reclassification failed. See console for details.', 'error');
  } finally {
    if (reclassifyBtn) {
      reclassifyBtn.removeAttribute('disabled');
      reclassifyBtn.textContent = 'Reclassify All';
    }
  }
}

export default { render, init };
