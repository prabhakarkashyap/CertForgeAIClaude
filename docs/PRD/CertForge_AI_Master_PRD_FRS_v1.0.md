CERTFORGE AI
Master Product Requirements Document (PRD)
& Functional Requirements Specification (FRS)
AI-Powered Local Certification Exam Simulator


| Document | Value |
| --- | --- |
| Version | 1.0 |
| Date | 14 September 2026 |
| Initial Certification | Claude Certified Architect – Foundations |
| Primary Runtime | Node.js + PostgreSQL |
| Build Target | Claude Code |
| Architecture | Provider-neutral, certification-configurable, local-first web application |
| Status | Build-ready baseline |


CertForge AI is a working product name. The software must not imply affiliation with or endorsement by Anthropic, Pearson VUE, or any certification owner.


# 1. Executive Summary

CertForge AI is an installable, local-first web application for preparing for professional technology certifications through blueprint-aligned AI-generated mock examinations. The first supported certification is Claude Certified Architect – Foundations (CCA-F). The product is intentionally designed as a reusable certification platform: certification content, weights, objectives, question policies, scenarios and timing are configuration data rather than hard-coded application logic.
The application will use a user-supplied LLM API key (initially Anthropic, OpenAI, Google Gemini, OpenRouter, and compatible endpoints) to generate and validate practice questions in real time. A certification knowledge pack and independent validation pipeline will constrain generation to the selected certification's published scope. The LLM is the question author; the certification blueprint is the curriculum authority.
The candidate experience will emulate the interaction patterns of a professional computer-based test—timed navigation, previous/next, answer state, flag-for-review, question navigator, final review and submission—without copying proprietary Pearson VUE visual assets or claiming to reproduce an official exam.

## 1.1 Verified CCA-F Baseline


| Attribute | Baseline |
| --- | --- |
| Exam | Claude Certified Architect – Foundations |
| Role / Level | Architect / Foundations |
| Questions | 60 |
| Time | 120 minutes |
| Question types | Multiple choice and multiple response |
| Passing score | 720 on a scaled 100–1,000 scale |
| Delivery | Online proctored or Pearson test center |
| Domain 1 | Agentic Architecture & Orchestration — 27% |
| Domain 2 | Tool Design & MCP Integration — 18% |
| Domain 3 | Claude Code Configuration & Workflows — 20% |
| Domain 4 | Prompt Engineering & Structured Output — 20% |
| Domain 5 | Context Management & Reliability — 15% |


Source baseline: Anthropic Partner Academy certification page, accessed September 2026. The certification pack must be versioned so future blueprint changes do not rewrite historical exam attempts.

# 2. Product Vision, Goals and Non-Goals


## 2.1 Vision

Create a private, affordable and extensible examination practice environment that generates fresh, high-quality questions while preserving strict alignment to a selected certification blueprint and continuously identifying the learner's weak concepts.

## 2.2 Primary Goals

Install and run locally with Node.js and PostgreSQL as the only mandatory infrastructure dependencies for V1.
Allow a non-technical user to complete setup through a guided browser wizard.
Support multiple LLM providers through a single provider abstraction layer.
Generate certification-aligned questions and scenarios without drifting into unrelated generic cloud or AI topics.
Provide a realistic 60-question / 120-minute CCA-F mock examination experience.
Support pause/resume for learning mode while retaining active-time and wall-clock metrics.
Provide detailed answer rationales, distractor explanations, domain analytics and downloadable PDF/JSON review packs.
Build a reusable certification engine so new certifications can be added without changing core exam code.
Maintain a validated local question bank to reduce cost, latency and repeated questions over time.

## 2.3 Non-Goals for V1

Obtaining, reconstructing, scraping or distributing proprietary/leaked official exam questions.
Claiming an exact reproduction of Anthropic/Pearson scoring or Pearson VUE's proprietary interface.
Cloud-hosted multi-tenant SaaS, payments, subscriptions or enterprise SSO.
Native mobile applications.
Mandatory Redis, Docker, Python, RabbitMQ or external vector databases.
Automated official exam registration or scheduling.

# 3. Users and Core Journeys


