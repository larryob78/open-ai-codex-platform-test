/**
 * AI Comply — EU AI Act Compliance Platform
 * Main application logic
 * Depends on: js/data.js (AIComplyData)
 */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  /* ============================================================
     Core Initialisation
     ============================================================ */
  initToastSystem();
  initModalSystem();
  initSidebarToggle();
  initTabs();
  initActionButtons();
  initNotificationBadge();

  // Page-specific
  initDashboard();
  initWizard();
  initChecklist();
  initRiskClassifier();
  initRiskPageSystems();
  initReportPage();
  initTeamPage();
  initSystemsPage();
  initExportPage();
  initDocumentationPage();
});

/* ============================================================
   Toast Notification System
   ============================================================ */
var toastContainer;

function initToastSystem() {
  toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);
}

function showToast(message, type) {
  type = type || 'info';
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(function () {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', function () { toast.remove(); });
  }, 3000);
}

/* ============================================================
   Modal System
   ============================================================ */
function initModalSystem() {
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });
}

function openModal(title, bodyHTML, footerHTML, options) {
  closeModal();
  options = options || {};
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.id = 'activeModal';

  var modal = document.createElement('div');
  modal.className = 'modal';
  if (options.wide) modal.style.maxWidth = '900px';
  if (options.extraWide) modal.style.maxWidth = '1100px';

  var html = '<div class="modal-header"><h3>' + escapeHTML(title) + '</h3>' +
    '<button class="modal-close" aria-label="Close modal" onclick="closeModal()">' +
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>' +
    '<div class="modal-body">' + bodyHTML + '</div>';
  if (footerHTML) html += '<div class="modal-footer">' + footerHTML + '</div>';
  modal.innerHTML = html;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });
  var firstInput = modal.querySelector('input, select, textarea');
  if (firstInput) setTimeout(function () { firstInput.focus(); }, 100);
  return modal;
}

function closeModal() {
  var overlay = document.getElementById('activeModal');
  if (overlay) overlay.remove();
}

/* ============================================================
   Action Buttons (delegated)
   ============================================================ */
function initActionButtons() {
  document.addEventListener('click', function (e) {
    // Toast actions
    var btn = e.target.closest('[data-action="toast"]');
    if (btn) {
      e.preventDefault();
      showToast(btn.getAttribute('data-toast') || 'This feature is coming soon.', btn.getAttribute('data-toast-type') || 'info');
    }
    // Navigate actions
    var navBtn = e.target.closest('[data-action="navigate"]');
    if (navBtn) {
      e.preventDefault();
      var dest = navBtn.getAttribute('data-href');
      if (dest) { window.location.href = dest; }
    }
    // Modal actions
    var modalBtn = e.target.closest('[data-action="modal"]');
    if (modalBtn) {
      e.preventDefault();
      var modalType = modalBtn.getAttribute('data-modal');
      handleModalAction(modalType, modalBtn);
    }
  });
}

function handleModalAction(type, trigger) {
  switch (type) {
    case 'add-system': openAddSystemModal(); break;
    case 'view-system': openViewSystemModal(trigger.getAttribute('data-system-id')); break;
    case 'edit-system': openEditSystemModal(trigger.getAttribute('data-system-id')); break;
    case 'delete-system': openDeleteSystemModal(trigger.getAttribute('data-system-id')); break;
    case 'score-breakdown': openScoreBreakdownModal(); break;
    case 'activity-log': openActivityLogModal(); break;
    case 'search': openSearchModal(); break;
    case 'notifications': openNotificationsModal(); break;
    case 'add-team-member': openAddTeamMemberModal(); break;
    case 'export-csv': exportCSV(); break;
    case 'export-pdf': exportPDF(); break;
    default: showToast('Unknown action: ' + type, 'warning');
  }
}

/* ============================================================
   Sidebar Mobile Toggle
   ============================================================ */
function initSidebarToggle() {
  var toggle = document.getElementById('menuToggle');
  var sidebar = document.getElementById('sidebar');
  if (!toggle || !sidebar) return;

  var overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  overlay.id = 'sidebarOverlay';
  document.body.appendChild(overlay);

  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Toggle navigation');

  function open() { sidebar.classList.add('open'); overlay.classList.add('open'); toggle.setAttribute('aria-expanded', 'true'); }
  function close() { sidebar.classList.remove('open'); overlay.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }

  toggle.addEventListener('click', function () { sidebar.classList.contains('open') ? close() : open(); });
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sidebar.classList.contains('open')) close(); });
}

/* ============================================================
   Tab Switching
   ============================================================ */
function initTabs() {
  document.querySelectorAll('.tabs').forEach(function (container) {
    container.setAttribute('role', 'tablist');
    var tabs = container.querySelectorAll('.tab');
    var parent = container.parentElement;
    tabs.forEach(function (tab) {
      var tabId = tab.getAttribute('data-tab');
      tab.setAttribute('role', 'tab');
      tab.setAttribute('tabindex', '0');
      tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');
      if (tabId) { tab.setAttribute('aria-controls', 'tab-' + tabId); tab.id = 'tab-btn-' + tabId; }
      var panel = parent.querySelector('#tab-' + tabId);
      if (panel) { panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', 'tab-btn-' + tabId); }
      tab.addEventListener('click', function () { activateTab(container, tab, parent); });
      tab.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateTab(container, tab, parent); } });
    });
  });
}

function activateTab(container, tab, parent) {
  container.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
  tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
  parent.querySelectorAll('.tab-content').forEach(function (c) { c.classList.remove('active'); });
  var target = parent.querySelector('#tab-' + tab.getAttribute('data-tab'));
  if (target) target.classList.add('active');
}

/* ============================================================
   Notification Badge
   ============================================================ */
function initNotificationBadge() {
  if (typeof AIComplyData === 'undefined') return;
  var count = AIComplyData.getUnreadCount();
  var dots = document.querySelectorAll('.notification-dot');
  dots.forEach(function (dot) { dot.style.display = count > 0 ? 'block' : 'none'; });
}

/* ============================================================
   Dashboard (index.html)
   ============================================================ */
function initDashboard() {
  var statsGrid = document.querySelector('.stats-grid');
  var systemsTable = document.querySelector('#systemsTableBody');
  if (!statsGrid || typeof AIComplyData === 'undefined') return;

  renderDashboardStats();
  renderDashboardScores();
  renderDashboardActivity();
  renderDashboardSystems();
}

function renderDashboardStats() {
  var stats = AIComplyData.getStats();
  var values = document.querySelectorAll('.stat-value');
  if (values.length >= 4) {
    values[0].textContent = stats.avgCompliance + '%';
    values[1].textContent = stats.openFindings;
    values[2].textContent = stats.totalSystems;
    values[3].textContent = stats.highRiskSystems;
  }
}

function renderDashboardScores() {
  var scores = AIComplyData.getComplianceScores();
  var overall = scores.overall;

  // Update ring
  var ringValue = document.querySelector('.score-ring-value');
  if (ringValue) ringValue.textContent = overall;
  var circle = document.querySelector('.score-ring svg circle:nth-child(2)');
  if (circle) {
    var circumference = 377;
    var offset = circumference - (circumference * overall / 100);
    circle.setAttribute('stroke-dashoffset', Math.round(offset));
  }

  // Update legend
  var legendItems = document.querySelectorAll('.donut-legend .legend-item');
  var scoreVals = [scores.riskManagement, scores.dataGovernance, scores.transparency, scores.humanOversight, scores.technicalDocs];
  var scoreLabels = ['Risk Management', 'Data Governance', 'Transparency', 'Human Oversight', 'Technical Documentation'];
  legendItems.forEach(function (item, i) {
    if (i < scoreVals.length) {
      var dot = item.querySelector('.legend-dot');
      item.childNodes[item.childNodes.length - 1].textContent = ' ' + scoreLabels[i] + ' \u2014 ' + scoreVals[i] + '%';
    }
  });
}

