'use client';

import { useEffect, useState } from 'react';

interface CertSummary {
  packDir: string;
  slug?: string;
  name?: string;
  version?: string;
  status?: string;
  examName?: string;
  totalQuestions?: number;
  durationMinutes?: number;
  domainCount?: number;
  isActiveInDatabase?: boolean;
  error?: string;
}

export function CertificationActivationList({ onChange }: { onChange?: (hasActive: boolean) => void }) {
  const [packs, setPacks] = useState<CertSummary[]>([]);
  const [busyDir, setBusyDir] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const response = await fetch('/api/certifications');
    const json = await response.json();
    if (json.ok) {
      setPacks(json.data.certifications);
      onChange?.(json.data.certifications.some((p: CertSummary) => p.isActiveInDatabase));
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activate = async (packDir: string) => {
    setBusyDir(packDir);
    setError(null);
    try {
      const response = await fetch('/api/certifications/activate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ packDir }),
      });
      const json = await response.json();
      if (!json.ok) throw new Error(json.error?.message ?? 'Could not activate certification pack.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not activate certification pack.');
    } finally {
      setBusyDir(null);
    }
  };

  return (
    <div className="space-y-3">
      {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <ul className="space-y-3">
        {packs.map((pack) => (
          <li key={pack.packDir} className="rounded-md border border-slate-200 p-4">
            {pack.error ? (
              <p className="text-sm text-rose-700">
                Invalid pack at {pack.packDir}: {pack.error}
              </p>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">
                    {pack.name} <span className="text-slate-400">v{pack.version}</span>
                  </p>
                  <p className="text-sm text-slate-500">
                    {pack.examName} - {pack.totalQuestions} questions - {pack.durationMinutes} minutes -{' '}
                    {pack.domainCount} domains
                  </p>
                </div>
                {pack.isActiveInDatabase ? (
                  <span className="badge bg-emerald-100 text-emerald-700">Active</span>
                ) : (
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={busyDir === pack.packDir}
                    onClick={() => void activate(pack.packDir)}
                  >
                    {busyDir === pack.packDir ? 'Activating…' : 'Activate'}
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
        {packs.length === 0 && <p className="text-sm text-slate-500">No certification packs found.</p>}
      </ul>
    </div>
  );
}