| Persona | Need | Success |
| --- | --- | --- |
| Candidate | Prepare for a selected certification | Can practice, take mocks, understand mistakes and track readiness |
| Local Administrator | Install/configure the app | Can configure DB, providers, models, certification packs and security |
| Content/QA Administrator | Control question quality | Can review, quarantine, approve and inspect generated questions |
| Future Certification Author | Add a new certification | Can add a versioned knowledge pack without rewriting exam engine |



## 3.1 First-Run Journey

Launch application and open setup wizard.
Run system checks: supported Node.js, PostgreSQL reachability, writable data directory, network/API reachability.
Configure PostgreSQL host, port, database, username and password; test connection; optionally initialize schema.
Create local user profile: first name, last name/display name, optional email.
Choose LLM provider and model; enter API key; test connection; encrypt secret at rest.
Install/activate one or more certification packs; CCA-F is bundled in V1.
Complete setup and enter dashboard.

## 3.2 Full Mock Journey

Choose certification and blueprint version.
Choose Full Mock Exam.
System assembles/generates a blueprint-compliant exam and validates it.
Candidate reads exam instructions and starts; 120-minute active timer begins.
Candidate answers, navigates, flags questions and may pause/resume in practice mode.
System autosaves all interactions and supports crash/browser recovery.
Candidate submits or time expires; system locks attempt and scores it.
Candidate receives summary, domain performance, question-by-question review and learning recommendations.
Candidate exports a human-readable PDF and machine-readable JSON review pack.

# 4. Product Scope and Information Architecture


| Area | Primary Screens |
| --- | --- |
| Setup | Welcome, System Check, Database, Profile, AI Provider, Certification Packs, Finish |
| Dashboard | Readiness, recent attempts, score trend, domain strengths/weaknesses, quick actions |
| Certifications | Certification catalog, version details, blueprint/domain overview |
| Practice | Full Mock, Quick Test, Domain Practice, Scenario Practice, Weak Areas, Review Mistakes |
| Exam | Instructions, exam runner, pause overlay, navigator, review screen, submission |
| Results | Summary, domain analytics, question review, AI tutor, exports |
| Question Bank | Search/filter, quality state, source/provider/model, quarantine/approve |
| Administration | Providers, models, prompts, generation policies, certification packs, security, logs |



# 5. Certification Engine

Certification definitions must be versioned, portable packs. A pack defines exam metadata, domain weights, objectives, terminology, allowed and excluded concepts, scenario templates, generation instructions, validation instructions, scoring policy and references.

## 5.1 CCA-F Domain Allocation


| Domain | Weight | 60-Q Target | Allowed Range |
| --- | --- | --- | --- |
| Agentic Architecture & Orchestration | 27% | 16 | 15–17 |
| Tool Design & MCP Integration | 18% | 11 | 10–12 |
| Claude Code Configuration & Workflows | 20% | 12 | 11–13 |
| Prompt Engineering & Structured Output | 20% | 12 | 11–13 |
| Context Management & Reliability | 15% | 9 | 8–10 |


For 'Official Simulation' mode, the allocator should use deterministic largest-remainder allocation to 60 questions unless the certification pack explicitly permits variance. Randomized ranges are appropriate for practice modes, but must not silently misrepresent the published blueprint.

## 5.2 Knowledge Pack Structure

Recommended repository structure:
certifications/
  claude-architect-foundations/
    manifest.json
    blueprint.json
    domains.json
    objectives.json
    terminology.json
    exclusions.json
    scenario-templates.json
    validation-rules.json
    references.json
    prompts/
      generator.md
      reviewer.md
      repair.md
      tutor.md

## 5.3 Scope Guardrail

For CCA-F, generic AWS/Azure/GCP/Kubernetes/networking questions must be rejected unless the infrastructure concept is directly necessary to a Claude solution architecture decision. The primary tested concept must remain within the activated CCA-F objective set. Generation and validation prompts must both enforce this rule.

# 6. AI/LLM Architecture


## 6.1 Provider Abstraction

All AI calls pass through a provider-neutral gateway. Provider adapters translate authentication, model identifiers, structured-output features, token accounting, timeouts and errors into a common internal contract.

| Provider | V1 Requirement |
| --- | --- |
| Anthropic | Supported |
| OpenAI | Supported |
| Google Gemini | Supported |
| OpenRouter | Supported |
| Custom OpenAI-compatible endpoint | Supported where compatible |



## 6.2 Generation Pipeline

