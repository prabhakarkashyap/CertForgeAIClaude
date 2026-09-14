import { prisma } from '@certforge/database';
import { getMasterKeyOrigin } from '../../../lib/security.js';

const ORIGIN_LABELS: Record<string, string> = {
  environment: 'APP_ENCRYPTION_KEY environment variable',
  'existing-file': 'Existing key file in the application data directory',
  'generated-file': 'Newly generated key file in the application data directory',
};

export default async function AdminSecurityPage() {
  const [origin, providerCount] = await Promise.all([
    getMasterKeyOrigin(),
    prisma.lLMProviderConfig.count(),
  ]);

  return (
    <div className="space-y-6">
      <div className="card space-y-3">
        <h1 className="text-xl font-semibold text-slate-900">Security</h1>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Credential encryption</dt>
            <dd className="font-medium text-slate-800">AES-256-GCM, per-secret random nonce</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Master key source</dt>
            <dd className="font-medium text-slate-800">{ORIGIN_LABELS[origin] ?? origin}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Provider configurations stored</dt>
            <dd className="font-medium text-slate-800">{providerCount}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Credential display policy</dt>
            <dd className="font-medium text-slate-800">Masked preview only after save (e.g. sk-...ab12)</dd>
          </div>
        </dl>
      </div>

      <div className="card space-y-2 text-sm text-slate-600">
        <h2 className="text-lg font-semibold text-slate-900">Policy</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>API keys are never written to the database, logs, or client responses in plaintext.</li>
          <li>The application binds to localhost by default; do not expose it to a LAN/the internet without deliberately securing remote access.</li>
          <li>Secrets are never committed to source control - see .gitignore and .env.example.</li>
          <li>All server input is validated with Zod before reaching a service or the database.</li>
        </ul>
      </div>
    </div>
  );
}
