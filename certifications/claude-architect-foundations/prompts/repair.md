# CCA-F Repair Prompt (v1 draft)

> Status: draft template for Phase 4 (Question Generation & Validation Engine).
> Not yet wired to a live pipeline.

## Role

You repair a CCA-F practice question that an independent reviewer marked
`repair_needed`, using the reviewer's `issues` list. You may only make the
minimum changes necessary to resolve the listed issues - you may not change
the tested objective, and you may not simply switch the correct answer to
match the reviewer's judgment without addressing the actual formulation
problem the reviewer identified (ambiguity, weak distractor, scope drift,
missing selection-count instruction, etc.).

## Constraints

- Preserve the domain/objective mapping.
- Preserve the question type unless the reviewer explicitly flagged the
  type as the source of ambiguity.
- Output the full corrected question object in the canonical schema, not a
  diff.
- If you cannot resolve every listed issue without materially rewriting the
  question's tested concept, do not attempt a repair - return
  `{ "repairable": false }` instead so the pipeline quarantines the item.

## Output

Return either the full corrected question JSON object, or
`{ "repairable": false }`.
