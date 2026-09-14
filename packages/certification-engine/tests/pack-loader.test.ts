import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CertificationPackError } from '@certforge/shared';
import { loadCertificationPack, discoverPackDirs, loadAllCertificationPacks } from '../src/loader.js';
import { summarizePack } from '../src/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_ROOT = path.join(__dirname, 'fixtures');
const VALID_PACK_DIR = path.join(FIXTURES_ROOT, 'valid-pack');
const BAD_WEIGHTS_PACK_DIR = path.join(FIXTURES_ROOT, 'bad-weights-pack');
const MISSING_FILE_PACK_DIR = path.join(FIXTURES_ROOT, 'missing-file-pack');

describe('loadCertificationPack', () => {
  it('loads a well-formed pack and preserves version information', async () => {
    const pack = await loadCertificationPack(VALID_PACK_DIR);

    expect(pack.manifest.slug).toBe('test-fixture-cert');
    expect(pack.manifest.version).toBe('1.0.0');
    expect(pack.manifest.status).toBe('active');
    expect(pack.domains).toHaveLength(2);
    expect(pack.objectives).toHaveLength(2);
    expect(pack.promptReferences.generator).toContain('generator.md');
  });

  it('exposes certification metadata, domains, objectives and exclusions via summarizePack', async () => {
    const pack = await loadCertificationPack(VALID_PACK_DIR);
    const summary = summarizePack(pack);

    expect(summary).toEqual({
      slug: 'test-fixture-cert',
      name: 'Test Fixture Certification',
      version: '1.0.0',
      status: 'active',
      examName: 'Test Fixture Exam',
      totalQuestions: 4,
      durationMinutes: 30,
      domainCount: 2,
    });
    expect(pack.exclusions.excludedTopics).toContain('unrelated-topic');
  });

  it('validates that domain weight totals sum to 100', async () => {
    const pack = await loadCertificationPack(VALID_PACK_DIR);
    const totalWeight = pack.domains.reduce((sum, d) => sum + d.weightPercent, 0);
    expect(totalWeight).toBe(100);
  });

  it('rejects a pack whose domain weights do not sum to 100', async () => {
    await expect(loadCertificationPack(BAD_WEIGHTS_PACK_DIR)).rejects.toThrow(CertificationPackError);
    await expect(loadCertificationPack(BAD_WEIGHTS_PACK_DIR)).rejects.toThrow(/weightPercent/i);
  });

  it('rejects a pack that is missing a required file', async () => {
    await expect(loadCertificationPack(MISSING_FILE_PACK_DIR)).rejects.toThrow(CertificationPackError);
    await expect(loadCertificationPack(MISSING_FILE_PACK_DIR)).rejects.toThrow(/references\.json/);
  });

  it('rejects a pack directory that does not exist', async () => {
    await expect(
      loadCertificationPack(path.join(FIXTURES_ROOT, 'does-not-exist')),
    ).rejects.toThrow(CertificationPackError);
  });
});

describe('discoverPackDirs / loadAllCertificationPacks', () => {
  it('discovers only well-formed packs when scoped to a directory of valid packs', async () => {
    const dirs = await discoverPackDirs(FIXTURES_ROOT);
    expect(dirs.length).toBeGreaterThanOrEqual(3);
  });

  it('fails fast when loading all packs from a root containing a malformed pack', async () => {
    await expect(loadAllCertificationPacks(FIXTURES_ROOT)).rejects.toThrow(CertificationPackError);
  });
});
