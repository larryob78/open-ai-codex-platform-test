import { getCompanyProfile, saveCompanyProfile, wipeAllData, addAuditEntry } from '../db';
import type { CompanyProfile } from '../types';
import { showToast } from '../components/toast';
import { isValidEmail, maxLength } from '../utils/validate';

/* ── Render ── */

function render(): string {
  return `
    <div class="page">
      <div class="page-header">
        <h1>Settings</h1>
      </div>

      <!-- Company Profile -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Company Profile</h2>
        </div>
        <form id="settings-profile-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="profile-name">Company Name</label>
              <input class="form-input" type="text" id="profile-name" placeholder="Acme Ltd." />
            </div>
            <div class="form-group">
              <label class="form-label" for="profile-sector">Sector</label>
              <input class="form-input" type="text" id="profile-sector" placeholder="e.g. Financial Services" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="profile-country">Country</label>
              <input class="form-input" type="text" id="profile-country" placeholder="Ireland" />
            </div>
            <div class="form-group">
              <label class="form-label" for="profile-employee-count">Employee Count</label>
              <select class="form-select" id="profile-employee-count">
                <option value="">Select range</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-250">51-250</option>
                <option value="250+">250+</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="profile-dpo-name">DPO Name</label>
              <input class="form-input" type="text" id="profile-dpo-name" placeholder="Data Protection Officer name" />
            </div>
            <div class="form-group">
              <label class="form-label" for="profile-dpo-email">DPO Email</label>
              <input class="form-input" type="email" id="profile-dpo-email" placeholder="dpo@example.com" />
            </div>
          </div>

          <button class="btn btn-primary" type="submit" id="profile-save-btn">Save</button>
        </form>
      </div>

      <!-- Theme -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Appearance</h2>
        </div>
        <div class="form-group">
          <label class="form-label">Theme</label>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="radio" name="theme-pref" value="system" checked />
              System
            </label>
            <label class="checkbox-label">
              <input type="radio" name="theme-pref" value="light" />
              Light
            </label>
            <label class="checkbox-label">
              <input type="radio" name="theme-pref" value="dark" />
              Dark
            </label>
          </div>
        </div>
      </div>

      <!-- Data Storage -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Data Storage</h2>
        </div>
        <p class="text-muted">
          AI Comply stores all data locally in your browser using IndexedDB.
          No data is sent to any server. Your data stays on this device.
        </p>
        <span class="badge badge-green" style="margin-top:0.5rem; display:inline-block;">Local-only mode</span>
      </div>

      <!-- Danger Zone -->
      <div class="card" style="border-color: var(--c-danger);">
        <div class="card-header">
          <h2 class="card-title" style="color: var(--c-danger);">Danger Zone</h2>
        </div>
        <p class="text-muted">
          Permanently delete all data stored in AI Comply. This action cannot be undone.
        </p>
        <div class="form-group">
          <label class="form-label" for="wipe-confirm-input">
            Type <strong>DELETE</strong> to confirm
          </label>
          <input class="form-input" type="text" id="wipe-confirm-input" placeholder="DELETE" autocomplete="off" />
          <p class="form-hint text-muted">This will erase every record in the local database.</p>
        </div>
        <button class="btn btn-danger" id="wipe-btn" disabled>Wipe All Data</button>
      </div>

      <!-- Disclaimers -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Disclaimers</h2>
        </div>
        <div class="disclaimer-banner">
          <strong>AI Comply is provided for guidance purposes only. It does not constitute legal advice.</strong>
          The risk classifications and obligations shown are based on a simplified interpretation of the
          EU AI Act and may not reflect the full complexity of your regulatory obligations.
          Always consult with qualified legal counsel before making compliance decisions.
          AI Comply is not affiliated with or endorsed by any regulatory authority.
        </div>
        <p class="text-muted" style="margin-top: 1rem;">
          AI Comply v2.0.0<br />
          Built for Irish SMEs navigating the EU AI Act.
        </p>
      </div>
    </div>`;
}

/* ── Helpers ── */

function getInput(id: string): HTMLInputElement {
  return document.getElementById(id) as HTMLInputElement;
}

