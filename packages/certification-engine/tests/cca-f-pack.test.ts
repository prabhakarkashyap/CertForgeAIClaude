import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadCertificationPack } from '../src/loader.js';
import { packToImportInput } from '../src/import.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CCA_F_PACK_DIR = path.resolve(__dirname, '../../../certifications/claude-architect-foundations');

describe('bundled Claude Certified Architect - Foundations pack', () => {
  it('loads and validates against the verified PRD baseline', async () => {
    const pack = await loadCertificationPack(CCA_F_PACK_DIR);

    expect(pack.manifest.slug).toBe('claude-architect-foundations');
    expect(pack.manifest.totalQuestions).toBe(60);
    expect(pack.manifest.durationMinutes).toBe(120);
    expect(pack.manifest.passingScore).toBe(720);
    expect(pack.domains).toHaveLength(5);
  });

  it('matches the exact PRD domain weight table (27/18/20/20/15)', async () => {
    const pack = await loadCertificationPack(CCA_F_PACK_DIR);
    const weightsByKey = Object.fromEntries(pack.domains.map((d) => [d.key, d.weightPercent]));

    expect(weightsByKey['agentic-architecture-orchestration']).toBe(27);
    expect(weightsByKey['tool-design-mcp-integration']).toBe(18);
    expect(weightsByKey['claude-code-configuration-workflows']).toBe(20);
    expect(weightsByKey['prompt-engineering-structured-output']).toBe(20);
    expect(weightsByKey['context-management-reliability']).toBe(15);

    const totalWeight = pack.domains.reduce((sum, d) => sum + d.weightPercent, 0);
    expect(totalWeight).toBe(100);
  });

  it('allocates exactly 60 target questions across domains matching the PRD table', async () => {
    const pack = await loadCertificationPack(CCA_F_PACK_DIR);
    const targetsByKey = Object.fromEntries(pack.domains.map((d) => [d.key, d.targetQuestionCount]));

    expect(targetsByKey['agentic-architecture-orchestration']).toBe(16);
    expect(targetsByKey['tool-design-mcp-integration']).toBe(11);
    expect(targetsByKey['claude-code-configuration-workflows']).toBe(12);
    expect(targetsByKey['prompt-engineering-structured-output']).toBe(12);
    expect(targetsByKey['context-management-reliability']).toBe(9);

    const total = pack.domains.reduce((sum, d) => sum + d.targetQuestionCount, 0);
    expect(total).toBe(60);
  });

  it('clearly labels every bundled objective as a placeholder pending exam-guide detail', async () => {
    const pack = await loadCertificationPack(CCA_F_PACK_DIR);
    expect(pack.objectives.length).toBeGreaterThan(0);
    expect(pack.objectives.every((o) => o.isPlaceholder)).toBe(true);
  });

  it('enforces the CCA-F scope guardrail rejecting generic cloud infrastructure topics', async () => {
    const pack = await loadCertificationPack(CCA_F_PACK_DIR);
    expect(pack.exclusions.scopeGuardrail).toMatch(/AWS\/Azure\/GCP\/Kubernetes/);
    expect(pack.exclusions.excludedTopics.length).toBeGreaterThan(0);
  });

  it('transforms cleanly into database import input with matching totals', async () => {
    const pack = await loadCertificationPack(CCA_F_PACK_DIR);
    const importInput = packToImportInput(pack);

    expect(importInput.certification.slug).toBe('claude-architect-foundations');
    expect(importInput.domains).toHaveLength(5);
    expect(importInput.domains.every((d) => d.objectives.length >= 1)).toBe(true);
  });
});
