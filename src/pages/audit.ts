import { db } from '../db';
import type { AuditEntry } from '../types';
import { escapeHtml } from '../utils/escapeHtml';
import { showToast } from '../components/toast';

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-IE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function actionBadge(action: AuditEntry['action']): string {
  const map: Record<string, string> = {
    create: 'badge-green',
    update: 'badge-blue',
    delete: 'badge-red',
    'status-change': 'badge-yellow',
    import: 'badge-gray',
    export: 'badge-gray',
  };
  return `<span class="badge ${map[action] ?? 'badge-gray'}">${escapeHtml(action)}</span>`;
}

function renderTableHtml(entries: AuditEntry[]): string {
  if (entries.length === 0) {
    return '<div class="empty-state">No audit entries yet.</div>';
  }

  const rows = entries
    .map(
      (e) => `
    <tr>
      <td>${formatTimestamp(e.timestamp)}</td>
      <td>${actionBadge(e.action)}</td>
      <td>${escapeHtml(e.entity)}</td>
      <td>${escapeHtml(e.details)}</td>
    </tr>`,
    )
    .join('');

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Action</th>
            <th>Entity</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function toCsv(entries: AuditEntry[]): string {
  const header = 'Timestamp,Action,Entity,Details';
  const rows = entries.map((e) => `"${e.timestamp}","${e.action}","${e.entity}","${e.details.replace(/"/g, '""')}"`);
  return [header, ...rows].join('\n');
}

/* ── Render ── */

function render(): string {
  return `
    <div class="page">
      <div class="page-header">
        <h1>Audit Log</h1>
        <p>Track all changes made within AI Comply.</p>
      </div>

      <div class="card">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div class="btn-group">
            <button class="btn btn-primary btn-sm audit-filter active" data-filter="">All</button>
            <button class="btn btn-secondary btn-sm audit-filter" data-filter="create">Creates</button>
            <button class="btn btn-secondary btn-sm audit-filter" data-filter="update">Updates</button>
            <button class="btn btn-secondary btn-sm audit-filter" data-filter="delete">Deletes</button>
            <button class="btn btn-secondary btn-sm audit-filter" data-filter="status-change">Status Changes</button>
          </div>
          <button class="btn btn-secondary btn-sm" id="audit-export-csv">Export CSV</button>
        </div>
        <div id="audit-table-container"></div>
      </div>
    </div>`;
}

/* ── Init ── */

let allEntries: AuditEntry[] = [];
let currentFilter = '';

async function loadEntries(): Promise<void> {
  allEntries = await db.auditLog.orderBy('id').reverse().toArray();
}

function applyFilter(): void {
  const filtered = currentFilter ? allEntries.filter((e) => e.action === currentFilter) : allEntries;
  const container = document.getElementById('audit-table-container');
  if (container) container.innerHTML = renderTableHtml(filtered);
}

async function init(): Promise<void> {
  await loadEntries();
  applyFilter();

  // Filter buttons
  document.querySelectorAll<HTMLButtonElement>('.audit-filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.audit-filter').forEach((b) => {
        b.classList.remove('active', 'btn-primary');
        b.classList.add('btn-secondary');
      });
      btn.classList.add('active', 'btn-primary');
      btn.classList.remove('btn-secondary');
      currentFilter = btn.dataset.filter ?? '';
      applyFilter();
    });
  });

  // CSV export
  document.getElementById('audit-export-csv')?.addEventListener('click', () => {
    const csv = toCsv(allEntries);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-log.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Audit log exported.', 'success');
  });
}

export default { render, init };