function getSelect(id: string): HTMLSelectElement {
  return document.getElementById(id) as HTMLSelectElement;
}

function applyTheme(pref: string): void {
  const root = document.documentElement;
  root.classList.remove('theme-light', 'theme-dark');
  if (pref === 'light') root.classList.add('theme-light');
  else if (pref === 'dark') root.classList.add('theme-dark');
}

/* ── Init ── */

async function init(): Promise<void> {
  // ── Load existing profile ──

  const existing = await getCompanyProfile();
  if (existing) {
    populateForm(existing);
  } else {
    // Default country
    const countryInput = getInput('profile-country');
    if (countryInput) countryInput.value = 'Ireland';
  }

  // ── Theme toggle ──

  const savedTheme = localStorage.getItem('theme-preference') || 'system';
  applyTheme(savedTheme);

  const themeRadios = document.querySelectorAll<HTMLInputElement>('input[name="theme-pref"]');
  themeRadios.forEach((radio) => {
    if (radio.value === savedTheme) radio.checked = true;
    radio.addEventListener('change', () => {
      if (radio.checked) {
        localStorage.setItem('theme-preference', radio.value);
        applyTheme(radio.value);
      }
    });
  });

  // ── Save profile ──

  const form = document.getElementById('settings-profile-form') as HTMLFormElement | null;
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const saveBtn = document.getElementById('profile-save-btn') as HTMLButtonElement | null;
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
    }

    try {
      const companyName = getInput('profile-name').value.trim();
      const nameLenErr = maxLength(companyName, 200, 'Company name');
      if (nameLenErr) {
        showToast(nameLenErr, 'warning');
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save';
        }
        return;
      }

      const dpoEmail = getInput('profile-dpo-email').value.trim();
      if (dpoEmail && !isValidEmail(dpoEmail)) {
        showToast('Please enter a valid DPO email address.', 'warning');
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save';
        }
        return;
      }

      const profile: Partial<CompanyProfile> = {
        name: companyName,
        sector: getInput('profile-sector').value.trim(),
        country: getInput('profile-country').value.trim() || 'Ireland',
        employeeCount: getSelect('profile-employee-count').value,
        dpoName: getInput('profile-dpo-name').value.trim(),
        dpoEmail,
      };

      await saveCompanyProfile(profile);
      await addAuditEntry('update', 'profile', 'Saved company profile: ' + companyName);
      showToast('Company profile saved.', 'success');
    } catch {
      showToast('Failed to save profile.', 'error');
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save';
      }
    }
  });

  // ── Wipe All Data ──

  const wipeInput = getInput('wipe-confirm-input');
  const wipeBtn = document.getElementById('wipe-btn') as HTMLButtonElement | null;

  wipeInput?.addEventListener('input', () => {
    if (wipeBtn) {
      wipeBtn.disabled = wipeInput.value.trim() !== 'DELETE';
    }
  });

  wipeBtn?.addEventListener('click', async () => {
    if (wipeInput?.value.trim() !== 'DELETE') return;

    wipeBtn.disabled = true;
    wipeBtn.textContent = 'Wiping...';

    try {
      await wipeAllData();
      showToast('All data has been deleted. Reloading...', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      showToast('Failed to wipe data.', 'error');
      wipeBtn.disabled = false;
      wipeBtn.textContent = 'Wipe All Data';
    }
  });
}

function populateForm(profile: CompanyProfile): void {
  const fields: { id: string; value: string }[] = [
    { id: 'profile-name', value: profile.name },
    { id: 'profile-sector', value: profile.sector },
    { id: 'profile-country', value: profile.country || 'Ireland' },
    { id: 'profile-dpo-name', value: profile.dpoName },
    { id: 'profile-dpo-email', value: profile.dpoEmail },
  ];

  for (const { id, value } of fields) {
    const el = getInput(id);
    if (el) el.value = value;
  }

  const countSelect = getSelect('profile-employee-count');
  if (countSelect && profile.employeeCount) {
    countSelect.value = profile.employeeCount;
  }
}

export default { render, init };
