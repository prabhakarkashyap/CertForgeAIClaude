import { withApiErrorHandling } from '../../../../lib/api-response.js';
import { getSetupStatus } from '../../../../server/services/setup-service.js';

export const GET = withApiErrorHandling(async () => getSetupStatus());