function renderDashboardActivity() {
  var feed = document.querySelector('.activity-feed');
  if (!feed) return;
  var activity = AIComplyData.getActivity().slice(0, 5);
  var iconMap = {
    success: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>',
    info: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>',
    warning: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    danger: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
  };
  var dotColors = { success: 'green', info: 'blue', warning: 'orange', danger: 'red' };

  feed.innerHTML = activity.map(function (a) {
    return '<div class="activity-item"><div class="activity-dot ' + (dotColors[a.type] || 'blue') + '">' +
      (iconMap[a.type] || iconMap.info) + '</div><div class="activity-body"><p><strong>' +
      escapeHTML(a.title) + '</strong> ' + escapeHTML(a.detail || '') + '</p><time>' +
      escapeHTML(a.time || AIComplyData.relativeTime(a.timestamp)) + '</time></div></div>';
  }).join('');
}

function renderDashboardSystems() {
  var tbody = document.getElementById('systemsTableBody');
  if (!tbody) return;
  var systems = AIComplyData.getSystems();
  tbody.innerHTML = systems.map(function (s) {
    var color = AIComplyData.complianceColor(s.compliance);
    return '<tr>' +
      '<td><strong>' + escapeHTML(s.name) + '</strong></td>' +
      '<td><span class="badge ' + AIComplyData.riskBadgeClass(s.riskLevel) + '">' + escapeHTML(AIComplyData.riskLevelLabel(s.riskLevel)) + '</span></td>' +
      '<td>' + escapeHTML(s.purpose) + '</td>' +
      '<td><span class="badge ' + AIComplyData.statusBadgeClass(s.status) + '">' + escapeHTML(AIComplyData.statusLabel(s.status)) + '</span></td>' +
      '<td><div style="display:flex;align-items:center;gap:8px;"><div class="progress-bar" style="width:100px;"><div class="progress-fill ' + color + '" style="width:' + s.compliance + '%;"></div></div><span class="text-sm">' + s.compliance + '%</span></div></td>' +
      '<td class="text-sm text-muted">' + AIComplyData.formatDate(s.lastReviewed) + '</td>' +
      '<td><button class="btn btn-sm btn-ghost" data-action="modal" data-modal="view-system" data-system-id="' + s.id + '">View</button></td></tr>';
  }).join('');
}

/* ============================================================
   System Modals (Add / View / Edit / Delete)
   ============================================================ */
function openAddSystemModal() {
  var body = '<form id="addSystemForm">' +
    '<div class="form-group"><label class="form-label">System Name *</label><input class="form-input" name="name" required placeholder="e.g. Customer Service Chatbot"></div>' +
    '<div class="form-group"><label class="form-label">Version</label><input class="form-input" name="version" placeholder="e.g. v1.0"></div>' +
    '<div class="form-group"><label class="form-label">Domain *</label><select class="form-select" name="domain" required>' +
    '<option value="">Select domain...</option><option value="hr">Human Resources</option><option value="credit">Financial Services</option>' +
    '<option value="education">Education</option><option value="law">Law Enforcement</option><option value="migration">Migration & Border</option>' +
    '<option value="critical">Critical Infrastructure</option><option value="healthcare">Healthcare</option><option value="biometric">Biometrics</option>' +
    '<option value="customer">Customer Service</option><option value="marketing">Marketing</option><option value="operations">Operations</option><option value="other">Other</option></select></div>' +
    '<div class="form-group"><label class="form-label">Risk Level *</label><select class="form-select" name="riskLevel" required>' +
    '<option value="">Select risk level...</option><option value="high">High Risk</option><option value="limited">Limited Risk</option><option value="minimal">Minimal Risk</option></select></div>' +
    '<div class="form-group"><label class="form-label">Purpose *</label><input class="form-input" name="purpose" required placeholder="Brief description of system purpose"></div>' +
    '<div class="form-group"><label class="form-label">Provider</label><input class="form-input" name="provider" placeholder="e.g. Internal, Vendor Name"></div>' +
    '<div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" name="description" rows="3" placeholder="Detailed description of the AI system..."></textarea></div>' +
    '</form>';
  var footer = '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>' +
    '<button class="btn btn-primary" onclick="submitAddSystem()">Register System</button>';
  openModal('Register New AI System', body, footer, { wide: true });
}

function submitAddSystem() {
  var form = document.getElementById('addSystemForm');
  if (!form) return;
  var name = form.querySelector('[name="name"]').value.trim();
  var domain = form.querySelector('[name="domain"]').value;
  var riskLevel = form.querySelector('[name="riskLevel"]').value;
  var purpose = form.querySelector('[name="purpose"]').value.trim();
  if (!name || !domain || !riskLevel || !purpose) { showToast('Please fill in all required fields.', 'error'); return; }

  var system = {
    name: name,
    version: form.querySelector('[name="version"]').value.trim() || 'v1.0',
    domain: domain,
    riskLevel: riskLevel,
    purpose: purpose,
    provider: form.querySelector('[name="provider"]').value.trim() || 'Internal',
    description: form.querySelector('[name="description"]').value.trim(),
    status: 'in-progress',
    compliance: 0,
    deploymentDate: new Date().toISOString().slice(0, 10),
    scores: { riskManagement: 0, dataGovernance: 0, transparency: 0, humanOversight: 0, technicalDocs: 0 }
  };
  AIComplyData.addSystem(system);
  closeModal();
  showToast('System "' + name + '" registered successfully.', 'success');
  refreshCurrentPage();
}

function openViewSystemModal(id) {
  var s = AIComplyData.getSystem(id);
  if (!s) { showToast('System not found.', 'error'); return; }
  var scores = s.scores || {};
  var body = '<div class="report-meta" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-5);">' +
    metaItem('System Name', s.name) + metaItem('Version', s.version || '\u2014') +
    metaItem('Domain', AIComplyData.domainLabel(s.domain)) + metaItem('Risk Level', '<span class="badge ' + AIComplyData.riskBadgeClass(s.riskLevel) + '">' + AIComplyData.riskLevelLabel(s.riskLevel) + '</span>') +
    metaItem('Status', '<span class="badge ' + AIComplyData.statusBadgeClass(s.status) + '">' + AIComplyData.statusLabel(s.status) + '</span>') + metaItem('Compliance', s.compliance + '%') +
    metaItem('Provider', s.provider || '\u2014') + metaItem('Last Reviewed', AIComplyData.formatDate(s.lastReviewed)) +
    metaItem('Deployed', AIComplyData.formatDate(s.deploymentDate)) + '</div>' +
    (s.description ? '<div style="margin-bottom:var(--space-5);"><strong>Description</strong><p class="text-sm text-muted" style="margin-top:var(--space-2);">' + escapeHTML(s.description) + '</p></div>' : '') +
    '<strong>Compliance Score Breakdown</strong>' +
    '<div style="margin-top:var(--space-3);display:flex;flex-direction:column;gap:var(--space-3);">' +
    scoreBar('Risk Management', scores.riskManagement || 0) +
    scoreBar('Data Governance', scores.dataGovernance || 0) +
    scoreBar('Transparency', scores.transparency || 0) +
    scoreBar('Human Oversight', scores.humanOversight || 0) +
    scoreBar('Technical Documentation', scores.technicalDocs || 0) + '</div>';
  var footer = '<button class="btn btn-secondary" onclick="closeModal()">Close</button>' +
    '<button class="btn btn-primary" data-action="modal" data-modal="edit-system" data-system-id="' + s.id + '">Edit System</button>';
  openModal(s.name, body, footer, { wide: true });
}

