import { usePathRoute } from '../hooks/useKeyboard';
import { CRM_ROUTE } from '../constants/design';
import { LandingPage } from './landing/LandingPage';
import { DigitalWaveCrmApp } from './digital-wave/DigitalWaveCrmApp';

interface AppShellProps {
  clerkMissing: boolean;
}

export function AppShell({ clerkMissing }: AppShellProps) {
  const route = usePathRoute();
  const isCrmPage = route === CRM_ROUTE || route.startsWith(`${CRM_ROUTE}/`) || route === '/workflows';

  return isCrmPage ? (
    <DigitalWaveCrmApp clerkMissing={clerkMissing} />
  ) : (
    <LandingPage clerkMissing={clerkMissing} />
  );
}
