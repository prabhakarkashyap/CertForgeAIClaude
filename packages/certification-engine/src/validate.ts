import { CertificationPackError } from '@certforge/shared';
import type { BlueprintFile, DomainFileEntry, ManifestFile, ObjectiveFileEntry } from './schemas.js';

const WEIGHT_TOLERANCE = 0.01;

/**
 * Cross-file consistency checks that cannot be expressed in a single file's
 * zod schema. Every issue is collected before throwing so a malformed pack
 * reports all problems in one pass instead of failing file-by-file.
 */
export function crossValidatePack(input: {
  manifest: ManifestFile;
  blueprint: BlueprintFile;
  domains: DomainFileEntry[];
  objectives: ObjectiveFileEntry[];
}): void {
  const { manifest, blueprint, domains, objectives } = input;
  const issues: string[] = [];

  const domainKeys = new Set<string>();
  for (const domain of domains) {
    if (domainKeys.has(domain.key)) {
      issues.push(`Duplicate domain key: "${domain.key}"`);
    }
    domainKeys.add(domain.key);

    if (domain.minQuestionCount > domain.targetQuestionCount) {
      issues.push(
        `Domain "${domain.key}": minQuestionCount (${domain.minQuestionCount}) exceeds targetQuestionCount (${domain.targetQuestionCount})`,
      );
    }
    if (domain.targetQuestionCount > domain.maxQuestionCount) {
      issues.push(
        `Domain "${domain.key}": targetQuestionCount (${domain.targetQuestionCount}) exceeds maxQuestionCount (${domain.maxQuestionCount})`,
      );
    }
  }

  const weightSum = domains.reduce((sum, d) => sum + d.weightPercent, 0);
  if (Math.abs(weightSum - 100) > WEIGHT_TOLERANCE) {
    issues.push(`Domain weightPercent values sum to ${weightSum}, expected 100`);
  }

  const targetSum = domains.reduce((sum, d) => sum + d.targetQuestionCount, 0);
  if (targetSum !== manifest.totalQuestions) {
    issues.push(
      `Domain targetQuestionCount values sum to ${targetSum}, expected manifest.totalQuestions (${manifest.totalQuestions})`,
    );
  }

  if (blueprint.officialSimulation.questionCount !== manifest.totalQuestions) {
    issues.push(
      `blueprint.officialSimulation.questionCount (${blueprint.officialSimulation.questionCount}) does not match manifest.totalQuestions (${manifest.totalQuestions})`,
    );
  }
  if (blueprint.officialSimulation.durationMinutes !== manifest.durationMinutes) {
    issues.push(
      `blueprint.officialSimulation.durationMinutes (${blueprint.officialSimulation.durationMinutes}) does not match manifest.durationMinutes (${manifest.durationMinutes})`,
    );
  }

  for (const objective of objectives) {
    if (!domainKeys.has(objective.domainKey)) {
      issues.push(
        `Objective "${objective.code}" references unknown domainKey "${objective.domainKey}"`,
      );
    }
  }

  if (issues.length > 0) {
    throw new CertificationPackError({
      message: `Certification pack "${manifest.slug}" failed cross-file validation`,
      details: { issues },
    });
  }
}