function openEditSystemModal(id) {
  var s = AIComplyData.getSystem(id);
  if (!s) { showToast('System not found.', 'error'); return; }
  var body = '<form id="editSystemForm" data-system-id="' + s.id + '">' +
    '<div class="form-group"><label class="form-label">System Name</label><input class="form-input" name="name" value="' + escapeAttr(s.name) + '"></div>' +
    '<div class="form-group"><label class="form-label">Version</label><input class="form-input" name="version" value="' + escapeAttr(s.version || '') + '"></div>' +
    '<div class="form-group"><label class="form-label">Status</label><select class="form-select" name="status">' +
    '<option value="in-progress"' + (s.status === 'in-progress' ? ' selected' : '') + '>In Progress</option>' +
    '<option value="compliant"' + (s.status === 'compliant' ? ' selected' : '') + '>Compliant</option>' +
    '<option value="non-compliant"' + (s.status === 'non-compliant' ? ' selected' : '') + '>Non-Compliant</option></select></div>' +
    '<div class="form-group"><label class="form-label">Compliance %</label><input class="form-input" type="number" name="compliance" min="0" max="100" value="' + s.compliance + '"></div>' +
    '<div class="form-group"><label class="form-label">Purpose</label><input class="form-input" name="purpose" value="' + escapeAttr(s.purpose) + '"></div>' +
    '<div class="form-group"><label class="form-label">Provider</label><input class="form-input" name="provider" value="' + escapeAttr(s.provider || '') + '"></div>' +
    '<div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" name="description" rows="3">' + escapeHTML(s.description || '') + '</textarea></div>' +
    '<hr style="margin:var(--space-4) 0;border:none;border-top:1px solid var(--color-gray-200);">' +
    '<strong>Compliance Scores</strong><div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);margin-top:var(--space-3);">' +
    scoreInput('Risk Management', 'score_rm', (s.scores || {}).riskManagement || 0) +
    scoreInput('Data Governance', 'score_dg', (s.scores || {}).dataGovernance || 0) +
    scoreInput('Transparency', 'score_tr', (s.scores || {}).transparency || 0) +
    scoreInput('Human Oversight', 'score_ho', (s.scores || {}).humanOversight || 0) +
    scoreInput('Technical Docs', 'score_td', (s.scores || {}).technicalDocs || 0) + '</div></form>';
  var footer = '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>' +
    '<button class="btn btn-danger" style="margin-right:auto;" onclick="openDeleteSystemModal(\'' + s.id + '\')">Delete</button>' +
    '<button class="btn btn-primary" onclick="submitEditSystem()">Save Changes</button>';
  openModal('Edit: ' + s.name, body, footer, { wide: true });
}

function submitEditSystem() {
  var form = document.getElementById('editSystemForm');
  if (!form) return;
  var id = form.getAttribute('data-system-id');
  var updates = {
    name: form.querySelector('[name="name"]').value.trim(),
    version: form.querySelector('[name="version"]').value.trim(),
    status: form.querySelector('[name="status"]').value,
    compliance: parseInt(form.querySelector('[name="compliance"]').value, 10) || 0,
    purpose: form.querySelector('[name="purpose"]').value.trim(),
    provider: form.querySelector('[name="provider"]').value.trim(),
    description: form.querySelector('[name="description"]').value.trim(),
    scores: {
      riskManagement: parseInt(form.querySelector('[name="score_rm"]').value, 10) || 0,
      dataGovernance: parseInt(form.querySelector('[name="score_dg"]').value, 10) || 0,
      transparency: parseInt(form.querySelector('[name="score_tr"]').value, 10) || 0,
      humanOversight: parseInt(form.querySelector('[name="score_ho"]').value, 10) || 0,
      technicalDocs: parseInt(form.querySelector('[name="score_td"]').value, 10) || 0
    }
  };
  AIComplyData.updateSystem(id, updates);
  closeModal();
  showToast('System updated successfully.', 'success');
  refreshCurrentPage();
}

function openDeleteSystemModal(id) {
  var s = AIComplyData.getSystem(id);
  if (!s) return;
  var body = '<p>Are you sure you want to permanently delete <strong>' + escapeHTML(s.name) + '</strong> from the registry?</p>' +
    '<p class="text-sm text-muted" style="margin-top:var(--space-3);">This action cannot be undone. All associated data will be removed.</p>';
  var footer = '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>' +
    '<button class="btn btn-danger" onclick="confirmDeleteSystem(\'' + s.id + '\')">Delete System</button>';
  openModal('Delete System', body, footer);
}

function confirmDeleteSystem(id) {
  AIComplyData.deleteSystem(id);
  closeModal();
  showToast('System deleted.', 'success');
  refreshCurrentPage();
}

/* ============================================================
   Score Breakdown Modal
   ============================================================ */
function openScoreBreakdownModal() {
  var scores = AIComplyData.getComplianceScores();
  var body = '<div style="text-align:center;margin-bottom:var(--space-6);">' +
    '<div style="font-size:var(--text-4xl);font-weight:700;color:var(--color-primary-600);">' + scores.overall + '%</div>' +
    '<div class="text-sm text-muted">Overall Compliance Score</div></div>' +
    '<div style="display:flex;flex-direction:column;gap:var(--space-4);">' +
    scoreBar('Risk Management (Art. 9)', scores.riskManagement) +
    scoreBar('Data Governance (Art. 10)', scores.dataGovernance) +
    scoreBar('Transparency (Art. 13)', scores.transparency) +
    scoreBar('Human Oversight (Art. 14)', scores.humanOversight) +
    scoreBar('Technical Documentation (Art. 11-12)', scores.technicalDocs) +
    '</div><p class="text-xs text-muted" style="margin-top:var(--space-5);">Scores are averaged across all registered AI systems with compliance data.</p>';
  openModal('Compliance Score Breakdown', body, '<button class="btn btn-secondary" onclick="closeModal()">Close</button>', { wide: true });
}

/* ============================================================
   Activity Log Modal
   ============================================================ */
function openActivityLogModal() {
  var activity = AIComplyData.getActivity();
  var iconMap = {
    success: '<div class="activity-dot green"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>',
    info: '<div class="activity-dot blue"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg></div>',
    warning: '<div class="activity-dot orange"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>',
    danger: '<div class="activity-dot red"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>'
  };
  var body = '<div class="activity-feed" style="max-height:500px;overflow-y:auto;">' +
    activity.map(function (a) {
      return '<div class="activity-item">' + (iconMap[a.type] || iconMap.info) +
        '<div class="activity-body"><p><strong>' + escapeHTML(a.title) + '</strong> ' + escapeHTML(a.detail || '') + '</p><time>' +
        escapeHTML(a.time || AIComplyData.relativeTime(a.timestamp)) + '</time></div></div>';
    }).join('') + '</div>';
  openModal('Activity Log (' + activity.length + ' events)', body, '<button class="btn btn-secondary" onclick="closeModal()">Close</button>', { wide: true });
}

/* ============================================================
   Search Modal
   ============================================================ */
function openSearchModal() {
  var body = '<div class="form-group" style="margin-bottom:var(--space-4);">' +
    '<input class="form-input" id="searchInput" placeholder="Search systems, pages, actions..." autofocus style="font-size:var(--text-lg);padding:var(--space-3) var(--space-4);">' +
    '</div><div id="searchResults" style="max-height:400px;overflow-y:auto;"></div>';
  var modal = openModal('Search', body, null, { wide: true });
  var input = document.getElementById('searchInput');
  if (input) {
    input.addEventListener('input', function () { performSearch(input.value.trim()); });
    performSearch('');
  }
}

function performSearch(query) {
  var resultsDiv = document.getElementById('searchResults');
  if (!resultsDiv) return;
  var q = query.toLowerCase();
  var results = [];

  // Search systems
  var systems = AIComplyData.getSystems();
  systems.forEach(function (s) {
    if (!q || s.name.toLowerCase().indexOf(q) !== -1 || s.purpose.toLowerCase().indexOf(q) !== -1 || (s.description || '').toLowerCase().indexOf(q) !== -1) {
      results.push({ type: 'System', name: s.name, detail: s.purpose, action: 'data-action="modal" data-modal="view-system" data-system-id="' + s.id + '"', icon: 'system' });
    }
  });

  // Search pages
  var pages = [
    { name: 'Dashboard', detail: 'Compliance overview and statistics', url: getPageUrl('index.html') },
    { name: 'Compliance Assessment', detail: 'Step-by-step assessment wizard', url: getPageUrl('pages/assessment.html') },
    { name: 'Risk Classification', detail: 'EU AI Act risk tiers reference', url: getPageUrl('pages/risk.html') },
    { name: 'AI Test 1 Report', detail: 'Automated compliance test results', url: getPageUrl('pages/ai-test-1.html') },
    { name: 'Documentation', detail: 'EU AI Act reference materials', url: getPageUrl('pages/documentation.html') },
    { name: 'AI Systems Registry', detail: 'Manage registered AI systems', url: getPageUrl('pages/systems.html') },
    { name: 'Team & Roles', detail: 'Team management and permissions', url: getPageUrl('pages/team.html') },
    { name: 'Export Reports', detail: 'Export data and reports', url: getPageUrl('pages/export.html') }
  ];
  pages.forEach(function (p) {
    if (!q || p.name.toLowerCase().indexOf(q) !== -1 || p.detail.toLowerCase().indexOf(q) !== -1) {
      results.push({ type: 'Page', name: p.name, detail: p.detail, url: p.url, icon: 'page' });
    }
  });

  if (results.length === 0) {
    resultsDiv.innerHTML = '<div class="empty-state" style="padding:var(--space-8);"><p class="text-muted">No results found for "' + escapeHTML(query) + '"</p></div>';
    return;
  }

  resultsDiv.innerHTML = results.map(function (r) {
    var tag = r.url ? 'a href="' + r.url + '"' : 'button ' + r.action;
    var close = r.url ? '</a>' : '</button>';
    return '<' + tag + ' style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);border-radius:var(--radius-md);cursor:pointer;text-decoration:none;color:inherit;border:none;background:none;width:100%;text-align:left;font-family:inherit;font-size:inherit;" onmouseover="this.style.background=\'var(--color-gray-50)\'" onmouseout="this.style.background=\'none\'">' +
      '<span class="badge badge-neutral" style="font-size:0.6rem;">' + r.type + '</span>' +
      '<div><div style="font-weight:500;font-size:var(--text-sm);">' + escapeHTML(r.name) + '</div>' +
      '<div class="text-xs text-muted">' + escapeHTML(r.detail) + '</div></div>' + close;
  }).join('');
}

