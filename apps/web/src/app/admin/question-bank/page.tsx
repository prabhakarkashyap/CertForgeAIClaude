export default function AdminQuestionBankPage() {
  return (
    <div className="card">
      <h1 className="text-xl font-semibold text-slate-900">Question Bank</h1>
      <p className="mt-2 text-sm text-slate-600">
        Search, filter, quarantine and approve generated questions here once the generation pipeline is producing
        content.
      </p>
      <p className="mt-4 inline-block rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
        Coming in Phase 4 (Question Generation & Validation Engine)
      </p>
    </div>
  );
}
