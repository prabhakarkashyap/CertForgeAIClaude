import { Client } from 'pg';
import { z } from 'zod';

export const databaseConnectionInputSchema = z.object({
  host: z.string().min(1),
  port: z.coerce.number().int().positive().default(5432),
  database: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  ssl: z.boolean().default(false),
});
export type DatabaseConnectionInput = z.infer<typeof databaseConnectionInputSchema>;

export interface DatabaseTestResult {
  ok: boolean;
  message: string;
}

/**
 * Tests connectivity to a candidate PostgreSQL connection using the raw
 * driver rather than Prisma, since the setup wizard is testing values the
 * user is about to write into DATABASE_URL - not yet the value Prisma is
 * currently configured with.
 */
export async function testDatabaseConnection(input: DatabaseConnectionInput): Promise<DatabaseTestResult> {
  const client = new Client({
    host: input.host,
    port: input.port,
    database: input.database,
    user: input.username,
    password: input.password,
    ssl: input.ssl,
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    await client.query('SELECT 1');
    return { ok: true, message: 'Connection succeeded.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Connection failed.';
    return { ok: false, message: sanitizeMessage(message) };
  } finally {
    await client.end().catch(() => undefined);
  }
}

/** Strips anything that could echo back the password from a driver error string. */
function sanitizeMessage(message: string): string {
  return message.replace(/password=\S+/gi, 'password=[redacted]');
}

export function buildConnectionString(input: DatabaseConnectionInput): string {
  const encodedUser = encodeURIComponent(input.username);
  const encodedPassword = encodeURIComponent(input.password);
  const sslSuffix = input.ssl ? '?sslmode=require' : '';
  return `postgresql://${encodedUser}:${encodedPassword}@${input.host}:${input.port}/${input.database}${sslSuffix}`;
}
