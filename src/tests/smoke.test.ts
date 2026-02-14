import { describe, it, expect } from 'vitest';
import { classifySystem, riskLabel, riskBadgeClass, computeCompleteness } from '../services/classifier';
import type { AISystem } from '../types';

function makeSystem(overrides: Partial<AISystem> = {}): AISystem {
  return {
    name: 'Test System',
    description: 'A test AI system',
    owner: 'Jane',
    department: 'Engineering',
    vendor: 'OpenAI',
    model: 'GPT-4',
    provider: 'OpenAI',
    deploymentType: 'saas',
    dataCategories: [],
    affectedUsers: [],
    useCases: [],
    domains: [],
    humanOversight: false,
    humanOversightDescription: '',
    transparencyProvided: false,
    biometricIdentification: false,
    emotionInference: false,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('Risk Classifier', () => {
  it('classifies a minimal system as minimal-risk', () => {
    const result = classifySystem(makeSystem({ domains: ['other'], transparencyProvided: true }));
    expect(result.category).toBe('minimal-risk');
    expect(result.confidence).toBe('medium');
    expect(result.reasoning.length).toBeGreaterThan(0);
    expect(result.actions.length).toBeGreaterThan(0);
  });

  it('classifies employment domain as high-risk', () => {
    const result = classifySystem(makeSystem({ domains: ['employment'] }));
    expect(result.category).toBe('high-risk');
    expect(result.reasoning.some((r) => r.includes('high-risk domain'))).toBe(true);
  });

  it('classifies health domain as high-risk', () => {
    const result = classifySystem(makeSystem({ domains: ['health'] }));
    expect(result.category).toBe('high-risk');
  });

  it('classifies biometric + emotion as prohibited', () => {
    const result = classifySystem(makeSystem({ biometricIdentification: true, emotionInference: true }));
    expect(result.category).toBe('prohibited');
    expect(['low', 'medium', 'high']).toContain(result.confidence);
  });

  it('classifies emotion in employment as prohibited', () => {
    const result = classifySystem(makeSystem({ emotionInference: true, domains: ['employment'] }));
    expect(result.category).toBe('prohibited');
  });

  it('classifies content generation as limited-risk', () => {
    const result = classifySystem(makeSystem({ useCases: ['content-generation'] }));
    expect(result.category).toBe('limited-risk');
  });

  it('classifies children + automated decisions as high-risk', () => {
    const result = classifySystem(makeSystem({ affectedUsers: ['children'], useCases: ['automated-decisions'] }));
    expect(result.category).toBe('high-risk');
  });

  it('higher-risk rules override lower-risk', () => {
    const result = classifySystem(
      makeSystem({
        domains: ['credit'],
        useCases: ['content-generation'],
      }),
    );
    expect(result.category).toBe('high-risk');
  });

  it('provides high confidence with multiple matching rules', () => {
    const result = classifySystem(
      makeSystem({
        domains: ['employment', 'health'],
        useCases: ['automated-decisions', 'scoring'],
        dataCategories: ['sensitive', 'personal'],
        affectedUsers: ['employees'],
      }),
    );
    expect(result.confidence).toBe('high');
  });

  it('includes completeness score and missing fields in result', () => {
    const result = classifySystem(makeSystem({ domains: ['employment'] }));
    expect(result.completenessScore).toBeGreaterThanOrEqual(0);
    expect(result.completenessScore).toBeLessThanOrEqual(1);
    expect(Array.isArray(result.missingFields)).toBe(true);
  });

  it('downgrades confidence when completeness is low', () => {
    const sparseSystem = makeSystem({
      name: '',
      description: '',
      owner: '',
      department: '',
      vendor: '',
      domains: ['employment'],
    });
    const result = classifySystem(sparseSystem);
    expect(result.confidence).toBe('low');
    expect(result.completenessScore).toBeLessThan(0.5);
  });
});

describe('computeCompleteness', () => {
  it('returns 1.0 for a fully populated system', () => {
    const full = makeSystem({
      dataCategories: ['personal'],
      affectedUsers: ['employees'],
      useCases: ['content-generation'],
      domains: ['other'],
    });
    const { score, missingFields } = computeCompleteness(full);
    expect(score).toBe(1);
    expect(missingFields).toHaveLength(0);
  });

  it('lists missing fields for empty system', () => {
    const empty = makeSystem({
      name: '',
      description: '',
      owner: '',
      department: '',
      vendor: '',
    });
    const { score, missingFields } = computeCompleteness(empty);
    expect(score).toBeLessThan(1);
    expect(missingFields.length).toBeGreaterThan(0);
    expect(missingFields).toContain('Name');
    expect(missingFields).toContain('Description');
  });
});

describe('riskLabel', () => {
  it('returns readable labels', () => {
    expect(riskLabel('high-risk')).toBe('High Risk');
    expect(riskLabel('prohibited')).toBe('Prohibited');
    expect(riskLabel('limited-risk')).toBe('Limited Risk');
    expect(riskLabel('minimal-risk')).toBe('Minimal Risk');
    expect(riskLabel('unknown')).toBe('Unknown');
  });
});

describe('riskBadgeClass', () => {
  it('returns correct badge classes', () => {
    expect(riskBadgeClass('prohibited')).toBe('badge-red');
    expect(riskBadgeClass('high-risk')).toBe('badge-yellow');
    expect(riskBadgeClass('limited-risk')).toBe('badge-blue');
    expect(riskBadgeClass('minimal-risk')).toBe('badge-green');
    expect(riskBadgeClass('unknown')).toBe('badge-gray');
  });
});
