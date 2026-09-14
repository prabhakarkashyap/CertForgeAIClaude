import { AppShell } from '../../components/AppShell.js';
import { ComingSoon } from '../../components/ComingSoon.js';

export default function QuestionBankPage() {
  return (
    <AppShell>
      <ComingSoon
        title="Question Bank"
        phase="Phase 4 (Question Generation & Validation Engine)"
        description="Search and filter generated questions by quality state, source, provider and model, and manage quarantine/approval here."
      />
    </AppShell>
  );
}
