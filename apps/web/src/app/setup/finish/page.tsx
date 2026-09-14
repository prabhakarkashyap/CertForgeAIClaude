'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function FinishPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finish = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/setup/complete', { method: 'POST' });
      const json = await response.json();
      if (!json.ok) throw new Error(json.error?.message ?? 'Could not complete setup.');
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete setup.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card space-y-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">You're all set</h1>
      <p className="text-slate-600">
        Your profile, AI provider and certification pack are configured. You're ready to enter the CertForge AI
        dashboard.
      </p>
      {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <div className="flex justify-center gap-3">
        <Link href="/setup/certifications" className="btn-secondary">
          Back
        </Link>
        <button type="button" onClick={() => void finish()} className="btn-primary" disabled={busy}>
          {busy ? 'Finishing…' : 'Enter Dashboard'}
        </button>
      </div>
    </div>
  );
}
