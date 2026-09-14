# Phase Status

Update this file whenever a meaningful implementation step completes.
Statuses: `NOT STARTED`, `IN PROGRESS`, `BLOCKED`, `COMPLETE`.

Last updated: 2026-09-14 (initial Phase 0 + Phase 1 build).

## Phase 0 - Repository Contract & Foundation

| Deliverable | Status | Notes |
|---|---|---|
| Monorepo workspace structure | COMPLETE | npm workspaces; `apps/*`, `packages/*` |
| TypeScript strict mode base config | COMPLETE | `tsconfig.base.json` |
| ESLint / Prettier | COMPLETE | Not yet run - no Node.js/npm available in the build environment; see root README "Known limitations" |
| Vitest / Playwright scaffolding | COMPLETE | Config written; suites not yet executed in this environment |
| `AGENTS.md` / `CODEX.md` | COMPLETE | |
| `docs/architecture/*` | COMPLETE | 5 documents |
| `packages/shared` core types | COMPLETE | Certification/Question/Exam/LLM/Error/User/Logging contracts |
| `packages/certification-engine` pack loader | COMPLETE | Zod schemas, cross-validation, discovery, DB-import transform |
| Bundled `claude-architect-foundations` pack v1.0.0 | COMPLETE | Domains/weights verified against PRD; objectives/terminology/scenario templates explicitly marked placeholder pending exam-guide detail |
| Certification-engine tests | COMPLETE | `pack-loader.test.ts` (fixtures), `cca-f-pack.test.ts` (real bundled pack) - not yet executed (no Node.js in build environment) |

## Phase 1 - Core Application Foundation

| Deliverable | Status | Notes |
|---|---|---|
| `packages/llm-gateway` provider contracts + adapters | COMPLETE | Anthropic, OpenAI, Google, OpenRouter, custom, mock |
| AES-256-GCM credential encryption + master-key resolution | COMPLETE | Tests written, not yet executed |
| `packages/database` Prisma schema | COMPLETE | Full core data model from PRD section 15 + AppSetting |
| Initial Prisma migration | **NOT STARTED** | Must be generated with `prisma migrate dev` against a real PostgreSQL instance - intentionally not hand-authored (see data-model.md#6) |
| Prisma client + repositories (app-settings, user-profile, provider-config) | COMPLETE | |
| Pack-import seed script | COMPLETE | `packages/database/prisma/seed.ts` |
| Setup wizard (7 steps) | COMPLETE | Welcome, System Check, Database, Profile, Provider, Certifications, Finish |
| Dashboard shell | COMPLETE | Real active-certification data; explicit "Coming in Phase N" states for attempts/readiness/domain performance (no fabricated analytics) |
| Admin shells (8 areas) | COMPLETE | Certifications, Providers, Prompt Templates and Security are functionally wired to real data; Models, Question Bank, Generation Settings, Logs are labeled placeholders |
| API surface (setup/providers/certifications) | COMPLETE | See implementation-plan.md Phase 1 |
| Unit/integration tests | COMPLETE (written) | Not yet executed - see "Known environment limitation" below |
| E2E smoke spec | COMPLETE (written) | Requires a running dev server + database; not yet executed |
| `npm install` / build / lint / typecheck / test run | **BLOCKED** | Node.js, npm and PostgreSQL are not installed in this build environment. See root README for exact commands to run once prerequisites are available. |

## Known environment limitation (read before assuming CI-green)

This Phase 0/1 build was produced in an environment with **no Node.js, npm,
or PostgreSQL installed**. Every file was written and manually
cross-checked for consistency (import paths, Prisma relation names,
package boundaries), but none of the following have actually been executed
against a real toolchain yet:

- `npm install`
- `npm run build` / `npm run typecheck` / `npm run lint`
- `npm test` (Vitest suites)
- `npm run db:migrate` (no migration exists yet - see above)
- `npm run test:e2e` (Playwright)

Run the commands in the root `README.md` "Getting started" section on a
machine with Node.js 20+ and PostgreSQL before treating this as verified.
Report any compile/test failures found there back into this file.

## Phases 2-9

All `NOT STARTED`. See `implementation-plan.md` for scope.