Exam planner calculates domain/objective/difficulty/question-type requirements.
Scenario planner creates or selects 4–6 coherent scenario contexts where appropriate.
Question generator creates small batches using only relevant knowledge-pack context.
Schema validator rejects malformed output.
Independent reviewer evaluates scope, ambiguity, answer correctness, distractor quality and certification relevance.
Repair pass corrects rejected-but-repairable items.
Deduplication checks exact and near-semantic similarity against the local bank and current exam.
Approved items are persisted and assembled; quarantined items never reach the candidate.

## 6.3 Canonical Question Contract

{
  id, certificationVersionId, domainId, objectiveId, scenarioId?,
  type: "single_choice" | "multiple_response",
  difficulty: "easy" | "medium" | "hard" | "expert",
  stem, options[], correctOptionIds[],
  rationale, distractorRationales{},
  tags[], provider, model, promptVersion,
  validatorStatus, validatorConfidence, qualityScore
}

## 6.4 Quality Gates


| Gate | Rule |
| --- | --- |
| Schema | Valid structured output; required fields present; option IDs unique |
| Scope | Maps to exactly one primary certification objective and does not violate exclusions |
| Answerability | Sufficient information is present; no dependence on hidden assumptions |
| Correctness | Reviewer independently reaches same answer(s) or item is quarantined |
| Distractors | Plausible but demonstrably inferior/incorrect; no joke or giveaway options |
| Ambiguity | Exactly one best answer for single-choice; explicit count/selection rule for multiple response |
| Duplication | No exact duplicate; near-duplicate threshold configurable |
| Safety/Integrity | No claim that generated content is an official or leaked exam item |



# 7. Exam Experience Requirements

The exam runner should reproduce common computer-based testing interaction patterns, not proprietary Pearson branding. The design should be neutral, accessible and distraction-minimal.

| Capability | Requirement |
| --- | --- |
| Timer | 120-minute active countdown for CCA-F full simulation; visible and persistent |
| Pause | Allowed only in practice configuration; timer and interaction freeze; track paused duration separately |
| Navigation | Previous, Next, direct question navigator |
| Answer state | Answered / unanswered / flagged / current states |
| Flagging | Flag for review without changing answer |
| Multiple response | Checkbox selection with explicit instruction when applicable |
| Autosave | Persist answer/navigation/timer state immediately or within 1 second |
| Recovery | Resume unfinished attempt after browser/app restart |
| Final review | Show unanswered and flagged counts before submission |
| Timeout | Auto-submit or lock according to configured exam policy |
| Accessibility | Keyboard navigation, visible focus, semantic controls, sufficient contrast, screen-reader labels |



# 8. Scoring and Analytics


## 8.1 Scoring

The system must always expose the raw practice result (correct items / scored items and percentage). Because the official scaled-score transformation is not public, any 100–1,000 'practice scaled score' must be clearly labeled as an estimate and its formula must be configurable and documented. It must never be presented as Anthropic's official scoring algorithm.

## 8.2 Analytics

Overall raw score and estimated practice scaled score.
Pass-target indicator using the certification's published threshold, with estimation disclaimer.
Performance by domain, objective, question type and difficulty.
Average active time per question and total active/paused/wall-clock duration.
Score trend across attempts.
Weak-concept profile based on recency-weighted historical performance.
Readiness estimate labeled as a practice prediction, not an official likelihood.

# 9. Results, Review and Tutor

After submission, each question review must display the candidate answer, correct answer(s), result, explanation, why each distractor is inferior/incorrect, domain, objective and difficulty. A contextual 'Ask AI' tutor may explain the concept, compare options, simplify the explanation or generate a new practice item on the same objective. Tutor interactions must not mutate the historical answer key.

# 10. Export Requirements


## 10.1 PDF Report

Cover: certification, candidate, attempt ID, date/time, app version and certification blueprint version.
Summary: raw score, estimated scaled score, target status, timing and difficulty mix.
Domain/objective performance tables.
Complete question-by-question review with options, candidate answer, correct answer and rationales.
Footer disclaimer: AI-generated practice content; not official certification questions.

## 10.2 AI Audit Pack

Export JSON alongside PDF containing normalized question data, answer key, candidate responses, rationales, blueprint mapping, provider/model metadata and validator outcomes. This is intended for external audit by Claude or another LLM without requiring the auditor to parse a visually formatted PDF.

# 11. Question Bank and Content Lifecycle


