import { afterAll, describe, expect, it } from 'vitest';
import { createPrismaClient } from '../src/client.js';
import * as appSettings from '../src/repositories/app-settings.js';
import * as userProfile from '../src/repositories/user-profile.js';
import * as providerConfig from '../src/repositories/provider-config.js';

/**
 * These are integration tests: they exercise real Prisma queries against a
 * real PostgreSQL database (DATABASE_URL). They intentionally do NOT run
 * against a mock, per NFR-010 (repositories must be verified against real
 * Prisma/Postgres behavior, not simulated).
 *
 * When no reachable database is configured (e.g. this repository's CI
 * container, or a contributor machine without Postgres yet), the suite
 * skips itself with a clear message instead of failing the whole run. The
 * connectivity probe runs at module-load time (top-level await) so
 * describe.skipIf sees the real result instead of its initial value - see
 * docs/implementation/phase-status.md for current coverage status.
 */
const prisma = createPrismaClient();
const databaseAvailable = await prisma
  .$connect()
  .then(() => true)
  .catch(() => {
    // eslint-disable-next-line no-console
    console.warn(
      '[repositories.test] Skipping database integration tests: could not connect using DATABASE_URL.',
    );
    return false;
  });

afterAll(async () => {
  if (databaseAvailable) {
    await prisma.appSetting.deleteMany({ where: { key: { startsWith: 'test.' } } });
    await prisma.user.deleteMany({ where: { email: 'integration-test@example.invalid' } });
  }
  await prisma.$disconnect();
});

describe.skipIf(!databaseAvailable)('app settings repository', () => {
  it('round-trips a setting and reports setup completion state', async () => {
    await appSettings.setSetting(prisma, 'test.flag', 'hello');
    expect(await appSettings.getSetting(prisma, 'test.flag')).toBe('hello');

    expect(await appSettings.isSetupComplete(prisma)).toBe(false);
    await appSettings.markSetupComplete(prisma);
    expect(await appSettings.isSetupComplete(prisma)).toBe(true);
  });
});

describe.skipIf(!databaseAvailable)('user profile repository', () => {
  it('creates and updates the primary profile', async () => {
    const created = await userProfile.createProfile(prisma, {
      firstName: 'Ada',
      lastName: 'Lovelace',
      displayName: 'Ada L.',
      email: 'integration-test@example.invalid',
    });
    expect(created.id).toBeTruthy();

    const fetched = await userProfile.getPrimaryProfile(prisma);
    expect(fetched?.id).toBe(created.id);

    const updated = await userProfile.updateProfile(prisma, created.id, {
      firstName: 'Ada',
      lastName: 'Lovelace',
      displayName: 'Countess of Lovelace',
      email: 'integration-test@example.invalid',
    });
    expect(updated.displayName).toBe('Countess of Lovelace');
  });
});

describe.skipIf(!databaseAvailable)('provider config repository', () => {
  it('never returns encryptedApiKey through masked read paths', async () => {
    const created = await providerConfig.createProviderConfig(prisma, {
      provider: 'anthropic',
      label: 'Test Provider',
      model: 'test-model',
      encryptedApiKey: 'v1:fake:fake:fake',
      maskedApiKeyPreview: 'sk-...ab12',
    });
    expect((created as Record<string, unknown>).encryptedApiKey).toBeUndefined();

    const list = await providerConfig.listProviderConfigsMasked(prisma);
    expect(list.every((c) => (c as Record<string, unknown>).encryptedApiKey === undefined)).toBe(true);

    const withSecret = await providerConfig.getProviderConfigWithSecret(prisma, created.id);
    expect(withSecret?.encryptedApiKey).toBe('v1:fake:fake:fake');

    await prisma.lLMProviderConfig.delete({ where: { id: created.id } });
  });
});
