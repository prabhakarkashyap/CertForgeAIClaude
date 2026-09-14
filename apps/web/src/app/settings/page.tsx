import Link from 'next/link';
import { AppShell } from '../../components/AppShell.js';
import { getProfile } from '../../server/services/profile-service.js';

export default async function SettingsPage() {
  const profile = await getProfile();

  return (
    <AppShell displayName={profile?.displayName}>
      <div className="card space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        {profile ? (
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-500">Display name</dt>
              <dd className="font-medium text-slate-800">{profile.displayName}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Name</dt>
              <dd className="font-medium text-slate-800">{profile.firstName} {profile.lastName}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Email</dt>
              <dd className="font-medium text-slate-800">{profile.email ?? '—'}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-slate-500">No profile found.</p>
        )}
        <p className="text-sm text-slate-600">
          Provider, certification and security configuration live under{' '}
          <Link href="/admin" className="text-brand-700 underline">
            Administration
          </Link>
          .
        </p>
      </div>
    </AppShell>
  );
}
