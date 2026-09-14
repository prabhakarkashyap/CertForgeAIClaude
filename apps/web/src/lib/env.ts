import { z } from 'zod';
import { ConfigurationError } from '@certforge/shared';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_ENCRYPTION_KEY: z.string().optional(),
  APP_DATA_DIR: z.string().default('./.data'),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

/**
 * Validates process.env once and caches the result. Throws a
 * ConfigurationError (never a raw stack trace) if required variables are
 * missing or malformed, per FR/NFR requirements that setup never surfaces
 * raw stack traces to the user.
 */
export function getEnv(): Env {
  if (cached) return cached;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    throw new ConfigurationError({
      message: 'Application environment is misconfigured. Check your .env file against .env.example.',
      details: { issues: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) },
    });
  }
  cached = result.data;
  return cached;
}

/** Test-only helper to reset the cached environment between test cases. */
export function resetEnvCacheForTests(): void {
  cached = null;
}
