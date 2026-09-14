import type { AttemptResult, DomainResult, ExamAttempt } from '@certforge/shared';

/**
 * Service boundary contract for scoring. Implemented starting Phase 6.
 * The raw score is always computed and shown; any scaled-score estimate
 * must be clearly labeled as an estimate (never presented as an official
 * Anthropic/Pearson score) and its formula must be configurable/documented.
 */
export interface ScoringService {
  score(attempt: ExamAttempt): Promise<{ result: AttemptResult; domainResults: DomainResult[] }>;
}

export interface ScaledScoreEstimator {
  /** Formula version identifier, surfaced alongside the estimate in the UI/export. */
  readonly formulaVersion: string;
  estimate(rawScore: number, rawTotal: number): number;
}
