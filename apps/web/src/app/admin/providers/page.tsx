'use client';

import { useEffect, useState } from 'react';

type ProviderKind = 'anthropic' | 'openai' | 'google' | 'openrouter' | 'custom';

const PROVIDER_OPTIONS: Array<{ value: ProviderKind; label: string; defaultModel: string; needsBaseUrl?: boolean }> = [
  { value: 'anthropic', label: 'Anthropic', defaultModel: 'claude-sonnet-4-5' },
  { value: 'openai', label: 'OpenAI', defaultModel: 'gpt-4o-mini' },
  { value: 'google', label: 'Google Gemini', defaultModel: 'gemini-1.5-pro' },
  { value: 'openrouter', label: 'OpenRouter', defaultModel: 'anthropic/claude-3.5-sonnet' },
  { value: 'custom', label: 'Custom (OpenAI-compatible)', defaultModel: '', needsBaseUrl: true },
];

interface MaskedProviderConfig {
  id: string;
  provider: ProviderKind;
  label: string;
  model: string;
  maskedApiKeyPreview: string;
  isActive: boolean;
}

export default function AdminProvidersPage() {
  const [configs, setConfigs] = useState<MaskedProviderConfig[]>([]);
  const [provider, setProvider] = useState<ProviderKind>('anthropic');
  const [label, setLabel] = useState('');
  const [model, setModel] = useState(PROVIDER_OPTIONS[0]!.defaultModel);
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState<'test' | 'save' | string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const response = await fetch('/api/providers');
    const json = await response.json();
    if (json.ok) setConfigs(json.data);
  };

  useEffect(() => {
    void load();
  }, []);

  const selected = PROVIDER_OPTIONS.find((p) => p.value === provider)!;
  const payload = () => ({ provider, label: label || `${selected.label} config`, model, apiKey, baseUrl: baseUrl || undefined });

  const runTest = async () => {
    setBusy('test');
    setError(null);
    try {
      const response = await fetch('/api/providers/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload()),
      });
      const json = await response.json();
      if (!json.ok) throw new Error(json.error?.message ?? 'Test failed.');
      setTestResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed.');
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    setBusy('save');
    setError(null);
    try {
      const response = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload()),
      });
      const json = await response.json();
      if (!json.ok) throw new Error(json.error?.message ?? 'Could not save provider.');
      setApiKey('');
      setLabel('');
      setTestResult(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save provider.');
    } finally {
      setBusy(null);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    setBusy(id);
    try {
      await fetch(`/api/providers/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      await load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <h1 className="text-xl font-semibold text-slate-900">AI Providers</h1>
        <p className="text-sm text-slate-600">
          Add a provider configuration. API keys are encrypted at rest and never shown again in full after saving.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="provider">Provider</label>
            <select
              id="provider"
              className="input"
              value={provider}
              onChange={(e) => {
                const next = e.target.value as ProviderKind;
                setProvider(next);
                setModel(PROVIDER_OPTIONS.find((p) => p.value === next)!.defaultModel);
              }}
            >
              {PROVIDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="label">Label</label>
            <input id="label" className="input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={`${selected.label} config`} />
          </div>
          <div>
            <label className="label" htmlFor="model">Model</label>
            <input id="model" className="input" value={model} onChange={(e) => setModel(e.target.value)} />
          </div>
          {selected.needsBaseUrl && (
            <div>
              <label className="label" htmlFor="baseUrl">Base URL</label>
              <input id="baseUrl" className="input" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="label" htmlFor="apiKey">API key</label>
            <input id="apiKey" type="password" className="input" value={apiKey} onChange={(e) => setApiKey(e.target.value)} autoComplete="off" />
          </div>
        </div>

        {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        {testResult && (
          <p className={`rounded-md px-3 py-2 text-sm ${testResult.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {testResult.message}
          </p>
        )}

        <div className="flex gap-3">
          <button type="button" className="btn-secondary" disabled={busy !== null || !apiKey} onClick={() => void runTest()}>
            {busy === 'test' ? 'Testing…' : 'Test Connection'}
          </button>
          <button type="button" className="btn-primary" disabled={busy !== null || !apiKey} onClick={() => void save()}>
            {busy === 'save' ? 'Saving…' : 'Save Provider'}
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900">Configured providers</h2>
        <ul className="mt-3 space-y-2">
          {configs.map((config) => (
            <li key={config.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3 text-sm">
              <span>
                <span className="font-medium">{config.label}</span> - {config.provider} / {config.model} ({config.maskedApiKeyPreview})
              </span>
              <button
                type="button"
                className={`badge ${config.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                disabled={busy === config.id}
                onClick={() => void toggleActive(config.id, !config.isActive)}
              >
                {config.isActive ? 'Active' : 'Inactive'}
              </button>
            </li>
          ))}
          {configs.length === 0 && <p className="text-sm text-slate-500">No providers configured yet.</p>}
        </ul>
      </div>
    </div>
  );
}
