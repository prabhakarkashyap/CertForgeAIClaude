import type { PrismaClient } from '../client.js';
import type { UserProfileInput } from '@certforge/shared';

/**
 * V1 is single-profile-per-install. getPrimaryProfile returns the first
 * (and expected only) user row, keeping the door open for multi-profile
 * support later without an immediate schema change.
 */
export async function getPrimaryProfile(prisma: PrismaClient) {
  return prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
}

export async function createProfile(prisma: PrismaClient, input: UserProfileInput) {
  return prisma.user.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      displayName: input.displayName,
      email: input.email ?? null,
    },
  });
}

export async function updateProfile(prisma: PrismaClient, userId: string, input: UserProfileInput) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      displayName: input.displayName,
      email: input.email ?? null,
    },
  });
}
