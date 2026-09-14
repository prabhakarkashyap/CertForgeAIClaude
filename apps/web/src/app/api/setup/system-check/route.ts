import { withApiErrorHandling } from '../../../../lib/api-response.js';
import { runSystemChecks } from '../../../../server/services/system-check-service.js';

export const POST = withApiErrorHandling(async () => ({ checks: await runSystemChecks() }));
