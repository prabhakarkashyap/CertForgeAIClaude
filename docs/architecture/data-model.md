# Data Model

Source of truth: `packages/database/prisma/schema.prisma`. This document
explains the *why* behind the schema; read the schema itself for exact
field types.

## 1. Certification versioning and immutability

- `Certification` is a stable identity (`slug`, e.g.
  `claude-architect-foundations`).
- `CertificationVersion` is the actual blueprint snapshot: timing, scoring,
  question types, and a `sourceDisclaimer`. Only one version per
  certification should normally have `status = active`; activating a new
  version demotes the previous active version to `deprecated`
  (`certification-service.ts#activateCertificationPack`).
- `isLocked` becomes `true` the moment any `ExamAttempt` references a
  version (this flag is written by the exam-attempt creation path, which
  ships in Phase 5 - not yet implemented). Once locked, that version's
  `Domain`/`Objective` rows must never be mutated; publish a new
  `CertificationVersion` instead. `activateCertificationPack()` already
  refuses to re-import into a locked version.
- `Domain` and `Objective` are imported from a certification pack's
  `domains.json`/`objectives.json` via the pure
  `packToImportInput()` transform in `packages/certification-engine`, not
  hand-entered - see
  [certification-pack-design.md](./certification-pack-design.md).

## 2. Question provenance

Every `Question` row carries `provider`, `model`, `promptVersion`, and
`generatedAt`, plus `validatorStatus`/`validatorConfidence`/`qualityScore`
populated by the (not-yet-implemented) independent reviewer stage. This
satisfies the requirement that AI-generated content never loses its origin
- audit exports (Phase 7) read directly from these fields.

## 3. Exam attempt snapshotting

`ExamAttempt.examPlan` stores the `ExamPlan` (mode, domain allocations) as
JSON at creation time, and `ExamQuestion` rows snapshot the ordered list of
questions actually served - both are immutable once written, so a later
certification version change or question edit cannot retroactively alter a
historical attempt. `AttemptResult`/`DomainResult` are the scoring
snapshot, computed once at submission (Phase 6).

## 4. Why `Json` columns for `examPlan`, `distractorRationales`, `payload`

These are write-once (or append-only, for `ExamEvent.payload`) structures
whose shape is already defined precisely in `packages/shared` TypeScript
types. Modeling them as relational tables would add migration overhead for
no query benefit in V1 (nothing filters into `distractorRationales` by
key, for example). If a future phase needs to query into one of these
structures relationally, that is a deliberate, documented schema change -
not a default.

## 5. Provider credentials

`LLMProviderConfig.encryptedApiKey` is the only place a provider secret is
persisted, and it is always AES-256-GCM ciphertext (see
[llm-provider-design.md](./llm-provider-design.md)). Every repository read
path in `packages/database/src/repositories/provider-config.ts` selects an
explicit field list that excludes `encryptedApiKey`, except
`getProviderConfigWithSecret`, which is reserved for the moment the LLM
gateway needs to make an authenticated call.

## 6. Migrations

Every schema change must go through `prisma migrate dev` (see root
`README.md`). This repository intentionally does **not** ship a
hand-authored initial migration SQL file: Prisma's migration format
encodes exact constraint/index naming that only the Prisma CLI can
generate correctly from `schema.prisma`, and hand-writing it would risk
silent drift between the schema and the migration history. Run
`npm run db:migrate --workspace=packages/database` once against a real
PostgreSQL instance to generate the initial migration - see
`docs/implementation/phase-status.md` for current status.
