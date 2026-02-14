import { describe, it, expect } from 'vitest';
import { TEMPLATES } from '../services/templateGen';
import type { AISystem, Vendor, CompanyProfile } from '../types';

function makeContext(overrides: { systems?: AISystem[]; vendors?: Vendor[]; profile?: CompanyProfile } = {}) {
  return {
    companyName: 'Test Corp',
    systems: overrides.systems ?? [],
    vendors: overrides.vendors ?? [],
    profile: overrides.profile ?? undefined,
  };
}

function makeSystem(name: string): AISystem {
  return {
    name,
    description: 'A test system',
    owner: 'Jane',
    department: 'Engineering',
    vendor: 'Vendor Co',
    model: 'v1',
    provider: 'Provider',
    deploymentType: 'saas',
    dataCategories: ['personal'],
    affectedUsers: ['employees'],
    useCases: ['content-generation'],
    domains: ['other'],
    humanOversight: true,
    humanOversightDescription: 'Manual review',
    transparencyProvided: true,
    biometricIdentification: false,
    emotionInference: false,
    riskCategory: 'limited-risk',
    riskConfidence: 'medium',
    riskReasoning: ['Uses content generation'],
    riskActions: ['Add transparency notice'],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe('TEMPLATES', () => {
  it('has 8 templates', () => {
    expect(TEMPLATES).toHaveLength(8);
  });

  it('each template has required fields', () => {
    for (const t of TEMPLATES) {
      expect(t.id).toBeTruthy();
      expect(t.title).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(typeof t.generate).toBe('function');
    }
  });

  it('all templates produce non-empty output with empty context', () => {
    const ctx = makeContext();
    for (const t of TEMPLATES) {
      const output = t.generate(ctx);
      expect(output.length).toBeGreaterThan(0);
    }
  });

  it('all templates include company name in output', () => {
    const ctx = makeContext();
    for (const t of TEMPLATES) {
      const output = t.generate(ctx);
      expect(output).toContain('Test Corp');
    }
  });

  it('templates include system data when systems are provided', () => {
    const ctx = makeContext({ systems: [makeSystem('ChatBot Alpha')] });
    // AI Usage Policy should include system name in inventory table
    const policy = TEMPLATES.find((t) => t.id === 'ai-usage-policy');
    const output = policy!.generate(ctx);
    expect(output).toContain('ChatBot Alpha');
  });

  it('risk assessment template includes completeness data', () => {
    const ctx = makeContext({ systems: [makeSystem('Analyzer')] });
    const riskTemplate = TEMPLATES.find((t) => t.id === 'risk-assessment-template');
    const output = riskTemplate!.generate(ctx);
    expect(output).toContain('Analyzer');
    expect(output).toContain('Completeness');
  });

  it('data processing record includes GDPR references', () => {
    const ctx = makeContext();
    const dpr = TEMPLATES.find((t) => t.id === 'data-processing-record');
    const output = dpr!.generate(ctx);
    expect(output).toContain('GDPR Art. 30');
  });
});
