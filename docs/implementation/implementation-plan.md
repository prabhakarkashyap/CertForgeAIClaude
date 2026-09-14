# Implementation Plan

This plan tracks the ten-phase delivery plan from the PRD (section 21) and
the session build brief. Live status per deliverable is in
[phase-status.md](./phase-status.md) - this document is the durable plan;
that one is the tracker.

---

## Phase 0 - Repository Contract & Foundation

**Goals:** establish a coherent monorepo, governance docs, and the
certification-pack loading mechanism as a testable, standalone package.

**Dependencies:** none.

**Major deliverables:** workspace structure (`apps/*`, `packages/*`);
TypeScript strict mode base config; ESLint/Prettier; Vitest/Playwright
scaffolding; `AGENTS.md`/`CODEX.md`; `docs/architecture/*`; core shared
types (`packages/shared`); `packages/certification-engine` pack loader +
Zod schemas + cross-validation; bundled `claude-architect-foundations`
pack (v1.0.0).

**Database changes:** none (no database package exists conceptually until
Phase 1, though this repo builds it alongside for practicality).

**APIs:** none.

**UI changes:** none.

**Tests:** `packages/certification-engine/tests/pack-loader.test.ts`
(fixture-based: valid pack, weight-total validation, missing-file
rejection, malformed-pack rejection, discovery); `cca-f-pack.test.ts`
(the real bundled pack against the PRD's verified baseline).

**Acceptance criteria:** a malformed pack is rejected with an aggregated,
actionable error; the bundled CCA-F pack loads and its domain
weights/target counts exactly match the PRD table (27/18/20/20/15,
16/11/12/12/9).

---

## Phase 1 - Core Application Foundation

**Goals:** a runnable Next.js + PostgreSQL application with a working
first-run setup wizard, encrypted provider credentials, and a dashboard/
admin shell.

**Dependencies:** Phase 0.

**Major deliverables:** `packages/llm-gateway` (provider contracts,
AES-256-GCM encryption, master-key resolution, Anthropic/OpenAI/Google/
OpenRouter/custom adapters, mock provider); `packages/database` (Prisma
schema covering the full core data model, client singleton, app-settings/
user-profile/provider-config repositories, pack-import seed script);
`apps/web` (setup wizard: Welcome/System Check/Database/Profile/Provider/
Certifications/Finish; dashboard shell; admin shells for all eight areas,
with Certifications, AI Providers, Prompt Templates and Security
functionally wired to real data).

**Database changes:** initial schema (all models in
`packages/database/prisma/schema.prisma`) - first migration must be
generated via `prisma migrate dev` against a real PostgreSQL instance (not
hand-authored; see data-model.md#6).

**APIs:** `/api/setup/status`, `/api/setup/system-check`, `/api/setup/
database/test`, `/api/setup/database/configure`, `/api/setup/profile`,
`/api/setup/complete`, `/api/providers`, `/api/providers/test`, `/api/
providers/[id]`, `/api/certifications`, `/api/certifications/activate`.

**UI changes:** entire setup wizard; `/dashboard`; `/certifications`
(read-only catalog); `/practice`, `/question-bank`, `/settings`
placeholders; `/admin/*` (certifications, providers, models, question-bank,
prompts, generation-settings, security, logs).

**Tests:** `packages/llm-gateway/tests` (encryption round-trip/tamper/
wrong-key, masking, master-key resolution precedence, gateway dispatch to
mock provider); `packages/database/tests/repositories.test.ts`
(integration, skips cleanly without a reachable DB); `apps/web/tests/
env.test.ts` (environment validation). E2E smoke spec at
`tests/e2e/smoke.spec.ts` (requires a running dev server + DB).

**Acceptance criteria:** fresh install completes setup end-to-end against
a real PostgreSQL database; a provider connection can be tested and saved
with only a masked preview ever shown again; the CCA-F pack can be
activated and its real domain/weight data renders in the UI; no plaintext
API key is ever logged, stored, or returned by any endpoint.

---

## Phase 2 - Certification Engine (allocator & versioning depth)

**Goals:** implement `ExamPlanningService.allocate()` (deterministic
largest-remainder allocation for official simulation; configurable
variance for practice), and any additional pack-versioning tooling needed
once a second certification or pack revision exists.

**Dependencies:** Phase 0, Phase 1.

**Deliverables:** allocator implementation + tests (always totals the
requested count; respects each domain's allowed range); pack
publish/promote tooling if needed.

**Database changes:** none expected beyond what Phase 1 already models.

**APIs:** `POST /api/exams/plan` (create an `ExamPlan` without yet
persisting an attempt).

**UI changes:** none required yet (surfaced once Phase 5 exam creation
exists).

**Tests:** allocator unit tests across edge cases (weight rounding,
minimum/maximum clamping).

**Acceptance criteria:** allocator output always sums to the requested
total and never violates a domain's min/max range.

---

## Phase 3 - LLM Gateway (generation-ready depth)

**Goals:** exercise `generateStructured()` end-to-end against at least one
real provider in a manual/integration setting; add a model discovery/
catalog admin screen if adapter capabilities warrant it.

**Dependencies:** Phase 1 (adapters and encryption already exist).

**Deliverables:** hardening of adapter error handling/backoff (NFR
"retry with bounded exponential backoff"); token/cost telemetry capture
(FR-038).

**Database changes:** token usage / cost fields if not already
sufficiently modeled.

**APIs:** none new beyond what Phase 1 shipped, unless model discovery is
added.

**UI changes:** `/admin/models` becomes functional.

**Tests:** adapter-level tests using recorded/mocked HTTP responses (never
real network calls in CI).

**Acceptance criteria:** a configured provider can complete a structured
generation call end-to-end in a manual test; failures retry with bounded
backoff and never crash the process.

---

## Phase 4 - Question Generation & Validation Engine

**Goals:** implement the full pipeline described in
[question-generation-pipeline.md](../architecture/question-generation-pipeline.md).

**Dependencies:** Phases 1-3.

**Deliverables:** planner, scenario planner, generator, schema validator,
independent reviewer, repair pass, deduplication, question bank
persistence with provenance.

**Database changes:** none expected beyond Phase 1's `Question`/
`QuestionOption`/`QuestionValidation`/`GenerationJob` tables.

**APIs:** `POST /api/questions/generate`, `POST /api/questions/:id/
feedback`.

**UI changes:** `/admin/question-bank` becomes functional (search/filter/
quarantine/approve); `/admin/generation-settings` becomes functional.

**Tests:** scope-violation rejection, answer-disagreement quarantine,
near-duplicate detection, repair-then-requarantine paths - all against the
mock provider.

**Acceptance criteria:** a full CCA-F question spec set can be fulfilled
with only `approved` questions ever eligible to be served; every
quarantined question is inspectable with its reviewer's stated issues.

---

## Phase 5 - Examination Engine and CBT UI

**Goals:** implement `ExamAttemptService` and the timed exam runner.

**Dependencies:** Phases 2 and 4 (needs an allocator and a populated
question bank).

**Deliverables:** attempt creation/pause/resume/answer/submit; autosave;
crash/browser-restart recovery; navigator; flagging; final review screen.

**Database changes:** none expected beyond Phase 1's `ExamAttempt`/
`ExamQuestion`/`ExamAnswer`/`ExamEvent` tables.

**APIs:** the full `/api/exams/*` surface from PRD section 16.

**UI changes:** `/practice` becomes functional; exam runner UI.

**Tests:** timer pause/resume correctness, autosave idempotency, recovery
after simulated restart.

**Acceptance criteria:** a candidate can complete a full 60-question,
120-minute mock with pause/resume (practice mode) and recover an
in-progress attempt after a browser refresh.

---

## Phase 6 - Scoring, Results and Analytics

**Goals:** implement `ScoringService` and `AnalyticsService`.

**Dependencies:** Phase 5.

**Deliverables:** raw scoring; clearly-labeled estimated scaled score;
domain/objective/difficulty breakdowns; score trend; weak-concept profile;
readiness estimate (labeled as a practice prediction).

**Database changes:** none expected beyond Phase 1's `AttemptResult`/
`DomainResult` tables.

**APIs:** `GET /api/exams/:id/results`.

**UI changes:** dashboard readiness/domain-performance/recent-attempts
sections become real; results/review screen.

**Tests:** deterministic scoring for single-choice and multiple-response;
scaled-score formula is version-tagged and documented.

**Acceptance criteria:** results are reproducible from stored data alone
(no live recomputation drift), and the scaled score is never presented as
an official figure.

---

## Phase 7 - PDF/JSON Export and AI Tutor

**Goals:** implement `ExportService` and the contextual tutor.

**Dependencies:** Phase 6.

**Deliverables:** server-rendered HTML-to-PDF report (Playwright/
Chromium); JSON AI audit pack; tutor prompt wired to `prompts/tutor.md`.

**Database changes:** none expected.

**APIs:** `GET /api/exams/:id/export.pdf`, `GET /api/exams/:id/
export.json`.

**UI changes:** export buttons on the results screen; tutor panel.

**Tests:** export reproduces an immutable attempt snapshot even if the
question bank changes afterward; tutor interactions never mutate the
historical answer key.

**Acceptance criteria:** exported PDF/JSON for the same attempt is
byte-for-byte stable across repeated exports.

---

## Phase 8 - Adaptive Practice and Weakness Engine

**Goals:** roadmap item (PRD section 23) - adaptive practice sequencing
and recency-weighted weakness targeting beyond the basic weak-concept
profile from Phase 6.

**Dependencies:** Phase 6.

**Deliverables:** TBD at planning time for this phase.

---

## Phase 9 - Production Hardening and Packaging

**Goals:** E2E coverage across the full candidate journey, accessibility
(WCAG 2.2 AA) audit, security review, performance pass, and an npm-based
production install/start path; persisted log viewer.

**Dependencies:** all prior phases.

**Deliverables:** full Playwright E2E suite; accessibility fixes;
`/admin/logs` becomes functional; packaging scripts.

**Acceptance criteria:** matches PRD section 25 "Definition of Done - V1"
in full.
