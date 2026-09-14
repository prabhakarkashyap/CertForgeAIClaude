import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Integration tests require a reachable PostgreSQL instance (DATABASE_URL).
    // They are skipped automatically when it is not set - see tests/setup.ts.
  },
});
