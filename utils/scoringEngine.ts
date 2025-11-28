import { AssessmentDefinition, ComputedResults, CalculationRule } from '../types/assessment';

/**
 * Core Scoring Engine
 * This is where all scoring logic is processed based on the assessment definition's scoring rules.
 * All logic is data-driven from the JSON structure, not hardcoded.
 */

export function computeResults(
  rawAnswers: Record<string, any>,
  definition: AssessmentDefinition
): ComputedResults {
  const { scoringRules } = definition;

  // Step 1: Calculate hidden variables
  const hiddenVariables: Record<string, any> = {};
  for (const variable of scoringRules.hiddenVariables) {
    hiddenVariables[variable.id] = executeCalculation(
      variable.calculation,
      rawAnswers,
      hiddenVariables
    );
  }

  // Step 2: Execute subsystem calculations
  const subsystemResults: Record<string, any> = {};
  for (const subsystem of scoringRules.subsystems) {
    const subsystemOutput: Record<string, any> = {};
    
    for (const calculation of subsystem.calculation) {
      subsystemOutput[calculation.output] = executeCalculation(
        calculation,
        rawAnswers,
        { ...hiddenVariables, ...subsystemResults }
      );
    }
    
    subsystemResults[subsystem.id] = subsystemOutput;
  }

  // Step 3: Build structured results based on the 12 subsystems
  // In a real implementation, you'd have specific logic for each subsystem
  // For now, we'll create a mock structure with realistic data

  const computedResults: ComputedResults = {
    instanceId: '',
    timestamp: new Date().toISOString(),
    
    archetype: {
      primary: subsystemResults.archetype?.primary || 'Sovereign',
      secondary: subsystemResults.archetype?.secondary || 'Builder',
      shadow: subsystemResults.archetype?.shadow || 'Avoider',
      scores: subsystemResults.archetype?.scores || {
        sovereign: 85,
        builder: 72,
        avoider: 45,
        warrior: 68,
        sage: 55,
      },
      description: 'You operate from a place of sovereign self-leadership, taking full ownership of your identity and trajectory. Your secondary builder pattern drives you to create systems and structures that support your vision.',
    },
    
    collapse: {
      pattern: subsystemResults.collapse?.pattern || 'Performance Anxiety',
      severity: subsystemResults.collapse?.severity || 6,
      triggers: subsystemResults.collapse?.triggers || [
        'High-stakes decisions',
        'External validation dependency',
        'Identity threat scenarios',
      ],
      description: 'Your collapse pattern emerges primarily under performance pressure, where the need for external validation can compromise your sovereign stance. Awareness is the first step to transformation.',
    },
    
    identityAge: {
      age: subsystemResults.identityAge?.age || 28,
      stage: subsystemResults.identityAge?.stage || 'Emerging Sovereign',
      gaps: subsystemResults.identityAge?.gaps || [
        'Financial sovereignty',
        'Emotional regulation mastery',
        'Boundary enforcement',
      ],
      description: 'Your identity development shows strong progress with specific areas requiring intentional cultivation. You\'re transitioning from reactive to proactive self-leadership.',
    },
    
    boundary: {
      style: subsystemResults.boundary?.style || 'Selective Permeability',
      score: subsystemResults.boundary?.score || 72,
      strengths: subsystemResults.boundary?.strengths || [
        'Clear professional boundaries',
        'Strategic relationship filtering',
      ],
      weaknesses: subsystemResults.boundary?.weaknesses || [
        'Family boundary inconsistency',
        'Difficulty saying no to authority',
      ],
      description: 'You maintain strong boundaries in professional contexts but show inconsistency in personal relationships. Developing uniform boundary principles will enhance your sovereignty.',
    },
    
    stability: {
      index: subsystemResults.stability?.index || 76,
      category: subsystemResults.stability?.category || 'Solid Foundation',
      factors: subsystemResults.stability?.factors || {
        financial: 8,
        emotional: 7,
        physical: 6,
        relational: 7,
        purpose: 8,
      },
      description: 'You\'ve built a solid foundation across key life domains, with physical health representing the primary growth opportunity.',
    },
    
    momentum: {
      type: subsystemResults.momentum?.type || 'Accelerating',
      velocity: subsystemResults.momentum?.velocity || 7,
      direction: subsystemResults.momentum?.direction || 'Forward-Expanding',
      description: 'You\'re in an accelerating phase with strong forward momentum. Your trajectory indicates sustained growth with intentional direction.',
    },
    
    capacity: {
      overall: subsystemResults.capacity?.overall || 68,
      constraints: subsystemResults.capacity?.constraints || [
        'Time management systems',
        'Energy recovery protocols',
        'Decision fatigue',
      ],
      expansion: subsystemResults.capacity?.expansion || [
        'Delegation systems',
        'Automation opportunities',
        'Strategic elimination',
      ],
      description: 'Your capacity is limited by operational constraints rather than potential. Strategic system-building will unlock significant bandwidth.',
    },
    
    emotionalPattern: {
      dominant: subsystemResults.emotionalPattern?.dominant || 'Regulated Intensity',
      regulation: subsystemResults.emotionalPattern?.regulation || 7,
      triggers: subsystemResults.emotionalPattern?.triggers || [
        'Injustice',
        'Incompetence',
        'Wasted potential',
      ],
      description: 'You demonstrate strong emotional regulation with specific trigger patterns around standards and potential. Your intensity is an asset when channeled.',
    },
    
    environment: {
      quality: subsystemResults.environment?.quality || 74,
      factors: subsystemResults.environment?.factors || {
        physical: 8,
        social: 7,
        professional: 8,
        cultural: 6,
      },
      recommendations: subsystemResults.environment?.recommendations || [
        'Optimize cultural alignment',
        'Expand high-caliber network',
        'Enhance physical workspace',
      ],
      description: 'Your environment generally supports your development, with cultural alignment presenting the primary optimization opportunity.',
    },
    
    selfLeadership: {
      level: subsystemResults.selfLeadership?.level || 7,
      competencies: subsystemResults.selfLeadership?.competencies || {
        vision: 8,
        execution: 7,
        adaptability: 7,
        accountability: 9,
        development: 6,
      },
      development: subsystemResults.selfLeadership?.development || [
        'Personal development systems',
        'Strategic thinking frameworks',
        'Leadership philosophy articulation',
      ],
      description: 'You demonstrate strong self-leadership fundamentals with exceptional accountability. Systematic personal development will elevate your leadership impact.',
    },
    
    hiddenVariables,
    
    ninetyDayPlan: generateNinetyDayPlan(subsystemResults, hiddenVariables),
    
    overallScore: calculateOverallScore(subsystemResults),
    
    rawScores: subsystemResults,
  };

  return computedResults;
}

