import { db } from '../db';
import { riskLabel, riskBadgeClass } from '../services/classifier';
import { navigateTo } from '../router';
import { escapeHtml } from '../utils/escapeHtml';
import { openModal, closeModal } from '../components/modal';
import { showToast } from '../components/toast';
import type { AISystem, RiskCategory, Task, TrainingCompletion } from '../types';

const REQUIRED_MODULES = ['safe-prompting', 'privacy-basics', 'human-oversight'] as const;

const RISK_CATEGORIES: RiskCategory[] = ['prohibited', 'high-risk', 'limited-risk', 'minimal-risk'];

const PRIORITY_ORDER: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

/* ── EU AI Act Timeline ──
 * Source: Regulation (EU) 2024/1689, Art. 113 (Transitional provisions)
 * https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689
 */
interface TimelineEntry {
  date: string;
  iso: string;
  title: string;
  description: string;
  articleRef: string;
}

const EU_TIMELINE: TimelineEntry[] = [
  {
    date: '2 Feb 2025',
    iso: '2025-02-02',
    title: 'Prohibited practices & AI literacy',
    description:
      'Prohibited AI practices (Art. 5) and AI literacy obligations (Art. 4) begin applying. Organisations must stop using banned AI systems and begin AI awareness training.',
    articleRef: 'Art. 5, Art. 4',
  },
  {
    date: '2 Aug 2025',
    iso: '2025-08-02',
    title: 'Governance & GPAI rules',
    description:
      'Governance structures and obligations for general-purpose AI (GPAI) model providers begin applying. The AI Office becomes operational.',
    articleRef: 'Title V, Chapter 1',
  },
  {
    date: '2 Aug 2026',
    iso: '2026-08-02',
    title: 'Main obligations apply',
    description:
      'Main obligations become generally applicable, including requirements for high-risk AI systems listed in Annex III and transparency obligations for limited-risk systems.',
    articleRef: 'Art. 6(2), Annex III, Art. 50',
  },
  {
    date: '2 Aug 2027',
    iso: '2027-08-02',
    title: 'Extended transition ends',
    description:
      'Extended transition period ends for high-risk AI systems embedded in regulated products covered by existing EU product legislation (Annex I).',
    articleRef: 'Art. 6(1), Annex I',
  },
];

