import { db } from '../db';
import { riskLabel, riskBadgeClass } from '../services/classifier';
import { navigateTo } from '../router';
import type { AISystem, RiskCategory, Task, TrainingCompletion } from '../types';

const REQUIRED_MODULES = ['safe-prompting', 'privacy-basics', 'human-oversight'] as const;

const RISK_CATEGORIES: RiskCategory[] = [
  'prohibited',
  'high-risk',
  'limited-risk',
  'minimal-risk',
];

const PRIORITY_ORDER: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

/* ── Render ── */

function render(): string {
  return `
    <div class="page">
      <div class="page-header">
        <h1>Dashboard</h1>
        <button class="btn btn-primary" id="dashboard-add-system">+ Add AI System</button>
      </div>

      <div class="disclaimer-banner">
        This tool provides guidance only &mdash; it does not constitute legal advice.
        Always consult qualified legal counsel for compliance decisions.
      </div>

      <div class="stat-grid">
        <div class="stat-card">
          <span class="stat-label">AI Systems</span>
          <span class="stat-value" id="stat-systems">&mdash;</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">High Risk</span>
          <span class="stat-value" id="stat-high-risk">&mdash;</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Open Tasks</span>
          <span class="stat-value" id="stat-open-tasks">&mdash;</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Training Rate</span>
          <span class="stat-value" id="stat-training-rate">&mdash;</span>
          <span class="stat-sub" id="stat-training-sub"></span>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Risk Overview</h2>
        </div>
        <div class="risk-grid" id="risk-overview"></div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Next Actions</h2>
        </div>
        <div id="next-actions"></div>
      </div>
    </div>`;
}

/* ── Init ── */

async function init(): Promise<void> {
  // Wire up "Add AI System" button
  const addBtn = document.getElementById('dashboard-add-system');
  addBtn?.addEventListener('click', () => navigateTo('/inventory'));

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
  const highRiskCount = allSystems.filter(
    (s) => s.riskCategory === 'high-risk',
  ).length;
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
    // Gather unique users
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

  // ── Next Actions ──
  const nextActionsEl = document.getElementById('next-actions');
  if (nextActionsEl) {
    const pendingTasks = allTasks
      .filter((t) => t.status !== 'complete')
      .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2))
      .slice(0, 5);

    if (pendingTasks.length === 0) {
      nextActionsEl.innerHTML =
        '<div class="empty-state">No pending tasks. You\'re all caught up!</div>';
    } else {
      nextActionsEl.innerHTML = pendingTasks
        .map((task) => renderTaskItem(task))
        .join('');

      // Attach click handlers
      for (const task of pendingTasks) {
        const el = document.getElementById(`next-action-${task.id}`);
        el?.addEventListener('click', () => navigateTo('/obligations'));
      }
    }
  }
}

function renderTaskItem(task: Task): string {
  const badgeClass =
    task.priority === 'high'
      ? 'badge-red'
      : task.priority === 'medium'
        ? 'badge-yellow'
        : 'badge-green';

  return `
    <div class="stat-card" id="next-action-${task.id}" style="cursor:pointer; margin-bottom:0.5rem;">
      <span class="stat-label">
        <span class="badge ${badgeClass}">${task.priority}</span>
        ${escapeHtml(task.title)}
      </span>
      <span class="stat-sub">${task.dueDate ? `Due: ${escapeHtml(task.dueDate)}` : ''}</span>
    </div>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default { render, init };
