/**
 * AI Comply — EU AI Act Compliance Platform
 * Interactive UI functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  initToastSystem();
  initSidebarToggle();
  initTabs();
  initWizard();
  initChecklist();
  initRiskClassifier();
  initActionButtons();
  initStepperNavigation();
});

/* ---- Toast Notification System ---- */
let toastContainer;

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
    toast.addEventListener('animationend', function () {
      toast.remove();
    });
  }, 3000);
}

/* ---- Action Buttons (Issues #1, #10) ---- */
function initActionButtons() {
  // Delegated listener for data-action="toast" buttons
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action="toast"]');
    if (btn) {
      e.preventDefault();
      var msg = btn.getAttribute('data-toast') || 'This feature is coming soon.';
      var type = btn.getAttribute('data-toast-type') || 'info';
      showToast(msg, type);
    }

    var navBtn = e.target.closest('[data-action="navigate"]');
    if (navBtn) {
      e.preventDefault();
      var dest = navBtn.getAttribute('data-href');
      if (dest) {
        showToast('Redirecting...', 'info');
        setTimeout(function () { window.location.href = dest; }, 600);
      }
    }
  });
}

/* ---- Sidebar Mobile Toggle ---- */
function initSidebarToggle() {
  var toggle = document.getElementById('menuToggle');
  var sidebar = document.getElementById('sidebar');
  if (!toggle || !sidebar) return;

  // Create overlay element
  var overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  overlay.id = 'sidebarOverlay';
  document.body.appendChild(overlay);

  // Set initial ARIA state
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Toggle navigation');

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function () {
    if (sidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  overlay.addEventListener('click', closeSidebar);

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
      closeSidebar();
    }
  });
}

/* ---- Tab Switching ---- */
function initTabs() {
  var tabContainers = document.querySelectorAll('.tabs');

  tabContainers.forEach(function (container) {
    // Add ARIA attributes (Issue #18)
    container.setAttribute('role', 'tablist');
    var tabs = container.querySelectorAll('.tab');
    var parent = container.parentElement;

    tabs.forEach(function (tab, i) {
      var tabId = tab.getAttribute('data-tab');
      tab.setAttribute('role', 'tab');
      tab.setAttribute('tabindex', '0');
      tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');
      if (tabId) {
        tab.setAttribute('aria-controls', 'tab-' + tabId);
        tab.id = 'tab-btn-' + tabId;
      }

      // Set ARIA on panels
      var panel = parent.querySelector('#tab-' + tabId);
      if (panel) {
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', 'tab-btn-' + tabId);
      }

      tab.addEventListener('click', function () {
        activateTab(container, tab, parent);
      });

      tab.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activateTab(container, tab, parent);
        }
      });
    });
  });
}

