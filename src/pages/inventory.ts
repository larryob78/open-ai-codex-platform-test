import { db } from '../db';
import type { AISystem, PageModule } from '../types';
import {
  DATA_CATEGORIES,
  AFFECTED_USERS,
  USE_CASES,
  DOMAINS,
  DEPLOYMENT_TYPES,
  DOMAIN_LABELS,
  USE_CASE_LABELS,
} from '../types';
import { classifySystem, riskLabel, riskBadgeClass, computeCompleteness } from '../services/classifier';
import { generateTasksForSystem } from '../services/taskGenerator';
import { showToast } from '../components/toast';
import { openModal, closeModal } from '../components/modal';

/* ── Helpers ── */

let systems: AISystem[] = [];

const STEP_TITLES = ['Basic Info', 'Technical', 'Data & Users', 'Use & Domain', 'Oversight'];

const STATUS_BADGE: Record<string, string> = {
  draft: 'badge-gray',
  active: 'badge-green',
  archived: 'badge-yellow',
};

function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ── Render: list view ── */

function renderTable(): string {
  if (systems.length === 0) {
    return `
      <div class="empty-state">
        <h3>No AI Systems Registered</h3>
        <p>Click "Add AI System" to register your first AI system and classify its risk.</p>
      </div>
    `;
  }

  const rows = systems
    .map(
      (s) => `
      <tr>
        <td>${escapeHtml(s.name)}</td>
        <td><span class="badge ${riskBadgeClass(s.riskCategory ?? 'unknown')}">${riskLabel(s.riskCategory ?? 'unknown')}</span></td>
        <td><span class="badge ${STATUS_BADGE[s.status] ?? 'badge-gray'}">${statusLabel(s.status)}</span></td>
        <td>${escapeHtml(s.department || '-')}</td>
        <td>
          <div class="btn-group">
            <button class="btn btn-sm btn-secondary" data-action="view" data-id="${s.id}">View</button>
            <button class="btn btn-sm btn-primary" data-action="edit" data-id="${s.id}">Edit</button>
            <button class="btn btn-sm btn-danger" data-action="delete" data-id="${s.id}">Delete</button>
          </div>
        </td>
      </tr>`,
    )
    .join('');

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Risk Category</th>
            <th>Status</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

/* ── Render: stepper ── */

function renderStepper(currentStep: number): string {
  return `
    <div class="stepper">
      ${STEP_TITLES.map(
        (title, i) => `
        <div class="stepper-step${i === currentStep ? ' active' : ''}${i < currentStep ? ' completed' : ''}">
          <span class="stepper-num">${i + 1}</span>
          <span>${title}</span>
        </div>
        ${i < STEP_TITLES.length - 1 ? '<div class="stepper-line"></div>' : ''}`,
      ).join('')}
    </div>
  `;
}

/* ── Render: wizard body ── */

function renderWizardBody(data: Partial<AISystem>): string {
  const checked = (arr: string[] | undefined, val: string) => (arr?.includes(val) ? 'checked' : '');
  const isChecked = (val: boolean | undefined) => (val ? 'checked' : '');
  const sel = (a: string | undefined, b: string) => (a === b ? 'checked' : '');

  return `
    ${renderStepper(0)}

    <!-- Step 1: Basic Info -->
    <div class="wizard-step" data-step="0">
      <div class="form-group">
        <label class="form-label" for="wiz-name">Name <span style="color:var(--danger)">*</span></label>
        <input class="form-input" id="wiz-name" type="text" value="${escapeHtml(data.name ?? '')}" required />
        <span class="form-hint">A short, descriptive name for the AI system.</span>
      </div>
      <div class="form-group">
        <label class="form-label" for="wiz-description">Description</label>
        <textarea class="form-textarea" id="wiz-description" rows="3">${escapeHtml(data.description ?? '')}</textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="wiz-owner">Owner</label>
          <input class="form-input" id="wiz-owner" type="text" value="${escapeHtml(data.owner ?? '')}" />
        </div>
        <div class="form-group">
          <label class="form-label" for="wiz-department">Department</label>
          <input class="form-input" id="wiz-department" type="text" value="${escapeHtml(data.department ?? '')}" />
        </div>
      </div>
    </div>

    <!-- Step 2: Technical -->
    <div class="wizard-step" data-step="1" style="display:none">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="wiz-vendor">Vendor</label>
          <input class="form-input" id="wiz-vendor" type="text" value="${escapeHtml(data.vendor ?? '')}" />
        </div>
        <div class="form-group">
          <label class="form-label" for="wiz-model">Model</label>
          <input class="form-input" id="wiz-model" type="text" value="${escapeHtml(data.model ?? '')}" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="wiz-provider">Provider</label>
        <input class="form-input" id="wiz-provider" type="text" value="${escapeHtml(data.provider ?? '')}" />
      </div>
      <div class="form-group">
        <label class="form-label">Deployment Type</label>
        <div class="checkbox-group">
          ${DEPLOYMENT_TYPES.map(
            (dt) => `
            <label class="checkbox-label">
              <input type="radio" name="wiz-deploymentType" value="${dt}" ${sel(data.deploymentType, dt)} />
              ${dt === 'saas' ? 'SaaS' : dt === 'in-house' ? 'In-house' : 'On-device'}
            </label>`,
          ).join('')}
        </div>
      </div>
    </div>

    <!-- Step 3: Data & Users -->
    <div class="wizard-step" data-step="2" style="display:none">
      <div class="form-group">
        <label class="form-label">Data Categories</label>
        <div class="checkbox-group">
          ${DATA_CATEGORIES.map(
            (cat) => `
            <label class="checkbox-label">
              <input type="checkbox" name="wiz-dataCategories" value="${cat}" ${checked(data.dataCategories, cat)} />
              ${cat.charAt(0).toUpperCase() + cat.slice(1)}
            </label>`,
          ).join('')}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Affected Users</label>
        <div class="checkbox-group">
          ${AFFECTED_USERS.map(
            (u) => `
            <label class="checkbox-label">
              <input type="checkbox" name="wiz-affectedUsers" value="${u}" ${checked(data.affectedUsers, u)} />
              ${u.charAt(0).toUpperCase() + u.slice(1)}
            </label>`,
          ).join('')}
        </div>
      </div>
    </div>

    <!-- Step 4: Use & Domain -->
    <div class="wizard-step" data-step="3" style="display:none">
      <div class="form-group">
        <label class="form-label">Use Cases</label>
        <div class="checkbox-group">
          ${USE_CASES.map(
            (uc) => `
            <label class="checkbox-label">
              <input type="checkbox" name="wiz-useCases" value="${uc}" ${checked(data.useCases, uc)} />
              ${USE_CASE_LABELS[uc] ?? uc}
            </label>`,
          ).join('')}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Domains</label>
        <div class="checkbox-group">
          ${DOMAINS.map(
            (d) => `
            <label class="checkbox-label">
              <input type="checkbox" name="wiz-domains" value="${d}" ${checked(data.domains, d)} />
              ${DOMAIN_LABELS[d] ?? d}
            </label>`,
          ).join('')}
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Biometric Identification</label>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" id="wiz-biometric" ${isChecked(data.biometricIdentification)} />
              Involves biometric identification
            </label>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Emotion Inference</label>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" id="wiz-emotion" ${isChecked(data.emotionInference)} />
              Involves emotion inference
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 5: Oversight -->
    <div class="wizard-step" data-step="4" style="display:none">
      <div class="form-group">
        <label class="form-label">Human Oversight</label>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input type="radio" name="wiz-humanOversight" value="yes" ${data.humanOversight === true ? 'checked' : ''} />
            Yes
          </label>
          <label class="checkbox-label">
            <input type="radio" name="wiz-humanOversight" value="no" ${data.humanOversight === false ? 'checked' : ''} />
            No
          </label>
        </div>
      </div>
      <div class="form-group" id="wiz-oversight-desc-group" style="display:${data.humanOversight ? 'block' : 'none'}">
        <label class="form-label" for="wiz-oversightDesc">Describe Human Oversight</label>
        <textarea class="form-textarea" id="wiz-oversightDesc" rows="3">${escapeHtml(data.humanOversightDescription ?? '')}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Transparency Provided</label>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input type="radio" name="wiz-transparency" value="yes" ${data.transparencyProvided === true ? 'checked' : ''} />
            Yes
          </label>
          <label class="checkbox-label">
            <input type="radio" name="wiz-transparency" value="no" ${data.transparencyProvided === false ? 'checked' : ''} />
            No
          </label>
        </div>
      </div>
    </div>
  `;
}

/* ── Wizard footer ── */

function renderWizardFooter(isLastStep: boolean): string {
  return `
    <button class="btn btn-secondary" id="wiz-back" style="display:none">Back</button>
    <button class="btn btn-primary" id="wiz-next">${isLastStep ? 'Save &amp; Classify' : 'Next'}</button>
  `;
}

/* ── Collect form data from wizard ── */

function collectWizardData(modal: HTMLElement): Partial<AISystem> {
  const val = (id: string) =>
    (modal.querySelector(`#${id}`) as HTMLInputElement | HTMLTextAreaElement | null)?.value?.trim() ?? '';
  const checkedValues = (name: string): string[] => {
    const inputs = modal.querySelectorAll<HTMLInputElement>(`input[name="${name}"]:checked`);
    return Array.from(inputs).map((el) => el.value);
  };
  const radioVal = (name: string): string | undefined => {
    const el = modal.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
    return el?.value;
  };

  const humanOversightVal = radioVal('wiz-humanOversight');
  const transparencyVal = radioVal('wiz-transparency');

  return {
    name: val('wiz-name'),
    description: val('wiz-description'),
    owner: val('wiz-owner'),
    department: val('wiz-department'),
    vendor: val('wiz-vendor'),
    model: val('wiz-model'),
    provider: val('wiz-provider'),
    deploymentType: (radioVal('wiz-deploymentType') as AISystem['deploymentType']) ?? 'saas',
    dataCategories: checkedValues('wiz-dataCategories'),
    affectedUsers: checkedValues('wiz-affectedUsers'),
    useCases: checkedValues('wiz-useCases'),
    domains: checkedValues('wiz-domains'),
    biometricIdentification: (modal.querySelector('#wiz-biometric') as HTMLInputElement)?.checked ?? false,
    emotionInference: (modal.querySelector('#wiz-emotion') as HTMLInputElement)?.checked ?? false,
    humanOversight: humanOversightVal === 'yes',
    humanOversightDescription: val('wiz-oversightDesc'),
    transparencyProvided: transparencyVal === 'yes',
  };
}

/* ── Open wizard ── */

function openWizard(existing?: AISystem): void {
  const isEdit = !!existing;
  const title = isEdit ? `Edit: ${existing!.name}` : 'Add AI System';
  const data: Partial<AISystem> = existing ? { ...existing } : {};

  let currentStep = 0;
  const totalSteps = STEP_TITLES.length;

  const modal = openModal(title, renderWizardBody(data), renderWizardFooter(false));

  const steps = modal.querySelectorAll<HTMLElement>('.wizard-step');
  const stepperSteps = modal.querySelectorAll<HTMLElement>('.stepper-step');
  const backBtn = modal.querySelector<HTMLButtonElement>('#wiz-back')!;
  const nextBtn = modal.querySelector<HTMLButtonElement>('#wiz-next')!;

  showStep(currentStep);

  function showStep(index: number): void {
    steps.forEach((s, i) => {
      s.style.display = i === index ? 'block' : 'none';
    });
    stepperSteps.forEach((s, i) => {
      s.classList.toggle('active', i === index);
      s.classList.toggle('completed', i < index);
    });
    backBtn.style.display = index === 0 ? 'none' : '';
    nextBtn.innerHTML = index === totalSteps - 1 ? 'Save &amp; Classify' : 'Next';
  }

  /* Human oversight toggle */
  const oversightRadios = modal.querySelectorAll<HTMLInputElement>('input[name="wiz-humanOversight"]');
  oversightRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      const descGroup = modal.querySelector<HTMLElement>('#wiz-oversight-desc-group');
      if (descGroup) {
        descGroup.style.display = radio.value === 'yes' && radio.checked ? 'block' : 'none';
      }
    });
  });

  /* Navigation */
  backBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  });

  nextBtn.addEventListener('click', async () => {
    /* Validate current step */
    if (currentStep === 0) {
      const nameInput = modal.querySelector<HTMLInputElement>('#wiz-name');
      if (!nameInput?.value.trim()) {
        nameInput?.focus();
        showToast('Name is required.', 'error');
        return;
      }
    }

    if (currentStep < totalSteps - 1) {
      currentStep++;
      showStep(currentStep);
      return;
    }

    /* Last step - save */
    const formData = collectWizardData(modal);
    const now = new Date().toISOString();

    const system: AISystem = {
      ...(existing ?? {
        status: 'draft' as const,
        createdAt: now,
      }),
      ...formData,
      updatedAt: now,
    } as AISystem;

    /* Classify */
    const result = classifySystem(system);
    system.riskCategory = result.category;
    system.riskConfidence = result.confidence;
    system.riskReasoning = result.reasoning;
    system.riskActions = result.actions;

    try {
      if (isEdit && existing!.id) {
        system.id = existing!.id;
        await db.aiSystems.put(system);
        const tasksCreated = await generateTasksForSystem(system);
        showToast(
          `AI system updated and re-classified.${tasksCreated > 0 ? ` ${tasksCreated} new task(s) created.` : ''}`,
          'success',
        );
      } else {
        system.id = await db.aiSystems.add(system);
        const tasksCreated = await generateTasksForSystem(system);
        showToast(
          `AI system added and classified.${tasksCreated > 0 ? ` ${tasksCreated} task(s) created.` : ''}`,
          'success',
        );
      }
      closeModal();
      await loadAndRender();
    } catch (err) {
      showToast(`Error saving system: ${String(err)}`, 'error');
    }
  });
}

