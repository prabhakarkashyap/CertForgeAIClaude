export default function AdminGenerationSettingsPage() {
  return (
    <div className="card">
      <h1 className="text-xl font-semibold text-slate-900">Generation Settings</h1>
      <p className="mt-2 text-sm text-slate-600">
        Configure fresh-generation ratio, batch sizes, near-duplicate thresholds and repair attempt limits once the
        question generation pipeline is implemented.
      </p>
      <p className="mt-4 inline-block rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
        Coming in Phase 4 (Question Generation & Validation Engine)
      </p>
    </div>
  );
}
