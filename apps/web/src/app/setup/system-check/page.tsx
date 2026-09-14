'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface SystemCheckResult {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

const STATUS_STYLES: Record<SystemCheckResult['status'], string> = {
  pass: 'bg-emerald-100 text-emerald-700',
  warn: 'bg-amber-100 text-amber-700',
  fail: 'bg-rose-100 text-rose-700',
};

export default function SystemCheckPage() {
  const [checks, setChecks] = useState<SystemCheckResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runChecks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/setup/system-check', { method: 'POST' });
      const json = await response.json();
      if (!json.ok) throw new Error(json.error?.message ?? 'System check failed.');
      setChecks(json.data.checks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'System check failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void runChecks();
  }, []);

  const hasFailure = checks?.some((c) => c.status === 'fail') ?? false;

  return (
    <div className="card space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">System Check</h1>
        <p className="mt-2 text-slate-600">We verify your runtime, database reachability, writable storage and network access.</p>
      </div>

      {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <ul className="space-y-3">
        {(checks ?? []).map((check) => (
          <li key={check.id} className="flex items-start justify-between gap-4 rounded-md border border-slate-200 p-3">
            <div>
              <p className="font-medium text-slate-800">{check.label}</p>
              <p className="text-sm text-slate-500">{check.message}</p>
            </div>
            <span className={`badge ${STATUS_STYLES[check.status]}`}>{check.status.toUpperCase()}</span>
          </li>
        ))}
        {checks === null && !loading && <p className="text-sm text-slate-500">No results yet.</p>}
      </ul>

      <div className="flex items-center justify-between">
        <button type="button" onClick={() => void runChecks()} className="btn-secondary" disabled={loading}>
          {loading ? 'Checking…' : 'Re-run checks'}
        </button>
        <div className="flex gap-3">
          <Link href="/setup/welcome" className="btn-secondary">
            Back
          </Link>
          <Link
            href="/setup/database"
            className={`btn-primary ${hasFailure ? 'pointer-events-none opacity-50' : ''}`}
            aria-disabled={hasFailure}
          >
            Next
          </Link>
        </div>
      </div>
      {hasFailure && (
        <p className="text-sm text-rose-600">Resolve the failing check(s) above before continuing.</p>
      )}
    </div>
  );
}
