import { getActiveCertificationPrompts } from '../../../server/services/certification-service.js';

const ROLE_LABELS: Record<string, string> = {
  generator: 'Generator',
  reviewer: 'Independent Reviewer',
  repair: 'Repair',
  tutor: 'AI Tutor',
};

export default async function AdminPromptsPage() {
  const data = await getActiveCertificationPrompts();

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-xl font-semibold text-slate-900">Prompt Templates</h1>
        <p className="mt-2 text-sm text-slate-600">
          These are the generator/reviewer/repair/tutor prompt templates bundled with the active certification
          pack. They are drafts pending Phase 4 (Question Generation & Validation Engine), which will wire them
          into a live pipeline. Editing them here is not yet supported - edit the files under{' '}
          <code>certifications/&lt;pack&gt;/prompts/</code> directly.
        </p>
      </div>

      {!data && (
        <p className="card text-sm text-slate-500">No certification is active yet - activate one under Certifications.</p>
      )}

      {data?.prompts.map((prompt) => (
        <section key={prompt.role} className="card">
          <h2 className="text-lg font-semibold text-slate-900">{ROLE_LABELS[prompt.role] ?? prompt.role}</h2>
          <p className="text-xs text-slate-400">{prompt.filePath}</p>
          <pre className="mt-3 max-h-96 overflow-auto rounded-md bg-slate-50 p-4 text-xs text-slate-700 whitespace-pre-wrap">
            {prompt.content}
          </pre>
        </section>
      ))}
    </div>
  );
}
