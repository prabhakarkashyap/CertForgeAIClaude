import type {
  LLMProvider,
  LLMProviderConfigInput,
  LLMProviderTestResult,
  LLMStructuredRequest,
  LLMStructuredResponse,
} from '@certforge/shared';
import { ProviderError } from '@certforge/shared';
import { httpJson } from './http.js';

const DEFAULT_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

interface GeminiGenerateResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  usageMetadata?: { promptTokenCount: number; candidatesTokenCount: number };
  error?: { message?: string };
}

export const googleProvider: LLMProvider = {
  kind: 'google',

  async testConnection(config: LLMProviderConfigInput): Promise<LLMProviderTestResult> {
    const startedAt = Date.now();
    const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;

    const { status, data } = await httpJson<GeminiGenerateResponse>({
      url: `${baseUrl}/models/${config.model}:generateContent?key=${encodeURIComponent(config.apiKey)}`,
      method: 'POST',
      body: {
        contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
        generationConfig: { maxOutputTokens: 1 },
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
      message: data?.error?.message ?? `Gemini API returned status ${status}.`,
    };
  },

  async generateStructured<T = unknown>(
    config: LLMProviderConfigInput,
    request: LLMStructuredRequest,
  ): Promise<LLMStructuredResponse<T>> {
    const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    const systemMessages = request.messages.filter((m) => m.role === 'system').map((m) => m.content);
    const contents = request.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));

    const { status, data } = await httpJson<GeminiGenerateResponse>({
      url: `${baseUrl}/models/${config.model}:generateContent?key=${encodeURIComponent(config.apiKey)}`,
      method: 'POST',
      body: {
        systemInstruction: systemMessages.length > 0 ? { parts: [{ text: systemMessages.join('\n\n') }] } : undefined,
        contents,
        generationConfig: {
          maxOutputTokens: request.maxOutputTokens ?? 2048,
          temperature: request.temperature,
          responseMimeType: 'application/json',
        },
      },
    });

    if (status < 200 || status >= 300) {
      throw new ProviderError({ message: data?.error?.message ?? `Gemini API returned status ${status}.` });
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return {
      data: JSON.parse(rawText) as T,
      raw: rawText,
      usage: {
        inputTokens: data?.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: data?.usageMetadata?.candidatesTokenCount ?? 0,
      },
      model: config.model,
    };
  },
};
