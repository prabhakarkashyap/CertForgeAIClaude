import { PrismaClient } from '../generated/client/index.js';

/**
 * Singleton Prisma client. Cached on `globalThis` in non-production so that
 * Next.js dev-mode module reloads do not exhaust PostgreSQL connections.
 */
declare global {
  // eslint-disable-next-line no-var
  var __certforgePrisma: PrismaClient | undefined;
}

export function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const prisma: PrismaClient = globalThis.__certforgePrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__certforgePrisma = prisma;
}

export type { PrismaClient };
export * from '../generated/client/index.js';
