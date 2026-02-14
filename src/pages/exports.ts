import {
  generateZip,
  generatePdfSummary,
  downloadBlob,
  downloadText,
  aiInventoryCsv,
  riskRegisterCsv,
  vendorRegisterCsv,
  trainingLogCsv,
  incidentLogCsv,
  tasksCsv,
} from '../services/exportService';
import { exportAllData, importData } from '../db';
import { showToast } from '../components/toast';

/* ── Render ── */

function render(): string {
  return `
    <div class="page">
      <div class="page-header">
        <h1>Exports</h1>
        <p class="text-muted">Download your compliance data as CSV, PDF, or a complete ZIP package.</p>
      </div>

      <div class="disclaimer-banner">
        This tool provides guidance only  -  it does not constitute legal advice.
        Always consult qualified legal counsel for compliance decisions.
      </div>

      <!-- Complete Compliance Pack -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Complete Compliance Pack</h2>
        </div>
        <p class="text-muted">
          Download everything in one ZIP file: CSVs, JSON backup, PDF summary, and all generated documents.
        </p>
        <div class="btn-group">
          <button class="btn btn-primary" id="export-zip">Download ZIP</button>
          <button class="btn btn-secondary" id="export-pdf">Download PDF Summary</button>
        </div>
      </div>

      <!-- Individual Exports -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Individual Exports</h2>
        </div>
        <div class="stat-grid">
          <button class="btn btn-secondary" id="export-ai-inventory">AI Inventory CSV</button>
          <button class="btn btn-secondary" id="export-risk-register">Risk Register CSV</button>
          <button class="btn btn-secondary" id="export-vendor-register">Vendor Register CSV</button>
          <button class="btn btn-secondary" id="export-training-log">Training Log CSV</button>
          <button class="btn btn-secondary" id="export-incident-log">Incident Log CSV</button>
          <button class="btn btn-secondary" id="export-tasks">Tasks CSV</button>
        </div>
      </div>

      <!-- Backup & Restore -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Backup &amp; Restore</h2>
        </div>
        <div class="btn-group">
          <button class="btn btn-secondary" id="export-json">Export JSON Backup</button>
        </div>
        <div class="form-group" style="margin-top: 1rem;">
          <label class="form-label" for="import-json-input">Import JSON Backup</label>
          <input type="file" class="form-input" id="import-json-input" accept=".json" />
          <p class="form-hint text-muted">Importing will replace all existing data.</p>
        </div>
      </div>
    </div>`;
}

/* ── Helpers ── */

async function withLoading(btn: HTMLButtonElement, fn: () => Promise<void>): Promise<void> {
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Generating...';
  try {
    await fn();
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

function getBtn(id: string): HTMLButtonElement | null {
  return document.getElementById(id) as HTMLButtonElement | null;
}

/* ── Init ── */

async function init(): Promise<void> {
  // ── Complete Compliance Pack ──

  const zipBtn = getBtn('export-zip');
  zipBtn?.addEventListener('click', () => {
    withLoading(zipBtn, async () => {
      const blob = await generateZip();
      downloadBlob(blob, `ai-comply-pack-${dateStamp()}.zip`);
      showToast('ZIP pack downloaded.', 'success');
    }).catch(() => showToast('Failed to generate ZIP.', 'error'));
  });

  const pdfBtn = getBtn('export-pdf');
  pdfBtn?.addEventListener('click', () => {
    withLoading(pdfBtn, async () => {
      const blob = await generatePdfSummary();
      downloadBlob(blob, `compliance-summary-${dateStamp()}.pdf`);
      showToast('PDF summary downloaded.', 'success');
    }).catch(() => showToast('Failed to generate PDF.', 'error'));
  });

  // ── Individual CSV Exports ──

  const csvExports: { id: string; fn: () => Promise<string>; filename: string }[] = [
    { id: 'export-ai-inventory', fn: aiInventoryCsv, filename: 'ai-inventory' },
    { id: 'export-risk-register', fn: riskRegisterCsv, filename: 'risk-register' },
    { id: 'export-vendor-register', fn: vendorRegisterCsv, filename: 'vendor-register' },
    { id: 'export-training-log', fn: trainingLogCsv, filename: 'training-log' },
    { id: 'export-incident-log', fn: incidentLogCsv, filename: 'incident-log' },
    { id: 'export-tasks', fn: tasksCsv, filename: 'tasks' },
  ];

  for (const { id, fn, filename } of csvExports) {
    const btn = getBtn(id);
    btn?.addEventListener('click', () => {
      withLoading(btn, async () => {
        const csv = await fn();
        downloadText(csv, `${filename}-${dateStamp()}.csv`);
        showToast(`${filename}.csv downloaded.`, 'success');
      }).catch(() => showToast(`Failed to export ${filename}.`, 'error'));
    });
  }

  // ── JSON Backup ──

  const jsonBtn = getBtn('export-json');
  jsonBtn?.addEventListener('click', () => {
    withLoading(jsonBtn, async () => {
      const json = await exportAllData();
      downloadText(json, `ai-comply-backup-${dateStamp()}.json`, 'application/json');
      showToast('JSON backup downloaded.', 'success');
    }).catch(() => showToast('Failed to export JSON backup.', 'error'));
  });

  // ── JSON Import ──

  const importInput = document.getElementById('import-json-input') as HTMLInputElement | null;
  importInput?.addEventListener('change', async () => {
    const file = importInput.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await importData(text);
      showToast('Data imported successfully. Reloading...', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      showToast('Failed to import data. Check the file format.', 'error');
    } finally {
      importInput.value = '';
    }
  });
}

/* ── Utility ── */

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export default { render, init };
