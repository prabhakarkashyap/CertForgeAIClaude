import { z } from 'zod';
import { userProfileRepository, prisma } from '@certforge/database';

export const profileInputSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  displayName: z.string().min(1).max(120),
  email: z.string().email().optional().or(z.literal('')),
});
export type ProfileInput = z.infer<typeof profileInputSchema>;

export async function getProfile() {
  return userProfileRepository.getPrimaryProfile(prisma);
}

export async function saveProfile(input: ProfileInput) {
  const existing = await userProfileRepository.getPrimaryProfile(prisma);
  const normalized = { ...input, email: input.email ? input.email : null };
  if (existing) {
    return userProfileRepository.updateProfile(prisma, existing.id, normalized);
  }
  return userProfileRepository.createProfile(prisma, normalized);
}
