import { appSettingsRepository, userProfileRepository, providerConfigRepository, prisma } from '@certforge/database';

export type SetupStepId = 'welcome' | 'system-check' | 'database' | 'profile' | 'provider' | 'certifications' | 'finish';

export interface SetupStatus {
  completed: boolean;
  hasProfile: boolean;
  hasActiveProvider: boolean;
  hasActiveCertification: boolean;
}

export async function getSetupStatus(): Promise<SetupStatus> {
  const [completed, profile, provider, certification] = await Promise.all([
    appSettingsRepository.isSetupComplete(prisma),
    userProfileRepository.getPrimaryProfile(prisma),
    providerConfigRepository.getActiveProviderConfigMasked(prisma),
    prisma.certificationVersion.findFirst({ where: { status: 'active' } }),
  ]);

  return {
    completed,
    hasProfile: profile !== null,
    hasActiveProvider: provider !== null,
    hasActiveCertification: certification !== null,
  };
}

export async function completeSetup(): Promise<void> {
  await appSettingsRepository.markSetupComplete(prisma);
}
