# Question Generation Pipeline

Status: **contracts only** as of Phase 0/1. This document describes the
target design so Phase 4 implements against an already-agreed shape rather
than inventing it ad hoc.

## 1. Pipeline stages (PRD section 6.2 / section 4 of the build brief)

```
Exam Planner
  -> Scenario Planner
    -> Question Specification
      -> Question Generator
        -> Schema Validator
          -> Independent Reviewer
            -> Repair (bounded attempts)
              -> Duplicate Detection
                -> Approval / Quarantine
                  -> Exam Assembly
```

- **Exam Planner** (`ExamPlanningService.allocate` /
  `createPlan`, contract in `packages/exam-engine`): expands a
  certification version + mode (`official_simulation` | `practice`) +
  total question count into a `DomainAllocation[]` using deterministic
  largest-remainder allocation for official simulation (PRD 5.1) - not yet
  implemented.
- **Scenario Planner**: selects/creates 4-6 coherent scenario contexts from
  `scenario-templates.json` (today, a single placeholder template - see
  certification-pack-design.md).
- **Question Specification**: `QuestionSpecification` in
  `packages/question-engine` - one certification version/domain/objective/
  scenario/type/difficulty tuple per question to be produced.
- **Question Generator**: calls `LLMGateway.generateStructured()` with the
  pack's `prompts/generator.md` content plus the specification, and parses
  the result against the canonical question contract (below).
- **Schema Validator**: rejects malformed structured output before it ever
  reaches a reviewer.
- **Independent Reviewer**: a *different* call (optionally a different
  provider/model) using `prompts/reviewer.md`, which independently derives
  an answer before comparing to the generator's claimed answer key -
  disagreement always quarantines the item (see reviewer.md and PRD
  quality gates).
- **Repair**: bounded attempts using `prompts/repair.md`; a question that
  cannot be repaired without changing its tested concept must not be
  repaired - it is quarantined instead.
- **Duplicate Detection**: exact-hash plus a configurable near-duplicate
  threshold against the local bank and the current exam.
- **Approval / Quarantine**: only `approved` questions are eligible to be
  served (`QuestionLifecycleState` in `packages/shared/src/question.ts`).
- **Exam Assembly**: hybrid strategy - prefer validated stored questions,
  fill the configured fresh-generation percentage with new generations.

## 2. Canonical question contract

Defined once in `packages/shared/src/question.ts` (`Question`,
`QuestionOption`, `QuestionProvenance`) and mirrored in the Prisma schema.
Every generated question must include: certification/domain/objective/
scenario IDs, `type`, `difficulty`, `stem`, `options[]`,
`correctOptionIds[]`, `rationale`, `distractorRationales` (keyed by option
id), `tags[]`, and full `provenance` (`provider`, `model`, `promptVersion`,
`generatedAt`). No field is optional at persistence time.

## 3. Quality gates

Enforced conceptually by the reviewer stage, encoded per-pack in
`validation-rules.json` (see certification-pack-design.md): Schema, Scope,
Answerability, Correctness, Distractors, Ambiguity, Duplication,
Safety/Integrity. `QuestionValidation` rows persist the reviewer's verdict,
confidence and issues for every reviewed question - never silently
discarded.

## 4. What exists today vs. Phase 4

| Exists now (Phase 0/1) | Deferred to Phase 4 |
|---|---|
| Canonical `Question`/`QuestionOption`/`QuestionValidation` types and Prisma tables | Actual planner/generator/reviewer/repair/dedup implementations |
| `prompts/*.md` draft templates in the CCA-F pack | Wiring those templates into real `LLMGateway.generateStructured()` calls |
| `QuestionGenerationService`/`QuestionValidationService`/`QuestionBankService` interfaces (`packages/question-engine`) | Concrete implementations of those interfaces |
| Question Bank admin screen shell (`/admin/question-bank`) | Real search/filter/quarantine/approve UI backed by data |

Building the pipeline before an application foundation existed would have
meant designing against a moving target; Phase 1 intentionally stops at
these contracts.