| State | Meaning |
| --- | --- |
| generated | Created but not yet accepted |
| validated | Passed automated quality gates |
| approved | Eligible for serving |
| flagged | User/admin reported potential issue |
| quarantined | Not eligible for serving pending review |
| retired | Kept for history but never served |


V1 should use a hybrid exam assembly strategy. Validated stored questions reduce cost and latency; configurable fresh-generation percentage preserves novelty. Every generated question records provider, model, prompt version and certification blueprint version for traceability.

# 12. Functional Requirements Specification


| ID | Area | Requirement | Priority |
| --- | --- | --- | --- |
| FR-001 | Installation | Application shall run locally on supported Node.js with PostgreSQL and provide a guided first-run setup. | Must |
| FR-002 | System Check | Setup shall verify runtime version, DB reachability, writable paths and required ports. | Must |
| FR-003 | Database | User shall configure/test PostgreSQL and initialize/migrate schema from setup. | Must |
| FR-004 | Profile | User shall create/edit local profile used in reports. | Must |
| FR-005 | Provider | User shall configure at least Anthropic, OpenAI and Gemini provider credentials/models. | Must |
| FR-006 | Provider Test | Application shall validate provider credentials/model before saving configuration. | Must |
| FR-007 | Secret Storage | API keys shall be encrypted at rest and never returned in full after save. | Must |
| FR-008 | Certification Catalog | User shall activate/deactivate installed certification packs. | Must |
| FR-009 | Versioning | Attempts/questions shall reference immutable certification blueprint versions. | Must |
| FR-010 | CCA-F Pack | Bundled CCA-F pack shall implement 60 questions, 120 minutes and published domain weights. | Must |
| FR-011 | Exam Planning | Engine shall create an exact question specification before question generation. | Must |
| FR-012 | Scenario Planning | Engine shall support coherent scenario-linked question groups. | Must |
| FR-013 | Generation | Engine shall generate questions in bounded batches using selected provider/model. | Must |
| FR-014 | Structured Output | Generated questions shall conform to canonical schema before persistence. | Must |
| FR-015 | Scope Validation | Independent validation shall reject questions outside selected blueprint/objectives. | Must |
| FR-016 | Answer Validation | Reviewer shall independently validate correct answer(s) and rationale. | Must |
| FR-017 | Repair | Rejected repairable questions shall receive bounded repair attempts before quarantine. | Should |
| FR-018 | Deduplication | Engine shall reject exact duplicates and detect configurable near-duplicates. | Must |
| FR-019 | Question Bank | Validated questions shall be stored locally with full provenance. | Must |
| FR-020 | Full Mock | User shall launch a blueprint-weighted full mock examination. | Must |
| FR-021 | Practice Modes | User shall be able to run domain and configurable quick practice. | Should |
| FR-022 | Exam UI | Runner shall provide timer, previous/next, navigator, answer state and flagging. | Must |
| FR-023 | Pause | Practice configuration shall permit pause/resume and freeze active timer. | Must |
| FR-024 | Autosave | Attempt state shall autosave continuously and recover after restart. | Must |
| FR-025 | Final Review | Submission flow shall warn about unanswered/flagged questions. | Must |
| FR-026 | Timeout | Exam shall enforce configured time limit and completion policy. | Must |
| FR-027 | Scoring | System shall calculate raw result and domain/objective performance. | Must |
| FR-028 | Scaled Estimate | Optional scaled score shall be explicitly labeled an estimate. | Must |
| FR-029 | Review | Results shall show correct answer(s), user answer and rationales for all options. | Must |
| FR-030 | AI Tutor | User shall be able to ask contextual follow-up questions after scoring. | Should |
| FR-031 | PDF Export | User shall export complete attempt/report to PDF. | Must |
| FR-032 | JSON Export | User shall export normalized AI audit pack to JSON. | Must |
| FR-033 | History | Dashboard shall retain and display attempt history and score trends. | Must |
| FR-034 | Weakness Profile | System shall calculate weak domains/objectives from historical attempts. | Should |
| FR-035 | Feedback | User shall mark a question good, poor or potentially incorrect. | Should |
| FR-036 | Quarantine | Flagged/validator-disputed items shall be removable from serving pool. | Must |
| FR-037 | Admin | Local admin shall manage providers, prompts, generation policy and question bank. | Must |
| FR-038 | Cost Telemetry | System shall record token usage and estimated generation cost where provider data permits. | Should |
| FR-039 | Audit Log | Critical config/generation/exam lifecycle events shall be logged locally. | Must |
| FR-040 | Data Portability | User shall be able to export application data/configuration excluding plaintext secrets. | Could |



