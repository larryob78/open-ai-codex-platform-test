import { db, addAuditEntry } from '../db';
import type { Vendor } from '../types';
import { escapeHtml } from '../utils/escapeHtml';
import { showToast } from '../components/toast';
import { openModal, closeModal } from '../components/modal';
import { maxLength } from '../utils/validate';

function formatDate(iso: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function statusBadgeClass(status: Vendor['dueDiligenceStatus']): string {
  switch (status) {
    case 'pending':
      return 'badge-yellow';
    case 'in-progress':
      return 'badge-blue';
    case 'complete':
      return 'badge-green';
    default:
      return 'badge-yellow';
  }
}

function statusLabel(status: Vendor['dueDiligenceStatus']): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'in-progress':
      return 'In Progress';
    case 'complete':
      return 'Complete';
    default:
      return status;
  }
}

/* ── Vendor form modal ── */

function openVendorForm(existing?: Vendor): void {
  const isEdit = !!existing;
  const title = isEdit ? 'Edit Vendor' : 'Add Vendor';

  const body = `
    <form id="vendor-form">
      <div class="form-group">
        <label class="form-label" for="vendor-name">Name <span style="color:var(--color-danger)">*</span></label>
        <input class="form-input" id="vendor-name" type="text" required value="${escapeHtml(existing?.name ?? '')}" placeholder="Vendor name" />
      </div>
      <div class="form-group">
        <label class="form-label" for="vendor-contact">Contact</label>
        <input class="form-input" id="vendor-contact" type="text" value="${escapeHtml(existing?.contact ?? '')}" placeholder="Contact person" />
      </div>
      <div class="form-group">
        <label class="form-label" for="vendor-email">Email</label>
        <input class="form-input" id="vendor-email" type="email" value="${escapeHtml(existing?.email ?? '')}" placeholder="vendor@example.com" />
      </div>
      <div class="form-group">
        <label class="form-label" for="vendor-status">Due Diligence Status</label>
        <select class="form-select" id="vendor-status">
          <option value="pending" ${existing?.dueDiligenceStatus === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="in-progress" ${existing?.dueDiligenceStatus === 'in-progress' ? 'selected' : ''}>In Progress</option>
          <option value="complete" ${existing?.dueDiligenceStatus === 'complete' ? 'selected' : ''}>Complete</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="vendor-review-date">Last Review Date</label>
        <input class="form-input" id="vendor-review-date" type="date" value="${escapeHtml(existing?.lastReviewDate ?? '')}" />
      </div>
      <div class="form-group">
        <label class="form-label" for="vendor-notes">Notes</label>
        <textarea class="form-textarea" id="vendor-notes" rows="3" placeholder="Additional notes...">${escapeHtml(existing?.notes ?? '')}</textarea>
      </div>
    </form>
  `;

  const footer = `
    <div class="btn-group">
      <button class="btn btn-secondary" id="vendor-cancel">Cancel</button>
      <button class="btn btn-primary" id="vendor-save">${isEdit ? 'Update' : 'Add'} Vendor</button>
    </div>
  `;

  const modal = openModal(title, body, footer);

  modal.querySelector('#vendor-cancel')?.addEventListener('click', () => closeModal());

  modal.querySelector('#vendor-save')?.addEventListener('click', async () => {
    const nameInput = document.getElementById('vendor-name') as HTMLInputElement;
    const contactInput = document.getElementById('vendor-contact') as HTMLInputElement;
    const emailInput = document.getElementById('vendor-email') as HTMLInputElement;
    const statusSelect = document.getElementById('vendor-status') as HTMLSelectElement;
    const reviewDateInput = document.getElementById('vendor-review-date') as HTMLInputElement;
    const notesTextarea = document.getElementById('vendor-notes') as HTMLTextAreaElement;

    const name = nameInput.value.trim();
    if (!name) {
      showToast('Vendor name is required.', 'warning');
      nameInput.focus();
      return;
    }

    const nameLenErr = maxLength(name, 200, 'Vendor name');
    if (nameLenErr) {
      showToast(nameLenErr, 'warning');
      return;
    }

    const vendorData: Omit<Vendor, 'id'> = {
      name,
      contact: contactInput.value.trim(),
      email: emailInput.value.trim(),
      aiSystemIds: existing?.aiSystemIds ?? [],
      dueDiligenceStatus: statusSelect.value as Vendor['dueDiligenceStatus'],
      lastReviewDate: reviewDateInput.value,
      notes: notesTextarea.value.trim(),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    try {
      if (isEdit && existing?.id !== undefined) {
        await db.vendors.update(existing.id, vendorData);
        await addAuditEntry('update', 'vendor', 'Updated vendor: ' + name, existing.id);
        showToast('Vendor updated.', 'success');
      } else {
        const newId = await db.vendors.add(vendorData as Vendor);
        await addAuditEntry('create', 'vendor', 'Created vendor: ' + name, newId as number);
        showToast('Vendor added.', 'success');
      }
      closeModal();
      await refreshVendorTable();
    } catch (err) {
      console.error('Failed to save vendor:', err);
      showToast('Failed to save vendor.', 'error');
    }
  });
}

/* ── Delete confirmation ── */

function confirmDeleteVendor(vendor: Vendor): void {
  const body = `
    <p>Are you sure you want to delete <strong>${escapeHtml(vendor.name)}</strong>?</p>
    <p class="text-muted text-sm">This action cannot be undone.</p>
  `;
  const footer = `
    <div class="btn-group">
      <button class="btn btn-secondary" id="delete-cancel">Cancel</button>
      <button class="btn btn-danger" id="delete-confirm">Delete</button>
    </div>
  `;

  const modal = openModal('Delete Vendor', body, footer);

  modal.querySelector('#delete-cancel')?.addEventListener('click', () => closeModal());

  modal.querySelector('#delete-confirm')?.addEventListener('click', async () => {
    try {
      if (vendor.id !== undefined) {
        await db.vendors.delete(vendor.id);
        await addAuditEntry('delete', 'vendor', 'Deleted vendor: ' + vendor.name, vendor.id);
        showToast(`"${vendor.name}" deleted.`, 'success');
      }
      closeModal();
      await refreshVendorTable();
    } catch (err) {
      console.error('Failed to delete vendor:', err);
      showToast('Failed to delete vendor.', 'error');
    }
  });
}

/* ── Render vendor table ── */

function renderVendorTable(vendors: Vendor[]): string {
  if (vendors.length === 0) {
    return '<div class="empty-state">No vendors registered yet. Click "Add Vendor" to get started.</div>';
  }

  const rows = vendors
    .map(
      (v) => `
    <tr>
      <td>${escapeHtml(v.name)}</td>
      <td>${escapeHtml(v.contact)}</td>
      <td>${escapeHtml(v.email)}</td>
      <td><span class="badge ${statusBadgeClass(v.dueDiligenceStatus)}">${statusLabel(v.dueDiligenceStatus)}</span></td>
      <td>${formatDate(v.lastReviewDate)}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-secondary btn-sm" data-edit-vendor="${v.id}">Edit</button>
          <button class="btn btn-danger btn-sm" data-delete-vendor="${v.id}">Delete</button>
        </div>
      </td>
    </tr>
  `,
    )
    .join('');

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Due Diligence Status</th>
            <th>Last Review</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

/* ── Refresh table in DOM ── */

async function refreshVendorTable(): Promise<void> {
  const vendors = await db.vendors.toArray();
  const container = document.getElementById('vendor-table-container');
  if (!container) return;

  container.innerHTML = renderVendorTable(vendors);
  attachTableHandlers(vendors);
}

function attachTableHandlers(vendors: Vendor[]): void {
  // Edit buttons
  document.querySelectorAll<HTMLButtonElement>('[data-edit-vendor]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.editVendor);
      const vendor = vendors.find((v) => v.id === id);
      if (vendor) openVendorForm(vendor);
    });
  });

  // Delete buttons
  document.querySelectorAll<HTMLButtonElement>('[data-delete-vendor]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.deleteVendor);
      const vendor = vendors.find((v) => v.id === id);
      if (vendor) confirmDeleteVendor(vendor);
    });
  });
}

