import type { AISystem, ClassificationResult, RiskCategory, RiskConfidence } from '../types';

const HIGH_RISK_DOMAINS = ['employment', 'credit', 'education', 'housing', 'health', 'essential-services'];

interface Rule {
  test: (s: AISystem) => boolean;
  category: RiskCategory;
  weight: number;
  reason: string;
  action: string;
}

const RULES: Rule[] = [
  // Prohibited
  {
    test: (s) => s.biometricIdentification && s.emotionInference,
    category: 'prohibited',
    weight: 100,
    reason: 'System combines biometric identification with emotion inference — this may fall under prohibited practices (Art. 5 EU AI Act).',
    action: 'Seek immediate legal counsel. Consider discontinuing this use case until legal clarity is obtained.',
  },
  {
    test: (s) => s.biometricIdentification && s.affectedUsers.includes('public'),
    category: 'prohibited',
    weight: 95,
    reason: 'Real-time biometric identification of members of the public may be prohibited (Art. 5(1)(d)).',
    action: 'Review whether exemptions apply. Consult legal counsel before proceeding.',
  },
  {
    test: (s) => s.emotionInference && (s.domains.includes('employment') || s.domains.includes('education')),
    category: 'prohibited',
    weight: 90,
    reason: 'Emotion recognition in workplace or educational settings is prohibited (Art. 5(1)(f)).',
    action: 'Discontinue emotion inference in this context. Document decision and alternatives.',
  },
  // High-risk
  {
    test: (s) => s.domains.some((d) => HIGH_RISK_DOMAINS.includes(d)),
    category: 'high-risk',
    weight: 70,
    reason: `System operates in a high-risk domain listed in Annex III (domains: ${HIGH_RISK_DOMAINS.join(', ')}).`,
    action: 'Implement full high-risk compliance: risk management system, data governance, documentation, human oversight, transparency, and accuracy monitoring.',
  },
  {
    test: (s) => s.affectedUsers.includes('children') && s.useCases.includes('automated-decisions'),
    category: 'high-risk',
    weight: 80,
    reason: 'Automated decision-making affecting children triggers heightened obligations.',
    action: 'Conduct a fundamental rights impact assessment. Ensure meaningful human oversight is in place for all decisions affecting minors.',
  },
  {
    test: (s) => s.biometricIdentification && !s.emotionInference,
    category: 'high-risk',
    weight: 75,
    reason: 'Non-real-time biometric identification is classified as high-risk (Annex III, point 1).',
    action: 'Register in EU database. Implement conformity assessment. Ensure data governance and logging.',
  },
  {
    test: (s) => s.useCases.includes('scoring') && s.dataCategories.includes('sensitive'),
    category: 'high-risk',
    weight: 65,
    reason: 'Scoring/profiling using sensitive personal data is likely high-risk.',
    action: 'Implement transparency measures. Ensure affected persons can request human review.',
  },
  {
    test: (s) => s.useCases.includes('automated-decisions') && s.dataCategories.includes('personal'),
    category: 'high-risk',
    weight: 60,
    reason: 'Automated decisions involving personal data may be high-risk, especially under GDPR Art. 22.',
    action: 'Implement human oversight mechanism. Provide clear opt-out path. Document decision logic.',
  },
  // Limited risk
  {
    test: (s) => s.useCases.includes('content-generation'),
    category: 'limited-risk',
    weight: 40,
    reason: 'Content generation AI must comply with transparency obligations (Art. 50).',
    action: 'Label AI-generated content clearly. Inform users they are interacting with AI.',
  },
  {
    test: (s) => s.emotionInference && !s.domains.includes('employment') && !s.domains.includes('education'),
    category: 'limited-risk',
    weight: 45,
    reason: 'Emotion recognition outside prohibited contexts triggers transparency requirements.',
    action: 'Notify affected persons that emotion recognition is being used. Obtain consent where required.',
  },
  {
    test: (s) => !s.transparencyProvided && s.affectedUsers.includes('customers'),
    category: 'limited-risk',
    weight: 35,
    reason: 'Customer-facing AI lacking transparency notice requires at minimum limited-risk compliance.',
    action: 'Add transparency notice informing customers they are interacting with AI.',
  },
  {
    test: (s) => s.useCases.includes('recommendations') && s.affectedUsers.includes('public'),
    category: 'limited-risk',
    weight: 30,
    reason: 'Public-facing recommendation systems have transparency obligations.',
    action: 'Disclose that recommendations are AI-generated. Provide information about ranking criteria.',
  },
];

export function classifySystem(system: AISystem): ClassificationResult {
  const triggered: Rule[] = [];

  for (const rule of RULES) {
    if (rule.test(system)) {
      triggered.push(rule);
    }
  }

  if (triggered.length === 0) {
    return {
      category: 'minimal-risk',
      confidence: 'medium',
      reasoning: ['No high-risk, limited-risk, or prohibited indicators were triggered. System appears to be minimal-risk under the EU AI Act.'],
      actions: [
        'Develop a basic AI usage policy.',
        'Ensure staff are aware they are using AI tools.',
        'Maintain basic records of AI system usage.',
        'Review classification periodically or when system changes.',
      ],
    };
  }

  // Determine category from highest-weight triggered rule
  triggered.sort((a, b) => b.weight - a.weight);
  const topRule = triggered[0];
  const category = topRule.category;

  // Determine confidence
  let confidence: RiskConfidence = 'low';
  const categoryRules = triggered.filter((r) => r.category === category);
  if (categoryRules.length >= 3) confidence = 'high';
  else if (categoryRules.length >= 2) confidence = 'medium';

  const reasoning = triggered.map((r) => r.reason);
  const actions = [...new Set(triggered.map((r) => r.action))];

  return { category, confidence, reasoning, actions };
}

export function riskBadgeClass(category: RiskCategory): string {
  switch (category) {
    case 'prohibited': return 'badge-red';
    case 'high-risk': return 'badge-yellow';
    case 'limited-risk': return 'badge-blue';
    case 'minimal-risk': return 'badge-green';
    default: return 'badge-gray';
  }
}

export function riskLabel(category: RiskCategory): string {
  switch (category) {
    case 'prohibited': return 'Prohibited';
    case 'high-risk': return 'High Risk';
    case 'limited-risk': return 'Limited Risk';
    case 'minimal-risk': return 'Minimal Risk';
    default: return 'Unknown';
  }
}
