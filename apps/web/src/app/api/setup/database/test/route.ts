import type { NextRequest } from 'next/server';
import { withApiErrorHandling } from '../../../../../lib/api-response.js';
import { databaseConnectionInputSchema, testDatabaseConnection } from '../../../../../server/services/database-test-service.js';
import { ValidationError } from '@certforge/shared';

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const parsed = databaseConnectionInputSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError({ message: 'Invalid database connection details.', details: { issues: parsed.error.issues } });
  }
  return testDatabaseConnection(parsed.data);
});
