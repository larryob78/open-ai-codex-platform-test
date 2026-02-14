import { escapeHtml } from '../utils/escapeHtml';

let currentModal: HTMLElement | null = null;
let overlayListener: ((e: MouseEvent) => void) | null = null;
let escapeListener: ((e: KeyboardEvent) => void) | null = null;
let previousFocus: HTMLElement | null = null;

export function openModal(title: string, bodyHtml: string, footerHtml = ''): HTMLElement {
  closeModal();
  previousFocus = document.activeElement as HTMLElement | null;

  const overlay = document.getElementById('modal-overlay');
  overlay?.classList.remove('hidden');

  const modalId = 'modal-title-' + Date.now();
  const modal = document.createElement('div');
  modal.className = 'modal visible';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', modalId);
  modal.innerHTML = `
    <div class="modal-header">
      <h3 id="${modalId}">${escapeHtml(title)}</h3>
      <button class="modal-close" aria-label="Close">&times;</button>
    </div>
    <div class="modal-body">${bodyHtml}</div>
    ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
  `;

  overlay?.appendChild(modal);
  currentModal = modal;

  modal.querySelector('.modal-close')?.addEventListener('click', closeModal);

  overlayListener = (e: MouseEvent) => {
    if (e.target === overlay) closeModal();
  };
  overlay?.addEventListener('click', overlayListener);

  escapeListener = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeModal();
  };
  document.addEventListener('keydown', escapeListener);

  /* Focus first focusable element inside modal */
  const focusable = modal.querySelector<HTMLElement>(
    'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  if (focusable) {
    requestAnimationFrame(() => focusable.focus());
  }

  return modal;
}

export function closeModal(): void {
  const overlay = document.getElementById('modal-overlay');
  if (currentModal) {
    currentModal.remove();
    currentModal = null;
  }
  if (overlayListener && overlay) {
    overlay.removeEventListener('click', overlayListener);
    overlayListener = null;
  }
  if (escapeListener) {
    document.removeEventListener('keydown', escapeListener);
    escapeListener = null;
  }
  const sidebar = document.getElementById('sidebar');
  if (!sidebar?.classList.contains('open')) {
    overlay?.classList.add('hidden');
  }
  overlay?.classList.remove('sidebar-overlay');

  /* Restore focus to the element that opened the modal */
  if (previousFocus && typeof previousFocus.focus === 'function') {
    previousFocus.focus();
    previousFocus = null;
  }
}
