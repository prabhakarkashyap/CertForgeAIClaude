import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withApiErrorHandling } from '../../../../lib/api-response.js';
import { activateCertificationPack } from '../../../../server/services/certification-service.js';
import { ValidationError } from '@certforge/shared';

const activateSchema = z.object({ packDir: z.string().min(1) });

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const parsed = activateSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError({ message: 'Invalid activation request.', details: { issues: parsed.error.issues } });
  }
  return activateCertificationPack(parsed.data.packDir);
});
