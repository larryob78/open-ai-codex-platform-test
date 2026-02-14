import Dexie, { type Table } from 'dexie';
import type {
  CompanyProfile,
  AISystem,
  Vendor,
  Task,
  Incident,
  TrainingCompletion,
  GeneratedDoc,
  ObligationCheck,
} from '../types';

class ComplianceDB extends Dexie {
  companyProfile!: Table<CompanyProfile>;
  aiSystems!: Table<AISystem>;
  vendors!: Table<Vendor>;
  tasks!: Table<Task>;
  incidents!: Table<Incident>;
  trainingCompletions!: Table<TrainingCompletion>;
  generatedDocs!: Table<GeneratedDoc>;
  obligationChecks!: Table<ObligationCheck>;

  constructor() {
    super('aicomply');
    this.version(1).stores({
      companyProfile: '++id',
      aiSystems: '++id, name, riskCategory, status',
      vendors: '++id, name, dueDiligenceStatus',
      tasks: '++id, status, priority, relatedSystemId',
      incidents: '++id, status, severity, relatedSystemId',
      trainingCompletions: '++id, moduleId, userName',
      generatedDocs: '++id, templateType',
    });
    this.version(2).stores({
      companyProfile: '++id',
      aiSystems: '++id, name, riskCategory, status',
      vendors: '++id, name, dueDiligenceStatus',
      tasks: '++id, status, priority, relatedSystemId, taskType, [relatedSystemId+taskType]',
      incidents: '++id, status, severity, relatedSystemId',
      trainingCompletions: '++id, moduleId, userName',
      generatedDocs: '++id, templateType',
    });
    this.version(3)
      .stores({
        companyProfile: '++id',
        aiSystems: '++id, name, riskCategory, status',
        vendors: '++id, name, dueDiligenceStatus',
        tasks: '++id, status, priority, relatedSystemId, taskType, [relatedSystemId+taskType]',
        incidents: '++id, status, severity, relatedSystemId',
        trainingCompletions: '++id, moduleId, userName',
        generatedDocs: '++id, templateType',
      })
      .upgrade((tx) => {
        const now = new Date().toISOString();
        tx.table('companyProfile')
          .toCollection()
          .modify((p: Record<string, unknown>) => {
            if (!p.createdAt) p.createdAt = (p.updatedAt as string) || now;
          });
        tx.table('tasks')
          .toCollection()
          .modify((t: Record<string, unknown>) => {
            if (!t.taskType) t.taskType = 'manual';
          });
      });
    this.version(4).stores({
      companyProfile: '++id',
      aiSystems: '++id, name, riskCategory, status',
      vendors: '++id, name, dueDiligenceStatus',
      tasks: '++id, status, priority, relatedSystemId, taskType, [relatedSystemId+taskType]',
      incidents: '++id, status, severity, relatedSystemId',
      trainingCompletions: '++id, moduleId, userName',
      generatedDocs: '++id, templateType',
      obligationChecks: '++id, [category+obligationIndex]',
    });
  }
}

export const db = new ComplianceDB();

/* ── Helpers ── */

export async function getCompanyProfile(): Promise<CompanyProfile | undefined> {
  return db.companyProfile.toCollection().first();
}

export async function saveCompanyProfile(profile: Partial<CompanyProfile>): Promise<void> {
  const existing = await getCompanyProfile();
  if (existing?.id) {
    await db.companyProfile.update(existing.id, { ...profile, updatedAt: new Date().toISOString() });
  } else {
    const now = new Date().toISOString();
    await db.companyProfile.add({
      name: '',
      sector: '',
      country: 'Ireland',
      employeeCount: '',
      dpoName: '',
      dpoEmail: '',
      ...profile,
      createdAt: now,
      updatedAt: now,
    } as CompanyProfile);
  }
}

export async function exportAllData(): Promise<string> {
  const data = {
    companyProfile: await db.companyProfile.toArray(),
    aiSystems: await db.aiSystems.toArray(),
    vendors: await db.vendors.toArray(),
    tasks: await db.tasks.toArray(),
    incidents: await db.incidents.toArray(),
    trainingCompletions: await db.trainingCompletions.toArray(),
    generatedDocs: await db.generatedDocs.toArray(),
    obligationChecks: await db.obligationChecks.toArray(),
    exportedAt: new Date().toISOString(),
    version: '2.0.0',
  };
  return JSON.stringify(data, null, 2);
}

const EXPECTED_TABLES = [
  'companyProfile',
  'aiSystems',
  'vendors',
  'tasks',
  'incidents',
  'trainingCompletions',
  'generatedDocs',
  'obligationChecks',
] as const;

function validateImportPayload(data: unknown): asserts data is Record<string, unknown[]> {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error('Invalid backup file: expected a JSON object.');
  }
  const obj = data as Record<string, unknown>;
  for (const key of EXPECTED_TABLES) {
    if (key in obj && !Array.isArray(obj[key])) {
      throw new Error(`Invalid backup file: "${key}" must be an array.`);
    }
  }
}

export async function importData(json: string): Promise<void> {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error('Invalid backup file: not valid JSON.');
  }
  validateImportPayload(data);
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) {
      await table.clear();
    }
    if (data.companyProfile) await db.companyProfile.bulkAdd(data.companyProfile as CompanyProfile[]);
    if (data.aiSystems) await db.aiSystems.bulkAdd(data.aiSystems as AISystem[]);
    if (data.vendors) await db.vendors.bulkAdd(data.vendors as Vendor[]);
    if (data.tasks) await db.tasks.bulkAdd(data.tasks as Task[]);
    if (data.incidents) await db.incidents.bulkAdd(data.incidents as Incident[]);
    if (data.trainingCompletions)
      await db.trainingCompletions.bulkAdd(data.trainingCompletions as TrainingCompletion[]);
    if (data.generatedDocs) await db.generatedDocs.bulkAdd(data.generatedDocs as GeneratedDoc[]);
    if (data.obligationChecks) await db.obligationChecks.bulkAdd(data.obligationChecks as ObligationCheck[]);
  });
}

export async function wipeAllData(): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) {
      await table.clear();
    }
  });
}
