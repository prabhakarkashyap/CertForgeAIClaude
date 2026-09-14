import { prisma } from '@certforge/database';
import { getProfile } from './profile-service.js';

export interface DashboardData {
  profile: Awaited<ReturnType<typeof getProfile>>;
  activeCertification: {
    slug: string;
    name: string;
    version: string;
    examName: string;
    totalQuestions: number;
    durationMinutes: number;
    domains: Array<{ key: string; name: string; weightPercent: number }>;
  } | null;
  recentAttemptCount: number;
}

export async function getDashboardData(): Promise<DashboardData> {
  const profile = await getProfile();

  const activeVersion = await prisma.certificationVersion.findFirst({
    where: { status: 'active' },
    include: { certification: true, domains: { orderBy: { order: 'asc' } } },
  });

  const recentAttemptCount = activeVersion
    ? await prisma.examAttempt.count({ where: { certificationVersionId: activeVersion.id } })
    : 0;

  return {
    profile,
    activeCertification: activeVersion
      ? {
          slug: activeVersion.certification.slug,
          name: activeVersion.certification.name,
          version: activeVersion.version,
          examName: activeVersion.examName,
          totalQuestions: activeVersion.totalQuestions,
          durationMinutes: activeVersion.durationMinutes,
          domains: activeVersion.domains.map((d) => ({ key: d.key, name: d.name, weightPercent: d.weightPercent })),
        }
      : null,
    recentAttemptCount,
  };
}
