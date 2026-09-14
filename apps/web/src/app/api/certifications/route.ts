import { withApiErrorHandling } from '../../../lib/api-response.js';
import { listInstalledCertifications } from '../../../server/services/certification-service.js';

export const GET = withApiErrorHandling(async () => ({ certifications: await listInstalledCertifications() }));
