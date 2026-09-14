import type { CertificationPack } from './types.js';

/**
 * Pure data-transform from a loaded CertificationPack to the shape needed to
 * upsert Certification/CertificationVersion/Domain/Objective rows. Contains
 * no I/O and no Prisma dependency by design - the database package (or
 * apps/web) is responsible for actually persisting this via Prisma, keeping
 * certification-engine usable outside a database context (e.g. CLI tools,
 * future desktop packaging).
 */
export interface CertificationImportInput {
  certification: {
    slug: string;
    name: string;
    description: string | null;
  };
  version: {
    version: string;
    status: 'draft' | 'active' | 'deprecated';
    examName: string;
    totalQuestions: number;
    durationMinutes: number;
    passingScore: number | null;
    scoreScaleMin: number | null;
    scoreScaleMax: number | null;
    questionTypes: Array<'single_choice' | 'multiple_response'>;
    sourceDisclaimer: string;
  };
  domains: Array<{
    key: string;
    name: string;
    description: string | null;
    weightPercent: number;
    targetQuestionCount: number;
    minQuestionCount: number;
    maxQuestionCount: number;
    order: number;
    objectives: Array<{
      code: string;
      title: string;
      description: string | null;
      isPlaceholder: boolean;
      order: number;
    }>;
  }>;
}

export function packToImportInput(pack: CertificationPack): CertificationImportInput {
  const objectivesByDomain = new Map<string, CertificationImportInput['domains'][number]['objectives']>();
  for (const objective of pack.objectives) {
    const list = objectivesByDomain.get(objective.domainKey) ?? [];
    list.push({
      code: objective.code,
      title: objective.title,
      description: objective.description,
      isPlaceholder: objective.isPlaceholder,
      order: objective.order,
    });
    objectivesByDomain.set(objective.domainKey, list);
  }

  return {
    certification: {
      slug: pack.manifest.slug,
      name: pack.manifest.name,
      description: pack.manifest.examName,
    },
    version: {
      version: pack.manifest.version,
      status: pack.manifest.status,
      examName: pack.manifest.examName,
      totalQuestions: pack.manifest.totalQuestions,
      durationMinutes: pack.manifest.durationMinutes,
      passingScore: pack.manifest.passingScore,
      scoreScaleMin: pack.manifest.scoreScale?.min ?? null,
      scoreScaleMax: pack.manifest.scoreScale?.max ?? null,
      questionTypes: pack.manifest.questionTypes,
      sourceDisclaimer: pack.manifest.sourceDisclaimer,
    },
    domains: pack.domains.map((domain) => ({
      key: domain.key,
      name: domain.name,
      description: domain.description,
      weightPercent: domain.weightPercent,
      targetQuestionCount: domain.targetQuestionCount,
      minQuestionCount: domain.minQuestionCount,
      maxQuestionCount: domain.maxQuestionCount,
      order: domain.order,
      objectives: objectivesByDomain.get(domain.key) ?? [],
    })),
  };
}
