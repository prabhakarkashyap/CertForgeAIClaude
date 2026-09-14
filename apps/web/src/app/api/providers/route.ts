import type { NextRequest } from 'next/server';
import { withApiErrorHandling } from '../../../lib/api-response.js';
import { listProviderConfigs, providerConfigInputSchema, saveProviderConfig } from '../../../server/services/provider-service.js';
import { ValidationError } from '@certforge/shared';

export const GET = withApiErrorHandling(async () => listProviderConfigs());

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const parsed = providerConfigInputSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError({ message: 'Invalid provider configuration.', details: { issues: parsed.error.issues } });
  }
  return saveProviderConfig(parsed.data);
});
