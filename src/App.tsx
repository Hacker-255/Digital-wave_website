import { Toaster } from 'sonner';
import { AppShell } from './components/AppShell';
import { useTheme } from './contexts/ThemeContext';

type AppProps = {
  clerkMissing?: boolean;
};

export default function App({ clerkMissing = false }: AppProps) {
  const { theme } = useTheme();

  return (
    <>
      <AppShell clerkMissing={clerkMissing} />
      <Toaster richColors theme={theme} position="top-right" />
    </>
  );
}
