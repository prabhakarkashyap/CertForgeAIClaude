import type { PrismaClient } from '../client.js';

export const SETUP_COMPLETE_KEY = 'setup.completed';

export async function getSetting(prisma: PrismaClient, key: string): Promise<string | null> {
  const row = await prisma.appSetting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function setSetting(prisma: PrismaClient, key: string, value: string): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function isSetupComplete(prisma: PrismaClient): Promise<boolean> {
  const value = await getSetting(prisma, SETUP_COMPLETE_KEY);
  return value === 'true';
}

export async function markSetupComplete(prisma: PrismaClient): Promise<void> {
  await setSetting(prisma, SETUP_COMPLETE_KEY, 'true');
}
