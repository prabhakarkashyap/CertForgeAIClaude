import { readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { ConfigurationError } from '@certforge/shared';

function getRepoRootEnvPath(): string {
  return path.resolve(process.cwd(), '../../.env');
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Updates (or creates) a single KEY=value line in the repo-root .env file,
 * preserving every other line untouched. Used by the setup wizard's
 * database step so a value the user just tested can be persisted for the
 * next process start (Prisma reads DATABASE_URL only at process startup,
 * so this always requires a restart - the UI must say so).
 */
export async function upsertEnvValue(key: string, value: string): Promise<void> {
  const envPath = getRepoRootEnvPath();
  const examplePath = path.resolve(process.cwd(), '../../.env.example');

  let contents = '';
  if (await fileExists(envPath)) {
    contents = await readFile(envPath, 'utf-8');
  } else if (await fileExists(examplePath)) {
    contents = await readFile(examplePath, 'utf-8');
  } else {
    throw new ConfigurationError({ message: 'Could not locate .env or .env.example to update.' });
  }

  const line = `${key}="${value.replace(/"/g, '\\"')}"`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');

  const updated = pattern.test(contents) ? contents.replace(pattern, line) : `${contents.trimEnd()}\n${line}\n`;
  await writeFile(envPath, updated, 'utf-8');
}
