'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CertificationActivationList } from '../../../components/certifications/CertificationActivationList.js';

export default function CertificationsSetupPage() {
  const [hasActive, setHasActive] = useState(false);

  return (
    <div className="card space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Certification Packs</h1>
        <p className="mt-2 text-slate-600">
          Activate at least one bundled certification pack. Domain names, weights and question counts below are
          read directly from the pack - not hard-coded in the application.
        </p>
      </div>

      <CertificationActivationList onChange={setHasActive} />

      <div className="flex justify-between">
        <Link href="/setup/provider" className="btn-secondary">
          Back
        </Link>
        <Link
          href="/setup/finish"
          className={`btn-primary ${!hasActive ? 'pointer-events-none opacity-50' : ''}`}
          aria-disabled={!hasActive}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
