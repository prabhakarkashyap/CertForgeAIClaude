import { AppShell } from '../../components/AppShell.js';
import { prisma } from '@certforge/database';

export default async function CertificationsCatalogPage() {
  const versions = await prisma.certificationVersion.findMany({
    include: { certification: true, domains: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Certification Catalog</h1>
          <p className="text-slate-600">Blueprint details are read directly from each certification's versioned pack.</p>
        </div>

        {versions.length === 0 && (
          <p className="card text-sm text-slate-500">
            No certifications are installed yet. Activate one from Administration &rarr; Certifications.
          </p>
        )}

        {versions.map((version) => (
          <section key={version.id} className="card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {version.certification.name} <span className="text-sm font-normal text-slate-400">v{version.version}</span>
                </h2>
                <p className="text-sm text-slate-500">
                  {version.totalQuestions} questions - {version.durationMinutes} minutes
                  {version.passingScore ? ` - passing score ${version.passingScore}` : ''}
                </p>
              </div>
              <span
                className={`badge ${
                  version.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {version.status}
              </span>
            </div>
            <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {version.domains.map((domain) => (
                <li key={domain.id} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
                  <span className="text-slate-700">{domain.name}</span>
                  <span className="font-medium text-slate-500">{domain.weightPercent}%</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-400">{version.sourceDisclaimer}</p>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
