import { db } from '../db';
import type { Incident } from '../types';
import { generateIncidentPdf, downloadBlob } from '../services/exportService';
import { escapeHtml } from '../utils/escapeHtml';
import { showToast } from '../components/toast';
import { openModal, closeModal } from '../components/modal';

function formatDate(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/* ── Badge helpers ── */

function severityBadge(severity: Incident['severity']): string {
  const map: Record<Incident['severity'], string> = {
    critical: 'badge-red',
    high: 'badge-yellow',
    medium: 'badge-blue',
    low: 'badge-gray',
  };
  return `<span class="badge ${map[severity]}">${severity}</span>`;
}

function statusBadge(status: Incident['status']): string {
  const map: Record<Incident['status'], string> = {
    open: 'badge-red',
    investigating: 'badge-yellow',
    resolved: 'badge-green',
    closed: 'badge-gray',
  };
  return `<span class="badge ${map[status]}">${status}</span>`;
}

/* ── Render ── */

function render(): string {
  return `
    <div class="page">
      <div class="page-header">
        <h1>Incidents</h1>
        <p>Report and track AI-related incidents.</p>
      </div>

      <div class="card">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h2 class="card-title">Incident Register</h2>
          <button class="btn btn-primary" id="report-incident-btn">Report Incident</button>
        </div>
        <div id="incidents-table"></div>
      </div>
    </div>`;
}

/* ── Init ── */

async function init(): Promise<void> {
  await renderTable();

  document.getElementById('report-incident-btn')?.addEventListener('click', () => openForm());
}

/* ── Table rendering ── */

async function renderTable(): Promise<void> {
  const container = document.getElementById('incidents-table');
  if (!container) return;

  const incidents = await db.incidents.orderBy('id').reverse().toArray();

  if (incidents.length === 0) {
    container.innerHTML =
      '<div class="empty-state">No incidents reported yet. Click &ldquo;Report Incident&rdquo; to log one.</div>';
    return;
  }

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Reported By</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${incidents.map((inc) => renderRow(inc)).join('')}
        </tbody>
      </table>
    </div>`;

  // Wire action buttons
  for (const inc of incidents) {
    document.getElementById(`view-incident-${inc.id}`)?.addEventListener('click', () => viewIncident(inc));
    document.getElementById(`edit-incident-${inc.id}`)?.addEventListener('click', () => openForm(inc));
    document.getElementById(`export-incident-${inc.id}`)?.addEventListener('click', () => exportPdf(inc.id!));
    document.getElementById(`delete-incident-${inc.id}`)?.addEventListener('click', () => deleteIncident(inc.id!));
  }
}

function renderRow(inc: Incident): string {
  return `
    <tr>
      <td>${escapeHtml(inc.title)}</td>
      <td>${severityBadge(inc.severity)}</td>
      <td>${statusBadge(inc.status)}</td>
      <td>${escapeHtml(inc.reportedBy)}</td>
      <td>${formatDate(inc.reportedAt)}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-secondary" id="view-incident-${inc.id}">View</button>
          <button class="btn btn-sm btn-secondary" id="edit-incident-${inc.id}">Edit</button>
          <button class="btn btn-sm btn-secondary" id="export-incident-${inc.id}">Export PDF</button>
          <button class="btn btn-sm btn-danger" id="delete-incident-${inc.id}">Delete</button>
        </div>
      </td>
    </tr>`;
}

/* ── View modal ── */

function viewIncident(inc: Incident): void {
  const systemLine = inc.relatedSystemId ? `<p><strong>Related System ID:</strong> ${inc.relatedSystemId}</p>` : '';

  const resolutionSection =
    inc.status === 'resolved' || inc.status === 'closed'
      ? `
        <h4 style="margin-top:1rem;">Resolution</h4>
        <p><strong>Root Cause:</strong> ${escapeHtml(inc.rootCause || 'N/A')}</p>
        <p><strong>Actions Taken:</strong> ${escapeHtml(inc.actionsTaken || 'N/A')}</p>
        <p><strong>Resolved At:</strong> ${inc.resolvedAt ? formatDate(inc.resolvedAt) : 'N/A'}</p>`
      : '';

  const body = `
    <p><strong>Title:</strong> ${escapeHtml(inc.title)}</p>
    <p><strong>Severity:</strong> ${severityBadge(inc.severity)}</p>
    <p><strong>Status:</strong> ${statusBadge(inc.status)}</p>
    <p><strong>Reported By:</strong> ${escapeHtml(inc.reportedBy)}</p>
    <p><strong>Reported At:</strong> ${formatDate(inc.reportedAt)}</p>
    ${systemLine}
    <h4 style="margin-top:1rem;">Description</h4>
    <p>${escapeHtml(inc.description)}</p>
    ${resolutionSection}`;

  openModal('Incident Details', body);
}

/* ── Form modal (create / edit) ── */

async function openForm(existing?: Incident): Promise<void> {
  const isEdit = !!existing;
  const title = isEdit ? 'Edit Incident' : 'Report Incident';

  const systems = await db.aiSystems.toArray();
  const systemOptions = systems
    .map(
      (s) =>
        `<option value="${s.id}" ${existing?.relatedSystemId === s.id ? 'selected' : ''}>${escapeHtml(s.name)}</option>`,
    )
    .join('');

  const showResolution = existing?.status === 'resolved' || existing?.status === 'closed';

  const body = `
    <form id="incident-form">
      <div class="form-group">
        <label class="form-label" for="inc-title">Title *</label>
        <input class="form-input" id="inc-title" type="text" required
          value="${escapeHtml(existing?.title ?? '')}" />
      </div>

      <div class="form-group">
        <label class="form-label" for="inc-description">Description *</label>
        <textarea class="form-textarea" id="inc-description" rows="4" required>${escapeHtml(existing?.description ?? '')}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label" for="inc-severity">Severity</label>
        <select class="form-select" id="inc-severity">
          ${(['low', 'medium', 'high', 'critical'] as const)
            .map((v) => `<option value="${v}" ${existing?.severity === v ? 'selected' : ''}>${v}</option>`)
            .join('')}
        </select>
      </div>

      <div class="form-group">
        <label class="form-label" for="inc-status">Status</label>
        <select class="form-select" id="inc-status">
          ${(['open', 'investigating', 'resolved', 'closed'] as const)
            .map((v) => `<option value="${v}" ${existing?.status === v ? 'selected' : ''}>${v}</option>`)
            .join('')}
        </select>
      </div>

      <div class="form-group">
        <label class="form-label" for="inc-reportedBy">Reported By *</label>
        <input class="form-input" id="inc-reportedBy" type="text" required
          value="${escapeHtml(existing?.reportedBy ?? '')}" />
      </div>

      <div class="form-group">
        <label class="form-label" for="inc-reportedAt">Reported At</label>
        <input class="form-input" id="inc-reportedAt" type="date"
          value="${existing?.reportedAt?.slice(0, 10) ?? todayIso()}" />
      </div>

      <div id="resolution-fields" style="display:${showResolution ? 'block' : 'none'};">
        <div class="form-group">
          <label class="form-label" for="inc-rootCause">Root Cause</label>
          <textarea class="form-textarea" id="inc-rootCause" rows="3">${escapeHtml(existing?.rootCause ?? '')}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="inc-actionsTaken">Actions Taken</label>
          <textarea class="form-textarea" id="inc-actionsTaken" rows="3">${escapeHtml(existing?.actionsTaken ?? '')}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="inc-resolvedAt">Resolved At</label>
          <input class="form-input" id="inc-resolvedAt" type="date"
            value="${existing?.resolvedAt?.slice(0, 10) ?? ''}" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="inc-relatedSystem">Related AI System (optional)</label>
        <select class="form-select" id="inc-relatedSystem">
          <option value="">-- None --</option>
          ${systemOptions}
        </select>
      </div>
    </form>`;

  const footer = `
    <button class="btn btn-secondary" id="incident-cancel">Cancel</button>
    <button class="btn btn-primary" id="incident-save">${isEdit ? 'Save Changes' : 'Report Incident'}</button>`;

  const modal = openModal(title, body, footer);

  // Toggle resolution fields when status changes
  const statusSelect = modal.querySelector<HTMLSelectElement>('#inc-status');
  const resolutionFields = modal.querySelector<HTMLElement>('#resolution-fields');
  statusSelect?.addEventListener('change', () => {
    if (!resolutionFields) return;
    const show = statusSelect.value === 'resolved' || statusSelect.value === 'closed';
    resolutionFields.style.display = show ? 'block' : 'none';
  });

  // Cancel
  modal.querySelector('#incident-cancel')?.addEventListener('click', closeModal);

  // Save
  modal.querySelector('#incident-save')?.addEventListener('click', async () => {
    const titleVal = (modal.querySelector<HTMLInputElement>('#inc-title')?.value ?? '').trim();
    const descVal = (modal.querySelector<HTMLTextAreaElement>('#inc-description')?.value ?? '').trim();
    const reportedByVal = (modal.querySelector<HTMLInputElement>('#inc-reportedBy')?.value ?? '').trim();

    if (!titleVal || !descVal || !reportedByVal) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    const severity = (modal.querySelector<HTMLSelectElement>('#inc-severity')?.value ?? 'low') as Incident['severity'];
    const status = (modal.querySelector<HTMLSelectElement>('#inc-status')?.value ?? 'open') as Incident['status'];
    const reportedAt = modal.querySelector<HTMLInputElement>('#inc-reportedAt')?.value ?? todayIso();
    const rootCause = (modal.querySelector<HTMLTextAreaElement>('#inc-rootCause')?.value ?? '').trim();
    const actionsTaken = (modal.querySelector<HTMLTextAreaElement>('#inc-actionsTaken')?.value ?? '').trim();
    const resolvedAt = modal.querySelector<HTMLInputElement>('#inc-resolvedAt')?.value ?? '';
    const relatedSystemRaw = modal.querySelector<HTMLSelectElement>('#inc-relatedSystem')?.value ?? '';
    const relatedSystemId = relatedSystemRaw ? Number(relatedSystemRaw) : undefined;

    const record: Incident = {
      title: titleVal,
      description: descVal,
      severity,
      status,
      reportedBy: reportedByVal,
      reportedAt,
      rootCause,
      actionsTaken,
      resolvedAt: resolvedAt || undefined,
      relatedSystemId,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    if (isEdit && existing?.id) {
      await db.incidents.update(existing.id, record);
      showToast('Incident updated.', 'success');
    } else {
      await db.incidents.add(record);
      showToast('Incident reported.', 'success');
    }

    closeModal();
    await renderTable();
  });
}

/* ── Export PDF ── */

async function exportPdf(id: number): Promise<void> {
  try {
    const blob = await generateIncidentPdf(id);
    downloadBlob(blob, 'incident-report.pdf');
    showToast('PDF exported.', 'success');
  } catch (err) {
    showToast(`Export failed: ${String(err)}`, 'error');
  }
}

/* ── Delete ── */

function deleteIncident(id: number): void {
  const body = `
    <p>Are you sure you want to delete this incident?</p>
    <p class="text-muted text-sm">This action cannot be undone.</p>
  `;
  const footer = `
    <div class="btn-group">
      <button class="btn btn-secondary" id="delete-inc-cancel">Cancel</button>
      <button class="btn btn-danger" id="delete-inc-confirm">Delete</button>
    </div>
  `;
  const modal = openModal('Delete Incident', body, footer);

  modal.querySelector('#delete-inc-cancel')?.addEventListener('click', () => closeModal());
  modal.querySelector('#delete-inc-confirm')?.addEventListener('click', async () => {
    await db.incidents.delete(id);
    showToast('Incident deleted.', 'success');
    closeModal();
    await renderTable();
  });
}

export default { render, init };
