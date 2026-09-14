'use client';

import { usePathname } from 'next/navigation';

const STEPS: Array<{ id: string; label: string; href: string }> = [
  { id: 'welcome', label: 'Welcome', href: '/setup/welcome' },
  { id: 'system-check', label: 'System Check', href: '/setup/system-check' },
  { id: 'database', label: 'Database', href: '/setup/database' },
  { id: 'profile', label: 'Profile', href: '/setup/profile' },
  { id: 'provider', label: 'AI Provider', href: '/setup/provider' },
  { id: 'certifications', label: 'Certification Packs', href: '/setup/certifications' },
  { id: 'finish', label: 'Finish', href: '/setup/finish' },
];

export function StepProgress() {
  const pathname = usePathname();
  const currentIndex = STEPS.findIndex((step) => pathname?.startsWith(step.href));

  return (
    <ol className="flex flex-wrap gap-x-2 gap-y-3 text-sm" aria-label="Setup progress">
      {STEPS.map((step, index) => {
        const isCurrent = index === currentIndex;
        const isDone = currentIndex >= 0 && index < currentIndex;
        return (
          <li key={step.id} className="flex items-center gap-2">
            <span
              aria-current={isCurrent ? 'step' : undefined}
              className={
                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ' +
                (isCurrent
                  ? 'bg-brand-700 text-white'
                  : isDone
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-slate-100 text-slate-500')
              }
            >
              {index + 1}
            </span>
            <span className={isCurrent ? 'font-semibold text-slate-900' : 'text-slate-500'}>{step.label}</span>
            {index < STEPS.length - 1 && <span className="mx-1 text-slate-300">/</span>}
          </li>
        );
      })}
    </ol>
  );
}

export { STEPS };