/* ============================================================
   Notifications Modal
   ============================================================ */
function openNotificationsModal() {
  var notifs = AIComplyData.getNotifications();
  var body = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4);">' +
    '<span class="text-sm text-muted">' + notifs.filter(function (n) { return !n.read; }).length + ' unread</span>' +
    '<button class="btn btn-sm btn-ghost" onclick="markAllRead()">Mark all read</button></div>' +
    '<div id="notifList" style="display:flex;flex-direction:column;gap:var(--space-2);max-height:400px;overflow-y:auto;">' +
    notifs.map(function (n) {
      var bgClass = n.read ? '' : 'background:var(--color-primary-50);';
      var dotColor = { warning: 'var(--color-warning)', info: 'var(--color-info)', success: 'var(--color-success)', danger: 'var(--color-danger)' }[n.type] || 'var(--color-gray-400)';
      return '<div style="padding:var(--space-3) var(--space-4);border-radius:var(--radius-md);border:1px solid var(--color-gray-100);' + bgClass + 'cursor:pointer;" onclick="markNotifRead(\'' + n.id + '\')">' +
        '<div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:2px;">' +
        '<span style="width:8px;height:8px;border-radius:50%;background:' + dotColor + ';flex-shrink:0;"></span>' +
        '<strong style="font-size:var(--text-sm);">' + escapeHTML(n.title) + '</strong>' +
        '<span class="text-xs text-muted" style="margin-left:auto;">' + escapeHTML(n.time) + '</span></div>' +
        '<p class="text-sm text-muted" style="margin-left:18px;">' + escapeHTML(n.message) + '</p></div>';
    }).join('') + '</div>';
  openModal('Notifications', body, '<button class="btn btn-secondary" onclick="closeModal()">Close</button>', { wide: true });
}

function markAllRead() {
  AIComplyData.markAllNotificationsRead();
  closeModal();
  openNotificationsModal();
  initNotificationBadge();
  showToast('All notifications marked as read.', 'success');
}

function markNotifRead(id) {
  AIComplyData.markNotificationRead(id);
  closeModal();
  openNotificationsModal();
  initNotificationBadge();
}

/* ============================================================
   Assessment Wizard (pages/assessment.html)
   ============================================================ */
function initWizard() {
  var nextBtn = document.getElementById('nextStep');
  var prevBtn = document.getElementById('prevStep');
  if (!nextBtn) return;

  var steps = document.querySelectorAll('.stepper-step');
  var stepContents = document.querySelectorAll('[id^="step-"]');
  var stepperLines = document.querySelectorAll('.stepper-line');
  var currentStep = AIComplyData.getWizardStep();

  restoreAssessmentForm();
  updateStepper(currentStep);

  function updateStepper(step) {
    steps.forEach(function (s, i) {
      var num = i + 1;
      s.classList.remove('active', 'completed');
      if (num < step) {
        s.classList.add('completed');
        s.querySelector('.stepper-circle').innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
      } else if (num === step) {
        s.classList.add('active');
        s.querySelector('.stepper-circle').textContent = num;
      } else {
        s.querySelector('.stepper-circle').textContent = num;
      }
    });
    stepperLines.forEach(function (line, i) { line.classList.toggle('completed', i < step - 1); });
    stepContents.forEach(function (c) { c.classList.remove('active'); });
    var active = document.getElementById('step-' + step);
    if (active) active.classList.add('active');
    AIComplyData.setWizardStep(step);

    // Update button labels
    if (step >= steps.length) {
      nextBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Submit Assessment';
    } else {
      nextBtn.innerHTML = 'Continue <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
    }
    prevBtn.style.visibility = step <= 1 ? 'hidden' : 'visible';
  }

  function validateStep2() {
    var valid = true;
    document.querySelectorAll('.form-group--error').forEach(function (el) { el.classList.remove('form-group--error'); });
    document.querySelectorAll('.radio-group--error').forEach(function (el) { el.classList.remove('radio-group--error'); });
    document.querySelectorAll('.form-error').forEach(function (el) { el.remove(); });

    var domain = document.getElementById('aiDomain');
    if (domain && !domain.value) {
      domain.closest('.form-group').classList.add('form-group--error');
      addError(domain, 'Please select a domain.');
      valid = false;
    }
    ['decisions', 'safety', 'biometric', 'interaction'].forEach(function (name) {
      var checked = document.querySelector('input[name="' + name + '"]:checked');
      if (!checked) {
        var radios = document.querySelectorAll('input[name="' + name + '"]');
        if (radios.length > 0) {
          var group = radios[0].closest('.form-group');
          var wrapper = radios[0].closest('div[style]');
          if (wrapper) wrapper.classList.add('radio-group--error');
          addError(group.querySelector('.form-label'), 'Please select an option.');
          valid = false;
        }
      }
    });
    return valid;
  }

  function addError(afterEl, message) {
    var err = document.createElement('p');
    err.className = 'form-error';
    err.textContent = message;
    afterEl.parentNode.insertBefore(err, afterEl.nextSibling);
  }

  nextBtn.addEventListener('click', function () {
    if (currentStep === 2 && !validateStep2()) { showToast('Please fill in all required fields.', 'error'); return; }
    if (currentStep >= steps.length) { submitAssessment(); return; }
    currentStep++;
    updateStepper(currentStep);
    saveAssessmentForm();
    // Populate dynamic steps
    if (currentStep === 3) populateStep3();
    if (currentStep === 4) populateStep4();
    if (currentStep === 5) populateStep5();
  });

  prevBtn.addEventListener('click', function () {
    if (currentStep > 1) { currentStep--; updateStepper(currentStep); }
  });

  steps.forEach(function (step, i) {
    var num = i + 1;
    step.setAttribute('role', 'button');
    step.setAttribute('tabindex', '0');
    step.addEventListener('click', function () { if (step.classList.contains('completed')) { currentStep = num; updateStepper(currentStep); } });
    step.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && step.classList.contains('completed')) { e.preventDefault(); currentStep = num; updateStepper(currentStep); } });
  });

  var formContainer = document.getElementById('step-2');
  if (formContainer) formContainer.addEventListener('change', saveAssessmentForm);
}

