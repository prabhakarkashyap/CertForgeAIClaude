# AGENTS.md — CertForge AI persistent project instructions

This file is a persistent instruction set for any AI coding agent (Claude
Code, Codex, or otherwise) working in this repository. Treat every rule
below as binding unless the user explicitly overrides it in the same
session.

## 1. Product purpose

CertForge AI is an installable, **local-first**, AI-powered certification
examination practice platform. The first supported certification is
**Claude Certified Architect – Foundations (CCA-F)**. The platform itself
must remain generic: certification content is configuration data in
versioned "certification packs," never hard-coded into the exam engine.

CertForge AI is **not affiliated with, endorsed by, or an official product
of Anthropic or Pearson VUE**. Never imply otherwise in code, UI copy,
commit messages, or documentation. Never claim generated practice
questions are official or leaked exam content.

## 2. Source of truth

The authoritative product specification is:

```
docs/PRD/CertForge_AI_Master_PRD_FRS_v1.0.docx   (original)
docs/PRD/CertForge_AI_Master_PRD_FRS_v1.0.md     (plain-text rendition for easy reading/search)
```

Read it before making any product decision. Do not invent business
requirements that conflict with it. Do not silently simplify a requirement
- if something in the PRD seems infeasible or ambiguous, say so explicitly
in your response and in `docs/implementation/phase-status.md`, rather than
quietly dropping it.

## 3. Architecture rules

- **The certification blueprint is the curriculum authority. The LLM is
  only the question author.** Never let a model call determine
  certification scope, domain weights, or objectives. See
  `docs/architecture/certification-pack-design.md`.
- **Certification behavior is configuration-driven.** All
  certification-specific data lives under `certifications/<pack-slug>/` as
  versioned JSON + prompt files, loaded through
  `packages/certification-engine`. Do not hard-code certification-specific
  strings, numbers, or logic into `apps/web`, `packages/exam-engine`,
  `packages/question-engine`, or any other generic package.
- **Provider logic is isolated.** All LLM provider-specific code
  (authentication, request/response shape, model IDs) lives only in
  `packages/llm-gateway`. Every other package and `apps/web` must depend
  only on the `LLMProvider`/`LLMGateway` contracts in `packages/shared` and
  `packages/llm-gateway`'s public API.
- **Question generation follows the pipeline contract** in
  `docs/architecture/question-generation-pipeline.md`: Exam Planner →
  Scenario Planner → Question Specification → Question Generator → Schema
  Validator → Independent Reviewer → Repair → Duplicate Detection →
  Approval/Quarantine → Exam Assembly. Do not collapse or skip stages.
- Follow the package layout and its rationale in
  `docs/architecture/architecture-overview.md`. If you need to change it,
  update that document in the same change.

## 4. Coding standards

- TypeScript strict mode everywhere (`tsconfig.base.json`); no `any` except
  where explicitly justified with a comment.
- No giant "god" files (e.g. a single `services.ts`). Keep clear service
  boundaries: `CertificationService`, `ExamPlanningService`,
  `QuestionGenerationService`, `QuestionValidationService`,
  `QuestionBankService`, `ExamAttemptService`, `ScoringService`,
  `AnalyticsService`, `ExportService`, `LLMGateway` (see PRD section 14).
- Default to no comments; add one only when it captures a non-obvious
  constraint, invariant, or workaround - never to restate what the code
  already says.
- Don't add abstractions, feature flags, or "just in case" configurability
  beyond what the current phase requires.

## 5. Prohibited shortcuts

- Do not fabricate certification facts (objectives, domain weights,
  question content) not present in the PRD or an authoritative source. If
  detail is missing, add a pack entry explicitly marked
  `isPlaceholder: true` instead of inventing specifics.
- Do not make real external LLM API calls from automated tests. Use the
  mock provider (`packages/llm-gateway/src/providers/mock.ts`) or recorded
  fixtures.
- Do not skip a database migration for a schema change.
- Do not use `git commit --no-verify`, disable lint rules repo-wide to
  silence a failure, or use `prisma migrate reset` / other destructive
  workflows as a shortcut past a real problem.
- Do not present a scaled/estimated score as an official Anthropic/Pearson
  score, or an exam runner as a reproduction of the proprietary Pearson VUE
  interface.
- Do not fabricate dashboard analytics. An empty state ("Coming in Phase
  N") is correct when the underlying data doesn't exist yet.

## 6. Testing expectations

- Unit tests for: certification pack validation, domain-weight totals,
  encryption/decryption, credential masking, environment/config
  validation.
- Integration tests for: Prisma/database repository behavior, setup state,
  provider configuration persistence. These may require a real PostgreSQL
  instance - write them to skip cleanly (not silently pass, not
  hard-fail-the-suite) when one isn't reachable, and log why.
- E2E/smoke tests for the full candidate/admin journeys, run with
  Playwright against a real running instance - never mocked at the browser
  level.
- Never make a failing test pass by weakening or deleting the assertion
  that caught the bug; fix the underlying code, or if the test's premise is
  wrong, say so and get confirmation before changing it.

## 7. Secrets policy

- Never commit `.env`, API keys, database passwords, or the generated
  `app-secret.key` file.
- Provider API keys are encrypted at rest with AES-256-GCM
  (`packages/llm-gateway/src/security/encryption.ts`) and must never be
  logged, returned in full by any API response, or stored in browser
  `localStorage`.
- The application binds to `localhost`/`127.0.0.1` by default. Do not
  change this without an explicit user request and a documented security
  rationale.

## 8. Certification pack rules

- A pack must include all nine JSON files plus four prompt files listed in
  `docs/architecture/certification-pack-design.md`, and pass
  `loadCertificationPack()`'s schema + cross-file validation.
- A certification version, once referenced by any `ExamAttempt`, is
  immutable (`CertificationVersion.isLocked`). Publish a new version
  instead of mutating a locked one.

## 9. Provider abstraction rules

- Adding a new provider means adding one adapter file in
  `packages/llm-gateway/src/providers/` implementing `LLMProvider`, and
  registering it in `gateway.ts`'s registry. Nothing else should need to
  change.
- An OpenAI-compatible custom endpoint should work by configuration
  (`baseUrl`) alone, reusing the existing OpenAI-compatible adapter.

## 10. Database migration rules

- Every `schema.prisma` change requires a corresponding migration
  generated via `npm run db:migrate --workspace=packages/database`
  (`prisma migrate dev`) against a real PostgreSQL database - never hand
  write migration SQL, and never use `prisma db push`/`migrate reset` as a
  substitute for a real migration in anything other than a fresh local
  scratch database.

## 11. Definition of done (per change)

A change is done when:

1. It matches the PRD (or an explicitly documented, justified deviation).
2. Relevant `docs/architecture/*.md` and `docs/implementation/
   phase-status.md` are updated in the same change if the change is
   architecturally significant.
3. Tests exist for new logic and pass.
4. `npm run lint`, `npm run typecheck`, and `npm run build` succeed.
5. No secret, API key, or plaintext credential is committed or logged.
6. Placeholder/incomplete areas are labeled in the UI, not silently absent.

## 12. Keep documentation synchronized

Whenever you make a significant architecture decision (new package
boundary, new persistence strategy, new security mechanism), update the
relevant file under `docs/architecture/` and the phase tracker in
`docs/implementation/phase-status.md` in the same change - not as a
follow-up.
