import { z } from 'zod';
import { LLMGateway, encryptSecret, maskSecret } from '@certforge/llm-gateway';
import { providerConfigRepository, prisma } from '@certforge/database';
import type { LLMProviderKind, LLMProviderTestResult } from '@certforge/shared';
import { getMasterKey } from '../../lib/security.js';

const gateway = new LLMGateway();

export const providerConfigInputSchema = z.object({
  provider: z.enum(['anthropic', 'openai', 'google', 'openrouter', 'custom']),
  label: z.string().min(1).max(100),
  baseUrl: z.string().url().optional(),
  model: z.string().min(1),
  apiKey: z.string().min(1),
});
export type ProviderConfigInput = z.infer<typeof providerConfigInputSchema>;

export async function testProviderConnection(
  provider: LLMProviderKind,
  input: { baseUrl?: string; model: string; apiKey: string },
): Promise<LLMProviderTestResult> {
  return gateway.testConnection(provider, {
    provider,
    label: 'connection-test',
    baseUrl: input.baseUrl,
    model: input.model,
    apiKey: input.apiKey,
  });
}

/** Encrypts the API key and persists a new provider configuration. The plaintext key is never stored or returned. */
export async function saveProviderConfig(input: ProviderConfigInput, userId?: string) {
  const masterKey = await getMasterKey();
  const encryptedApiKey = encryptSecret(input.apiKey, masterKey);
  const maskedApiKeyPreview = maskSecret(input.apiKey);

  return providerConfigRepository.createProviderConfig(prisma, {
    userId: userId ?? null,
    provider: input.provider,
    label: input.label,
    baseUrl: input.baseUrl ?? null,
    model: input.model,
    encryptedApiKey,
    maskedApiKeyPreview,
  });
}

export async function listProviderConfigs() {
  return providerConfigRepository.listProviderConfigsMasked(prisma);
}

export async function setProviderConfigActive(id: string, isActive: boolean) {
  return providerConfigRepository.setProviderConfigActive(prisma, id, isActive);
}

export const updateProviderConfigInputSchema = z.object({
  model: z.string().min(1).optional(),
  label: z.string().min(1).max(100).optional(),
  baseUrl: z.string().url().optional(),
});
export type UpdateProviderConfigInput = z.infer<typeof updateProviderConfigInputSchema>;

export async function updateProviderConfig(id: string, input: UpdateProviderConfigInput) {
  return providerConfigRepository.updateProviderConfig(prisma, id, input);
}
