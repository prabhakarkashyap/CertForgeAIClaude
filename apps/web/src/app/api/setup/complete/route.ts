import { withApiErrorHandling } from '../../../../lib/api-response.js';
import { completeSetup, getSetupStatus } from '../../../../server/services/setup-service.js';
import { ValidationError } from '@certforge/shared';

export const POST = withApiErrorHandling(async () => {
  const status = await getSetupStatus();
  if (!status.hasProfile || !status.hasActiveProvider || !status.hasActiveCertification) {
    throw new ValidationError({
      message: 'Complete profile, provider and certification activation steps before finishing setup.',
      details: status,
    });
  }
  await completeSetup();
  return { completed: true };
});
