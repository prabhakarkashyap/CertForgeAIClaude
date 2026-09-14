import Link from 'next/link';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/certifications', label: 'Certifications' },
  { href: '/practice', label: 'Practice' },
  { href: '/question-bank', label: 'Question Bank' },
  { href: '/admin', label: 'Administration' },
  { href: '/settings', label: 'Settings' },
];

export function AppShell({ children, displayName }: { children: React.ReactNode; displayName?: string | null }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white sm:block">
        <div className="px-4 py-5">
          <p className="text-lg font-semibold text-brand-800">CertForge AI</p>
        </div>
        <nav className="space-y-1 px-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <p className="text-sm text-slate-500 sm:hidden">CertForge AI</p>
          <div />
          <p className="text-sm text-slate-600">{displayName ? `Signed in as ${displayName}` : ''}</p>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
