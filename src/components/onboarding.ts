import { db } from '../db';
import { openModal, closeModal } from './modal';
import { navigateTo } from '../router';

const DISMISSED_KEY = 'onboarding-dismissed';

export async function checkAndShowOnboarding(): Promise<void> {
  if (localStorage.getItem(DISMISSED_KEY)) return;

  const profileCount = await db.companyProfile.count();
  const systemCount = await db.aiSystems.count();
  if (profileCount > 0 || systemCount > 0) return;

  const bodyHtml = `
    <p style="margin-bottom:12px">
      AI Comply helps Irish SMEs navigate EU AI Act compliance.
      All your data stays in this browser -- nothing is sent to a server.
    </p>
    <p style="margin-bottom:16px">
      Start by setting up your company profile, then register your first AI system.
    </p>
    <div class="btn-group">
      <button class="btn btn-primary" id="onboarding-start">Get Started</button>
      <button class="btn btn-secondary" id="onboarding-skip">Skip</button>
    </div>
  `;

  openModal('Welcome to AI Comply', bodyHtml);

  document.getElementById('onboarding-start')?.addEventListener('click', () => {
    closeModal();
    navigateTo('/settings');
  });

  document.getElementById('onboarding-skip')?.addEventListener('click', () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    closeModal();
  });
}
