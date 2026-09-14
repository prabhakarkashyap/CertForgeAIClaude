import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withApiErrorHandling } from '../../../../lib/api-response.js';
import {
  setProviderConfigActive,
  updateProviderConfig,
  updateProviderConfigInputSchema,
} from '../../../../server/services/provider-service.js';
import { ValidationError } from '@certforge/shared';

const patchSchema = z
  .object({ isActive: z.boolean().optional() })
  .merge(updateProviderConfigInputSchema);

export const PATCH = withApiErrorHandling(async (request: NextRequest, context: { params: { id: string } }) => {
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError({ message: 'Invalid request body.', details: { issues: parsed.error.issues } });
  }

  const { isActive, ...rest } = parsed.data;
  if (isActive !== undefined) {
    await setProviderConfigActive(context.params.id, isActive);
  }
  if (Object.keys(rest).length > 0) {
    return updateProviderConfig(context.params.id, rest);
  }
  return setProviderConfigActive(context.params.id, isActive ?? true);
});
