import type { PageModule } from './types';

const routes: Record<string, () => Promise<PageModule>> = {};

export function registerRoute(path: string, loader: () => Promise<PageModule>): void {
  routes[path] = loader;
}

export function navigateTo(path: string): void {
  window.location.hash = path;
}

export function currentRoute(): string {
  return window.location.hash.slice(1) || '/dashboard';
}

export async function handleRoute(): Promise<void> {
  const hash = currentRoute();
  const loader = routes[hash];
  const content = document.getElementById('app-content');
  if (!content) return;

  if (loader) {
    try {
      const page = await loader();
      content.innerHTML = page.render();
      await page.init();
    } catch (err) {
      console.error('Route error:', err);
      content.innerHTML = `<div class="page"><div class="card"><h2>Something went wrong</h2><p>${String(err)}</p></div></div>`;
    }
  } else {
    content.innerHTML =
      '<div class="page"><div class="card"><h2>Page not found</h2><p>The page you requested does not exist.</p></div></div>';
  }

  // Update active nav link
  document.querySelectorAll('.nav-link').forEach((link) => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === '#' + hash);
  });
}

export function initRouter(): void {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
