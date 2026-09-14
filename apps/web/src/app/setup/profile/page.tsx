'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface FormState {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
}

const EMPTY_STATE: FormState = { firstName: '', lastName: '', displayName: '', email: '' };

export default function ProfilePage() {
  const [form, setForm] = useState<FormState>(EMPTY_STATE);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const response = await fetch('/api/setup/profile');
      const json = await response.json();
      if (json.ok && json.data) {
        setForm({
          firstName: json.data.firstName ?? '',
          lastName: json.data.lastName ?? '',
          displayName: json.data.displayName ?? '',
          email: json.data.email ?? '',
        });
        setSaved(true);
      }
    })();
  }, []);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/setup/profile', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await response.json();
      if (!json.ok) throw new Error(json.error?.message ?? 'Could not save profile.');
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile.');
    } finally {
      setBusy(false);
    }
  };

  const canContinue = form.firstName.trim().length > 0 && form.lastName.trim().length > 0 && form.displayName.trim().length > 0;

  return (
    <div className="card space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Your profile</h1>
        <p className="mt-2 text-slate-600">
          This local profile is used to personalize the dashboard and appears on exported reports. Email is
          optional and never leaves this machine except in requests you explicitly configure.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="firstName">First name</label>
          <input id="firstName" className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="lastName">Last name</label>
          <input id="lastName" className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="displayName">Display name</label>
          <input id="displayName" className="input" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="email">Email (optional)</label>
          <input id="email" type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
      </div>

      {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <div className="flex items-center justify-between">
        <button type="button" onClick={() => void save()} className="btn-secondary" disabled={busy || !canContinue}>
          {busy ? 'Saving…' : saved ? 'Save changes' : 'Save profile'}
        </button>
        <div className="flex gap-3">
          <Link href="/setup/database" className="btn-secondary">
            Back
          </Link>
          <Link href="/setup/provider" className={`btn-primary ${!saved ? 'pointer-events-none opacity-50' : ''}`} aria-disabled={!saved}>
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
