'use client';

import { CertificationActivationList } from '../../../components/certifications/CertificationActivationList.js';

export default function AdminCertificationsPage() {
  return (
    <div className="card space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Certifications</h1>
      <p className="text-sm text-slate-600">
        Activate or review installed certification packs. Activating a pack imports its blueprint (domains and
        objectives) into the database and marks it the active version for new exam attempts.
      </p>
      <CertificationActivationList />
    </div>
  );
}
