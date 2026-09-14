import type {
  LLMProvider,
  LLMProviderConfigInput,
  LLMProviderTestResult,
  LLMStructuredRequest,
  LLMStructuredResponse,
} from '@certforge/shared';
import { ProviderError } from '@certforge/shared';
import { httpJson } from './http.js';

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';

interface OpenAIChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: { prompt_tokens: number; completion_tokens: number };
  error?: { message?: string };
}

/**
 * OpenAI-compatible adapter. Also reused (via a different baseUrl/label) for
 * OpenRouter and custom OpenAI-compatible endpoints, since all three speak
 * the same Chat Completions wire format.
 */
function buildOpenAICompatibleProvider(kind: 'openai' | 'openrouter' | 'custom', defaultBaseUrl: string): LLMProvider {
  return {
    kind,

    async testConnection(config: LLMProviderConfigInput): Promise<LLMProviderTestResult> {
      const startedAt = Date.now();
      const baseUrl = config.baseUrl ?? defaultBaseUrl;

      const { status, data } = await httpJson<OpenAIChatResponse>({
        url: `${baseUrl}/chat/completions`,
        method: 'POST',
        headers: { authorization: `Bearer ${config.apiKey}` },
        body: {
          model: config.model,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'ping' }],
        },
      });

      const latencyMs = Date.now() - startedAt;
      if (status >= 200 && status < 300) {
        return { ok: true, latencyMs, modelConfirmed: true, message: 'Connection succeeded.' };
      }
      return {
        ok: false,
        latencyMs,
        modelConfirmed: false,
        message: data?.error?.message ?? `Provider returned status ${status}.`,
      };
    },

    async generateStructured<T = unknown>(
      config: LLMProviderConfigInput,
      request: LLMStructuredRequest,
    ): Promise<LLMStructuredResponse<T>> {
      const baseUrl = config.baseUrl ?? defaultBaseUrl;

      const { status, data } = await httpJson<OpenAIChatResponse>({
        url: `${baseUrl}/chat/completions`,
        method: 'POST',
        headers: { authorization: `Bearer ${config.apiKey}` },
        body: {
          model: config.model,
          max_tokens: request.maxOutputTokens ?? 2048,
          temperature: request.temperature,
          response_format: { type: 'json_object' },
          messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
        },
      });

      if (status < 200 || status >= 300) {
        throw new ProviderError({ message: data?.error?.message ?? `Provider returned status ${status}.` });
      }

      const rawText = data?.choices?.[0]?.message?.content ?? '';
      return {
        data: JSON.parse(rawText) as T,
        raw: rawText,
        usage: {
          inputTokens: data?.usage?.prompt_tokens ?? 0,
          outputTokens: data?.usage?.completion_tokens ?? 0,
        },
        model: config.model,
      };
    },
  };
}

export const openaiProvider = buildOpenAICompatibleProvider('openai', DEFAULT_BASE_URL);
export const openrouterProvider = buildOpenAICompatibleProvider('openrouter', 'https://openrouter.ai/api/v1');
export const customProvider = buildOpenAICompatibleProvider('custom', '');
