import type {
  LLMProvider,
  LLMProviderConfigInput,
  LLMProviderTestResult,
  LLMStructuredRequest,
  LLMStructuredResponse,
} from '@certforge/shared';

/**
 * Deterministic, network-free provider used by automated tests and by local
 * development when no real provider is configured. Never makes an external
 * call. See NFR/testing requirement: "Do not make external AI calls in unit
 * tests; use deterministic fixtures/mocks."
 */
export const mockProvider: LLMProvider = {
  kind: 'custom',

  async testConnection(config: LLMProviderConfigInput): Promise<LLMProviderTestResult> {
    if (!config.apiKey) {
      return { ok: false, latencyMs: 0, modelConfirmed: false, message: 'Missing API key.' };
    }
    return { ok: true, latencyMs: 1, modelConfirmed: true, message: 'Mock provider connection succeeded.' };
  },

  async generateStructured<T = unknown>(
    _config: LLMProviderConfigInput,
    _request: LLMStructuredRequest,
  ): Promise<LLMStructuredResponse<T>> {
    return {
      data: {} as T,
      raw: '{}',
      usage: { inputTokens: 0, outputTokens: 0 },
      model: 'mock-model',
    };
  },
};
