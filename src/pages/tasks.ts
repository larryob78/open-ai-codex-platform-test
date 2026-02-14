import { db, addAuditEntry } from '../db';
import { escapeHtml } from '../utils/escapeHtml';
import { openModal, closeModal } from '../components/modal';
import { showToast } from '../components/toast';
import { maxLength } from '../utils/validate';
import { logger } from '../utils/logger';
import type { Task } from '../types';

const COLUMNS: { status: Task['status']; label: string; badgeClass: string }[] = [
  { status: 'pending', label: 'To Do', badgeClass: 'badge-blue' },
  { status: 'in-progress', label: 'In Progress', badgeClass: 'badge-yellow' },
  { status: 'complete', label: 'Done', badgeClass: 'badge-green' },
];

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

/* ── Render ── */

function render(): string {
  return `
    <div class="page">
      <div class="page-header">
        <h1>Task Board</h1>
        <button class="btn btn-primary" id="task-board-add">+ Add Task</button>
        <select class="form-select" id="task-priority-filter" style="width:auto;">
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div class="disclaimer-banner">
        This tool provides guidance only  -  it does not constitute legal advice.
        Always consult qualified legal counsel for compliance decisions.
      </div>

      <div class="kanban-board" id="kanban-board">
        ${COLUMNS.map(
          (col) => `
          <div class="kanban-column" data-status="${col.status}">
            <div class="kanban-column-header">
              <span class="badge ${col.badgeClass}">${col.label}</span>
              <span class="kanban-count" id="count-${col.status}">0</span>
            </div>
            <div class="kanban-cards" id="column-${col.status}"></div>
          </div>`,
        ).join('')}
      </div>
    </div>`;
}

/* ── Task card ── */

