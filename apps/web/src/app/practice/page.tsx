import { AppShell } from '../../components/AppShell.js';
import { ComingSoon } from '../../components/ComingSoon.js';

export default function PracticePage() {
  return (
    <AppShell>
      <ComingSoon
        title="Practice"
        phase="Phase 5 (Examination Engine and CBT UI)"
        description="Full mock exams, quick tests, domain practice, scenario practice and weak-area drills will be available here."
      />
    </AppShell>
  );
}