function populateStep3() {
  var container = document.getElementById('step3-obligations');
  if (!container) return;
  var form = AIComplyData.getWizardForm();
  var highRisk = ['hr', 'credit', 'education', 'law', 'migration', 'critical', 'healthcare', 'biometric'].indexOf(form.domain) !== -1;
  var obligations = highRisk ? [
    { article: 'Art. 9', title: 'Risk Management System', desc: 'Establish, implement, document and maintain a risk management system throughout the AI system lifecycle.' },
    { article: 'Art. 10', title: 'Data Governance', desc: 'Training, validation and testing data shall meet quality criteria relevant to the intended purpose.' },
    { article: 'Art. 11', title: 'Technical Documentation', desc: 'Draw up technical documentation before the system is placed on the market or put into service.' },
    { article: 'Art. 12', title: 'Record-Keeping', desc: 'High-risk AI systems shall allow for automatic recording of events (logs) over their lifetime.' },
    { article: 'Art. 13', title: 'Transparency', desc: 'Ensure operations are sufficiently transparent to enable deployers to interpret and use output appropriately.' },
    { article: 'Art. 14', title: 'Human Oversight', desc: 'Design systems to be effectively overseen by natural persons during use.' },
    { article: 'Art. 15', title: 'Accuracy, Robustness & Cybersecurity', desc: 'Achieve appropriate levels of accuracy, robustness, and cybersecurity.' }
  ] : [
    { article: 'Art. 50', title: 'Transparency Obligations', desc: 'Users must be informed when they are interacting with an AI system.' }
  ];
  container.innerHTML = obligations.map(function (o) {
    return '<div style="padding:var(--space-4);border:1px solid var(--color-gray-200);border-radius:var(--radius-md);margin-bottom:var(--space-3);">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);">' +
      '<strong>' + escapeHTML(o.article) + ' \u2014 ' + escapeHTML(o.title) + '</strong>' +
      '<label style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);cursor:pointer;">' +
      '<select class="form-select" style="width:auto;padding:2px 8px;font-size:var(--text-xs);" name="obligation_' + o.article.replace(/\W/g, '') + '">' +
      '<option value="not-assessed">Not Assessed</option><option value="met">Met</option><option value="partial">Partial</option><option value="not-met">Not Met</option></select></label></div>' +
      '<p class="text-sm text-muted">' + escapeHTML(o.desc) + '</p></div>';
  }).join('');
}

function populateStep4() {
  var container = document.getElementById('step4-docs');
  if (!container) return;
  var docs = [
    { name: 'System Design Document', desc: 'Architecture, data flows, and design decisions' },
    { name: 'Training Data Documentation', desc: 'Data sources, collection methods, and quality measures' },
    { name: 'Risk Assessment Report', desc: 'Identified risks and mitigation strategies' },
    { name: 'Testing & Validation Report', desc: 'Test results, accuracy metrics, and performance benchmarks' },
    { name: 'User Instructions', desc: 'Deployment guide and operational instructions for deployers' },
    { name: 'Human Oversight Procedures', desc: 'Protocols for human review and intervention' },
    { name: 'Change Log', desc: 'Version history and modification records' },
    { name: 'Conformity Declaration', desc: 'EU declaration of conformity (if applicable)' }
  ];
  container.innerHTML = '<p class="text-muted" style="margin-bottom:var(--space-4);">Check each document you have prepared or uploaded for this AI system:</p>' +
    docs.map(function (d, i) {
      return '<div class="checklist-item" style="cursor:pointer;">' +
        '<input type="checkbox" id="doc_' + i + '">' +
        '<div class="checklist-text"><label for="doc_' + i + '" style="cursor:pointer;font-weight:500;">' + escapeHTML(d.name) + '</label>' +
        '<span>' + escapeHTML(d.desc) + '</span></div></div>';
    }).join('');
}

function populateStep5() {
  var container = document.getElementById('step5-review');
  if (!container) return;
  var form = AIComplyData.getWizardForm();
  var domain = AIComplyData.domainLabel(form.domain || 'unknown');
  var highRisk = ['hr', 'credit', 'education', 'law', 'migration', 'critical', 'healthcare', 'biometric'].indexOf(form.domain) !== -1;
  var riskLevel = highRisk ? 'High Risk' : (form.domain === 'customer' ? 'Limited Risk' : 'Minimal Risk');

  container.innerHTML = '<div class="alert alert-info"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' +
    '<div><strong>Review Your Assessment</strong> Please review the information below before submitting. You can go back to any step to make changes.</div></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-5);">' +
    metaItem('Domain', domain) + metaItem('Risk Classification', '<span class="badge badge-risk-' + (highRisk ? 'high' : form.domain === 'customer' ? 'limited' : 'minimal') + '">' + riskLevel + '</span>') +
    metaItem('Automated Decisions', form.decisions === 'yes' ? 'Yes' : form.decisions === 'partial' ? 'Partially' : 'No') +
    metaItem('Safety Component', form.safety === 'yes' ? 'Yes' : form.safety === 'unsure' ? 'Unsure' : 'No') +
    metaItem('Biometric ID', form.biometric === 'yes' ? 'Yes' : 'No') +
    metaItem('Direct Interaction', form.interaction === 'yes' ? 'Yes' : 'No') +
    '</div>' +
    (form.notes ? '<div style="margin-bottom:var(--space-4);"><strong>Notes</strong><p class="text-sm text-muted" style="margin-top:var(--space-2);">' + escapeHTML(form.notes) + '</p></div>' : '') +
    '<div class="alert alert-warning"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
    '<div><strong>Submitting will:</strong><ul style="margin:var(--space-2) 0 0 var(--space-5);font-size:var(--text-sm);">' +
    '<li>Save the assessment to your records</li><li>Log the classification in the activity feed</li>' +
    '<li>Generate obligation requirements based on risk level</li></ul></div></div>';
}

function submitAssessment() {
  var form = AIComplyData.getWizardForm();
  var highRisk = ['hr', 'credit', 'education', 'law', 'migration', 'critical', 'healthcare', 'biometric'].indexOf(form.domain) !== -1;
  var riskLevel = highRisk ? 'High Risk' : (form.domain === 'customer' ? 'Limited Risk' : 'Minimal Risk');

  AIComplyData.addAssessment({
    systemName: AIComplyData.domainLabel(form.domain) + ' System',
    domain: form.domain,
    riskLevel: riskLevel,
    decisions: form.decisions,
    safety: form.safety,
    biometric: form.biometric,
    interaction: form.interaction,
    notes: form.notes
  });

  // Reset wizard
  AIComplyData.setWizardStep(2);
  AIComplyData.setWizardForm({});
  showToast('Assessment submitted successfully!', 'success');
  setTimeout(function () { window.location.href = getPageUrl('index.html'); }, 1000);
}

function saveAssessmentForm() {
  var domain = document.getElementById('aiDomain');
  var data = {};
  if (domain) data.domain = domain.value;
  ['decisions', 'safety', 'biometric', 'interaction'].forEach(function (name) {
    var checked = document.querySelector('input[name="' + name + '"]:checked');
    if (checked) data[name] = checked.value;
  });
  var textarea = document.querySelector('#step-2 .form-textarea');
  if (textarea) data.notes = textarea.value;
  AIComplyData.setWizardForm(data);
}

function restoreAssessmentForm() {
  var data = AIComplyData.getWizardForm();
  if (!data || Object.keys(data).length === 0) return;
  var domain = document.getElementById('aiDomain');
  if (domain && data.domain) { domain.value = data.domain; domain.dispatchEvent(new Event('change')); }
  ['decisions', 'safety', 'biometric', 'interaction'].forEach(function (name) {
    if (data[name]) { var r = document.querySelector('input[name="' + name + '"][value="' + data[name] + '"]'); if (r) r.checked = true; }
  });
  var textarea = document.querySelector('#step-2 .form-textarea');
  if (textarea && data.notes) textarea.value = data.notes;
}

/* ============================================================
   Dashboard Checklist
   ============================================================ */
function initChecklist() {
  var checklistItems = document.querySelectorAll('.checklist-item');
  if (checklistItems.length === 0 || typeof AIComplyData === 'undefined') return;

  var states = AIComplyData.getChecklist();
  checklistItems.forEach(function (item, i) {
    var cb = item.querySelector('input[type="checkbox"]');
    if (!cb) return;
    cb.disabled = false;
    if (i < states.length) { cb.checked = states[i]; item.classList.toggle('done', states[i]); }

    cb.addEventListener('change', function () {
      item.classList.toggle('done', cb.checked);
      saveChecklistState();
    });
    item.addEventListener('click', function (e) {
      if (e.target === cb) return;
      cb.checked = !cb.checked;
      item.classList.toggle('done', cb.checked);
      saveChecklistState();
    });
  });
  setTimeout(updateChecklistBadge, 0);
}

