// Core Assessment Types

export interface AssessmentDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  questions: Question[];
  scoringRules: ScoringRules;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  section: string;
  text: string;
  type: 'scale' | 'multiple_choice' | 'text' | 'ranking';
  options?: QuestionOption[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
  required: boolean;
  subsystems: string[]; // Which scoring subsystems this question feeds into
}

export interface QuestionOption {
  value: string | number;
  label: string;
  weight?: number;
}

export interface ScoringRules {
  subsystems: ScoringSubsystem[];
  hiddenVariables: HiddenVariable[];
  reportTemplates: ReportTemplate[];
}

export interface ScoringSubsystem {
  id: string;
  name: string;
  description: string;
  calculation: CalculationRule[];
  outputs: string[];
}

export interface CalculationRule {
  id: string;
  type: 'sum' | 'average' | 'weighted' | 'conditional' | 'mapping' | 'threshold';
  inputs: string[]; // Question IDs or other variable IDs
  weights?: Record<string, number>;
  conditions?: Condition[];
  mapping?: Record<string, any>;
  thresholds?: Threshold[];
  output: string;
}

export interface Condition {
  variable: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'in' | 'between';
  value: any;
  thenValue: any;
  elseValue?: any;
}

export interface Threshold {
  min: number;
  max: number;
  label: string;
  value: any;
}

export interface HiddenVariable {
  id: string;
  name: string;
  description: string;
  calculation: CalculationRule;
}

export interface ReportTemplate {
  section: string;
  title: string;
  content: string;
  variableMapping: Record<string, string>;
}

// Assessment Instance Types

export interface AssessmentInstance {
  id: string;
  userId: string;
  definitionId: string;
  version: string;
  status: 'in_progress' | 'completed' | 'archived';
  rawAnswers: Record<string, any>;
  computedResults: ComputedResults | null;
  startedAt: string;
  completedAt: string | null;
}

export interface ComputedResults {
  instanceId: string;
  timestamp: string;
  
  // 12 Core Subsystems
  archetype: ArchetypeResults;
  collapse: CollapseResults;
  identityAge: IdentityAgeResults;
  boundary: BoundaryResults;
  stability: StabilityResults;
  momentum: MomentumResults;
  capacity: CapacityResults;
  emotionalPattern: EmotionalPatternResults;
  environment: EnvironmentResults;
  selfLeadership: SelfLeadershipResults;
  
  // Hidden variables (39 total)
  hiddenVariables: Record<string, any>;
  
  // Generated outputs
  ninetyDayPlan: NinetyDayPlan;
  overallScore: number;
  rawScores: Record<string, any>;
}

// Subsystem Result Types

export interface ArchetypeResults {
  primary: string;
  secondary: string;
  shadow: string;
  scores: Record<string, number>;
  description: string;
}

export interface CollapseResults {
  pattern: string;
  severity: number;
  triggers: string[];
  description: string;
}

export interface IdentityAgeResults {
  age: number;
  stage: string;
  gaps: string[];
  description: string;
}

export interface BoundaryResults {
  style: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  description: string;
}

export interface StabilityResults {
  index: number;
  category: string;
  factors: Record<string, number>;
  description: string;
}

export interface MomentumResults {
  type: string;
  velocity: number;
  direction: string;
  description: string;
}

export interface CapacityResults {
  overall: number;
  constraints: string[];
  expansion: string[];
  description: string;
}

export interface EmotionalPatternResults {
  dominant: string;
  regulation: number;
  triggers: string[];
  description: string;
}

export interface EnvironmentResults {
  quality: number;
  factors: Record<string, number>;
  recommendations: string[];
  description: string;
}

export interface SelfLeadershipResults {
  level: number;
  competencies: Record<string, number>;
  development: string[];
  description: string;
}

export interface NinetyDayPlan {
  month1: PlanPhase;
  month2: PlanPhase;
  month3: PlanPhase;
}

export interface PlanPhase {
  focus: string;
  actions: string[];
  metrics: string[];
}