/* ── Render ── */

function render(): string {
  return `
    <div class="page">
      <div class="page-header">
        <h1>Vendors</h1>
        <p>Manage AI vendors and track due diligence status.</p>
      </div>

      <div class="card">
        <div class="card-header" style="display:flex; align-items:center; justify-content:space-between;">
          <h2 class="card-title">Vendor Register</h2>
          <button class="btn btn-primary" id="add-vendor-btn">+ Add Vendor</button>
        </div>
        <div style="margin-bottom:16px">
          <input class="form-input" id="vendor-search" type="search" placeholder="Search vendors..." />
        </div>
        <div id="vendor-table-container"></div>
      </div>
    </div>`;
}

/* ── Init ── */

async function init(): Promise<void> {
  // Wire up Add Vendor button
  const addBtn = document.getElementById('add-vendor-btn');
  addBtn?.addEventListener('click', () => openVendorForm());

  // Load and render vendor table
  await refreshVendorTable();

  document.getElementById('vendor-search')?.addEventListener('input', async (e) => {
    const query = (e.target as HTMLInputElement).value.toLowerCase().trim();
    const vendors = await db.vendors.toArray();
    const filtered = query
      ? vendors.filter((v) => v.name.toLowerCase().includes(query) || v.contact.toLowerCase().includes(query))
      : vendors;
    const container = document.getElementById('vendor-table-container');
    if (container) {
      container.innerHTML = renderVendorTable(filtered);
      attachTableHandlers(filtered);
    }
  });
}

export default { render, init };
