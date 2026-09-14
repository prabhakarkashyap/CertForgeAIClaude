# Architecture Overview

Status: reflects the Phase 0 + Phase 1 implementation. Update this document
whenever a significant architectural decision changes.

## 1. System shape

CertForge AI is a single Next.js application (`apps/web`) backed by
PostgreSQL, composed from a set of independent TypeScript packages under
`packages/`. It is local-first: the only mandatory runtime dependencies are
Node.js and PostgreSQL (PRD section 2.2). Redis, Docker, Python, RabbitMQ,
Kafka and external vector databases are explicitly out of scope for V1
(PRD section 2.3) - extension points are described where relevant below,
but nothing requires them to run.

```
apps/web                    Next.js App Router application (UI + API routes)
packages/shared              Cross-cutting TypeScript contracts (no I/O)
packages/certification-engine Certification pack loader/validator (curriculum authority)
packages/llm-gateway          Provider-neutral LLM gateway + credential encryption
packages/database             Prisma schema, client, and simple repositories
packages/question-engine       Question generation/validation contracts (Phase 4)
packages/exam-engine           Exam planning/attempt contracts (Phase 2 / Phase 5)
packages/scoring-engine        Scoring contracts (Phase 6)
packages/analytics-engine      Analytics contracts (Phase 6)
packages/export-engine         PDF/JSON export contracts (Phase 7)
certifications/<pack>          Versioned, portable certification content packs
```

## 2. Why this package layout

- **`packages/shared` has no I/O.** Every other package and `apps/web` can
  depend on it without creating cycles. It defines the canonical domain
  types (Certification, Question, ExamAttempt, LLMProvider, ...) once.
- **`packages/certification-engine` never depends on Prisma.** The pack
  loader/validator is pure (reads JSON/markdown from disk, validates with
  Zod). This keeps the certification blueprint - the curriculum authority
  per the product principles - usable outside a database context (tests,
  future CLI tooling, a future desktop build). Persisting pack data into
  Postgres is a *composition* concern handled by `apps/web`'s
  `certification-service.ts` (and by `packages/database`'s seed script),
  via the pure `packToImportInput()` transform in certification-engine.
- **`packages/llm-gateway` is the only place provider-specific code may
  live.** `apps/web`, and later `question-engine`/`exam-engine`, only ever
  call `LLMGateway.testConnection()` / `generateStructured()` against the
  shared `LLMProvider` contract. See
  [llm-provider-design.md](./llm-provider-design.md).
- **The five "engine" packages beyond certification/llm-gateway currently
  hold contracts only** (question-engine, exam-engine, scoring-engine,
  analytics-engine, export-engine). This follows the delivery plan's
  phasing: Phase 0/1 establishes stable interfaces so later phases compose
  behind them instead of the UI reaching directly into ad-hoc logic.

## 3. Setup state: why a generic `AppSetting` table

The PRD's core data model (section 15) does not name a dedicated
"SetupState" entity. Rather than add one speculative table, Phase 1 uses a
minimal `AppSetting(key, value)` table and a single `setup.completed` flag.
`getSetupStatus()` (`apps/web/src/server/services/setup-service.ts`)
derives the wizard's actual per-step readiness from real data (a profile
exists, an active provider config exists, an active certification version
exists) rather than trusting a stale flag - the flag only gates whether the
user has explicitly finished the wizard once.

## 4. Error handling

All server code throws one of the typed errors in
`packages/shared/src/errors.ts` (`ValidationError`, `ConfigurationError`,
`ProviderError`, `DatabaseError`, `CertificationPackError`,
`GenerationError`, `SecurityError`, `NotFoundError`). API routes are
wrapped with `withApiErrorHandling` (`apps/web/src/lib/api-response.ts`),
which logs the error server-side and returns only a safe `{ message,
category }` pair to the client - never a raw stack trace, per the setup
wizard UX requirement and NFR-002.

## 5. Logging

`apps/web/src/lib/logger.ts` emits structured JSON log lines (timestamp,
severity, event, module, correlationId, metadata) to stdout/stderr.
Metadata keys matching a sensitive-key pattern (`SENSITIVE_LOG_KEY_PATTERNS`
in `packages/shared/src/logging.ts` - apiKey, password, secret, token,
authorization, encryptionKey) are redacted automatically. Callers must still
avoid passing raw provider request/response bodies as metadata.

## 6. Security posture (see also llm-provider-design.md)

- The dev/start scripts bind Next.js to `127.0.0.1` explicitly - the
  application is never exposed beyond localhost by default (NFR/Security
  section 17).
- Provider API keys are encrypted at rest with AES-256-GCM using a
  per-install master key, and only ever surfaced to the UI as a masked
  preview.
- All server-side input is validated with Zod before touching a service or
  Prisma.

## 7. Known Phase 0/1 limitations

- The question/exam/scoring/analytics/export packages are interface-only.
- The certification pack allocator (deterministic largest-remainder
  allocation across domains) is not yet implemented - see
  [question-generation-pipeline.md](./question-generation-pipeline.md) and
  `docs/implementation/phase-status.md`. `ExamPlanningService.allocate()` is
  defined but has no implementation yet.
- No exam attempt, scoring, or export functionality exists yet; the
  dashboard and question-bank/practice screens show explicit "Coming in
  Phase N" states rather than fabricated data, per the product principle
  against fake analytics.
