# CertForge AI

An installable, **local-first**, AI-powered certification examination
practice platform. The first supported certification is **Claude Certified
Architect – Foundations (CCA-F)**. CertForge AI is not affiliated with,
endorsed by, or an official product of Anthropic or Pearson VUE; generated
practice questions are independently produced and are never official or
leaked exam content.

The full product specification lives in [`docs/PRD/`](./docs/PRD/); the
architecture and phased implementation plan live in
[`docs/architecture/`](./docs/architecture/) and
[`docs/implementation/`](./docs/implementation/). Persistent project rules
for contributors (human or AI) are in [`AGENTS.md`](./AGENTS.md).

## Current implementation status

**Phase 0 (Repository Contract & Foundation) and Phase 1 (Core Application
Foundation) are implemented.** See
[`docs/implementation/phase-status.md`](./docs/implementation/phase-status.md)
for a deliverable-by-deliverable breakdown, including an important caveat:
this codebase was authored in an environment **without Node.js, npm, or
PostgreSQL installed**, so `npm install`, build, lint, typecheck, and test
commands have not yet been executed against a real toolchain. Run the
commands below on a machine with the prerequisites installed and treat
that as the first verification pass.

What works once set up:

- A guided first-run setup wizard (system check → database → profile → AI
  provider → certification pack activation → finish).
- Encrypted-at-rest LLM provider credentials (AES-256-GCM), masked in the
  UI after saving.
- A certification-pack loader that validates the bundled CCA-F pack
  against its PRD-verified domain weights (27/18/20/20/15) and question
  counts (60 total, 16/11/12/12/9 per domain).
- A dashboard and admin shell with real data for certifications, providers,
  prompt templates, and a security overview; other admin areas show
  explicit "Coming in Phase N" states rather than fabricated data.

What's intentionally not built yet: question generation, exam-taking,
scoring, analytics, and exports (Phases 2-9 - see
[`docs/implementation/implementation-plan.md`](./docs/implementation/implementation-plan.md)).

## Prerequisites

- **Node.js 20 LTS or newer** (`node --version`)
- **PostgreSQL 14+** running locally or reachable over the network
- npm (ships with Node.js)

## Getting started

```bash
# 1. Install dependencies (from the repository root)
npm install

# 2. Create your environment file
cp .env.example .env
# Edit .env: set DATABASE_URL to a PostgreSQL database you've created, e.g.
#   postgresql://certforge:certforge@localhost:5432/certforge_ai?schema=public
# (You can also create the database and set this up interactively later
# from the setup wizard's Database step - the wizard writes DATABASE_URL
# into .env for you and tells you to restart.)

# 3. Generate the Prisma client
npm run db:generate

# 4. Create the initial migration (first run only) and apply it
npm run db:migrate --workspace=packages/database
# This is the FIRST migration for this schema - it does not exist yet in
# the repository. Running this command generates it from schema.prisma.

# 5. (Optional) seed the bundled certification pack into the database
npm run db:seed --workspace=packages/database

# 6. Start the development server
npm run dev
# Open http://127.0.0.1:3000 and complete the setup wizard.
```

## Running tests

```bash
# Unit + integration tests (Vitest workspace)
npm test

# Integration tests that need a real database (packages/database) will
# skip themselves cleanly if DATABASE_URL isn't reachable - see
# docs/implementation/phase-status.md.

# End-to-end smoke tests (Playwright) - starts the dev server for you
npm run test:e2e
```

## Linting, type-checking, and production build

```bash
npm run lint
npm run typecheck
npm run build
npm start   # after building; binds to 127.0.0.1 only
```

## Repository architecture

```
apps/web                       Next.js App Router application (UI + API routes)
packages/shared                 Cross-cutting TypeScript contracts (no I/O)
packages/certification-engine   Certification pack loader/validator
packages/llm-gateway             Provider-neutral LLM gateway + credential encryption
packages/database                 Prisma schema, client, repositories, seed script
packages/question-engine           Question generation/validation contracts (Phase 4)
packages/exam-engine                Exam planning/attempt contracts (Phase 2 / 5)
packages/scoring-engine              Scoring contracts (Phase 6)
packages/analytics-engine             Analytics contracts (Phase 6)
packages/export-engine                  PDF/JSON export contracts (Phase 7)
certifications/<pack-slug>                Versioned certification content packs
docs/PRD                                   Authoritative product specification
docs/architecture                           Architecture decision documents
docs/implementation                          Phased delivery plan + live status tracker
```

See [`docs/architecture/architecture-overview.md`](./docs/architecture/architecture-overview.md)
for the rationale behind this layout.

## The certification pack model

Certification content (exam metadata, domain weights, objectives,
terminology, scope exclusions, scenario templates, quality-gate rules,
source references, and generation/review/repair/tutor prompt templates) is
**data, not code** - versioned JSON + Markdown under
`certifications/<pack-slug>/`. Adding a new certification means adding a
new pack directory that passes `loadCertificationPack()`'s validation, not
modifying the exam engine. See
[`docs/architecture/certification-pack-design.md`](./docs/architecture/certification-pack-design.md).

The bundled `claude-architect-foundations` pack's domain weights and
question counts are verified against the PRD's cited source (Anthropic
Partner Academy certification page). Its objectives, most terminology
entries, and its scenario template are explicitly marked
`isPlaceholder: true` pending detail from an authoritative exam guide - the
admin UI surfaces this rather than hiding it.

## Secrets and security notes

- Copy `.env.example` to `.env` and never commit `.env`.
- LLM provider API keys are encrypted at rest with AES-256-GCM and a
  per-install master key (env var `APP_ENCRYPTION_KEY`, or an
  auto-generated, owner-only-permission file under `APP_DATA_DIR`). Only a
  masked preview (e.g. `sk-...ab12`) is ever shown again after saving - see
  [`docs/architecture/llm-provider-design.md`](./docs/architecture/llm-provider-design.md).
  Full plaintext keys are never logged or returned by any API response.
- The dev/start scripts bind to `127.0.0.1` by default. Do not expose this
  application to a LAN or the internet without deliberately securing
  remote access.
- Report a security concern by opening an issue rather than a public PR
  with exploit details.

## Upcoming phases

See [`docs/implementation/implementation-plan.md`](./docs/implementation/implementation-plan.md)
for full detail on Phases 2-9: Certification Engine allocator, LLM Gateway
hardening, Question Generation & Validation Engine, Examination Engine and
CBT UI, Scoring/Results/Analytics, PDF/JSON Export and AI Tutor, Adaptive
Practice, and Production Hardening & Packaging.
