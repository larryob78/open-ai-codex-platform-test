let currentModal: HTMLElement | null = null;

export function openModal(title: string, bodyHtml: string, footerHtml = ''): HTMLElement {
  closeModal();
  const overlay = document.getElementById('modal-overlay');
  overlay?.classList.remove('hidden');

  const modal = document.createElement('div');
  modal.className = 'modal visible';
  modal.innerHTML = `
    <div class="modal-header">
      <h3>${title}</h3>
      <button class="modal-close" aria-label="Close">&times;</button>
    </div>
    <div class="modal-body">${bodyHtml}</div>
    ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
  `;

  overlay?.appendChild(modal);
  currentModal = modal;

  modal.querySelector('.modal-close')?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  return modal;
}

export function closeModal(): void {
  const overlay = document.getElementById('modal-overlay');
  if (currentModal) {
    currentModal.remove();
    currentModal = null;
  }
  const sidebar = document.getElementById('sidebar');
  if (!sidebar?.classList.contains('open')) {
    overlay?.classList.add('hidden');
  }
  overlay?.classList.remove('sidebar-overlay');
}
