export default function AdminModelsPage() {
  return (
    <div className="card">
      <h1 className="text-xl font-semibold text-slate-900">Models</h1>
      <p className="mt-2 text-sm text-slate-600">
        Model selection currently happens per AI provider configuration (see Administration &rarr; AI Providers). A
        dedicated model catalog with live capability/pricing discovery is planned for Phase 3 (LLM Gateway) once
        additional provider adapters are exercised end-to-end.
      </p>
      <p className="mt-4 inline-block rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
        Coming in Phase 3 (LLM Gateway)
      </p>
    </div>
  );
}