function saveChecklistState() {
  var items = document.querySelectorAll('.checklist-item');
  var states = [];
  items.forEach(function (item) { var cb = item.querySelector('input[type="checkbox"]'); states.push(cb ? cb.checked : false); });
  AIComplyData.saveChecklist(states);
  updateChecklistBadge();
}

function updateChecklistBadge() {
  var total = document.querySelectorAll('.checklist-item').length;
  var done = document.querySelectorAll('.checklist-item.done').length;
  var badge = document.querySelector('.card-header .badge-info');
  if (badge) badge.textContent = done + ' / ' + total + ' complete';
}

/* ============================================================
   Risk Classifier (Assessment Page)
   ============================================================ */
function initRiskClassifier() {
  var domainSelect = document.getElementById('aiDomain');
  var resultBox = document.getElementById('riskResult');
  if (!domainSelect || !resultBox) return;

  var highRiskDomains = ['hr', 'credit', 'education', 'law', 'migration', 'critical', 'healthcare', 'biometric'];
  var domainNames = { hr: 'Employment, workers management', credit: 'Access to essential private/public services (credit)', education: 'Education and vocational training', law: 'Law enforcement', migration: 'Migration, asylum and border control', critical: 'Critical infrastructure management', healthcare: 'Medical devices (Annex I)', biometric: 'Biometric identification and categorisation' };
  var categoryMap = { hr: '4', credit: '5', education: '3', law: '6', migration: '7', critical: '2', healthcare: '1', biometric: '1' };

  domainSelect.addEventListener('change', function () {
    var val = domainSelect.value;
    if (highRiskDomains.indexOf(val) !== -1) {
      resultBox.style.display = 'block';
      resultBox.querySelector('.alert').className = 'alert alert-warning';
      resultBox.querySelector('div > div').innerHTML = '<strong>Preliminary Classification: High Risk</strong> Based on your answers, this system likely falls under <strong>Annex III, Category ' + categoryMap[val] + '</strong> (' + domainNames[val] + '). You will need to comply with Articles 9\u201315 of the EU AI Act.';
    } else if (val === 'customer') {
      resultBox.style.display = 'block';
      resultBox.querySelector('.alert').className = 'alert alert-info';
      resultBox.querySelector('div > div').innerHTML = '<strong>Preliminary Classification: Limited Risk</strong> Systems that interact directly with natural persons (e.g. chatbots) have <strong>transparency obligations</strong> under Art. 50. Users must be informed they are interacting with an AI system.';
    } else if (val && val !== '') {
      resultBox.style.display = 'block';
      resultBox.querySelector('.alert').className = 'alert alert-success';
      resultBox.querySelector('div > div').innerHTML = '<strong>Preliminary Classification: Minimal Risk</strong> Based on your selection, this system is likely <strong>minimal risk</strong>. No mandatory compliance obligations, but voluntary codes of conduct are encouraged.';
    } else {
      resultBox.style.display = 'none';
    }
  });
}

/* ============================================================
   Risk Page — Dynamic Systems by Risk Level (pages/risk.html)
   ============================================================ */
function initRiskPageSystems() {
  var grid = document.getElementById('riskSystemsGrid');
  if (!grid || typeof AIComplyData === 'undefined') return;

  var systems = AIComplyData.getSystems();
  var groups = { high: [], limited: [], minimal: [] };
  systems.forEach(function (s) {
    if (groups[s.riskLevel]) groups[s.riskLevel].push(s);
  });

  var riskMeta = [
    { key: 'high', label: 'High Risk', borderColor: 'var(--risk-high)', bgColor: 'var(--risk-high)', textColor: '#fff' },
    { key: 'limited', label: 'Limited Risk', borderColor: 'var(--risk-limited)', bgColor: 'var(--risk-limited)', textColor: 'var(--color-gray-800)' },
    { key: 'minimal', label: 'Minimal Risk', borderColor: 'var(--risk-minimal)', bgColor: 'var(--risk-minimal)', textColor: '#fff' }
  ];

  grid.innerHTML = riskMeta.map(function (rm) {
    var list = groups[rm.key];
    var systemsHTML = list.length === 0 ?
      '<div style="padding:var(--space-3) 0;color:var(--color-gray-500);font-size:var(--text-sm);">No systems in this category.</div>' :
      list.map(function (s, i) {
        var color = AIComplyData.complianceColor(s.compliance);
        var border = i < list.length - 1 ? 'border-bottom:1px solid var(--color-gray-100);' : '';
        return '<div style="padding:var(--space-3) 0;' + border + '">' +
          '<strong class="text-sm">' + escapeHTML(s.name) + '</strong>' +
          '<div style="display:flex;align-items:center;gap:8px;margin-top:4px;">' +
          '<div class="progress-bar" style="flex:1;"><div class="progress-fill ' + color + '" style="width:' + s.compliance + '%;"></div></div>' +
          '<span class="text-xs">' + s.compliance + '%</span></div></div>';
      }).join('');

    return '<div style="border:2px solid ' + rm.borderColor + ';border-radius:var(--radius-lg);overflow:hidden;">' +
      '<div style="background:' + rm.bgColor + ';color:' + rm.textColor + ';padding:var(--space-3) var(--space-4);">' +
      '<strong>' + rm.label + '</strong>' +
      '<span style="float:right;font-size:var(--text-sm);opacity:0.9;">' + list.length + ' system' + (list.length !== 1 ? 's' : '') + '</span></div>' +
      '<div style="padding:var(--space-4);">' + systemsHTML + '</div></div>';
  }).join('');
}

/* ============================================================
   Report Page (ai-test-1.html)
   ============================================================ */
function initReportPage() {
  // Only run on report page
  if (!document.querySelector('.report-meta')) return;

  // Wire up print/PDF export
  document.querySelectorAll('[data-action="toast"]').forEach(function (btn) {
    var toast = btn.getAttribute('data-toast') || '';
    if (toast.indexOf('PDF') !== -1) {
      btn.removeAttribute('data-action');
      btn.removeAttribute('data-toast');
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        exportPDF();
      });
    } else if (toast.indexOf('sharing') !== -1) {
      btn.removeAttribute('data-action');
      btn.removeAttribute('data-toast');
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openShareModal();
      });
    } else if (toast.indexOf('re-run') !== -1 || toast.indexOf('Re-run') !== -1) {
      btn.removeAttribute('data-action');
      btn.removeAttribute('data-toast');
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        rerunTest(btn);
      });
    }
  });
}

function exportPDF() {
  showToast('Preparing PDF...', 'info');
  if (typeof AIComplyData !== 'undefined') {
    AIComplyData.addExport({ type: 'PDF', name: document.title, format: 'pdf' });
  }
  setTimeout(function () { window.print(); }, 300);
}

function openShareModal() {
  var url = window.location.href;
  var body = '<div class="form-group"><label class="form-label">Share Link</label>' +
    '<div style="display:flex;gap:var(--space-2);"><input class="form-input" id="shareUrl" value="' + escapeAttr(url) + '" readonly>' +
    '<button class="btn btn-primary" onclick="copyShareLink()">Copy</button></div></div>' +
    '<div class="form-group" style="margin-top:var(--space-4);"><label class="form-label">Email to</label>' +
    '<input class="form-input" id="shareEmail" placeholder="colleague@company.com"></div>';
  var footer = '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>' +
    '<button class="btn btn-primary" onclick="sendShareEmail()">Send</button>';
  openModal('Share Report', body, footer);
}

function copyShareLink() {
  var input = document.getElementById('shareUrl');
  if (input) { input.select(); document.execCommand('copy'); showToast('Link copied to clipboard.', 'success'); }
}

function sendShareEmail() {
  var email = document.getElementById('shareEmail');
  if (email && email.value.trim()) {
    showToast('Report shared with ' + email.value.trim(), 'success');
    if (typeof AIComplyData !== 'undefined') {
      AIComplyData.addActivity({ type: 'info', title: 'Report shared', detail: '\u2014 Sent to ' + email.value.trim() });
    }
    closeModal();
  } else {
    showToast('Please enter an email address.', 'error');
  }
}

