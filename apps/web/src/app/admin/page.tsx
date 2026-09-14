import Link from 'next/link';

export default function AdminIndexPage() {
  return (
    <div className="card">
      <h1 className="text-2xl font-semibold text-slate-900">Administration</h1>
      <p className="mt-2 text-slate-600">
        Choose an area from the left to manage certifications, AI providers, prompts and security.
      </p>
      <Link href="/admin/certifications" className="btn-primary mt-4 inline-flex">
        Manage Certifications
      </Link>
    </div>
  );
}
