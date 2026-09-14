import type {
  LLMProvider,
  LLMProviderConfigInput,
  LLMProviderKind,
  LLMProviderTestResult,
  LLMStructuredRequest,
  LLMStructuredResponse,
} from '@certforge/shared';
import { ConfigurationError } from '@certforge/shared';
import { anthropicProvider } from './providers/anthropic.js';
import { openaiProvider, openrouterProvider, customProvider } from './providers/openai.js';
import { googleProvider } from './providers/google.js';
import { mockProvider } from './providers/mock.js';

const REGISTRY: Record<LLMProviderKind, LLMProvider> = {
  anthropic: anthropicProvider,
  openai: openaiProvider,
  google: googleProvider,
  openrouter: openrouterProvider,
  custom: customProvider,
};

export interface LLMGatewayOptions {
  /** Overrides the provider registry - used by tests to inject the mock provider. */
  registryOverrides?: Partial<Record<LLMProviderKind, LLMProvider>>;
}

/**
 * Provider-neutral entry point used by the rest of the application.
 * Certification/question/exam logic must depend only on this gateway and
 * the shared LLMProvider* contracts - never on a concrete adapter - so that
 * provider-specific logic stays fully contained in this package.
 */
export class LLMGateway {
  private readonly registry: Record<LLMProviderKind, LLMProvider>;

  constructor(options: LLMGatewayOptions = {}) {
    this.registry = { ...REGISTRY, ...options.registryOverrides };
  }

  private resolve(kind: LLMProviderKind): LLMProvider {
    const provider = this.registry[kind];
    if (!provider) {
      throw new ConfigurationError({ message: `No LLM provider adapter registered for "${kind}".` });
    }
    return provider;
  }

  async testConnection(kind: LLMProviderKind, config: LLMProviderConfigInput): Promise<LLMProviderTestResult> {
    return this.resolve(kind).testConnection(config);
  }

  async generateStructured<T = unknown>(
    kind: LLMProviderKind,
    config: LLMProviderConfigInput,
    request: LLMStructuredRequest,
  ): Promise<LLMStructuredResponse<T>> {
    return this.resolve(kind).generateStructured<T>(config, request);
  }
}

export { mockProvider };