# 13. Non-Functional Requirements


| ID | Category | Requirement |
| --- | --- | --- |
| NFR-001 | Local-first | Core exam history, question bank and configuration persist locally in PostgreSQL. |
| NFR-002 | Security | Secrets encrypted at rest; sensitive values excluded from logs; parameterized DB access. |
| NFR-003 | Performance | Cached/pooled exam assembly target <5s; live generation displays progressive status and never blocks UI thread. |
| NFR-004 | Reliability | All generation jobs are idempotent/retry-safe; partial generation cannot corrupt an exam. |
| NFR-005 | Recoverability | Unfinished attempts survive application/browser restart. |
| NFR-006 | Accessibility | Target WCAG 2.2 AA for candidate-facing flows. |
| NFR-007 | Browser | Support current Chrome, Edge, Firefox and Safari for local web access. |
| NFR-008 | Observability | Structured local logs with correlation IDs for generation jobs and attempts. |
| NFR-009 | Maintainability | TypeScript strict mode, modular packages, automated migrations and documented interfaces. |
| NFR-010 | Testability | Unit, integration and end-to-end tests for allocator, scoring, timer, persistence and provider adapters. |
| NFR-011 | Privacy | No telemetry leaves the machine by default except explicit LLM API requests. |
| NFR-012 | Extensibility | New certification packs and LLM adapters must not require changes to exam-runner core. |



# 14. Proposed Technical Architecture


| Layer | Recommendation |
| --- | --- |
| Web UI | Next.js + React + TypeScript |
| Styling/UI | Tailwind CSS + accessible component primitives |
| Server | Next.js server/API for V1; modular service boundaries |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod / JSON Schema |
| Jobs | PostgreSQL-backed job table/worker in V1; Redis optional later |
| PDF | Server-rendered HTML to PDF via Playwright/Chromium |
| Testing | Vitest/Jest + Playwright E2E |
| Packaging | npm-based local production install first; desktop wrapper/installer later |



## 14.1 Suggested Repository

certforge/
  apps/web/
  packages/
    database/
    certification-engine/
    llm-gateway/
    question-engine/
    exam-engine/
    scoring-engine/
    analytics-engine/
    export-engine/
  certifications/
    claude-architect-foundations/
  prisma/
  scripts/
  docs/
    PRD/
    architecture/
  CLAUDE.md
  AGENTS.md

# 15. Core Data Model


| Entity | Purpose |
| --- | --- |
| User | Local candidate/admin profile |
| Certification | Stable certification identity |
| CertificationVersion | Immutable blueprint version, timing, pass threshold and metadata |
| Domain | Weighted exam domain |
| Objective | Testable knowledge/skill objective under a domain |
| Scenario | Reusable/generated scenario context |
| Question | Canonical generated/stored item |
| QuestionOption | Answer option and correctness |
| QuestionValidation | Reviewer verdict, confidence, issues and provenance |
| LLMProviderConfig | Provider/model configuration; encrypted credential reference |
| GenerationJob | Asynchronous generation/validation lifecycle |
| ExamAttempt | Candidate exam instance and timing state |
| ExamQuestion | Ordered snapshot of question served in attempt |
| ExamAnswer | Candidate response and timestamps |
| ExamEvent | Navigation/pause/resume/flag/submit audit trail |
| AttemptResult | Overall scoring snapshot |
| DomainResult | Domain/objective score snapshot |
| QuestionFeedback | Candidate/admin quality feedback |



# 16. API Surface (Initial)


| Endpoint | Purpose |
| --- | --- |
| POST /api/setup/check | Environment/system checks |
| POST /api/setup/database/test | Test DB connectivity |
| POST /api/providers/test | Test LLM provider/model |
| GET /api/certifications | List installed/active certifications |
| GET /api/certifications/:id/blueprint | Get versioned blueprint |
| POST /api/exams/plan | Create exam specification |
| POST /api/exams | Create/assemble exam attempt |
| GET /api/exams/:id | Load/resume attempt |
| PUT /api/exams/:id/answers/:questionId | Autosave response |
| POST /api/exams/:id/pause | Pause practice attempt |
| POST /api/exams/:id/resume | Resume attempt |
| POST /api/exams/:id/submit | Finalize and score |
| GET /api/exams/:id/results | Retrieve scored result |
| GET /api/exams/:id/export.pdf | Download PDF report |
| GET /api/exams/:id/export.json | Download AI audit pack |
| POST /api/questions/:id/feedback | Submit question feedback |
| POST /api/questions/generate | Admin/manual generation job |



