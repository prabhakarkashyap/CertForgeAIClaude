export type ProviderKind = 'anthropic' | 'openai' | 'google' | 'openrouter' | 'custom';

export interface ModelOption {
  value: string;
  label: string;
}

/**
 * Curated starting points shown in the model dropdown, not an exhaustive or
 * guaranteed-current catalog - providers ship new models faster than this
 * list can be reviewed. Every provider (except "custom", which is always
 * free text) includes a "Custom model ID" escape hatch in the UI so an
 * entry here going stale never blocks configuring a real, current model.
 * Update this list opportunistically; do not treat it as authoritative.
 */
export const PROVIDER_MODEL_OPTIONS: Record<Exclude<ProviderKind, 'custom'>, ModelOption[]> = {
  anthropic: [
    { value: 'claude-opus-5', label: 'Claude Opus 5' },
    { value: 'claude-sonnet-5', label: 'Claude Sonnet 5' },
    { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (legacy)' },
  ],
  openai: [
    { value: 'gpt-5', label: 'GPT-5' },
    { value: 'gpt-5-mini', label: 'GPT-5 mini' },
    { value: 'gpt-4.1', label: 'GPT-4.1' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'o3', label: 'o3' },
  ],
  google: [
    { value: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro (preview)' },
    { value: 'gemini-3.1-flash-preview', label: 'Gemini 3.1 Flash (preview)' },
  ],
  openrouter: [
    { value: 'anthropic/claude-sonnet-5', label: 'Anthropic: Claude Sonnet 5' },
    { value: 'openai/gpt-5', label: 'OpenAI: GPT-5' },
    { value: 'google/gemini-3.1-pro-preview', label: 'Google: Gemini 3.1 Pro (preview)' },
    { value: 'meta-llama/llama-3.3-70b-instruct', label: 'Meta: Llama 3.3 70B Instruct' },
  ],
};

export const CUSTOM_MODEL_VALUE = '__custom__';
