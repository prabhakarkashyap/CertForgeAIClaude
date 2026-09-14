import type { DomainAllocation, ExamPlan, GenerationJob, Question } from '@certforge/shared';

/**
 * Service boundary contracts for the question generation/validation
 * pipeline (Exam Planner -> Scenario Planner -> Question Specification ->
 * Question Generator -> Schema Validator -> Independent Reviewer -> Repair
 * -> Deduplication -> Approval/Quarantine). Implemented starting Phase 4;
 * this package currently defines the contracts only so callers (exam-engine,
 * apps/web) can be written against a stable interface.
 */

export interface QuestionSpecification {
  certificationVersionId: string;
  domainId: string;
  objectiveId: string;
  scenarioId: string | null;
  type: 'single_choice' | 'multiple_response';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface QuestionGenerationService {
  /** Expands an ExamPlan's domain allocations into concrete question specifications. */
  planQuestionSpecifications(plan: ExamPlan, allocations: DomainAllocation[]): Promise<QuestionSpecification[]>;
  /** Generates and validates enough approved questions to satisfy the given specifications. */
  fulfillSpecifications(specs: QuestionSpecification[]): Promise<GenerationJob>;
}

export interface QuestionValidationService {
  validate(question: Question): Promise<{ verdict: 'approved' | 'repair_needed' | 'quarantined'; issues: string[] }>;
}

export interface QuestionBankService {
  findApprovedForSpecification(spec: QuestionSpecification, excludeIds: string[]): Promise<Question | null>;
  countApprovedForObjective(objectiveId: string): Promise<number>;
}
