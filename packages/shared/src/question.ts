import type { QuestionType } from './certification.js';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

/**
 * Question lifecycle state (see docs section "Question Bank and Content
 * Lifecycle"). Only 'approved' questions are eligible to be served in an
 * exam attempt.
 */
export type QuestionLifecycleState =
  | 'generated'
  | 'validated'
  | 'approved'
  | 'flagged'
  | 'quarantined'
  | 'retired';

export type ValidatorVerdict = 'approved' | 'repair_needed' | 'quarantined';

export interface QuestionOption {
  id: string;
  questionId: string;
  label: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

/** Provenance fields required for every AI-generated question (PRD section 13). */
export interface QuestionProvenance {
  provider: string;
  model: string;
  promptVersion: string;
  generatedAt: Date;
}

export interface Question {
  id: string;
  certificationVersionId: string;
  domainId: string;
  objectiveId: string;
  scenarioId: string | null;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  stem: string;
  options: QuestionOption[];
  correctOptionIds: string[];
  rationale: string;
  /** Explanation keyed by QuestionOption.id for why each distractor is inferior/incorrect. */
  distractorRationales: Record<string, string>;
  tags: string[];
  status: QuestionLifecycleState;
  provenance: QuestionProvenance;
  validatorStatus: ValidatorVerdict | null;
  validatorConfidence: number | null;
  qualityScore: number | null;
  timesServed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionValidation {
  id: string;
  questionId: string;
  validatorProvider: string;
  validatorModel: string;
  verdict: ValidatorVerdict;
  confidence: number;
  issues: string[];
  reviewedAt: Date;
}

export type QuestionFeedbackRating = 'good' | 'poor' | 'possibly_incorrect';

export interface QuestionFeedback {
  id: string;
  questionId: string;
  examAttemptId: string | null;
  userId: string | null;
  rating: QuestionFeedbackRating;
  comment: string | null;
  createdAt: Date;
}
