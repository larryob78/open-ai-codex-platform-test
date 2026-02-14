import { db } from '../db';
import type { AISystem, Task, RiskCategory } from '../types';

/* ── EU AI Act key dates ──
 * Source: Regulation (EU) 2024/1689, Art. 113
 */
const EU_DATES = {
  prohibitedStart: '2025-02-02',
  gpaiStart: '2025-08-02',
  mainObligations: '2026-08-02',
  annexIExtended: '2027-08-02',
};

interface TaskTemplate {
  taskType: string;
  title: string;
  description: string;
  priority: Task['priority'];
  suggestedDueDate: string;
}

function monthsBefore(isoDate: string, months: number): string {
  const d = new Date(isoDate);
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

const TASK_TEMPLATES: Record<RiskCategory, TaskTemplate[]> = {
  'minimal-risk': [
    {
      taskType: 'minimal-inventory',
      title: 'Maintain AI system inventory',
      description: 'Keep an up-to-date record of all AI systems in use, including purpose, owner, and vendor details.',
      priority: 'low',
      suggestedDueDate: monthsBefore(EU_DATES.mainObligations, 3),
    },
    {
      taskType: 'minimal-supplier-check',
      title: 'Conduct basic supplier review',
      description: 'Review AI vendor terms, data handling practices, and confirm they are aware of the EU AI Act.',
      priority: 'low',
      suggestedDueDate: monthsBefore(EU_DATES.mainObligations, 2),
    },
    {
      taskType: 'minimal-ai-literacy',
      title: 'Complete AI literacy training',
      description: 'Ensure relevant staff complete AI literacy training as required by Art. 4 of the EU AI Act.',
      priority: 'medium',
      suggestedDueDate: EU_DATES.prohibitedStart,
    },
  ],
  'limited-risk': [
    {
      taskType: 'limited-transparency-notice',
      title: 'Draft transparency notice',
      description:
        'Create user-facing transparency notices informing people they are interacting with an AI system (Art. 50).',
      priority: 'medium',
      suggestedDueDate: monthsBefore(EU_DATES.mainObligations, 4),
    },
    {
      taskType: 'limited-disclosure-copy',
      title: 'Implement AI disclosure copy',
      description:
        'Add visible AI disclosure text to all customer-facing interfaces where AI-generated content is shown.',
      priority: 'medium',
      suggestedDueDate: monthsBefore(EU_DATES.mainObligations, 3),
    },
    {
      taskType: 'limited-logging',
      title: 'Set up basic AI usage logging',
      description: 'Implement logging for AI system inputs and outputs to support transparency and auditability.',
      priority: 'low',
      suggestedDueDate: monthsBefore(EU_DATES.mainObligations, 2),
    },
  ],
  'high-risk': [
    {
      taskType: 'high-risk-management',
      title: 'Establish risk management system',
      description: 'Implement a risk management system covering the entire lifecycle of the AI system (Art. 9).',
      priority: 'high',
      suggestedDueDate: monthsBefore(EU_DATES.mainObligations, 6),
    },
    {
      taskType: 'high-data-governance',
      title: 'Implement data governance measures',
      description: 'Establish data governance practices for training, validation, and testing data sets (Art. 10).',
      priority: 'high',
      suggestedDueDate: monthsBefore(EU_DATES.mainObligations, 6),
    },
    {
      taskType: 'high-technical-docs',
      title: 'Prepare technical documentation',
      description:
        'Create and maintain technical documentation demonstrating compliance with high-risk requirements (Art. 11).',
      priority: 'high',
      suggestedDueDate: monthsBefore(EU_DATES.mainObligations, 5),
    },
    {
      taskType: 'high-human-oversight',
      title: 'Implement human oversight procedures',
      description:
        'Design the system to allow effective human oversight, including ability to override or halt (Art. 14).',
      priority: 'high',
      suggestedDueDate: monthsBefore(EU_DATES.mainObligations, 5),
    },
    {
      taskType: 'high-monitoring',
      title: 'Set up post-market monitoring',
      description:
        'Establish a post-market monitoring system to track performance and report serious incidents (Art. 72).',
      priority: 'medium',
      suggestedDueDate: monthsBefore(EU_DATES.mainObligations, 3),
    },
    {
      taskType: 'high-incident-response',
      title: 'Create incident response plan',
      description:
        'Develop procedures for reporting serious incidents to relevant authorities within required timeframes (Art. 73).',
      priority: 'medium',
      suggestedDueDate: monthsBefore(EU_DATES.mainObligations, 4),
    },
    {
      taskType: 'high-vendor-contracts',
      title: 'Review vendor contracts for compliance',
      description:
        'Ensure contracts with AI providers include EU AI Act compliance obligations, liability, and audit rights.',
      priority: 'medium',
      suggestedDueDate: monthsBefore(EU_DATES.mainObligations, 4),
    },
  ],
  prohibited: [
    {
      taskType: 'prohibited-stop',
      title: 'Cease prohibited AI practice immediately',
      description:
        'This AI system may involve a prohibited practice under Art. 5. Stop using it and seek legal advice.',
      priority: 'high',
      suggestedDueDate: EU_DATES.prohibitedStart,
    },
    {
      taskType: 'prohibited-escalate',
      title: 'Escalate to legal counsel',
      description: 'Engage qualified legal counsel to review whether exemptions apply and advise on next steps.',
      priority: 'high',
      suggestedDueDate: EU_DATES.prohibitedStart,
    },
  ],
  unknown: [],
};

/**
 * Generate compliance tasks for a system based on its risk category.
 * Skips tasks that already exist (same system + taskType).
 */
export async function generateTasksForSystem(system: AISystem): Promise<number> {
  const category = system.riskCategory ?? 'unknown';
  const templates = TASK_TEMPLATES[category];
  if (!templates || templates.length === 0) return 0;

  const systemId = system.id!;
  const existingTasks = await db.tasks.where('relatedSystemId').equals(systemId).toArray();
  const existingTypes = new Set(existingTasks.map((t) => t.taskType).filter(Boolean));

  const newTasks: Task[] = [];
  for (const tmpl of templates) {
    if (existingTypes.has(tmpl.taskType)) continue;

    newTasks.push({
      title: `[${system.name}] ${tmpl.title}`,
      description: tmpl.description,
      relatedSystemId: systemId,
      category,
      taskType: tmpl.taskType,
      priority: tmpl.priority,
      status: 'pending',
      dueDate: tmpl.suggestedDueDate,
      createdAt: new Date().toISOString(),
    });
  }

  if (newTasks.length > 0) {
    await db.tasks.bulkAdd(newTasks);
  }
  return newTasks.length;
}

/**
 * Regenerate tasks when a system's risk category changes.
 * Does not delete existing tasks (user may have edited them).
 */
export async function regenerateTasksOnReclassify(system: AISystem): Promise<number> {
  return generateTasksForSystem(system);
}
