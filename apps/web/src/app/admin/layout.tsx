import Link from 'next/link';
import { AppShell } from '../../components/AppShell.js';

const ADMIN_LINKS = [
  { href: '/admin/certifications', label: 'Certifications' },
  { href: '/admin/providers', label: 'AI Providers' },
  { href: '/admin/models', label: 'Models' },
  { href: '/admin/question-bank', label: 'Question Bank' },
  { href: '/admin/prompts', label: 'Prompt Templates' },
  { href: '/admin/generation-settings', label: 'Generation Settings' },
  { href: '/admin/security', label: 'Security' },
  { href: '/admin/logs', label: 'Logs' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr]">
        <nav className="space-y-1">
          {ADMIN_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div>{children}</div>
      </div>
    </AppShell>
  );
}
