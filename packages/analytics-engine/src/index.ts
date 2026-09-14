/**
 * Service boundary contract for dashboard/results analytics. Implemented
 * starting Phase 6. Never fabricates data: readiness/weakness figures must
 * be derived from real recorded attempts, and the dashboard must show
 * explicit empty states before enough history exists.
 */
export interface DomainPerformanceSummary {
  domainId: string;
  domainKey: string;
  correctCount: number;
  totalCount: number;
  accuracy: number;
}

export interface WeakConceptProfile {
  objectiveId: string;
  recencyWeightedAccuracy: number;
  sampleSize: number;
}

export interface AnalyticsService {
  getScoreTrend(userId: string, certificationVersionId: string): Promise<Array<{ attemptId: string; rawPercentage: number; computedAt: Date }>>;
  getDomainPerformance(userId: string, certificationVersionId: string): Promise<DomainPerformanceSummary[]>;
  getWeakConcepts(userId: string, certificationVersionId: string): Promise<WeakConceptProfile[]>;
}