function daysUntil(isoDate: string): number {
  const target = new Date(isoDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function timelineStatusClass(isoDate: string): string {
  const days = daysUntil(isoDate);
  if (days <= 0) return 'badge-green';
  if (days <= 180) return 'badge-red';
  if (days <= 365) return 'badge-yellow';
  return 'badge-blue';
}

function timelineStatusLabel(isoDate: string): string {
  const days = daysUntil(isoDate);
  if (days <= 0) return 'In effect';
  return `${days} days`;
}

/* ── Render ── */

function render(): string {
  // Find the next upcoming deadline for the countdown card
  const nextDeadline = EU_TIMELINE.find((e) => daysUntil(e.iso) > 0);
  const countdownHtml = nextDeadline
    ? `<div class="stat-card">
          <span class="stat-label">Next EU Deadline</span>
          <span class="stat-value" style="font-size:1.8rem;">${daysUntil(nextDeadline.iso)}</span>
          <span class="stat-sub">${escapeHtml(nextDeadline.date)} - ${escapeHtml(nextDeadline.title)}</span>
        </div>`
    : `<div class="stat-card">
          <span class="stat-label">EU AI Act</span>
          <span class="stat-value">Active</span>
          <span class="stat-sub">All deadlines passed</span>
        </div>`;

  return `
    <div class="page">
      <div class="page-header">
        <h1>Dashboard</h1>
        <button class="btn btn-primary" id="dashboard-add-system">+ Add AI System</button>
      </div>

      <div class="disclaimer-banner">
        This tool provides guidance only - it does not constitute legal advice.
        Always consult qualified legal counsel for compliance decisions.
      </div>

      <div class="stat-grid">
        <div class="stat-card">
          <span class="stat-label">AI Systems</span>
          <span class="stat-value" id="stat-systems">-</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">High Risk</span>
          <span class="stat-value" id="stat-high-risk">-</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Open Tasks</span>
          <span class="stat-value" id="stat-open-tasks">-</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Training Rate</span>
          <span class="stat-value" id="stat-training-rate">-</span>
          <span class="stat-sub" id="stat-training-sub"></span>
        </div>
        ${countdownHtml}
      </div>

      <div class="card">
        <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
          <h2 class="card-title">EU AI Act Compliance Timeline</h2>
          <button class="btn btn-secondary btn-sm" id="timeline-sources-btn">Sources</button>
        </div>
        <div class="timeline-widget">
          ${EU_TIMELINE.map(
            (entry) => `
            <div class="timeline-entry" style="display:flex;gap:1rem;align-items:flex-start;padding:0.75rem 0;border-bottom:1px solid var(--border, #e5e7eb);">
              <div style="min-width:110px;">
                <span class="badge ${timelineStatusClass(entry.iso)}">${timelineStatusLabel(entry.iso)}</span>
              </div>
              <div>
                <strong>${escapeHtml(entry.date)}</strong> - ${escapeHtml(entry.title)}
                <span class="text-muted text-sm" style="margin-left:0.5rem;">(${escapeHtml(entry.articleRef)})</span>
                <p class="text-muted text-sm" style="margin:0.25rem 0 0 0;">${escapeHtml(entry.description)}</p>
              </div>
            </div>`,
          ).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Risk Overview</h2>
        </div>
        <div class="risk-grid" id="risk-overview"></div>
      </div>

      <div class="card">
        <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
          <h2 class="card-title">Tasks</h2>
          <span class="text-muted text-sm" id="task-count"></span>
        </div>
        <div id="next-actions"></div>
      </div>
    </div>`;
}

/* ── Sources Modal ── */

function showSourcesModal(): void {
  const body = `
    <p class="text-muted text-sm">These timeline dates are drawn from the official EU AI Act legislation and EU Commission publications.</p>
    <div class="table-wrap" style="margin-top:1rem;">
      <table>
        <thead>
          <tr>
            <th>Source</th>
            <th>Reference</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>EU AI Act full text</td>
            <td>Regulation (EU) 2024/1689, Official Journal of the European Union, 12 July 2024</td>
          </tr>
          <tr>
            <td>Timeline provisions</td>
            <td>Article 113 - Transitional provisions and entry into force dates</td>
          </tr>
          <tr>
            <td>Prohibited practices</td>
            <td>Article 5 - effective 2 February 2025 (6 months after entry into force)</td>
          </tr>
          <tr>
            <td>GPAI model obligations</td>
            <td>Title V, Chapter 1 - effective 2 August 2025 (12 months after entry into force)</td>
          </tr>
          <tr>
            <td>High-risk systems (Annex III)</td>
            <td>Article 6(2), Annex III - effective 2 August 2026 (24 months after entry into force)</td>
          </tr>
          <tr>
            <td>High-risk systems (Annex I)</td>
            <td>Article 6(1), Annex I - effective 2 August 2027 (36 months after entry into force)</td>
          </tr>
          <tr>
            <td>EU Commission AI Act page</td>
            <td>https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai</td>
          </tr>
          <tr>
            <td>EUR-Lex</td>
            <td>https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="text-muted text-sm" style="margin-top:1rem;">Last updated: February 2025. Timeline dates based on Article 113 of Regulation (EU) 2024/1689.</p>
  `;
  openModal('EU AI Act Timeline Sources', body);
}

/* ── Init ── */

async function init(): Promise<void> {
  // Wire up "Add AI System" button
  const addBtn = document.getElementById('dashboard-add-system');
  addBtn?.addEventListener('click', () => navigateTo('/inventory'));

  // Wire up Sources button
  document.getElementById('timeline-sources-btn')?.addEventListener('click', showSourcesModal);

  // Fetch data in parallel
  const [allSystems, allTasks, allCompletions] = await Promise.all([
    db.aiSystems.toArray() as Promise<AISystem[]>,
    db.tasks.toArray() as Promise<Task[]>,
    db.trainingCompletions.toArray() as Promise<TrainingCompletion[]>,
  ]);

  // ── Stat: AI Systems ──
  const systemsEl = document.getElementById('stat-systems');
  if (systemsEl) systemsEl.textContent = String(allSystems.length);

  // ── Stat: High Risk ──
  const highRiskCount = allSystems.filter((s) => s.riskCategory === 'high-risk').length;
  const highRiskEl = document.getElementById('stat-high-risk');
  if (highRiskEl) highRiskEl.textContent = String(highRiskCount);

  // ── Stat: Open Tasks ──
  const openTasks = allTasks.filter((t) => t.status !== 'complete');
  const openTasksEl = document.getElementById('stat-open-tasks');
  if (openTasksEl) openTasksEl.textContent = String(openTasks.length);

  // ── Stat: Training Rate ──
  const trainingRateEl = document.getElementById('stat-training-rate');
  const trainingSubEl = document.getElementById('stat-training-sub');

  if (allCompletions.length === 0) {
    if (trainingRateEl) trainingRateEl.textContent = '0%';
    if (trainingSubEl) trainingSubEl.textContent = '0 / 0 users';
  } else {
    const userModules = new Map<string, Set<string>>();
    for (const c of allCompletions) {
      if (!userModules.has(c.userName)) {
        userModules.set(c.userName, new Set());
      }
      userModules.get(c.userName)!.add(c.moduleId);
    }

    const totalUsers = userModules.size;
    let fullyTrained = 0;
    for (const modules of userModules.values()) {
      if (REQUIRED_MODULES.every((m) => modules.has(m))) {
        fullyTrained++;
      }
    }

    const rate = totalUsers > 0 ? Math.round((fullyTrained / totalUsers) * 100) : 0;
    if (trainingRateEl) trainingRateEl.textContent = `${rate}%`;
    if (trainingSubEl) trainingSubEl.textContent = `${fullyTrained} / ${totalUsers} users`;
  }

  // ── Risk Overview ──
  const riskOverviewEl = document.getElementById('risk-overview');
  if (riskOverviewEl) {
    const counts: Record<string, number> = {};
    for (const cat of RISK_CATEGORIES) {
      counts[cat] = 0;
    }
    for (const s of allSystems) {
      if (s.riskCategory && counts[s.riskCategory] !== undefined) {
        counts[s.riskCategory]++;
      }
    }

    riskOverviewEl.innerHTML = RISK_CATEGORIES.map((cat) => {
      const badgeClass = riskBadgeClass(cat);
      const label = riskLabel(cat);
      return `
        <div class="risk-card">
          <span class="risk-count ${badgeClass}">${counts[cat]}</span>
          <span class="risk-label">${label}</span>
        </div>`;
    }).join('');
  }

  // ── Tasks ──
  const nextActionsEl = document.getElementById('next-actions');
  const taskCountEl = document.getElementById('task-count');
  if (nextActionsEl) {
    const pendingTasks = allTasks
      .filter((t) => t.status !== 'complete')
      .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2));

    const completedCount = allTasks.filter((t) => t.status === 'complete').length;
    if (taskCountEl) taskCountEl.textContent = `${pendingTasks.length} open, ${completedCount} done`;

    if (pendingTasks.length === 0) {
      nextActionsEl.innerHTML = '<div class="empty-state">No pending tasks. You\'re all caught up!</div>';
    } else {
      nextActionsEl.innerHTML = pendingTasks.map((task) => renderTaskItem(task)).join('');

      for (const task of pendingTasks) {
        document.getElementById(`task-edit-${task.id}`)?.addEventListener('click', () => openTaskEditModal(task));
        document.getElementById(`task-done-${task.id}`)?.addEventListener('click', async () => {
          await db.tasks.update(task.id!, { status: 'complete' as const, completedAt: new Date().toISOString() });
          showToast('Task marked complete.', 'success');
          const refreshed = await db.tasks.toArray();
          refreshTaskList(refreshed, nextActionsEl, taskCountEl);
        });
      }
    }
  }
}