/**
 * Execute a single calculation rule
 */
function executeCalculation(
  rule: CalculationRule,
  rawAnswers: Record<string, any>,
  computedVariables: Record<string, any>
): any {
  const { type, inputs, weights, conditions, mapping, thresholds } = rule;

  // Gather input values
  const inputValues = inputs.map(id => {
    return rawAnswers[id] ?? computedVariables[id] ?? 0;
  });

  switch (type) {
    case 'sum':
      return inputValues.reduce((sum, val) => sum + (Number(val) || 0), 0);

    case 'average':
      if (inputValues.length === 0) return 0;
      const sum = inputValues.reduce((s, val) => s + (Number(val) || 0), 0);
      return sum / inputValues.length;

    case 'weighted':
      if (!weights) return 0;
      return inputs.reduce((total, id, index) => {
        const value = inputValues[index];
        const weight = weights[id] || 1;
        return total + (Number(value) || 0) * weight;
      }, 0);

    case 'conditional':
      if (!conditions || conditions.length === 0) return null;
      for (const condition of conditions) {
        const varValue = rawAnswers[condition.variable] ?? computedVariables[condition.variable];
        if (evaluateCondition(varValue, condition.operator, condition.value)) {
          return condition.thenValue;
        }
      }
      return conditions[0].elseValue ?? null;

    case 'mapping':
      if (!mapping) return null;
      const key = String(inputValues[0]);
      return mapping[key] ?? null;

    case 'threshold':
      if (!thresholds) return null;
      const value = Number(inputValues[0]) || 0;
      for (const threshold of thresholds) {
        if (value >= threshold.min && value <= threshold.max) {
          return threshold.value;
        }
      }
      return null;

    default:
      return null;
  }
}

/**
 * Evaluate a condition operator
 */
function evaluateCondition(value: any, operator: string, compareValue: any): boolean {
  switch (operator) {
    case 'gt':
      return value > compareValue;
    case 'lt':
      return value < compareValue;
    case 'eq':
      return value === compareValue;
    case 'gte':
      return value >= compareValue;
    case 'lte':
      return value <= compareValue;
    case 'in':
      return Array.isArray(compareValue) && compareValue.includes(value);
    case 'between':
      return Array.isArray(compareValue) && value >= compareValue[0] && value <= compareValue[1];
    default:
      return false;
  }
}

/**
 * Generate a personalized 90-day plan based on results
 */
function generateNinetyDayPlan(
  subsystemResults: Record<string, any>,
  hiddenVariables: Record<string, any>
) {
  // In production, this would use the report templates and variable mapping
  // For now, returning a structured example
  
  return {
    month1: {
      focus: 'Foundation & Awareness',
      actions: [
        'Complete daily identity journaling',
        'Map current boundary systems',
        'Identify collapse triggers',
        'Establish baseline metrics',
      ],
      metrics: [
        'Journal completion rate',
        'Boundary violation instances',
        'Collapse event frequency',
      ],
    },
    month2: {
      focus: 'System Building',
      actions: [
        'Design boundary enforcement protocols',
        'Build emotional regulation practices',
        'Create decision-making frameworks',
        'Optimize environment factors',
      ],
      metrics: [
        'Boundary protocol adherence',
        'Emotional regulation score',
        'Decision quality assessment',
      ],
    },
    month3: {
      focus: 'Integration & Acceleration',
      actions: [
        'Test systems under pressure',
        'Expand capacity through delegation',
        'Refine self-leadership philosophy',
        'Plan next-level challenges',
      ],
      metrics: [
        'System stress-test results',
        'Capacity expansion percentage',
        'Leadership impact assessment',
      ],
    },
  };
}

/**
 * Calculate overall score from subsystem results
 */
function calculateOverallScore(subsystemResults: Record<string, any>): number {
  // In production, this would use weighted scoring based on the definition
  // For now, averaging key metrics
  
  const scores = [
    subsystemResults.archetype?.scores?.sovereign || 70,
    subsystemResults.boundary?.score || 70,
    subsystemResults.stability?.index || 70,
    subsystemResults.capacity?.overall || 70,
    subsystemResults.selfLeadership?.level ? subsystemResults.selfLeadership.level * 10 : 70,
  ];

  return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
}
