import { redirect } from 'next/navigation';
import { getSetupStatus } from '../server/services/setup-service.js';

export default async function RootPage() {
  const status = await getSetupStatus();
  redirect(status.completed ? '/dashboard' : '/setup/welcome');
}
