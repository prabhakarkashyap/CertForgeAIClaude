import path from 'node:path';
import { readFile } from 'node:fs/promises';
import {
  discoverPackDirs,
  loadCertificationPack,
  packToImportInput,
  summarizePack,
  type CertificationPackSummary,
} from '@certforge/certification-engine';
import { prisma } from '@certforge/database';
import { CertificationPackError } from '@certforge/shared';
import { createLogger } from '../../lib/logger.js';

const logger = createLogger('certification-service');

function getCertificationsRoot(): string {
  return process.env.CERTIFICATIONS_DIR
    ? path.resolve(process.cwd(), process.env.CERTIFICATIONS_DIR)
    : path.resolve(process.cwd(), '../../certifications');
}

export interface InstalledCertificationSummary extends CertificationPackSummary {
  packDir: string;
  isActiveInDatabase: boolean;
}

/**
 * Discovers every certification pack on disk, validates it, and reports
 * whether it has been imported/activated in the database yet. A pack that
 * fails validation is reported with its error rather than crashing the
 * whole catalog (so one bad pack cannot take down certification discovery).
 */
export async function listInstalledCertifications(): Promise<
  Array<InstalledCertificationSummary | { packDir: string; error: string }>
> {
  const root = getCertificationsRoot();
  let dirs: string[];
  try {
    dirs = await discoverPackDirs(root);
  } catch (error) {
    logger.warn('certifications_root_missing', { root });
    return [];
  }

  const results: Array<InstalledCertificationSummary | { packDir: string; error: string }> = [];
  for (const dir of dirs) {
    try {
      const pack = await loadCertificationPack(dir);
      const existing = await prisma.certificationVersion.findFirst({
        where: {
          version: pack.manifest.version,
          status: 'active',
          certification: { slug: pack.manifest.slug },
        },
      });
      results.push({ ...summarizePack(pack), packDir: dir, isActiveInDatabase: existing !== null });
    } catch (error) {
      const message = error instanceof CertificationPackError ? error.message : 'Failed to load certification pack.';
      logger.error('certification_pack_load_failed', { packDir: dir, message });
      results.push({ packDir: dir, error: message });
    }
  }
  return results;
}

/**
 * Imports a certification pack's blueprint into the database and marks its
 * version active. Idempotent: re-activating the same pack version updates
 * the existing rows rather than duplicating them. A version already
 * referenced by an ExamAttempt (isLocked) is never mutated - see
 * docs/architecture/data-model.md.
 */
export async function activateCertificationPack(packDir: string): Promise<InstalledCertificationSummary> {
  const pack = await loadCertificationPack(packDir);
  const input = packToImportInput(pack);

  const certification = await prisma.certification.upsert({
    where: { slug: input.certification.slug },
    create: input.certification,
    update: { name: input.certification.name, description: input.certification.description },
  });

  const existingVersion = await prisma.certificationVersion.findUnique({
    where: { certificationId_version: { certificationId: certification.id, version: input.version.version } },
  });

  if (existingVersion?.isLocked) {
    throw new CertificationPackError({
      message: `Certification version ${input.certification.slug}@${input.version.version} is locked because exam attempts already reference it. Publish a new version instead of modifying this one.`,
    });
  }

  const version = await prisma.certificationVersion.upsert({
    where: { certificationId_version: { certificationId: certification.id, version: input.version.version } },
    create: { ...input.version, certificationId: certification.id, status: 'active' },
    update: { ...input.version, status: 'active' },
  });

  // Deactivate any other version of the same certification.
  await prisma.certificationVersion.updateMany({
    where: { certificationId: certification.id, id: { not: version.id } },
    data: { status: 'deprecated' },
  });

  for (const domain of input.domains) {
    const domainRow = await prisma.domain.upsert({
      where: { certificationVersionId_key: { certificationVersionId: version.id, key: domain.key } },
      create: {
        certificationVersionId: version.id,
        key: domain.key,
        name: domain.name,
        description: domain.description,
        weightPercent: domain.weightPercent,
        targetQuestionCount: domain.targetQuestionCount,
        minQuestionCount: domain.minQuestionCount,
        maxQuestionCount: domain.maxQuestionCount,
        order: domain.order,
      },
      update: {
        name: domain.name,
        description: domain.description,
        weightPercent: domain.weightPercent,
        targetQuestionCount: domain.targetQuestionCount,
        minQuestionCount: domain.minQuestionCount,
        maxQuestionCount: domain.maxQuestionCount,
        order: domain.order,
      },
    });

    for (const objective of domain.objectives) {
      await prisma.objective.upsert({
        where: { domainId_code: { domainId: domainRow.id, code: objective.code } },
        create: { ...objective, domainId: domainRow.id },
        update: objective,
      });
    }
  }

  logger.info('certification_pack_activated', { slug: input.certification.slug, version: input.version.version });

  return { ...summarizePack(pack), packDir, isActiveInDatabase: true };
}

export interface ActiveCertificationPrompts {
  slug: string;
  name: string;
  version: string;
  prompts: Array<{ role: 'generator' | 'reviewer' | 'repair' | 'tutor'; filePath: string; content: string }>;
}

/**
 * Reads the four prompt template files for whichever certification pack is
 * currently active in the database, so the admin "Prompt Templates" screen
 * can display real content instead of hard-coded copy.
 */
export async function getActiveCertificationPrompts(): Promise<ActiveCertificationPrompts | null> {
  const activeVersion = await prisma.certificationVersion.findFirst({
    where: { status: 'active' },
    include: { certification: true },
  });
  if (!activeVersion) return null;

  const root = getCertificationsRoot();
  const dirs = await discoverPackDirs(root).catch(() => []);
  for (const dir of dirs) {
    const pack = await loadCertificationPack(dir).catch(() => null);
    if (!pack) continue;
    if (pack.manifest.slug !== activeVersion.certification.slug || pack.manifest.version !== activeVersion.version) {
      continue;
    }

    const prompts = await Promise.all(
      (['generator', 'reviewer', 'repair', 'tutor'] as const).map(async (role) => {
        const filePath = path.join(dir, pack.promptReferences[role]);
        const content = await readFile(filePath, 'utf-8');
        return { role, filePath, content };
      }),
    );

    return { slug: pack.manifest.slug, name: pack.manifest.name, version: pack.manifest.version, prompts };
  }
  return null;
}