/* ── System detail card (view modal) ── */

function openSystemCard(system: AISystem): void {
  const riskCat = system.riskCategory ?? 'unknown';

  const reasoningHtml = system.riskReasoning?.length
    ? `<ul>${system.riskReasoning.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>`
    : '<p>No reasoning recorded.</p>';

  const actionsHtml = system.riskActions?.length
    ? system.riskActions
        .map((a) => `<div class="checklist-item"><input type="checkbox" disabled /><span>${escapeHtml(a)}</span></div>`)
        .join('')
    : '<p>No recommended actions.</p>';

  const { score: compScore, missingFields: compMissing } = computeCompleteness(system);
  const compPct = Math.round(compScore * 100);
  const compClass = compPct >= 80 ? 'badge-green' : compPct >= 50 ? 'badge-yellow' : 'badge-red';
  const compMissingHtml =
    compMissing.length > 0
      ? `<p class="text-muted text-sm" style="margin-top:0.5rem;">Missing: ${compMissing.map((f) => escapeHtml(f)).join(', ')}.</p>`
      : '';

  const body = `
    <div class="card" style="margin:0">
      <h4>Risk Classification</h4>
      <p>
        <span class="badge ${riskBadgeClass(riskCat)}">${riskLabel(riskCat)}</span>
        ${system.riskConfidence ? `<span class="badge badge-gray" style="margin-left:0.5rem">Confidence: ${system.riskConfidence}</span>` : ''}
        <span class="badge ${compClass}" style="margin-left:0.5rem">Completeness: ${compPct}%</span>
      </p>
      ${compMissingHtml}

      <h4 style="margin-top:1rem">Reasoning</h4>
      ${reasoningHtml}

      <h4 style="margin-top:1rem">Recommended Actions</h4>
      ${actionsHtml}
    </div>

    <div class="card" style="margin-top:1rem">
      <h4>Basic Info</h4>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Name</label><p>${escapeHtml(system.name)}</p></div>
        <div class="form-group"><label class="form-label">Department</label><p>${escapeHtml(system.department || '-')}</p></div>
      </div>
      <div class="form-group"><label class="form-label">Description</label><p>${escapeHtml(system.description || '-')}</p></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Owner</label><p>${escapeHtml(system.owner || '-')}</p></div>
        <div class="form-group"><label class="form-label">Status</label><p><span class="badge ${STATUS_BADGE[system.status] ?? 'badge-gray'}">${statusLabel(system.status)}</span></p></div>
      </div>
    </div>

    <div class="card" style="margin-top:1rem">
      <h4>Technical Details</h4>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Vendor</label><p>${escapeHtml(system.vendor || '-')}</p></div>
        <div class="form-group"><label class="form-label">Model</label><p>${escapeHtml(system.model || '-')}</p></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Provider</label><p>${escapeHtml(system.provider || '-')}</p></div>
        <div class="form-group"><label class="form-label">Deployment Type</label><p>${system.deploymentType === 'saas' ? 'SaaS' : system.deploymentType === 'in-house' ? 'In-house' : 'On-device'}</p></div>
      </div>
    </div>

    <div class="card" style="margin-top:1rem">
      <h4>Data &amp; Users</h4>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Data Categories</label>
          <p>${system.dataCategories.length ? system.dataCategories.map((c) => c.charAt(0).toUpperCase() + c.slice(1)).join(', ') : '-'}</p>
        </div>
        <div class="form-group">
          <label class="form-label">Affected Users</label>
          <p>${system.affectedUsers.length ? system.affectedUsers.map((u) => u.charAt(0).toUpperCase() + u.slice(1)).join(', ') : '-'}</p>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:1rem">
      <h4>Use &amp; Domain</h4>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Use Cases</label>
          <p>${system.useCases.length ? system.useCases.map((uc) => USE_CASE_LABELS[uc] ?? uc).join(', ') : '-'}</p>
        </div>
        <div class="form-group">
          <label class="form-label">Domains</label>
          <p>${system.domains.length ? system.domains.map((d) => DOMAIN_LABELS[d] ?? d).join(', ') : '-'}</p>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Biometric Identification</label>
          <p>${system.biometricIdentification ? 'Yes' : 'No'}</p>
        </div>
        <div class="form-group">
          <label class="form-label">Emotion Inference</label>
          <p>${system.emotionInference ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:1rem">
      <h4>Oversight &amp; Transparency</h4>
      <div class="form-group">
        <label class="form-label">Human Oversight</label>
        <p>${system.humanOversight ? 'Yes' : 'No'}</p>
      </div>
      ${
        system.humanOversight
          ? `
        <div class="form-group">
          <label class="form-label">Oversight Description</label>
          <p>${escapeHtml(system.humanOversightDescription || '-')}</p>
        </div>
      `
          : ''
      }
      <div class="form-group">
        <label class="form-label">Transparency Provided</label>
        <p>${system.transparencyProvided ? 'Yes' : 'No'}</p>
      </div>
    </div>
  `;

  openModal(`System: ${system.name}`, body);
}

