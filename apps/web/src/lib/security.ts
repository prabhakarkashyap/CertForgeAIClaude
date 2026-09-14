import path from 'node:path';
import { resolveMasterKey, type MasterKeySource } from '@certforge/llm-gateway';
import { getEnv } from './env.js';

let cachedSourcePromise: Promise<MasterKeySource> | null = null;

function resolve(): Promise<MasterKeySource> {
  if (!cachedSourcePromise) {
    const env = getEnv();
    const dataDir = path.resolve(process.cwd(), env.APP_DATA_DIR);
    cachedSourcePromise = resolveMasterKey(dataDir, env.APP_ENCRYPTION_KEY);
  }
  return cachedSourcePromise;
}

/**
 * Resolves (and caches for the process lifetime) the application master
 * encryption key used for provider credential encryption. See
 * docs/architecture/llm-provider-design.md for the resolution order.
 */
export async function getMasterKey(): Promise<string> {
  return (await resolve()).key;
}

/** Safe to display in the Security admin screen - never exposes the key itself. */
export async function getMasterKeyOrigin(): Promise<MasterKeySource['origin']> {
  return (await resolve()).origin;
}
