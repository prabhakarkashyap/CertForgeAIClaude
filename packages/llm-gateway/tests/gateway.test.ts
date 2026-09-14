import { describe, expect, it } from 'vitest';
import { LLMGateway } from '../src/gateway.js';
import { mockProvider } from '../src/providers/mock.js';

describe('LLMGateway', () => {
  it('dispatches testConnection to the registered provider without any real network call', async () => {
    const gateway = new LLMGateway({ registryOverrides: { anthropic: mockProvider } });

    const result = await gateway.testConnection('anthropic', {
      provider: 'anthropic',
      label: 'Test',
      model: 'test-model',
      apiKey: 'fake-key',
    });

    expect(result.ok).toBe(true);
  });

  it('reports failure when the config is missing an API key', async () => {
    const gateway = new LLMGateway({ registryOverrides: { anthropic: mockProvider } });

    const result = await gateway.testConnection('anthropic', {
      provider: 'anthropic',
      label: 'Test',
      model: 'test-model',
      apiKey: '',
    });

    expect(result.ok).toBe(false);
  });

  it('throws a configuration error for an unregistered provider kind', async () => {
    const gateway = new LLMGateway({ registryOverrides: {} });
    // @ts-expect-error - intentionally invalid kind to exercise the error path
    await expect(gateway.testConnection('unknown', {})).rejects.toThrow();
  });
});