function rerunTest(btn) {
  btn.disabled = true;
  btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg> Running...';
  showToast('Re-running compliance tests...', 'info');
  setTimeout(function () {
    btn.disabled = false;
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg> Re-run Test';
    showToast('Test run complete. Results updated.', 'success');
    if (typeof AIComplyData !== 'undefined') {
      AIComplyData.addActivity({ type: 'success', title: 'Test re-run completed', detail: '\u2014 AI Test 1 for HR Screening Tool' });
    }
  }, 3000);
}

/* ============================================================
   Export CSV
   ============================================================ */
function exportCSV() {
  var systems = AIComplyData.getSystems();
  var csv = 'Name,Version,Domain,Risk Level,Status,Compliance %,Provider,Last Reviewed,Deployment Date\n';
  systems.forEach(function (s) {
    csv += '"' + (s.name || '') + '","' + (s.version || '') + '","' + AIComplyData.domainLabel(s.domain) + '","' +
      AIComplyData.riskLevelLabel(s.riskLevel) + '","' + AIComplyData.statusLabel(s.status) + '",' +
      s.compliance + ',"' + (s.provider || '') + '","' + AIComplyData.formatDate(s.lastReviewed) + '","' +
      AIComplyData.formatDate(s.deploymentDate) + '"\n';
  });
  downloadFile(csv, 'ai-comply-systems-' + new Date().toISOString().slice(0, 10) + '.csv', 'text/csv');
  AIComplyData.addExport({ type: 'CSV', name: 'AI Systems Export', format: 'csv' });
  showToast('CSV exported successfully.', 'success');
}

function downloadFile(content, filename, mimeType) {
  var blob = new Blob([content], { type: mimeType });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

/* ============================================================
   Team Page (pages/team.html)
   ============================================================ */
function initTeamPage() {
  var container = document.getElementById('teamTableBody');
  if (!container || typeof AIComplyData === 'undefined') return;
  renderTeamTable();
}

function renderTeamTable() {
  var container = document.getElementById('teamTableBody');
  if (!container) return;
  var team = AIComplyData.getTeam();
  var permLabels = { admin: 'Admin', editor: 'Editor', viewer: 'Viewer' };
  var permBadge = { admin: 'badge-danger', editor: 'badge-info', viewer: 'badge-neutral' };
  container.innerHTML = team.map(function (m) {
    return '<tr><td><div style="display:flex;align-items:center;gap:var(--space-3);">' +
      '<div class="sidebar-avatar" style="width:32px;height:32px;font-size:var(--text-xs);">' + escapeHTML(m.avatar) + '</div>' +
      '<div><strong>' + escapeHTML(m.name) + '</strong><div class="text-xs text-muted">' + escapeHTML(m.email) + '</div></div></div></td>' +
      '<td>' + escapeHTML(m.role) + '</td>' +
      '<td><span class="badge ' + (permBadge[m.permissions] || 'badge-neutral') + '">' + (permLabels[m.permissions] || m.permissions) + '</span></td>' +
      '<td class="text-sm text-muted">' + AIComplyData.formatDate(m.lastActive) + '</td>' +
      '<td><button class="btn btn-sm btn-ghost" onclick="openEditTeamMemberModal(\'' + m.id + '\')">Edit</button>' +
      '<button class="btn btn-sm btn-ghost" style="color:var(--color-danger);" onclick="removeTeamMember(\'' + m.id + '\')">Remove</button></td></tr>';
  }).join('');
  var countEl = document.getElementById('teamCount');
  if (countEl) countEl.textContent = team.length;
  var roleEl = document.getElementById('roleCount');
  if (roleEl) {
    var roles = {};
    team.forEach(function (m) { roles[m.role] = true; });
    roleEl.textContent = Object.keys(roles).length;
  }
  var deptEl = document.getElementById('deptCount');
  if (deptEl) {
    var depts = {};
    team.forEach(function (m) { depts[m.permissions] = true; });
    deptEl.textContent = Object.keys(depts).length;
  }
}

function openAddTeamMemberModal() {
  var body = '<form id="addTeamForm">' +
    '<div class="form-group"><label class="form-label">Full Name *</label><input class="form-input" name="name" required></div>' +
    '<div class="form-group"><label class="form-label">Email *</label><input class="form-input" name="email" type="email" required></div>' +
    '<div class="form-group"><label class="form-label">Role *</label><select class="form-select" name="role" required>' +
    '<option value="">Select role...</option><option value="Compliance Officer">Compliance Officer</option><option value="AI Engineer">AI Engineer</option>' +
    '<option value="Data Protection Officer">Data Protection Officer</option><option value="Legal Counsel">Legal Counsel</option>' +
    '<option value="ML Operations Lead">ML Operations Lead</option><option value="Auditor">Auditor</option><option value="Other">Other</option></select></div>' +
    '<div class="form-group"><label class="form-label">Permissions</label><select class="form-select" name="permissions">' +
    '<option value="viewer">Viewer</option><option value="editor">Editor</option><option value="admin">Admin</option></select></div></form>';
  var footer = '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="submitAddTeamMember()">Add Member</button>';
  openModal('Add Team Member', body, footer);
}

function submitAddTeamMember() {
  var form = document.getElementById('addTeamForm');
  if (!form) return;
  var name = form.querySelector('[name="name"]').value.trim();
  var email = form.querySelector('[name="email"]').value.trim();
  var role = form.querySelector('[name="role"]').value;
  if (!name || !email || !role) { showToast('Please fill in all required fields.', 'error'); return; }
  AIComplyData.addTeamMember({ name: name, email: email, role: role, permissions: form.querySelector('[name="permissions"]').value });
  closeModal();
  showToast(name + ' added to the team.', 'success');
  renderTeamTable();
}

function openEditTeamMemberModal(id) {
  var team = AIComplyData.getTeam();
  var m = team.find(function (t) { return t.id === id; });
  if (!m) return;
  var body = '<form id="editTeamForm" data-member-id="' + m.id + '">' +
    '<div class="form-group"><label class="form-label">Full Name</label><input class="form-input" name="name" value="' + escapeAttr(m.name) + '"></div>' +
    '<div class="form-group"><label class="form-label">Email</label><input class="form-input" name="email" value="' + escapeAttr(m.email) + '"></div>' +
    '<div class="form-group"><label class="form-label">Role</label><select class="form-select" name="role">' +
    ['Compliance Officer', 'AI Engineer', 'Data Protection Officer', 'Legal Counsel', 'ML Operations Lead', 'Auditor', 'Other'].map(function (r) {
      return '<option' + (m.role === r ? ' selected' : '') + '>' + r + '</option>';
    }).join('') + '</select></div>' +
    '<div class="form-group"><label class="form-label">Permissions</label><select class="form-select" name="permissions">' +
    '<option value="viewer"' + (m.permissions === 'viewer' ? ' selected' : '') + '>Viewer</option>' +
    '<option value="editor"' + (m.permissions === 'editor' ? ' selected' : '') + '>Editor</option>' +
    '<option value="admin"' + (m.permissions === 'admin' ? ' selected' : '') + '>Admin</option></select></div></form>';
  var footer = '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="submitEditTeamMember()">Save</button>';
  openModal('Edit: ' + m.name, body, footer);
}

function submitEditTeamMember() {
  var form = document.getElementById('editTeamForm');
  if (!form) return;
  AIComplyData.updateTeamMember(form.getAttribute('data-member-id'), {
    name: form.querySelector('[name="name"]').value.trim(),
    email: form.querySelector('[name="email"]').value.trim(),
    role: form.querySelector('[name="role"]').value,
    permissions: form.querySelector('[name="permissions"]').value
  });
  closeModal();
  showToast('Team member updated.', 'success');
  renderTeamTable();
}

function removeTeamMember(id) {
  if (!confirm('Remove this team member?')) return;
  AIComplyData.removeTeamMember(id);
  showToast('Team member removed.', 'success');
  renderTeamTable();
}

/* ============================================================
   Systems Registry Page (pages/systems.html)
   ============================================================ */
function initSystemsPage() {
  var container = document.getElementById('registryTableBody');
  if (!container || typeof AIComplyData === 'undefined') return;
  renderRegistryTable();

  var filterEl = document.getElementById('systemFilter');
  if (filterEl) {
    filterEl.addEventListener('change', function () { renderRegistryTable(filterEl.value); });
  }
  var searchEl = document.getElementById('systemSearch');
  if (searchEl) {
    searchEl.addEventListener('input', function () { renderRegistryTable(null, searchEl.value.trim()); });
  }
}

function renderRegistryTable(filter, search) {
  var container = document.getElementById('registryTableBody');
  if (!container) return;
  var systems = AIComplyData.getSystems();
  filter = filter || (document.getElementById('systemFilter') || {}).value || '';
  search = (search || (document.getElementById('systemSearch') || {}).value || '').toLowerCase();

  var filtered = systems.filter(function (s) {
    if (filter && s.riskLevel !== filter) return false;
    if (search && s.name.toLowerCase().indexOf(search) === -1 && s.purpose.toLowerCase().indexOf(search) === -1) return false;
    return true;
  });

  container.innerHTML = filtered.length === 0 ?
    '<tr><td colspan="7" style="text-align:center;padding:var(--space-8);color:var(--color-gray-500);">No systems match your filters.</td></tr>' :
    filtered.map(function (s) {
      var color = AIComplyData.complianceColor(s.compliance);
      return '<tr><td><strong>' + escapeHTML(s.name) + '</strong><div class="text-xs text-muted">' + escapeHTML(s.version || '') + '</div></td>' +
        '<td><span class="badge ' + AIComplyData.riskBadgeClass(s.riskLevel) + '">' + AIComplyData.riskLevelLabel(s.riskLevel) + '</span></td>' +
        '<td class="text-sm">' + escapeHTML(s.purpose) + '</td>' +
        '<td><span class="badge ' + AIComplyData.statusBadgeClass(s.status) + '">' + AIComplyData.statusLabel(s.status) + '</span></td>' +
        '<td><div style="display:flex;align-items:center;gap:8px;"><div class="progress-bar" style="width:80px;"><div class="progress-fill ' + color + '" style="width:' + s.compliance + '%;"></div></div><span class="text-xs">' + s.compliance + '%</span></div></td>' +
        '<td class="text-sm text-muted">' + AIComplyData.formatDate(s.lastReviewed) + '</td>' +
        '<td><button class="btn btn-sm btn-ghost" data-action="modal" data-modal="view-system" data-system-id="' + s.id + '">View</button>' +
        '<button class="btn btn-sm btn-ghost" data-action="modal" data-modal="edit-system" data-system-id="' + s.id + '">Edit</button></td></tr>';
    }).join('');
  var countEl = document.getElementById('systemCount');
  if (countEl) countEl.textContent = filtered.length + ' of ' + systems.length + ' systems';
}

/* ============================================================
   Export Page (pages/export.html)
   ============================================================ */
function initExportPage() {
  var container = document.getElementById('exportHistory');
  if (!container || typeof AIComplyData === 'undefined') return;
  renderExportHistory();
}

function renderExportHistory() {
  var container = document.getElementById('exportHistory');
  if (!container) return;
  var exports = AIComplyData.getExports();
  if (exports.length === 0) {
    container.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:var(--space-8);color:var(--color-gray-500);">No exports yet. Use the buttons above to generate your first export.</td></tr>';
    return;
  }
  container.innerHTML = exports.map(function (ex) {
    return '<tr><td><strong>' + escapeHTML(ex.name) + '</strong></td>' +
      '<td><span class="badge badge-neutral">' + escapeHTML(ex.format || ex.type).toUpperCase() + '</span></td>' +
      '<td class="text-sm text-muted">' + AIComplyData.formatDate(ex.date ? ex.date.slice(0, 10) : '') + '</td>' +
      '<td class="text-sm text-muted">' + escapeHTML(ex.id) + '</td></tr>';
  }).join('');
}

function exportTeamCSV() {
  var team = AIComplyData.getTeam();
  var csv = 'Name,Email,Role,Permissions,Last Active\n';
  team.forEach(function (m) {
    csv += '"' + m.name + '","' + m.email + '","' + m.role + '","' + m.permissions + '","' + AIComplyData.formatDate(m.lastActive) + '"\n';
  });
  downloadFile(csv, 'ai-comply-team-' + new Date().toISOString().slice(0, 10) + '.csv', 'text/csv');
  AIComplyData.addExport({ type: 'CSV', name: 'Team Export', format: 'csv' });
  showToast('Team CSV exported.', 'success');
  renderExportHistory();
}

function exportAssessmentsCSV() {
  var assessments = AIComplyData.getAssessments();
  var csv = 'ID,Date,System,Domain,Risk Level\n';
  assessments.forEach(function (a) {
    csv += '"' + a.id + '","' + (a.date || '') + '","' + (a.systemName || '') + '","' + (a.domain || '') + '","' + (a.riskLevel || '') + '"\n';
  });
  downloadFile(csv, 'ai-comply-assessments-' + new Date().toISOString().slice(0, 10) + '.csv', 'text/csv');
  AIComplyData.addExport({ type: 'CSV', name: 'Assessments Export', format: 'csv' });
  showToast('Assessments CSV exported.', 'success');
  renderExportHistory();
}

function exportActivityCSV() {
  var activity = AIComplyData.getActivity();
  var csv = 'Type,Title,Detail,Time\n';
  activity.forEach(function (a) {
    csv += '"' + (a.type || '') + '","' + (a.title || '') + '","' + (a.detail || '') + '","' + (a.time || '') + '"\n';
  });
  downloadFile(csv, 'ai-comply-activity-' + new Date().toISOString().slice(0, 10) + '.csv', 'text/csv');
  AIComplyData.addExport({ type: 'CSV', name: 'Activity Log Export', format: 'csv' });
  showToast('Activity log CSV exported.', 'success');
  renderExportHistory();
}

function exportFullReport() {
  exportPDF();
  renderExportHistory();
}

/* ============================================================
   Documentation Page (pages/documentation.html)
   ============================================================ */
function initDocumentationPage() {
  var searchEl = document.getElementById('docSearch');
  if (!searchEl) return;
  searchEl.addEventListener('input', function () {
    var q = searchEl.value.toLowerCase();
    document.querySelectorAll('.doc-item').forEach(function (item) {
      var text = item.textContent.toLowerCase();
      item.style.display = (q === '' || text.indexOf(q) !== -1) ? '' : 'none';
    });
  });
}

/* ============================================================
   Helpers
   ============================================================ */
function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return escapeHTML(str);
}

