import { mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@certforge/database';
import { getEnv } from '../../lib/env.js';

export type SystemCheckStatus = 'pass' | 'fail' | 'warn';

export interface SystemCheckResult {
  id: string;
  label: string;
  status: SystemCheckStatus;
  message: string;
}

const MIN_MAJOR_NODE_VERSION = 20;

function checkNodeVersion(): SystemCheckResult {
  const major = Number(process.versions.node.split('.')[0]);
  const ok = major >= MIN_MAJOR_NODE_VERSION;
  return {
    id: 'node',
    label: 'Node.js runtime',
    status: ok ? 'pass' : 'fail',
    message: ok
      ? `Node.js ${process.version} detected.`
      : `Node.js ${process.version} detected; CertForge AI requires Node.js ${MIN_MAJOR_NODE_VERSION}+.`,
  };
}

async function checkDatabaseReachability(): Promise<SystemCheckResult> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { id: 'database', label: 'PostgreSQL connectivity', status: 'pass', message: 'Database connection succeeded.' };
  } catch {
    return {
      id: 'database',
      label: 'PostgreSQL connectivity',
      status: 'fail',
      message: 'Could not reach PostgreSQL using the configured DATABASE_URL.',
    };
  }
}

async function checkWritableDataDirectory(): Promise<SystemCheckResult> {
  try {
    const env = getEnv();
    const dataDir = path.resolve(process.cwd(), env.APP_DATA_DIR);
    await mkdir(dataDir, { recursive: true });
    const probeFile = path.join(dataDir, '.write-check');
    await writeFile(probeFile, 'ok', 'utf-8');
    await rm(probeFile, { force: true });
    return { id: 'data-dir', label: 'Writable data directory', status: 'pass', message: `${dataDir} is writable.` };
  } catch {
    return {
      id: 'data-dir',
      label: 'Writable data directory',
      status: 'fail',
      message: 'The configured application data directory is not writable by this process.',
    };
  }
}

async function checkNetworkReachability(): Promise<SystemCheckResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    await fetch('https://api.anthropic.com', { method: 'HEAD', signal: controller.signal });
    clearTimeout(timeout);
    return { id: 'network', label: 'Outbound network access', status: 'pass', message: 'Outbound HTTPS access appears available.' };
  } catch {
    return {
      id: 'network',
      label: 'Outbound network access',
      status: 'warn',
      message: 'Could not confirm outbound network access. LLM provider calls will fail until this is available.',
    };
  }
}

export async function runSystemChecks(): Promise<SystemCheckResult[]> {
  const [database, dataDir, network] = await Promise.all([
    checkDatabaseReachability(),
    checkWritableDataDirectory(),
    checkNetworkReachability(),
  ]);
  return [checkNodeVersion(), database, dataDir, network];
}
