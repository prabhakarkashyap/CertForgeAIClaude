export function ComingSoon({ title, phase, description }: { title: string; phase: string; description: string }) {
  return (
    <div className="card">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-slate-600">{description}</p>
      <p className="mt-4 inline-block rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
        Coming in {phase}
      </p>
    </div>
  );
}
