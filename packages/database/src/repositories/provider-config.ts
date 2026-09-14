import type { PrismaClient } from '../client.js';
import type { LLMProviderKind } from '@certforge/shared';

export interface CreateProviderConfigInput {
  userId?: string | null;
  provider: LLMProviderKind;
  label: string;
  baseUrl?: string | null;
  model: string;
  encryptedApiKey: string;
  maskedApiKeyPreview: string;
}

/**
 * Fields intentionally exclude encryptedApiKey - every read path in this
 * module returns the masked preview only. Decryption happens exclusively in
 * @certforge/llm-gateway at the moment a provider call is made, never for
 * display.
 */
const MASKED_SELECT = {
  id: true,
  userId: true,
  provider: true,
  label: true,
  baseUrl: true,
  model: true,
  maskedApiKeyPreview: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function createProviderConfig(prisma: PrismaClient, input: CreateProviderConfigInput) {
  return prisma.lLMProviderConfig.create({
    data: {
      userId: input.userId ?? null,
      provider: input.provider,
      label: input.label,
      baseUrl: input.baseUrl ?? null,
      model: input.model,
      encryptedApiKey: input.encryptedApiKey,
      maskedApiKeyPreview: input.maskedApiKeyPreview,
    },
    select: MASKED_SELECT,
  });
}

export async function listProviderConfigsMasked(prisma: PrismaClient) {
  return prisma.lLMProviderConfig.findMany({
    select: MASKED_SELECT,
    orderBy: { createdAt: 'asc' },
  });
}

export async function getActiveProviderConfigMasked(prisma: PrismaClient) {
  return prisma.lLMProviderConfig.findFirst({
    where: { isActive: true },
    select: MASKED_SELECT,
    orderBy: { updatedAt: 'desc' },
  });
}

/** Internal use only (e.g. the LLM gateway resolving credentials to make a call). */
export async function getProviderConfigWithSecret(prisma: PrismaClient, id: string) {
  return prisma.lLMProviderConfig.findUnique({ where: { id } });
}

export async function setProviderConfigActive(prisma: PrismaClient, id: string, isActive: boolean) {
  return prisma.lLMProviderConfig.update({
    where: { id },
    data: { isActive },
    select: MASKED_SELECT,
  });
}

export interface UpdateProviderConfigInput {
  model?: string;
  label?: string;
  baseUrl?: string | null;
}

/** Updates non-secret fields only (model, label, baseUrl). Changing the API key requires a new saveProviderConfig call. */
export async function updateProviderConfig(prisma: PrismaClient, id: string, input: UpdateProviderConfigInput) {
  return prisma.lLMProviderConfig.update({
    where: { id },
    data: input,
    select: MASKED_SELECT,
  });
}
