import { usePathRoute } from '../hooks/useKeyboard';
import { CRM_ROUTE } from '../constants/design';
import { LandingPage } from './landing/LandingPage';
import { DigitalWaveCrmApp } from './digital-wave/DigitalWaveCrmApp';

interface AppShellProps {
  clerkMissing: boolean;
}

export function AppShell({ clerkMissing }: AppShellProps) {
  const route = usePathRoute();
  const exactCrmRoutes = new Set([
    '/dashboard', '/companies', '/people', '/leads', '/deals', '/tasks',
    '/meetings', '/projects', '/notes', '/files', '/opportunities',
    '/settings', '/ai-ask', '/ai-execute',
  ]);
  const isCrmPage = route === CRM_ROUTE || route.startsWith(`${CRM_ROUTE}/`) || route === '/workflows' || exactCrmRoutes.has(route);

  return isCrmPage ? (
    <DigitalWaveCrmApp clerkMissing={clerkMissing} />
  ) : (
    <LandingPage clerkMissing={clerkMissing} />
  );
}