/* ── Delete confirmation ── */

async function confirmDelete(system: AISystem): Promise<void> {
  const body = `<p>Are you sure you want to delete <strong>${escapeHtml(system.name)}</strong>? This action cannot be undone.</p>`;
  const footer = `
    <button class="btn btn-secondary" id="del-cancel">Cancel</button>
    <button class="btn btn-danger" id="del-confirm">Delete</button>
  `;
  const modal = openModal('Delete AI System', body, footer);

  modal.querySelector('#del-cancel')?.addEventListener('click', () => closeModal());
  modal.querySelector('#del-confirm')?.addEventListener('click', async () => {
    try {
      if (system.id) {
        await db.aiSystems.delete(system.id);
        showToast(`"${system.name}" deleted.`, 'success');
      }
      closeModal();
      await loadAndRender();
    } catch (err) {
      showToast(`Error deleting system: ${String(err)}`, 'error');
    }
  });
}

/* ── Load & render helper ── */

async function loadAndRender(): Promise<void> {
  systems = await db.aiSystems.toArray();

  const container = document.getElementById('inventory-table-container');
  if (container) {
    container.innerHTML = renderTable();
  }

  /* Bind row action buttons */
  const tableWrap = document.querySelector('#inventory-table-container');
  if (!tableWrap) return;

  tableWrap.querySelectorAll<HTMLButtonElement>('button[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const action = btn.dataset.action;
      const system = systems.find((s) => s.id === id);
      if (!system) return;

      switch (action) {
        case 'view':
          openSystemCard(system);
          break;
        case 'edit':
          openWizard(system);
          break;
        case 'delete':
          confirmDelete(system);
          break;
      }
    });
  });
}

/* ── Exported page module ── */

const inventoryPage: PageModule = {
  render(): string {
    return `
      <div class="page">
        <div class="page-header">
          <h2>AI Inventory</h2>
          <button class="btn btn-primary" id="btn-add-system">Add AI System</button>
        </div>
        <div class="card">
          <div id="inventory-table-container"></div>
        </div>
      </div>
    `;
  },

  async init(): Promise<void> {
    await loadAndRender();

    document.getElementById('btn-add-system')?.addEventListener('click', () => {
      openWizard();
    });
  },
};

export default inventoryPage;
