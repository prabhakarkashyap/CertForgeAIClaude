import { afterEach, describe, expect, it } from 'vitest';
import { ConfigurationError } from '@certforge/shared';
import { getEnv, resetEnvCacheForTests } from '../src/lib/env.js';

const ORIGINAL_ENV = { ...process.env };

describe('getEnv', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    resetEnvCacheForTests();
  });

  it('parses a valid environment and applies defaults', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    delete process.env.APP_URL;
    delete process.env.APP_DATA_DIR;
    resetEnvCacheForTests();

    const env = getEnv();
    expect(env.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/db');
    expect(env.APP_URL).toBe('http://localhost:3000');
    expect(env.APP_DATA_DIR).toBe('./.data');
  });

  it('throws a ConfigurationError (never a raw error) when DATABASE_URL is missing', () => {
    delete process.env.DATABASE_URL;
    resetEnvCacheForTests();

    expect(() => getEnv()).toThrow(ConfigurationError);
  });

  it('caches the parsed environment across calls until reset', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    resetEnvCacheForTests();

    const first = getEnv();
    process.env.DATABASE_URL = 'postgresql://changed:changed@localhost:5432/db';
    const second = getEnv();

    expect(second.DATABASE_URL).toBe(first.DATABASE_URL);
  });
});
