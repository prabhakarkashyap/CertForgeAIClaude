/**
 * Certification domain contracts.
 *
 * A Certification is a stable identity ("claude-architect-foundations").
 * A CertificationVersion is an immutable, versioned blueprint snapshot:
 * once any ExamAttempt references a version, that version's domain/
 * objective/timing data must never change (see docs/architecture/data-model.md).
 */

export type CertificationVersionStatus = 'draft' | 'active' | 'deprecated';

export type QuestionType = 'single_choice' | 'multiple_response';

export interface Certification {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CertificationVersion {
  id: string;
  certificationId: string;
  /** Pack version string, e.g. "1.0.0" - matches certifications/<pack>/manifest.json */
  version: string;
  status: CertificationVersionStatus;
  examName: string;
  totalQuestions: number;
  durationMinutes: number;
  passingScore: number | null;
  scoreScaleMin: number | null;
  scoreScaleMax: number | null;
  questionTypes: QuestionType[];
  sourceDisclaimer: string;
  /** true once at least one ExamAttempt references this version */
  isLocked: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Domain {
  id: string;
  certificationVersionId: string;
  key: string;
  name: string;
  description: string | null;
  weightPercent: number;
  targetQuestionCount: number;
  minQuestionCount: number;
  maxQuestionCount: number;
  order: number;
}

export interface Objective {
  id: string;
  domainId: string;
  code: string;
  title: string;
  description: string | null;
  /**
   * True when the objective's detailed content has not yet been populated
   * from an authoritative source (exam guide, official prep material).
   * Placeholder objectives must be clearly labeled in the UI and must
   * never be presented as authoritative curriculum content.
   */
  isPlaceholder: boolean;
  order: number;
}

export interface Scenario {
  id: string;
  certificationVersionId: string;
  domainId: string | null;
  title: string;
  narrative: string;
  tags: string[];
  provider: string | null;
  model: string | null;
  createdAt: Date;
}

/** Per-domain question allocation for a single exam plan. */
export interface DomainAllocation {
  domainId: string;
  domainKey: string;
  count: number;
}

export type ExamMode = 'official_simulation' | 'practice';

export interface ExamPlan {
  certificationVersionId: string;
  mode: ExamMode;
  totalQuestions: number;
  domainAllocations: DomainAllocation[];
  generatedAt: Date;
}
