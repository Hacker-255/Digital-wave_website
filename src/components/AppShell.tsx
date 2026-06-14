import { usePathRoute } from '../hooks/useKeyboard';
import { CRM_ROUTE } from '../constants/design';
import { publicPages } from '../constants/seo';
import { SeoMetadata } from './seo/SeoMetadata';
import { LandingPage } from './landing/LandingPage';
import { PublicPage } from './landing/PublicPages';
import { DigitalWaveCrmApp } from './digital-wave/DigitalWaveCrmApp';

interface AppShellProps {
  clerkMissing: boolean;
}

export function AppShell({ clerkMissing }: AppShellProps) {
  const route = usePathRoute();
  const normalizedRoute = route === '/' ? '/' : route.replace(/\/$/, '');
  const exactCrmRoutes = new Set([
    '/dashboard', '/companies', '/people', '/leads', '/deals', '/tasks',
    '/meetings', '/projects', '/notes', '/files', '/opportunities',
    '/settings', '/ai-ask', '/ai-execute',
  ]);
  const isCrmPage = normalizedRoute === CRM_ROUTE || normalizedRoute.startsWith(`${CRM_ROUTE}/`) || normalizedRoute === '/workflows' || exactCrmRoutes.has(normalizedRoute);
  const publicPagePaths = new Set(publicPages.map((page) => page.path));

  return (
    <>
      <SeoMetadata pathname={normalizedRoute} />
      {isCrmPage ? (
        <DigitalWaveCrmApp clerkMissing={clerkMissing} />
      ) : publicPagePaths.has(normalizedRoute) && normalizedRoute !== '/' ? (
        <PublicPage pathname={normalizedRoute} clerkMissing={clerkMissing} />
      ) : (
        <LandingPage clerkMissing={clerkMissing} />
      )}
    </>
  );
}
