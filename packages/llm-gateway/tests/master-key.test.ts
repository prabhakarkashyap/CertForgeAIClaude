import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { resolveMasterKey } from '../src/security/master-key.js';

describe('resolveMasterKey', () => {
  let dataDir: string;

  beforeEach(async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), 'certforge-master-key-'));
  });

  afterEach(async () => {
    await rm(dataDir, { recursive: true, force: true });
  });

  it('prefers an environment-provided key over any file', async () => {
    const result = await resolveMasterKey(dataDir, 'env-provided-key-value');
    expect(result.origin).toBe('environment');
    expect(result.key).toBe('env-provided-key-value');
  });

  it('generates and persists a key on first run when no env key is set', async () => {
    const result = await resolveMasterKey(dataDir, undefined);
    expect(result.origin).toBe('generated-file');
    expect(result.key.length).toBeGreaterThan(0);

    const persisted = (await readFile(path.join(dataDir, 'app-secret.key'), 'utf-8')).trim();
    expect(persisted).toBe(result.key);
  });

  it('reuses an existing key file on subsequent runs instead of regenerating', async () => {
    const first = await resolveMasterKey(dataDir, undefined);
    const second = await resolveMasterKey(dataDir, undefined);

    expect(second.origin).toBe('existing-file');
    expect(second.key).toBe(first.key);
  });
});
