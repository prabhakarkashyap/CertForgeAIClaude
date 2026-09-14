import Link from 'next/link';
import { AppShell } from '../../components/AppShell.js';
import { getDashboardData } from '../../server/services/dashboard-service.js';

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <AppShell displayName={data.profile?.displayName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome{data.profile ? `, ${data.profile.displayName}` : ''}
          </h1>
          <p className="text-slate-600">Here's where your certification practice stands today.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="card lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">Active certification</h2>
            {data.activeCertification ? (
              <div className="mt-3 space-y-3">
                <p className="font-medium text-slate-800">
                  {data.activeCertification.name}{' '}
                  <span className="text-sm font-normal text-slate-400">v{data.activeCertification.version}</span>
                </p>
                <p className="text-sm text-slate-500">
                  {data.activeCertification.totalQuestions} questions - {data.activeCertification.durationMinutes} minutes
                </p>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {data.activeCertification.domains.map((domain) => (
                    <li key={domain.key} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
                      <span className="text-slate-700">{domain.name}</span>
                      <span className="font-medium text-slate-500">{domain.weightPercent}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                No certification is active yet. Visit{' '}
                <Link href="/certifications" className="text-brand-700 underline">
                  Certifications
                </Link>{' '}
                to activate one.
              </p>
            )}
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold text-slate-900">Readiness</h2>
            <p className="mt-3 text-sm text-slate-500">
              Readiness estimates are calculated from your practice history. Coming in Phase 6 (Scoring, Results and
              Analytics) - this section will populate once you have completed attempts.
            </p>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="card">
            <h2 className="text-lg font-semibold text-slate-900">Recent attempts</h2>
            {data.recentAttemptCount > 0 ? (
              <p className="mt-3 text-sm text-slate-600">{data.recentAttemptCount} attempt(s) recorded.</p>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                No exam attempts yet. The exam runner ships in Phase 5 (Examination Engine and CBT UI).
              </p>
            )}
          </section>
          <section className="card">
            <h2 className="text-lg font-semibold text-slate-900">Domain performance</h2>
            <p className="mt-3 text-sm text-slate-500">
              Domain-by-domain breakdowns will appear here once attempts have been scored. Coming in Phase 6.
            </p>
          </section>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-primary opacity-50" disabled title="Coming in Phase 5">
            Take Mock Exam
          </button>
          <button type="button" className="btn-secondary opacity-50" disabled title="Coming in Phase 5">
            Practice
          </button>
          <Link href="/question-bank" className="btn-secondary">
            Question Bank
          </Link>
          <Link href="/admin" className="btn-secondary">
            Administration
          </Link>
          <Link href="/settings" className="btn-secondary">
            Settings
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