function renderTaskCard(task: Task): string {
  const priorityBadge =
    task.priority === 'high' ? 'badge-red' : task.priority === 'medium' ? 'badge-yellow' : 'badge-green';

  const ownerHtml = task.owner ? `<span class="text-muted text-sm">${escapeHtml(task.owner)}</span>` : '';
  const dueHtml = task.dueDate ? `<span class="text-muted text-sm">Due: ${escapeHtml(task.dueDate)}</span>` : '';

  return `
    <div class="kanban-card" data-task-id="${task.id}">
      <div class="kanban-card-header">
        <span class="badge ${priorityBadge}">${task.priority}</span>
        <span class="text-muted text-sm">${escapeHtml(task.category)}</span>
      </div>
      <p class="kanban-card-title">${escapeHtml(task.title)}</p>
      <div class="kanban-card-meta">
        ${ownerHtml}
        ${dueHtml}
      </div>
      <div class="kanban-card-actions">
        ${task.status !== 'pending' ? `<button class="btn btn-secondary btn-sm" data-move-left="${task.id}">&#8592;</button>` : ''}
        <button class="btn btn-secondary btn-sm" data-edit-task="${task.id}">Edit</button>
        ${task.status !== 'complete' ? `<button class="btn btn-primary btn-sm" data-move-right="${task.id}">&#8594;</button>` : ''}
      </div>
    </div>`;
}

/* ── Refresh board ── */

async function refreshBoard(): Promise<void> {
  const allTasks = await db.tasks.toArray();
  const priorityFilter = (document.getElementById('task-priority-filter') as HTMLSelectElement | null)?.value ?? '';
  const filteredTasks = priorityFilter ? allTasks.filter((t) => t.priority === priorityFilter) : allTasks;

  for (const col of COLUMNS) {
    const container = document.getElementById(`column-${col.status}`);
    const countEl = document.getElementById(`count-${col.status}`);
    if (!container) continue;

    const tasks = filteredTasks
      .filter((t) => t.status === col.status)
      .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2));

    if (countEl) countEl.textContent = String(tasks.length);

    if (tasks.length === 0) {
      container.innerHTML = '<div class="kanban-empty">No tasks</div>';
      continue;
    }

    container.innerHTML = tasks.map(renderTaskCard).join('');
  }

  wireCardButtons();
}

/* ── Wire card buttons ── */

function wireCardButtons(): void {
  // Move left (status regression)
  document.querySelectorAll<HTMLButtonElement>('[data-move-left]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        const id = Number(btn.dataset.moveLeft);
        const task = await db.tasks.get(id);
        if (!task) return;
        const prev = prevStatus(task.status);
        if (prev) {
          await db.tasks.update(id, { status: prev });
          await addAuditEntry('status-change', 'task', 'Moved task "' + task.title + '" to ' + prev, id);
          await refreshBoard();
        }
      } catch (err) {
        logger.error('Failed to move task', { error: String(err) });
        showToast('Failed to move task.', 'error');
      }
    });
  });

  // Move right (status progression)
  document.querySelectorAll<HTMLButtonElement>('[data-move-right]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        const id = Number(btn.dataset.moveRight);
        const task = await db.tasks.get(id);
        if (!task) return;
        const next = nextStatus(task.status);
        if (next) {
          const updates: Partial<Task> = { status: next };
          if (next === 'complete') updates.completedAt = new Date().toISOString();
          await db.tasks.update(id, updates);
          await addAuditEntry('status-change', 'task', 'Moved task "' + task.title + '" to ' + next, id);
          showToast(next === 'complete' ? 'Task completed!' : 'Task moved.', 'success');
          await refreshBoard();
        }
      } catch (err) {
        logger.error('Failed to move task', { error: String(err) });
        showToast('Failed to move task.', 'error');
      }
    });
  });

  // Edit
  document.querySelectorAll<HTMLButtonElement>('[data-edit-task]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.editTask);
      const task = await db.tasks.get(id);
      if (task) openEditModal(task);
    });
  });
}

function nextStatus(current: Task['status']): Task['status'] | null {
  if (current === 'pending') return 'in-progress';
  if (current === 'in-progress') return 'complete';
  return null;
}

function prevStatus(current: Task['status']): Task['status'] | null {
  if (current === 'complete') return 'in-progress';
  if (current === 'in-progress') return 'pending';
  return null;
}

/* ── Edit modal ── */

function openEditModal(task: Task): void {
  const body = `
    <form id="task-board-edit-form">
      <div class="form-group">
        <label class="form-label" for="tb-title">Title</label>
        <input class="form-input" id="tb-title" type="text" value="${escapeHtml(task.title)}" />
      </div>
      <div class="form-group">
        <label class="form-label" for="tb-owner">Owner</label>
        <input class="form-input" id="tb-owner" type="text" value="${escapeHtml(task.owner ?? '')}" placeholder="Assign an owner" />
      </div>
      <div class="form-group">
        <label class="form-label" for="tb-due">Due Date</label>
        <input class="form-input" id="tb-due" type="date" value="${escapeHtml(task.dueDate ?? '')}" />
      </div>
      <div class="form-group">
        <label class="form-label" for="tb-priority">Priority</label>
        <select class="form-select" id="tb-priority">
          <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
          <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
          <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="tb-status">Status</label>
        <select class="form-select" id="tb-status">
          <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>To Do</option>
          <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
          <option value="complete" ${task.status === 'complete' ? 'selected' : ''}>Done</option>
        </select>
      </div>
      <p class="text-muted text-sm" style="margin-top:0.5rem;">${escapeHtml(task.description)}</p>
    </form>`;
  const footer = `
    <button class="btn btn-danger btn-sm" id="tb-delete">Delete</button>
    <div style="flex:1;"></div>
    <button class="btn btn-secondary" id="tb-cancel">Cancel</button>
    <button class="btn btn-primary" id="tb-save">Save</button>`;
  const modal = openModal('Edit Task', body, footer);

  modal.querySelector('#tb-cancel')?.addEventListener('click', closeModal);

  modal.querySelector('#tb-save')?.addEventListener('click', async () => {
    const title = (modal.querySelector<HTMLInputElement>('#tb-title')?.value ?? '').trim();
    const owner = (modal.querySelector<HTMLInputElement>('#tb-owner')?.value ?? '').trim();
    const dueDate = modal.querySelector<HTMLInputElement>('#tb-due')?.value ?? '';
    const priority = (modal.querySelector<HTMLSelectElement>('#tb-priority')?.value ?? 'medium') as Task['priority'];
    const status = (modal.querySelector<HTMLSelectElement>('#tb-status')?.value ?? 'pending') as Task['status'];

    const updates: Partial<Task> = { title, owner, dueDate, priority, status };
    if (status === 'complete' && task.status !== 'complete') {
      updates.completedAt = new Date().toISOString();
    }

    await db.tasks.update(task.id!, updates);
    await addAuditEntry('update', 'task', 'Updated task: ' + title, task.id);
    showToast('Task updated.', 'success');
    closeModal();
    await refreshBoard();
  });

  modal.querySelector('#tb-delete')?.addEventListener('click', async () => {
    try {
      await db.tasks.delete(task.id!);
      await addAuditEntry('delete', 'task', 'Deleted task: ' + task.title, task.id);
      showToast('Task deleted.', 'success');
      closeModal();
      await refreshBoard();
    } catch (err) {
      logger.error('Failed to delete task', { error: String(err) });
      showToast('Failed to delete task.', 'error');
    }
  });
}

/* ── Add task modal ── */

function openAddModal(): void {
  const body = `
    <form id="task-board-add-form">
      <div class="form-group">
        <label class="form-label" for="tb-new-title">Title</label>
        <input class="form-input" id="tb-new-title" type="text" placeholder="Task title" />
      </div>
      <div class="form-group">
        <label class="form-label" for="tb-new-desc">Description</label>
        <textarea class="form-input" id="tb-new-desc" rows="3" placeholder="Describe the task"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label" for="tb-new-owner">Owner</label>
        <input class="form-input" id="tb-new-owner" type="text" placeholder="Assign an owner" />
      </div>
      <div class="form-group">
        <label class="form-label" for="tb-new-due">Due Date</label>
        <input class="form-input" id="tb-new-due" type="date" />
      </div>
      <div class="form-group">
        <label class="form-label" for="tb-new-priority">Priority</label>
        <select class="form-select" id="tb-new-priority">
          <option value="medium" selected>Medium</option>
          <option value="low">Low</option>
          <option value="high">High</option>
        </select>
      </div>
    </form>`;
  const footer = `
    <button class="btn btn-secondary" id="tb-new-cancel">Cancel</button>
    <button class="btn btn-primary" id="tb-new-save">Create Task</button>`;
  const modal = openModal('New Task', body, footer);

  modal.querySelector('#tb-new-cancel')?.addEventListener('click', closeModal);

  modal.querySelector('#tb-new-save')?.addEventListener('click', async () => {
    const title = (modal.querySelector<HTMLInputElement>('#tb-new-title')?.value ?? '').trim();
    if (!title) {
      showToast('Please enter a task title.', 'warning');
      return;
    }
    const titleLenErr = maxLength(title, 200, 'Title');
    if (titleLenErr) {
      showToast(titleLenErr, 'warning');
      return;
    }

    const description = (modal.querySelector<HTMLTextAreaElement>('#tb-new-desc')?.value ?? '').trim();
    const owner = (modal.querySelector<HTMLInputElement>('#tb-new-owner')?.value ?? '').trim();
    const dueDate = modal.querySelector<HTMLInputElement>('#tb-new-due')?.value ?? '';
    const priority = (modal.querySelector<HTMLSelectElement>('#tb-new-priority')?.value ??
      'medium') as Task['priority'];

    const newId = await db.tasks.add({
      title,
      description,
      category: 'manual',
      taskType: 'manual',
      owner,
      priority,
      status: 'pending',
      dueDate,
      createdAt: new Date().toISOString(),
    });
    await addAuditEntry('create', 'task', 'Created task: ' + title, newId as number);

    showToast('Task created.', 'success');
    closeModal();
    await refreshBoard();
  });
}

/* ── Init ── */

async function init(): Promise<void> {
  document.getElementById('task-board-add')?.addEventListener('click', openAddModal);
  document.getElementById('task-priority-filter')?.addEventListener('change', () => refreshBoard());
  await refreshBoard();
}

export default { render, init };
