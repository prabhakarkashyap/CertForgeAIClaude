/**
 * Development seed script: imports the bundled certification packs found
 * under certifications/ into the database as Certification +
 * CertificationVersion + Domain + Objective rows. Safe to re-run - it
 * upserts by (slug) / (certificationId, version) / (certificationVersionId, key)
 * / (domainId, code).
 *
 * Run with: npm run db:seed --workspace=packages/database
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAllCertificationPacks, packToImportInput } from '@certforge/certification-engine';
import { createPrismaClient } from '../src/client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CERTIFICATIONS_ROOT = path.resolve(__dirname, '../../../certifications');

async function main(): Promise<void> {
  const prisma = createPrismaClient();
  const packs = await loadAllCertificationPacks(CERTIFICATIONS_ROOT);

  for (const pack of packs) {
    const input = packToImportInput(pack);

    const certification = await prisma.certification.upsert({
      where: { slug: input.certification.slug },
      create: input.certification,
      update: { name: input.certification.name, description: input.certification.description },
    });

    const version = await prisma.certificationVersion.upsert({
      where: {
        certificationId_version: {
          certificationId: certification.id,
          version: input.version.version,
        },
      },
      create: { ...input.version, certificationId: certification.id },
      update: input.version,
    });

    for (const domain of input.domains) {
      const domainRow = await prisma.domain.upsert({
        where: {
          certificationVersionId_key: {
            certificationVersionId: version.id,
            key: domain.key,
          },
        },
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
          where: {
            domainId_code: {
              domainId: domainRow.id,
              code: objective.code,
            },
          },
          create: { ...objective, domainId: domainRow.id },
          update: objective,
        });
      }
    }

    // eslint-disable-next-line no-console
    console.log(`Seeded certification pack: ${input.certification.slug}@${input.version.version}`);
  }

  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
