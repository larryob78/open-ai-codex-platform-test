/* ── Entity types for AI Comply ── */

export interface CompanyProfile {
  id?: number;
  name: string;
  sector: string;
  country: string;
  employeeCount: string;
  dpoName: string;
  dpoEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface AISystem {
  id?: number;
  name: string;
  description: string;
  owner: string;
  department: string;
  vendor: string;
  model: string;
  provider: string;
  deploymentType: 'saas' | 'in-house' | 'on-device';
  dataCategories: string[];
  affectedUsers: string[];
  useCases: string[];
  domains: string[];
  humanOversight: boolean;
  humanOversightDescription: string;
  transparencyProvided: boolean;
  biometricIdentification: boolean;
  emotionInference: boolean;
  riskCategory?: RiskCategory;
  riskConfidence?: RiskConfidence;
  riskReasoning?: string[];
  riskActions?: string[];
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id?: number;
  name: string;
  contact: string;
  email: string;
  aiSystemIds: number[];
  dueDiligenceStatus: 'pending' | 'in-progress' | 'complete';
  lastReviewDate: string;
  notes: string;
  createdAt: string;
}

export interface Task {
  id?: number;
  title: string;
  description: string;
  relatedSystemId?: number;
  category: string;
  taskType: string;
  owner?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'complete';
  dueDate: string;
  completedAt?: string;
  createdAt: string;
}

export interface Incident {
  id?: number;
  title: string;
  description: string;
  relatedSystemId?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  reportedBy: string;
  reportedAt: string;
  resolvedAt?: string;
  rootCause: string;
  actionsTaken: string;
  createdAt: string;
}

export interface TrainingCompletion {
  id?: number;
  moduleId: string;
  moduleName: string;
  userName: string;
  completedAt: string;
}

export interface GeneratedDoc {
  id?: number;
  templateType: string;
  name: string;
  content: string;
  format: 'markdown' | 'pdf';
  createdAt: string;
}

export interface ObligationCheck {
  id?: number;
  category: string;
  obligationIndex: number;
  checked: boolean;
}

/* ── Risk classification types ── */

export type RiskCategory = 'prohibited' | 'high-risk' | 'limited-risk' | 'minimal-risk' | 'unknown';
export type RiskConfidence = 'low' | 'medium' | 'high';

export interface ClassificationResult {
  category: RiskCategory;
  confidence: RiskConfidence;
  reasoning: string[];
  actions: string[];
  completenessScore: number;
  missingFields: string[];
}

/* ── Page module contract ── */

export interface PageModule {
  render(): string;
  init(): Promise<void>;
}

/* ── Constants ── */

export const DATA_CATEGORIES = ['none', 'personal', 'sensitive', 'employee', 'children'] as const;
export const AFFECTED_USERS = ['customers', 'employees', 'public', 'children'] as const;
export const USE_CASES = [
  'content-generation',
  'recommendations',
  'scoring',
  'decision-support',
  'automated-decisions',
] as const;
export const DOMAINS = [
  'employment',
  'credit',
  'education',
  'housing',
  'health',
  'essential-services',
  'other',
] as const;
export const DEPLOYMENT_TYPES = ['saas', 'in-house', 'on-device'] as const;

export const DOMAIN_LABELS: Record<string, string> = {
  employment: 'Employment',
  credit: 'Credit / Finance',
  education: 'Education',
  housing: 'Housing',
  health: 'Health',
  'essential-services': 'Essential Services',
  other: 'Other',
};

export const USE_CASE_LABELS: Record<string, string> = {
  'content-generation': 'Content Generation',
  recommendations: 'Recommendations',
  scoring: 'Scoring / Profiling',
  'decision-support': 'Decision Support',
  'automated-decisions': 'Automated Decisions',
};