function renderTaskItem(task: Task): string {
  const badgeClass =
    task.priority === 'high' ? 'badge-red' : task.priority === 'medium' ? 'badge-yellow' : 'badge-green';
  const ownerStr = task.owner ? ` | ${escapeHtml(task.owner)}` : '';

  return `
    <div class="stat-card" style="margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <span class="badge ${badgeClass}">${task.priority}</span>
        ${escapeHtml(task.title)}
        <span class="text-muted text-sm">${task.dueDate ? `Due: ${escapeHtml(task.dueDate)}` : ''}${ownerStr}</span>
      </div>
      <div class="btn-group">
        <button class="btn btn-secondary btn-sm" id="task-edit-${task.id}">Edit</button>
        <button class="btn btn-primary btn-sm" id="task-done-${task.id}">Done</button>
      </div>
    </div>`;
}

function openTaskEditModal(task: Task): void {
  const body = `
    <form id="task-edit-form">
      <div class="form-group">
        <label class="form-label" for="task-owner">Owner</label>
        <input class="form-input" id="task-owner" type="text" value="${escapeHtml(task.owner ?? '')}" placeholder="Assign an owner" />
      </div>
      <div class="form-group">
        <label class="form-label" for="task-due">Due Date</label>
        <input class="form-input" id="task-due" type="date" value="${escapeHtml(task.dueDate ?? '')}" />
      </div>
      <div class="form-group">
        <label class="form-label" for="task-priority">Priority</label>
        <select class="form-select" id="task-priority">
          <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
          <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
          <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
        </select>
      </div>
      <p class="text-muted text-sm">${escapeHtml(task.description)}</p>
    </form>
  `;
  const footer = `
    <button class="btn btn-secondary" id="task-edit-cancel">Cancel</button>
    <button class="btn btn-primary" id="task-edit-save">Save</button>
  `;
  const modal = openModal('Edit Task', body, footer);

  modal.querySelector('#task-edit-cancel')?.addEventListener('click', closeModal);
  modal.querySelector('#task-edit-save')?.addEventListener('click', async () => {
    const owner = (modal.querySelector<HTMLInputElement>('#task-owner')?.value ?? '').trim();
    const dueDate = modal.querySelector<HTMLInputElement>('#task-due')?.value ?? '';
    const priority = (modal.querySelector<HTMLSelectElement>('#task-priority')?.value ?? 'medium') as Task['priority'];

    await db.tasks.update(task.id!, { owner, dueDate, priority });
    showToast('Task updated.', 'success');
    closeModal();

    // Refresh task list in place
    const refreshed = await db.tasks.toArray();
    const nextActionsEl = document.getElementById('next-actions');
    const taskCountEl = document.getElementById('task-count');
    if (nextActionsEl) refreshTaskList(refreshed, nextActionsEl, taskCountEl);
  });
}

function refreshTaskList(allTasks: Task[], container: HTMLElement, countEl: HTMLElement | null): void {
  const pendingTasks = allTasks
    .filter((t) => t.status !== 'complete')
    .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2));

  const completedCount = allTasks.filter((t) => t.status === 'complete').length;
  if (countEl) countEl.textContent = `${pendingTasks.length} open, ${completedCount} done`;

  if (pendingTasks.length === 0) {
    container.innerHTML = '<div class="empty-state">No pending tasks. You\'re all caught up!</div>';
    return;
  }

  container.innerHTML = pendingTasks.map((task) => renderTaskItem(task)).join('');

  for (const task of pendingTasks) {
    document.getElementById(`task-edit-${task.id}`)?.addEventListener('click', () => openTaskEditModal(task));
    document.getElementById(`task-done-${task.id}`)?.addEventListener('click', async () => {
      await db.tasks.update(task.id!, { status: 'complete' as const, completedAt: new Date().toISOString() });
      showToast('Task marked complete.', 'success');
      const refreshed = await db.tasks.toArray();
      refreshTaskList(refreshed, container, countEl);
    });
  }
}

export default { render, init };