# 17. Security and Privacy

Never commit API keys, DB passwords or encryption keys to source control.
Generate a local application master secret during setup; store with OS-appropriate file permissions; migrate to OS keychain/credential manager when desktop packaging is added.
Encrypt provider API keys with authenticated encryption (e.g., AES-256-GCM) and use per-secret nonces.
Mask credentials in UI and logs; no endpoint returns the original key after save.
Use Prisma/parameterized queries and strict server-side input validation.
Apply CSRF/session protections appropriate to local web deployment and bind to localhost by default.
Do not expose the app to LAN/Internet unless the administrator explicitly enables and secures remote access.
LLM prompts may include certification content and generated scenarios, but should not include unnecessary candidate PII.

# 18. UX Requirements

Professional, neutral exam aesthetic; no copied Pearson/Anthropic trade dress.
Setup wizard uses clear Next/Back/Test Connection actions and never exposes raw stack traces.
Generation screen provides stage progress (planning, generating, validating, assembling) rather than an indefinite spinner.
Exam runner keeps question content as the dominant visual element and minimizes navigation distraction.
Timer warnings should be configurable and non-intrusive.
Paused state hides question/answer content and disables navigation until resumed.
Results prioritize actionable weaknesses over decorative charts.

# 19. Error Handling


| Failure | Required Behavior |
| --- | --- |
| LLM rate limit | Retry with bounded exponential backoff; preserve job state; show actionable message |
| LLM invalid JSON | Schema-repair attempt; regenerate if repair fails |
| Provider outage | Allow retry/provider switch; do not lose already approved questions |
| DB unavailable | Fail closed for writes; show recovery instructions |
| Generation incomplete | Never start full exam until required approved count exists |
| Browser closes | Resume from last autosaved state |
| PDF failure | Exam result remains intact; export can be retried independently |
| Question dispute | Flag/quarantine without altering historical attempt snapshot |



# 20. Testing and Acceptance Strategy


## 20.1 Automated Tests

Domain allocator always totals requested question count and respects exact/allowed weights.
Timer does not decrement while paused and survives restart without gaining/losing active time.
Single-choice and multiple-response scoring is deterministic.
Autosave is idempotent and last valid response survives crash.
Provider adapters normalize outputs into identical canonical schema.
Out-of-scope seeded questions are rejected by scope validator.
Disagreeing answer reviewer forces quarantine.
Certification version change never mutates old attempts.
PDF/JSON exports reproduce immutable attempt snapshot.

## 20.2 V1 Acceptance Criteria

Fresh install can be completed by a user with Node.js and PostgreSQL installed.
At least one of Anthropic/OpenAI/Gemini can be configured and successfully generate validated CCA-F questions.
A complete 60-question CCA-F mock can be assembled and taken with 120-minute timer.
Pause/resume, flagging, navigation, autosave and recovery work across browser refresh/restart.
Submission produces correct raw/domain scoring and a clearly labeled estimated scaled score if enabled.
Candidate can review every question and export PDF + JSON.
No question marked quarantined can be served in a new attempt.
API keys are not stored or logged in plaintext.

# 21. Delivery Plan for Claude Code


| Phase | Deliverable |
| --- | --- |
| Phase 0 – Repository Contract | Create repo, docs, CLAUDE.md, coding standards, env examples, architecture decisions, CI/test skeleton. |
| Phase 1 – Foundation | Next.js/TS app, Prisma/Postgres, migrations, local user, setup state, system checks. |
| Phase 2 – Certification Engine | Pack loader, CCA-F v1 pack, domain/objective schema, allocator, versioning. |
| Phase 3 – LLM Gateway | Anthropic/OpenAI/Gemini adapters, provider test, encrypted credentials, structured output. |
| Phase 4 – Question Engine | Planner, generator, reviewer, repair, dedupe, provenance, question bank/admin views. |
| Phase 5 – Exam Engine/UI | Attempt creation, 60-question runner, timer, pause, autosave, navigator, flags, recovery. |
| Phase 6 – Results | Scoring, domain/objective analytics, history, detailed review. |
| Phase 7 – Exports/Tutor | PDF, JSON audit pack, contextual AI tutor. |
| Phase 8 – Hardening | E2E tests, security review, failure recovery, performance, accessibility. |
| Phase 9 – Packaging | npm production installer/setup command, service/start scripts; desktop installer considered after stable web V1. |



