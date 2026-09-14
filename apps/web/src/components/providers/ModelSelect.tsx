'use client';

import { useEffect, useState } from 'react';
import { CUSTOM_MODEL_VALUE, PROVIDER_MODEL_OPTIONS, type ProviderKind } from '../../lib/provider-models.js';

interface ModelSelectProps {
  provider: ProviderKind;
  value: string;
  onChange: (model: string) => void;
}

/**
 * Dropdown of curated current models per provider, with a "Custom model ID"
 * option that reveals a free-text field - the list is a starting point, not
 * an exhaustive/guaranteed-current catalog (see lib/provider-models.ts).
 */
export function ModelSelect({ provider, value, onChange }: ModelSelectProps) {
  const options = provider === 'custom' ? [] : PROVIDER_MODEL_OPTIONS[provider];
  const isKnownValue = options.some((o) => o.value === value);
  const [mode, setMode] = useState<'preset' | 'custom'>(provider === 'custom' || !isKnownValue ? 'custom' : 'preset');

  useEffect(() => {
    const stillKnown = options.some((o) => o.value === value);
    if (provider === 'custom') {
      setMode('custom');
    } else if (!stillKnown) {
      setMode('custom');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  if (provider === 'custom') {
    return (
      <input
        id="model"
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. llama-3.3-70b-instruct"
      />
    );
  }

  return (
    <div className="space-y-2">
      <select
        id="model"
        className="input"
        value={mode === 'custom' ? CUSTOM_MODEL_VALUE : value}
        onChange={(e) => {
          if (e.target.value === CUSTOM_MODEL_VALUE) {
            setMode('custom');
            onChange('');
          } else {
            setMode('preset');
            onChange(e.target.value);
          }
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        <option value={CUSTOM_MODEL_VALUE}>Custom model ID…</option>
      </select>
      {mode === 'custom' && (
        <input
          className="input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter an exact model ID"
          autoFocus
        />
      )}
      <p className="text-xs text-slate-400">
        This list is a curated starting point and may not include the newest releases - use "Custom model ID" for
        anything not shown.
      </p>
    </div>
  );
}
