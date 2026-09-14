import { StepProgress } from '../../components/setup/StepProgress.js';
import { DisclaimerFooter } from '../../components/DisclaimerFooter.js';

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">CertForge AI Setup</p>
          <div className="mt-3">
            <StepProgress />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
      <DisclaimerFooter />
    </div>
  );
}
