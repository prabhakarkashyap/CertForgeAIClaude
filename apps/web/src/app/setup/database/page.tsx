'use client';

import Link from 'next/link';
import { useState } from 'react';

interface FormState {
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
}

const DEFAULT_STATE: FormState = {
  host: 'localhost',
  port: '5432',
  database: 'certforge_ai',
  username: 'certforge',
  password: '',
  ssl: false,
};

export default function DatabasePage() {
  const [form, setForm] = useState<FormState>(DEFAULT_STATE);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState<'test' | 'save' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const payload = () => ({
    host: form.host,
    port: Number(form.port),
    database: form.database,
    username: form.username,
    password: form.password,
    ssl: form.ssl,
  });

  const runTest = async () => {
    setBusy('test');
    setError(null);
    setTestResult(null);
    try {
      const response = await fetch('/api/setup/database/test', {
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

  const saveAndContinue = async () => {
    setBusy('save');
    setError(null);
    try {
      const response = await fetch('/api/setup/database/configure', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload()),
      });
      const json = await response.json();
      if (!json.ok) throw new Error(json.error?.message ?? 'Could not save configuration.');
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save configuration.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="card space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Database</h1>
        <p className="mt-2 text-slate-600">
          Enter the PostgreSQL connection details CertForge AI should use. If a database is already configured via
          your <code>.env</code> file, you can skip straight to testing it.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="host">Host</label>
          <input id="host" className="input" value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="port">Port</label>
          <input id="port" className="input" value={form.port} onChange={(e) => setForm({ ...form, port: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="database">Database name</label>
          <input id="database" className="input" value={form.database} onChange={(e) => setForm({ ...form, database: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="username">Username</label>
          <input id="username" className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="new-password"
          />
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            id="ssl"
            type="checkbox"
            checked={form.ssl}
            onChange={(e) => setForm({ ...form, ssl: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300"
          />
          <label htmlFor="ssl" className="text-sm text-slate-700">
            Require SSL
          </label>
        </div>
      </div>

      {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {testResult && (
        <p className={`rounded-md px-3 py-2 text-sm ${testResult.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          {testResult.message}
        </p>
      )}
      {saved && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Configuration saved to .env. Restart the application (npm run dev) for this to take full effect, then
          continue.
        </p>
      )}

      <div className="flex items-center justify-between">
        <button type="button" onClick={() => void runTest()} className="btn-secondary" disabled={busy !== null}>
          {busy === 'test' ? 'Testing…' : 'Test Connection'}
        </button>
        <div className="flex gap-3">
          <Link href="/setup/system-check" className="btn-secondary">
            Back
          </Link>
          <button
            type="button"
            onClick={() => void saveAndContinue()}
            className="btn-secondary"
            disabled={busy !== null || !testResult?.ok}
          >
            {busy === 'save' ? 'Saving…' : 'Save to .env'}
          </button>
          <Link href="/setup/profile" className="btn-primary">
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
