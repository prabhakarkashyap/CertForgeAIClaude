import type {
  LLMProvider,
  LLMProviderConfigInput,
  LLMProviderTestResult,
  LLMStructuredRequest,
  LLMStructuredResponse,
} from '@certforge/shared';
import { ProviderError } from '@certforge/shared';
import { httpJson } from './http.js';

const DEFAULT_BASE_URL = 'https://api.anthropic.com';
const ANTHROPIC_VERSION = '2023-06-01';

interface AnthropicMessageResponse {
  content?: Array<{ type: string; text?: string }>;
  usage?: { input_tokens: number; output_tokens: number };
  error?: { message?: string };
}

export const anthropicProvider: LLMProvider = {
  kind: 'anthropic',

  async testConnection(config: LLMProviderConfigInput): Promise<LLMProviderTestResult> {
    const startedAt = Date.now();
    const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;

    const { status, data } = await httpJson<AnthropicMessageResponse>({
      url: `${baseUrl}/v1/messages`,
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
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
      message: data?.error?.message ?? `Anthropic API returned status ${status}.`,
    };
  },

  async generateStructured<T = unknown>(
    config: LLMProviderConfigInput,
    request: LLMStructuredRequest,
  ): Promise<LLMStructuredResponse<T>> {
    const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    const systemMessages = request.messages.filter((m) => m.role === 'system').map((m) => m.content);
    const conversationMessages = request.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role, content: m.content }));

    const { status, data } = await httpJson<AnthropicMessageResponse>({
      url: `${baseUrl}/v1/messages`,
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: {
        model: config.model,
        max_tokens: request.maxOutputTokens ?? 2048,
        temperature: request.temperature,
        system: systemMessages.join('\n\n') || undefined,
        messages: conversationMessages,
      },
    });

    if (status < 200 || status >= 300) {
      throw new ProviderError({
        message: data?.error?.message ?? `Anthropic API returned status ${status}.`,
      });
    }

    const rawText = data?.content?.find((block) => block.type === 'text')?.text ?? '';
    return {
      data: JSON.parse(rawText) as T,
      raw: rawText,
      usage: {
        inputTokens: data?.usage?.input_tokens ?? 0,
        outputTokens: data?.usage?.output_tokens ?? 0,
      },
      model: config.model,
    };
  },
};
