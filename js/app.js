/**
 * AI Comply — EU AI Act Compliance Platform
 * Interactive UI functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  initSidebarToggle();
  initTabs();
  initWizard();
  initChecklist();
  initRiskClassifier();
});

/* ---- Sidebar Mobile Toggle ---- */
function initSidebarToggle() {
  const toggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 &&
        sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        !toggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

/* ---- Tab Switching ---- */
function initTabs() {
  const tabContainers = document.querySelectorAll('.tabs');

  tabContainers.forEach((container) => {
    const tabs = container.querySelectorAll('.tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');

        // Deactivate all tabs in this container
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        // Show matching content
        const parent = container.parentElement;
        parent.querySelectorAll('.tab-content').forEach((content) => {
          content.classList.remove('active');
        });
        const target = parent.querySelector(`#tab-${tabId}`);
        if (target) target.classList.add('active');
      });
    });
  });
}

/* ---- Assessment Wizard Stepper ---- */
function initWizard() {
  const nextBtn = document.getElementById('nextStep');
  const prevBtn = document.getElementById('prevStep');
  if (!nextBtn) return;

  const steps = document.querySelectorAll('.stepper-step');
  const stepContents = document.querySelectorAll('[id^="step-"]');
  const stepperLines = document.querySelectorAll('.stepper-line');
  let currentStep = 2; // Start at step 2 (step 1 is already completed)

  function updateStepper(step) {
    steps.forEach((s, i) => {
      const stepNum = i + 1;
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

    stepperLines.forEach((line, i) => {
      line.classList.toggle('completed', i < step - 1);
    });

    // Show/hide step content
    stepContents.forEach((content) => {
      content.classList.remove('active');
    });
    const activeContent = document.getElementById(`step-${step}`);
    if (activeContent) activeContent.classList.add('active');
  }

  nextBtn.addEventListener('click', () => {
    if (currentStep < steps.length) {
      currentStep++;
      updateStepper(currentStep);
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      updateStepper(currentStep);
    }
  });
}

/* ---- Dashboard Checklist ---- */
function initChecklist() {
  const checklistItems = document.querySelectorAll('.checklist-item');
  checklistItems.forEach((item) => {
    const checkbox = item.querySelector('input[type="checkbox"]');
    if (!checkbox || checkbox.disabled) return;

    checkbox.addEventListener('change', () => {
      item.classList.toggle('done', checkbox.checked);
      updateChecklistBadge();
    });

    item.addEventListener('click', (e) => {
      if (e.target === checkbox) return;
      checkbox.checked = !checkbox.checked;
      item.classList.toggle('done', checkbox.checked);
      updateChecklistBadge();
    });
  });
}

function updateChecklistBadge() {
  const total = document.querySelectorAll('.checklist-item').length;
  const done = document.querySelectorAll('.checklist-item.done').length;
  const badge = document.querySelector('.card-header .badge-info');
  if (badge) {
    badge.textContent = `${done} / ${total} complete`;
  }
}

/* ---- Risk Classifier (Assessment Page) ---- */
function initRiskClassifier() {
  const domainSelect = document.getElementById('aiDomain');
  const resultBox = document.getElementById('riskResult');
  if (!domainSelect || !resultBox) return;

  const highRiskDomains = ['hr', 'credit', 'education', 'law', 'migration', 'critical', 'healthcare', 'biometric'];

  domainSelect.addEventListener('change', () => {
    const val = domainSelect.value;
    if (highRiskDomains.includes(val)) {
      resultBox.style.display = 'block';

      const domainNames = {
        hr: 'Employment, workers management',
        credit: 'Access to essential private/public services (credit)',
        education: 'Education and vocational training',
        law: 'Law enforcement',
        migration: 'Migration, asylum and border control',
        critical: 'Critical infrastructure management',
        healthcare: 'Medical devices (Annex I)',
        biometric: 'Biometric identification and categorisation',
      };

      const categoryMap = {
        hr: '4', credit: '5', education: '3', law: '6',
        migration: '7', critical: '2', healthcare: '1', biometric: '1',
      };

      resultBox.querySelector('strong').textContent =
        `Preliminary Classification: High Risk`;
      resultBox.querySelector('div > div').innerHTML =
        `<strong>Preliminary Classification: High Risk</strong>
         Based on your answers, this system likely falls under <strong>Annex III, Category ${categoryMap[val]}</strong> (${domainNames[val]}). You will need to comply with Articles 9\u201315 of the EU AI Act.`;
    } else if (val === 'customer') {
      resultBox.style.display = 'block';
      resultBox.querySelector('.alert').className = 'alert alert-info';
      resultBox.querySelector('div > div').innerHTML =
        `<strong>Preliminary Classification: Limited Risk</strong>
         Systems that interact directly with natural persons (e.g. chatbots) have <strong>transparency obligations</strong> under Art. 50. Users must be informed they are interacting with an AI system.`;
    } else if (val && val !== '') {
      resultBox.style.display = 'block';
      resultBox.querySelector('.alert').className = 'alert alert-success';
      resultBox.querySelector('div > div').innerHTML =
        `<strong>Preliminary Classification: Minimal Risk</strong>
         Based on your selection, this system is likely <strong>minimal risk</strong>. No mandatory compliance obligations, but voluntary codes of conduct are encouraged.`;
    } else {
      resultBox.style.display = 'none';
    }
  });
}