function metaItem(label, value) {
  return '<div style="padding:var(--space-3);background:var(--color-gray-50);border-radius:var(--radius-md);border:1px solid var(--color-gray-200);">' +
    '<div class="text-xs text-muted" style="font-weight:600;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:2px;">' + escapeHTML(label) + '</div>' +
    '<div style="font-size:var(--text-sm);font-weight:600;">' + value + '</div></div>';
}

function scoreBar(label, value) {
  var color = AIComplyData.complianceColor(value);
  return '<div><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span class="text-sm">' + escapeHTML(label) + '</span><span class="text-sm" style="font-weight:600;">' + value + '%</span></div>' +
    '<div class="progress-bar"><div class="progress-fill ' + color + '" style="width:' + value + '%;"></div></div></div>';
}

function scoreInput(label, name, value) {
  return '<div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:var(--text-xs);">' + escapeHTML(label) + '</label>' +
    '<input class="form-input" type="number" name="' + name + '" min="0" max="100" value="' + value + '"></div>';
}

function getPageUrl(path) {
  var loc = window.location.pathname;
  if (loc.indexOf('/pages/') !== -1) {
    if (path.indexOf('pages/') === 0) return path.replace('pages/', '');
    return '../' + path;
  }
  return path;
}

function refreshCurrentPage() {
  // Re-render dynamic content without full reload
  if (typeof renderDashboardStats === 'function' && document.querySelector('.stats-grid')) {
    renderDashboardStats();
    renderDashboardScores();
    renderDashboardActivity();
    renderDashboardSystems();
  }
  if (typeof renderRegistryTable === 'function' && document.getElementById('registryTableBody')) {
    renderRegistryTable();
  }
  if (typeof renderTeamTable === 'function' && document.getElementById('teamTableBody')) {
    renderTeamTable();
  }
  initNotificationBadge();
}
