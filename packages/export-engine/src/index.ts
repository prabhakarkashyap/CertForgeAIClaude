/**
 * Service boundary contract for PDF/JSON exports. Implemented starting
 * Phase 7. PDF rendering is expected to use server-rendered HTML via
 * Playwright/Chromium per the PRD's proposed technical architecture.
 */
export interface ExportService {
  renderAttemptPdf(attemptId: string): Promise<Buffer>;
  renderAttemptAuditJson(attemptId: string): Promise<Record<string, unknown>>;
}
