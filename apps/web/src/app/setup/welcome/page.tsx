import Link from 'next/link';

export default function WelcomePage() {
  return (
    <div className="card space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Welcome to CertForge AI</h1>
        <p className="mt-2 text-slate-600">
          CertForge AI is a local-first, AI-powered certification practice platform. This guided setup will verify
          your environment, connect a PostgreSQL database, create your local profile, configure an AI provider, and
          activate a certification pack.
        </p>
      </div>
      <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
        <li>Your data stays on this machine in your own PostgreSQL database.</li>
        <li>You bring your own LLM API key; it is encrypted at rest and never shown again in full.</li>
        <li>Generated practice questions are independently produced and validated - never official exam content.</li>
      </ul>
      <div className="flex justify-end">
        <Link href="/setup/system-check" className="btn-primary">
          Get Started
        </Link>
      </div>
    </div>
  );
}
