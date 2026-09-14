# CODEX.md

This repository's persistent project instructions live in
[`AGENTS.md`](./AGENTS.md) - read it in full before making changes. Every
rule there (architecture, coding standards, prohibited shortcuts, testing,
secrets, certification-pack rules, provider abstraction, migrations,
definition of done, documentation sync) applies regardless of which coding
agent is operating in this repository.

Codex-specific notes:

- This project has no Node.js/npm/PostgreSQL available in some build
  environments. Before assuming a command works, check
  `docs/implementation/phase-status.md`'s "Known environment limitation"
  section for what has and hasn't actually been executed.
- Prefer the exact commands in the root `README.md` "Getting started"
  section over re-deriving install/build/test steps from scratch.
- The PRD at `docs/PRD/CertForge_AI_Master_PRD_FRS_v1.0.md` is the
  authoritative spec; `docs/architecture/*.md` and
  `docs/implementation/implementation-plan.md` explain how this codebase
  currently implements (or plans to implement) it.
