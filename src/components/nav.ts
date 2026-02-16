const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  },
  {
    path: '/inventory',
    label: 'AI Inventory',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>',
  },
  {
    path: '/risk',
    label: 'Risk Classification',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  },
  {
    path: '/obligations',
    label: 'Obligations',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>',
  },
  {
    path: '/templates',
    label: 'Templates',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  },
  {
    path: '/vendors',
    label: 'Vendors',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  },
  {
    path: '/training',
    label: 'Training',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>',
  },
  {
    path: '/incidents',
    label: 'Incidents',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  },
  {
    path: '/tasks',
    label: 'Task Board',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 3v18"/></svg>',
  },
  {
    path: '/audit',
    label: 'Audit Log',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>',
  },
  {
    path: '/exports',
    label: 'Exports',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
  },
];

export function renderNav(): string {
  return `
    <nav class="sidebar" id="sidebar" aria-label="Main navigation">
      <div class="sidebar-header">
        <div class="sidebar-brand">
          <span class="brand-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4" stroke-width="2.5"/>
            </svg>
          </span>
          <div>
            <h1 class="brand-title">AI Comply</h1>
            <p class="brand-subtitle">EU AI Act Toolkit</p>
          </div>
        </div>
        <button class="sidebar-close" id="sidebar-close" aria-label="Close menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <ul class="nav-list">
        ${NAV_ITEMS.map(
          (item) => `
          <li>
            <a href="#${item.path}" class="nav-link" data-route="${item.path}" aria-label="${item.label}">
              <span class="nav-icon" aria-hidden="true">${item.icon}</span>
              <span class="nav-label">${item.label}</span>
            </a>
          </li>`,
        ).join('')}
      </ul>
      <div class="sidebar-footer">
        <p class="disclaimer-text">Guidance only  -  not legal advice.</p>
        <p class="version-text">v2.0.0</p>
      </div>
    </nav>`;
}

export function renderTopBar(): string {
  return `
    <header class="topbar">
      <button class="hamburger" id="hamburger" aria-label="Open menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <span class="topbar-title">AI Comply</span>
    </header>`;
}

export function initNav(): void {
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  const closeBtn = document.getElementById('sidebar-close');
  const overlay = document.getElementById('modal-overlay');

  function openSidebar() {
    sidebar?.classList.add('open');
    overlay?.classList.remove('hidden');
    overlay?.classList.add('sidebar-overlay');
  }
  function closeSidebar() {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('sidebar-overlay');
    if (!document.querySelector('.modal.visible')) overlay?.classList.add('hidden');
  }

  hamburger?.addEventListener('click', openSidebar);
  closeBtn?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).classList.contains('sidebar-overlay')) closeSidebar();
  });

  // Close sidebar on nav link click (mobile)
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', closeSidebar);
  });
}
