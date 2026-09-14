import { mkdir, readFile, writeFile, stat, chmod } from 'node:fs/promises';
import path from 'node:path';
import { ConfigurationError } from '@certforge/shared';
import { generateEncryptionKey } from './encryption.js';

const MASTER_KEY_FILENAME = 'app-secret.key';

export interface MasterKeySource {
  key: string;
  origin: 'environment' | 'generated-file' | 'existing-file';
}

/**
 * Resolve the application's master encryption key.
 *
 * Resolution order:
 *  1. APP_ENCRYPTION_KEY environment variable, if set.
 *  2. <dataDir>/app-secret.key, read if it already exists.
 *  3. Otherwise generate a new key, persist it to <dataDir>/app-secret.key
 *     with owner-only permissions, and return it.
 *
 * This file must never be committed to source control (see .gitignore) and
 * must never be logged.
 */
export async function resolveMasterKey(dataDir: string, envKey?: string): Promise<MasterKeySource> {
  if (envKey && envKey.trim().length > 0) {
    return { key: envKey.trim(), origin: 'environment' };
  }

  await mkdir(dataDir, { recursive: true });
  const keyPath = path.join(dataDir, MASTER_KEY_FILENAME);

  const existing = await stat(keyPath).catch(() => null);
  if (existing) {
    const key = (await readFile(keyPath, 'utf-8')).trim();
    if (!key) {
      throw new ConfigurationError({ message: `Application key file at ${keyPath} is empty.` });
    }
    return { key, origin: 'existing-file' };
  }

  const key = generateEncryptionKey();
  await writeFile(keyPath, key, { encoding: 'utf-8', mode: 0o600 });
  await chmod(keyPath, 0o600).catch(() => {
    // best-effort on platforms without POSIX permission bits (e.g. Windows FAT)
  });
  return { key, origin: 'generated-file' };
}