## 21.1 Claude Code Build Rules

Claude Code must implement one phase at a time and leave the repository runnable and tested after every phase.
Do not invent certification facts in source code. Certification facts live in versioned packs with references.
Do not place provider-specific logic outside the LLM gateway/adapters.
Do not make external AI calls in unit tests; use deterministic fixtures/mocks.
Every database schema change requires a migration.
Every public service/module requires typed interfaces and failure behavior.
Never commit .env, API keys or local secrets.
Prefer simple local dependencies; Redis/Docker are optional future optimizations, not V1 requirements.

# 22. Recommended V1 Milestones


| Milestone | Exit Condition |
| --- | --- |
| M1 – Boots | App installs, DB migrates, setup completes |
| M2 – Knows the Exam | CCA-F pack loads and allocator produces valid plans |
| M3 – Generates | Provider produces validated, stored CCA-F questions |
| M4 – Simulates | Candidate completes a resilient timed mock |
| M5 – Teaches | Results and explanations identify weaknesses |
| M6 – Exports | PDF and JSON review packs are correct |
| M7 – Release Candidate | Security, E2E, accessibility and recovery acceptance pass |



# 23. Future Roadmap

Adaptive practice and readiness prediction.
Cross-model generator/reviewer disagreement mode.
Embedding-based semantic deduplication using PostgreSQL pgvector when available.
Certification pack authoring UI and import/export format.
Additional Claude certifications and third-party cloud/data certifications.
Desktop packaging for Windows/macOS and OS credential-store integration.
Optional multi-user/LAN mode, hosted SaaS and team analytics.
Offline cached practice when no LLM connection is available.

# 24. Risks and Mitigations


| Risk | Mitigation |
| --- | --- |
| LLM hallucinates certification content | Blueprint retrieval + exclusions + independent reviewer + quarantine |
| Ambiguous answer keys | Independent answer validation; model disagreement quarantines item |
| High latency/cost | Question bank, batching, bounded retries, configurable fresh-generation ratio |
| Blueprint changes | Immutable certification versions and pack update mechanism |
| Secret exposure | Encryption, masking, log redaction, localhost binding |
| Misleading exam fidelity | Explicit practice disclaimers; raw score first; estimated scaled score labeled |
| Question repetition | Hashes, near-duplicate checks, served-count history |
| Vendor lock-in | Provider-neutral gateway and canonical question schema |



# 25. Definition of Done – V1

V1 is done when a new user can install CertForge AI on a machine with Node.js and PostgreSQL, complete a guided setup, configure a supported LLM, select Claude Certified Architect – Foundations, generate/assemble a validated blueprint-aligned 60-question practice exam, complete it in a resilient 120-minute computer-based-test interface with optional practice pause, receive transparent raw/domain results and explanations, and export the immutable attempt as PDF and JSON—without exposing API credentials or presenting generated content as official exam material.

# Appendix A – Product Disclaimers

Suggested product language: “CertForge AI provides independently generated practice material aligned to publicly available certification objectives. It is not affiliated with, endorsed by, or an official product of Anthropic or Pearson VUE. Claude and related marks belong to their respective owners. Practice scores and questions are not official exam scores or exam items.”

# Appendix B – Source Baseline

Anthropic Partner Academy, “Claude Certified Architect – Foundations,” accessed 14 September 2026. The page lists 60 questions, 120 minutes, multiple-choice/multiple-response format, passing score 720 (scaled 100–1,000), Pearson/online delivery, and domain weights 27/18/20/20/15.
Anthropic, “Claude Code: Foundations,” July 2026, used only as contextual confirmation that Claude Code training covers the agent loop, CLAUDE.md, context management, MCP, plugins and subagents. The certification pack should ultimately be populated from the official exam guide and authorized preparation material available to the user.