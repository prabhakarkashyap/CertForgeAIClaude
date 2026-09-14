import type { NextRequest } from 'next/server';
import { withApiErrorHandling } from '../../../../../lib/api-response.js';
import {
  buildConnectionString,
  databaseConnectionInputSchema,
  testDatabaseConnection,
} from '../../../../../server/services/database-test-service.js';
import { upsertEnvValue } from '../../../../../server/services/env-file-service.js';
import { ValidationError } from '@certforge/shared';

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const parsed = databaseConnectionInputSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError({ message: 'Invalid database connection details.', details: { issues: parsed.error.issues } });
  }

  const testResult = await testDatabaseConnection(parsed.data);
  if (!testResult.ok) {
    throw new ValidationError({ message: `Connection test failed: ${testResult.message}` });
  }

  const connectionString = buildConnectionString(parsed.data);
  await upsertEnvValue('DATABASE_URL', connectionString);

  return { saved: true, requiresRestart: true };
});
