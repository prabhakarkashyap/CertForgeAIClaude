/**
 * Provider-neutral LLM gateway contracts. Concrete adapters (Anthropic,
 * OpenAI, Gemini, OpenRouter, custom OpenAI-compatible) live in
 * @certforge/llm-gateway and implement LLMProvider. No provider-specific
 * logic may leak outside that package (see docs/architecture/llm-provider-design.md).
 */

export type LLMProviderKind = 'anthropic' | 'openai' | 'google' | 'openrouter' | 'custom';

/** Configuration persisted for a provider; apiKey is only ever handled in encrypted form. */
export interface LLMProviderConfig {
  id: string;
  userId: string | null;
  provider: LLMProviderKind;
  label: string;
  /** Required for 'custom' (OpenAI-compatible) endpoints; optional override otherwise. */
  baseUrl: string | null;
  model: string;
  /** Opaque, encrypted-at-rest credential payload. Never serialized in plaintext. */
  encryptedApiKey: string;
  /** Last 4 characters only, safe to display in UI ("sk-...ab12"). */
  maskedApiKeyPreview: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Input used only transiently to create/update a provider config; never persisted as-is. */
export interface LLMProviderConfigInput {
  provider: LLMProviderKind;
  label: string;
  baseUrl?: string;
  model: string;
  apiKey: string;
}

export interface LLMProviderTestResult {
  ok: boolean;
  latencyMs: number | null;
  modelConfirmed: boolean;
  message: string;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMStructuredRequest<TSchemaShape = unknown> {
  messages: LLMMessage[];
  /** JSON-schema-like shape description used to request structured output. */
  responseSchema: TSchemaShape;
  maxOutputTokens?: number;
  temperature?: number;
}

export interface LLMUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface LLMStructuredResponse<T = unknown> {
  data: T;
  raw: string;
  usage: LLMUsage;
  model: string;
}

/** Common contract every provider adapter must implement. */
export interface LLMProvider {
  readonly kind: LLMProviderKind;
  testConnection(config: LLMProviderConfigInput): Promise<LLMProviderTestResult>;
  generateStructured<T = unknown>(
    config: LLMProviderConfigInput,
    request: LLMStructuredRequest,
  ): Promise<LLMStructuredResponse<T>>;
}

export type GenerationJobKind = 'exam_assembly' | 'manual_generation' | 'repair';

export type GenerationJobStatus =
  | 'queued'
  | 'planning'
  | 'generating'
  | 'validating'
  | 'repairing'
  | 'assembling'
  | 'completed'
  | 'failed';

export interface GenerationJob {
  id: string;
  certificationVersionId: string;
  kind: GenerationJobKind;
  status: GenerationJobStatus;
  requestedCount: number;
  approvedCount: number;
  quarantinedCount: number;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}
