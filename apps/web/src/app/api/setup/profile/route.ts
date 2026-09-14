import type { NextRequest } from 'next/server';
import { withApiErrorHandling } from '../../../../lib/api-response.js';
import { getProfile, profileInputSchema, saveProfile } from '../../../../server/services/profile-service.js';
import { ValidationError } from '@certforge/shared';

export const GET = withApiErrorHandling(async () => getProfile());

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const parsed = profileInputSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError({ message: 'Invalid profile details.', details: { issues: parsed.error.issues } });
  }
  return saveProfile(parsed.data);
});
