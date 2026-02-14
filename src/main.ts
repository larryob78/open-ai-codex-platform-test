import './style.css';
import { renderNav, renderTopBar, initNav } from './components/nav';
import { registerRoute, initRouter } from './router';
import { showToast } from './components/toast';
import { logger } from './utils/logger';

/* ── Lazy-loaded page modules ── */
registerRoute('/dashboard', () => import('./pages/dashboard').then((m) => m.default));
registerRoute('/inventory', () => import('./pages/inventory').then((m) => m.default));
registerRoute('/risk', () => import('./pages/risk').then((m) => m.default));
registerRoute('/obligations', () => import('./pages/obligations').then((m) => m.default));
registerRoute('/templates', () => import('./pages/templates').then((m) => m.default));
registerRoute('/vendors', () => import('./pages/vendors').then((m) => m.default));
registerRoute('/training', () => import('./pages/training').then((m) => m.default));
registerRoute('/incidents', () => import('./pages/incidents').then((m) => m.default));
registerRoute('/tasks', () => import('./pages/tasks').then((m) => m.default));
registerRoute('/audit', () => import('./pages/audit').then((m) => m.default));
registerRoute('/exports', () => import('./pages/exports').then((m) => m.default));
registerRoute('/settings', () => import('./pages/settings').then((m) => m.default));

/* ── Global error handlers ── */
window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection', { reason: String(event.reason) });
  showToast('An unexpected error occurred.', 'error');
});

window.onerror = (message) => {
  logger.error('Global error', { message: String(message) });
  showToast('An unexpected error occurred.', 'error');
  return false;
};

/* ── Bootstrap ── */
function bootstrap(): void {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="app-layout">
      ${renderNav()}
      <div class="main-content">
        ${renderTopBar()}
        <div id="app-content"></div>
      </div>
    </div>
  `;

  initNav();
  initRouter();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
