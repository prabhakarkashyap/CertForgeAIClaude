# Certification Pack Design

## 1. Principle

The certification blueprint is the curriculum authority. The LLM is only
ever the question *author* - it must never be allowed to expand,
reinterpret, or invent certification scope. This is enforced structurally:
`packages/certification-engine` is the only code path that produces a
`CertificationPack`, and every domain/objective/exclusion a later
generation pipeline will read comes from that pack, not from a model's own
"knowledge" of the certification.

## 2. On-disk format

```
certifications/<pack-slug>/
  manifest.json           exam identity, timing, scoring, question types
  blueprint.json          allocation strategy + official/practice question counts
  domains.json            weighted domains, target/min/max question counts
  objectives.json         objectives per domain (isPlaceholder when not yet sourced)
  terminology.json        glossary entries (isPlaceholder allowed per term)
  exclusions.json         scopeGuardrail text + excludedTopics
  scenario-templates.json reusable scenario contexts (isPlaceholder allowed)
  validation-rules.json   quality gates (gate name + rule text)
  references.json         source citations with accessedDate
  prompts/
    generator.md          question-author prompt template
    reviewer.md           independent-reviewer prompt template
    repair.md             repair-pass prompt template
    tutor.md              post-exam tutor prompt template
```

Every file has a Zod schema in `packages/certification-engine/src/
schemas.ts`. `loadCertificationPack(packDir)` reads and validates all nine
JSON files plus the four prompt files, then runs cross-file checks in
`validate.ts` (`crossValidatePack`):

- Domain `weightPercent` values sum to 100 (±0.01 tolerance).
- Domain `targetQuestionCount` values sum to `manifest.totalQuestions`.
- Each domain's `min <= target <= max`.
- `blueprint.officialSimulation.questionCount`/`durationMinutes` match the
  manifest.
- Every objective's `domainKey` references a domain that actually exists.

A pack that fails any of these throws `CertificationPackError` with every
violation collected into one message - see
`packages/certification-engine/tests/pack-loader.test.ts`.

## 3. Versioning

`manifest.version` is a plain semver-like string (`1.0.0`). A new blueprint
revision ships as a new pack version directory content (bump `version` in
`manifest.json`); `activateCertificationPack()` upserts by
`(certificationId, version)` and marks the newly-activated version
`active`, demoting any other version of the same certification to
`deprecated`. See [data-model.md](./data-model.md) for the immutability
rule once a version is referenced by an `ExamAttempt`.

## 4. Placeholder policy

The bundled CCA-F pack's objectives, most terminology entries, and its
single scenario template are all marked `isPlaceholder: true` with an
explicit note in their `description`/`definition` field. This is
deliberate: the PRD's verified baseline (Anthropic Partner Academy page)
confirms domain names and weights, but does not enumerate objective-level
detail. `packages/certification-engine/tests/cca-f-pack.test.ts` asserts
every bundled objective is currently a placeholder, so this fact is
enforced by CI rather than left to drift silently. The UI (question bank,
prompts admin screen) must surface this flag rather than hide it - never
present placeholder content as authoritative.

## 5. Scope guardrail

`exclusions.json#scopeGuardrail` and `excludedTopics` encode PRD section
5.3: generic AWS/Azure/GCP/Kubernetes/networking questions are out of scope
unless the infrastructure concept is directly necessary to a Claude
solution architecture decision. Both the generator and reviewer prompts
(`prompts/generator.md`, `prompts/reviewer.md`) restate this rule - scope
enforcement is not left to a single prompt.

## 6. Importing a pack into the database

`packToImportInput(pack)` (`packages/certification-engine/src/import.ts`)
is a pure function with no I/O: it reshapes a loaded pack into the exact
shape `apps/web`'s `certification-service.ts` (and `packages/database`'s
seed script) need to upsert `Certification`/`CertificationVersion`/
`Domain`/`Objective` rows. Keeping this transform pure and dependency-free
means the certification engine has no compiled dependency on Prisma.
