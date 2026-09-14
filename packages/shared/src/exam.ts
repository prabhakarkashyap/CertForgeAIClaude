import type { ExamMode, ExamPlan } from './certification.js';

export type ExamAttemptStatus =
  | 'not_started'
  | 'in_progress'
  | 'paused'
  | 'submitted'
  | 'expired'
  | 'abandoned';

export interface ExamAttempt {
  id: string;
  userId: string;
  certificationVersionId: string;
  mode: ExamMode;
  status: ExamAttemptStatus;
  /** Immutable snapshot of the plan used to assemble this attempt. */
  examPlan: ExamPlan;
  durationMinutes: number;
  /** Cumulative active (unpaused) seconds elapsed. */
  activeSeconds: number;
  /** Cumulative paused seconds elapsed (practice mode only). */
  pausedSeconds: number;
  startedAt: Date | null;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Ordered, immutable snapshot of a question as served within one attempt. */
export interface ExamQuestion {
  id: string;
  examAttemptId: string;
  questionId: string;
  order: number;
  domainId: string;
  objectiveId: string;
}

export interface ExamAnswer {
  id: string;
  examAttemptId: string;
  examQuestionId: string;
  selectedOptionIds: string[];
  isFlagged: boolean;
  firstAnsweredAt: Date | null;
  lastUpdatedAt: Date;
}

export type ExamEventType =
  | 'started'
  | 'navigated'
  | 'answered'
  | 'flagged'
  | 'unflagged'
  | 'paused'
  | 'resumed'
  | 'submitted'
  | 'expired';

export interface ExamEvent {
  id: string;
  examAttemptId: string;
  type: ExamEventType;
  payload: Record<string, unknown>;
  occurredAt: Date;
}

export interface AttemptResult {
  id: string;
  examAttemptId: string;
  rawScore: number;
  rawTotal: number;
  rawPercentage: number;
  /** Estimated scaled score - always labeled as an estimate in the UI, never official. */
  estimatedScaledScore: number | null;
  passTargetMet: boolean | null;
  computedAt: Date;
}

export interface DomainResult {
  id: string;
  attemptResultId: string;
  domainId: string;
  objectiveId: string | null;
  correctCount: number;
  totalCount: number;
}
