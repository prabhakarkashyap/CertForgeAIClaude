import type { DomainAllocation, ExamAttempt, ExamMode, ExamPlan } from '@certforge/shared';

/**
 * Service boundary contracts for exam planning and the exam runner.
 * Implemented starting Phase 2 (planning/allocator) and Phase 5 (attempt
 * lifecycle/UI). Defined now so the certification engine and question
 * engine can be composed behind a stable interface.
 */

export interface ExamPlanningService {
  /**
   * Deterministic largest-remainder allocation across a certification
   * version's domains for the given mode (see PRD section 5.1: official
   * simulation must not silently misrepresent the published blueprint).
   */
  allocate(certificationVersionId: string, mode: ExamMode, totalQuestions: number): Promise<DomainAllocation[]>;
  createPlan(certificationVersionId: string, mode: ExamMode, totalQuestions: number): Promise<ExamPlan>;
}

export interface ExamAttemptService {
  start(userId: string, plan: ExamPlan): Promise<ExamAttempt>;
  pause(attemptId: string): Promise<ExamAttempt>;
  resume(attemptId: string): Promise<ExamAttempt>;
  recordAnswer(attemptId: string, examQuestionId: string, selectedOptionIds: string[]): Promise<void>;
  submit(attemptId: string): Promise<ExamAttempt>;
}