function activateTab(container, tab, parent) {
  var tabId = tab.getAttribute('data-tab');
  var tabs = container.querySelectorAll('.tab');

  tabs.forEach(function (t) {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  tab.classList.add('active');
  tab.setAttribute('aria-selected', 'true');

  parent.querySelectorAll('.tab-content').forEach(function (content) {
    content.classList.remove('active');
  });
  var target = parent.querySelector('#tab-' + tabId);
  if (target) target.classList.add('active');
}

/* ---- Assessment Wizard Stepper ---- */
function initWizard() {
  var nextBtn = document.getElementById('nextStep');
  var prevBtn = document.getElementById('prevStep');
  if (!nextBtn) return;

  var steps = document.querySelectorAll('.stepper-step');
  var stepContents = document.querySelectorAll('[id^="step-"]');
  var stepperLines = document.querySelectorAll('.stepper-line');
  var currentStep = 2; // Start at step 2 (step 1 is already completed)

  // Restore wizard state from localStorage (Issue #4)
  var savedStep = localStorage.getItem('aicomply_wizard_step');
  if (savedStep) {
    currentStep = parseInt(savedStep, 10);
    if (isNaN(currentStep) || currentStep < 1 || currentStep > steps.length) {
      currentStep = 2;
    }
  }

  // Restore form values
  restoreAssessmentForm();

  updateStepper(currentStep);

  function updateStepper(step) {
    steps.forEach(function (s, i) {
      var stepNum = i + 1;
      s.classList.remove('active', 'completed');

      if (stepNum < step) {
        s.classList.add('completed');
        s.querySelector('.stepper-circle').innerHTML =
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
      } else if (stepNum === step) {
        s.classList.add('active');
        s.querySelector('.stepper-circle').textContent = stepNum;
      } else {
        s.querySelector('.stepper-circle').textContent = stepNum;
      }
    });

    stepperLines.forEach(function (line, i) {
      line.classList.toggle('completed', i < step - 1);
    });

    stepContents.forEach(function (content) {
      content.classList.remove('active');
    });
    var activeContent = document.getElementById('step-' + step);
    if (activeContent) activeContent.classList.add('active');

    // Persist step (Issue #4)
    localStorage.setItem('aicomply_wizard_step', step);
  }

  // Validate Step 2 before advancing (Issue #3)
  function validateStep2() {
    var valid = true;

    // Clear previous errors
    document.querySelectorAll('.form-group--error').forEach(function (el) {
      el.classList.remove('form-group--error');
    });
    document.querySelectorAll('.radio-group--error').forEach(function (el) {
      el.classList.remove('radio-group--error');
    });
    document.querySelectorAll('.form-error').forEach(function (el) {
      el.remove();
    });

    // Domain select
    var domain = document.getElementById('aiDomain');
    if (domain && !domain.value) {
      domain.closest('.form-group').classList.add('form-group--error');
      addError(domain, 'Please select a domain.');
      valid = false;
    }

    // Radio groups
    var radioGroups = ['decisions', 'safety', 'biometric', 'interaction'];
    radioGroups.forEach(function (name) {
      var checked = document.querySelector('input[name="' + name + '"]:checked');
      if (!checked) {
        var radios = document.querySelectorAll('input[name="' + name + '"]');
        if (radios.length > 0) {
          var group = radios[0].closest('.form-group');
          var radioWrapper = radios[0].closest('div[style]');
          if (radioWrapper) radioWrapper.classList.add('radio-group--error');
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
    // Validate step 2 before advancing to step 3
    if (currentStep === 2 && !validateStep2()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    if (currentStep < steps.length) {
      currentStep++;
      updateStepper(currentStep);
      saveAssessmentForm();
    }
  });

  prevBtn.addEventListener('click', function () {
    if (currentStep > 1) {
      currentStep--;
      updateStepper(currentStep);
    }
  });

  // Make completed steps clickable (Issue #13)
  steps.forEach(function (step, i) {
    var stepNum = i + 1;
    step.setAttribute('role', 'button');
    step.setAttribute('tabindex', '0');
    step.setAttribute('aria-label', 'Step ' + stepNum);

    step.addEventListener('click', function () {
      if (step.classList.contains('completed')) {
        currentStep = stepNum;
        updateStepper(currentStep);
      }
    });

    step.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && step.classList.contains('completed')) {
        e.preventDefault();
        currentStep = stepNum;
        updateStepper(currentStep);
      }
    });
  });

  // Save form on input change (Issue #4)
  var formContainer = document.getElementById('step-2');
  if (formContainer) {
    formContainer.addEventListener('change', saveAssessmentForm);
  }
}

/* ---- Assessment Form Persistence (Issue #4) ---- */
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

  localStorage.setItem('aicomply_assessment_form', JSON.stringify(data));
}

function restoreAssessmentForm() {
  var saved = localStorage.getItem('aicomply_assessment_form');
  if (!saved) return;

  try {
    var data = JSON.parse(saved);

    var domain = document.getElementById('aiDomain');
    if (domain && data.domain) {
      domain.value = data.domain;
      // Trigger change to show risk result
      domain.dispatchEvent(new Event('change'));
    }

    ['decisions', 'safety', 'biometric', 'interaction'].forEach(function (name) {
      if (data[name]) {
        var radio = document.querySelector('input[name="' + name + '"][value="' + data[name] + '"]');
        if (radio) radio.checked = true;
      }
    });

    var textarea = document.querySelector('#step-2 .form-textarea');
    if (textarea && data.notes) textarea.value = data.notes;
  } catch (e) {
    // ignore corrupt data
  }
}

/* ---- Dashboard Checklist ---- */
function initChecklist() {
  var checklistItems = document.querySelectorAll('.checklist-item');
  if (checklistItems.length === 0) return;

  // Restore from localStorage (Issue #4)
  restoreChecklist(checklistItems);

  checklistItems.forEach(function (item, index) {
    var checkbox = item.querySelector('input[type="checkbox"]');
    if (!checkbox) return;

    // Make all checkboxes interactive (remove disabled)
    checkbox.disabled = false;

    checkbox.addEventListener('change', function () {
      item.classList.toggle('done', checkbox.checked);
      updateChecklistBadge();
      saveChecklist();
    });

    item.addEventListener('click', function (e) {
      if (e.target === checkbox) return;
      checkbox.checked = !checkbox.checked;
      item.classList.toggle('done', checkbox.checked);
      updateChecklistBadge();
      saveChecklist();
    });
  });
}

function updateChecklistBadge() {
  var total = document.querySelectorAll('.checklist-item').length;
  var done = document.querySelectorAll('.checklist-item.done').length;
  var badge = document.querySelector('.card-header .badge-info');
  if (badge) {
    badge.textContent = done + ' / ' + total + ' complete';
  }
}

function saveChecklist() {
  var items = document.querySelectorAll('.checklist-item');
  var states = [];
  items.forEach(function (item) {
    var cb = item.querySelector('input[type="checkbox"]');
    states.push(cb ? cb.checked : false);
  });
  localStorage.setItem('aicomply_checklist', JSON.stringify(states));
}

function restoreChecklist(items) {
  var saved = localStorage.getItem('aicomply_checklist');
  if (!saved) return;
  try {
    var states = JSON.parse(saved);
    items.forEach(function (item, i) {
      if (i < states.length) {
        var cb = item.querySelector('input[type="checkbox"]');
        if (cb) {
          cb.checked = states[i];
          cb.disabled = false;
          item.classList.toggle('done', states[i]);
        }
      }
    });
    // Defer badge update
    setTimeout(updateChecklistBadge, 0);
  } catch (e) {
    // ignore corrupt data
  }
}

/* ---- Risk Classifier (Assessment Page) ---- */
function initRiskClassifier() {
  var domainSelect = document.getElementById('aiDomain');
  var resultBox = document.getElementById('riskResult');
  if (!domainSelect || !resultBox) return;

  var highRiskDomains = ['hr', 'credit', 'education', 'law', 'migration', 'critical', 'healthcare', 'biometric'];

  domainSelect.addEventListener('change', function () {
    var val = domainSelect.value;
    if (highRiskDomains.indexOf(val) !== -1) {
      resultBox.style.display = 'block';
      resultBox.querySelector('.alert').className = 'alert alert-warning';

      var domainNames = {
        hr: 'Employment, workers management',
        credit: 'Access to essential private/public services (credit)',
        education: 'Education and vocational training',
        law: 'Law enforcement',
        migration: 'Migration, asylum and border control',
        critical: 'Critical infrastructure management',
        healthcare: 'Medical devices (Annex I)',
        biometric: 'Biometric identification and categorisation',
      };

      var categoryMap = {
        hr: '4', credit: '5', education: '3', law: '6',
        migration: '7', critical: '2', healthcare: '1', biometric: '1',
      };

      resultBox.querySelector('div > div').innerHTML =
        '<strong>Preliminary Classification: High Risk</strong> ' +
        'Based on your answers, this system likely falls under <strong>Annex III, Category ' + categoryMap[val] + '</strong> (' + domainNames[val] + '). You will need to comply with Articles 9\u201315 of the EU AI Act.';
    } else if (val === 'customer') {
      resultBox.style.display = 'block';
      resultBox.querySelector('.alert').className = 'alert alert-info';
      resultBox.querySelector('div > div').innerHTML =
        '<strong>Preliminary Classification: Limited Risk</strong> ' +
        'Systems that interact directly with natural persons (e.g. chatbots) have <strong>transparency obligations</strong> under Art. 50. Users must be informed they are interacting with an AI system.';
    } else if (val && val !== '') {
      resultBox.style.display = 'block';
      resultBox.querySelector('.alert').className = 'alert alert-success';
      resultBox.querySelector('div > div').innerHTML =
        '<strong>Preliminary Classification: Minimal Risk</strong> ' +
        'Based on your selection, this system is likely <strong>minimal risk</strong>. No mandatory compliance obligations, but voluntary codes of conduct are encouraged.';
    } else {
      resultBox.style.display = 'none';
    }
  });
}

/* ---- Stepper Navigation for completed steps (Issue #13) ---- */
function initStepperNavigation() {
  // Handled inside initWizard for steps that exist on assessment page
  // This is a no-op for pages without the wizard
}
